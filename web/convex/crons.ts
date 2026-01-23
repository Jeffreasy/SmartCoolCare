import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation, internalQuery } from "./_generated/server";

const crons = cronJobs();

// ========================================================================
// 1. DEAD DEVICE MONITOR (Every 15 minutes)
// ========================================================================
crons.interval(
    "check-dead-devices",
    { minutes: 15 },
    internal.crons.checkDeadDevices
);

export const checkDeadDevices = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const thirtyMinutesAgo = now - (30 * 60 * 1000);

        // Use new composite index for efficient lookup (no full table scan!)
        const devices = await ctx.db
            .query("devices")
            .withIndex("by_status_time", (q) =>
                q.eq("lastDeviceStatus", "healthy")
                    .lt("lastSeenAt", thirtyMinutesAgo)
            )
            .collect();

        // Also check "degraded" devices
        const degradedDevices = await ctx.db
            .query("devices")
            .withIndex("by_status_time", (q) =>
                q.eq("lastDeviceStatus", "degraded")
                    .lt("lastSeenAt", thirtyMinutesAgo)
            )
            .collect();

        const allStaleDevices = [...devices, ...degradedDevices];

        for (const device of allStaleDevices) {
            // Mark as offline
            await ctx.db.patch(device._id, {
                lastDeviceStatus: "offline"
            });

            // Log critical error
            await ctx.db.insert("device_logs", {
                deviceId: device.deviceId,
                level: "critical",
                code: "DEVICE_DEAD",
                message: "Device unresponsive for > 30 minutes. Marking as OFFLINE.",
                timestamp: now,
            });
        }
    },
});

// ========================================================================
// 2. TEMPERATURE ALERTS (Every 30 minutes)
// ========================================================================
crons.interval(
    "check-temp-alerts",
    { minutes: 30 },
    internal.crons.checkTempAlerts
);

export const checkTempAlerts = internalMutation({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const MAX_SAFE_TEMP = 7.0; // °C

        // Get all online devices
        const devices = await ctx.db
            .query("devices")
            .filter((q) => q.neq(q.field("lastDeviceStatus"), "offline"))
            .collect();

        for (const device of devices) {
            // Check Wired Temp
            if (device.lastWiredTemp !== undefined && device.lastWiredTemp > MAX_SAFE_TEMP) {
                await ctx.db.insert("device_logs", {
                    deviceId: device.deviceId,
                    level: "warn",
                    code: "TEMP_HIGH_WIRED",
                    message: `Wired sensor temperature (${device.lastWiredTemp}°C) exceeds safe limit (${MAX_SAFE_TEMP}°C).`,
                    timestamp: now,
                });
            }

            // Check BLE Temp
            if (device.lastBleTemp !== undefined && device.lastBleTemp > MAX_SAFE_TEMP) {
                await ctx.db.insert("device_logs", {
                    deviceId: device.deviceId,
                    level: "warn",
                    code: "TEMP_HIGH_BLE",
                    message: `BLE sensor temperature (${device.lastBleTemp}°C) exceeds safe limit (${MAX_SAFE_TEMP}°C).`,
                    timestamp: now,
                });
            }
        }
    }
});

export default crons;
