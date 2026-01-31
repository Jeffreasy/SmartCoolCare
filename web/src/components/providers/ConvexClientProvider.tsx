import { type ReactNode, useMemo } from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { useStore } from "@nanostores/react";
import { authStore } from "@/lib/authStore";
import { $tenant } from "@/lib/stores/tenantStore";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

/**
 * Custom Hook Adapter for Convex Auth
 * Keeps the useAuth reference stable to prevent provider resets.
 * 
 * CRITICAL FIX: Named function defined OUTSIDE the component ensures identity stability.
 * Inline arrow functions in props can trigger infinite re-renders/resets in some libraries.
 */
function useConvexAuthAdapter() {
    // We gebruiken de store nog steeds voor de initiële waardes, 
    // maar we laten de hook NIET re-renderen als de waardes veranderen 
    // om de referentie naar de functies stabiel te houden voor Convex.
    const { isAuthenticated, isLoading } = useStore(authStore);

    return useMemo(() => ({
        isAuthenticated,
        isLoading,
        fetchAccessToken: async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
            const MAX_RETRIES = 3;
            let attempt = 0;

            if (forceRefreshToken) {
                console.log('[ConvexProvider] 🔄 Force Refresh requested by Convex');
            }

            while (attempt < MAX_RETRIES) {
                try {
                    const headers: Record<string, string> = {};
                    const tenant = $tenant.get();
                    if (tenant?.id) {
                        headers['X-Tenant-ID'] = tenant.id;
                    }

                    // USE PROXY (Relative Path) to share cookies with SSR/Middleware
                    const response = await fetch('/api/v1/auth/token', {
                        method: 'GET',
                        headers,
                        credentials: 'include',
                    });

                    if (response.status === 429) {
                        console.warn(`[ConvexProvider] Rate limit hit (429). Retrying in ${1000 * (attempt + 1)}ms...`);
                        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                        attempt++;
                        continue;
                    }

                    if (!response.ok) {
                        console.warn('[ConvexProvider] Failed to fetch token:', response.status);
                        return null; // Token fetch failed, Convex considers this "not authenticated"
                    }

                    const data = await response.json();
                    return data.token;
                } catch (err) {
                    console.error(`[ConvexProvider] Network attempt ${attempt + 1} failed:`, err);
                    attempt++;
                    if (attempt < MAX_RETRIES) {
                        await new Promise(r => setTimeout(r, 500 * attempt));
                    }
                }
            }
            console.error('[ConvexProvider] Max retries reached. Token fetch failed.');
            return null;
        },
    }), [isAuthenticated]); // <--- CORRECTED: Depends on auth state to trigger re-fetch on login
}

/**
 * bridges the AuthContext state to the Convex Client
 * so that useQuery/useMutation work with the Go Backend token.
 */
export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    // Wacht tot de initiële auth check klaar is voordat we Convex starten.
    // Dit voorkomt 401 spam bij het laden van de pagina als er nog geen sessie is.
    const { isLoading } = useStore(authStore);

    if (isLoading) {
        return null; // Of een <LoadingSpinner /> als je dat wilt, maar null is veilig voor islands blocks
    }

    return (
        <ConvexProviderWithAuth
            client={convex}
            useAuth={useConvexAuthAdapter}
        >
            {children}
        </ConvexProviderWithAuth>
    );
}
