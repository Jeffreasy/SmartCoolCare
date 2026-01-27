import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import { useTenant } from '@/contexts/TenantContext';

// Configuration
const AUTH_API_URL = '/api/auth';

// Types
export interface User {
    id: string;
    email: string;
    fullName: string;
    role?: string;
    tenantId?: string;
}

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    token: string | null;
}

interface LoginResult {
    success: boolean;
    mfaRequired?: boolean;
    preAuthToken?: string;
    userId?: string; // Standardized for MFA flow
    error?: string;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    verifyMFA: (code: string, userId: string, preAuthToken?: string) => Promise<{ success: boolean; error?: string }>;
    refreshSession: () => Promise<{ success: boolean }>;
    fetchAccessToken: () => Promise<string | null>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set/clear cookies for Middleware sync
const setAuthCookie = (token: string | null) => {
    if (token) {
        // Set cookie valid for 7 days (or match backend expiry)
        // Secure: true only in production (avoids localhost issues on some browsers)
        // SameSite: Lax is often better for navigation than Strict, but Strict is safer. Keeping Strict for now unless issues arise.
        Cookies.set('__session', token, {
            expires: 7,
            secure: import.meta.env.PROD,
            sameSite: 'Strict',
            path: '/'
        });
    } else {
        Cookies.remove('__session', { path: '/' });
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const { tenant } = useTenant(); // Inject tenant context

    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
    });

    // Note: Tokens are now managed exclusively via HttpOnly cookies set by backend
    // No client-side token storage (XSS protection)

    // Helper: Create auth headers with tenant context
    // Note: No Authorization header needed - backend reads tokens from HttpOnly cookies
    const createAuthHeaders = useCallback((): HeadersInit => {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // CRITICAL: Add X-Tenant-ID header for strict isolation
        if (tenant?.id) {
            headers['X-Tenant-ID'] = tenant.id;
        }

        return headers;
    }, [tenant]);

    // Helper: Fetch User Info (Validation Only)
    // Validates session using HttpOnly cookies (token sent automatically)
    const fetchUserInfo = useCallback(async (): Promise<User | null> => {
        try {
            const response = await fetch(`${AUTH_API_URL}/me`, {
                headers: createAuthHeaders(),
                credentials: 'include', // ✅ CRITICAL: Sends HttpOnly cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return null;
                }
                throw new Error('Failed to fetch user info');
            }

            const data = await response.json();
            // Handle potentially nested user object from backend
            const userData = data.user || data;

            return {
                id: userData.id || userData.Id,
                email: userData.email || userData.Email,
                fullName: userData.full_name || userData.fullName || userData.FullName || userData.full_Name,
                role: userData.role || userData.Role,
                tenantId: userData.tenant_id || userData.tenantId || userData.TenantId || data.tenant?.id,
            };
        } catch (error) {
            console.error('[Auth] Fetch user failed:', error);
            return null;
        }
    }, [createAuthHeaders]);

    // Singleton Refresh Pattern: Prevent race conditions during concurrent refresh attempts
    let refreshPromise: Promise<{ success: boolean }> | null = null;

    // Refresh Session Logic
    const refreshSession = useCallback(async (): Promise<{ success: boolean }> => {
        // ✅ Singleton pattern: only one refresh at a time
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = (async () => {
            try {
                const response = await fetch(`${AUTH_API_URL}/refresh`, {
                    method: 'POST',
                    headers: createAuthHeaders(),
                    credentials: 'include', // ✅ CRITICAL: Sends refresh_token cookie
                });

                if (!response.ok) {
                    const data = await response.json().catch(() => ({ error: 'Refresh failed' }));
                    console.error('[Auth] Refresh failed:', data.error);
                    // Strict logout on refresh failure
                    setState({ isAuthenticated: false, isLoading: false, user: null, token: null });
                    return { success: false };
                }

                const data = await response.json();

                // Backend sets new HttpOnly cookies automatically
                // Fetch fresh user info to update state
                const user = data.user || await fetchUserInfo();

                if (user) {
                    setState(prev => ({ ...prev, isAuthenticated: true, user, token: 'cookie-managed' }));
                    return { success: true };
                }

                return { success: false };
            } catch (error) {
                console.error('[Auth] Refresh error:', error);
                setState({ isAuthenticated: false, isLoading: false, user: null, token: null });
                return { success: false };
            } finally {
                refreshPromise = null;
            }
        })();

        return refreshPromise;
    }, [createAuthHeaders, fetchUserInfo]);

