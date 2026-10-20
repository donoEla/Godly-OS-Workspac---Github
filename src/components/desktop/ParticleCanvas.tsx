import React, { useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { getAssetUrl } from '../../utils/assetHelper';

interface Dot {
  ox: number;
  oy: number;
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  baseRadius: number;
  phase: number;
}

export const ParticleCanvas: React.FC = () => {
  const { settings } = useOS();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wallpaperImgRef = useRef<HTMLImageElement | null>(null);
  const colorDataRef = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);

  // Load and sample wallpaper image into offscreen buffer
  useEffect(() => {
    if (!settings.particleBackground) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getAssetUrl(settings.wallpaper);
    wallpaperImgRef.current = img;

    img.onload = () => {
      try {
        const offCanvas = document.createElement('canvas');
        const offW = 160;
        const offH = 90;
        offCanvas.width = offW;
        offCanvas.height = offH;
        const offCtx = offCanvas.getContext('2d');
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, offW, offH);
          const imgData = offCtx.getImageData(0, 0, offW, offH);
          colorDataRef.current = {
            data: imgData.data,
            w: offW,
            h: offH,
          };
        }
      } catch (err) {
        console.warn('[ParticleCanvas] Offscreen sampling fallback:', err);
      }
    };
  }, [settings.wallpaper, settings.particleBackground]);

  useEffect(() => {
    if (!settings.particleBackground) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -9999, y: -9999 };
    const dots: Dot[] = [];
    const step = 28; // Optimal grid spacing for responsive fluid motion
    const friction = 0.06;

    const sampleColor = (ox: number, oy: number) => {
      const colorBuf = colorDataRef.current;
      if (colorBuf && colorBuf.w > 0 && colorBuf.h > 0) {
        const nx = Math.max(0, Math.min(1, ox / width));
        const ny = Math.max(0, Math.min(1, oy / height));
        const px = Math.min(colorBuf.w - 1, Math.floor(nx * colorBuf.w));
        const py = Math.min(colorBuf.h - 1, Math.floor(ny * colorBuf.h));
        const idx = (py * colorBuf.w + px) * 4;
        const r = colorBuf.data[idx];
        const g = colorBuf.data[idx + 1];
        const b = colorBuf.data[idx + 2];
        // Ensure not completely black so dots remain subtly visible
        return {
          r: Math.max(35, r),
          g: Math.max(40, g),
          b: Math.max(55, b),
        };
      }
      // Elegant default celestial palette if image sampling not yet ready
      return { r: 168, g: 85, b: 247 };
    };

    const initDots = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots.length = 0;
      for (let y = 14; y < height; y += step) {
        for (let x = 14; x < width; x += step) {
          const col = sampleColor(x, y);
          dots.push({
            ox: x,
            oy: y,
            x,
            y,
            r: col.r,
            g: col.g,
            b: col.b,
            baseRadius: 1.15,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    initDots();

    // Re-sample dots colors whenever colorData becomes available
    const reSampleTimer = setInterval(() => {
      if (colorDataRef.current && dots.length > 0) {
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i];
          const col = sampleColor(d.ox, d.oy);
          d.r = col.r;
          d.g = col.g;
          d.b = col.b;
        }
      }
    }, 400);

    const onResize = () => {
      initDots();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame += 0.02;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.ox - mouse.x;
        const dy = dot.oy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = dot.ox;
        let targetY = dot.oy;
        let radius = dot.baseRadius;
        let alpha = 0.45;

        // Interactive mouse gravity repulsion & illumination
        if (dist < 150) {
          const force = (1 - dist / 150) * 24;
          const angle = Math.atan2(dy, dx);
          targetX = dot.ox + Math.cos(angle) * force;
          targetY = dot.oy + Math.sin(angle) * force;
          radius = 1.8 + (1 - dist / 150) * 1.4;
          alpha = 0.95;

          // Glowing saturated wallpaper color near mouse
          const glowR = Math.min(255, dot.r + 80);
          const glowG = Math.min(255, dot.g + 80);
          const glowB = Math.min(255, dot.b + 80);
          ctx.fillStyle = `rgba(${glowR}, ${glowG}, ${glowB}, ${alpha})`;
        } else {
          // Dynamic ambient breathing pulse matching wallpaper colors
          const pulse = Math.sin(frame + dot.phase) * 0.12;
          alpha = Math.max(0.2, 0.45 + pulse);
          ctx.fillStyle = `rgba(${dot.r}, ${dot.g}, ${dot.b}, ${alpha})`;
        }

        dot.x += (targetX - dot.x) * friction;
        dot.y += (targetY - dot.y) * friction;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(reSampleTimer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [settings.particleBackground, settings.wallpaper]);

  if (!settings.particleBackground) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1] opacity-85 transition-opacity duration-700"
    />
  );
};
