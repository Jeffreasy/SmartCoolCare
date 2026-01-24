import { useEffect, useRef, useState } from "react";
import { Plug, Radio, Droplets } from "lucide-react";
import { Chart as ChartJS } from 'chart.js';
import type { ChartConfiguration, ScriptableContext } from 'chart.js';

// Modular Components
import { CHART_THEME } from "./analytics/ChartConfig";
import type { TimeRange, ViewMode, ChartDataPoint, MetricType } from "./analytics/ChartConfig";
import ChartControls from "./analytics/ChartControls";
import ChartStats from "./analytics/ChartStats";
import TemperatureTableView from "./analytics/TemperatureTableView";
import { useTelemetryData } from "@/hooks/useTelemetryData";

interface TemperatureChartProps {
    deviceName: string;
    minTemp?: number;
    maxTemp?: number;
    compact?: boolean;
    enabledMetrics?: MetricType[]; // NEW: Control which data to show
}

export default function TemperatureChart({
    deviceName,
    minTemp,
    maxTemp,
    compact = false,
    enabledMetrics = ['wired', 'ble', 'humidity'] // Default to all for backward compat
}: TemperatureChartProps) {
    // --- State ---
    const [timeRange, setTimeRange] = useState<TimeRange>('24H');
    const [customStartTime, setCustomStartTime] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('chart');
    const [liveMode, setLiveMode] = useState(false);
    const [showCustomPicker, setShowCustomPicker] = useState(false);

    // --- Chart Refs ---
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    // --- Data Hook ---
    const { chartData, statistics, isLoading } = useTelemetryData(
        deviceName,
        timeRange,
        customStartTime,
        minTemp,
        maxTemp,
        liveMode
    );

    // --- Chart Rendering Logic ---
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

        const datasets = [];

        if (enabledMetrics.includes('wired')) {
            datasets.push({
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
            });
        }

        if (enabledMetrics.includes('ble')) {
            datasets.push({
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
            });
        }

        if (enabledMetrics.includes('humidity')) {
            datasets.push({
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
            });
        }

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                labels,
                datasets,
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: compact ? false : { // Disable animation in overview for stability
                    duration: 750,
                },
                interaction: {
                    mode: compact ? undefined : 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: !compact,
                        position: 'top', // Clean top legend
                        align: 'end',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Inter', size: 11 },
                            usePointStyle: true,
                            boxWidth: 6,
                            padding: 15, // More padding to separate
                        }
                    },
                    tooltip: {
                        enabled: !compact, // Disable tooltip in overview to prevent touch jumps
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
                            enabled: !compact,
                            mode: 'x',
                        },
                        zoom: {
                            wheel: {
                                enabled: !compact,
                            },
                            pinch: {
                                enabled: !compact,
                            },
                            mode: 'x',
                        },
                    },
                },
                scales: {
                    x: {
                        display: !compact,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#64748b',
                            autoSkip: true,
                            maxTicksLimit: 6,
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
                    y: {
                        type: 'linear',
                        display: !compact,
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' },
                        title: { display: !compact, text: 'Temperature (°C)', color: '#475569' },
                        // Lock the scale to prevent jumping
                        suggestedMin: minTemp ?? -5,
                        suggestedMax: maxTemp ?? 15,
                    },
                    y1: {
                        type: 'linear',
                        display: !compact,
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: CHART_THEME.humidity.hex },
                        title: { display: !compact, text: 'Humidity (%)', color: CHART_THEME.humidity.hex },
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
    }, [chartData, viewMode, minTemp, maxTemp, deviceName, timeRange, compact]);


    // --- Export Handlers ---
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


    // --- Render ---

    if (isLoading) {
        return (
            <div className={`glass-card p-8 flex items-center justify-center ${compact ? 'min-h-[150px] bg-transparent shadow-none border-none' : 'min-h-[300px]'}`}>
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!chartData || chartData.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground glass-card">
                <p>No data available for selected time range</p>
            </div>
        );
    }

    return (
        <div className={`glass-card p-4 space-y-4 ${compact ? 'border-none bg-transparent shadow-none p-0 !space-y-0 w-full overflow-hidden' : ''}`}>

            {/* 1. Header Controls (Hidden in Compact Mode) */}
            {!compact && (
                <ChartControls
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    showCustomPicker={showCustomPicker}
                    onToggleCustomPicker={() => setShowCustomPicker(!showCustomPicker)}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    liveMode={liveMode}
                    onLiveModeToggle={() => setLiveMode(!liveMode)}
                    onExportCSV={exportCSV}
                    onExportJSON={exportJSON}
                    onExportPNG={exportPNG}
                    onCustomStartTimeChange={setCustomStartTime}
                />
            )}

            {/* 2. Statistics Panel (Hidden in Compact Mode) */}
            {!compact && <ChartStats statistics={statistics} enabledMetrics={enabledMetrics} />}

            {/* 3. Main Visualization Area */}
            {viewMode === 'chart' ? (
                <div className={`relative w-full ${compact ? 'h-full min-h-[180px] flex flex-col' : 'h-[300px] md:h-[450px]'}`}>

                    {/* Compact Mode Legend */}
                    {compact && (
                        <div className="flex items-center justify-end gap-3 mb-2 px-2">
                            {enabledMetrics.includes('wired') && (
                                <div className="flex items-center gap-1.5">
                                    <Plug className="w-3 h-3 text-sensor-wired" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Wired</span>
                                </div>
                            )}
                            {enabledMetrics.includes('ble') && (
                                <div className="flex items-center gap-1.5">
                                    <Radio className="w-3 h-3 text-sensor-wireless" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Wireless</span>
                                </div>
                            )}
                            {enabledMetrics.includes('humidity') && (
                                <div className="flex items-center gap-1.5">
                                    <Droplets className="w-3 h-3 text-sensor-humidity" />
                                    <span className="text-[10px] font-medium text-muted-foreground">Humidity</span>
                                </div>
                            )}
                        </div>
                    )}

                    <canvas ref={canvasRef} className="flex-1"></canvas>

                    {/* Zoom Reset for Full Mode */}
                    {!compact && (
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                onClick={() => chartRef.current?.resetZoom()}
                                className="px-3 py-1 bg-popover/80 text-foreground text-xs rounded-lg hover:bg-popover transition-all border border-border"
                            >
                                Reset Zoom
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <TemperatureTableView data={chartData} />
            )}
        </div>
    );
}
