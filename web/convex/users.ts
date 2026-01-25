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

        // Extract email and name from LaventeCare JWT token
        // The JWT token has: sub (email), full_name, role, tenant_id, iat, exp
        const email = identity.email || (identity as any).subject || identity.tokenIdentifier.split('|')[1] || 'unknown@smartcoolcare.nl';
        const fullName = identity.name || (identity as any).full_name || 'User';

        console.log('[users.store] Syncing user:', { email, fullName, tokenId: identity.tokenIdentifier });

        // Check if user exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier)
            )
            .unique();

        if (existingUser) {
            // Update name if changed
            if (existingUser.name !== fullName || existingUser.email !== email) {
                await ctx.db.patch(existingUser._id, {
                    name: fullName,
                    email: email,
                });
                console.log('[users.store] ✅ Updated existing user:', existingUser._id);
            } else {
                console.log('[users.store] ✅ User already up-to-date:', existingUser._id);
            }
            return existingUser._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            email: email,
            name: fullName,
            role: "user", // Default Role
            tokenIdentifier: identity.tokenIdentifier,
            createdAt: Date.now(),
        });

        console.log('[users.store] 🆕 Created new user:', userId);
        return userId;
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
