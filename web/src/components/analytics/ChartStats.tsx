import type { StatisticsData, TelemetryStats, MetricType } from "./ChartConfig";
import { Plug, Radio, Droplets } from "lucide-react";

interface ChartStatsProps {
    statistics: StatisticsData | null;
    enabledMetrics: MetricType[];
}

// ... (helpers remain same) ...
// Helper for Time Format
const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Helper for Stability Label
const getStabilityLabel = (stdDev: number) => {
    if (stdDev < 0.5) return { label: 'High', color: 'text-status-success', bg: 'bg-status-success/10' };
    if (stdDev < 1.5) return { label: 'Medium', color: 'text-status-warning', bg: 'bg-status-warning/10' };
    return { label: 'Low', color: 'text-status-error', bg: 'bg-status-error/10' };
};


const StatsRow = ({ label, icon, color, stats, isHumidity = false }: { label: string, icon: any, color: string, stats: TelemetryStats | null, isHumidity?: boolean }) => {
    if (!stats) return null;

    const stability = !isHumidity ? getStabilityLabel(stats.stdDev) : null;
    const unit = isHumidity ? '%' : '°C';
    const isSafe = stats.timeInRange > 90;

    return (
        <div className="p-3 md:p-4 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors group">
            {/* Desktop Layout (Grid) - Unchanged */}
            <div className="hidden md:grid grid-cols-7 gap-4 items-center">
                {/* 1. Sensor Name */}
                <div className="col-span-1 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${color}`}>
                        {icon}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{label}</span>
                </div>

                {/* 2. Current */}
                <div className="flex items-center gap-2">
                    <span className={`text-lg font-mono font-bold ${color}`}>
                        {stats.current.toFixed(1)}{unit}
                    </span>
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color.replace('text-', 'bg-')}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${color.replace('text-', 'bg-')}`}></span>
                    </span>
                </div>

                {/* 3. Min */}
                <div className="flex flex-col">
                    <span className="text-base font-mono font-bold text-foreground">{stats.min.val.toFixed(1)}{unit}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(stats.min.time)}</span>
                </div>

                {/* 4. Max */}
                <div className="flex flex-col">
                    <span className="text-base font-mono font-bold text-foreground">{stats.max.val.toFixed(1)}{unit}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(stats.max.time)}</span>
                </div>

                {/* 5. Avg */}
                <div>
                    <span className="text-base font-mono font-bold text-muted-foreground">{stats.avg.toFixed(1)}{unit}</span>
                </div>

                {/* 6. Stability */}
                <div>
                    {stability ? (
                        <div className={`px-2 py-1 rounded-md text-xs font-bold w-fit ${stability.bg} ${stability.color}`}>
                            {stability.label}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                    )}
                </div>

                {/* 7. Time in Range */}
                <div className="col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${isSafe ? 'bg-status-success' : 'bg-status-error'}`}
                                style={{ width: `${stats.timeInRange}%` }}
                            />
                        </div>
                        <span className={`text-xs font-bold ${isSafe ? 'text-status-success' : 'text-status-error'}`}>
                            {Math.round(stats.timeInRange)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Mobile Layout (Overview-Style Cards) */}
            <div className="md:hidden flex flex-col relative overflow-hidden">
                {/* Background Icon (like Overview) */}
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform scale-150 origin-top-right">
                    {icon}
                </div>

                {/* Header */}
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-2 ${color}`}>
                    {icon} {label}
                </h3>

                {/* Main Value (Slightly smaller than Overview to save vertical space) */}
                <div className="text-4xl font-mono font-bold text-foreground my-2 tracking-tighter flex items-center gap-2">
                    {stats.current.toFixed(1)}{unit}
                    <span className="relative flex h-2.5 w-2.5 mt-1">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color.replace('text-', 'bg-')}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color.replace('text-', 'bg-')}`}></span>
                    </span>
                </div>

                {/* Secondary Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                        <span className="font-mono font-semibold text-sm">{stats.min.val.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(stats.min.time)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Avg</span>
                        <span className="font-mono font-semibold text-sm">{stats.avg.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-muted/30 rounded-lg">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Max</span>
                        <span className="font-mono font-semibold text-sm">{stats.max.val.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(stats.max.time)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ChartStats({ statistics, enabledMetrics }: ChartStatsProps) {
    if (!statistics) return null;

    return (
        <div className="space-y-3">
            <div className="hidden md:grid grid-cols-7 gap-4 px-4 pb-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-1">Sensor</div>
                <div className="text-center md:text-left">Current</div>
                <div className="text-center md:text-left">Min</div>
                <div className="text-center md:text-left">Max</div>
                <div className="text-center md:text-left">Average</div>
                <div className="text-center md:text-left">Stability</div>
                <div className="col-span-1 text-center md:text-left">Safe Range</div>
            </div>

            {enabledMetrics.includes('wired') && (
                <StatsRow
                    label="Wired"
                    icon={<span className="text-lg">🔌</span>}
                    color="text-sensor-wired"
                    stats={statistics.wired}
                />
            )}
            {enabledMetrics.includes('ble') && (
                <StatsRow
                    label="Wireless"
                    icon={<span className="text-lg">📡</span>}
                    color="text-sensor-wireless"
                    stats={statistics.ble}
                />
            )}
            {enabledMetrics.includes('humidity') && (
                <StatsRow
                    label="Humidity"
                    icon={<span className="text-lg">💧</span>}
                    color="text-sensor-humidity"
                    stats={statistics.humidity}
                    isHumidity={true}
                />
            )}
        </div>
    );
}
