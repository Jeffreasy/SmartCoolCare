import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ========================================================================
// HELPER: Get current user's database ID
// ========================================================================
async function getCurrentUserId(ctx: any) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
        return null;
    }

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q: any) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier)
        )
        .unique();

    return user?._id ?? null;
}

// ========================================================================
// 1. INGEST SENSOR DATA (ESP32 → Convex)
// ========================================================================
export const addMeasurement = mutation({
    args: {
        sensorId: v.string(),
        value: v.number(),
        status: v.string(),
        signal: v.number(),
        mac: v.optional(v.string()),
        // Optional BLE fields
        tempBle: v.optional(v.number()),
        humidity: v.optional(v.number()),
        battery: v.optional(v.number()),
        // Logs
        logs: v.optional(v.array(v.object({
            level: v.string(),
            code: v.optional(v.string()),
            message: v.string(),
            meta: v.optional(v.any())
        })))
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Lookup device to get userId
        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();

        const userId = device?.userId ?? undefined;

        // A. Insert Logs
        if (args.logs && args.logs.length > 0) {
            for (const log of args.logs) {
                await ctx.db.insert("device_logs", {
                    deviceId: args.sensorId,
                    level: log.level,
                    code: log.code,
                    message: log.message,
                    meta: log.meta,
                    timestamp: now,
                });
            }
        }

        // B. Write to wired sensor readings
        await ctx.db.insert("wiredReadings", {
            deviceId: args.sensorId,
            temperature: args.value,
            userId,
        });

        // C. Write to BLE sensor readings (if available)
        if (args.tempBle !== undefined && args.humidity !== undefined && args.battery !== undefined) {
            await ctx.db.insert("bleReadings", {
                deviceId: args.sensorId,
                temperature: args.tempBle,
                humidity: args.humidity,
                battery: args.battery,
                signalStrength: args.signal,
                userId,
            });
        }

        // D. Determine device status
        // Self-Healing: If we received critical logs, mark as degraded
        const hasCriticalLogs = args.logs?.some(l => l.level === "critical" || l.level === "error");

        let deviceStatus = "healthy";
        if (hasCriticalLogs) {
            deviceStatus = "degraded";
        } else if (args.tempBle === undefined && args.value <= -50) {
            deviceStatus = "offline"; // Likely unplugged if wired sensor fails
        } else if (args.value > -50 && args.value < -40) {
            deviceStatus = "degraded"; // Weird value
        }

        // E. Update device cache
        if (device) {
            await ctx.db.patch(device._id, {
                lastSeenAt: now,
                lastSignalStrength: args.signal,
                lastDeviceStatus: deviceStatus,
                hardwareMac: args.mac || device.hardwareMac,
                // Wired cache
                lastWiredTemp: args.value,
                lastWiredTimestamp: now,
                // BLE cache (if available)
                ...(args.tempBle !== undefined ? { lastBleTemp: args.tempBle } : {}),
                ...(args.humidity !== undefined ? { lastBleHumidity: args.humidity } : {}),
                ...(args.battery !== undefined ? { lastBleBattery: args.battery } : {}),
                ...(args.tempBle !== undefined ? { lastBleTimestamp: now } : {}),
            });
        } else {
            // New device - auto-create
            await ctx.db.insert("devices", {
                deviceId: args.sensorId,
                displayName: args.sensorId.replaceAll("_", " "),
                lastSeenAt: now,
                lastSignalStrength: args.signal,
                lastDeviceStatus: deviceStatus,
                hardwareMac: args.mac,
                // Wired cache
                lastWiredTemp: args.value,
                lastWiredTimestamp: now,
                // BLE cache
                lastBleTemp: args.tempBle,
                lastBleHumidity: args.humidity,
                lastBleBattery: args.battery,
                lastBleTimestamp: args.tempBle !== undefined ? now : undefined,
            });
        }

        // F. Data retention (7 days)
        // ... (Cleanup logic remains same, implicit in existing code not shown in diff if not strictly requested to change, but good to keep)
        // Since I'm replacing the whole handler block from line 27, I need to make sure I don't lose the cleanup logic if I overwrite it.
        // Wait, the ReplacementContent replaces everything from line 27 to 134 in the original file.
        // Code at line 109 in original was cleanup. I must include it.

        const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

        // Cleanup old wired readings
        const oldWired = await ctx.db
            .query("wiredReadings")
            .withIndex("by_device", (q) => q.eq("deviceId", args.sensorId))
            .filter((q) => q.lt(q.field("_creationTime"), sevenDaysAgo))
            .take(10);

        for (const old of oldWired) {
            await ctx.db.delete(old._id);
        }

        // Cleanup old BLE readings
        const oldBle = await ctx.db
            .query("bleReadings")
            .withIndex("by_device", (q) => q.eq("deviceId", args.sensorId))
            .filter((q) => q.lt(q.field("_creationTime"), sevenDaysAgo))
            .take(10);

        for (const old of oldBle) {
            await ctx.db.delete(old._id);
        }
    },
});

