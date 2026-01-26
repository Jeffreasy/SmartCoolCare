import { useAuth } from '@/components/auth/AuthContext';

/**
 * Re-export the useAuth hook as useCustomAuth for backward compatibility
 * validation during the refactor, or simply redirect to the new hook.
 *
 * @deprecated Use useAuth() from '@/components/auth/AuthContext' directly.
 */
export const useCustomAuth = () => {
    return useAuth();
};
