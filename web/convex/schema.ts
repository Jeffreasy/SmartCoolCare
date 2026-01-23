import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // ========================================================================
    // USERS TABLE
    // ========================================================================
    users: defineTable({
        email: v.string(),
        role: v.optional(v.string()), // "admin" | "user" (defaults to "user" in logic)
        name: v.optional(v.string()),
        tokenIdentifier: v.string(),
        createdAt: v.optional(v.number()),
    }).index("by_token", ["tokenIdentifier"]),

    // ========================================================================
    // DEVICES TABLE (Metadata + Live Cache for Dashboard)
    // ========================================================================
    devices: defineTable({
        // Identity
        deviceId: v.string(),
        displayName: v.optional(v.string()),

        // Ownership & Security
        userId: v.optional(v.id("users")),
        claimedAt: v.optional(v.number()),
        hardwareMac: v.optional(v.string()),

        // Live Status Cache (Dashboard Performance)
        lastSeenAt: v.number(),
        lastSignalStrength: v.number(),
        lastDeviceStatus: v.string(),  // "healthy", "degraded", "offline"

        // Configuration (Calibration & Thresholds)
        minTemp: v.optional(v.number()), // Lower alert threshold
        maxTemp: v.optional(v.number()), // Upper alert threshold
        deviceType: v.optional(v.string()), // "fridge", "freezer", "wine", etc.
        icon: v.optional(v.string()), // Custom icon override

        // User-Configurable Timing (seconds)
        sleepDuration: v.optional(v.number()), // Sleep between measurements (60-300s)
        scanDuration: v.optional(v.number()),  // BLE scan duration (5-15s)

        config: v.optional(v.object({
            tempOffsetWired: v.optional(v.number()),
            tempOffsetBle: v.optional(v.number()),
        })),

        // Wired Sensor Cache
        lastWiredTemp: v.optional(v.number()),
        lastWiredTimestamp: v.optional(v.number()),

        // BLE Sensor Cache
        lastBleTemp: v.optional(v.number()),
        lastBleHumidity: v.optional(v.number()),
        lastBleBattery: v.optional(v.number()),
        lastBleTimestamp: v.optional(v.number()),
    })
        .index("by_deviceId", ["deviceId"])
        .index("by_userId", ["userId"])
        .index("by_mac", ["hardwareMac"])
        .index("by_status_time", ["lastDeviceStatus", "lastSeenAt"]), // For cron optimization

    // ========================================================================
    // WIRED SENSOR READINGS (DS18B20 Time-Series)
    // ========================================================================
    wiredReadings: defineTable({
        deviceId: v.string(),
        temperature: v.number(),  // °C
        userId: v.optional(v.id("users")),
    })
        .index("by_device", ["deviceId"]) // _creationTime auto-added by Convex
        .index("by_user", ["userId"]),

    // ========================================================================
    // BLE SENSOR READINGS (Xiaomi/Mijia Time-Series)
    // ========================================================================
    bleReadings: defineTable({
        deviceId: v.string(),
        temperature: v.number(),     // °C
        humidity: v.number(),        // % RH ← LUCHTVOCHTIGHEID!
        battery: v.number(),         // %
        signalStrength: v.number(),  // RSSI (dBm)
        userId: v.optional(v.id("users")),
    })
        .index("by_device", ["deviceId"]) // _creationTime auto-added by Convex
        .index("by_user", ["userId"]),

    // ========================================================================
    // DEVICE LOGS (Error & Status History)
    // ========================================================================
    device_logs: defineTable({
        deviceId: v.string(),
        level: v.string(),     // "info" | "warn" | "error" | "critical"
        code: v.optional(v.string()), // "BLE_TIMEOUT", "WIFI_WEAK"
        message: v.string(),
        meta: v.optional(v.any()), // Context (bootCount, rssi, etc)
        timestamp: v.number(),
    })
        .index("by_device_timestamp", ["deviceId", "timestamp"]),
});