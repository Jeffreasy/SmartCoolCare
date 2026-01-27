import type { APIRoute } from 'astro';

// Fallback is critical for production stability if env var is missing
const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL || 'https://laventecareauthsystems.onrender.com';

interface AuthProxyOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    requiresAuth?: boolean;
}

/**
 * Creates a standard API proxy handler for LaventeCare Auth
 */
export const createAuthProxy = ({ method, endpoint, requiresAuth = false }: AuthProxyOptions): APIRoute => {
    return async ({ request }) => {
        try {
            // 1. Handle Encryption/Auth Headers
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            // Forward Security Headers (CSRF, Tenant)
            const csrfToken = request.headers.get('X-CSRF-Token');
            if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

            const tenantId = request.headers.get('X-Tenant-ID');
            if (tenantId) headers['X-Tenant-ID'] = tenantId;

            if (requiresAuth) {
                const authHeader = request.headers.get('Authorization');
                if (!authHeader) {
                    return new Response(JSON.stringify({ error: 'Authorization header required' }), {
                        status: 401,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
                headers['Authorization'] = authHeader;
            }

            // 2. Prepare Request Body (for non-GET)
            let body: string | undefined = undefined;
            if (method !== 'GET') {
                try {
                    // Clone request to avoid "Body is unusable" error if already read
                    const json = await request.clone().json();
                    body = JSON.stringify(json);
                } catch (e) {
                    // If body parsing fails (e.g. empty body on POST), ignore or handle specific cases
                    // Some POST endpoints might not need a body
                }
            }

            // 3. Forward Request to Backend
            const targetUrl = `${AUTH_API_URL}${endpoint}`;

            const response = await fetch(targetUrl, {
                method,
                headers,
                body,
                credentials: 'include', // Important for cookies/sessions if used
            });

            // 4. Handle Response
            // STRICT IMPLEMENTATION (Law 1) - but allow text/plain for error codes
            const contentType = response.headers.get('content-type');
            let data;

            if (response.status === 204) {
                return new Response(null, { status: 204 });
            } else if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON, it might be an empty 200 OK or an error response
                const text = await response.text();

                if (!text || text.trim().length === 0) {
                    // Safe violation: Empty body. Treat as success/null.
                    data = null;
                } else if (response.status === 401 || response.status === 403) {
                    // Authentication/Authorization errors can be text/plain (common backend pattern)
                    data = { error: text };
                } else {
                    // Unsafe violation: Non-empty body with no/wrong header. Potential XSS/Sniffing risk.
                    console.error('❌ Backend Violation: Expected JSON, got', contentType, text.substring(0, 50));
                    throw new Error('Invalid Backend Response: Missing JSON Header');
                }
            }

            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        } catch (error) {
            console.error(`[Proxy] Error forwarding to ${endpoint}:`, error);
            return new Response(
                JSON.stringify({ error: 'Internal proxy server error' }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }
    };
};
