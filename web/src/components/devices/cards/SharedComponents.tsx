import { DeviceTypeIcon, SignalIcon, BatteryIcon } from "@/components/ui/icons";
import type { BaseDeviceData } from "@/domain/device-types";

// --- Helper Functions ---

export function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// --- Shared Components ---

export interface SensorMetricProps {
    label: string;
    value?: number;
    unit?: string;
    colorClass: string;
    borderColorClass: string;
    bgClass: string; // e.g. bg-sensor-wired
}

export const SensorMetric = ({ label, value, unit = "°C", colorClass, borderColorClass, bgClass }: SensorMetricProps) => (
    <div className={`bg-slate-950/60 rounded-xl p-2.5 sm:p-3 border ${borderColorClass} relative overflow-hidden group/metric`}>
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/metric:opacity-100 transition-opacity">
            <div className={`w-1.5 h-1.5 rounded-full ${bgClass} shadow-[0_0_5px_currentColor]`}></div>
        </div>
        <p className={`text-[9px] sm:text-[10px] ${colorClass} opacity-60 uppercase font-black tracking-widest mb-1`}>
            {label}
        </p>
        <p className={`text-xl sm:text-2xl font-mono font-bold tracking-tighter ${value !== undefined ? colorClass : 'text-slate-700'}`}>
            {value !== undefined ? `${value.toFixed(1)}${unit}` : '--'}
        </p>
    </div>
);

export const HumidityBanner = ({ value }: { value: number }) => (
    <div className="col-span-2 bg-gradient-to-r from-slate-950/80 to-slate-900/80 rounded-xl p-2.5 sm:p-3 border border-white/5 flex justify-between items-center group/hum">
        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">HUMIDITY</span>
        <div className="flex items-center gap-2 pr-1">
            <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]">💧</span>
            <span className="font-mono font-bold text-lg sm:text-xl text-sensor-humidity group-hover/hum:text-sky-300 transition-colors">
                {value.toFixed(1)}%
            </span>
        </div>
    </div>
);

export const StatusHeader = ({ device, isOnline }: { device: BaseDeviceData; isOnline: boolean }) => (
    <div className="flex justify-between items-start mb-4 sm:mb-6 pl-3">
        <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-slate-800/50 rounded-lg border border-white/5">
                <DeviceTypeIcon type={device.deviceType} />
            </div>
            <div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight group-hover:text-brand-primary transition-colors">
                    {device.displayName || device.deviceId}
                </h3>
            </div>
        </div>
        <span className={`
            px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider
            border backdrop-blur-md
            ${isOnline
                ? 'bg-status-online/10 text-status-online border-status-online/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                : 'bg-status-offline/10 text-status-offline border-status-offline/20'}
        `}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
    </div>
);

export const FooterMetrics = ({ device, showBattery, batteryLevel }: { device: BaseDeviceData; showBattery: boolean; batteryLevel?: number }) => (
    <div className="pl-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/5 space-y-2 sm:space-y-3">
        <div className="flex justify-between text-sm items-center">
            <span className="text-slate-500 font-medium text-xs sm:text-sm">Last Seen:</span>
            <span className="text-slate-300 font-mono text-[10px] sm:text-xs bg-slate-800/50 px-2 py-0.5 rounded">
                {timeAgo(device.lastSeenAt)}
            </span>
        </div>

        <div className="flex justify-between items-center">
            <span className="text-slate-500 text-xs font-medium">Signal Strength</span>
            <div className="scale-90 origin-right opacity-80 group-hover:opacity-100 transition-opacity">
                <SignalIcon rssi={device.lastSignalStrength} />
            </div>
        </div>

        {showBattery && batteryLevel !== undefined && (
            <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium">Battery (BLE)</span>
                <div className="flex items-center gap-2">
                    <BatteryIcon level={batteryLevel} />
                </div>
            </div>
        )}
    </div>
);
