import JSZip from 'jszip';
import { SoundThemeType } from '../types/os';

export type SoundEvent = 'window-open' | 'window-close' | 'window-drag' | 'click' | 'error' | 'notification';

function isMechanicalAudioEnabled(): boolean {
  try {
    const raw = localStorage.getItem('godly_desktop_extensions');
    if (!raw) return true; // Enabled by default in BUILTIN_EXTENSIONS
    const exts = JSON.parse(raw);
    const mech = exts.find((e: any) => e.id === 'tactile-mechanical-audio');
    return mech ? !!mech.enabled : true;
  } catch {
    return true;
  }
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private theme: SoundThemeType = 'cyberpunk';
  private userInteracted: boolean = false;
  private pendingStartup: boolean = false;
  private customAudioBuffers: Map<SoundEvent, AudioBuffer> = new Map();
  private lastDragSoundTime: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('godly_sound_theme') as SoundThemeType;
        if (savedTheme) {
          this.theme = savedTheme;
        }
      } catch {}

      const handleUserGesture = () => {
        this.userInteracted = true;
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.pendingStartup) {
          this.pendingStartup = false;
          this.playStartup();
        }
        window.removeEventListener('pointerdown', handleUserGesture, true);
        window.removeEventListener('keydown', handleUserGesture, true);
        window.removeEventListener('touchstart', handleUserGesture, true);
      };

      window.addEventListener('pointerdown', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('keydown', handleUserGesture, { capture: true, passive: true });
      window.addEventListener('touchstart', handleUserGesture, { capture: true, passive: true });

      this.initCustomSoundsFromDB();
    }
  }

  private initCtx(): boolean {
    if (!this.userInteracted) {
      return false;
    }
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return !!this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setTheme(theme: SoundThemeType) {
    this.theme = theme;
    try {
      localStorage.setItem('godly_sound_theme', theme);
    } catch {}
  }

  public getTheme(): SoundThemeType {
    return this.theme;
  }

  // IndexedDB custom sound caching
  private async initCustomSoundsFromDB() {
    try {
      if (typeof indexedDB === 'undefined') return;
      const db = await this.openCustomSoundDB();
      const tx = db.transaction('sounds', 'readonly');
      const store = tx.objectStore('sounds');
      const req = store.getAll();
      req.onsuccess = async () => {
        const items = req.result as Array<{ event: SoundEvent; data: ArrayBuffer }>;
        if (items && items.length > 0 && this.initCtx() && this.ctx) {
          for (const item of items) {
            try {
              const audioBuffer = await this.ctx.decodeAudioData(item.data.slice(0));
              this.customAudioBuffers.set(item.event, audioBuffer);
            } catch {}
          }
        }
      };
    } catch {}
  }

  private openCustomSoundDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('godly_soundpack', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('sounds')) {
          db.createObjectStore('sounds', { keyPath: 'event' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // Load custom soundpack zip file
  public async loadCustomZip(file: File): Promise<string[]> {
    const loadedEvents: string[] = [];
    const zip = await JSZip.loadAsync(file);
    const validEvents: SoundEvent[] = ['window-open', 'window-close', 'window-drag', 'click', 'error', 'notification'];

    if (!this.initCtx() || !this.ctx) {
      throw new Error('AudioContext unavailable');
    }

    const db = await this.openCustomSoundDB();
    const tx = db.transaction('sounds', 'readwrite');
    const store = tx.objectStore('sounds');

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue;
      const lower = filename.toLowerCase();
      for (const ev of validEvents) {
        if (lower.includes(ev)) {
          const arrayBuffer = await zipEntry.async('arraybuffer');
          store.put({ event: ev, data: arrayBuffer });
          try {
            const decoded = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
            this.customAudioBuffers.set(ev, decoded);
            loadedEvents.push(ev);
          } catch {}
          break;
        }
      }
    }

    this.setTheme('custom');
    return loadedEvents;
  }

  // Main unified Sound Event dispatcher
  public playEvent(event: SoundEvent) {
    if (!this.enabled || this.volume <= 0 || this.theme === 'silent') return;
    if (!this.initCtx() || !this.ctx) return;

    // Rate-limit drag audio
    if (event === 'window-drag') {
      const now = performance.now();
      if (now - this.lastDragSoundTime < 180) return;
      this.lastDragSoundTime = now;
    }

    // If custom theme and buffer exists, play buffer
    if (this.theme === 'custom' && this.customAudioBuffers.has(event)) {
      try {
        const buffer = this.customAudioBuffers.get(event)!;
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();
        source.buffer = buffer;
        gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start();
        return;
      } catch {}
    }

    // Play according to active theme synthesizers
    switch (this.theme) {
      case 'sonoma':
        this.synthSonoma(event);
        break;
      case 'win98':
        this.synthWin98(event);
        break;
      case 'cyberpunk':
      default:
        this.synthCyberpunk(event);
        break;
    }
  }

  // 1. CYBERPUNK MECH THEME
  private synthCyberpunk(event: SoundEvent) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (event) {
      case 'click':
        // Tactile Cherry Blue / mechanical switch
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.035);
        gain.gain.setValueAtTime(this.volume * 0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
        break;

      case 'window-open':
        // Futuristic pneumatic airlock glide
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.09);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
        break;

      case 'window-close':
        // Hydraulic mechanical seal
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.08);
        gain.gain.setValueAtTime(this.volume * 0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'window-drag':
        // Subtle magnetic hum tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);
        gain.gain.setValueAtTime(this.volume * 0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.04);
        break;

      case 'error':
        // Cyber alert dissonance
        [240, 310].forEach((freq) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(this.volume * 0.18, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t);
          o.stop(t + 0.18);
        });
        break;

      case 'notification':
        // Neon twin pulse chime
        [987.77, 1318.51].forEach((freq, idx) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t + idx * 0.07);
          g.gain.setValueAtTime(0.001, t + idx * 0.07);
          g.gain.linearRampToValueAtTime(this.volume * 0.14, t + idx * 0.07 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.22);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + idx * 0.07);
          o.stop(t + idx * 0.07 + 0.25);
        });
        break;
    }
  }

  // 2. MACOS SONOMA THEME
  private synthSonoma(event: SoundEvent) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (event) {
      case 'click':
        if (isMechanicalAudioEnabled()) {
          // Dual-stage Cherry MX mechanical click synthesizer
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(3200, t);
          osc.frequency.exponentialRampToValueAtTime(1400, t + 0.018);
          gain.gain.setValueAtTime(this.volume * 0.22, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.025);

          // Secondary housing resonance snap
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(750, t + 0.006);
          osc2.frequency.exponentialRampToValueAtTime(260, t + 0.035);
          gain2.gain.setValueAtTime(0.001, t);
          gain2.gain.setValueAtTime(this.volume * 0.16, t + 0.006);
          gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.038);
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.start(t + 0.006);
          osc2.stop(t + 0.04);
        } else {
          // Soft wooden / glassy pop
          osc.type = 'sine';
          osc.frequency.setValueAtTime(900, t);
          osc.frequency.exponentialRampToValueAtTime(450, t + 0.03);
          gain.gain.setValueAtTime(this.volume * 0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.03);
        }
        break;

      case 'window-open':
        // Glassy upward swoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(1040, t + 0.1);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        break;

      case 'window-close':
        // Soft descending marimba tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.08);
        gain.gain.setValueAtTime(this.volume * 0.11, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
        break;

      case 'window-drag':
        // Velvet frictionless sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.03);
        gain.gain.setValueAtTime(this.volume * 0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.03);
        break;

      case 'error':
        // Subtle apple 'Funk' bass thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(this.volume * 0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.15);
        break;

      case 'notification':
        // Glass triple chime (C - G - C)
        [523.25, 783.99, 1046.5].forEach((freq, idx) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t + idx * 0.06);
          g.gain.setValueAtTime(0.001, t + idx * 0.06);
          g.gain.linearRampToValueAtTime(this.volume * 0.12, t + idx * 0.06 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + idx * 0.06);
          o.stop(t + idx * 0.06 + 0.36);
        });
        break;
    }
  }

  // 3. WINDOWS 98 RETRO THEME
  private synthWin98(event: SoundEvent) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (event) {
      case 'click':
        // Crisp 8-bit square tick
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, t);
        gain.gain.setValueAtTime(this.volume * 0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.025);
        break;

      case 'window-open':
        // Ascending 2-tone FM chime
        [600, 900].forEach((f, i) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(f, t + i * 0.04);
          g.gain.setValueAtTime(this.volume * 0.1, t + i * 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.04);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + i * 0.04);
          o.stop(t + i * 0.04 + 0.045);
        });
        break;

      case 'window-close':
        // Descending 2-tone FM chime
        [900, 600].forEach((f, i) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(f, t + i * 0.04);
          g.gain.setValueAtTime(this.volume * 0.1, t + i * 0.04);
          g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.04 + 0.04);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + i * 0.04);
          o.stop(t + i * 0.04 + 0.045);
        });
        break;

      case 'window-drag':
        // Low square click
        osc.type = 'square';
        osc.frequency.setValueAtTime(250, t);
        gain.gain.setValueAtTime(this.volume * 0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.02);
        break;

      case 'error':
        // Classic Chord / Ding Error
        [440, 554.37, 659.25].forEach((freq) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(this.volume * 0.15, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t);
          o.stop(t + 0.42);
        });
        break;

      case 'notification':
        // Windows 'Tada' mini arpeggio
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'square';
          o.frequency.setValueAtTime(freq, t + idx * 0.05);
          g.gain.setValueAtTime(this.volume * 0.1, t + idx * 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.12);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + idx * 0.05);
          o.stop(t + idx * 0.05 + 0.14);
        });
        break;
    }
  }

  // Backward compatibility convenience methods
  public click() {
    this.playEvent('click');
  }

  public playClick() {
    this.playEvent('click');
  }

  public playOpen() {
    this.playEvent('window-open');
  }

  public playClose() {
    this.playEvent('window-close');
  }

  public playMinimize() {
    this.playEvent('window-close');
  }

  public playMaximize() {
    this.playEvent('window-open');
  }

  public playNotification() {
    this.playEvent('notification');
  }

  public playSuccess() {
    this.playEvent('notification');
  }

  public playSnap() {
    this.playEvent('click');
  }

  public playStartup() {
    if (!this.enabled || this.volume <= 0 || this.theme === 'silent') return;
    if (!this.userInteracted) {
      this.pendingStartup = true;
      return;
    }
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      [349.23, 440.0, 523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        gain.gain.setValueAtTime(0.001, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(this.volume * 0.09, t + idx * 0.05 + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 1.25);
      });
    } catch {}
  }
}

export const sound = new SoundEngine();
