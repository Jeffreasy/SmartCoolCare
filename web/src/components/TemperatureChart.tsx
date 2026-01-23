/**
 * TemperatureChart - Enhanced Version
 * 
 * Features:
 * - Time range selector (1H, 6H, 24H, 7D, 30D, Custom)
 * - Statistics panel (Min/Max/Avg/Alerts)
 * - Alert zones visualization
 * - Export (CSV/JSON/PNG)
 * - Zoom/Pan controls
 * - Data table toggle
 * - Live mode
 */
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartConfiguration,
    type ScriptableContext,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
);

// Semantic Chart Theme (Must match tailwind.config.mjs)
const CHART_THEME = {
    wired: {
        hex: '#818cf8', // sensor.wired
        bgStart: 'rgba(129, 140, 248, 0.2)',
        bgEnd: 'rgba(129, 140, 248, 0.0)'
    },
    wireless: {
        hex: '#34d399', // sensor.wireless
        bgStart: 'rgba(52, 211, 153, 0.2)',
        bgEnd: 'rgba(52, 211, 153, 0.0)'
    },
    humidity: {
        hex: '#38bdf8', // sensor.humidity
    }
};

interface TemperatureChartProps {
    deviceName: string;
    minTemp?: number;
    maxTemp?: number;
}

type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D' | 'CUSTOM';
type ViewMode = 'chart' | 'table';

