import { SignalIcon } from "../../../ui/icons";
import type { CoolCareDevice, SensorNodeDevice } from "@/domain/device-types";

// Helper for relative time
function timeAgo(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function DeviceStatusCard({ device }: { device: CoolCareDevice | SensorNodeDevice }) {
    return (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-4 border-b border-border pb-2">Device Status</h3>
            <div className="space-y-6">
                <div className="flex justify-between items-center group">
                    <span className="text-muted-foreground text-base">Condition</span>
                    <span className={`text-base font-semibold px-3 py-1 rounded-full border ${device.lastDeviceStatus === 'online' ? 'bg-status-success/10 text-status-success border-status-success/20' :
                        device.lastDeviceStatus === 'warning' ? 'bg-status-warning/10 text-status-warning border-status-warning/20' :
                            'bg-status-error/10 text-status-error border-status-error/20'
                        } capitalize`}>
                        {device.lastDeviceStatus}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-base">Signal</span>
                    <div className="flex items-center gap-3 bg-secondary/30 px-3 py-1.5 rounded-lg">
                        <span className="text-foreground font-mono font-medium">{device.lastSignalStrength} dBm</span>
                        <SignalIcon rssi={device.lastSignalStrength} />
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-base">Last Seen</span>
                    <span className="text-foreground text-base font-medium">{timeAgo(device.lastSeenAt)}</span>
                </div>
            </div>
        </div>
    );
}
