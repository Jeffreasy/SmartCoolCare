import { useEffect, useRef } from 'react';
import { checkAuth } from '@/lib/authStore';

export default function AuthInitializer() {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            checkAuth();
            initialized.current = true;
        }
    }, []);

    return null;
}
