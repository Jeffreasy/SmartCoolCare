import TemperatureChart from "@/components/analytics/TemperatureChart";
import type { MetricType } from "../../../analytics/ChartConfig";

interface DeviceHistoryTabProps {
    deviceId: string;
    minTemp?: number;
    maxTemp?: number;
    enabledMetrics: MetricType[];
}

export default function DeviceHistoryTab({ deviceId, minTemp, maxTemp, enabledMetrics }: DeviceHistoryTabProps) {
    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
            {/* 
                We use a glass-like container for the chart to separate it from the background.
                min-h-[300px] ensures it doesn't collapse on small screens.
                flex-1 makes it fill the available height in the modal/page.
            */}
            <TemperatureChart
                deviceName={deviceId}
                minTemp={minTemp}
                maxTemp={maxTemp}
                enabledMetrics={enabledMetrics}
            />
        </div>
    );
}
