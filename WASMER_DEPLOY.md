# Deploying Godly OS to Wasmer.io

Godly OS is fully configured for zero-configuration, global edge deployment via **[Wasmer.io](https://wasmer.io)** using `wasmer/static-web-server`.

---

## Deployment File Locations

1. **Repository Root Deployment Configuration**:
   - `wasmer.toml` (located at the root of the project: `./wasmer.toml`)
   - `wasmer.json` (located at the root: `./wasmer.json`)
   - Configured with `public = "dist"` to package and serve the production build.

2. **Standalone `dist/` Deployment Configuration**:
   - `dist/wasmer.toml` (and `public/wasmer.toml`)
   - `dist/wasmer.json` (and `public/wasmer.json`)
   - Configured with `public = "."` for standalone folder deployment.

3. **Static Archive Package**:
   - `/home/dono/Documents/godlyOS-static/wasmer/` (synchronized with the latest production build).

---

## How to Deploy to Wasmer Edge

### Option A: Deploy from the `dist/` Directory (Fastest & Recommended)
> [!TIP]
> Deploying from `dist/` is the cleanest approach because it contains **only** the compiled production assets (no `node_modules`, no source files). This avoids Wasmer's builder memory limits and deploys in seconds.

```bash
cd dist
wasmer deploy
```

### Option B: Deploy from the Documents Static Archive
```bash
cd "/home/dono/Documents/godlyOS-static/wasmer"
wasmer deploy
```

### Option C: Deploy from Project Root
A `.wasmerignore` file is included in the project root to exclude `node_modules/`, `public/`, and `src/`, preventing the builder memory limit error (`Build used too much memory: reached 1239 MB of 1536 MB`).

```bash
wasmer deploy
```

---

## Wasmer Static Server Specs
- **Package**: `wasmer/static-web-server` (`^1`)
- **Runtime**: WASI
- **Fallback Support**: `index.html` & `404.html` SPA routing
- **Proxies & Workers**: UV, BareMux, Scramjet, and Service Worker supported on edge
