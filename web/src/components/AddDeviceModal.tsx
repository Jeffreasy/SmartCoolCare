
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface AddDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddDeviceModal({ isOpen, onClose }: AddDeviceModalProps) {
    const claimDevice = useMutation(api.devices.claim);

    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: ID, 2: MAC, 3: Success
    const [deviceId, setDeviceId] = useState("");
    const [macVerify, setMacVerify] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleNext = () => {
        if (!deviceId.trim()) {
            setError("Please enter a Device ID.");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleSubmit = async () => {
        if (!macVerify.trim()) {
            setError("Please verify the MAC address.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await claimDevice({
                deviceId: deviceId.trim(),
                macVerify: macVerify.trim(),
            });
            setStep(3);
        } catch (err: any) {
            console.error(err);
            // Convex errors often come as strings or objects, handle gracefully
            const msg = err.message || err.toString();
            // User-friendly error mapping
            if (msg.includes("Device ID not found")) setError("Device not found. Check the ID.");
            else if (msg.includes("MAC verification failed")) setError("MAC address incorrect.");
            else if (msg.includes("already linked")) setError("This device is already claimed.");
            else setError("Failed to claim device. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        // Reset state on close
        setStep(1);
        setDeviceId("");
        setMacVerify("");
        setError("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="glass-panel w-full max-w-md p-6 md:p-8 relative animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl bg-slate-900/95 rounded-2xl mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                        {step === 3 ? (
                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {step === 1 && "Add New Device"}
                        {step === 2 && "Security Verification"}
                        {step === 3 && "Device Added!"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-2">
                        {step === 1 && "Start by entering the unique ID found on your device label."}
                        {step === 2 && "Enter the last 6 characters of the MAC address for verification."}
                        {step === 3 && "Your dashboard is now receiving live telemetry."}
                    </p>
                </div>

                {/* Body */}
                <div className="space-y-6">
                    {step === 1 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Device ID</label>
                            <input
                                type="text"
                                placeholder="e.g. device_a8f9"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">MAC Verification</label>
                            <input
                                type="text"
                                placeholder="Last 4-6 characters (e.g. A1B2)"
                                value={macVerify}
                                onChange={(e) => setMacVerify(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 mt-2">This ensures you physically possess the device.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {step === 1 && (
                            <>
                                <button onClick={handleClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors font-medium">Cancel</button>
                                <button onClick={handleNext} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20">Next</button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors font-medium">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Claim Device
                                </button>
                            </>
                        )}
                        {step === 3 && (
                            <button onClick={handleClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors font-medium shadow-lg shadow-emerald-500/20">
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
