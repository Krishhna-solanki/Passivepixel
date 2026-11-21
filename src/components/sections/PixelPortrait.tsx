"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Renders an image as pixels that sharpen while it scrolls into view
 * (pixel size 48 → 1). Hovering briefly re-pixelates it. Works with any
 * same-origin image (the founder photo, or the placeholder).
 */
export function PixelPortrait({ src, className = "" }: { src: string; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const canvas = cv.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = document.createElement("canvas");
    const sctx = small.getContext("2d");
    if (!sctx) return;

    const img = new Image();
    img.src = src;
    let loaded = false;
    let scrollPx = reduced ? 1 : 48; // pixel size from scroll
    let hover = 0; // extra pixelation from hover, decays
    let lastDrawn = -1;
    let raf = 0;

    const draw = () => {
      if (!loaded) return;
      const W = canvas.width;
      const H = canvas.height;
      const px = Math.max(1, Math.round(scrollPx + hover * 14));
      if (px === lastDrawn) return;
      lastDrawn = px;
      // cover-crop the image into the canvas
      const ir = img.width / img.height;
      const cr = W / H;
      let sw = img.width;
      let sh = img.height;
      if (ir > cr) sw = img.height * cr;
      else sh = img.width / cr;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      const w = Math.max(1, Math.ceil(W / px));
      const h = Math.max(1, Math.ceil(H / px));
      small.width = w;
      small.height = h;
      sctx.imageSmoothingEnabled = true;
      sctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      ctx.imageSmoothingEnabled = px === 1;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(small, 0, 0, w, h, 0, 0, w * px, h * px);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(el.clientWidth * dpr);
      canvas.height = Math.round(el.clientHeight * dpr);
      lastDrawn = -1;
      draw();
    };
    img.onload = () => {
      loaded = true;
      resize();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const st = reduced
      ? null
      : ScrollTrigger.create({
          trigger: el,
          start: "top 90%",
          end: "center 45%",
          scrub: true,
          onUpdate: (s) => {
            const e = 1 - Math.pow(1 - s.progress, 2);
            scrollPx = 48 - 47 * e;
            draw();
          },
        });

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (hover > 0.001) {
        hover *= 0.9;
        draw();
      } else if (hover !== 0) {
        hover = 0;
        draw();
      }
    };
    raf = requestAnimationFrame(loop);
    const onEnter = (e: PointerEvent) => {
      if (!reduced && e.pointerType === "mouse") hover = 1;
    };
    el.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      st?.kill();
      el.removeEventListener("pointerenter", onEnter);
    };
  }, [src]);

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <canvas ref={cv} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
