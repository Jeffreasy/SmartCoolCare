import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import Cookies from 'js-cookie';

// Configuration
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
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
    const [state, setState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
    });

    // Helper: LocalStorage Management
    const getToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }, []);

    const getRefreshToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }, []);

    const setTokens = useCallback((accessToken: string | null, refreshToken: string | null) => {
        if (typeof window === 'undefined') return;
        if (accessToken) {
            localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
            setAuthCookie(accessToken);
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            setAuthCookie(null);
        }

        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        } else {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
    }, []);

    // Helper: Fetch User Info (Validation Only)
    // Used on page reload to validate token if we don't trust local storage user data persistence
    // or if we want fresh data.
    const fetchUserInfo = useCallback(async (token: string): Promise<User | null> => {
        try {
            const response = await fetch(`${AUTH_API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
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
    }, []);

    // Refresh Session Logic
    const refreshSession = useCallback(async (): Promise<{ success: boolean }> => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return { success: false };

        try {
            // Note: Backend docs imply refresh logic but exact endpoint might need verification.
            // Using standard /refresh endpoint.
            const response = await fetch(`${AUTH_API_URL}/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[Auth] Refresh failed:', data.error);
                // If refresh fails, strict logout
                setTokens(null, null);
                setState({ isAuthenticated: false, isLoading: false, user: null, token: null });
                return { success: false };
            }

            const newAccessToken = data.AccessToken || data.access_token;
            const newRefreshToken = data.RefreshToken || data.refresh_token;
            // Docs say "Refresh tokens are rotated on use", so we likely get a new one.

            setTokens(newAccessToken, newRefreshToken || refreshToken);

            // Optionally fetch fresh user info or just update state
            // Ideally we get user in refresh response too, but if not we can use /me
            const user = data.user ? data.user : await fetchUserInfo(newAccessToken);

            if (user) {
                setState(prev => ({ ...prev, isAuthenticated: true, token: newAccessToken, user }));
                return { success: true };
            }

            return { success: false };
        } catch (error) {
            console.error('[Auth] Refresh error:', error);
            return { success: false };
        }
    }, [getRefreshToken, setTokens, fetchUserInfo]);

    // Initialization
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();

            if (!token) {
                setState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            // Verify logic - Try to get user
            const user = await fetchUserInfo(token);

            if (user) {
                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    token: token,
                });
                setAuthCookie(token);
            } else {
                // Token invalid/expired? Try refresh.
                console.log('[Auth] Token invalid or expired, attempting refresh...');
                const refreshResult = await refreshSession();
                if (!refreshResult.success) {
                    // Full logout if refresh fails
                    setTokens(null, null);
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            }
        };

        initAuth();
    }, [getToken, fetchUserInfo, refreshSession, setTokens]);

    // Actions
    const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }

            // MFA Flow
            if (data.mfa_required) {
                // Docs: "Return 200 OK with { "mfa_required": true, "user": ... }"
                // We need to pass the userId to the next step
                return {
                    success: false,
                    mfaRequired: true,
                    preAuthToken: data.pre_auth_token,
                    userId: data.user?.id || data.user?.Id, // Capture ID for MFA
                };
            }

            // Success Flow
            const accessToken = data.AccessToken || data.access_token;
            const refreshToken = data.RefreshToken || data.refresh_token;

            setTokens(accessToken, refreshToken);

            // Optimized: Use user from response directly (Dual-Token System standard)
            // No need to call /me immediately
            let user = data.user;
            if (user) {
                // Normalize user structure if needed
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
                token: accessToken,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown login error'
            };
        }
    }, [setTokens]);

    const verifyMFA = useCallback(async (code: string, userId: string, preAuthToken?: string) => {
        try {
            // Docs: "Input: UserID + Code"
            // We send userId in body. use preAuthToken in Header IF required, but docs said Auth Header ❌.
            // We will stick to Docs: Body { userId, code }.
            // If legacy system needs header, we can add it safely.
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (preAuthToken) {
                headers['Authorization'] = `Bearer ${preAuthToken}`;
            }

            const response = await fetch(`${AUTH_API_URL}/mfa/verify`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    userId,
                    code
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'MFA failed');

            const accessToken = data.AccessToken || data.access_token;
            const refreshToken = data.RefreshToken || data.refresh_token;

            setTokens(accessToken, refreshToken);

            // MFA response should also contain user? If not, fetch it.
            let user = data.user;
            if (!user) {
                user = await fetchUserInfo(accessToken);
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
                token: accessToken,
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'MFA verification failed'
            };
        }
    }, [setTokens, fetchUserInfo]);

    const logout = useCallback(async () => {
        try {
            const token = getToken();
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                // Docs: "User requests Logout with Refresh Token" -> "Revokes the entire family"
                // Usually this means sending the refresh token to the logout endpoint
                await fetch(`${AUTH_API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass access token for context
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refresh_token: refreshToken })
                }).catch(console.error);
            }
        } finally {
            setTokens(null, null);
            setState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
            window.location.href = '/login';
        }
    }, [getToken, getRefreshToken, setTokens]);

    const fetchAccessToken = async () => getToken();

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
