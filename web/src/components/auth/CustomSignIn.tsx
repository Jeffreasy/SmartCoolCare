import { useState, type FormEvent } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, KeyRound, ArrowRight } from 'lucide-react';

export default function CustomSignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMFA, setShowMFA] = useState(false);
    const [preAuthToken, setPreAuthToken] = useState('');
    const [userId, setUserId] = useState('');

    const { login, verifyMFA } = useCustomAuth();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.mfaRequired) {
                // Show MFA input
                setShowMFA(true);
                setPreAuthToken(result.preAuthToken || '');
                setUserId(result.userId || '');
                toast.info('Please enter your MFA code');
            } else if (result.success) {
                toast.success('Successfully logged in!');
                // Redirect to dashboard
                window.location.href = '/dashboard';
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMFASubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!mfaCode) {
            toast.error('Please enter your MFA code');
            return;
        }

        setIsLoading(true);

        try {
            await verifyMFA(mfaCode, userId, preAuthToken);
            toast.success('Successfully logged in!');
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('MFA verification error:', error);
            toast.error(error instanceof Error ? error.message : 'MFA verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (showMFA) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-glass ring-1 ring-white/5 relative overflow-hidden">
                    {/* Decorative gradient blob */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10" />

                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
                            <KeyRound className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-2">
                            Two-Factor Auth
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Enter the 6-digit code from your app
                        </p>
                    </div>

                    <form onSubmit={handleMFASubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="mfa-code" className="text-sm font-medium text-muted-foreground ml-1">
                                Security Code
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <input
                                    id="mfa-code"
                                    type="text"
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    placeholder="000000"
                                    maxLength={6}
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-center text-2xl tracking-[0.5em] font-mono placeholder:tracking-normal"
                                    disabled={isLoading}
                                    autoComplete="one-time-code"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify Identity'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowMFA(false);
                                setMfaCode('');
                                setPreAuthToken('');
                            }}
                            className="w-full text-sm text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        >
                            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto perspective-1000">
            <div className="bg-card/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-glass ring-1 ring-white/5 relative overflow-hidden transition-all duration-500 hover:shadow-glow/20">
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full blur-3xl -z-10" />

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sign in to your IoT dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-muted-foreground ml-1">
                            Email Address
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 text-foreground"
                                disabled={isLoading}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                                Password
                            </label>
                            <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground/50 group-focus-within:text-primary transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-11 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 text-foreground"
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 group"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            'Signing in...'
                        ) : (
                            <span className="flex items-center gap-2">
                                Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Create account
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
