import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponsiveModal } from "./ui/Modal";
import TemperatureChart from "./TemperatureChart";
import type { Id } from "../../convex/_generated/dataModel";
import { Snowflake, Wine, Activity, Refrigerator, Cpu, Thermometer } from "lucide-react";
import { DeviceTypeIcon, SignalIcon, BatteryIcon } from "./ui/icons";

// Reusing icons from DeviceCard or duplicate? 
// Ideally we export them or make a shared UI component.
// For now, I will inline them or ask to export.
// Let's assume we can export them from DeviceCard or duplicate for speed, 
// then refactor later. Duplication is safer for now to avoid breaking DeviceCard exports.

// DeviceTypeIcon moved to ui/icons.tsx

// SignalIcon and BatteryIcon moved to ui/icons.tsx

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

// Strict Device Interface corresponding to Convex schema
interface Device {
    _id: Id<"devices">;
    _creationTime: number;
    deviceId: string;
    displayName?: string;
    deviceType: "fridge" | "freezer" | "wine";
    minTemp?: number;
    maxTemp?: number;
    lastSeenAt: number;
    lastDeviceStatus: "online" | "offline" | "warning";
    lastSignalStrength: number;
    lastWiredTemp?: number;
    lastBleTemp?: number;
    lastBleHumidity?: number;
    lastBleBattery?: number;
    sleepDuration?: number;  // Seconds
    scanDuration?: number;   // Seconds
    config?: {
        tempOffsetWired?: number;
        tempOffsetBle?: number;
    };
}

interface DeviceDetailModalProps {
    device: any; // Using any to accept the raw Convex object, but casting inside component
    onClose: () => void;
}

