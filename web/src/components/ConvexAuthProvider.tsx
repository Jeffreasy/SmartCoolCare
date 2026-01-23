import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);
const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function ConvexAuthProvider({ children }: { children: ReactNode }) {
    console.log("ConvexAuthProvider config:", {
        hasKey: !!publishableKey,
        keyPrefix: publishableKey?.substring(0, 8),
        convexUrl: import.meta.env.PUBLIC_CONVEX_URL
    });

    if (!publishableKey) {
        return (
            <div className="p-10 text-red-500 bg-black h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
                <p>Missing PUBLIC_CLERK_PUBLISHABLE_KEY in .env file</p>
                <p className="text-sm mt-4 text-gray-400">Please check your .env file and restart the server.</p>
            </div>
        );
    }

    return (
        <ClerkProvider publishableKey={publishableKey}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
                <Toaster position="top-right" theme="dark" richColors />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
