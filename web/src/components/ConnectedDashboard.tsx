import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DeviceCard from "./DeviceCard";
import DebugAuth from "./DebugAuth";
import { AuthIslandWrapper } from "@/components/providers/AuthIslandWrapper";
import ConvexClientProvider from "./ConvexClientProvider";
import AddDeviceModal from "./AddDeviceModal";
import CustomUserButton from "./ui/CustomUserButton";
import { useState } from "react";
import { Plus, Server, Activity, AlertTriangle, Thermometer } from "lucide-react";
import { useAuthSync } from "@/hooks/useAuthSync";

function StatCard({ label, value, subtext, icon, color }: { label: string, value: string | number, subtext?: string, icon: any, color: string }) {
    return (
        <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</div>
                {subtext && <p className={`text-[10px] sm:text-xs ${color} font-medium`}>{subtext}</p>}
            </div>
        </div>
    );
}

function DashboardContent() {
    // Auto-sync user from LaventeCare to Convex
    useAuthSync();

    // Secure: Use authenticated query
    const devices = useQuery(api.sensors.getLiveSensors);
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

    // Calculate Stats
    const stats = {
        total: 0,
        online: 0,
        attention: 0,
        avgWiredTemp: 0,
        avgBleTemp: 0,
        avgHumidity: 0
    };

    if (devices) {
        stats.total = devices.length;
        stats.online = devices.filter(d => d.lastDeviceStatus !== "offline" && d.lastDeviceStatus !== "unknown").length;
        stats.attention = devices.filter(d => {
            // 1. Critical Status
            if (d.lastDeviceStatus === "offline" || d.lastDeviceStatus === "warning") return true;

            // 2. Low Battery (< 20%)
            if (d.lastBleBattery !== undefined && d.lastBleBattery < 20) return true;

            // 3. Temperature Alerts (only if thresholds are set)
            const min = d.minTemp ?? -100; // Use lenient defaults if not set
            const max = d.maxTemp ?? 100;

            if (d.lastWiredTemp !== undefined && (d.lastWiredTemp < min || d.lastWiredTemp > max)) return true;
            if (d.lastBleTemp !== undefined && (d.lastBleTemp < min || d.lastBleTemp > max)) return true;

            return false;
        }).length;

        // Calculate Averages
        let totalWired = 0;
        let countWired = 0;
        let totalBle = 0;
        let countBle = 0;
        let totalHum = 0;
        let countHum = 0;

        devices.forEach(d => {
            // Wired Temp (DS18B20)
            if (d.lastWiredTemp !== undefined) {
                totalWired += d.lastWiredTemp;
                countWired++;
            }

            // BLE Temp
            if (d.lastBleTemp !== undefined) {
                totalBle += d.lastBleTemp;
                countBle++;
            }

            // Humidity
            if (d.lastBleHumidity !== undefined) {
                totalHum += d.lastBleHumidity;
                countHum++;
            }
        });

        if (countWired > 0) stats.avgWiredTemp = totalWired / countWired;
        if (countBle > 0) stats.avgBleTemp = totalBle / countBle;
        if (countHum > 0) stats.avgHumidity = totalHum / countHum;
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white">Your Devices</h2>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setIsAddDeviceOpen(true)}
                        className="flex-1 sm:flex-none justify-center px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-lg shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Device</span>
                    </button>
                    <span className="hidden sm:block w-px h-6 bg-white/10 mx-1"></span>
                    <span className="hidden sm:block text-sm text-slate-400">Manage Account</span>
                    <CustomUserButton />
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard
                    label="Total Devices"
                    value={stats.total}
                    color="text-brand-primary"
                    icon={<Server className="w-12 h-12" />}
                />
                <StatCard
                    label="Active & Online"
                    value={stats.online}
                    subtext={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% Operational`}
                    color="text-status-success"
                    icon={<Activity className="w-12 h-12" />}
                />
                <StatCard
                    label="Attention Needed"
                    value={stats.attention}
                    subtext={stats.attention > 0 ? "Check alerts below" : "All systems normal"}
                    color={stats.attention > 0 ? "text-status-error" : "text-status-success"}
                    icon={<AlertTriangle className="w-12 h-12" />}
                />
                <StatCard
                    label="Wired Avg."
                    value={stats.avgWiredTemp ? `${stats.avgWiredTemp.toFixed(1)}°C` : "--"}
                    subtext="DS18B20 Sensors"
                    color="text-sensor-wired"
                    icon={<Thermometer className="w-12 h-12" />}
                />
                <StatCard
                    label="Wireless Avg."
                    value={stats.avgBleTemp ? `${stats.avgBleTemp.toFixed(1)}°C` : "--"}
                    subtext="BLE Sensors"
                    color="text-sensor-wireless"
                    icon={<Thermometer className="w-12 h-12" />}
                />
                <StatCard
                    label="Avg. Humidity"
                    value={stats.avgHumidity ? `${stats.avgHumidity.toFixed(1)}%` : "--"}
                    subtext="BLE sensors only"
                    color="text-sensor-humidity"
                    icon={<span className="text-4xl">💧</span>}
                />
            </div>

            <DeviceCard onAddDevice={() => setIsAddDeviceOpen(true)} />
            <AddDeviceModal isOpen={isAddDeviceOpen} onClose={() => setIsAddDeviceOpen(false)} />
            {import.meta.env.DEV && <DebugAuth />}
        </>
    );
}

export default function ConnectedDashboard() {
    return (
        <AuthIslandWrapper>
            <ConvexClientProvider>
                <DashboardContent />
            </ConvexClientProvider>
        </AuthIslandWrapper>
    );
}
