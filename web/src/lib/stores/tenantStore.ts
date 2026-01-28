import { atom } from 'nanostores';
import { TenantResolver, type TenantContext } from '../tenantResolver';

export const $tenant = atom<TenantContext | null>(null);
export const $tenantLoading = atom<boolean>(true);
export const $tenantError = atom<string | null>(null);

/**
 * Initialize Tenant State
 * Call this once at the root or in a layout
 */
export async function initTenant() {
    $tenantLoading.set(true);
    $tenantError.set(null);
    try {
        const tenant = await TenantResolver.resolveFromSubdomain();
        $tenant.set(tenant);
    } catch (error) {
        console.error('[TenantStore] Failed to resolve tenant:', error);
        $tenantError.set(error instanceof Error ? error.message : 'Unknown error');
        $tenant.set(null);
    } finally {
        $tenantLoading.set(false);
    }
}
