import { query } from "./_generated/server";

export const inspectKey = query({
    args: {},
    handler: async () => {
        const key = process.env.JWT_PRIVATE_KEY || "";
        if (!key) {
            return "❌ Key is MISSING or EMPTY.";
        }

        const segments = key.split("\n");
        return {
            lines: segments.length,
            totalLength: key.length,
            startsWithHeader: key.trim().startsWith("-----BEGIN PRIVATE KEY-----"),
            endsWithFooter: key.trim().endsWith("-----END PRIVATE KEY-----"),
            containsLiteralSlashN: key.includes("\\n"),
            firstLine: segments[0],
            lastLine: segments[segments.length - 1],
            preview: key.substring(0, 50) + "..."
        };
    },
});
