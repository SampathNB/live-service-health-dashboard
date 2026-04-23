# Pulse: Real-Time Service Health Dashboard

A production-grade observability platform designed for high-performance service monitoring, built with **React 18**, **Tailwind CSS 4**, and **WebSockets**.

## Key Features
- **🚀 Live Metric Streaming:** Real-time telemetry for latency percentiles (p50, p95, p99), throughput, and error rates.
- **🗺️ Health Lattice:** A multi-dimensional grid visualizing the health and topology of 20+ simulated microservices.
- **🚨 Intelligence Alerts:** Automated incident detection with interactive lifecycle management (Acknowledge/Resolve).
- **🌓 Adaptive Theme:** System-aware dark/light mode with smooth transitions and CSS variable-driven styling.
- **🛡️ Resilient UI:** Error boundaries and feature flagging ensure stability and controlled rollouts.

## Architecture
For a deep dive into the technical design, design patterns, and system components, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS 4, Motion, Recharts, Zustand, TanStack Query.
- **UI Components:** Lucide React, Sonner (Toasts).
- **Backend:** Node.js (Express), WebSockets (ws).
