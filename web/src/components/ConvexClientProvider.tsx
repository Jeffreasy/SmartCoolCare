import type { ReactNode } from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { useAuth } from "./auth/AuthContext";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

/**
 * bridges the AuthContext state to the Convex Client
 * so that useQuery/useMutation work with the Go Backend token.
 */
export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, fetchAccessToken } = useAuth();

    return (
        <ConvexProviderWithAuth
            client={convex}
            useAuth={() => ({
                isAuthenticated,
                isLoading,
                fetchAccessToken,
            })}
        >
            {children}
        </ConvexProviderWithAuth>
    );
}
