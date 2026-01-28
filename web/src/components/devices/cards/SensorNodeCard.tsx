import type { SensorNodeDevice } from "@/domain/device-types";
import { SensorMetric } from "./SharedComponents";
import { BaseCardShell, REQUEST_THEMES } from "./BaseCardShell";

interface SensorNodeCardProps {
    device: SensorNodeDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function SensorNodeCard({ device, onClick, onKeyDown }: SensorNodeCardProps) {
    return (
        <BaseCardShell
            device={device}
            onClick={onClick}
            onKeyDown={onKeyDown}
            theme={REQUEST_THEMES.sensor}
            batteryLevel={device.lastBleBattery}
        >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pl-3">
                <SensorMetric
                    label="TEMP"
                    value={device.lastBleTemp}
                    colorClass="text-sensor-wireless"
                    borderColorClass="border-sensor-wireless/10"
                    bgClass="bg-sensor-wireless"
                />
                {/*  We can show humidity prominently for sensor nodes usually */}
                {device.lastBleHumidity !== undefined ? (
                    <SensorMetric
                        label="HUMIDITY"
                        value={device.lastBleHumidity}
                        unit="%"
                        colorClass="text-sensor-humidity"
                        borderColorClass="border-sensor-humidity/10"
                        bgClass="bg-sensor-humidity"
                    />
                ) : (
                    <div className="bg-slate-900/30 rounded-xl border border-white/5"></div>
                )}
            </div>
        </BaseCardShell>
    );
}
