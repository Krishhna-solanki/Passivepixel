"use client";

import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { finishIntro, heroState, onSceneReady } from "@/lib/heroState";
import { PixelMark } from "./PixelMark";

const COLS = 28;
const ROWS = 18;
const MAX_WAIT_MS = 6000; // never block the page longer than this
const SEGMENTS = 28;

/**
 * Preloader: the logo assembles pixel by pixel (and a pixel-block bar fills)
 * while the 3D scene compiles, then the screen
 * breaks into pixels that flash purple and dissolve outward from the centre,
 * revealing the hero as its camera flies in.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const progress = useRef({ v: 0 }); // shared with the pixel mark
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-tile]"));
    const onScreen: HTMLElement[] = [];
    const delays: number[] = [];
    const cx = vw / 2;
    const cy = vh / 2;
    const maxD = Math.hypot(cx, cy);
    tiles.forEach((t) => {
      const r = t.getBoundingClientRect();
      if (r.left < vw && r.top < vh) {
        onScreen.push(t);
        const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / maxD;
        delays.push(d * 0.75 + Math.random() * 0.12);
      } else {
        t.style.visibility = "hidden";
      }
    });

    const counter = progress.current;
    counter.v = 0;
    const segs = Array.from(bar.current?.children ?? []) as HTMLElement[];
    const render = () => {
      const lit = Math.round((counter.v / 100) * segs.length);
      segs.forEach((s, i) => {
        s.style.opacity = i < lit ? "1" : "0.12";
        s.style.transform = i === lit - 1 && counter.v < 100 ? "translateY(-3px)" : "translateY(0)";
      });
    };

    const ctx = gsap.context(() => {}, el);
    let ready = false;
    let filled = false;
    let exiting = false;

    const exit = () => {
      if (exiting) return;
      exiting = true;
      ctx.add(() => {
        const tl = gsap.timeline({ onComplete: () => setGone(true) });
        tl.to(counter, { v: 100, duration: reduced ? 0 : 0.5, ease: "power2.out", onUpdate: render })
          // hold so the last pixels land and the shine sweeps across the logo
          .to(content.current, { yPercent: -8, opacity: 0, duration: 0.55, ease: "power3.in" }, reduced ? "+=0" : "+=1")
          // hero camera starts flying in just before the pixels open
          .add(() => {
            gsap.to(heroState, { intro: 1, duration: reduced ? 0.01 : 2.8, ease: "expo.out" });
          }, "-=0.2")
          .to(
            onScreen,
            reduced
              ? { opacity: 0, duration: 0.3 }
              : {
                  keyframes: [
                    { backgroundColor: "#2a0f55", duration: 0.14, ease: "none" },
                    { scale: 0, rotate: 45, duration: 0.55, ease: "power3.in" },
                  ],
                  stagger: (i: number) => delays[i],
                },
            "<",
          )
          .call(finishIntro, [], reduced ? "<" : "<0.6");
      });
    };
    const maybeExit = () => ready && filled && exit();

    ctx.add(() => {
      gsap.to(counter, {
        v: 86,
        duration: reduced ? 0 : 1.6,
        ease: "power2.inOut",
        onUpdate: render,
        onComplete: () => {
          filled = true;
          maybeExit();
        },
      });
      gsap.from("[data-loader-mark]", { opacity: 0, duration: 0.6, ease: "power2.out" });
      gsap.from("[data-loader-line]", { yPercent: 120, duration: 1, ease: "expo.out", stagger: 0.08, delay: 0.15 });
    });

    const off = onSceneReady(() => {
      ready = true;
      maybeExit();
    });
    const cap = setTimeout(() => {
      ready = true;
      maybeExit();
    }, MAX_WAIT_MS);

    return () => {
      off();
      clearTimeout(cap);
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading Passive Pixel"
      className="pp-tiles fixed inset-0 z-[100] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, var(--tile))`, gridAutoRows: "var(--tile)" }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <div key={i} data-tile className="bg-obsidian" style={{ boxShadow: "0 0 0 1px #08080D" }} />
        ))}
      </div>

      <div ref={content} className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8 md:p-10">
        <div className="flex items-center justify-between">
          <span className="overflow-hidden font-display text-[11px] tracking-[0.3em] text-lavender">
            <span data-loader-line className="block">
              PASSIVE PIXEL
            </span>
          </span>
          <span className="overflow-hidden font-display text-[11px] tracking-[0.3em] text-lavender">
            <span data-loader-line className="block">
              LOADING EXPERIENCE
            </span>
          </span>
        </div>

        <div className="grid place-items-center">
          <div data-loader-mark className="relative">
            <div
              className="absolute inset-[30%] -z-10 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--logo-gradient)" }}
            />
            <PixelMark progress={progress} />
          </div>
        </div>

        <div>
          <div className="flex justify-center">
            <span className="overflow-hidden font-display text-[11px] tracking-[0.3em] text-lavender">
              <span data-loader-line className="block">
                THINK DIGITAL. GROW BIGGER.
              </span>
            </span>
          </div>
          {/* pixel-block progress bar */}
          <div ref={bar} className="mx-auto mt-5 flex max-w-md justify-between gap-[3px]">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                key={i}
                className="h-[6px] flex-1 rounded-[1px] transition-[opacity,transform] duration-300"
                style={{
                  opacity: 0.12,
                  background: `color-mix(in oklab, #D946EF ${100 - (i / (SEGMENTS - 1)) * 100}%, #6200EA)`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