export default function TemperatureChart({ deviceName, minTemp, maxTemp }: TemperatureChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('24H');
    const [customStartTime, setCustomStartTime] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('chart');
    const [liveMode, setLiveMode] = useState(false);
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    // Calculate startTime based on selected range
    const startTime = useMemo(() => {
        if (timeRange === 'CUSTOM' && customStartTime) return customStartTime;

        const now = Date.now();
        const ranges: Record<string, number> = {
            '1H': 60 * 60 * 1000,
            '6H': 6 * 60 * 60 * 1000,
            '24H': 24 * 60 * 60 * 1000,
            '7D': 7 * 24 * 60 * 60 * 1000,
            '30D': 30 * 24 * 60 * 60 * 1000,
        };

        if (timeRange === 'CUSTOM') {
            return now - ranges['24H'];
        }

        return now - (ranges[timeRange] || ranges['24H']);
    }, [timeRange, customStartTime]);

    // Fetch telemetry with time range
    const telemetry = useQuery(
        api.sensors.getHistory,
        { sensorId: deviceName, startTime, limit: 1000 }
    );

    // Auto-refresh for live mode
    useEffect(() => {
        if (!liveMode) return;
        const interval = setInterval(() => {
            // Trigger re-fetch (useQuery handles this automatically)
        }, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [liveMode]);

    // Prepare chart data
    const chartData = useMemo(() => {
        if (!telemetry) return null;

        const wiredData = telemetry?.wired || [];
        const bleData = telemetry?.ble || [];

        const allData = [
            ...wiredData.map(r => ({
                time: r._creationTime,
                wiredTemp: r.temperature,
                bleTemp: null,
                humidity: null
            })),
            ...bleData.map(r => ({
                time: r._creationTime,
                wiredTemp: null,
                bleTemp: r.temperature,
                humidity: r.humidity
            })),
        ].sort((a, b) => a.time - b.time);

        return allData;
    }, [telemetry]);

    // Calculate statistics (ADVANCED VERSION)
    const statistics = useMemo(() => {
        if (!chartData) return null;

        const calculateMetricStats = (dataPoints: { val: number | null, time: number }[]) => {
            const validPoints = dataPoints.filter((d): d is { val: number, time: number } => d.val !== null);
            if (validPoints.length === 0) return null;

            const values = validPoints.map(d => d.val);
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;

            // Standard Deviation for Stability
            const squareDiffs = values.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            // Min/Max with Timestamps
            const min = validPoints.reduce((prev, curr) => curr.val < prev.val ? curr : prev);
            const max = validPoints.reduce((prev, curr) => curr.val > prev.val ? curr : prev);

            // Time in Range
            let safeCount = 0;
            if (minTemp !== undefined || maxTemp !== undefined) {
                safeCount = validPoints.filter(d => {
                    if (minTemp !== undefined && d.val < minTemp) return false;
                    if (maxTemp !== undefined && d.val > maxTemp) return false;
                    return true;
                }).length;
            } else {
                safeCount = validPoints.length; // If no limits, all are safe
            }
            const timeInRange = (safeCount / validPoints.length) * 100;

            return {
                current: values[values.length - 1],
                min,
                max,
                avg,
                stdDev,
                timeInRange,
                count: validPoints.length
            };
        };

        const wiredStats = calculateMetricStats(chartData.map(d => ({ val: (d.wiredTemp !== null && d.wiredTemp > -50) ? d.wiredTemp : null, time: d.time })));
        const bleStats = calculateMetricStats(chartData.map(d => ({ val: (d.bleTemp !== null && d.bleTemp > -50) ? d.bleTemp : null, time: d.time })));
        const humidityStats = calculateMetricStats(chartData.map(d => ({ val: d.humidity, time: d.time })));

        return { wired: wiredStats, ble: bleStats, humidity: humidityStats };
    }, [chartData, minTemp, maxTemp]);

    // Export functions
    const exportCSV = () => {
        if (!chartData) return;

        const headers = ['Timestamp', 'Wired Temp (°C)', 'BLE Temp (°C)', 'Humidity (%)'];
        const rows = chartData.map(d => [
            new Date(d.time).toISOString(),
            d.wiredTemp?.toFixed(2) || '',
            d.bleTemp?.toFixed(2) || '',
            d.humidity?.toFixed(2) || '',
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deviceName}_${timeRange}_export.csv`;
        a.click();
    };

    const exportJSON = () => {
        if (!chartData) return;

        const json = JSON.stringify({
            device: deviceName,
            timeRange,
            exportDate: new Date().toISOString(),
            statistics,
            data: chartData,
        }, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deviceName}_${timeRange}_export.json`;
        a.click();
    };

    const exportPNG = () => {
        if (!chartRef.current) return;
        const url = chartRef.current.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deviceName}_${timeRange}_chart.png`;
        a.click();
    };

    // Helper for Stability Label
    const getStabilityLabel = (stdDev: number) => {
        if (stdDev < 0.5) return { label: 'High', color: 'text-status-success', bg: 'bg-status-success/10' };
        if (stdDev < 1.5) return { label: 'Medium', color: 'text-status-warning', bg: 'bg-status-warning/10' };
        return { label: 'Low', color: 'text-status-error', bg: 'bg-status-error/10' };
    };

    // Helper for Time Format
    const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Internal Row Component
    const StatsRow = ({ label, icon, color, stats, isHumidity = false }: { label: string, icon: any, color: string, stats: any, isHumidity?: boolean }) => {
        if (!stats) return null;

        const stability = !isHumidity ? getStabilityLabel(stats.stdDev) : null;
        const unit = isHumidity ? '%' : '°C';
        const isSafe = stats.timeInRange > 90;

        return (
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors group">
                {/* 1. Sensor Name */}
                <div className="md:col-span-1 flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 ${color}`}>
                        {icon}
                    </div>
                    <span className="font-semibold text-foreground text-sm hidden md:block">{label}</span>
                    <span className="font-semibold text-foreground text-sm md:hidden">{label} Sensor</span>
                </div>

                {/* 2. Current */}
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground md:hidden">Current</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-mono font-bold ${color}`}>
                            {stats.current.toFixed(1)}{unit}
                        </span>
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${color.replace('text-', 'bg-')}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${color.replace('text-', 'bg-')}`}></span>
                        </span>
                    </div>
                </div>

                {/* 3. Min */}
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 md:hidden">Min</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                        {stats.min.val.toFixed(1)}{unit}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(stats.min.time)}</span>
                </div>

                {/* 4. Max */}
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-slate-500 md:hidden">Max</span>
                    <span className="text-sm font-mono font-medium text-foreground">
                        {stats.max.val.toFixed(1)}{unit}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatTime(stats.max.time)}</span>
                </div>

                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground md:hidden">Avg</span>
                    <span className="text-sm font-mono font-medium text-muted-foreground">
                        {stats.avg.toFixed(1)}{unit}
                    </span>
                </div>

                {/* 6. Stability (Temp only) */}
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground md:hidden">Stability</span>
                    {stability ? (
                        <div className={`px-2 py-0.5 rounded text-xs font-bold w-fit ${stability.bg} ${stability.color}`}>
                            {stability.label}
                        </div>
                    ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                    )}
                </div>

                {/* 7. Time in Range */}
                <div className="md:col-span-1 flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground md:hidden">Time in Range</span>
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
        );
    };

    // Chart rendering
    useEffect(() => {
        if (!chartData || !canvasRef.current || viewMode !== 'chart') return;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const labels = chartData.map(d =>
            new Date(d.time).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
            })
        );

        const wiredTemperatures = chartData.map(d => (d.wiredTemp !== null && d.wiredTemp > -50) ? d.wiredTemp : null);
        const bleTemperatures = chartData.map(d => (d.bleTemp !== null && d.bleTemp > -50) ? d.bleTemp : null);

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Wired Temp (°C)',
                        data: wiredTemperatures,
                        borderColor: CHART_THEME.wired.hex,
                        backgroundColor: (context: ScriptableContext<'line'>) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, CHART_THEME.wired.bgStart);
                            gradient.addColorStop(1, CHART_THEME.wired.bgEnd);
                            return gradient;
                        },
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        spanGaps: true,
                        fill: true,
                        yAxisID: 'y',
                    },
                    {
                        label: 'BLE Temp (°C)',
                        data: bleTemperatures,
                        borderColor: CHART_THEME.wireless.hex,
                        backgroundColor: (context: ScriptableContext<'line'>) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, CHART_THEME.wireless.bgStart);
                            gradient.addColorStop(1, CHART_THEME.wireless.bgEnd);
                            return gradient;
                        },
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        spanGaps: true,
                        fill: true,
                        yAxisID: 'y',
                    },
                    {
                        label: 'Humidity (%)',
                        data: chartData.map(d => d.humidity ?? null),
                        borderColor: CHART_THEME.humidity.hex,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        tension: 0.4,
                        spanGaps: true,
                        borderDash: [5, 5],
                        yAxisID: 'y1',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 12 },
                            usePointStyle: true,
                            boxWidth: 8,
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f8fafc',
                        bodyColor: '#e2e8f0',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(1);
                                    if (label.includes('Humidity')) label += '%';
                                    else label += '°C';
                                }
                                return label;
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true,
                            },
                            mode: 'x',
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' },
                        title: { display: true, text: 'Temperature (°C)', color: '#475569' },
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: CHART_THEME.humidity.hex },
                        title: { display: true, text: 'Humidity (%)', color: CHART_THEME.humidity.hex },
                        min: 0,
                        max: 100,
                    },
                },
            },
        };

        chartRef.current = new ChartJS(canvasRef.current, config);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartData, viewMode, minTemp, maxTemp, deviceName, timeRange]);

    if (!telemetry || (!telemetry.wired?.length && !telemetry.ble?.length)) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground glass-card">
                <p>No data available for selected time range</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 space-y-4">
            {/* Time Range Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                    {(['1H', '6H', '24H', '7D', '30D'] as TimeRange[]).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === range
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                    <button
                        onClick={() => setShowCustomPicker(!showCustomPicker)}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${timeRange === 'CUSTOM'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            }`}
                    >
                        Custom
                    </button>
                </div>

                <div className="flex gap-2">
                    {/* View Mode Toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg text-sm font-semibold transition-all"
                    >
                        {viewMode === 'chart' ? '📊 Chart' : '📋 Table'}
                    </button>

                    {/* Live Mode Toggle */}
                    <button
                        onClick={() => setLiveMode(!liveMode)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${liveMode
                            ? 'bg-status-success text-primary-foreground shadow-lg shadow-status-success/30'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {liveMode ? '🔴 Live' : '⏸️ Paused'}
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg text-sm font-semibold transition-all">
                            Export ⬇️
                        </button>
                        <div className="absolute right-0 mt-1 w-32 bg-popover border border-border rounded-lg shadow-xl opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-10">
                            <button onClick={exportCSV} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent rounded-t-lg">CSV</button>
                            <button onClick={exportJSON} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent">JSON</button>
                            <button onClick={exportPNG} className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent rounded-b-lg">PNG</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Date Picker (if shown) */}
            {showCustomPicker && (
                <div className="bg-card p-4 rounded-lg border border-border">
                    <label className="text-sm text-muted-foreground mb-2 block">Start Time</label>
                    <input
                        type="datetime-local"
                        onChange={(e) => {
                            setCustomStartTime(new Date(e.target.value).getTime());
                            setTimeRange('CUSTOM');
                        }}
                        className="bg-input border border-border rounded-lg px-4 py-2 text-foreground w-full"
                    />
                </div>
            )}

            {/* Statistics Panel */}
            {statistics && (
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

                    <StatsRow
                        label="Wired"
                        icon={<span className="text-lg">🔌</span>}
                        color="text-sensor-wired"
                        stats={statistics.wired}
                    />
                    <StatsRow
                        label="Wireless"
                        icon={<span className="text-lg">📡</span>}
                        color="text-sensor-wireless"
                        stats={statistics.ble}
                    />
                    <StatsRow
                        label="Humidity"
                        icon={<span className="text-lg">💧</span>}
                        color="text-sensor-humidity"
                        stats={statistics.humidity}
                        isHumidity={true}
                    />
                </div>
            )}

            {/* Chart or Table View */}
            {viewMode === 'chart' ? (
                <div className="relative w-full h-[300px] md:h-[450px]">
                    <canvas ref={canvasRef}></canvas>
                    <div className="absolute top-2 right-2 flex gap-2">
                        <button
                            onClick={() => chartRef.current?.resetZoom()}
                            className="px-3 py-1 bg-popover/80 text-foreground text-xs rounded-lg hover:bg-popover transition-all border border-border"
                        >
                            Reset Zoom
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="px-4 py-2 text-left text-muted-foreground">Time</th>
                                <th className="px-4 py-2 text-left text-muted-foreground">Wired (°C)</th>
                                <th className="px-4 py-2 text-left text-muted-foreground">BLE (°C)</th>
                                <th className="px-4 py-2 text-left text-muted-foreground">Humidity (%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {chartData?.slice(0, 50).map((d, i) => (
                                <tr key={i} className="hover:bg-accent/50">
                                    <td className="px-4 py-2 text-foreground">
                                        {new Date(d.time).toLocaleString('nl-NL')}
                                    </td>
                                    <td className="px-4 py-2 text-sensor-wired font-mono">
                                        {d.wiredTemp !== null ? d.wiredTemp.toFixed(1) : '--'}
                                    </td>
                                    <td className="px-4 py-2 text-sensor-wireless font-mono">
                                        {d.bleTemp !== null ? d.bleTemp.toFixed(1) : '--'}
                                    </td>
                                    <td className="px-4 py-2 text-sensor-humidity font-mono">
                                        {d.humidity !== null ? d.humidity.toFixed(1) : '--'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {chartData && chartData.length > 50 && (
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Showing first 50 of {chartData.length} readings
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
