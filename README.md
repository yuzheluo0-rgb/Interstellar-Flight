# Interstellar-Flight ✈🌌

**3D Star Galaxy Focus Timer** — a desktop productivity app built with Electron + React + Three.js.

Book flights between **58 cities across 7 unique galaxies**, track focus sessions with a real-time boarding pass, and watch your starship travel across the cosmos.

## Features

- **3D Star Galaxy Map** — 7 uniquely shaped galaxies (spiral, elliptical, ring, irregular, barred, twin, sparse) with shader-rendered star flares
- **400 Flight Routes** — curved light beams connecting cities, unlockable by mileage
- **Real-time Boarding Pass** — realistic airline ticket design with random barcode, cream/navy color scheme
- **Float Window** — mini boarding pass + progress bar when minimized
- **Flight Window View** — procedural deep space scene with 8 orbiting planets, comets, meteors, and Milky Way band
- **Window Controls** — native Windows title bar

## Tech Stack

Electron 42 · React 19 · Three.js / R3F / Drei · Zustand · Tailwind CSS · Vite · SQLite (sql.js)

## Download

Get the latest release from [Releases](https://github.com/yuzheluo0-rgb/Interstellar-Flight/releases).

Download `Interstellar-Flight-win32-x64.zip`, extract, and run `Interstellar-Flight.exe`.

## Quick Start

1. Click a star → select departure city (gold highlight)
2. Click another star → select destination (blue highlight)  
3. Choose duration and flight type in the right sidebar
4. Click "预订航班" to confirm → focus timer starts
5. Minimize the window → float window shows boarding pass + progress bar

## Build from Source

```bash
pnpm install
pnpm dev   # Development mode
```

*Source files (.tsx/.ts) are currently being reconstructed. The release package contains the working compiled application.*

## License

MIT
