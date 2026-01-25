import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useCustomAuth } from './useCustomAuth';

/**
 * Auto-sync hook: Syncs LaventeCare auth user into Convex database
 * Call this in your root component (e.g., ConnectedDashboard)
 */
export function useAuthSync() {
    const { user, isAuthenticated } = useCustomAuth();
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        console.log('[useAuthSync] State:', {
            isAuthenticated,
            hasUser: !!user,
            email: user?.email
        });

        // Simplified: Just sync if user is authenticated
        // Don't wait for useConvexAuth - it's unreliable with custom auth
        if (isAuthenticated && user) {
            console.log('[useAuthSync] 🔄 Syncing user to Convex:', user.email);

            // Add small delay to ensure Convex WebSocket is connected
            setTimeout(() => {
                storeUser()
                    .then(() => {
                        console.log('[useAuthSync] ✅ User synced to Convex');
                    })
                    .catch((error) => {
                        console.error('[useAuthSync] ❌ Failed to sync user:', error);
                    });
            }, 500);
        }
    }, [isAuthenticated, user, storeUser]);
}