export default function DeviceDetailModal({ device: rawDevice, onClose }: DeviceDetailModalProps) {
    const device = rawDevice as Device; // Safe cast or structural usage
    const updateSettings = useMutation(api.devices.updateSettings);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

    // Settings Form State
    const [settingsForm, setSettingsForm] = useState({
        displayName: "",
        deviceType: "fridge",
        minTemp: -10,
        maxTemp: 10,
        tempOffsetWired: 0,
        tempOffsetBle: 0,
        sleepDuration: 300, // 5 minutes default
        scanDuration: 10,   // 10 seconds default
    });

    useEffect(() => {
        if (device) {
            setSettingsForm({
                displayName: device.displayName || device.deviceId,
                deviceType: device.deviceType || "fridge",
                minTemp: device.minTemp ?? -50,
                maxTemp: device.maxTemp ?? 50,
                tempOffsetWired: device.config?.tempOffsetWired ?? 0,
                tempOffsetBle: device.config?.tempOffsetBle ?? 0,
                sleepDuration: device.sleepDuration ?? 300,
                scanDuration: device.scanDuration ?? 10,
            });
        }
    }, [device]);

    const handleSaveSettings = async () => {
        if (!device) return;
        try {
            await updateSettings({
                deviceId: device.deviceId,
                displayName: settingsForm.displayName,
                deviceType: settingsForm.deviceType,
                minTemp: Number(settingsForm.minTemp),
                maxTemp: Number(settingsForm.maxTemp),
                tempOffsetWired: Number(settingsForm.tempOffsetWired),
                tempOffsetBle: Number(settingsForm.tempOffsetBle),
                sleepDuration: Number(settingsForm.sleepDuration),
                scanDuration: Number(settingsForm.scanDuration),
            });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings.");
        }
    };

    const HeaderTitle = (
        <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <DeviceTypeIcon type={device.deviceType} />
                {device.displayName || device.deviceId}
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-mono mt-0.5">ID: {device.deviceId}</p>
        </div>
    );

    return (
        <ResponsiveModal isOpen={!!device} onClose={onClose} title={HeaderTitle} desktopMaxWidth="max-w-5xl">
            {/* Tab Navigation */}
            <div className="flex w-full mb-6">
                <div className="flex w-full bg-muted/50 p-1 rounded-xl border border-border">
                    {(['overview', 'history', 'settings'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 min-h-[500px] max-h-[80vh] overflow-y-auto custom-scrollbar md:min-h-[600px] relative">
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Wired Sensor */}
                            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Cpu className="w-24 h-24 text-sensor-wired" strokeWidth={1} />
                                </div>
                                <h3 className="text-sensor-wired text-sm font-bold uppercase mb-1">Wired Sensor</h3>
                                <div className="text-4xl font-mono font-bold text-foreground">
                                    {device.lastWiredTemp !== undefined ? `${device.lastWiredTemp.toFixed(2)}°C` : '--'}
                                </div>
                                <div className="text-xs text-muted-foreground mt-2">Offset: {device.config?.tempOffsetWired || 0}°C</div>
                            </div>
                            {/* BLE Sensor */}
                            <div className="bg-card border border-border rounded-xl p-5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Thermometer className="w-24 h-24 text-sensor-wireless" strokeWidth={1} />
                                </div>
                                <h3 className="text-sensor-wireless text-sm font-bold uppercase mb-1">Wireless Sensor</h3>
                                <div className="text-4xl font-mono font-bold text-foreground">
                                    {device.lastBleTemp !== undefined ? `${device.lastBleTemp.toFixed(2)}°C` : '--'}
                                </div>
                                <div className="flex items-center gap-4 text-xs font-medium mt-2">
                                    {device.lastBleHumidity !== undefined && <span className="text-sensor-humidity">{device.lastBleHumidity.toFixed(1)}% RH</span>}
                                    {device.lastBleBattery !== undefined && <BatteryIcon level={device.lastBleBattery} />}
                                </div>
                            </div>
                            {/* Status */}
                            {/* Status */}
                            <div className="bg-card border border-border rounded-xl p-5">
                                <h3 className="text-muted-foreground text-sm font-bold uppercase mb-3">Status</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between"><span className="text-muted-foreground text-sm">Condition</span><span className="text-foreground text-sm capitalize">{device.lastDeviceStatus}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground text-sm">Signal</span><div className="flex gap-2"><span className="text-foreground text-sm">{device.lastSignalStrength} dBm</span><SignalIcon rssi={device.lastSignalStrength} /></div></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground text-sm">Last Seen</span><span className="text-foreground text-sm">{timeAgo(device.lastSeenAt)}</span></div>
                                </div>
                            </div>
                        </div>
                        {/* Mini Chart Preview */}
                        <div className="p-4 bg-card rounded-xl border border-border">
                            <h4 className="text-sm font-semibold text-muted-foreground mb-4">Quick History (Last 24h)</h4>
                            <div className="h-[200px]"><TemperatureChart deviceName={device.deviceId} minTemp={device.minTemp} maxTemp={device.maxTemp} /></div>
                        </div>
                    </div>
                )}

                {/* TAB: HISTORY */}
                {activeTab === 'history' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex-1 bg-slate-950/30 rounded-xl border border-white/5 p-4 min-h-[300px]">
                            <TemperatureChart deviceName={device.deviceId} minTemp={device.minTemp} maxTemp={device.maxTemp} />
                        </div>
                    </div>
                )}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
                        <section>
                            <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">General Information</h3>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Device Name</label>
                                    <input
                                        type="text"
                                        value={settingsForm.displayName}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, displayName: e.target.value })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Device Type</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['fridge', 'freezer', 'wine'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSettingsForm({ ...settingsForm, deviceType: type })}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${settingsForm.deviceType === type
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'bg-input border-border text-muted-foreground hover:border-accent'
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
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Min Temperature (°C)</label>
                                    <input
                                        type="number"
                                        value={settingsForm.minTemp}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, minTemp: Number(e.target.value) })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-sensor-humidity transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Max Temperature (°C)</label>
                                    <input
                                        type="number"
                                        value={settingsForm.maxTemp}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, maxTemp: Number(e.target.value) })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-status-error transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Sensor Calibration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Wired Offset (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={settingsForm.tempOffsetWired}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, tempOffsetWired: Number(e.target.value) })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Wireless Offset (°C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={settingsForm.tempOffsetBle}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, tempOffsetBle: Number(e.target.value) })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Measurement Frequency</h3>
                            <p className="text-sm text-slate-500 mb-4">Choose how often your device measures and reports data.</p>

                            {/* Preset Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Quick Test Preset */}
                                <button
                                    onClick={() => setSettingsForm({
                                        ...settingsForm,
                                        sleepDuration: 60,
                                        scanDuration: 10
                                    })}
                                    className={`p-5 rounded-xl border-2 transition-all text-left cursor-pointer ${settingsForm.sleepDuration === 60
                                        ? 'border-status-warning bg-status-warning/10 shadow-lg shadow-status-warning/20'
                                        : 'border-border bg-card hover:border-status-warning/50 hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">⚡</span>
                                        <div>
                                            <h4 className="font-bold text-foreground">Quick Test</h4>
                                            <p className="text-xs text-muted-foreground">Every 1 minute</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <p className="text-muted-foreground">📊 Very frequent data</p>
                                        <p className="text-status-warning">🔋 Heavy battery drain</p>
                                        <p className="text-muted-foreground">Best for: Testing & debugging</p>
                                    </div>
                                </button>

                                {/* Normal Preset */}
                                <button
                                    onClick={() => setSettingsForm({
                                        ...settingsForm,
                                        sleepDuration: 180,
                                        scanDuration: 10
                                    })}
                                    className={`p-5 rounded-xl border-2 transition-all text-left cursor-pointer ${settingsForm.sleepDuration === 180
                                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                                        : 'border-border bg-card hover:border-primary/50 hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">⚙️</span>
                                        <div>
                                            <h4 className="font-bold text-white">Normal</h4>
                                            <p className="text-xs text-slate-400">Every 3 minutes</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <p className="text-slate-400">📊 Balanced data</p>
                                        <p className="text-status-success">🔋 Moderate usage</p>
                                        <p className="text-slate-500">Best for: Daily monitoring</p>
                                    </div>
                                </button>

                                {/* Battery Saver Preset */}
                                <button
                                    onClick={() => setSettingsForm({
                                        ...settingsForm,
                                        sleepDuration: 300,
                                        scanDuration: 10
                                    })}
                                    className={`p-5 rounded-xl border-2 transition-all text-left cursor-pointer ${settingsForm.sleepDuration === 300
                                        ? 'border-status-success bg-status-success/10 shadow-lg shadow-status-success/20'
                                        : 'border-border bg-card hover:border-status-success/50 hover:bg-accent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-3xl">🔋</span>
                                        <div>
                                            <h4 className="font-bold text-white">Battery Saver</h4>
                                            <p className="text-xs text-slate-400">Every 5 minutes</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <p className="text-slate-400">📊 Sufficient data</p>
                                        <p className="text-status-success">🔋 Optimal battery life</p>
                                        <p className="text-slate-500">Best for: Long-term use</p>
                                    </div>
                                </button>
                            </div>

                            {/* Impact Preview */}
                            <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                                <h4 className="text-sm font-semibold text-slate-300 mb-3">Impact Preview</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">Data Frequency</p>
                                        <p className="text-white font-mono">
                                            Every {Math.floor(settingsForm.sleepDuration / 60)} min
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            ~{Math.floor((24 * 60) / (settingsForm.sleepDuration / 60))} readings/day
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">Battery Life</p>
                                        <p className="text-white font-mono">
                                            ~{Math.floor((settingsForm.sleepDuration / 300) * 8)} months
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {settingsForm.sleepDuration === 60 && '⚠️ Frequent charging needed'}
                                            {settingsForm.sleepDuration === 180 && '✓ Good balance'}
                                            {settingsForm.sleepDuration === 300 && '✓ Maximum efficiency'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">Network Usage</p>
                                        <p className="text-white font-mono">
                                            {settingsForm.sleepDuration <= 60 && 'High'}
                                            {settingsForm.sleepDuration > 60 && settingsForm.sleepDuration < 300 && 'Moderate'}
                                            {settingsForm.sleepDuration >= 300 && 'Low'}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            WiFi activations per day
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced: Custom Settings */}
                            <details className="mt-4">
                                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                    Advanced: Custom Settings
                                </summary>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Sleep Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            min="60"
                                            max="300"
                                            step="30"
                                            value={settingsForm.sleepDuration}
                                            onChange={(e) => setSettingsForm({
                                                ...settingsForm,
                                                sleepDuration: Number(e.target.value)
                                            })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                                            Scan Duration (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="15"
                                            value={settingsForm.scanDuration}
                                            onChange={(e) => setSettingsForm({
                                                ...settingsForm,
                                                scanDuration: Number(e.target.value)
                                            })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </details>
                        </section>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={handleSaveSettings}
                                className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ResponsiveModal>
    );
}
