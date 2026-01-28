import type { BaseDeviceData } from "@/domain/device-types";
import { StatusHeader, FooterMetrics } from "./SharedComponents";

export interface CardTheme {
    gradient: string; // e.g., "from-blue-400 to-indigo-600"
    shadow: string;   // e.g., "shadow-[0_0_15px_rgba(96,165,250,0.3)]"
    hoverShadow: string; // e.g., "hover:shadow-indigo-500/10"
}

export const REQUEST_THEMES: Record<string, CardTheme> = {
    cool: {
        gradient: "from-blue-400 to-indigo-600",
        shadow: "shadow-[0_0_15px_rgba(96,165,250,0.3)]",
        hoverShadow: "hover:shadow-indigo-500/10"
    },
    sensor: {
        gradient: "from-emerald-400 to-teal-600",
        shadow: "shadow-[0_0_15px_rgba(52,211,153,0.3)]",
        hoverShadow: "hover:shadow-emerald-500/10"
    },
    gateway: {
        gradient: "from-purple-400 to-violet-600",
        shadow: "shadow-[0_0_15px_rgba(167,139,250,0.3)]",
        hoverShadow: "hover:shadow-purple-500/10"
    }
};

interface BaseCardShellProps {
    device: BaseDeviceData;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    theme: CardTheme;
    children: React.ReactNode;
    showBattery?: boolean;
    batteryLevel?: number;
}

export function BaseCardShell({
    device,
    onClick,
    onKeyDown,
    theme,
    children,
    showBattery = true,
    batteryLevel
}: BaseCardShellProps) {
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
                hover:scale-[1.02] hover:shadow-2xl ${theme.hoverShadow}
                group
                focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
        >
            {/* Decorative Glow Line */}
            <div className={`
                absolute top-0 left-0 bottom-0 w-1.5
                ${isOnline ? `bg-gradient-to-b ${theme.gradient}` : 'bg-slate-700'}
                ${theme.shadow}
            `} />

            <StatusHeader device={device} isOnline={isOnline} />

            {children}

            <FooterMetrics
                device={device}
                showBattery={showBattery}
                batteryLevel={batteryLevel}
            />
        </div>
    );
}
