import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { canEditDevice } from "./permissions";

/**
 * Claim a device by its unique ID.
 * Links the device to the current user if:
 * 1. Device exists
 * 2. Device is currently unclaimed (userId is missing)
 */
/**
 * Claim a device by its unique ID and MAC address verification.
 * Links the device to the current user if:
 * 1. Device exists and has reported a MAC address
 * 2. MAC address matches verification input
 * 3. Device is currently unclaimed
 */
export const claim = mutation({
    args: {
        deviceId: v.string(),
        macVerify: v.string(),
    },
    handler: async (ctx, args) => {
        // 1. Authenticate
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to claim a device.");
        }

        // 2. Get User Object (needed for _id)
        let user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        // If user doesn't exist yet, create them now (Lazy Sync)
        if (!user) {
            const newUserId = await ctx.db.insert("users", {
                email: identity.email!,
                name: identity.name,
                role: "user",
                tokenIdentifier: identity.tokenIdentifier,
                createdAt: Date.now(),
            });
            user = await ctx.db.get(newUserId);
        }

        if (!user) throw new Error("Could not create user profile.");

        // 3. Find Device
        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
            .unique();

        if (!device) {
            throw new Error("Device ID not found. Check the label on your fridge.");
        }

        // 4. Verification Check
        if (device.userId) {
            // Already claimed
            if (device.userId === user._id) {
                return { success: true, message: "Device already linked to you." };
            }
            throw new Error("This device is already linked to another account.");
        }

        if (!device.hardwareMac) {
            throw new Error("Device has not reported MAC address yet. Ensure it is powered on.");
        }

        // MAC Verification
        const dbMac = device.hardwareMac.toLowerCase().replace(/[^a-z0-9]/g, "");
        const inputMac = args.macVerify.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (!dbMac.includes(inputMac) || inputMac.length < 4) {
            throw new Error("MAC verification failed. Please check the device label.");
        }

        // 5. Link Device
        await ctx.db.patch(device._id, {
            userId: user._id,
            displayName: "My Smart Fridge", // Default friendly name
            claimedAt: Date.now(),
        });

        return { success: true, message: "Device successfully claimed!" };
    },
});

/**
 * Update device settings (e.g. name, remote config)
 * Protected by `canEditDevice` check (ownership or admin)
 */
export const updateName = mutation({
    args: {
        deviceId: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const hasPermission = await canEditDevice(ctx, args.deviceId);
        if (!hasPermission) {
            throw new Error("Unauthorized: You do not have permission to edit this device.");
        }

        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
            .unique();

        if (!device) throw new Error("Device not found");

        await ctx.db.patch(device._id, {
            displayName: args.name,
        });

        return { success: true };
    },
});

/**
 * Update comprehensive device settings
 */
export const updateSettings = mutation({
    args: {
        deviceId: v.string(),
        displayName: v.optional(v.string()),
        deviceType: v.optional(v.string()),
        minTemp: v.optional(v.number()),
        maxTemp: v.optional(v.number()),
        tempOffsetWired: v.optional(v.number()),
        tempOffsetBle: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const hasPermission = await canEditDevice(ctx, args.deviceId);
        if (!hasPermission) {
            throw new Error("Unauthorized: You do not have permission to edit this device.");
        }

        const device = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", args.deviceId))
            .unique();

        if (!device) throw new Error("Device not found");

        // Construct update object
        const updateFields: any = {};
        if (args.displayName !== undefined) updateFields.displayName = args.displayName;
        if (args.deviceType !== undefined) updateFields.deviceType = args.deviceType;
        if (args.minTemp !== undefined) updateFields.minTemp = args.minTemp;
        if (args.maxTemp !== undefined) updateFields.maxTemp = args.maxTemp;

        // Handle Config Object separately to merge or overwrite
        if (args.tempOffsetWired !== undefined || args.tempOffsetBle !== undefined) {
            updateFields.config = {
                ...(device.config || {}),
                ...(args.tempOffsetWired !== undefined ? { tempOffsetWired: args.tempOffsetWired } : {}),
                ...(args.tempOffsetBle !== undefined ? { tempOffsetBle: args.tempOffsetBle } : {}),
            };
        }

        await ctx.db.patch(device._id, updateFields);

        return { success: true };
    },
});
