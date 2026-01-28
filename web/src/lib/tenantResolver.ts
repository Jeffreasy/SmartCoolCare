/**
 * Tenant Resolution System
 * Resolves tenant slug → UUID via public API
 * Implements caching for performance
 */

export interface TenantContext {
    id: string;
    name: string;
    slug: string;
    branding?: {
        logo_url?: string;
        primary_color?: string;
        secondary_color?: string;
    };
}

export class TenantResolver {
    private static CACHE_KEY = 'tenant_context';
    private static CACHE_DURATION = 1000 * 60 * 60; // 1 hour
    // Use Astro proxy to avoid CORS issues
    private static API_URL = '/api/v1';

    /**
     * Resolve tenant slug to full context
     */
    static async resolve(slug: string): Promise<TenantContext> {
        // 1. Check cache first
        const cached = this.getFromCache();
        if (cached && cached.slug === slug && this.isCacheValid()) {
            console.log('[TenantResolver] Using cached tenant:', cached.name);
            return cached;
        }

        // 2. Fetch via proxy endpoint (avoids CORS)
        console.log('[TenantResolver] Fetching tenant:', slug);
        const response = await fetch(`${this.API_URL}/tenants/${slug}`);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(`Tenant not found: ${error.error || response.statusText}`);
        }

        const data = await response.json();

        const context: TenantContext = {
            id: data.id,
            name: data.name,
            slug: slug,
            branding: data.branding
        };

        // 3. Cache the result
        this.saveToCache(context);
        console.log('[TenantResolver] Tenant resolved:', context.name, `(${context.id})`);

        return context;
    }

    /**
     * Auto-resolve from current subdomain
     */
    static async resolveFromSubdomain(): Promise<TenantContext> {
        if (typeof window === 'undefined') {
            throw new Error('resolveFromSubdomain can only be called in browser');
        }

        const hostname = window.location.hostname;

        // Development fallback: localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Default to SmartCoolCare (Verified Render Production ID)
            const devTenantId = import.meta.env.PUBLIC_DEV_TENANT_ID || "7c1efbe8-d419-4127-9ea2-a6e67ed49a1f";
            const devTenantSlug = import.meta.env.PUBLIC_DEV_TENANT_SLUG || "smartcoolcare";

            console.warn('[TenantResolver] Using development tenant override:', devTenantSlug);
            return {
                id: devTenantId,
                name: 'SmartCoolCare',
                slug: devTenantSlug
            };
        }

        // Extract subdomain: bakkerij-jansen.laventecare.nl → bakkerij-jansen
        const parts = hostname.split('.');
        if (parts.length < 2) {
            throw new Error('Invalid hostname: cannot extract subdomain');
        }

        let slug = parts[0];

        // Handle www subdomain - map to smartcoolcare tenant for single-tenant deployment
        if (slug === 'www' || parts.length === 2) {
            console.log('[TenantResolver] WWW subdomain detected, mapping to smartcoolcare tenant');
            slug = 'smartcoolcare';
        }

        return this.resolve(slug);
    }

    /**
     * Get tenant from cache
     */
    static getFromCache(): TenantContext | null {
        if (typeof window === 'undefined') return null;

        const cached = localStorage.getItem(this.CACHE_KEY);
        if (!cached) return null;

        try {
            const data = JSON.parse(cached);
            return data.tenant || null;
        } catch {
            return null;
        }
    }

    /**
     * Check if cache is still valid
     */
    private static isCacheValid(): boolean {
        if (typeof window === 'undefined') return false;

        const cached = localStorage.getItem(this.CACHE_KEY);
        if (!cached) return false;

        try {
            const data = JSON.parse(cached);
            const timestamp = data.timestamp || 0;
            const age = Date.now() - timestamp;
            return age < this.CACHE_DURATION;
        } catch {
            return false;
        }
    }

    /**
     * Save tenant to cache
     */
    private static saveToCache(tenant: TenantContext): void {
        if (typeof window === 'undefined') return;

        const data = {
            tenant,
            timestamp: Date.now()
        };

        localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    }

    /**
     * Clear cached tenant
     */
    static clearCache(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.CACHE_KEY);
    }

    /**
     * Get current tenant ID (sync, from cache only)
     */
    static getCurrentTenantId(): string | null {
        const cached = this.getFromCache();
        return cached?.id || null;
    }
}
