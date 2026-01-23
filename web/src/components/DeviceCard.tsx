
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
                            glass-card p-6 cursor-pointer transition-all duration-300 hover:shadow-glow
                            border-l-4 ${isOnline ? 'border-l-emerald-500' : 'border-l-red-500'}
                            group relative overflow-hidden
                        `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate pr-4 flex items-center gap-2">
                                    <DeviceTypeIcon type={device.deviceType} />
                                    {device.displayName || device.deviceId}
                                </h3>
                                <span className={`
                                px-3 py-1 rounded-full text-xs font-semibold
                                ${isOnline
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'}
                            `}>
                                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                            {/* Summary Metrics */}
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm items-center">
                                    <span className="text-slate-400">Last Seen:</span>
                                    <span className="text-slate-300 font-medium">
                                        {timeAgo(device.lastSeenAt)}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500">Signal</span>
                                        <SignalIcon rssi={device.lastSignalStrength} />
                                    </div>
                                    {showBattery && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Battery (BLE)</span>
                                            <BatteryIcon level={device.lastBleBattery!} />
                                        </div>
                                    )}
                                </div>
                            </div>
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


