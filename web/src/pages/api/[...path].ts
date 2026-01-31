import type { APIRoute } from 'astro';

export const ALL: APIRoute = async ({ request, params, url }) => {
    // 1. Resolve Target URL
    // We expect requests to /api/v1/... (via the proxy).
    // The params.path will capture everything after /api/
    const API_URL = import.meta.env.PUBLIC_API_URL; // e.g., https://api.domain.com/api/v1
    const path = params.path;

    // If PUBLIC_API_URL already contains /api/v1, we need to be careful not to duplicate.
    // However, usually API_URL is the BASE.
    // Knowledge Item example: `${API_URL}/api/${path}${url.search}`
    // But user .env says: PUBLIC_API_URL=".../api/v1"
    // And request might be /api/v1/auth/me?
    // Let's assume the Client sends `/api/auth/me` -> path="auth/me".
    // And we map to `${API_URL}/${path}`.

    // Clean trailing slash from API_URL
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const targetUrl = `${baseUrl}/${path}${url.search}`;

    // 2. Prepare Headers
    const requestHeaders = new Headers(request.headers);

    // Host header must be the target host, not localhost
    requestHeaders.delete('host');
    requestHeaders.delete('connection');

    // Inject Tenant ID if missing (though Client should send it)
    const TENANT_ID = import.meta.env.PUBLIC_TENANT_ID;
    if (!requestHeaders.has('X-Tenant-ID') && TENANT_ID) {
        requestHeaders.set('X-Tenant-ID', TENANT_ID);
    }

    // 3. Execute Request
    try {
        const backendResponse = await fetch(targetUrl, {
            method: request.method,
            headers: requestHeaders,
            body: request.body, // Stream the body directly
            // duplicate: 'half' // Node 18+ duplex? Astro might handle this.
            // On standard fetch, body can be a stream.
            // @ts-ignore - duplex is needed for some node versions with streaming bodies
            duplex: 'half'
        });

        // 4. Process Response Headers
        const responseHeaders = new Headers(backendResponse.headers);

        // Security: Delete internal headers if any
        responseHeaders.delete('content-length'); // Let the server recalculate
        responseHeaders.delete('content-encoding'); // We are transparent, but sometimes decoding happens

        // CORRECTION: Since we are running in Node (probably), fetch de-compresses. 
        // We shouldn't send content-encoding: gzip if we send plain text back.

        // 5. Cookie Sanitization (The "Localhost Fix")
        // We must ensure Set-Cookie works on localhost (http).
        // Secure cookies are rejected on http://localhost.
        // We iterate over Set-Cookie headers and rewrite them.

        const setCookie = backendResponse.headers.getSetCookie
            ? backendResponse.headers.getSetCookie()
            : backendResponse.headers.get('set-cookie');

        if (setCookie) {
            responseHeaders.delete('set-cookie');
            const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

            cookies.forEach(cookie => {
                let newCookie = cookie;
                // On localhost (dev), we strip 'Secure' and 'Partitioned' to ensure browser accepts it.
                // In production (https), we keep them.
                // We detect dev via import.meta.env.DEV
                if (import.meta.env.DEV) {
                    newCookie = newCookie.replace(/; Secure/gi, '');
                    newCookie = newCookie.replace(/; Partitioned/gi, '');

                    // CRITICAL: Force Path=/ so Middleware (SSR) can see it
                    newCookie = newCookie.replace(/;\s*Path=[^;]+/gi, '');
                    newCookie += '; Path=/';

                    // STRIP DOMAIN (Robust regex)
                    newCookie = newCookie.replace(/;\s*Domain=[^;]+/gi, '');
                    // Force SameSite=Lax
                    newCookie = newCookie.replace(/; SameSite=None/gi, '; SameSite=Lax');
                }
                responseHeaders.append('Set-Cookie', newCookie);
            });
        }

        return new Response(backendResponse.body, {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('[BFF] Proxy Error:', error);
        return new Response(JSON.stringify({ error: 'BFF Proxy Failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
