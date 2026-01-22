# 🧊 KoelkastProjectV2

IoT monitoring systeem voor koelkasten met ESP32 hardware en real-time dashboard.

## 🏗️ Architectuur

- **Firmware**: ESP32 met PlatformIO (C++)
  - DS18B20 temperatuur sensor
  - BLE scanning voor remote sensoren
  - Deep sleep power management
  - HTTP telemetrie naar Convex

- **Backend**: Convex (TypeScript)
  - Real-time database
  - HTTP Actions voor telemetrie ingestion
  - Queries voor dashboard data
  - Alert generation

- **Frontend**: Astro + React
  - Static site met React islands
  - Chart.js voor visualisatie
  - Real-time updates via Convex

## 🚀 Quick Start

### 1. Convex Setup

```bash
cd web
npx convex dev
```

Dit opent de Convex dashboard waar je een nieuw project kunt aanmaken.
Kopieer de `CONVEX_URL` die je krijgt.

### 2. Environment Variables

```bash
cd web
cp .env.example .env
```

Edit `.env` en voeg je Convex URL toe:
```
PUBLIC_CONVEX_URL=https://jouw-project.convex.cloud
```

### 3. Start Dashboard

```bash
cd web
npm run dev
```

Dashboard draait nu op `http://localhost:4321`

### 4. ESP32 Firmware

Update `firmware/src/main.cpp`:
```cpp
const char* WIFI_SSID = "JOUW_WIFI";
const char* WIFI_PASS = "JOUW_WACHTWOORD";
const char* CONVEX_URL = "https://jouw-project.convex.cloud";
const char* DEVICE_NAME = "Koelkast_A";
```

Upload firmware:
```bash
cd firmware
pio run --target upload
pio device monitor
```

## 📁 Project Structuur

```
KoelkastProjectV2/
├── firmware/
│   ├── src/main.cpp          # ESP32 code
│   └── platformio.ini        # PlatformIO config
└── web/
    ├── convex/
    │   ├── schema.ts         # Database schema
    │   └── iot.ts            # Backend logica
    ├── src/
    │   ├── pages/
    │   │   └── index.astro   # Dashboard
    │   ├── components/
    │   │   ├── DeviceCard.tsx
    │   │   ├── TemperatureChart.tsx
    │   │   └── ConvexProvider.tsx
    │   └── layouts/
    │       └── Layout.astro
    └── package.json
```

## 🔧 Development

### Web Dashboard
```bash
cd web
npm run dev          # Start dev server
npm run build        # Build for production
```

### Convex Backend
```bash
cd web
npx convex dev       # Dev mode (auto-sync)
npx convex deploy    # Deploy to production
```

### ESP32 Firmware
```bash
cd firmware
pio run              # Compile
pio run -t upload    # Upload
pio device monitor   # Serial monitor
```

## 📊 Features

- ✅ Real-time temperatuur monitoring
- ✅ Multiple device support
- ✅ BLE sensor integration
- ✅ Alert generation (temp thresholds)
- ✅ Historical data charts
- ✅ Online/offline status
- ✅ Deep sleep power saving
- ✅ Responsive dashboard

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Hardware | ESP32 |
| Sensors | DS18B20, BLE |
| Backend | Convex |
| Frontend | Astro + React |
| Charts | Chart.js |
| Language | TypeScript, C++ |

## 📝 License

MIT
