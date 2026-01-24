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
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register Chart.js components globally
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

export const CHART_THEME = {
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

export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D' | 'CUSTOM';
export type ViewMode = 'chart' | 'table';
export type MetricType = 'wired' | 'ble' | 'humidity';

export const TIME_RANGES: TimeRange[] = ['1H', '6H', '24H', '7D', '30D'];
export const METRICS: MetricType[] = ['wired', 'ble', 'humidity'];

export interface ChartDataPoint {
    time: number;
    wiredTemp: number | null;
    bleTemp: number | null;
    humidity: number | null;
}

export interface TelemetryStats {
    current: number;
    min: { val: number; time: number };
    max: { val: number; time: number };
    avg: number;
    stdDev: number; // For stability
    timeInRange: number; // %
    count: number;
}

export interface StatisticsData {
    wired: TelemetryStats | null;
    ble: TelemetryStats | null;
    humidity: TelemetryStats | null;
}
