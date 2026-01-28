import type { GatewayHubDevice } from "@/domain/device-types";
import { BaseCardShell, REQUEST_THEMES } from "./BaseCardShell";
import { Router } from "lucide-react";

interface GatewayCardProps {
    device: GatewayHubDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function GatewayCard({ device, onClick, onKeyDown }: GatewayCardProps) {
    const isOnline = device.lastDeviceStatus !== "offline";

    return (
        <BaseCardShell
            device={device}
            onClick={onClick}
            onKeyDown={onKeyDown}
            theme={REQUEST_THEMES.gateway}
            showBattery={false}
        >
            <div className="flex flex-col items-center justify-center py-6 gap-4">
                <div className={`p-4 rounded-full bg-purple-500/10 border border-purple-500/20 ${isOnline ? 'animate-pulse' : ''}`}>
                    <Router className="w-8 h-8 text-purple-400" />
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">NETWORK STATUS</p>
                    <p className={`text-lg font-mono font-bold ${isOnline ? 'text-purple-400' : 'text-slate-500'}`}>
                        {isOnline ? 'ACTIVE' : 'DISCONNECTED'}
                    </p>
                </div>
            </div>
        </BaseCardShell>
    );
}
