
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import TemperatureChart from "./TemperatureChart";
import { useState, useEffect } from "react";

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

function SignalIcon({ rssi }: { rssi: number }) {
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

function BatteryIcon({ level }: { level: number }) {
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

// Device Icon based on type
function DeviceTypeIcon({ type }: { type?: string }) {
    switch (type?.toLowerCase()) {
        case 'freezer':
            return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
        case 'wine':
            return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>; // Generic generic
        case 'medical':
            return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>; // Placeholder
        default: // Fridge
            return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
    }
}

interface DeviceCardProps {
    onAddDevice?: () => void;
}

export default function DeviceCard(props: DeviceCardProps) {
    const devices = useQuery(api.sensors.getLiveSensors);
    const updateSettings = useMutation(api.devices.updateSettings);

    const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        displayName: "",
        deviceType: "fridge",
        minTemp: -10,
        maxTemp: 10,
        tempOffsetWired: 0,
        tempOffsetBle: 0,
    });

    useEffect(() => {
        if (selectedDevice) {
            setSettingsForm({
                displayName: selectedDevice.displayName || selectedDevice.deviceId,
                deviceType: selectedDevice.deviceType || "fridge",
                minTemp: selectedDevice.minTemp ?? -50,
                maxTemp: selectedDevice.maxTemp ?? 50,
                tempOffsetWired: selectedDevice.config?.tempOffsetWired ?? 0,
                tempOffsetBle: selectedDevice.config?.tempOffsetBle ?? 0,
            });
        }
    }, [selectedDevice]);

    const handleSaveSettings = async () => {
        if (!selectedDevice) return;
        try {
            await updateSettings({
                deviceId: selectedDevice.deviceId,
                displayName: settingsForm.displayName,
                deviceType: settingsForm.deviceType,
                minTemp: Number(settingsForm.minTemp),
                maxTemp: Number(settingsForm.maxTemp),
                tempOffsetWired: Number(settingsForm.tempOffsetWired),
                tempOffsetBle: Number(settingsForm.tempOffsetBle),
            });
            // Ideally we'd optimize visually here, but React Query will refetch
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert("Failed to save settings. Please try again.");
        }
    };

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
                {/* Use callback if available, otherwise fallback (though primarily we want the modal) */}
                <button
                    onClick={props.onAddDevice}
                    className="btn-primary w-full text-center block pt-3 pb-3 rounded-lg"
                >
                    + Nieuw Apparaat Koppelen
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
                const isOnline = device.lastDeviceStatus !== "offline";
                const showBattery = device.lastBleBattery !== undefined;

                return (
                    <div
                        key={device._id}
                        onClick={() => {
                            setSelectedDevice(device);
                            setActiveTab('overview');
                        }}
                        className={`
                            glass-card p-6 cursor-pointer transition-all duration-300 hover:shadow-glow
                            border-l-4 ${isOnline ? 'border-l-success' : 'border-l-danger'}
                            group relative overflow-hidden
                        `}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold text-slate-100 group-hover:text-primary transition-colors truncate pr-4 flex items-center gap-2">
                                <DeviceTypeIcon type={device.deviceType} />
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
                        {/* Summary Metrics (Same as before) */}
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

            {selectedDevice && (
                <div
                    className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md md:p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedDevice(null)}
                >
                    <div
                        className="glass-panel w-full h-[90vh] md:h-[85vh] md:max-w-5xl p-0 relative animate-in slide-in-from-bottom-10 md:zoom-in-95 duration-200 border-t md:border border-white/10 shadow-2xl bg-slate-900/95 rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header & Navigation */}
                        <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/95 shrink-0 z-10">
                            <div className="flex justify-between w-full md:w-auto items-center">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                                        <DeviceTypeIcon type={selectedDevice.deviceType} />
                                        {selectedDevice.displayName || selectedDevice.deviceId}
                                    </h2>
                                    <p className="text-slate-400 text-xs md:text-sm font-mono mt-1">ID: {selectedDevice.deviceId}</p>
                                </div>
                                <button onClick={() => setSelectedDevice(null)} className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="flex w-full md:w-auto gap-2">
                                {/* Tab Navigation */}
                                <div className="flex flex-1 md:flex-none bg-slate-800 rounded-lg p-1">
                                    {(['overview', 'history', 'settings'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 md:flex-none px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setSelectedDevice(null)} className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white ml-2">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar pb-20 md:pb-6">

                            {/* TAB: OVERVIEW */}
                            {activeTab === 'overview' && (
                                <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Wired Sensor */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <svg className="w-24 h-24 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                                            </div>
                                            <h3 className="text-indigo-400 text-sm font-bold uppercase mb-1">Wired Sensor</h3>
                                            <div className="text-4xl font-mono font-bold text-white">
                                                {selectedDevice.lastWiredTemp !== undefined ? `${selectedDevice.lastWiredTemp.toFixed(2)}°C` : '--'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-2">Offset: {selectedDevice.config?.tempOffsetWired || 0}°C</div>
                                        </div>
                                        {/* BLE Sensor */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <svg className="w-24 h-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <h3 className="text-emerald-400 text-sm font-bold uppercase mb-1">Wireless Sensor</h3>
                                            <div className="text-4xl font-mono font-bold text-white">
                                                {selectedDevice.lastBleTemp !== undefined ? `${selectedDevice.lastBleTemp.toFixed(2)}°C` : '--'}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium mt-2">
                                                {selectedDevice.lastBleHumidity !== undefined && <span className="text-sky-400">{selectedDevice.lastBleHumidity.toFixed(1)}% RH</span>}
                                                {selectedDevice.lastBleBattery !== undefined && <BatteryIcon level={selectedDevice.lastBleBattery} />}
                                            </div>
                                        </div>
                                        {/* Status */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                                            <h3 className="text-slate-400 text-sm font-bold uppercase mb-3">Status</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between"><span className="text-slate-400 text-sm">Condition</span><span className="text-white text-sm capitalize">{selectedDevice.lastDeviceStatus}</span></div>
                                                <div className="flex justify-between"><span className="text-slate-400 text-sm">Signal</span><div className="flex gap-2"><span className="text-white text-sm">{selectedDevice.lastSignalStrength} dBm</span><SignalIcon rssi={selectedDevice.lastSignalStrength} /></div></div>
                                                <div className="flex justify-between"><span className="text-slate-400 text-sm">Last Seen</span><span className="text-white text-sm">{timeAgo(selectedDevice.lastSeenAt)}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mini Chart Preview */}
                                    <div className="p-4 bg-slate-950/30 rounded-xl border border-white/5">
                                        <h4 className="text-sm font-semibold text-slate-300 mb-4">Quick History (Last 24h)</h4>
                                        <div className="h-[200px]"><TemperatureChart deviceName={selectedDevice.deviceId} /></div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: HISTORY */}
                            {activeTab === 'history' && (
                                <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold text-white mb-4">Temperature & Humidity Logs</h3>
                                    <div className="flex-1 bg-slate-950/30 rounded-xl border border-white/5 p-4 min-h-[300px]">
                                        <TemperatureChart deviceName={selectedDevice.deviceId} />
                                    </div>
                                </div>
                            )}

                            {/* TAB: SETTINGS */}
                            {activeTab === 'settings' && (
                                <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <section>
                                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">General Information</h3>
                                        <div className="grid gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Device Name</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.displayName}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, displayName: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Device Type</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['fridge', 'freezer', 'wine'].map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setSettingsForm({ ...settingsForm, deviceType: type })}
                                                            className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${settingsForm.deviceType === type
                                                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                                                : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/30'
                                                                }`}
                                                        >
                                                            <DeviceTypeIcon type={type} />
                                                            <span className="capitalize hidden md:inline">{type}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Alert Thresholds</h3>
                                        <p className="text-sm text-slate-500 mb-4">Receive notifications when temperature goes outside this range.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Min Temperature (°C)</label>
                                                <input
                                                    type="number"
                                                    value={settingsForm.minTemp}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, minTemp: Number(e.target.value) })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-sky-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Max Temperature (°C)</label>
                                                <input
                                                    type="number"
                                                    value={settingsForm.maxTemp}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, maxTemp: Number(e.target.value) })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Sensor Calibration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Wired Offset (°C)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={settingsForm.tempOffsetWired}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, tempOffsetWired: Number(e.target.value) })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-400 mb-2">Wireless Offset (°C)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={settingsForm.tempOffsetBle}
                                                    onChange={(e) => setSettingsForm({ ...settingsForm, tempOffsetBle: Number(e.target.value) })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <div className="flex justify-end pt-4 pb-12 md:pb-0">
                                        <button
                                            onClick={handleSaveSettings}
                                            className="w-full md:w-auto px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

