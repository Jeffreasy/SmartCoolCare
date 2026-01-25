import { useState, type FormEvent } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export default function CustomSignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mfaCode, setMfaCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showMFA, setShowMFA] = useState(false);
    const [preAuthToken, setPreAuthToken] = useState('');

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
            await verifyMFA(mfaCode, preAuthToken);
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
                <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                            Two-Factor Authentication
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Enter the code from your authenticator app
                        </p>
                    </div>

                    <form onSubmit={handleMFASubmit} className="space-y-6">
                        <div>
                            <label htmlFor="mfa-code" className="block text-sm font-medium mb-2">
                                Authentication Code
                            </label>
                            <input
                                id="mfa-code"
                                type="text"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all text-center text-2xl tracking-widest font-mono"
                                disabled={isLoading}
                                autoComplete="one-time-code"
                                autoFocus
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowMFA(false);
                                setMfaCode('');
                                setPreAuthToken('');
                            }}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            ← Back to Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Sign in to your SmartCool Care account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            autoComplete="current-password"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <a href="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
