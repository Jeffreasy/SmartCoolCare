import { createAuthProxy } from '@/lib/authProxy';

export const POST = createAuthProxy({
    method: 'POST',
    endpoint: '/api/v1/auth/register',
    requiresAuth: false
});
