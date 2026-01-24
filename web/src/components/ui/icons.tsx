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
    let color = "bg-status-error";

    // Fix: Handle 0, positive (invalid), or undefined values
    if (!rssi || rssi >= 0) {
        bars = 0;
        color = "bg-slate-700"; // Grey for unknown
    }
    // Adjusted thresholds for realistic real-world usage
    else if (rssi >= -60) { bars = 4; color = "bg-status-success"; } // Excellent
    else if (rssi >= -70) { bars = 3; color = "bg-status-success"; } // Good
    else if (rssi >= -80) { bars = 2; color = "bg-status-warning"; } // Fair
    else if (rssi >= -90) { bars = 1; color = "bg-status-error"; }   // Weak

    return (
        <div className="flex items-end gap-[2px]" title={`Signal: ${rssi} dBm`}>
            {[1, 2, 3, 4].map(i => (
                <div
                    key={i}
                    className={`w-1 rounded-sm ${i <= bars ? color : 'bg-white/10'}`}
                    style={{ height: `${i * 3 + 2}px` }}
                />
            ))}
        </div>
    );
}

export function BatteryIcon({ level }: { level: number }) {
    let color = "text-status-success";
    if (level < 20) color = "text-status-error";
    else if (level < 50) color = "text-status-warning";

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
