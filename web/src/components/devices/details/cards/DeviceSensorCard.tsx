import { BatteryIcon } from "../../../ui/icons";
import { Cpu, Thermometer } from "lucide-react";

interface DeviceSensorCardProps {
    type: 'wired' | 'wireless';
    temperature?: number;
    humidity?: number;
    battery?: number;
    offset?: number;
    label?: string;
}

export default function DeviceSensorCard({ type, temperature, humidity, battery, offset, label }: DeviceSensorCardProps) {
    const isWired = type === 'wired';
    const colorClass = isWired ? "text-sensor-wired" : "text-sensor-wireless";
    const Icon = isWired ? Cpu : Thermometer;
    const defaultLabel = isWired ? "Wired Sensor" : "Ambient Sensor";

    return (
        <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Icon className={`w-32 h-32 ${colorClass}`} strokeWidth={1} />
            </div>
            <h3 className={`${colorClass} text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2`}>
                <Icon className="w-5 h-5 md:hidden" /> {label || defaultLabel}
            </h3>
            <div className="text-5xl md:text-6xl font-mono font-bold text-foreground my-4 tracking-tighter">
                {temperature !== undefined ? `${temperature.toFixed(1)}°` : '--'}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium mt-2">
                {humidity !== undefined && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sensor-humidity/10 text-sensor-humidity border border-sensor-humidity/20">
                        💧 {humidity.toFixed(0)}%
                    </span>
                )}
                {battery !== undefined && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border">
                        <BatteryIcon level={battery} />
                    </div>
                )}
                {offset !== undefined && (
                    <div className="text-sm text-muted-foreground bg-muted/50 w-fit px-3 py-1 rounded-full border border-border">
                        Offset: {offset}°C
                    </div>
                )}
            </div>
        </div>
    );
}
