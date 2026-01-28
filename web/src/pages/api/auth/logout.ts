import { createAuthProxy } from '@/lib/authProxy';

export const POST = createAuthProxy({
    method: 'POST',
    endpoint: '/api/v1/auth/logout',
    requiresAuth: false // ✅ FIXED: Auth is handled via Cookie (Backend)
});