// ========================================================================
// 1b. GET DEVICE CONFIG (Calibration)
// ========================================================================
export const getDeviceConfig = query({
    args: { sensorId: v.string() },
    handler: async (ctx, args) => {
        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();

        return device?.config ?? null;
    }
});

// ========================================================================
// 1c. GET FULL DEVICE RECORD (For Dynamic Config)
// ========================================================================
export const getDeviceRecord = query({
    args: { sensorId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();
    }
});

// ========================================================================
// 2. GET DASHBOARD DEVICES (Single Query for All Info!)
// ========================================================================
import { getUserRole } from "./permissions";

export const getLiveSensors = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            // Public / Unauthenticated -> Return nothing (or demo mode logic if requested later)
            // For now: Secure default is empty array
            return [];
        }

        const role = await getUserRole(ctx);

        if (role === "admin") {
            // Admin sees ALL devices
            return await ctx.db.query("devices").collect();
        }

        // Regular user sees ONLY their own devices (claimed or assigned)
        // We need to resolve userId from identity first
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) return [];

        return await ctx.db
            .query("devices")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();
    },
});



// ========================================================================
// 3. GET TEMPERATURE HISTORY (Wired + BLE)
// ========================================================================
export const getHistory = query({
    args: {
        sensorId: v.string(),
        startTime: v.optional(v.number()), // Timestamp in ms (default: last 24h)
        limit: v.optional(v.number()),     // Max records (default: 500)
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Verify ownership
        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();

        if (!device) {
            throw new Error(`Device not found: ${args.sensorId}`);
        }

        if (device.userId !== userId) {
            throw new Error("Unauthorized: You don't own this device");
        }

        // Default: last 24 hours
        const startTime = args.startTime || (Date.now() - 24 * 60 * 60 * 1000);
        const limit = args.limit || 500;

        // Get both wired AND BLE readings in parallel
        const [wiredData, bleData] = await Promise.all([
            ctx.db
                .query("wiredReadings")
                .withIndex("by_device", (q) => q.eq("deviceId", args.sensorId))
                .filter((q) => q.gt(q.field("_creationTime"), startTime))
                .order("desc")
                .take(limit),

            ctx.db
                .query("bleReadings")
                .withIndex("by_device", (q) => q.eq("deviceId", args.sensorId))
                .filter((q) => q.gt(q.field("_creationTime"), startTime))
                .order("desc")
                .take(limit),
        ]);

        return {
            wired: wiredData,
            ble: bleData,
        };
    },
});

// ========================================================================
// 4. GET HUMIDITY HISTORY (BLE Only)
// ========================================================================
export const getHumidityHistory = query({
    args: {
        sensorId: v.string(),
        startTime: v.optional(v.number()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        if (!userId) {
            throw new Error("Not authenticated");
        }

        // Verify ownership
        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();

        if (!device || device.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const startTime = args.startTime || (Date.now() - 24 * 60 * 60 * 1000);
        const limit = args.limit || 500;

        return await ctx.db
            .query("bleReadings")
            .withIndex("by_device", (q) => q.eq("deviceId", args.sensorId))
            .filter((q) => q.gt(q.field("_creationTime"), startTime))
            .order("desc")
            .take(limit);
    },
});



// ========================================================================
// 6. UNCLAIM DEVICE (GDPR Compliant)
// ========================================================================
export const unclaimDevice = mutation({
    args: {
        sensorId: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getCurrentUserId(ctx);

        if (!userId) {
            throw new Error("Not authenticated");
        }

        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.sensorId))
            .unique();

        if (!device) {
            throw new Error("Device not found");
        }

        if (device.userId !== userId) {
            throw new Error("Unauthorized: You don't own this device");
        }

        // Remove ownership
        await ctx.db.patch(device._id, {
            userId: undefined,
            claimedAt: undefined,
        });

        // GDPR: Anonymize wired readings
        const wiredReadings = await ctx.db
            .query("wiredReadings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("deviceId"), args.sensorId))
            .take(100);

        for (const r of wiredReadings) {
            await ctx.db.patch(r._id, { userId: undefined });
        }

        // GDPR: Anonymize BLE readings
        const bleReadings = await ctx.db
            .query("bleReadings")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("deviceId"), args.sensorId))
            .take(100);

        for (const r of bleReadings) {
            await ctx.db.patch(r._id, { userId: undefined });
        }

        return { success: true };
    },
});