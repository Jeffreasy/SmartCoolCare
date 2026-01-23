/**
 * TemperatureChart - React Component
 * 
 * Toont historische temperatuur data met Chart.js
 * Styled for Dark Glass UI
 */
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef } from "react";
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
    Filler, // Imported for gradient fills
    type ChartConfiguration,
    type ScriptableContext,
} from 'chart.js';

// Registreer Chart.js componenten
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TemperatureChartProps {
    deviceName: string;
}

export default function TemperatureChart({ deviceName }: TemperatureChartProps) {
    const telemetry = useQuery(api.sensors.getHistory, { sensorId: deviceName });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    useEffect(() => {
        if (!telemetry) return;
        console.log("Telemetry Data Debug:", {
            wiredCount: telemetry.wired?.length,
            bleCount: telemetry.ble?.length,
            wiredSample: telemetry.wired?.[0],
            bleSample: telemetry.ble?.[0]
        });

        if (!canvasRef.current) return;

        // Vernietig bestaande chart
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Sorteer data (oudste eerst voor tijdlijn)
        // getHistory now returns { wired: [...], ble: [...] }
        const wiredData = telemetry?.wired || [];
        const bleData = telemetry?.ble || [];

        // Combine and sort by timestamp
        const allData = [
            ...wiredData.map(r => ({ time: r._creationTime, wiredTemp: r.temperature, bleTemp: null, humidity: null })),
            ...bleData.map(r => ({ time: r._creationTime, wiredTemp: null, bleTemp: r.temperature, humidity: r.humidity })), // Assuming humidity exists in BLE data
        ].sort((a, b) => a.time - b.time);

        // Bereid data voor
        const labels = allData.map(d =>
            new Date(d.time).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
            })
        );

        // Filter chart data to exclude error values (-127) so the scale looks good
        const wiredTemperatures = allData.map(d => (d.wiredTemp !== null && d.wiredTemp > -50) ? d.wiredTemp : null);
        const bleTemperatures = allData.map(d => (d.bleTemp !== null && d.bleTemp > -50) ? d.bleTemp : null);

        // Chart configuratie
        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Wired Temp (°C)',
                        data: wiredTemperatures,
                        borderColor: '#818cf8', // Indigo 400
                        backgroundColor: (context: ScriptableContext<'line'>) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(129, 140, 248, 0.2)');
                            gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
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
                        borderColor: '#34d399', // Emerald 400
                        backgroundColor: (context: ScriptableContext<'line'>) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(52, 211, 153, 0.2)');
                            gradient.addColorStop(1, 'rgba(52, 211, 153, 0.0)');
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
                        data: allData.map(d => d.humidity ?? null),
                        borderColor: '#0ea5e9', // Sky 500
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
                    }
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
                        grid: { drawOnChartArea: false }, // only want the grid lines for one axis to show up
                        ticks: { color: '#0ea5e9' },
                        title: { display: true, text: 'Humidity (%)', color: '#0ea5e9' },
                        min: 0,
                        max: 100,
                    },
                },
            },
        };

        // Maak nieuwe chart
        chartRef.current = new ChartJS(canvasRef.current, config);

        // Cleanup
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [telemetry, deviceName]);

    if (!telemetry || (!telemetry.wired?.length && !telemetry.ble?.length)) {
        return (
            <div className="h-[400px] flex items-center justify-center text-slate-500 glass-card">
                <p>No data available</p>
            </div>
        );
    }

    // Calculate latest values for header
    const latestWired = telemetry.wired?.[0]?.temperature;
    const latestBle = telemetry.ble?.[0]?.temperature;

    return (
        <div className="glass-card p-4 relative w-full h-[300px] md:h-[450px] flex flex-col">
            <div className="flex justify-center gap-4 md:gap-8 mb-4">
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs text-indigo-400 font-bold uppercase tracking-wider">Wired</span>
                    <span className={`text-lg md:text-xl font-mono font-bold ${latestWired === -127 ? 'text-red-500' : 'text-slate-200'}`}>
                        {latestWired !== undefined ? `${latestWired.toFixed(1)}°C` : '--'}
                    </span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] md:text-xs text-emerald-400 font-bold uppercase tracking-wider">Wireless</span>
                    <span className="text-lg md:text-xl font-mono font-bold text-slate-200">
                        {latestBle !== undefined ? `${latestBle.toFixed(1)}°C` : '--'}
                    </span>
                </div>
            </div>
            <div className="flex-1 relative min-h-0">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
}
