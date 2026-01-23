import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import DeviceCard from "./DeviceCard";
import DebugAuth from "./DebugAuth";
import ConvexAuthProvider from "./ConvexAuthProvider";
import AddDeviceModal from "./AddDeviceModal";
import { useState } from "react";

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
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Your Devices</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAddDeviceOpen(true)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Device
                    </button>
                    <span className="w-px h-6 bg-white/10 mx-1"></span>
                    <span className="text-sm text-slate-400 hidden sm:block">Manage Account</span>
                    <UserButton />
                </div>
            </div>

            {/* Summary Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    label="Total Devices"
                    value={stats.total}
                    color="text-indigo-400"
                    icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                />
                <StatCard
                    label="Active & Online"
                    value={stats.online}
                    subtext={`${stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0}% Operational`}
                    color="text-emerald-400"
                    icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    label="Attention Needed"
                    value={stats.attention}
                    subtext={stats.attention > 0 ? "Check alerts below" : "All systems normal"}
                    color={stats.attention > 0 ? "text-red-400" : "text-emerald-400"}
                    icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <StatCard
                    label="Avg. Temperature"
                    value={stats.avgTemp ? `${stats.avgTemp.toFixed(1)}°C` : "--"}
                    subtext="Across all units"
                    color="text-blue-400"
                    icon={<svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>}
                />
            </div>

            <DeviceCard />
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
