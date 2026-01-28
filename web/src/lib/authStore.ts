import { atom, map } from 'nanostores';

interface User {
    id: string;
    email: string;
    fullName: string;
    role?: string;
    tenantId?: string;
}

export interface AuthStoreState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: string | null;
}

export const authStore = map<AuthStoreState>({
    isAuthenticated: false,
    isLoading: true, // Start loading by default
    user: null,
    error: null
});

// Helper to check if we are on the login page
const isLoginPage = () => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/login' || window.location.pathname === '/signup';
};

// Configuration
const AUTH_API_URL = 'https://laventecareauthsystems.onrender.com/api/v1/auth';

/**
 * Core Auth Action: Check Session
 * Runs once per page load effectively via the store logic.
 */
import { $tenant, initTenant } from './stores/tenantStore';

// ... existing code ...

// Helper to execute checking auth with optional refresh capability
export const checkAuth = async () => {
    // Determine context (public/private routes)
    const isProtected = typeof window !== 'undefined' &&
        !['/login', '/signup', '/', '/forgot-password'].includes(window.location.pathname);

    try {
        authStore.setKey('isLoading', true);

        // ✅ CRITICAL: Resolve Tenant ID for header
        if (!$tenant.get()) {
            await initTenant();
        }
        const tenant = $tenant.get();

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (tenant?.id) headers['X-Tenant-ID'] = tenant.id;

        // 1. Attempt Initial Me Check
        let response = await fetch(`${AUTH_API_URL}/me`, {
            headers,
            credentials: 'include',
        });

        // 2. Handle 401 (Possible Expired Access Token)
        if (response.status === 401) {
            console.log('[AuthStore] ⚠️ Access Token expired. Attempting Silent Refresh...');
            try {
                const refreshResponse = await fetch(`${AUTH_API_URL}/refresh`, {
                    method: 'POST',
                    headers,
                    credentials: 'include'
                });

                if (refreshResponse.ok) {
                    console.log('[AuthStore] ✅ Refresh Successful. Retrying Session Check...');
                    // Retry Me Check
                    response = await fetch(`${AUTH_API_URL}/me`, {
                        headers,
                        credentials: 'include',
                    });
                } else {
                    console.error('[AuthStore] ❌ Refresh Failed');
                    throw new Error('Refresh Failed');
                }
            } catch (refreshErr) {
                // If refresh network fails or returns error, we are truly done.
                throw refreshErr;
            }
        }

        if (response.ok) {
            const data = await response.json();
            const userData = data.user || data;

            // Normalize User Data
            const user: User = {
                id: userData.id || userData.Id,
                email: userData.email || userData.Email,
                fullName: userData.full_name || userData.fullName || userData.FullName,
                role: userData.role || userData.Role,
                tenantId: userData.tenant_id || userData.tenantId || userData.TenantId,
            };

            authStore.set({
                isAuthenticated: true,
                isLoading: false,
                user,
                error: null
            });
            console.log('[AuthStore] ✅ Session Validated');

            // Redirect if on login page and authenticated
            if (isLoginPage()) {
                console.log('[AuthStore] 🔄 Public page + Auth = Redirecting to dashboard...');
                window.location.href = '/dashboard';
            }
        } else {
            throw new Error('Unauthorized');
        }
    } catch (error) {
        console.log('[AuthStore] ⛔ Session Invalid or Logic Failed', error);

        authStore.set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
        });

        // Redirect Logic: ONLY if protected and NOT on login page
        if (isProtected && !isLoginPage()) {
            console.log('[AuthStore] 🔄 Redirecting to login...');
            window.location.href = '/login';
        } else {
            console.log('[AuthStore] ℹ️ Staying on current page (Public/Login)');
        }
    }
};

/**
 * Login Action
 * Used by Login Forms
 */
export const loginUser = async (user: User) => {
    authStore.set({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null
    });
};

/**
 * Logout Action
 */
export const logoutUser = async () => {
    try {
        await fetch(`${AUTH_API_URL}/logout`, { method: 'POST' });
    } catch (e) {
        console.error('Logout API failed', e);
    } finally {
        authStore.set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
        });
        window.location.href = '/login';
    }
};
