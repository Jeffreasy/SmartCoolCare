import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { toast } from "sonner";
import { DeviceTypeIcon } from "../../../ui/icons";
import type { CoolCareDevice, SensorNodeDevice } from "@/domain/device-types";

interface DeviceSettingsTabProps {
    device: CoolCareDevice | SensorNodeDevice;
    isSensorNode?: boolean;
}

export default function DeviceSettingsTab({ device, isSensorNode = false }: DeviceSettingsTabProps) {
    const updateSettings = useMutation(api.devices.updateSettings);

    const [settingsForm, setSettingsForm] = useState({
        displayName: "",
        deviceType: "fridge",
        minTemp: -10,
        maxTemp: 10,
        tempOffsetWired: 0,
        tempOffsetBle: 0,
        sleepDuration: 300,
        scanDuration: 10,
    });

    useEffect(() => {
        if (device) {
            setSettingsForm({
                displayName: device.displayName || device.deviceId,
                deviceType: device.deviceType || "fridge",
                minTemp: (device as any).minTemp ?? -50,
                maxTemp: (device as any).maxTemp ?? 50,
                tempOffsetWired: (device as any).config?.tempOffsetWired ?? 0,
                tempOffsetBle: (device as any).config?.tempOffsetBle ?? 0,
                sleepDuration: (device as any).sleepDuration ?? 300,
                scanDuration: (device as any).scanDuration ?? 10,
            });
        }
    }, [device]);

    const handleSaveSettings = async () => {
        if (!device) return;
        try {
            await updateSettings({
                deviceId: device.deviceId,
                displayName: settingsForm.displayName,
                deviceType: isSensorNode ? device.deviceType : settingsForm.deviceType, // Preserve type for sensors if needed, or update if we allow it
                // For sensor modes, we might not want to change 'deviceType' via UI if it's fixed, but backend handles it.
                // If not sensor, we pass strict types.
                minTemp: Number(settingsForm.minTemp),
                maxTemp: Number(settingsForm.maxTemp),
                tempOffsetWired: isSensorNode ? 0 : Number(settingsForm.tempOffsetWired),
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

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-8">
            <section>
                <h3 className="text-lg font-bold text-foreground mb-6 border-b border-border pb-3">Device Identity</h3>
                <div className="grid gap-8">
                    <div>
                        <label className="block text-base font-medium text-foreground mb-3">Device Name</label>
                        <input
                            type="text"
                            value={settingsForm.displayName}
                            onChange={(e) => setSettingsForm({ ...settingsForm, displayName: e.target.value })}
                            className="w-full bg-input border border-border rounded-xl px-4 py-4 text-base text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                            placeholder={isSensorNode ? "e.g. Living Room Sensor" : "e.g. Kitchen Fridge"}
                        />
                    </div>
                    {!isSensorNode && (
                        <div>
                            <label className="block text-base font-medium text-foreground mb-3">Device Type</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['fridge', 'freezer', 'wine'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSettingsForm({ ...settingsForm, deviceType: type })}
                                        className={`flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer touch-manipulation active:scale-95 ${settingsForm.deviceType === type
                                            ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20'
                                            : 'bg-card border-border text-muted-foreground hover:border-accent hover:bg-accent/50'
                                            }`}
                                    >
                                        <div className="scale-125"><DeviceTypeIcon type={type} /></div>
                                        <span className="capitalize font-medium text-sm md:text-base">{type}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
                    {!isSensorNode && (
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
                    )}
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
                    </button>
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
    );
}
