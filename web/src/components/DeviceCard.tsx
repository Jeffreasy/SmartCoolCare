/**
 * DeviceCard - React Component
 * 
 * Toont real-time status van een koelkast device
 * Gebruikt Convex queries voor reactieve updates
 */
// Imports already present at top of file
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import TemperatureChart from "./TemperatureChart";
import { useState } from "react";


export default function DeviceCard() {
    const devices = useQuery(api.sensors.getLiveSensors);
    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

    if (!devices) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Laden van devices...</p>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="glass-card p-8 text-center max-w-md mx-auto mt-8">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">No Devices Linked</h3>
                <p className="text-slate-500 mb-6">Je hebt nog geen apparaten aan je account toegevoegd.</p>
                <a
                    href="/claim-device"
                    className="btn-primary w-full text-center block pt-3"
                >
                    + Nieuw Apparaat Koppelen
                </a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
                const isOnline = device.lastDeviceStatus !== "offline";
                return (
                    <div
                        key={device._id}
                        onClick={() => {
                            console.log("Opening details for:", device.deviceId);
                            setSelectedDevice(device);
                        }}
                        className={`
                            glass-card p-6 cursor-pointer transition-all duration-300 hover:shadow-glow
                            border-l-4 ${isOnline ? 'border-l-success' : 'border-l-danger'}
                            group
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">
                                {device.displayName || device.deviceId}
                            </h3>
                            <span className={`
                                px-3 py-1 rounded-full text-xs font-semibold
                                ${isOnline
                                    ? 'bg-success/10 text-success border border-success/20'
                                    : 'bg-danger/10 text-danger border border-danger/20'}
                            `}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Laatste contact:</span>
                                <span className="text-slate-300 font-medium">
                                    {new Date(device.lastSeenAt).toLocaleString('nl-NL')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <span className="text-primary text-sm font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                                Details bekijken <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </span>
                        </div>
                    </div>
                );
            })}

            {selectedDevice && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedDevice(null)}
                >
                    <div
                        className="glass-panel w-full max-w-4xl p-6 relative animate-in zoom-in-95 duration-200 border border-white/10 shadow-2xl bg-slate-900/90"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <h2 className="text-2xl font-bold text-slate-100">
                                {selectedDevice.displayName || selectedDevice.deviceId}
                            </h2>
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                                aria-label="Close details"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                            {/* Pass actual deviceId for data fetching */}
                            <TemperatureChart deviceName={selectedDevice.deviceId} />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedDevice(null)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors border border-white/10"
                            >
                                Sluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
