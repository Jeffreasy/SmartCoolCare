import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { TenantResolver, type TenantContext as TenantContextType } from '@/lib/tenantResolver';

interface TenantProviderState {
    tenant: TenantContextType | null;
    isLoading: boolean;
    error: string | null;
}

interface TenantProviderValue extends TenantProviderState {
    refetch: () => Promise<void>;
}

const TenantContext = createContext<TenantProviderValue | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<TenantProviderState>({
        tenant: null,
        isLoading: true,
        error: null,
    });

    const fetchTenant = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const tenant = await TenantResolver.resolveFromSubdomain();
            setState({
                tenant,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to resolve tenant';
            console.error('[TenantProvider] Resolution failed:', errorMessage);

            setState({
                tenant: null,
                isLoading: false,
                error: errorMessage,
            });
        }
    };

    useEffect(() => {
        fetchTenant();
    }, []);

    const refetch = async () => {
        TenantResolver.clearCache();
        await fetchTenant();
    };

    const value: TenantProviderValue = {
        ...state,
        refetch,
    };

    return (
        <TenantContext.Provider value={value}>
            {children}
        </TenantContext.Provider>
    );
}

export function useTenant() {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
}
