import React, { useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { LiveWallpaperType } from '../../types/os';

interface LiveWallpaperPreset {
  init(canvas: HTMLCanvasElement): void;
  tick(): void;
  destroy(): void;
}

// 1. Matrix Digital Rain Preset
class MatrixRainPreset implements LiveWallpaperPreset {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private drops: number[] = [];
  private characters = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ1234567890ABCDEF';
  private animId: number | null = null;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const columns = Math.floor(canvas.width / 18);
    this.drops = Array.from({ length: columns }, () => Math.random() * -100);

    const loop = () => {
      this.tick();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  tick() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.fillStyle = 'rgba(5, 5, 10, 0.08)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = '14px monospace';

    for (let i = 0; i < this.drops.length; i++) {
      const text = this.characters.charAt(Math.floor(Math.random() * this.characters.length));
      const x = i * 18;
      const y = this.drops[i] * 18;

      this.ctx.fillText(text, x, y);

      if (y > this.canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }
      this.drops[i]++;
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.ctx = null;
    this.canvas = null;
  }
}

// 2. Starfield 3D Warp Preset
class StarfieldWarpPreset implements LiveWallpaperPreset {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stars: Array<{ x: number; y: number; z: number }> = [];
  private animId: number | null = null;
  private readonly numStars = 600;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.stars = Array.from({ length: this.numStars }, () => ({
      x: (Math.random() - 0.5) * canvas.width * 2,
      y: (Math.random() - 0.5) * canvas.height * 2,
      z: Math.random() * canvas.width,
    }));

    const loop = () => {
      this.tick();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  tick() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.ctx.fillStyle = 'rgba(4, 4, 10, 0.2)';
    this.ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.z -= 4;

      if (star.z <= 0) {
        star.z = w;
        star.x = (Math.random() - 0.5) * w * 2;
        star.y = (Math.random() - 0.5) * h * 2;
      }

      const k = 250 / star.z;
      const px = star.x * k + cx;
      const py = star.y * k + cy;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        const size = Math.max(0.8, (1 - star.z / w) * 3);
        const alpha = (1 - star.z / w);
        this.ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(px, py, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.ctx = null;
    this.canvas = null;
  }
}

// 3. Fluid Simulation Preset
class FluidSimPreset implements LiveWallpaperPreset {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private t = 0;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const loop = () => {
      this.tick();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  tick() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.t += 0.015;
    this.ctx.fillStyle = 'rgba(6, 4, 14, 0.15)';
    this.ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 4; i++) {
      const x = w / 2 + Math.sin(this.t + i * 1.5) * (w * 0.35);
      const y = h / 2 + Math.cos(this.t * 0.8 + i) * (h * 0.25);
      const radius = 260 + Math.sin(this.t * 2 + i) * 80;

      const gradient = this.ctx.createRadialGradient(x, y, 10, x, y, radius);
      if (i % 2 === 0) {
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
        gradient.addColorStop(1, 'transparent');
      } else {
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
        gradient.addColorStop(1, 'transparent');
      }

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.ctx = null;
    this.canvas = null;
  }
}

// 4. Audio-Reactive Visualizer Preset
class AudioReactivePreset implements LiveWallpaperPreset {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private phase = 0;

  init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const loop = () => {
      this.tick();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  tick() {
    if (!this.ctx || !this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.phase += 0.04;
    this.ctx.fillStyle = 'rgba(6, 6, 12, 0.2)';
    this.ctx.fillRect(0, 0, w, h);

    const bars = 64;
    const barWidth = w / bars;

    for (let i = 0; i < bars; i++) {
      const amp = Math.sin(this.phase + i * 0.2) * 0.5 + 0.5;
      const barH = amp * (h * 0.35) + 20;

      const grad = this.ctx.createLinearGradient(0, h, 0, h - barH);
      grad.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0.8)');

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(i * barWidth, h - barH, barWidth - 2, barH);
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.ctx = null;
    this.canvas = null;
  }
}

export const LiveWallpaperCanvas: React.FC = () => {
  const { settings } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePresetRef = useRef<LiveWallpaperPreset | null>(null);

  const liveWallpaperType = settings.liveWallpaper || 'none';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Resize canvas to full viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Destroy existing preset if running
    if (activePresetRef.current) {
      activePresetRef.current.destroy();
      activePresetRef.current = null;
    }

    // Initialize new preset
    let preset: LiveWallpaperPreset | null = null;
    switch (liveWallpaperType) {
      case 'fluid':
        preset = new FluidSimPreset();
        break;
      case 'matrix':
        preset = new MatrixRainPreset();
        break;
      case 'starfield':
        preset = new StarfieldWarpPreset();
        break;
      case 'visualizer':
        preset = new AudioReactivePreset();
        break;
    }

    if (preset) {
      preset.init(canvas);
      activePresetRef.current = preset;
    }

    return () => {
      window.removeEventListener('resize', resize);
      if (activePresetRef.current) {
        activePresetRef.current.destroy();
        activePresetRef.current = null;
      }
    };
  }, [liveWallpaperType]);

  if (liveWallpaperType === 'none') {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};
