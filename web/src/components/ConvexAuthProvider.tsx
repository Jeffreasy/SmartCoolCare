import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ConvexProviderWithAuth } from "convex/react";
import { useCustomAuth } from "@/hooks/useCustomAuth";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

/**
 * Inner wrapper that provides auth state to Convex
 * This component uses the useCustomAuth hook and passes state to Convex
 */
function ConvexAuthBridge({ children }: { children: ReactNode }) {
    const customAuth = useCustomAuth();

    console.log('[ConvexAuthBridge] Auth state:', {
        isLoading: customAuth.isLoading,
        isAuthenticated: customAuth.isAuthenticated,
        hasToken: !!customAuth.token
    });

    return (
        <ConvexProviderWithAuth
            client={convex}
            useAuth={() => {
                return {
                    isLoading: customAuth.isLoading,
                    isAuthenticated: customAuth.isAuthenticated,
                    fetchAccessToken: customAuth.fetchAccessToken,
                };
            }}
        >
            {children}
        </ConvexProviderWithAuth>
    );
}

/**
 * Main provider component
 * Wraps the app with authentication
 */
export default function ConvexAuthProvider({ children }: { children: ReactNode }) {
    console.log("ConvexAuthProvider initialized with:", {
        convexUrl: import.meta.env.PUBLIC_CONVEX_URL,
    });

    return (
        <ConvexAuthBridge>
            {children}
            <Toaster position="top-right" theme="dark" richColors />
        </ConvexAuthBridge>
    );
}
