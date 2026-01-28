import { mutation } from "./_generated/server";

export const seedMyDevice = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (!user) {
            throw new Error("User not found in Convex. Try logging out and back in.");
        }

        // Check if user already has devices
        const existingDefault = await ctx.db
            .query("devices")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .first();

        if (existingDefault) {
            console.log("User already has devices:", existingDefault._id);
            // Verify if it's the demo device and ensure ownership is correct (Self-Healing)
            if (existingDefault.deviceId === "demo_koelkast_01" && existingDefault.userId !== user._id) {
                console.log("Fixing demo device ownership...");
                await ctx.db.patch(existingDefault._id, { userId: user._id });
                return { success: true, message: "Reclaimed demo device!" };
            }
            return { success: true, message: "User already has a device." };
        }

        // CHECK IF DEMO DEVICE EXISTS BUT OWNED BY OTHERS (Stale Data)
        const staleDemo = await ctx.db
            .query("devices")
            .withIndex("by_deviceId", (q) => q.eq("deviceId", "demo_koelkast_01"))
            .unique();

        if (staleDemo) {
            console.log("Found stale demo device, reclaiming...", staleDemo._id);
            await ctx.db.patch(staleDemo._id, { userId: user._id });
            return { success: true, message: "Reclaimed stale demo device!" };
        }

        // Create Demo Device using correct schema
        const deviceId = await ctx.db.insert("devices", {
            deviceId: "demo_koelkast_01",
            displayName: "Mijn Demo Koelkast",
            userId: user._id, // Assign to current user
            lastSeenAt: Date.now(),
            lastDeviceStatus: "healthy",
            lastSignalStrength: -45,
            lastWiredTemp: 4.2,
            lastWiredTimestamp: Date.now(),
            hardwareMac: "AA:BB:CC:DD:EE:FF",
            config: {
                tempOffsetWired: 0.0,
                tempOffsetBle: 0.0,
            }
        });

        // Add some dummy history
        // Note: We cannot backdate _creationTime in Convex easily without system override privileges, 
        // so we just insert them as 'new' records. They will show up as "Just now" data points, which is fine for demo.
        await ctx.db.insert("wiredReadings", {
            deviceId: "demo_koelkast_01",
            userId: user._id,
            temperature: 4.2,
        });

        console.log("Seeded demo device for user:", user._id);
        return { success: true, message: "Created 'Mijn Demo Koelkast' for you!" };
    },
});
