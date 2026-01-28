import { useState, type FormEvent } from 'react';

import { useStore } from '@nanostores/react';
import { $tenant, initTenant } from '@/lib/stores/tenantStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

const AUTH_API_URL = '/api/auth'; // Use Astro API proxy

export default function CustomSignUp() {
    const tenant = useStore($tenant); // Inject tenant store

    // Ensure tenant is loaded
    useState(() => { initTenant(); });


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const validatePassword = (pwd: string): string | null => {
        if (pwd.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(pwd)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(pwd)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(pwd)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
        if (!pwd) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 4) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password || !confirmPassword || !fullName) {
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        if (!tenant?.id) {
            toast.error('Tenant context not available. Please refresh the page.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${AUTH_API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Tenant-ID': tenant.id, // CRITICAL: Header, not body
                },
                credentials: 'include', // ✅ CRITICAL: For cookie-based auth
                body: JSON.stringify({
                    email,
                    password,
                    full_name: fullName,
                    // ✅ NO tenant_id in body (follows new API contract)
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setIsSuccess(true);
            toast.success('Account created! Please check your email to verify your account.');
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength(password);

    if (isSuccess) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            Check Your Email
                        </h1>
                        <p className="text-muted-foreground">
                            We've sent a verification link to <strong>{email}</strong>
                        </p>
                    </div>

                    <div className="space-y-4 text-sm text-muted-foreground text-left bg-background/50 p-4 rounded-lg">
                        <p>📧 Click the verification link in the email to activate your account.</p>
                        <p>⏱️ The link will expire in 24 hours.</p>
                        <p>🔍 Can't find it? Check your spam folder.</p>
                    </div>

                    <div className="mt-6">
                        <a href="/login" className="text-primary hover:underline font-medium">
                            Back to Sign In
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Create Account
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Join SmartCool Care to monitor your IoT devices
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            disabled={isLoading}
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-muted-foreground">Password Strength</span>
                                    <span className={`font-medium ${passwordStrength.label === 'Weak' ? 'text-red-500' :
                                        passwordStrength.label === 'Medium' ? 'text-yellow-500' :
                                            'text-green-500'
                                        }`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="w-full bg-background/50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
