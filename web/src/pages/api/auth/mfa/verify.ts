import type { APIRoute } from 'astro';

const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL || 'https://laventecareauthsystems.onrender.com';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
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
        const response = await fetch(`${AUTH_API_URL}/api/v1/auth/mfa/verify`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('MFA verify proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
