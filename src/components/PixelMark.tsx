"use client";

import { useEffect, useRef, type RefObject } from "react";

const COLS = 20;
const ROWS = 23;
const CELL = 10; // css px per pixel
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

type Px = { x: number; y: number; th: number; start: number; dx: number; dy: number; spin: number };

/**
 * Loading mark: the official P icon is sampled into a pixel grid. As loading
 * progresses each pixel flies up into its slot, so the logo assembles itself.
 * A faint silhouette shows what's coming; stray pixels orbit while waiting;
 * a shine sweeps across when it completes.
 */
export function PixelMark({ progress }: { progress: RefObject<{ v: number }> }) {
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const PAD = 70; // room for pixels flying in from outside the mark
    const W = COLS * CELL + PAD * 2;
    const H = ROWS * CELL + PAD * 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    let pixels: Px[] = [];
    const strays = Array.from({ length: 7 }, (_, i) => ({
      a: (i / 7) * Math.PI * 2,
      r: 100 + Math.random() * 40,
      s: 3 + Math.random() * 4,
      sp: 0.4 + Math.random() * 0.5,
    }));

    const img = new Image();
    img.src = "/brand/passivepixel-icon.png";
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = COLS;
      off.height = ROWS;
      const o = off.getContext("2d");
      if (!o) return;
      o.drawImage(img, 0, 0, COLS, ROWS);
      const d = o.getImageData(0, 0, COLS, ROWS).data;
      const list: Px[] = [];
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
          if (d[(y * COLS + x) * 4 + 3] > 100)
            list.push({
              x,
              y,
              th: 0,
              start: -1,
              dx: (Math.random() - 0.5) * 140,
              dy: 50 + Math.random() * 110, // mostly from below: the logo "grows" up
              spin: (Math.random() - 0.5) * 3,
            });
      // fill order: bottom-left → top-right with jitter
      list.sort((a, b) => ROWS - a.y + a.x * 0.7 + Math.random() * 5 - (ROWS - b.y + b.x * 0.7 + Math.random() * 5));
      list.forEach((p, i) => (p.th = 2 + (i / list.length) * 96));
      pixels = list;
    };

    let raf = 0;
    let doneAt = -1;
    const t0 = performance.now() / 1000;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const now = performance.now() / 1000;
      const p = reduced ? 100 : progress.current?.v ?? 0;
      ctx.clearRect(0, 0, W, H);
      const ox = PAD;
      const oy = PAD;
      const s = CELL - 1.5;

      // faint silhouette
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      for (const px of pixels) ctx.fillRect(ox + px.x * CELL, oy + px.y * CELL, s, s);

      let landed = 0;
      for (const px of pixels) {
        if (px.start < 0 && p >= px.th) px.start = now;
        if (px.start < 0) continue;
        const t = reduced ? 1 : Math.min(1, (now - px.start) / 0.75);
        if (t >= 1) landed++;
        const e = 1 - Math.pow(1 - t, 3);
        const [r, g, b] = gradient((px.x + (ROWS - px.y)) / (COLS + ROWS));
        let lift = 0.12 * Math.sin(now * 3 + px.x * 0.6 - px.y * 0.4); // idle shimmer
        if (doneAt > 0) {
          // shine sweep once complete
          const band = (now - doneAt) * 40 - (px.x + (ROWS - px.y));
          if (band > 0 && band < 6) lift += 0.6 * (1 - Math.abs(band - 3) / 3);
        }
        const k = Math.max(0, lift);
        const cx = ox + px.x * CELL + s / 2 + px.dx * (1 - e);
        const cy = oy + px.y * CELL + s / 2 + px.dy * (1 - e);
        const size = s * (0.5 + 0.5 * e);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(px.spin * (1 - e));
        ctx.fillStyle = `rgba(${r + (255 - r) * k},${g + (255 - g) * k},${b + (255 - b) * k},${e})`;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
      if (pixels.length && landed === pixels.length && doneAt < 0) doneAt = now;

      // stray pixels orbiting the mark while it loads
      if (!reduced) {
        const cx = W / 2;
        const cy = H / 2;
        const fade = doneAt > 0 ? Math.max(0, 1 - (now - doneAt) * 2) : Math.min(1, (now - t0) * 2);
        for (const st of strays) {
          const a = st.a + now * st.sp;
          const x = cx + Math.cos(a) * st.r;
          const y = cy + Math.sin(a) * st.r * 0.75;
          ctx.fillStyle = `rgba(195,77,255,${0.55 * fade})`;
          ctx.fillRect(x - st.s / 2, y - st.s / 2, st.s, st.s);
        }
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  return <canvas ref={cv} aria-hidden className="block" />;
}
