import type { APIRoute } from 'astro';

const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL;

export const GET: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Authorization header required' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Forward the request to LaventeCare Auth backend
        const response = await fetch(`${AUTH_API_URL}/api/v1/me`, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Backend returned non-JSON (probably plain text error)
            const text = await response.text();
            console.error('[/api/auth/me] Backend returned non-JSON:', text);
            data = { error: text || 'Invalid response from backend' };
        }

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Me proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
