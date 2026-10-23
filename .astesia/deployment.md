# DevOps Deployment & Infrastructure Plan — Flora SMK
**Project Name:** Flora SMK (Botanidex)
**Status:** Completed & Live Public
**Current Active Live URL:** `https://forums-rebound-marc-bent.trycloudflare.com`

---

## 1. Live Public Deployment Overview

### A. Active Cloudflare Edge Tunnel (Instant Public Access)
- **Protocol:** Cloudflare Quick Tunnel (QUIC / HTTP2)
- **Public URL:** `https://forums-rebound-marc-bent.trycloudflare.com`
- **Origin Server:** Vite Production Preview (Port 4173) with `allowedHosts: true`
- **Capabilities:** Offline-first PWA, responsive mobile & desktop layout, QR Scanner, Interactive School Map, Plant Catalog, Teacher Moderation CMS, and Admin Portal.

### B. Vercel Serverless Hosting (Edge / Serverless)
- **Adapter:** `@sveltejs/adapter-vercel`
- **Output:** `.vercel/output`
- **Build Command:** `npm run build` (with `VERCEL=1`)
- **Route Handling:** Serverless functions for dynamic API routes, edge CDN for pre-rendered pages and static assets.

---

## 2. Containerization (Docker)
- **Base Image:** `node:22-alpine` (Minimal attack surface)
- **Multi-Stage Build Stages:**
  1. `base`: Alpine base image with curl for healthchecks.
  2. `deps`: Clean installation of npm dependencies (`npm ci`).
  3. `builder`: Compile SvelteKit 5 runes with `@sveltejs/adapter-node` (`ADAPTER=node npm run build`).
  4. `runner`: Production slim runtime with non-root user execution (`appuser:appgroup`).
- **User Permission:** Non-Root (`USER appuser`)
- **Exposed Port:** `3000`
- **Health Check Endpoint:** `GET /health` (`status: 200 OK`)

---

## 3. Docker Compose Orchestration
- **Development (`docker-compose.dev.yml`):**
  - Hot-reload mount (`src:/app/src`)
  - Target: `builder`
  - Port: `5173`
- **Production (`docker-compose.prod.yml`):**
  - Target: `runner`
  - Port: `3000`
  - Resource Limits: `cpus: 1.0`, `memory: 512M`
  - Health check polling every 30s.

---

## 4. CI/CD Pipeline (GitHub Actions)
- **Workflow File:** `.github/workflows/ci.yml`
- **Triggers:** Push to `main` / `master` and Pull Requests
- **Pipeline Stages:**
  1. `Checkout Code`: Checkout with full history.
  2. `Setup Node.js`: Node.js 22 with npm dependency cache.
  3. `Install Dependencies`: `npm ci`.
  4. `Static Analysis & Typecheck`: `npm run check` (0 errors, 0 warnings).
  5. `Automated Tests`: `npm run test` (46 Vitest unit tests passing).
  6. `Dual Target Build`:
     - Build with `@sveltejs/adapter-vercel` (`VERCEL=1`).
     - Build with `@sveltejs/adapter-node` (`ADAPTER=node`).

---

## 5. Observability & Monitoring
- **Health Endpoint:** `GET /health` returning JSON `{ status: "ok", timestamp: ISOString, service: "flora-smk" }`.
- **Client Offline Telemetry:** Service Worker sync and OfflineBanner component reporting connection state to UI.
- **Logging:** Structured console stdout logging ready for ingest via CloudWatch / Papertrail / Datadog.

---

## 6. Rollback & Disaster Recovery
- **Rollback Strategy:**
  - Git tag reversion triggering immediate automated rebuild.
  - Vercel instant deployment rollback via dashboard or CLI (`vercel rollback`).
  - Container tag pinning (`app:v1.0.0`) preventing unexpected drift.
