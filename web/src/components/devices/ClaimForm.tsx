import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function ClaimForm() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const claimDevice = useMutation(api.devices.claim);

    const [deviceId, setDeviceId] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isAuthenticated) {
            setError("Je moet ingelogd zijn om te koppelen.");
            return;
        }

        setSubmitting(true);

        try {
            await claimDevice({ deviceId });
            setSuccess(true);
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 2000);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "Claim failed. Check ID.";
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center p-8 text-slate-400 animate-pulse">
                <p>Loading status...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-center p-4">
                <p className="text-danger mb-4 font-medium">You must be logged in to claim a device.</p>
                <a
                    href="/login"
                    className="inline-block px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors font-medium"
                >
                    Log in first
                </a>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center p-6 text-success animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Device Claimed!</h3>
                <p className="text-slate-400">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Device ID (Serial Number)</label>
                <input
                    type="text"
                    placeholder="e.g., koelkast-a-123"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                />
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
            >
                {submitting ? "Linking Device..." : "Link Device"}
            </button>
        </form>
    );
}
