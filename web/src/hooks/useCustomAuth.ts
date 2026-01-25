import { useState, useEffect, useCallback } from 'react';

const AUTH_TOKEN_KEY = 'auth_token';
// Use Astro API proxy instead of direct backend calls (avoids CORS)
const AUTH_API_URL = '/api/auth';

interface User {
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

export function useCustomAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        token: null,
    });

    // Get token from localStorage
    const getToken = useCallback(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(AUTH_TOKEN_KEY);
    }, []);

    // Set token in localStorage
    const setToken = useCallback((token: string | null) => {
        if (typeof window === 'undefined') return;
        if (token) {
            localStorage.setItem(AUTH_TOKEN_KEY, token);
        } else {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }, []);

    // Fetch user info from /me endpoint (proxied to backend /api/v1/me)
    const fetchUserInfo = useCallback(async (token: string): Promise<User | null> => {
        try {
            console.log('[fetchUserInfo] Calling /me with token:', token?.substring(0, 20) + '...');

            const response = await fetch(`${AUTH_API_URL}/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            console.log('[fetchUserInfo] Response status:', response.status);

            if (!response.ok) {
                if (response.status === 401) {
                    // Token is invalid, clear it
                    console.error('[fetchUserInfo] Token invalid (401), clearing...');
                    setToken(null);
                    return null;
                }
                throw new Error('Failed to fetch user info');
            }

            const data = await response.json();
            // Backend returns nested structure: { user: {...}, tenant: {...} }
            const userData = data.user || data;
            console.log('[fetchUserInfo] User data received:', userData.email, 'Full data keys:', Object.keys(data));

            return {
                id: userData.id || userData.Id,
                email: userData.email || userData.Email,
                fullName: userData.full_name || userData.fullName || userData.FullName || userData.full_Name,
                role: userData.role || userData.Role,
                tenantId: userData.tenant_id || userData.tenantId || userData.TenantId || data.tenant?.id,
            };
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }, [setToken]);

    // Session rehydration on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getToken();

            if (!token) {
                setAuthState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    token: null,
                });
                return;
            }

            // Fetch user info to validate token
            const user = await fetchUserInfo(token);

            setAuthState({
                isAuthenticated: !!user,
                isLoading: false,
                user,
                token: user ? token : null,
            });
        };

        initAuth();
    }, [getToken, fetchUserInfo]);

    // Login function
    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch(`${AUTH_API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Check if MFA is required
            if (data.mfa_required) {
                return {
                    success: false,
                    mfaRequired: true,
                    preAuthToken: data.pre_auth_token,
                };
            }

            // Store the access token (LaventeCare uses PascalCase: AccessToken)
            const accessToken = data.AccessToken || data.access_token;
            console.log('[login] Received token from backend:', accessToken?.substring(0, 20) + '...', 'Full response keys:', Object.keys(data));
            setToken(accessToken);

            // Fetch user info
            console.log('[login] Fetching user info with token...');
            const user = await fetchUserInfo(accessToken);

            if (!user) {
                console.error('[login] Failed to fetch user info, auth state will be incomplete');
            }

            setAuthState({
                isAuthenticated: !!user,
                isLoading: false,
                user,
                token: accessToken,
            });

            return { success: true, mfaRequired: false };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, [setToken, fetchUserInfo]);

    // Verify MFA code
    const verifyMFA = useCallback(async (code: string, preAuthToken: string) => {
        try {
            const response = await fetch(`${AUTH_API_URL}/mfa/verify`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${preAuthToken}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ code }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'MFA verification failed');
            }

            // Store the access token (LaventeCare uses PascalCase: AccessToken)
            const accessToken = data.AccessToken || data.access_token;
            setToken(accessToken);

            // Fetch user info
            const user = await fetchUserInfo(accessToken);

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user,
                token: accessToken,
            });

            return { success: true };
        } catch (error) {
            console.error('MFA verification error:', error);
            throw error;
        }
    }, [setToken, fetchUserInfo]);

    // Logout function
    const logout = useCallback(async () => {
        try {
            const token = getToken();

            if (token) {
                // Call backend logout endpoint to revoke session
                await fetch(`${AUTH_API_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                }).catch(() => {
                    // Ignore errors, we're logging out anyway
                });
            }

            // Clear local state
            setToken(null);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if backend call fails
            setToken(null);
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                token: null,
            });
        }
    }, [getToken, setToken]);

    // Refresh session
    const refreshSession = useCallback(async () => {
        try {
            const response = await fetch(`${AUTH_API_URL}/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error('Session refresh failed');
            }

            const accessToken = data.access_token;
            setToken(accessToken);

            const user = await fetchUserInfo(accessToken);

            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                user,
                token: accessToken,
            });

            return { success: true };
        } catch (error) {
            console.error('Session refresh error:', error);
            // If refresh fails, log out
            logout();
            return { success: false };
        }
    }, [setToken, fetchUserInfo, logout]);

    return {
        ...authState,
        login,
        logout,
        verifyMFA,
        refreshSession,
        fetchAccessToken: async () => getToken(),
    };
}
