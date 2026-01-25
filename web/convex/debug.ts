import { query } from "./_generated/server";

/**
 * TEMPORARY PUBLIC QUERY - NO AUTH
 * Get all devices without authentication
 * TODO: Remove after JWT validation is fixed
 */
export const getAllDevicesPublic = query({
    args: {},
    handler: async (ctx) => {
        console.log("[getAllDevicesPublic] Fetching all devices (no auth)");
        const devices = await ctx.db.query("devices").collect();
        console.log(`[getAllDevicesPublic] Found ${devices.length} devices`);
        return devices;
    },
});
