"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heroState } from "@/lib/heroState";
import { PixelIcon } from "./PixelIcon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STATEMENT =
  "Passive Pixel is a creative technology and digital growth agency focused on helping businesses establish, improve and expand their digital presence. We believe good design should look impressive, solve real problems and create meaningful experiences.";

const PILLARS: {
  key: string;
  title: string;
  text: string;
  points?: string[];
  icon: [number, number, number][];
}[] = [
  {
    key: "Mission",
    title: "Our Mission",
    text: "To help businesses of every size build a digital presence that looks premium, works reliably and supports real growth.",
    // target: centre pixel with a ring
    icon: [[0, 0, 0], [0, -1.3, 0], [0, 1.3, 0], [-1.3, 0, 0], [1.3, 0, 0]],
  },
  {
    key: "Vision",
    title: "Our Vision",
    text: "To be a trusted creative technology partner for growing brands, where thoughtful design and modern technology work as one.",
    // rising column
    icon: [[0, 1, 0], [0, 0, 0], [0, -1, 0], [0, -2.1, 0]],
  },
  {
    key: "Philosophy",
    title: "How We Work",
    text: "Clear communication, honest timelines and work we're proud to put our name on.",
    points: ["Design with purpose", "Build for performance", "Keep improving after launch"],
    // three stacked layers
    icon: [[-0.5, 0.6, -0.5], [0.5, 0.6, 0.5], [0, -0.5, 0], [0, -1.6, 0]],
  },
];

const VALUES = ["Creative Design", "Modern Websites", "Branding", "Smart Technology", "Digital Growth"];

