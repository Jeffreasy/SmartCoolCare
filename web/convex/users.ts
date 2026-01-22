import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Store or update user profile in database
 * Called automatically after signup/login from frontend
 */
export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Check if user exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (existingUser) {
            // Update name if changed
            if (existingUser.name !== identity.name) {
                await ctx.db.patch(existingUser._id, {
                    name: identity.name,
                });
            }
            return existingUser._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            email: identity.email!,
            name: identity.name,
            role: "user", // Default Role
            tokenIdentifier: identity.tokenIdentifier,
            createdAt: Date.now(),
        });
    },
});

/**
 * Get current user's profile
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            return null;
        }

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();
    },
});
