"use client";

import { useGSAP } from "@gsap/react";
import { motion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/MagneticButton";
import { heroState, nowSec, useIntroDone } from "@/lib/heroState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

const EASE = [0.16, 1, 0.3, 1] as const;

const line: Variants = {
  hidden: { y: "110%", rotate: 4 },
  show: (i: number) => ({
    y: "0%",
    rotate: 0,
    transition: { duration: 1.2, ease: EASE, delay: 0.1 + i * 0.12 },
  }),
};
const fade: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: (d: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1, ease: EASE, delay: d } }),
};

const SERVICES = ["Websites", "Branding", "Social Media", "SEO & Ads", "Automation"];

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const intro = useIntroDone();
  const [active, setActive] = useState(true);
  const state = intro ? "show" : "hidden";

  // Global pointer + touch tracking (the content layer covers the canvas, so listen on window)
  useEffect(() => {
    const set = (x: number, y: number, type: string) => {
      heroState.pointer.x = (x / window.innerWidth) * 2 - 1;
      heroState.pointer.y = -((y / window.innerHeight) * 2 - 1);
      heroState.pointerType = type === "mouse" ? "mouse" : type === "pen" ? "pen" : "touch";
      heroState.lastInput = nowSec();
    };
    const onMove = (e: PointerEvent) => set(e.clientX, e.clientY, e.pointerType);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) set(t.clientX, t.clientY, "touch");
    };
    const onDown = (e: PointerEvent) => {
      set(e.clientX, e.clientY, e.pointerType);
      const now = nowSec();
      heroState.pulses = heroState.pulses.filter((p) => now - p.t < 2.5).slice(-5);
      heroState.pulses.push({ x: heroState.pointer.x, y: heroState.pointer.y, t: now });
    };
    const el = section.current;
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    el?.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      el?.removeEventListener("pointerdown", onDown);
    };
  }, []);

  useGSAP(
    () => {
      // Hero stays pinned while the next section slides up over it. All hero exit
      // animation lives on this ONE pinned timeline (separate triggers on a pinned
      // element get offset by the pin duration).
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
          scrub: reduced ? false : true,
          onUpdate: (s) => {
            heroState.progress = s.progress;
          },
          onLeave: () => setActive(false),
          onEnterBack: () => setActive(true),
        },
      });
      if (!reduced) {
        // the whole hero recedes: scales down, rounds its corners, darkens
        tl.to(inner.current, { scale: 0.9, borderRadius: 36, duration: 1 }, 0)
          .to(dim.current, { opacity: 0.7, duration: 1 }, 0)
          .to(content.current, { yPercent: -18, opacity: 0, duration: 0.6 }, 0);
      }
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="home"
      aria-labelledby="hero-title"
      className="relative z-0 h-[100svh] min-h-[640px] w-full overflow-hidden bg-obsidian"
    >
      <div ref={inner} className="grain relative h-full w-full overflow-hidden will-change-transform">
        <div className="absolute inset-0">
          <HeroScene active={active} />
        </div>

        {/* readability veils */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-obsidian/95 via-obsidian/55 to-transparent md:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian to-transparent" />

        <div
          ref={content}
          className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-5 pb-28 sm:px-8 md:justify-center md:px-10 md:pb-0"
        >
          <motion.p
            variants={fade}
            custom={0.05}
            initial="hidden"
            animate={state}
            className="mb-6 flex items-center gap-3 font-display text-[11px] font-medium tracking-[0.28em] text-lavender sm:text-xs"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orchid opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-orchid" />
            </span>
            CREATIVE TECHNOLOGY &amp; DIGITAL GROWTH STUDIO
          </motion.p>

          <h1
            id="hero-title"
            className="font-display text-[clamp(3rem,7.4vw,7.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em]"
          >
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block origin-left" variants={line} custom={0} initial="hidden" animate={state}>
                Think Digital.
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block origin-left" variants={line} custom={1} initial="hidden" animate={state}>
                Grow <span className="text-gradient">Bigger.</span>
              </motion.span>
            </span>
          </h1>

          <motion.p
            variants={fade}
            custom={0.5}
            initial="hidden"
            animate={state}
            className="mt-7 max-w-[34rem] text-base leading-relaxed text-lavender sm:text-lg"
          >
            We help businesses build a powerful digital presence through creative design, modern websites,
            branding and smart technology.
          </motion.p>

          <motion.div
            variants={fade}
            custom={0.65}
            initial="hidden"
            animate={state}
            className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <MagneticButton href="/contact">Start a Project</MagneticButton>
            <MagneticButton href="/work" variant="ghost">
              Explore Our Work
            </MagneticButton>
          </motion.div>

          {/* bottom rail */}
          <motion.div
            variants={fade}
            custom={0.9}
            initial="hidden"
            animate={state}
            className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 pb-7 sm:px-8 md:px-10"
          >
            <a
              href="#about-intro"
              className="group flex items-center gap-3 text-[11px] tracking-[0.3em] text-lavender transition-colors hover:text-white"
            >
              <span className="relative block h-10 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-orchid" />
              </span>
              SCROLL
            </a>
            <ul className="hidden items-center gap-6 text-xs tracking-[0.18em] text-lavender/80 md:flex">
              {SERVICES.map((s, i) => (
                <li key={s} className="flex items-center gap-6">
                  {i > 0 && <span className="size-1 rounded-[1px] bg-electric" aria-hidden />}
                  {s.toUpperCase()}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div ref={dim} className="pointer-events-none absolute inset-0 z-20 bg-obsidian opacity-0" />
      </div>
    </section>
  );
}
