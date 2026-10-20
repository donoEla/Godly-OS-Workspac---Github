# 🌌 Godly OS — Divine Browser Operating System

**Godly OS** is a browser-based luxury operating system crafted with **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**. It pairs window management with rich desktop interactions, tactile Web Audio sound synthesis, a local Service Worker proxy security layer, Lumin SDK gaming integration, and eight fully functional applications utilizing authentic local OS assets.

---

## 🛡️ Security & Proxy Architecture

- **No Direct iFrames**: No site or external service loads directly into a naked cross-origin iframe.
- **Service Worker Proxy ([`public/sw.js`](file:///home/dono/.gemini/antigravity-ide/scratch/godly-os/public/sw.js))**:
  - Registered upon boot via [`main.tsx`](file:///home/dono/.gemini/antigravity-ide/scratch/godly-os/src/main.tsx).
  - All web views and external embed requests route strictly through `/os-proxy?url=...`.
  - The Service Worker intercepts requests, sanitizes frame-ancestors, strips `x-frame-options`, and safely proxies content in an isolated sandboxed context.
- **100% Bespoke Godly Music Player**: Spotify is **not** the real Spotify. It runs as a bespoke, in-OS audio studio powered entirely by the browser's Web Audio API with multi-oscillator chord pads, real-time 60fps canvas visualizer, EQ presets, and zero third-party iframes or dependencies.

---

## 🌟 Key Features

### 🖥️ Desktop & Window Management
- **True Window Management**: Full support for opening, closing, minimizing, maximizing/restoring, freeform dragging, multi-directional edge & corner resizing, and `z-index` focus layering.
- **Authentic Local Assets**: 51 wallpapers and 8 app icons scanned from `/home/dono/Documents/Godly OS/`.
- **Reference-Accurate Left Dock Layout**: Two-column vertical left dock with frosted rounded-square containers and glowing selection rings.
- **Right-Click Context Menu**: Desktop actions to create folders, new notes, launch terminal, toggle dark/light theme, change wallpapers, and refresh.
- **Glassmorphic Compositor**: Frosted glass panels with customizable backdrop blur, saturated vibrance, and drop shadows.

### ⚡ Bottom Taskbar & System Flyouts
- **Divine Start Button**: Radiant icon with hover glow; opens the Start Menu (or toggles with `Ctrl + Space`).
- **Start Menu**: Instant application search, pinned apps grid, recommended actions, and power controls (Lock, Restart, Shutdown).
- **Running & Pinned Apps**: Indicator pills beneath open apps and focus highlights.
- **Quick Settings Panel**: Fast toggles for Wi-Fi, Bluetooth, Dark/Light Mode, Focus/DND, master audio slider, brightness slider, and battery status.
- **Calendar Flyout**: Live digital clock with seconds, formatted date, interactive monthly calendar grid, and agenda reminders.
- **Notification Center**: Slide-in toast notifications with Web Audio chimes, plus notification history drawer.
- **Show Desktop Peek Bar**: One-click minimize all windows to view wallpaper.

---

## 🚀 The 8 Core Applications

1. **🛍️ Godly Store (`App Store`)**:
   - Featured app of the week banner (YouTube Cinematic 4K, Photopea, VS Code Web, etc.).
   - Category filtering (Media, Design, Utilities, Games, Dev).
   - Install / Uninstall state tracking.
   - App Details modal with feature checklists.
   - External web sandboxes route strictly through the registered Service Worker Proxy (`/os-proxy?url=...`).

2. **🧮 Calculator Pro (`Calculator`)**:
   - **Standard Mode**: Arithmetic, decimal, percent, memory operations.
   - **Scientific Mode**: Trigonometry (`sin`, `cos`, `tan`, `RAD`/`DEG`), logarithms (`ln`, `log`), powers, square roots, factorial (`n!`), constants (`π`, `e`).
   - **Canvas Graphing Mode**: Interactive 2D Cartesian graphing engine! Plots equations (e.g. `sin(x) * 2`, `x^2 - 3`, `cos(2*x)`) with live zoom controls and presets.

3. **📁 File Manager (`File Manager`)**:
   - Virtual filesystem stored persistently in `localStorage`.
   - Places sidebar: Desktop, Documents, Downloads, Pictures, Music, System.
   - Real image thumbnails and preview modal with "Set as Desktop Wallpaper" action.
   - Create folders, create files, delete, breadcrumb navigation, grid/list toggle, and search.

4. **🎮 Games App (`Games`) — Powered by Lumin SDK**:
   - **Lumin SDK Integration**: Loaded dynamically from `https://cdn.jsdelivr.net/gh/luminsdk/script@latest/lumin.min.js`.
   - Initialized via `Lumin.init({ container: '#games-container', theme: 'dark' })`.
   - Embedded into `#games-container` with dark theme and status monitor.
   - Toggleable **Retro Classics Hub** (2048, Cyber Snake, Minesweeper) for instant zero-latency offline play.

5. **📝 Notes Studio (`Notes`)**:
   - Kate / VS-Code inspired layout with collapsible explorer sidebar.
   - Multi-tab file editing with dirty/unsaved change indicators.
   - Line numbers gutter, word count, character count, and UTF-8 status bar.
   - Split view and Full view live Markdown preview renderer.
   - Direct save binding to the virtual filesystem.

6. **⚙️ System Settings (`Settings`)**:
   - KDE Control Center styled layout.
   - **Wallpapers**: Interactive visual grid of all 51 authentic wallpapers from `/assets/backgrounds/` with search filtering, categories, and compositor blur slider.
   - **Colors & Theme**: Dark Mode / Light Mode toggle + 5 luxury accent color palettes (Royal Violet, Divine Gold, Cyber Cyan, Emerald Aurora, Crimson Rose).
   - **Display & Glass**: Compositor backdrop blur slider and animation toggles.
   - **Sound & Audio**: Master volume, system audio cues toggle, and startup chime test.
   - **Performance & Specs**: CPU load simulation, memory allocation bar, and storage reset.

7. **🎵 Spotify / Godly Music Studio (`Spotify`) — 100% Native Audio Client**:
   - Completely bespoke music player (not the real Spotify, no external iframes).
   - Multi-oscillator Web Audio synthesized chord pads and atmospheric harmonies.
   - 60fps real-time Canvas audio visualizer (Spectrum Bars, Waveform Oscilloscope, Circular Aura).
   - Full playback controls: Play/Pause, Next/Prev, Shuffle, Repeat, track seeking scrubber, and volume.
   - Station queue, lyrics viewer, liked songs, and Equalizer presets (Godly Aura, Bass Boost, Vocal Pure, Lofi Warmth).

8. **💻 UNIX Terminal (`Terminal`)**:
   - Linux bash prompt: `god@godly-os:/home/god$`.
   - `godlyfetch` / `neofetch`: Custom divine ASCII art, host info, uptime, memory, kernel.
   - Filesystem commands: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `touch`, `rm`.
   - Utilities: `help`, `open <app>`, `cmatrix` (digital green rain!), `top`, `calc <expr>`, `theme`, `date`, `whoami`, `clear`, `reboot`.
   - Command history navigation with `Up`/`Down` arrow keys and `Tab` autocompletion.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Space` / `Cmd + Space` | Toggle Start Menu |
| `Escape` | Close active menus, flyouts, and matrix mode |
| `Enter` | Execute terminal command / calculate math |
| `Arrow Keys` / `WASD` | Control 2048 and Snake games |

---

## 🏃 Running the Application

```bash
# Navigate to project directory
cd /home/dono/.gemini/antigravity-ide/scratch/godly-os

# Start local development server
npm run dev

# Or build for production
npm run build
npm run preview
```
The server runs on `http://localhost:5173/`.
