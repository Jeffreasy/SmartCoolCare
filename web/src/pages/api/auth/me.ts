import { createAuthProxy } from '@/lib/authProxy';

export const GET = createAuthProxy({
    method: 'GET',
    endpoint: '/api/v1/me', // ✅ CORRECTION: Backend uses /api/v1/me, not /auth/me
    requiresAuth: false // ✅ FIXED: Auth is handled via Cookie (Backend), not Authorization header (Proxy)
});
