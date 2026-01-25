import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// ========================================================================
// GATEKEEPER ENDPOINT - Receives data from Go Backend
// ========================================================================
http.route({
    path: "/api/gatekeeper/ingest",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // 1. Validate Deploy Key (authentication from Go)
        const deployKey = request.headers.get("x-convex-deploy-key");

        if (deployKey !== process.env.CONVEX_DEPLOY_KEY) {
            console.error("[Gatekeeper] Invalid deploy key");
            return new Response("Unauthorized", { status: 401 });
        }

        // 2. Parse enriched payload from Go
        const body = await request.json();

        const {
            sensorId,
            value,
            status,
            signal,
            mac,
            tempBle,
            humidity,
            battery,
            logs,
            tenantId,  // Added by Go Gatekeeper
            timestamp  // Added by Go
        } = body;

        console.log(`[Gatekeeper] Telemetry from ${sensorId} (tenant: ${tenantId})`);

        // 3. Call existing mutation to store data
        await ctx.runMutation(api.sensors.addMeasurement, {
            sensorId,
            value,
            status,
            signal,
            mac: mac ?? undefined,
            tempBle: tempBle ?? undefined,
            humidity: humidity ?? undefined,
            battery: battery ?? undefined,
            logs: logs ?? undefined
        });

        // 4. Get device configuration to return
        const deviceConfig = await ctx.runQuery(api.sensors.getDeviceConfig, {
            sensorId
        });

        const deviceRecord = await ctx.runQuery(api.sensors.getDeviceRecord, {
            sensorId
        });

        // 5. Return configuration for ESP32
        return new Response(JSON.stringify({
            status: "success",
            config: {
                sleepDuration: deviceRecord?.sleepDuration || 300,
                scanDuration: deviceRecord?.scanDuration || 10,
                tempOffsetWired: deviceConfig?.tempOffsetWired ?? 0,
                tempOffsetBle: deviceConfig?.tempOffsetBle ?? 0
            }
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }),
});

// ========================================================================
// LEGACY ESP32 ENDPOINT - Direct ingestion (deprecated)
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

        const {
            sensorId,
            value,
            status,
            signal,
            mac,
            tempBle,
            humidity,
            battery,
            logs
        } = body;

        await ctx.runMutation(api.sensors.addMeasurement, {
            sensorId,
            value,
            status,
            signal,
            mac: mac ?? undefined,
            tempBle: tempBle ?? undefined,
            humidity: humidity ?? undefined,
            battery: battery ?? undefined,
            logs: logs ?? undefined
        });

        const deviceConfig = await ctx.runQuery(api.sensors.getDeviceConfig, {
            sensorId
        });

        const deviceRecord = await ctx.runQuery(api.sensors.getDeviceRecord, {
            sensorId
        });

        return new Response(JSON.stringify({
            config: {
                sleepDuration: deviceRecord?.sleepDuration || 300,
                scanDuration: deviceRecord?.scanDuration || 10,
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