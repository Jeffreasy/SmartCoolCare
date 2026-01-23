
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponsiveModal } from "./ui/Modal";
import { Cpu, CheckCircle } from "lucide-react";

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
        <ResponsiveModal isOpen={isOpen} onClose={handleClose}>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-primary/30">
                        {step === 3 ? (
                            <CheckCircle className="w-8 h-8 text-status-success" />
                        ) : (
                            <Cpu className="w-8 h-8 text-brand-primary" />
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
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-slate-600"
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
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 mt-2">This ensures you physically possess the device.</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg text-status-error text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {step === 1 && (
                            <>
                                <button onClick={handleClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all duration-200 font-medium cursor-pointer">Cancel</button>
                                <button onClick={handleNext} className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-brand-primary/20 cursor-pointer">Next</button>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all duration-200 font-medium cursor-pointer">Back</button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    Claim Device
                                </button>
                            </>
                        )}
                        {step === 3 && (
                            <button onClick={handleClose} className="w-full py-3 bg-status-success hover:bg-status-success/90 text-white rounded-lg transition-all duration-200 font-medium shadow-lg shadow-status-success/20 cursor-pointer">
                                Go to Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
