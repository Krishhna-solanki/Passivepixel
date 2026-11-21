"use client";

import { useEffect, useRef } from "react";
import { heroState } from "@/lib/heroState";

// logo gradient stops: #D946EF → #A020F0 → #6200EA
const STOPS = [
  [217, 70, 239],
  [160, 32, 240],
  [98, 0, 234],
];
function gradient(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t));
  const [a, b, k] = x < 0.5 ? [STOPS[0], STOPS[1], x * 2] : [STOPS[1], STOPS[2], (x - 0.5) * 2];
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

/**
 * Interactive pixel grid. The Passive Pixel icon is sampled into the grid,
 * pixels assemble diagonally (bottom-left → top-right, "growth") when it
 * scrolls into view, light up under the pointer / finger, ripple on tap,
 * and shimmer with scroll speed.
 */
export function PixelGrid({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    const el = wrap.current;
    if (!canvas || !el) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const N = window.innerWidth < 768 ? 24 : 32;
    const mask = new Float32Array(N * N);
    const energy = new Float32Array(N * N);
    const delay = new Float32Array(N * N);
    for (let y = 0; y < N; y++)
      for (let x = 0; x < N; x++) delay[y * N + x] = ((N - 1 - y + x) / (2 * N)) * 1.3 + Math.random() * 0.25;

    // sample the official icon into the grid
    const img = new Image();
    img.src = "/brand/passivepixel-icon.png";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = off.height = N;
      const o = off.getContext("2d");
      if (!o) return;
      const h = N * 0.66;
      const w = (h * img.width) / img.height;
      o.drawImage(img, Math.round((N - w) / 2), Math.round((N - h) / 2), w, h);
      const d = o.getImageData(0, 0, N, N).data;
      for (let i = 0; i < N * N; i++) mask[i] = d[i * 4 + 3] > 110 ? 1 : 0;
    };

    let size = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = el.clientWidth;
      canvas.width = canvas.height = Math.round(size * dpr);
      canvas.style.width = canvas.style.height = `${size}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const pointer = { x: -99, y: -99, inside: false };
    const ripples: { x: number; y: number; t: number }[] = [];
    const toCell = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * N, y: ((e.clientY - r.top) / r.height) * N };
    };
    const onMove = (e: PointerEvent) => {
      const c = toCell(e);
      pointer.x = c.x;
      pointer.y = c.y;
      pointer.inside = true;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    const onDown = (e: PointerEvent) => {
      const c = toCell(e);
      ripples.push({ x: c.x, y: c.y, t: performance.now() / 1000 });
      if (ripples.length > 5) ripples.shift();
      onMove(e);
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointercancel", onLeave);

    let visible = false;
    let start = -1;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && start < 0) start = performance.now() / 1000;
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    let raf = 0;
    let vel = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      const now = performance.now() / 1000;
      const t = reduced ? 99 : now - start;
      const cell = canvas.width / N;
      const gap = Math.max(1, cell * 0.14);
      const sz = cell - gap;
      const rad = sz * 0.2;
      vel += (Math.abs(heroState.velocity) - vel) * 0.1;
      const scrollE = reduced ? 0 : Math.min(1, vel / 35);

      // when nobody is touching, a "ghost" cursor wanders so the grid is never still
      const ghost = !pointer.inside && !reduced;
      const gx = N / 2 + Math.sin(now * 0.55) * N * 0.34;
      const gy = N / 2 + Math.cos(now * 0.41) * N * 0.3;
      const live = ripples.filter((r) => now - r.t < 1.6);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i = y * N + x;
          const cx = x + 0.5;
          const cy = y + 0.5;

          if (!reduced) {
            const ix = pointer.inside ? pointer.x : gx;
            const iy = pointer.inside ? pointer.y : gy;
            const d = Math.hypot(cx - ix, cy - iy);
            const radius = ghost ? 2.6 : 3.4;
            if (d < radius) energy[i] = Math.max(energy[i], (1 - d / radius) * (ghost ? 0.55 : 1));
            for (const r of live) {
              const age = now - r.t;
              const k = 1 - Math.abs(Math.hypot(cx - r.x, cy - r.y) - age * 16) / 1.6;
              if (k > 0) energy[i] = Math.max(energy[i], k * (1 - age / 1.6));
            }
          }
          energy[i] *= 0.93;

          const reveal = Math.min(1, Math.max(0, (t - delay[i]) / 0.4));
          if (reveal <= 0) continue;
          const e = energy[i];
          const wave = 0.5 + 0.5 * Math.sin((x - y) * 0.42 - now * 1.8);
          let r: number, g: number, b: number, a: number;

          if (mask[i]) {
            [r, g, b] = gradient((x + (N - y)) / (2 * N));
            const lift = e * 0.45;
            r += (255 - r) * lift;
            g += (255 - g) * lift;
            b += (255 - b) * lift;
            a = Math.min(1, 0.62 + wave * 0.2 + scrollE * 0.2 + e * 0.4);
          } else if (e > 0.03) {
            [r, g, b] = [195, 77, 255];
            a = Math.min(0.9, 0.05 + e * 0.75);
          } else {
            [r, g, b] = [255, 255, 255];
            a = 0.035 + wave * 0.03 + scrollE * 0.07 * wave;
          }

          const s = sz * (0.4 + 0.6 * reveal) * (1 - e * 0.12);
          const ox = x * cell + gap / 2 + (sz - s) / 2;
          const oy = y * cell + gap / 2 + (sz - s) / 2 - e * cell * 0.18; // energised pixels lift
          ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${a * reveal})`;
          ctx.beginPath();
          ctx.roundRect(ox, oy, s, s, rad);
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointercancel", onLeave);
    };
  }, []);

  return (
    <div ref={wrap} className={`relative aspect-square w-full ${className}`}>
      <canvas ref={cv} className="absolute inset-0 touch-pan-y" aria-hidden />
    </div>
  );
}
