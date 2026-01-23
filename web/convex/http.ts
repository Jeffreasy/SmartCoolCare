import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ========================================================================
// ESP32 TELEMETRY INGESTION ENDPOINT
// ========================================================================
http.route({
    path: "/ingestSensorData",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const secret = request.headers.get("x-esp32-secret");

        // Security check
        if (secret !== process.env.ESP32_SECRET) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();

        // Use exact field names from firmware JSON
        const {
            sensorId,    // "Koelkast_A"
            value,       // 19.75 (wired temp)
            status,      // "ok"
            signal,      // -46 (RSSI)
            mac,         // "68:25:DD:F3:1A:80"
            // BLE Sensor Data (optional)
            tempBle,     // 24.26
            humidity,    // 35.75
            battery,      // 87
            // Logs (optional)
            logs          // Array of { level, code, message, meta }
        } = body;

        // Process sensor data
        await ctx.runMutation(api.sensors.addMeasurement, {
            sensorId,
            value,
            status,
            signal,
            mac,
            // Optional BLE fields
            tempBle: tempBle ?? undefined,
            humidity: humidity ?? undefined,
            battery: battery ?? undefined,
            // Pipe logs to mutation
            logs: logs ?? undefined
        });

        // Fetch latest config (calibration) from device record
        const deviceConfig = await ctx.runQuery(api.sensors.getDeviceConfig, {
            sensorId
        });

        // Fetch device record for sleep settings (if custom per-device later)
        const deviceRecord = await ctx.runQuery(api.sensors.getDeviceRecord, {
            sensorId
        });

        return new Response(JSON.stringify({
            config: {
                sleepDuration: deviceRecord?.sleepDuration || 300, // Default 5 min
                scanDuration: deviceRecord?.scanDuration || 10,    // Default 10 sec
                // Send calibration offsets
                tempOffsetWired: deviceConfig?.tempOffsetWired ?? 0,
                tempOffsetBle: deviceConfig?.tempOffsetBle ?? 0
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }),
});

export default http;