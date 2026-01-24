import type { CoolCareDevice } from "@/domain/device-types";
import { SensorMetric, StatusHeader, FooterMetrics, HumidityBanner } from "./SharedComponents";

interface CoolCareCardProps {
    device: CoolCareDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function CoolCareCard({ device, onClick, onKeyDown }: CoolCareCardProps) {
    const isOnline = device.lastDeviceStatus !== "offline";

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className={`
                glass-card
                relative overflow-hidden
                p-4 sm:p-6
                cursor-pointer
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/10
                group
                focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
        >
            {/* Decorative Glow Line (Blue/Cool for Fridge) */}
            <div className={`
                absolute top-0 left-0 bottom-0 w-1.5
                ${isOnline ? 'bg-gradient-to-b from-blue-400 to-indigo-600' : 'bg-slate-700'}
                shadow-[0_0_15px_rgba(96,165,250,0.3)]
            `} />

            <StatusHeader device={device} isOnline={isOnline} />

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

            <FooterMetrics
                device={device}
                showBattery={device.lastBleBattery !== undefined}
                batteryLevel={device.lastBleBattery}
            />
        </div>
    );
}
