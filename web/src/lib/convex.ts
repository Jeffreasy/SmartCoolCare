import { ConvexReactClient } from "convex/react";

/**
 * Singleton instance of the Convex Client.
 * This ensures that all Astro Islands share the same connection and authentication state.
 */
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;

if (!convexUrl) {
    console.error("❌ PUBLIC_CONVEX_URL is missing!");
}

export const convex = new ConvexReactClient(convexUrl || "https://placeholder-url.convex.cloud");
