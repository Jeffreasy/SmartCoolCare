export enum DeviceType {
    COOLCARE_FRIDGE = 'fridge',
    COOLCARE_FREEZER = 'freezer',
    SENSOR_NODE = 'sensor',
    GATEWAY_HUB = 'gateway',
}

export interface BaseDeviceData {
    _id: string;
    deviceId: string;
    displayName?: string;
    deviceType?: string; // String from DB, mapped to enum
    lastDeviceStatus: string; // 'online' | 'offline' | 'degraded'
    lastSeenAt: number;
    lastSignalStrength: number;
    minTemp?: number;
    maxTemp?: number;
}

export interface CoolCareDevice extends BaseDeviceData {
    lastWiredTemp?: number;    // Internal
    lastBleTemp?: number;      // Ambient
    lastBleHumidity?: number;  // Ambient
    lastBleBattery?: number;
}

export interface SensorNodeDevice extends BaseDeviceData {
    lastBleTemp?: number;
    lastBleHumidity?: number;
    lastBleBattery?: number;
}

export interface GatewayHubDevice extends BaseDeviceData {
    // Gateway specific metrics (uptime, version, etc - for future)
}

// Helper to determine type safely
export function getDeviceType(device: BaseDeviceData): DeviceType {
    const type = device.deviceType?.toLowerCase();

    if (type === 'fridge' || type === 'koelkast') return DeviceType.COOLCARE_FRIDGE;
    if (type === 'freezer' || type === 'diepvries') return DeviceType.COOLCARE_FREEZER;
    if (type === 'sensor' || type === 'ble') return DeviceType.SENSOR_NODE;
    if (type === 'gateway' || type === 'hub') return DeviceType.GATEWAY_HUB;

    // Default fallback based on available data
    if ((device as CoolCareDevice).lastWiredTemp !== undefined) return DeviceType.COOLCARE_FRIDGE;

    return DeviceType.SENSOR_NODE;
}
