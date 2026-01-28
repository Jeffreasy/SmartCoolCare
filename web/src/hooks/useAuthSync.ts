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
        console.log('[useAuthSync] State:', {
            isAuthenticated,
            hasUser: !!user,
            email: user?.email,
            alreadySynced: syncedRef.current
        });

        // Only sync once when authenticated with user
        if (isAuthenticated && user && !syncedRef.current) {
            console.log('[useAuthSync] 🔄 Syncing user to Convex:', user.email);

            storeUser()
                .then(async () => {
                    console.log('[useAuthSync] ✅ User synced to Convex');
                    syncedRef.current = true;

                    // AUTO-SEED: Ensure user has a device (Dev/Demo Mode)
                    // We dynamically import to avoid breaking if seed_dev doesn't exist in prod, 
                    // but here we just use the API object we know exists.
                    try {
                        // @ts-ignore - Dynamic definition
                        if (api.seed_dev?.seedMyDevice) {
                            console.log('[useAuthSync] 🌱 Attempting to seed device...');
                            // @ts-ignore
                            await seedDevice();
                            console.log('[useAuthSync] 🌱 Seed complete!');
                        }
                    } catch (e) {
                        console.warn('Auto-seed failed or skipped', e);
                    }
                })
                .catch((error) => {
                    console.error('[useAuthSync] ❌ Failed to sync user:', error);
                    // Reset ref on failure to allow retry
                    syncedRef.current = false;
                });
        }

        // Reset sync flag on logout
        if (!isAuthenticated) {
            syncedRef.current = false;
        }
    }, [isAuthenticated, user, storeUser]);
}
