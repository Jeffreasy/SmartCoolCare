import { useState } from "react";
import { ResponsiveModal } from "./ui/Modal";
import type { Id } from "../../convex/_generated/dataModel";
import { DeviceTypeIcon } from "./ui/icons";
import DeviceDetailView from "./devices/DeviceDetailView";
import type { BaseDeviceData } from "@/domain/device-types";

interface DeviceDetailModalProps {
    device: any; // Using any to accept the raw Convex object, but casting inside component
    onClose: () => void;
}

export default function DeviceDetailModal({ device: rawDevice, onClose }: DeviceDetailModalProps) {
    const device = rawDevice as BaseDeviceData;
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'settings'>('overview');

    const HeaderTitle = (
        <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                <DeviceTypeIcon type={device.deviceType} />
                {device.displayName || device.deviceId}
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-mono mt-0.5">ID: {device.deviceId}</p>
        </div>
    );

    return (
        <ResponsiveModal isOpen={!!device} onClose={onClose} title={HeaderTitle} desktopMaxWidth="max-w-5xl">
            <DeviceDetailView
                device={device}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
        </ResponsiveModal>
    );
}
