import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DeviceCard from "./DeviceCard";
import DebugAuth from "./DebugAuth";
import ConvexAuthProvider from "./ConvexAuthProvider";
import AddDeviceModal from "./AddDeviceModal";
import { useState } from "react";
import { Plus, Server, Activity, AlertTriangle, Thermometer } from "lucide-react";

function StatCard({ label, value, subtext, icon, color }: { label: string, value: string | number, subtext?: string, icon: any, color: string }) {
    return (
        <div className="glass-card p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="text-2xl font-bold text-white mb-1">{value}</div>
                {subtext && <p className={`text-xs ${color} font-medium`}>{subtext}</p>}
            </div>
        </div>
    );
}

function DashboardContent() {
    const devices = useQuery(api.sensors.getLiveSensors);
    const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);

    // Calculate Stats
    const stats = {
        total: 0,
        online: 0,
        attention: 0,
        avgTemp: 0
    };

    if (devices) {
        stats.total = devices.length;
        stats.online = devices.filter(d => d.lastDeviceStatus !== "offline" && d.lastDeviceStatus !== "unknown").length;
        stats.attention = devices.filter(d => d.lastDeviceStatus === "offline" || d.lastDeviceStatus === "degraded").length;

        const temps = devices
            .map(d => d.lastWiredTemp ?? d.lastBleTemp)
            .filter(t => t !== undefined && t !== null) as number[];

        if (temps.length > 0) {
            stats.avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        }
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-white">Your Devices</h2>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => setIsAddDeviceOpen(true)}
                        className="flex-1 sm:flex-none justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Device</span>
                    </button>
                    <span className="hidden sm:block w-px h-6 bg-white/10 mx-1"></span>
                    <span className="hidden sm:block text-sm text-slate-400">Manage Account</span>
                    <UserButton />
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Devices"
                    value={stats.total}
                    color="text-indigo-400"
                    icon={<Server className="w-12 h-12" />}
                />
                <StatCard
                    label="Active & Online"
                    value={stats.online}
                    subtext={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% Operational`}
                    color="text-emerald-400"
                    icon={<Activity className="w-12 h-12" />}
                />
                <StatCard
                    label="Attention Needed"
                    value={stats.attention}
                    subtext={stats.attention > 0 ? "Check alerts below" : "All systems normal"}
                    color={stats.attention > 0 ? "text-red-400" : "text-emerald-400"}
                    icon={<AlertTriangle className="w-12 h-12" />}
                />
                <StatCard
                    label="Avg. Temperature"
                    value={stats.avgTemp ? `${stats.avgTemp.toFixed(1)}°C` : "--"}
                    subtext="Across all units"
                    color="text-blue-400"
                    icon={<Thermometer className="w-12 h-12" />}
                />
            </div>

            <DeviceCard onAddDevice={() => setIsAddDeviceOpen(true)} />
            <AddDeviceModal isOpen={isAddDeviceOpen} onClose={() => setIsAddDeviceOpen(false)} />
            <DebugAuth />
        </>
    );
}

export default function ConnectedDashboard() {
    return (
        <ConvexAuthProvider>
            <DashboardContent />
        </ConvexAuthProvider>
    );
}
