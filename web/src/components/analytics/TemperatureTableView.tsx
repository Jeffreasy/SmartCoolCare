import type { ChartDataPoint } from "./ChartConfig";

interface TemperatureTableViewProps {
    data: ChartDataPoint[] | null;
}

export default function TemperatureTableView({ data }: TemperatureTableViewProps) {
    if (!data) return <div className="p-4 text-center text-muted-foreground">No data available</div>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                    <tr>
                        <th className="px-4 py-2 text-left text-muted-foreground">Time</th>
                        <th className="px-4 py-2 text-left text-muted-foreground">Wired (°C)</th>
                        <th className="px-4 py-2 text-left text-muted-foreground">BLE (°C)</th>
                        <th className="px-4 py-2 text-left text-muted-foreground">Humidity (%)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {data.slice(0, 50).map((d, i) => (
                        <tr key={i} className="hover:bg-accent/50">
                            <td className="px-4 py-2 text-foreground">
                                {new Date(d.time).toLocaleString('nl-NL')}
                            </td>
                            <td className="px-4 py-2 text-sensor-wired font-mono">
                                {d.wiredTemp !== null ? d.wiredTemp.toFixed(1) : '--'}
                            </td>
                            <td className="px-4 py-2 text-sensor-wireless font-mono">
                                {d.bleTemp !== null ? d.bleTemp.toFixed(1) : '--'}
                            </td>
                            <td className="px-4 py-2 text-sensor-humidity font-mono">
                                {d.humidity !== null ? d.humidity.toFixed(1) : '--'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {data.length > 50 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                    Showing first 50 of {data.length} readings
                </p>
            )}
        </div>
    );
}
