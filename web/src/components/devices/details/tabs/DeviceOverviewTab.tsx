import type { CoolCareDevice, SensorNodeDevice } from "@/domain/device-types";
import DeviceStatusCard from "../cards/DeviceStatusCard";
import DeviceSensorCard from "../cards/DeviceSensorCard";
import TemperatureChart from "@/components/analytics/TemperatureChart";

interface DeviceOverviewTabProps {
    device: CoolCareDevice | SensorNodeDevice;
    isSensorNode?: boolean;
}

export default function DeviceOverviewTab({ device, isSensorNode = false }: DeviceOverviewTabProps) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300 pb-8">
            <div className={`grid grid-cols-1 ${!isSensorNode ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>

                {/* 1. Wired Sensor (Fridge Only) */}
                {!isSensorNode && (
                    <DeviceSensorCard
                        type="wired"
                        temperature={(device as CoolCareDevice).lastWiredTemp}
                        offset={(device as any).config?.tempOffsetWired}
                    />
                )}

                {/* 2. Wireless/Ambient Sensor (All Devices) */}
                <DeviceSensorCard
                    type="wireless"
                    label={isSensorNode ? "Sensor Data" : "Ambient"}
                    temperature={device.lastBleTemp}
                    humidity={device.lastBleHumidity}
                    battery={device.lastBleBattery}
                // Show offset only if not sensor node? Or consistent? 
                // CoolCare has wireless offset config too.
                // Let's show it if it exists in config, similar to wired.
                // But currently UI didn't show wireless offset on overview card for CoolCareDetail, only Wired.
                // I'll leave it undefined to match original exact design unless requested.
                />

                {/* 3. Status Card */}
                <DeviceStatusCard device={device} />
            </div>

            {/* Quick Chart Preview */}
            <div className="p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border mt-6">
                <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                    <span>📊</span> Quick History (24h)
                </h4>
                <div className="h-[200px] w-full overflow-hidden relative">
                    <TemperatureChart
                        deviceName={device.deviceId}
                        minTemp={(device as any).minTemp}
                        maxTemp={(device as any).maxTemp}
                        compact={true}
                        enabledMetrics={isSensorNode ? ['ble', 'humidity'] : ['wired', 'ble', 'humidity']}
                    />
                </div>
            </div>
        </div>
    );
}
