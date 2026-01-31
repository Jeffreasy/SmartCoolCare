import { navigate } from 'astro:transitions/client';

export const API_URL = import.meta.env.PUBLIC_API_URL;
export const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;

interface FetchOptions extends RequestInit {
    skipRefresh?: boolean;
}

/**
 * Helper to read CSRF token from cookies (if not using HttpOnly for it)
 * or getting it from a meta tag if you implemented the Meta Tag pattern.
 * LaventeCare standard: CSRF cookie is readable (HttpOnly: false).
 */
function getCsrfToken(): string {
    if (typeof document === 'undefined') return '';
    return document.cookie.match(/(^|;)\s*csrf_token=([^;]+)/)?.[2] || '';
}

/**
 * Central API Client for LaventeCare
 * - Enforces credentials: 'include'
 * - Injects X-Tenant-ID
 * - Injects X-CSRF-Token (for mutation requests)
 * - Handles 401 Silent Refresh
 */
export async function api(endpoint: string, { headers, ...customConfig }: FetchOptions = {}) {
    // 1. Prepare Headers
    const baseHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
    };

    // Inject CSRF Token for state-changing methods
    if (customConfig.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(customConfig.method.toUpperCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            (baseHeaders as Record<string, string>)['X-CSRF-Token'] = csrfToken;
        }
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...baseHeaders,
            ...headers,
        },
        credentials: 'include', // CRITICAL: Send cookies with every request
    };

    // 2. Execute Request
    // We use the proxy path or direct URL?
    // If we utilize the "Universal Proxy" pattern, we should hit local /api/...
    // But the user prompt says: "PUBLIC_API_URL" is the "burcht".
    // AND "De API Client... heeft een centrale functie nodig".
    // IF we use BFF Proxy, we point to `/api/${endpoint}`.
    // IF we talk directly to Backend (CORS allow), we point to `${API_URL}/${endpoint}`.
    // Given the "Dual-Token" model description involving "Set-Cookie headers", 
    // and the environment config pointing to an external API URL,
    // typically with credentials='include', we need to match the domain OR use a proxy.
    // The user explicitly mentioned "Frontend slaan we geen tokens op... Backend plaatst tokens...".
    // AND "Environment Config... PUBLIC_API_URL".
    // If we are on localhost:4321, and API is api.jouw-domein.com, we CANNOT share cookies easily without SameSite=None + Secure.
    // The Proxy resolves this.
    // So the Fetcher should ideally point to the PROXY URL (relative `/api/...`), OR strictly follow the user instructions.
    // The User wrote: "PUBLIC_API_URL='https://api.jouw-domein.com/api/v1'"
    // If I use that directly, credentials: 'include' will fail on localhost unless the backend sends SameSite=None.
    // The Knowledge Item strongly suggests "Universal BFF Proxy".
    // So I will make this client point to the local `/api` route which then proxies.

    // Correction: The USER said "X-Tenant-ID: import.meta.env.PUBLIC_TENANT_ID".
    // If we go through proxy, the PROXY should inject that, or we inject it and Proxy forwards it.
    // Let's assume we send it to Proxy, and Proxy forwards it.

    // NOTE: To support both Proxy and Direct usage, I'll define the base. 
    // But for now, to ensure the cookies work on localhost, I'll aim for the proxy path if on dev, or just standard if prod?
    // Let's stick to the simplest interpretation: The Browser calls the URL.
    // If we have a proxy at /api, we should use it. 
    // Let's use `${endpoint}` if it starts with /, assuming relative to root (proxy).
    // OR use the full URL if provided.

    // WAIT. If I set PUBLIC_API_URL to the real backend, and I fetch THAT, the cookies won't stick on localhost (different domains).
    // The user's roadmap Step B says: "Omdat Astro ook SSR doet...".
    // Step A says "API Client".
    // I will implement it to call the endpoint passed. 
    // But strictly, to make "Dual Token" work on localhost, we usually need the proxy.
    // I will code it to use the `PUBLIC_API_URL` by default BUT... the user asked for Proxy in later steps.
    // Actually, I'll point it to `/api/${endpoint}` (The BFF Proxy) to be safe, 
    // but the user gave `PUBLIC_API_URL`.
    // Let's check `src/pages/api/[...path].ts` plan. It forwards `/api/*` to `PUBLIC_API_URL`.
    // So the client should call `/api/...`.

    // However, I will check if the endpoint is already a full URL.

    const isFullUrl = endpoint.startsWith('http');
    // If we implement the proxy, we want clients to use relative paths like 'v1/auth/me'.
    // And we prepend '/api/'.

    let url = endpoint;
    if (!isFullUrl) {
        // Ensure we don't double slash
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        url = `/api/${cleanEndpoint}`;
    }

    let response = await fetch(url, config);

    // 3. Auto-Refresh Logic (Interceptor)
    if (response.status === 401 && !customConfig.skipRefresh) {
        console.warn('🔒 401 detected. Attempting silent refresh...');

        // Attempt Refresh
        try {
            // We call the refresh endpoint. 
            // Ensuring we don't loop indefinitely by passing skipRefresh: true
            // The refresh endpoint path depends on the backend. 
            // User said: "/auth/refresh" or "/api/v1/auth/refresh".
            // We'll try the standard LaventeCare path or the one defined in user request.
            // User request: "wordt automatisch gebruikt door de /refresh endpoint" and "client automatisch /auth/refresh aanroepen".
            const refreshResponse = await api('v1/auth/refresh', {
                method: 'POST',
                skipRefresh: true
            });

            if (refreshResponse.ok) {
                console.log('✅ Refresh successful. Retrying original request...');
                // Retry original request with the new cookies (which are auto-attached by browser)
                return api(endpoint, customConfig);
            } else {
                console.error('❌ Refresh failed. Redirecting to login.');
                // If refresh fails, we are truly logged out.
                // Redirect to login
                if (typeof window !== 'undefined') {
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('❌ Refresh error:', error);
            if (typeof window !== 'undefined') {
                navigate('/login');
            }
        }
    }

    return response;
}
