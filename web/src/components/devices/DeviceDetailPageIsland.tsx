import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexAuthProvider from "../ConvexAuthProvider";
import DeviceDetailView, { type Device } from "./DeviceDetailView";
import { ArrowLeft } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";

// Wrapper to provide Context providers
export default function DeviceDetailPageIsland({ deviceId }: { deviceId: string }) {
    return (
        <ConvexAuthProvider>
            <DeviceDetailPageContent deviceId={deviceId} />
        </ConvexAuthProvider>
    );
}

function DeviceDetailPageContent({ deviceId }: { deviceId: string }) {
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
    const devices = useQuery(api.sensors.getLiveSensors);

    // 1. Auth Loading
    if (isAuthLoading) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-4">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-sm font-mono">Authenticating...</p>
            </div>
        );
    }

    // 2. Unauthenticated
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-4 p-4 text-center">
                <h2 className="text-xl font-bold text-red-500">Access Denied</h2>
                <p className="text-muted-foreground">You must be logged in to view this device.</p>
                <a href="/login" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">Go to Login</a>
            </div>
        );
    }

    // 3. Data Loading (Auth done, query pending)
    if (devices === undefined) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background gap-4">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-sm font-mono">Loading Sensors...</p>
            </div>
        );
    }

    const device = devices.find(d => d._id === deviceId) as Device | undefined;

    if (!device) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background p-4 text-center">
                <h2 className="text-xl font-bold text-foreground mb-2">Device Not Found</h2>
                <p className="text-muted-foreground mb-6">Could not locate device with ID: <code className="block mt-2 bg-black/50 p-2 rounded">{deviceId}</code></p>
                <a href="/dashboard" className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium">
                    Back to Dashboard
                </a>
            </div>
        );
    }

    // ... Render content when ready ...
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3">
                <a href="/dashboard" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-6 h-6" />
                </a>
                <div>
                    <h1 className="text-lg font-bold text-foreground leading-tight">
                        {device.displayName || "Unknown Device"}
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono">
                        {device.deviceId}
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-12">
                <DeviceDetailView device={device} />
            </main>
        </div>
    );
}
