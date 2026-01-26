import { createAuthProxy } from '@/lib/authProxy';

export const POST = createAuthProxy({
    method: 'POST',
    endpoint: '/api/v1/auth/mfa/verify',
    requiresAuth: true
});
