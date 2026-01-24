import TemperatureChart from "../../../TemperatureChart";
import type { MetricType } from "../../../analytics/ChartConfig";

interface DeviceHistoryTabProps {
    deviceId: string;
    minTemp?: number;
    maxTemp?: number;
    enabledMetrics: MetricType[];
}

export default function DeviceHistoryTab({ deviceId, minTemp, maxTemp, enabledMetrics }: DeviceHistoryTabProps) {
    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* 
                We use a glass-like container for the chart to separate it from the background.
                min-h-[300px] ensures it doesn't collapse on small screens.
                flex-1 makes it fill the available height in the modal/page.
            */}
            <div className="flex-1 bg-slate-950/30 rounded-xl border border-white/5 p-4 min-h-[300px] flex flex-col">
                <TemperatureChart
                    deviceName={deviceId}
                    minTemp={minTemp}
                    maxTemp={maxTemp}
                    enabledMetrics={enabledMetrics}
                />
            </div>
        </div>
    );
}
