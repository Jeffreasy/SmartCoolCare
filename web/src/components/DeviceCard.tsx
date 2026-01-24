
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import DeviceDetailModal from "./DeviceDetailModal";
import { Cpu, Plus } from "lucide-react";
import { DeviceTypeIcon, SignalIcon, BatteryIcon } from "./ui/icons";
import { Button } from "@/components/ui/Button";

// --- Types ---

interface DeviceData {
    _id: string;
    displayName?: string;
    deviceId: string;
    deviceType?: string;
    lastDeviceStatus: string;
    lastSeenAt: number;
    lastWiredTemp?: number;
    lastBleTemp?: number;
    lastBleHumidity?: number;
    lastSignalStrength: number;
    lastBleBattery?: number;
}

// --- Helper Functions ---

function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// --- Sub-Components ---

interface SensorMetricProps {
    label: string;
    value?: number;
    unit?: string;
    colorClass: string;
    borderColorClass: string;
    bgClass: string; // e.g. bg-sensor-wired
}

const SensorMetric = ({ label, value, unit = "°C", colorClass, borderColorClass, bgClass }: SensorMetricProps) => (
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

const HumidityBanner = ({ value }: { value: number }) => (
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

const StatusHeader = ({ device, isOnline }: { device: DeviceData; isOnline: boolean }) => (
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

const FooterMetrics = ({ device, showBattery }: { device: DeviceData; showBattery: boolean }) => (
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

        {showBattery && (
            <div className="flex justify-between items-center">
                <span className="text-slate-500 text-xs font-medium">Battery (BLE)</span>
                <div className="flex items-center gap-2">
                    <BatteryIcon level={device.lastBleBattery!} />
                </div>
            </div>
        )}
    </div>
);

// --- Main Component ---

interface DeviceCardProps {
    onAddDevice?: () => void;
}

export default function DeviceCard(props: DeviceCardProps) {
    // Explicitly cast the query result for better internal safety if needed, 
    // though Convex types usually infer correctly.
    const devices = useQuery(api.sensors.getLiveSensors);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    const selectedDevice = devices?.find(d => d._id === selectedDeviceId) || null;

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!devices) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Laden van devices...</p>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="glass-card p-8 text-center max-w-md mx-auto mt-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">No Devices Linked</h3>
                <p className="text-slate-500 mb-6">Je hebt nog geen apparaten aan je account toegevoegd.</p>
                <Button onClick={props.onAddDevice} className="w-full gap-2">
                    <Plus className="w-5 h-5" />
                    Nieuw Apparaat Koppelen
                </Button>
            </div>
        );
    }

    const handleCardClick = (deviceId: string) => {
        if (isMobile) {
            // Navigate to dedicated page on mobile
            window.location.assign(`/devices/${deviceId}`);
        } else {
            // Open modal on desktop
            setSelectedDeviceId(deviceId);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, deviceId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(deviceId);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    // Safe casting or duck typing if the API return type is loose
                    const d = device as unknown as DeviceData;
                    const isOnline = d.lastDeviceStatus !== "offline";
                    const showBattery = d.lastBleBattery !== undefined;

                    return (
                        <div
                            key={d._id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleCardClick(d._id)}
                            onKeyDown={(e) => handleKeyDown(e, d._id)}
                            className={`
                                glass-card
                                relative overflow-hidden
                                p-4 sm:p-6
                                cursor-pointer
                                transition-all duration-300
                                hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10
                                group
                                focus:outline-none focus:ring-2 focus:ring-primary/50
                            `}
                        >
                            {/* Decorative Glow Line */}
                            <div className={`
                                absolute top-0 left-0 bottom-0 w-1.5
                                ${isOnline ? 'bg-gradient-to-b from-status-online to-emerald-600' : 'bg-slate-700'}
                                shadow-[0_0_15px_rgba(52,211,153,0.3)]
                            `} />

                            <StatusHeader device={d} isOnline={isOnline} />

                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pl-3">
                                <SensorMetric
                                    label="WIRED"
                                    value={d.lastWiredTemp}
                                    colorClass="text-sensor-wired"
                                    borderColorClass="border-sensor-wired/10"
                                    bgClass="bg-sensor-wired"
                                />
                                <SensorMetric
                                    label="WIRELESS"
                                    value={d.lastBleTemp}
                                    colorClass="text-sensor-wireless"
                                    borderColorClass="border-sensor-wireless/10"
                                    bgClass="bg-sensor-wireless"
                                />
                                {d.lastBleHumidity !== undefined && (
                                    <HumidityBanner value={d.lastBleHumidity} />
                                )}
                            </div>

                            <FooterMetrics device={d} showBattery={showBattery} />
                        </div>
                    );
                })}
            </div>

            {selectedDevice && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={() => setSelectedDeviceId(null)}
                />
            )}
        </>
    );
}
