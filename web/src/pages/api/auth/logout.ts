import type { APIRoute } from 'astro';

const AUTH_API_URL = 'https://laventecareauthsystems.onrender.com';

export const POST: APIRoute = async ({ request }) => {
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
        const response = await fetch(`${AUTH_API_URL}/api/v1/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
            },
        });

        // Logout usually returns 204 No Content or 200
        if (response.status === 204) {
            return new Response(null, { status: 204 });
        }

        const data = await response.json().catch(() => ({}));

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Logout proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
