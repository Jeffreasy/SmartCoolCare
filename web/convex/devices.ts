import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

/**
 * Claim a device by its unique ID.
 * Links the device to the current user if:
 * 1. Device exists
 * 2. Device is currently unclaimed (userId is missing)
 */
export const claim = mutation({
    args: { deviceId: v.string() },
    handler: async (ctx, args) => {
        // 1. Authenticate
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to claim a device.");
        }

        // 2. Get User Object (needed for _id)
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

        // 5. Link Device
        await ctx.db.patch(device._id, {
            userId: user._id,
            displayName: "My Fridge (New)", // Default name
        });

        return { success: true, message: "Device successfully claimed!" };
    },
});

/**
 * Update device settings (e.g. name, remote config)
 * Protected by `canEditDevice`
 */
// TODO: Implement updateDevice mutation
