import { atom, map } from 'nanostores';
import { api } from '@/lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

export const $user = atom<User | null>(null);
export const $isAuthenticated = atom<boolean>(false);
export const $isLoading = atom<boolean>(true);

/**
 * Initialize Auth: Fetch user profile
 * Call this in your Layout or root component
 */
export async function initAuth() {
    $isLoading.set(true);
    try {
        const response = await api('auth/me'); // Proxied request
        if (response.ok) {
            const userData = await response.json();
            $user.set(userData);
            $isAuthenticated.set(true);
        } else {
            $user.set(null);
            $isAuthenticated.set(false);
        }
    } catch (err) {
        console.error('Auth Init Failed', err);
        $user.set(null);
        $isAuthenticated.set(false);
    } finally {
        $isLoading.set(false);
    }
}

/**
 * Logout: Call API and clear state
 */
export async function logout() {
    try {
        await api('auth/logout', { method: 'POST' });
    } catch (e) {
        console.error('Logout API failed', e);
    } finally {
        // Always clear local state
        $user.set(null);
        $isAuthenticated.set(false);
        // Optional: Redirect handled by caller or API client
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }
}
