
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import TemperatureChart from "./TemperatureChart";
import { useState, useEffect } from "react";
import DeviceDetailModal from "./DeviceDetailModal";
import { Cpu, Plus } from "lucide-react";
import { DeviceTypeIcon, SignalIcon, BatteryIcon } from "./ui/icons";

// Helper for relative time
function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// SignalIcon and BatteryIcon moved to ui/icons.tsx

interface DeviceCardProps {
    onAddDevice?: () => void;
}

export default function DeviceCard(props: DeviceCardProps) {
    const devices = useQuery(api.sensors.getLiveSensors);

    // Store ID instead of object to keep data fresh
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    // Derive the live device object from the query results
    const selectedDevice = devices?.find(d => d._id === selectedDeviceId) || null;

    // Only update when the device ID changes effectively
    const handleClose = () => setSelectedDeviceId(null);

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
                <button
                    onClick={props.onAddDevice}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                    <Plus className="w-5 h-5" />
                    Nieuw Apparaat Koppelen
                </button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    const isOnline = device.lastDeviceStatus !== "offline";
                    const showBattery = device.lastBleBattery !== undefined;

                    return (
                        <div
                            key={device._id}
                            onClick={() => {
                                setSelectedDeviceId(device._id);
                            }}
                            className={`
                            relative overflow-hidden
                            bg-slate-900/40 backdrop-blur-xl
                            border border-white/5
                            rounded-2xl
                            p-4 sm:p-6
                            cursor-pointer
                            transition-all duration-300
                            hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10
                            group
                        `}
                        >
                            {/* Decorative Glow Line */}
                            <div className={`
                                absolute top-0 left-0 bottom-0 w-1.5
                                ${isOnline ? 'bg-gradient-to-b from-status-online to-emerald-600' : 'bg-slate-700'}
                                shadow-[0_0_15px_rgba(52,211,153,0.3)]
                            `} />

                            {/* Header */}
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

                            {/* Main Telemetry Grid */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pl-3">
                                {/* Wired Sensor Box */}
                                <div className="bg-slate-950/60 rounded-xl p-2.5 sm:p-3 border border-sensor-wired/10 relative overflow-hidden group/wired">
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/wired:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sensor-wired shadow-[0_0_5px_currentColor]"></div>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] text-sensor-wired/60 uppercase font-black tracking-widest mb-1">WIRED</p>
                                    <p className={`text-xl sm:text-2xl font-mono font-bold tracking-tighter ${device.lastWiredTemp !== undefined ? 'text-sensor-wired' : 'text-slate-700'}`}>
                                        {device.lastWiredTemp !== undefined ? `${device.lastWiredTemp.toFixed(1)}°C` : '--'}
                                    </p>
                                </div>

                                {/* Wireless Sensor Box */}
                                <div className="bg-slate-950/60 rounded-xl p-2.5 sm:p-3 border border-sensor-wireless/10 relative overflow-hidden group/ble">
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/ble:opacity-100 transition-opacity">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sensor-wireless shadow-[0_0_5px_currentColor]"></div>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] text-sensor-wireless/60 uppercase font-black tracking-widest mb-1">WIRELESS</p>
                                    <p className={`text-xl sm:text-2xl font-mono font-bold tracking-tighter ${device.lastBleTemp !== undefined ? 'text-sensor-wireless' : 'text-slate-700'}`}>
                                        {device.lastBleTemp !== undefined ? `${device.lastBleTemp.toFixed(1)}°C` : '--'}
                                    </p>
                                </div>

                                {/* Humidity Banner */}
                                {device.lastBleHumidity !== undefined && (
                                    <div className="col-span-2 bg-gradient-to-r from-slate-950/80 to-slate-900/80 rounded-xl p-2.5 sm:p-3 border border-white/5 flex justify-between items-center group/hum">
                                        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">HUMIDITY</span>
                                        <div className="flex items-center gap-2 pr-1">
                                            <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]">💧</span>
                                            <span className="font-mono font-bold text-lg sm:text-xl text-sensor-humidity group-hover/hum:text-sky-300 transition-colors">
                                                {device.lastBleHumidity.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Summary Metrics */}
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
                                            <span className={`text-xs font-mono font-bold ${device.lastBleBattery! < 20 ? 'text-status-error' : 'text-status-success'}`}>
                                                {device.lastBleBattery}%
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div >

            {selectedDevice && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={() => setSelectedDeviceId(null)}
                />
            )
            }


        </>
    );
}
