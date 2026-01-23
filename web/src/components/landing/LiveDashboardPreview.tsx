
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
import { Activity, Radio, Wifi } from "lucide-react";

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
    Filler
);

// Semantic Chart Theme (Reused for consistency)
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
    }
};

export default function LiveDashboardPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [currentTemp, setCurrentTemp] = useState(4.2);

    // Generate initial history
    const generateHistory = () => {
        const now = Date.now();
        const data = [];
        for (let i = 20; i >= 0; i--) {
            data.push({
                time: now - i * 3000, // Every 3 seconds
                val: 3.8 + Math.random() * 0.6 // Random between 3.8 and 4.4
            });
        }
        return data;
    };

    // Mutable data ref to avoid re-creating chart
    const dataRef = useRef(generateHistory());

    // Live Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newVal = 3.9 + Math.random() * 0.4; // Stable fridge temp

            // Add new point
            dataRef.current.push({ time: now, val: newVal });
            // Remove old point
            if (dataRef.current.length > 20) dataRef.current.shift();

            setCurrentTemp(newVal);
            setLastUpdate(now);

            // Update Chart
            if (chartRef.current) {
                chartRef.current.data.labels = dataRef.current.map(d =>
                    new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                );
                chartRef.current.data.datasets[0].data = dataRef.current.map(d => d.val);
                chartRef.current.update('none'); // Efficient update
            }
        }, 2000); // 2 second updates

        return () => clearInterval(interval);
    }, []);

    // Initialize Chart
    useEffect(() => {
        if (!canvasRef.current) return;

        const config: ChartConfiguration<'line'> = {
            type: 'line',
            data: {
                labels: dataRef.current.map(d => new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
                datasets: [
                    {
                        label: 'Internal Temperature (°C)',
                        data: dataRef.current.map(d => d.val),
                        borderColor: CHART_THEME.wireless.hex,
                        backgroundColor: (context: ScriptableContext<'line'>) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                            gradient.addColorStop(0, CHART_THEME.wireless.bgStart);
                            gradient.addColorStop(1, CHART_THEME.wireless.bgEnd);
                            return gradient;
                        },
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#020617',
                        pointBorderColor: CHART_THEME.wireless.hex,
                        pointBorderWidth: 2,
                        tension: 0.4,
                        fill: true,
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'linear'
                },
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(2, 6, 23, 0.9)',
                        titleColor: '#e2e8f0',
                        bodyColor: '#34d399',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 10,
                        callbacks: {
                            label: (ctx) => {
                                if (ctx.parsed.y !== null) {
                                    return ` ${ctx.parsed.y.toFixed(2)} °C`;
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: false, // Clean look
                        grid: { display: false }
                    },
                    y: {
                        min: 2,
                        max: 6,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' },
                        border: { display: false }
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
    }, []);

    return (
        <div className="relative group perspective-[1200px] w-full max-w-5xl mx-auto mt-16 z-20">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            {/* Main Glass Panel */}
            <div className="relative rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl overflow-hidden transform transition-all duration-700 hover:scale-[1.01]">

                {/* Header / Toolbar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-status-error/30 border border-status-error"></div>
                            <div className="w-3 h-3 rounded-full bg-status-warning/30 border border-status-warning"></div>
                            <div className="w-3 h-3 rounded-full bg-status-success/30 border border-status-success"></div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-secondary/50 border border-border text-xs font-mono text-muted-foreground">
                            <Activity className="w-3 h-3" />
                            <span>koelkast-main-01.live</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success/75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                            </span>
                            <span className="text-xs font-bold text-status-success uppercase tracking-wider">Live Stream</span>
                        </div>
                        <div className="hidden sm:block text-xs text-muted-foreground tabular-nums opacity-60">
                            Latency: 24ms
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[400px]">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1 border-r border-border bg-background/30 p-6 flex flex-col gap-6">

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Sensor</span>
                            <div className="flex items-center gap-2 text-foreground font-medium">
                                <Radio className="w-4 h-4 text-sensor-wireless" />
                                <span>Wireless Probe #1</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-background/50 border border-border">
                            <span className="text-xs text-muted-foreground block mb-1">Current Temperature</span>
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-foreground tabular-nums tracking-tight">
                                    {currentTemp.toFixed(1)}°C
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-sensor-wireless w-[65%] rounded-full"></div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-background/50 border border-border">
                            <span className="text-xs text-muted-foreground block mb-1">Status Report</span>
                            <div className="flex items-center gap-2 text-sm text-status-success font-medium">
                                <Activity className="w-4 h-4" />
                                <span>Optimal Range</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                System is operating within HACCP parameters. No anomalies detected.
                            </p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-border">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Wifi className="w-3 h-3" /> Signal
                                </span>
                                <span className="font-mono">Strong (-42dBm)</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Chart Area */}
                    <div className="lg:col-span-3 p-6 relative bg-gradient-to-b from-background/10 to-transparent">
                        <div className="absolute top-6 right-6 z-10 flex gap-2">
                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">1H</span>
                            <span className="px-2 py-1 rounded text-[10px] font-bold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">24H</span>
                            <span className="px-2 py-1 rounded text-[10px] font-bold text-muted-foreground hover:bg-secondary transition-colors cursor-pointer">7D</span>
                        </div>

                        <div className="w-full h-full min-h-[300px]">
                            <canvas ref={canvasRef}></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
