import type { CoolCareDevice } from "@/domain/device-types";
import { SensorMetric, HumidityBanner } from "./SharedComponents";
import { BaseCardShell, REQUEST_THEMES } from "./BaseCardShell";

interface CoolCareCardProps {
    device: CoolCareDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function CoolCareCard({ device, onClick, onKeyDown }: CoolCareCardProps) {
    return (
        <BaseCardShell
            device={device}
            onClick={onClick}
            onKeyDown={onKeyDown}
            theme={REQUEST_THEMES.cool}
            batteryLevel={device.lastBleBattery}
        >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pl-3">
                <SensorMetric
                    label="INTERNAL"
                    value={device.lastWiredTemp}
                    colorClass="text-sensor-wired"
                    borderColorClass="border-sensor-wired/10"
                    bgClass="bg-sensor-wired"
                />
                <SensorMetric
                    label="AMBIENT"
                    value={device.lastBleTemp}
                    colorClass="text-sensor-wireless"
                    borderColorClass="border-sensor-wireless/10"
                    bgClass="bg-sensor-wireless"
                />
                {device.lastBleHumidity !== undefined && (
                    <HumidityBanner value={device.lastBleHumidity} />
                )}
            </div>
        </BaseCardShell>
    );
}
