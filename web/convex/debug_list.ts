import { query } from "./_generated/server";

export const listAll = query({
    args: {},
    handler: async (ctx) => {
        const users = await ctx.db.query("users").collect();
        const devices = await ctx.db.query("devices").collect();
        return { users, devices };
    },
});
