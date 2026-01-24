import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMemo, useState, useEffect } from "react";
import type { TimeRange, ChartDataPoint, StatisticsData } from "../components/analytics/ChartConfig";

export function useTelemetryData(
    deviceName: string,
    timeRange: TimeRange,
    customStartTime: number | null,
    minTemp?: number,
    maxTemp?: number,
    isLive: boolean = false
) {
    // 1. Calculate Start Time
    const startTime = useMemo(() => {
        if (timeRange === 'CUSTOM' && customStartTime) return customStartTime;

        const now = Date.now();
        const ranges: Record<string, number> = {
            '1H': 60 * 60 * 1000,
            '6H': 6 * 60 * 60 * 1000,
            '24H': 24 * 60 * 60 * 1000,
            '7D': 7 * 24 * 60 * 60 * 1000,
            '30D': 30 * 24 * 60 * 60 * 1000,
        };

        if (timeRange === 'CUSTOM') {
            return now - ranges['24H']; // Fallback
        }

        return now - (ranges[timeRange] || ranges['24H']);
    }, [timeRange, customStartTime]);

    // 2. Fetch Data
    const telemetry = useQuery(
        api.sensors.getHistory,
        { sensorId: deviceName, startTime, limit: 1000 } // Limit protects performance
    );

    // 3. Live Mode Trigger (Optional, though useQuery is reactive by default)
    useEffect(() => {
        if (!isLive) return;
        // In Convex, subscriptions are automatic, so we don't strictly need a polling interval
        // unless we want to force UI updates for "relative time" labels.
    }, [isLive]);


    // 4. Process Data for Chart
    const chartData = useMemo<ChartDataPoint[] | null>(() => {
        if (!telemetry) return null;

        const wiredData = telemetry?.wired || [];
        const bleData = telemetry?.ble || [];

        const allData = [
            ...wiredData.map(r => ({
                time: r._creationTime,
                wiredTemp: r.temperature,
                bleTemp: null,
                humidity: null
            })),
            ...bleData.map(r => ({
                time: r._creationTime,
                wiredTemp: null,
                bleTemp: r.temperature,
                humidity: r.humidity
            })),
        ].sort((a, b) => a.time - b.time);

        return allData;
    }, [telemetry]);

    // 5. Process Statistics
    const statistics = useMemo<StatisticsData | null>(() => {
        if (!chartData) return null;

        const calculateMetricStats = (dataPoints: { val: number | null, time: number }[]) => {
            const validPoints = dataPoints.filter((d): d is { val: number, time: number } => d.val !== null);
            if (validPoints.length === 0) return null;

            const values = validPoints.map(d => d.val);
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;

            // Standard Deviation
            const squareDiffs = values.map(value => Math.pow(value - avg, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            // Min/Max
            const min = validPoints.reduce((prev, curr) => curr.val < prev.val ? curr : prev);
            const max = validPoints.reduce((prev, curr) => curr.val > prev.val ? curr : prev);

            // Time in Range (Safe)
            let safeCount = 0;
            if (minTemp !== undefined || maxTemp !== undefined) {
                safeCount = validPoints.filter(d => {
                    if (minTemp !== undefined && d.val < minTemp) return false;
                    if (maxTemp !== undefined && d.val > maxTemp) return false;
                    return true;
                }).length;
            } else {
                safeCount = validPoints.length;
            }
            const timeInRange = (safeCount / validPoints.length) * 100;

            return {
                current: values[values.length - 1],
                min,
                max,
                avg,
                stdDev,
                timeInRange,
                count: validPoints.length
            };
        };

        return {
            wired: calculateMetricStats(chartData.map(d => ({ val: (d.wiredTemp !== null && d.wiredTemp > -50) ? d.wiredTemp : null, time: d.time }))),
            ble: calculateMetricStats(chartData.map(d => ({ val: (d.bleTemp !== null && d.bleTemp > -50) ? d.bleTemp : null, time: d.time }))),
            humidity: calculateMetricStats(chartData.map(d => ({ val: d.humidity, time: d.time })))
        };
    }, [chartData, minTemp, maxTemp]);

    return {
        chartData,
        statistics,
        isLoading: telemetry === undefined
    };
}
