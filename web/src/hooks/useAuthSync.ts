import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useStore } from '@nanostores/react';
import { authStore } from '@/lib/authStore';

/**
 * Auto-sync hook: Syncs LaventeCare auth user into Convex database
 * Call this in your root component (e.g., ConnectedDashboard)
 */
export function useAuthSync() {
    const { user, isAuthenticated } = useStore(authStore);
    const storeUser = useMutation(api.users.store);
    // @ts-ignore - seed_dev might not be in types yet
    const seedDevice = useMutation(api.seed_dev?.seedMyDevice ?? api.users.store); // Fallback to avoid crash if missing, logic handles call check
    const syncedRef = useRef(false);

    useEffect(() => {
        // Only sync once when authenticated with user
        if (isAuthenticated && user && !syncedRef.current) {
            storeUser()
                .then(async () => {
                    syncedRef.current = true;

                    // AUTO-SEED: Ensure user has a device (Dev/Demo Mode)
                    try {
                        // @ts-ignore - Dynamic definition
                        if (api.seed_dev?.seedMyDevice) {
                            // @ts-ignore
                            await seedDevice();
                        }
                    } catch (e) {
                        console.warn('Auto-seed failed', e);
                    }
                })
                .catch((error) => {
                    console.error('[AuthSync] Failed to sync user:', error);
                    syncedRef.current = false;
                });
        }

        // Reset sync flag on logout
        if (!isAuthenticated) {
            syncedRef.current = false;
        }
    }, [isAuthenticated, user, storeUser]);
}
