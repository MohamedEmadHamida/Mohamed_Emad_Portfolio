"use client";

import { useEffect, useRef } from "react";
import { ACCENT_EVENT, prefersReducedMotion } from "@/lib/client";

type RGB = [number, number, number];

function toHsl(r: number, g: number, b: number): RGB {
  r /= 255; g /= 255; b /= 255;
  const M = Math.max(r, g, b), m = Math.min(r, g, b), l = (M + m) / 2, d = M - m;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return [(h + 360) % 360, s, l];
}

function toRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const p = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return p.map((v) => Math.round((v + m) * 255)) as RGB;
}

/** Hero backdrop: currents of light flowing across a grid of dots, colored from --accent. */
export function HeroDots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current!;
    const hero = cv.parentElement!;
    const ctx = cv.getContext("2d")!;
    const reduce = prefersReducedMotion();
    const fg = "243,241,234";
    let w = 0, h = 0, gap = 30, mx = -999, my = -999, on = false, frame = 0, raf = 0;
    let c1: RGB = [255, 59, 29], c2: RGB = [255, 140, 60];

    function colors() {
      const m = getComputedStyle(cv).getPropertyValue("--accent").trim().match(/^#([0-9a-f]{6})$/i);
      if (!m) return;
      const n = parseInt(m[1], 16);
      c1 = [n >> 16, (n >> 8) & 255, n & 255];
      const q = toHsl(...c1);
      c2 = toRgb((q[0] + 30) % 360, Math.min(1, q[1] * 1.05), Math.min(0.72, q[2] + 0.12));
    }

    function size() {
      const d = Math.min(2, devicePixelRatio || 1);
      w = hero.clientWidth; h = hero.clientHeight;
      cv.width = w * d; cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      gap = w < 700 ? 22 : 30;
    }

    function draw(ms: number) {
      const t = ms / 1000;
      if (frame++ % 30 === 0) colors();
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(${fg},.07)`;
      const lit: number[] = [];
      for (let y = gap / 2; y < h; y += gap)
        for (let x = gap / 2; x < w; x += gap) {
          const a = Math.pow(Math.sin(x * 0.0042 + y * 0.0021 - t * 0.55 + Math.sin(y * 0.005 + t * 0.23) * 1.4) * 0.5 + 0.5, 6);
          const b = Math.pow(Math.sin(-x * 0.0026 + y * 0.0048 - t * 0.37 + Math.sin(x * 0.004 - t * 0.19) * 1.2) * 0.5 + 0.5, 8) * 0.8;
          const m = Math.max(0, 1 - Math.hypot(x - mx, y - my) / 170) * 0.55;
          const v = Math.min(1, a + b + m);
          if (v < 0.04) ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
          else lit.push(x, y, v, b / (a + b + m + 1e-6));
        }
      for (let i = 0; i < lit.length; i += 4) {
        const x = lit[i], y = lit[i + 1], v = lit[i + 2], k = lit[i + 3];
        const r = (c1[0] + (c2[0] - c1[0]) * k) | 0, g = (c1[1] + (c2[1] - c1[1]) * k) | 0, bl = (c1[2] + (c2[2] - c1[2]) * k) | 0;
        const rad = 0.9 + v * 1.5;
        ctx.fillStyle = `rgb(${r},${g},${bl})`;
        if (v > 0.35) {
          ctx.globalAlpha = v * 0.09;
          ctx.beginPath(); ctx.arc(x, y, rad * 3.4, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 0.08 + v * 0.58;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.fill();
      }
      if (on && !reduce) raf = requestAnimationFrame(draw);
    }

    const redrawStill = () => { if (!on || reduce) draw(4000); };
    const onResize = () => { size(); redrawStill(); };
    const onMove = (e: PointerEvent) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = my = -999; };
    const onAccent = () => { colors(); redrawStill(); };

    size(); colors(); draw(4000);
    addEventListener("resize", onResize);
    addEventListener(ACCENT_EVENT, onAccent);
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);

    let io: IntersectionObserver | undefined;
    if (!reduce) {
      io = new IntersectionObserver((es) => {
        const v = es[0].isIntersecting;
        if (v && !on) { on = true; raf = requestAnimationFrame(draw); }
        else if (!v) { on = false; cancelAnimationFrame(raf); }
      });
      io.observe(hero);
    }

    return () => {
      on = false;
      cancelAnimationFrame(raf);
      io?.disconnect();
      removeEventListener("resize", onResize);
      removeEventListener(ACCENT_EVENT, onAccent);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="hero-dots" aria-hidden="true" />;
}
