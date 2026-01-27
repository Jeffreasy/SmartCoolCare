import { createAuthProxy } from '@/lib/authProxy';

export const POST = createAuthProxy({
    method: 'POST',
    endpoint: '/api/v1/auth/refresh', // ✅ Per integration_guide.md line 75
    requiresAuth: false
});
