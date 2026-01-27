import type { APIRoute } from 'astro';

// Fallback for production stability
const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL || 'https://laventecareauthsystems.onrender.com';

export const prerender = false;

/**
 * Proxy for public tenant lookup
 * GET /api/v1/tenants/{slug}
 */
export const GET: APIRoute = async ({ params }) => {
    const { slug } = params;

    if (!slug) {
        return new Response(
            JSON.stringify({ error: 'Tenant slug is required' }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/api/v1/tenants/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('[Tenant Proxy] Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal proxy error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
