import { useCallback } from 'react';
import { useStore } from '@nanostores/react';
import { $tenant } from '@/lib/stores/tenantStore';
import { loginUser, logoutUser } from '@/lib/authStore';

// USE PROXY (Relative Path) to share cookies with SSR/Middleware
const AUTH_API_URL = '/api/v1/auth';

export interface LoginResult {
    success: boolean;
    mfaRequired?: boolean;
    preAuthToken?: string;
    userId?: string;
    error?: string;
}

export function useAuthActions() {
    const tenant = useStore($tenant);

    const createAuthHeaders = useCallback((): HeadersInit => {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (tenant?.id) {
            headers['X-Tenant-ID'] = tenant.id;
            console.log('[useAuthActions] Attaching Tenant ID:', tenant.id);
        } else {
            console.warn('[useAuthActions] ⚠️ No Tenant ID available for headers!');
        }
        return headers;
    }, [tenant]);

    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: createAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) return { success: false, error: data.error || 'Login failed' };

            if (data.mfa_required) {
                return {
                    success: false,
                    mfaRequired: true,
                    preAuthToken: data.pre_auth_token,
                    userId: data.user?.id || data.user?.Id,
                };
            }

            const user = data.user;
            const normalizedUser = {
                id: user.id || user.Id,
                email: user.email || user.Email,
                fullName: user.full_name || user.fullName || user.FullName,
                role: user.role || user.Role,
                tenantId: user.tenant_id || user.tenantId || user.TenantId,
            };

            loginUser(normalizedUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
        }
    }, [createAuthHeaders]);

    const verifyMFA = useCallback(async (code: string, userId: string, preAuthToken?: string) => {
        try {
            const response = await fetch(`${AUTH_API_URL}/mfa/verify`, {
                method: 'POST',
                headers: createAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ userId, code, pre_auth_token: preAuthToken }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'MFA failed');

            const user = data.user;
            const normalizedUser = {
                id: user.id || user.Id,
                email: user.email || user.Email,
                fullName: user.full_name || user.fullName || user.FullName,
                role: user.role || user.Role,
                tenantId: user.tenant_id || user.tenantId || user.TenantId,
            };

            loginUser(normalizedUser);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'MFA failed' };
        }
    }, [createAuthHeaders]);

    const logout = useCallback(async () => {
        await logoutUser();
    }, []);

    return { login, verifyMFA, logout };
}
