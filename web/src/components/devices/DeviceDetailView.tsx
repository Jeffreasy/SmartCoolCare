import { DeviceType, getDeviceType } from "@/domain/device-types";
import type { BaseDeviceData, CoolCareDevice, SensorNodeDevice } from "@/domain/device-types";
import CoolCareDetail from "./details/CoolCareDetail";
import SensorNodeDetail from "./details/SensorNodeDetail";

interface DeviceDetailViewProps {
    device: any; // Using any for flexibility with Convex types, we cast internally
    activeTab?: 'overview' | 'history' | 'settings';
    onTabChange?: (tab: 'overview' | 'history' | 'settings') => void;
}

export default function DeviceDetailView({ device, activeTab, onTabChange }: DeviceDetailViewProps) {
    const type = getDeviceType(device as BaseDeviceData);

    switch (type) {
        case DeviceType.COOLCARE_FRIDGE:
        case DeviceType.COOLCARE_FREEZER:
            return (
                <CoolCareDetail
                    device={device as CoolCareDevice}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
            );
        case DeviceType.SENSOR_NODE:
        case DeviceType.GATEWAY_HUB:
        default:
            // Use Sensor detail for generic nodes and gateway for now (or create GatewayDetail later)
            return (
                <SensorNodeDetail
                    device={device as SensorNodeDevice}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />
            );
    }
}
