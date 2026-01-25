import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * TEMPORARY: Public mutation to manually create admin user
 * TODO: Remove this after JWT validation is working properly
 */
export const createAdminUser = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existing = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existing) {
            // Update to admin if not already
            if (existing.role !== "admin") {
                await ctx.db.patch(existing._id, { role: "admin" });
                return { success: true, action: "updated", userId: existing._id };
            }
            return { success: true, action: "exists", userId: existing._id };
        }

        // Create new admin user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            name: args.name || "Admin User",
            role: "admin",
            tokenIdentifier: args.tokenIdentifier,
            createdAt: Date.now(),
        });

        return { success: true, action: "created", userId };
    },
});
