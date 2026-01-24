import type { SensorNodeDevice } from "@/domain/device-types";
import { SensorMetric, StatusHeader, FooterMetrics, HumidityBanner } from "./SharedComponents";

interface SensorNodeCardProps {
    device: SensorNodeDevice;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

export function SensorNodeCard({ device, onClick, onKeyDown }: SensorNodeCardProps) {
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
                hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10
                group
                focus:outline-none focus:ring-2 focus:ring-primary/50
            `}
        >
            {/* Decorative Glow Line (Green for Generic Sensor) */}
            <div className={`
                absolute top-0 left-0 bottom-0 w-1.5
                ${isOnline ? 'bg-gradient-to-b from-emerald-400 to-teal-600' : 'bg-slate-700'}
                shadow-[0_0_15px_rgba(52,211,153,0.3)]
            `} />

            <StatusHeader device={device} isOnline={isOnline} />

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

            <FooterMetrics
                device={device}
                showBattery={device.lastBleBattery !== undefined}
                batteryLevel={device.lastBleBattery}
            />
        </div>
    );
}
