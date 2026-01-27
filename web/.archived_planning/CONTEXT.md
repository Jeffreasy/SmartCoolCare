AGENT CONTEXT: Project Antigravity
Role: You are the Lead Architect for "Antigravity", a robust IoT system monitoring SmartCool refrigeration units. Core Objective: Maintain strict data integrity between ephemeral ESP32 hardware (C++) and the reactive frontend (Astro/React) via the Convex backend.

1. The Stack & Architecture
Hardware (Edge): ESP32 (Deep Sleep enabled, Battery powered). Uses C++ (Arduino framework).

Backend (Hub): Convex (Serverless Database & Functions). This is the "Source of Truth".

Frontend (UI): Astro (Static/SSR) + React Islands (Interactive Dashboards).

2. Data Flow Rules (Immutable)
The system operates on a "Check-in" model due to ESP32 deep sleep.

Ingest: ESP32 wakes up -> Measures -> POST JSON to Convex HTTP Action.

Process: Convex parses JSON -> Validates via Schema -> Stores in `wiredReadings` and `bleReadings`.

Command: Convex responds to the POST.
*   *Current Reality*: Backend returns "OK" (200).
*   *Firmware Expectation*: Firmware expects JSON `{"config": { ... }}`.
*   **WARNING**: Remote Config is currently effectively disabled due to this mismatch.

Visualize: Astro/React subscribes to Convex Query (`getLiveSensors`) -> UI updates in realtime.

3. Critical Folder: /convex
You are responsible for maintaining these specific files. Do not break the contract between C++ and TS.

A. convex/schema.ts (The Contract)
The database structure is currently split to optimize for different sensor types:

TypeScript

defineSchema({
  users: defineTable({
    email: v.string(),
    tokenIdentifier: v.string(),
    // ...
  }),
  devices: defineTable({
    deviceId: v.string(),
    userId: v.optional(v.id("users")),
    lastSeenAt: v.number(),
    lastDeviceStatus: v.string(), // "healthy", "degraded", "offline"
    // Sensor Cache fields (lastWiredTemp, lastBleTemp, etc.)
  }),
  wiredReadings: defineTable({
    deviceId: v.string(),
    temperature: v.number(),
    userId: v.optional(v.id("users")),
  }),
  bleReadings: defineTable({
    deviceId: v.string(),
    temperature: v.number(),
    humidity: v.number(),
    battery: v.number(),
    signalStrength: v.number(),
    userId: v.optional(v.id("users")),
  })
})

B. convex/http.ts (The Gatekeeper)
Input: Receives POST request from ESP32 at `/ingestSensorData`.

Logic:
1.  Receives JSON payload.
2.  Extracts fields (`sensorId`, `value`, `signal`, `tempBle`, `humidity`, `battery`).
3.  Calls mutation `api.sensors.addMeasurement` to store data.
4.  Returns simple `200 OK` (Note: This breaks firmware config parsing).

4. Hardware/Firmware Context (C++)
The Agent must understand that the ESP32 is NOT always online.

JSON Payload Structure:
The C++ sends this exact format:

JSON

{
  "sensorId": "Koelkast_A",
  "value": 4.5,
  "status": "ok",
  "signal": -70,
  "mac": "...",
  // Optional if BLE found:
  "tempBle": 5.1,
  "humidity": 60.5,
  "battery": 87
}

5. Development Guidelines
Updates: When asking to "add a sensor", you must update:
*   The C++ struct `TelemetryData`.
*   The JSON construction in `sendToConvex()`.
*   The `convex/schema.ts` definition (wired or ble readings).
*   The `convex/http.ts` parser and `convex/sensors.ts` mutation.

Safety: Never expose the CONVEX_SECRET in client-side code (Astro/React). Only use it in C++ and Convex Actions.
