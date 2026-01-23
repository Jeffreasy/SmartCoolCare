import { Snowflake, Wine, Activity, Refrigerator } from "lucide-react";

export interface DeviceTypeIconProps {
    type?: string;
    className?: string; // Allow passing standard className support
}

export function DeviceTypeIcon({ type, className = "w-5 h-5" }: DeviceTypeIconProps) {
    switch (type?.toLowerCase()) {
        case 'freezer':
            return <Snowflake className={className} />;
        case 'wine':
            return <Wine className={className} />;
        case 'medical':
            return <Activity className={className} />;
        default: // Fridge
            return <Refrigerator className={className} />;
    }
}

export function SignalIcon({ rssi }: { rssi: number }) {
    let bars = 0;
    let color = "text-red-500";
    if (rssi > -50) { bars = 4; color = "text-emerald-400"; }
    else if (rssi > -60) { bars = 3; color = "text-emerald-400"; }
    else if (rssi > -70) { bars = 2; color = "text-yellow-400"; }
    else if (rssi > -80) { bars = 1; color = "text-orange-400"; }

    return (
        <div className="flex items-end gap-[2px]" title={`Signal: ${rssi} dBm`}>
            {[1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    className={`w-1 rounded-sm ${i <= bars ? color : 'bg-slate-700'}`}
                    style={{ height: `${i * 3 + 2}px` }}
                />
            ))}
        </div>
    );
}

export function BatteryIcon({ level }: { level: number }) {
    let color = "text-emerald-400";
    if (level < 20) color = "text-red-500";
    else if (level < 50) color = "text-yellow-400";

    return (
        <div className="flex items-center gap-1" title={`Battery: ${level}%`}>
            <div className={`relative w-5 h-3 border-2 ${color} rounded-sm p-[1px]`}>
                <div className={`h-full ${color} bg-current`} style={{ width: `${Math.max(5, level)}%` }}></div>
            </div>
            <div className={`w-[2px] h-1.5 ${color} rounded-r-sm`}></div>
            <span className={`text-xs ml-1 ${color}`}>{level}%</span>
        </div>
    );
}
