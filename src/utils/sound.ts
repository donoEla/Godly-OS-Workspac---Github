class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;
  private userInteracted: boolean = false;
  private pendingStartup: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
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

  public playClick() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;

      const isMech = (() => {
        try {
          const extStr = localStorage.getItem('godly_desktop_extensions');
          if (extStr) {
            const parsed = JSON.parse(extStr);
            const ext = parsed.find((e: any) => e.id === 'tactile-mechanical-audio');
            return ext ? ext.enabled : true;
          }
        } catch {}
        return true;
      })();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (isMech) {
        // High-end Cherry MX Blue / mechanical switch tactile impulse
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(this.volume * 0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(this.volume * 0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  public playOpen() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(this.volume * 0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }

  public playClose() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(330, t + 0.08);
      gain.gain.setValueAtTime(this.volume * 0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {}
  }

  public playMinimize() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playMaximize() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(this.volume * 0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playNotification() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      [880, 1174.66].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);
        gain.gain.setValueAtTime(0.001, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(this.volume * 0.12, t + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  public playSnap() {
    if (!this.enabled || this.volume <= 0) return;
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.05);
      gain.gain.setValueAtTime(this.volume * 0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch {}
  }

  public playStartup() {
    if (!this.enabled || this.volume <= 0) return;
    if (!this.userInteracted) {
      this.pendingStartup = true;
      return;
    }
    try {
      if (!this.initCtx() || !this.ctx) return;
      const t = this.ctx.currentTime;
      // Godly chord (F - A - C - E - G)
      [349.23, 440.00, 523.25, 659.25, 783.99].forEach((freq, idx) => {
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
