import { createAuthProxy } from '@/lib/authProxy';

export const GET = createAuthProxy({
    method: 'GET',
    endpoint: '/api/v1/me',
    requiresAuth: true
});
