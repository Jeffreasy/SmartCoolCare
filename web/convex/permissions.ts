import type { QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * Checks if the current user has the 'admin' assignment.
 */
export async function isAdmin(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    return user?.role === "admin";
}

/**
 * Checks if the current user owns the device OR is an admin.
 */
export async function canEditDevice(ctx: QueryCtx | MutationCtx, deviceId: string) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    if (!user) return false;
    if (user.role === "admin") return true;

    // Check device ownership
    const device = await ctx.db
        .query("devices")
        .withIndex("by_deviceId", (q) => q.eq("deviceId", deviceId))
        .unique();

    return device?.userId === user._id;
}

/**
 * Returns the current user's role (defaults to 'user')
 */
export async function getUserRole(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .unique();

    return user?.role ?? "user";
}
