import type { APIRoute } from 'astro';

const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL;

export const POST: APIRoute = async ({ request }) => {
    try {
        // Forward the request to LaventeCare Auth backend
        const response = await fetch(`${AUTH_API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Refresh proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
