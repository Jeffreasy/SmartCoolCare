import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import DeviceDetailModal from "./DeviceDetailModal";
import { Cpu, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeviceType, getDeviceType } from "@/domain/device-types";
import type { BaseDeviceData, CoolCareDevice, SensorNodeDevice, GatewayHubDevice } from "@/domain/device-types";

// Card Implementations
import { CoolCareCard } from "./devices/cards/CoolCareCard";
import { SensorNodeCard } from "./devices/cards/SensorNodeCard";
import { GatewayCard } from "./devices/cards/GatewayCard";

interface DeviceCardProps {
    onAddDevice?: () => void;
}

export default function DeviceCard(props: DeviceCardProps) {
    // Secure: Use authenticated query
    const devices = useQuery(api.sensors.getLiveSensors);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    // Find selected device from the list
    const selectedDevice = devices?.find(d => d._id === selectedDeviceId) || null;

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- Interaction Handlers ---

    const handleCardClick = (deviceId: string) => {
        if (isMobile) {
            window.location.assign(`/devices/${deviceId}`);
        } else {
            setSelectedDeviceId(deviceId);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, deviceId: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(deviceId);
        }
    };

    // --- Dispatcher Logic ---

    const renderDeviceCard = (device: BaseDeviceData) => {
        const type = getDeviceType(device);

        switch (type) {
            case DeviceType.COOLCARE_FRIDGE:
            case DeviceType.COOLCARE_FREEZER:
                return (
                    <CoolCareCard
                        key={device._id}
                        device={device as CoolCareDevice}
                        onClick={() => handleCardClick(device._id)}
                        onKeyDown={(e) => handleKeyDown(e, device._id)}
                    />
                );
            case DeviceType.GATEWAY_HUB:
                return (
                    <GatewayCard
                        key={device._id}
                        device={device as GatewayHubDevice}
                        onClick={() => handleCardClick(device._id)}
                        onKeyDown={(e) => handleKeyDown(e, device._id)}
                    />
                );
            case DeviceType.SENSOR_NODE:
            default:
                return (
                    <SensorNodeCard
                        key={device._id}
                        device={device as SensorNodeDevice}
                        onClick={() => handleCardClick(device._id)}
                        onKeyDown={(e) => handleKeyDown(e, device._id)}
                    />
                );
        }
    };

    // --- Loading / Empty States ---

    if (!devices) {
        return (
            <div className="glass-card p-8 flex flex-col items-center justify-center min-h-[200px]">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Laden van devices...</p>
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="glass-card p-8 text-center max-w-md mx-auto mt-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cpu className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-200 mb-2">No Devices Linked</h3>
                <p className="text-slate-500 mb-6">Je hebt nog geen apparaten aan je account toegevoegd.</p>
                <Button onClick={props.onAddDevice} className="w-full gap-2">
                    <Plus className="w-5 h-5" />
                    Nieuw Apparaat Koppelen
                </Button>
            </div>
        );
    }

    // --- Main Render ---

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((device) => {
                    // Cast to BaseDeviceData to satisfy TS
                    return renderDeviceCard(device as unknown as BaseDeviceData);
                })}
            </div>

            {selectedDevice && (
                <DeviceDetailModal
                    device={selectedDevice}
                    onClose={() => setSelectedDeviceId(null)}
                />
            )}
        </>
    );
}