/** Endless band of values: speeds up and flips direction with the scroll. */
function VelocityMarquee() {
  const track = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let x = 0;
    let dir = -1;
    let vel = 0;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = heroState.velocity;
      vel += (v - vel) * 0.1;
      if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
      const speed = 60 + Math.min(Math.abs(vel) * 40, 1600); // px/s
      x += dir * speed * dt;
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      if (band.current) band.current.style.transform = `rotate(-2deg) skewX(${Math.max(-12, Math.min(12, -vel * 0.4))}deg)`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const row = (
    <div className="flex shrink-0 items-center">
      {VALUES.map((v) => (
        <span key={v} className="flex items-center">
          <span className="px-6 font-display text-[clamp(2rem,5vw,4.5rem)] font-bold uppercase tracking-[-0.03em] md:px-10">
            {v}
          </span>
          <span aria-hidden className="size-3 rotate-45 bg-orchid md:size-4" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative -mx-5 overflow-hidden py-10 sm:-mx-8 md:-mx-10 md:py-16" aria-hidden>
      <div ref={band} className="border-y border-white/10 bg-violet-deep/80 py-5 [transform:rotate(-2deg)] md:py-7">
        <div ref={track} className="flex w-max will-change-transform">
          {row}
          {row}
        </div>
      </div>
    </div>
  );
}

export function About() {
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // "CREATIVITY" and "TECHNOLOGY." travel in from opposite sides and meet
        const st = () => ({ trigger: section.current, start: "top 95%", end: "top 15%", scrub: 0.8 });
        gsap.fromTo("[data-ab-left]", { xPercent: -45, opacity: 0.15 }, { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: st() });
        gsap.fromTo("[data-ab-right]", { xPercent: 45, opacity: 0.15 }, { xPercent: 0, opacity: 1, ease: "none", scrollTrigger: st() });
        gsap.fromTo(
          "[data-ab-meets]",
          { scale: 0, rotate: -90 },
          { scale: 1, rotate: 0, ease: "none", scrollTrigger: { trigger: section.current, start: "top 60%", end: "top 20%", scrub: 0.8 } },
        );

        // statement lights up word by word as you read
        gsap.fromTo(
          "[data-ab-word]",
          { opacity: 0.14 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.05,
            scrollTrigger: { trigger: "[data-ab-statement]", start: "top 80%", end: "bottom 50%", scrub: true },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-ab-reveal]").forEach((el, i) => {
          gsap.from(el, {
            y: 60,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            delay: (i % 3) * 0.08,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
      });

      // Exit: pin at the bottom while the Founder section slides up over this one
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const exit = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section.current,
          start: "bottom bottom",
          end: "+=100%",
          pin: true,
          pinSpacing: false,
          scrub: reduced ? false : true,
          invalidateOnRefresh: true,
        },
      });
      if (!reduced) {
        exit
          .to(
            inner.current,
            {
              scale: 0.92,
              transformOrigin: () => `50% ${(section.current?.offsetHeight ?? 0) - window.innerHeight / 2}px`,
              duration: 1,
            },
            0,
          )
          .to(dim.current, { opacity: 0.75, duration: 1 }, 0);
      }
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="about"
      aria-labelledby="about-title"
      className="relative z-50 overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-obsidian md:rounded-t-[56px]"
    >
      {/* pixel grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[900px] opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 70%)",
        }}
      />

      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-20 sm:px-8 md:px-10 md:pt-32">
        <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
          <span className="text-orchid">(05)</span>
          <span>ABOUT PASSIVE PIXEL</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        {/* converging heading */}
        <h2
          id="about-title"
          className="mt-12 font-display font-bold uppercase leading-[0.88] tracking-[-0.05em] md:mt-16"
        >
          <span data-ab-left className="block text-[clamp(3rem,11vw,11rem)]">
            Creativity
          </span>
          <span className="my-2 flex items-center gap-4 md:my-0 md:justify-center">
            <span data-ab-meets aria-hidden className="grid size-10 place-items-center md:size-16">
              <span className="block size-4 rotate-45 md:size-6" style={{ background: "var(--logo-gradient)" }} />
            </span>
            <span className="font-display text-[clamp(1rem,2vw,1.6rem)] font-medium tracking-[0.4em] text-lavender">
              MEETS
            </span>
          </span>
          <span data-ab-right className="block text-right text-[clamp(3rem,11vw,11rem)]">
            <span className="text-gradient">Technology.</span>
          </span>
        </h2>

        {/* statement + founder note */}
        <div className="mt-20 grid gap-12 md:mt-32 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="md:sticky md:top-32">
              <p data-ab-reveal className="font-display text-xs tracking-[0.3em] text-lavender">WHO WE ARE</p>
              <div
                data-ab-reveal
                className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-violet-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/passivepixel-icon.png" alt="" className="h-8 w-auto" />
                </div>
                <p className="text-sm leading-relaxed text-lavender">
                  Founded by a frontend developer who loves modern web technology, creative design and building
                  practical digital solutions.
                </p>
              </div>
              <a
                data-ab-reveal
                href="#founder"
                className="group mt-5 inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.18em] uppercase hover:text-orchid"
              >
                Meet the founder
                <span className="transition-transform duration-500 ease-out-expo group-hover:translate-y-0.5">↓</span>
              </a>
            </div>
          </div>
          <p
            data-ab-statement
            className="font-display text-[clamp(1.6rem,3.2vw,3rem)] font-medium leading-[1.2] tracking-[-0.02em] md:col-span-8"
          >
            {STATEMENT.split(" ").map((w, i) => (
              <span key={i} data-ab-word className="inline-block pr-[0.28em]">
                {w}
              </span>
            ))}
          </p>
        </div>

        <VelocityMarquee />

        {/* mission / vision / philosophy: expanding panels */}
        <div className="mt-6 flex flex-col gap-4 md:mt-10 md:h-[480px] md:flex-row">
          {PILLARS.map((p, i) => {
            const on = active === i;
            return (
              <button
                key={p.key}
                type="button"
                data-ab-reveal
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                aria-expanded={on}
                className={`group relative flex min-w-0 flex-col overflow-hidden rounded-[28px] border p-6 text-left transition-[flex-grow,border-color,background-color] duration-700 ease-out-expo sm:p-8 ${
                  on ? "is-active border-orchid/30 bg-[#120e1b] md:grow-[2.4]" : "border-white/[0.08] bg-[#0e0b14] md:grow"
                } md:basis-0`}
              >
                {/* glow */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-20 -top-20 size-72 rounded-full blur-[90px] transition-opacity duration-700 ${on ? "opacity-40" : "opacity-0"}`}
                  style={{ background: "var(--logo-gradient)" }}
                />
                <div className="relative flex items-center justify-between font-display text-xs tracking-[0.25em] text-lavender">
                  <span>
                    <span className="text-orchid">0{i + 1}</span> · {p.key.toUpperCase()}
                  </span>
                  <span
                    className={`grid size-8 place-items-center rounded-full border transition-all duration-500 ${
                      on ? "rotate-45 border-orchid bg-orchid text-white" : "border-white/15"
                    }`}
                  >
                    +
                  </span>
                </div>

                <div
                  className={`relative -mx-4 transition-all duration-700 ease-out-expo md:my-auto ${
                    on ? "opacity-100" : "md:scale-75 md:opacity-40"
                  }`}
                >
                  <PixelIcon cubes={p.icon} size={30} />
                </div>

                <div className="relative mt-auto">
                  <h3 className="whitespace-nowrap font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">{p.title}</h3>
                  <div
                    className={`grid transition-all duration-700 ease-out-expo md:min-w-[22rem] ${
                      on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[1fr] opacity-100 md:grid-rows-[0fr] md:opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-lavender sm:text-base">{p.text}</p>
                      {p.points && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {p.points.map((pt) => (
                            <li key={pt} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/85">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div data-ab-reveal className="mt-16 flex flex-col items-start justify-between gap-6 md:mt-24 md:flex-row md:items-center">
          <p className="max-w-lg text-lavender">
            Want the full story: how we started, what we value and how we work with clients?
          </p>
          <Link
            href="/about"
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 font-display text-sm font-semibold transition-colors hover:border-orchid hover:bg-orchid"
          >
            More about us
            <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
