# Godly OS — index.svg & Companion Files Manifest (v2.5)

## 1. Overview
As specified in the architecture requirements, every update comes with a primary vector distribution file:
- **`index.svg`** (served at `/index.svg` and located in `/public/index.svg`, `dist/index.svg`, & project root `/index.svg`).

`index.svg` is an SVG document featuring:
- Full vector desktop rendering (ferrofluid dark theme, left dock, taskbar, active window, live clock).
- Embedded typography, SVG filters, linear & radial gradients, and interactive event scripts.
- `<foreignObject>` bootstrap container capable of hosting the live React application in modern SVG-capable browsers.
- Hardware-accelerated GPU layout specs.

---

## 2. Companion Files That Cannot Be Inlined
Certain resources cannot or should not be inlined directly inside `index.svg` due to web platform standards, browser APIs, and memory efficiency constraints:

| Companion Resource | Path | Reason It Cannot Be Inlined |
| :--- | :--- | :--- |
| **Service Worker Proxy** | `public/sw.js` (`/sw.js`) | W3C Service Worker specification requires `navigator.serviceWorker.register()` to reference an independent JavaScript resource on the origin; Service Workers cannot be loaded from inline SVG data URIs. |
| **4K Wallpaper Catalog** | `public/assets/backgrounds/` (43 files) | 43 verified authentic high-resolution 4K wallpapers totaling ~25MB cannot be inlined into an SVG without causing massive document bloat and browser rendering stall. |
| **Authentic App Icons** | `public/assets/icons/` (8 files) | Authentic JPEG app icons from the user's local directory. |
| **Production JavaScript Bundle** | `dist/assets/index-*.js` | Full compiled React 18, Framer Motion, and Web Audio synthesizer engine. |
| **Production CSS Stylesheet** | `dist/assets/index-*.css` | Compiled Tailwind CSS v3 glassmorphism styling tokens and animations. |
| **Lumin Games SDK** | `https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js` | External jsDelivr CDN dependency for Lumin container `#games-container`. |

---

## 3. Strict Zero iFrames & Pure Service Worker Execution
- **Zero iFrames**: Absolutely no `<iframe>` elements are present in Godly OS.
- **Service Worker Shadow DOM Viewport**: External web apps and pages are requested via `fetch('/os-proxy?url=...')` through the registered Service Worker (`/sw.js`) and rendered directly into an isolated Shadow DOM container with `<base href="...">` injection and sanitized styling.
- **Cloud Gaming Stream Engine**: For cloud gaming, Godly OS provides a dedicated native cloud stream HUD view with 60 FPS live canvas rendering, stream telemetry (1080p, 60 FPS, Bitrate, Latency), interactive on-screen controller / gamepad support, and direct Service Worker window endpoints.

---

## 4. nowgg.fun Proxy & Routing Specification
- **Mandate**: All cloud games and proxy requests must route to **`nowgg.fun`**, NEVER `now.gg`.
- **Exact Apps Supported**:
  - **Roblox**: `https://nowgg.fun/apps/roblox-corporation/5349/roblox.html`
  - **Subway Surfers**: `https://nowgg.fun/apps/sybo-games/subway-surfers.html`
  - **Among Us**: `https://nowgg.fun/apps/innersloth-llc/among-us.html`
  - **Minecraft Trial**: `https://nowgg.fun/apps/mojang/minecraft-trial.html`
  - **Geometry Dash Lite**: `https://nowgg.fun/apps/robtop-games/geometry-dash-lite.html`
  - **Brawl Stars**: `https://nowgg.fun/apps/supercell/brawl-stars.html`
  - **Free Fire**: `https://nowgg.fun/apps/garena-international/free-fire.html`
- **Zero Naked iFrames**: All traffic is tunneled through `/os-proxy?url=https%3A%2F%2Fnowgg.fun%2Fapps%2F...` via Vite dev server proxy middleware and `public/sw.js`. Any accidental attempt to load `now.gg` is automatically rewritten and normalized to `nowgg.fun`.

---

## 5. 120 FPS GPU Window Dragging & Resizing Engine
- **Hardware Acceleration**: Windows are moved using CSS `transform: translate3d(x, y, 0)` rather than layout-triggering `left`/`top` CSS properties.
- **Direct DOM Manipulation During Gestures**: Pointer movement updates the DOM node transform directly with zero React re-renders during mouse movement, eliminating all drag lag.
- **Single Context Commit**: Final coordinates are committed to React `OSContext` once on `pointerup`.
- **Pointer Capture Overlay**: Transparent interaction overlay prevents event loss or cursor desync over complex child elements.
