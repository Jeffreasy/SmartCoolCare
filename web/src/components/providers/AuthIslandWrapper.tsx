import React, { type ReactNode } from 'react';
import { TenantProvider } from '@/contexts/TenantContext';
import { AuthProvider } from '@/components/auth/AuthContext';

/**
 * Compound Provider Wrapper
 * Wraps children in both TenantProvider and AuthProvider
 * 
 * CRITICAL: TenantProvider MUST be outer layer, as AuthProvider depends on tenant context
 * 
 * Usage in Islands:
 * ```tsx
 * <AuthIslandWrapper>
 *   <YourComponent />
 * </AuthIslandWrapper>
 * ```
 */
export function AuthIslandWrapper({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            <AuthProvider>
                {children}
            </AuthProvider>
        </TenantProvider>
    );
}

/**
 * Tenant-only wrapper for components that don't need auth
 * but do need tenant branding/context
 */
export function TenantIslandWrapper({ children }: { children: ReactNode }) {
    return (
        <TenantProvider>
            {children}
        </TenantProvider>
    );
}
