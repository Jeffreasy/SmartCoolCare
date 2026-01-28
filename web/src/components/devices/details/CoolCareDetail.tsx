import { useState, useEffect } from "react";
import type { CoolCareDevice } from "@/domain/device-types";
import { SignalIcon } from "../../ui/icons";
import DeviceDetailTabs from "./tabs/DeviceDetailTabs";
import type { TabType } from "./tabs/DeviceDetailTabs";
import DeviceOverviewTab from "./tabs/DeviceOverviewTab";
import DeviceHistoryTab from "./tabs/DeviceHistoryTab";
import DeviceSettingsTab from "./tabs/DeviceSettingsTab";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

interface CoolCareDetailProps {
    device: CoolCareDevice;
    onClose?: () => void;
    activeTab?: 'overview' | 'history' | 'settings';
    onTabChange?: (tab: 'overview' | 'history' | 'settings') => void;
}

export default function CoolCareDetail({ device, onClose, activeTab: propTab, onTabChange }: CoolCareDetailProps) {
    const [localTab, setLocalTab] = useState<TabType>('overview');
    const activeTab = propTab || localTab;
    const setActiveTab = onTabChange || setLocalTab;

    // Reset tab when device changes
    useEffect(() => {
        if (!propTab) setLocalTab('overview');
        // If propTab is controlled, parent handles reset likely
    }, [device.deviceId, propTab]);

    return (
        <div className="h-full flex flex-col">
            {/* Header / Title */}
            <div className="mb-6 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight text-white mb-1">{device.displayName || device.deviceId}</h2>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{device.deviceId}</span>
                    <span>•</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 cursor-help hover:text-slate-300 transition-colors">
                                    <SignalIcon rssi={device.lastSignalStrength} />
                                    <span>{device.lastSignalStrength} dBm</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Signal Strength</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Navigation */}
            <DeviceDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative px-1">
                {activeTab === 'overview' && (
                    <DeviceOverviewTab device={device} />
                )}

                {activeTab === 'history' && (
                    <DeviceHistoryTab
                        deviceId={device.deviceId}
                        minTemp={(device as any).minTemp}
                        maxTemp={(device as any).maxTemp}
                        enabledMetrics={['wired', 'ble', 'humidity']}
                    />
                )}

                {activeTab === 'settings' && (
                    <DeviceSettingsTab device={device} />
                )}
            </div>
        </div>
    );
}