    // Initialization
    useEffect(() => {
        const initAuth = async () => {
            // ✅ Try to validate session using HttpOnly cookies
            const user = await fetchUserInfo();

            if (user) {
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    token: 'cookie-managed',
                });
                setAuthCookie('cookie-managed'); // Sync with middleware
            } else {
                // No valid session - try refresh
                console.log('[Auth] No valid session, attempting refresh...');
                const refreshResult = await refreshSession();
                if (!refreshResult.success) {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            }
        };

        initAuth();
    }, [fetchUserInfo, refreshSession]);

    // Actions
    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        // Validate tenant context is available
        if (!tenant?.id) {
            return {
                success: false,
                error: 'Tenant context not available. Please refresh the page.'
            };
        }

        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: createAuthHeaders(),
                credentials: 'include', // ✅ CRITICAL: Backend sets HttpOnly cookies
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            // MFA Flow
            if (data.mfa_required) {
                return {
                    success: false,
                    mfaRequired: true,
                    preAuthToken: data.pre_auth_token,
                    userId: data.user?.id || data.user?.Id,
                };
            }

            // Success Flow
            // ✅ Backend sets tokens as HttpOnly cookies automatically
            // JSON response contains only user data (no tokens)
            let user = data.user;
            if (user) {
                // Normalize user structure
                user = {
                    id: user.id || user.Id,
                    email: user.email || user.Email,
                    fullName: user.full_name || user.fullName || user.FullName || user.full_Name,
                    role: user.role || user.Role,
                    tenantId: user.tenant_id || user.tenantId || user.TenantId || data.tenant?.id,
                };
            }

            setState({
                isAuthenticated: !!user,
                isLoading: false,
                user,
                token: 'cookie-managed',
            });

            setAuthCookie('cookie-managed'); // Sync with middleware

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown login error'
            };
        }
    }, [tenant, createAuthHeaders]);

    const verifyMFA = useCallback(async (code: string, userId: string, preAuthToken?: string) => {
        if (!tenant?.id) {
            return {
                success: false,
                error: 'Tenant context not available'
            };
        }

        try {
            const response = await fetch(`${AUTH_API_URL}/mfa/verify`, {
                method: 'POST',
                headers: createAuthHeaders(),
                credentials: 'include', // ✅ CRITICAL: Backend sets HttpOnly cookies
                body: JSON.stringify({
                    userId,
                    code,
                    pre_auth_token: preAuthToken,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'MFA failed');

            // ✅ Backend sets tokens as HttpOnly cookies automatically
            // Fetch or use user from response
            let user = data.user;
            if (!user) {
                user = await fetchUserInfo();
            } else {
                user = {
                    id: user.id || user.Id,
                    email: user.email || user.Email,
                    fullName: user.full_name || user.fullName || user.FullName || user.full_Name,
                    role: user.role || user.Role,
                    tenantId: user.tenant_id || user.tenantId || user.TenantId || user.tenant?.id,
                };
            }

            setState({
                isAuthenticated: !!user,
                isLoading: false,
                user,
                token: 'cookie-managed',
            });

            setAuthCookie('cookie-managed'); // Sync with middleware

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'MFA verification failed'
            };
        }
    }, [tenant, createAuthHeaders, fetchUserInfo]);

    const logout = useCallback(async () => {
        try {
            // Backend clears HttpOnly cookies
            await fetch(`${AUTH_API_URL}/logout`, {
                method: 'POST',
                headers: createAuthHeaders(),
                credentials: 'include', // ✅ CRITICAL: Sends cookies for backend to clear
            }).catch(console.error);
        } finally {
            setAuthCookie(null); // Clear middleware sync cookie
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
            window.location.href = '/login';
        }
    }, [createAuthHeaders]);

    // Deprecated: Token is managed by backend cookies
    const fetchAccessToken = async () => null;

    return (
        <AuthContext.Provider value={{ ...state, login, logout, verifyMFA, refreshSession, fetchAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
