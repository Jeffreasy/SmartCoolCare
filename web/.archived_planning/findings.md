# Findings & Decisions

## Requirements
<!-- Captured from user request -->
- Perform a comprehensive audit of the entire KoelkastProjectV2 codebase.
- Analyze Frontend, Backend, and Firmware.
- Use the `planning-with-files` skill to track progress and findings.

## Research Findings
<!-- Key discoveries during exploration -->
- **Project Structure**:
  - `firmware/`: ESP32 firmware using PlatformIO.
  - `web/`: Frontend/Backend monorepo using Astro, React, and Convex.
- **Technology Stack** (verified):
  - **Frontend**: Astro 5.16, React 18.3, Tailwind 3.4
  - **Backend**: Convex 1.13.6
  - **Auth Libraries**: **Clerk is the active provider.** `ConvexAuthProvider.tsx` explicitly uses `ConvexProviderWithClerk` and `ClerkProvider`. The `@auth/core` dependency might be unused.
  - **Charts**: Chart.js 4.4
  - **Tailwind**: Configured with a "Deep Glassmorphism" system (`boxShadow: glass`, `colors: surface.dark`).
  - Communication: HTTP Telemetry, Real-time updates

## Technical Decisions
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
|          |           |

  - **Key Issue**: `Layout.astro` claims to include `ConvexAuthProvider` in comments, but the implementation is missing. This means the app likely has no auth context at the root level.
  - **Environment**: `.env` and `.env.local` contain Clerk keys.

- **Firmware (ESP32)**:
  - **Logic**: Robust implementation in `main.ino` with Deep Sleep, BLE Retries, and Remote Config.
  - **Integration**: JSON payload generation matches Convex schema perfectly (Values sent as raw numbers, not strings).
  - **CRITICAL SECURITY RISK**: `config.h` contains hardcoded WiFi credentials (`Zyxel_1369`) and `CONVEX_SECRET`. These must be moved to a `secrets.h` file and added to `.gitignore`.

## Issues Encountered
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
| `Layout.astro` missing Auth Provider | **Resolved**: Intentional pattern. Islands used. |
| Hardcoded Credentials in `config.h` | **Resolved**: Extracted to `firmware/main/secrets.h` and added to `.gitignore`. |
| Auth Library Conflict | **Resolved**: Removed unused `@auth/core` dependency. |
| Missing Docs for Auth Pattern | **Resolved**: Added comments to `Layout.astro`. |
| Float Precision in Firmware | **Resolved**: Removed fixed decimal formatting in `main.ino`. |


## Resources
<!-- URLs, file paths, API references -->
-

## Visual/Browser Findings
<!-- CRITICAL: Update after every 2 view/browser operations -->
-
