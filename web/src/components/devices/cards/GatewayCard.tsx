import type { GatewayHubDevice } from "@/domain/device-types";
import { StatusHeader, FooterMetrics } from "./SharedComponents";
import { Router } from "lucide-react";

interface GatewayCardProps {
    device: GatewayHubDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function GatewayCard({ device, onClick, onKeyDown }: GatewayCardProps) {
    const isOnline = device.lastDeviceStatus !== "offline";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`
                glass-card
                relative overflow-hidden
                p-4 sm:p-6
                cursor-pointer
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10
                group
                focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
        >
            {/* Decorative Glow Line (Purple for Gateway) */}
            <div className={`
                absolute top-0 left-0 bottom-0 w-1.5
                ${isOnline ? 'bg-gradient-to-b from-purple-400 to-violet-600' : 'bg-slate-700'}
                shadow-[0_0_15px_rgba(167,139,250,0.3)]
            `} />

            <StatusHeader device={device} isOnline={isOnline} />

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

            <FooterMetrics
                device={device}
                showBattery={false}
            />
        </div>
    );
}
