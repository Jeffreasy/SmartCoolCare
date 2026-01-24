
import { useEffect, useRef, useState } from "react";
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
import { DeviceTypeIcon, SignalIcon, BatteryIcon } from "../ui/icons";

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

// --- Simulated Components (Mirrors DeviceCard.tsx) ---

const SensorMetric = ({ label, value, unit = "°C", colorClass, borderColorClass, bgClass }: any) => (
    <div className={`bg-slate-950/60 rounded-xl p-2.5 sm:p-3 border ${borderColorClass} relative overflow-hidden group/metric`}>
        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/metric:opacity-100 transition-opacity">
            <div className={`w-1.5 h-1.5 rounded-full ${bgClass} shadow-[0_0_5px_currentColor]`}></div>
        </div>
        <p className={`text-[9px] sm:text-[10px] ${colorClass} opacity-60 uppercase font-black tracking-widest mb-1`}>
            {label}
        </p>
        <p className={`text-xl sm:text-2xl font-mono font-bold tracking-tighter ${value !== undefined ? colorClass : 'text-slate-700'}`}>
            {value.toFixed(1)}{unit}
        </p>
    </div>
);

const HumidityBanner = ({ value }: { value: number }) => (
    <div className="col-span-2 bg-gradient-to-r from-slate-950/80 to-slate-900/80 rounded-xl p-2.5 sm:p-3 border border-white/5 flex justify-between items-center group/hum">
        <span className="text-[9px] sm:text-[10px] text-slate-500 uppercase font-black tracking-widest pl-1">HUMIDITY</span>
        <div className="flex items-center gap-2 pr-1">
            <span className="text-xl sm:text-2xl filter drop-shadow-[0_0_3px_rgba(56,189,248,0.5)]">💧</span>
            <span className="font-mono font-bold text-lg sm:text-xl text-sensor-humidity group-hover/hum:text-sky-300 transition-colors">
                {value.toFixed(1)}%
            </span>
        </div>
    </div>
);

export default function LiveDashboardPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    // Simulation State
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [currentTemp, setCurrentTemp] = useState(4.2);
    const [wiredTemp, setWiredTemp] = useState(3.8);
    const [humidity, setHumidity] = useState(48.5);
    const [battery, setBattery] = useState(88);
    const [rssi, setRssi] = useState(-58);

    // Generate initial history
    const generateHistory = () => {
        const now = Date.now();
        const data = [];
        for (let i = 20; i >= 0; i--) {
            data.push({
                time: now - i * 3000,
                val: 3.8 + Math.random() * 0.6
            });
        }
        return data;
    };

    const dataRef = useRef(generateHistory());

    // Live Data Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            // Simulate slight fluctuations
            const newTemp = 3.9 + Math.random() * 0.4;
            const newWired = 3.7 + Math.random() * 0.3;
            const newHum = 48 + Math.random() * 1.5;

            // Randomly drop signal slightly
            const newRssi = -55 - Math.floor(Math.random() * 10);

            // Add new point
            dataRef.current.push({ time: now, val: newTemp });
            if (dataRef.current.length > 20) dataRef.current.shift();

            setCurrentTemp(newTemp);
            setWiredTemp(newWired);
            setHumidity(newHum);
            setRssi(newRssi);

            // Artificial drift for battery (very slow)
            if (Math.random() > 0.95) setBattery(b => Math.max(10, b - 1));

            setLastUpdate(now);

            // Update Chart
            if (chartRef.current) {
                chartRef.current.data.labels = dataRef.current.map(d =>
                    new Date(d.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                );
                chartRef.current.data.datasets[0].data = dataRef.current.map(d => d.val);
                chartRef.current.update('none');
            }
        }, 2000);

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
                animation: { duration: 1000, easing: 'linear' },
                interaction: { mode: 'index', intersect: false },
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
                            label: (ctx) => ctx.parsed.y !== null ? ` ${ctx.parsed.y.toFixed(2)} °C` : ''
                        }
                    }
                },
                scales: {
                    x: { display: false },
                    y: {
                        min: 2, max: 6,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#64748b' },
                        border: { display: false }
                    },
                },
            },
        };

        chartRef.current = new ChartJS(canvasRef.current, config);
        return () => { if (chartRef.current) chartRef.current.destroy(); };
    }, []);

    // Time Ago simulation
    const [timeAgo, setTimeAgo] = useState('Just now');
    useEffect(() => {
        const t = setInterval(() => {
            setTimeAgo(Math.random() > 0.3 ? 'Just now' : '1s ago');
        }, 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="relative group perspective-[1200px] w-full max-w-5xl mx-auto mt-16 z-20">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            {/* Main Glass Panel */}
            <div className="relative rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl overflow-hidden transform transition-all duration-700 hover:scale-[1.01] flex flex-col md:flex-row">

                {/* Visual Sidebar (Mimics DeviceCard) */}
                <div className="md:w-1/3 lg:w-1/4 bg-slate-900/50 p-6 flex flex-col border-r border-border">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-800/50 rounded-lg border border-white/5">
                                <DeviceTypeIcon type="fridge" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">
                                    Main Fridge
                                </h3>
                                <p className="text-xs text-slate-500 font-mono">ID: REF-001</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider border backdrop-blur-md bg-status-online/10 text-status-online border-status-online/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            ONLINE
                        </span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 mb-auto">
                        <SensorMetric
                            label="WIRED"
                            value={wiredTemp}
                            colorClass="text-sensor-wired"
                            borderColorClass="border-sensor-wired/10"
                            bgClass="bg-sensor-wired"
                        />
                        <SensorMetric
                            label="WIRELESS"
                            value={currentTemp}
                            colorClass="text-sensor-wireless"
                            borderColorClass="border-sensor-wireless/10"
                            bgClass="bg-sensor-wireless"
                        />
                        <div className="col-span-2 lg:col-span-1">
                            <HumidityBanner value={humidity} />
                        </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-slate-500 font-medium text-xs">Last Seen:</span>
                            <span className="text-slate-300 font-mono text-xs bg-slate-800/50 px-2 py-0.5 rounded">
                                {timeAgo}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-medium">Signal Strength</span>
                            <div className="scale-90 origin-right">
                                <SignalIcon rssi={rssi} />
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-xs font-medium">Battery (BLE)</span>
                            <div className="flex items-center gap-2">
                                <BatteryIcon level={battery} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="md:w-2/3 lg:w-3/4 p-6 relative bg-gradient-to-b from-background/10 to-transparent flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success/75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-success"></span>
                            </span>
                            <span className="text-xs font-bold text-status-success uppercase tracking-wider">Live Monitoring</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="text-xs text-muted-foreground tabular-nums opacity-60">
                                Latency: 24ms
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full">
                        <canvas ref={canvasRef}></canvas>
                    </div>
                </div>

            </div>
        </div>
    );
}
