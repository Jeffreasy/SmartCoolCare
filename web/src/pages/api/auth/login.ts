import type { APIRoute } from 'astro';

const AUTH_API_URL = import.meta.env.PUBLIC_AUTH_API_URL || 'https://laventecareauthsystems.onrender.com';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        // Forward the request to LaventeCare Auth backend
        const response = await fetch(`${AUTH_API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
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
        console.error('Login proxy error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
