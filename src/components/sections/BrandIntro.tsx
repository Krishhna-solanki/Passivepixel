"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef } from "react";
import { PixelGrid } from "./PixelGrid";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADING = ["More", "than", "just", "digital", "presence."];

const PRINCIPLES = [
  {
    title: "Creative Thinking",
    text: "Ideas and visuals that help your brand stand out and stay remembered.",
  },
  {
    title: "Modern Technology",
    text: "Fast, responsive websites and tools built with current web technology.",
  },
  {
    title: "Practical Strategy",
    text: "Every design and feature is tied to a real business goal.",
  },
];

export function BrandIntro() {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // heading rises word by word while the section slides over the hero
        gsap.fromTo(
          "[data-word]",
          { yPercent: 110, rotate: 6 },
          {
            yPercent: 0,
            rotate: 0,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: section.current, start: "top 85%", end: "top 20%", scrub: 0.8 },
          },
        );

        gsap.fromTo(
          "[data-rule]",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top 75%", end: "top 25%", scrub: 0.8 },
          },
        );

        // pixel panel floats up with slight rotation (parallax)
        gsap.fromTo(
          panel.current,
          { yPercent: 14, rotate: -3, scale: 0.94 },
          {
            yPercent: -4,
            rotate: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: panel.current, start: "top bottom", end: "bottom 40%", scrub: 1 },
          },
        );

        // body copy and principle rows reveal in sequence
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 50,
            opacity: 0,
            filter: "blur(6px)",
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        gsap.utils.toArray<HTMLElement>("[data-line]").forEach((el) => {
          gsap.from(el, {
            scaleX: 0,
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          });
        });
      });

      // Exit: pin this section at its bottom while Services slides up over it
      // (created last so the triggers above are measured before the pin).
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
        },
      });
      if (!reduced) {
        exit
          .to(
            inner.current,
            {
              scale: 0.92,
              // scale around the middle of what is visible (the section is taller than the screen)
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
      id="about-intro"
      aria-labelledby="intro-title"
      className="relative z-20 -mt-px overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0a12] md:rounded-t-[56px]"
    >
      {/* soft purple glow along the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "var(--logo-gradient)" }}
      />

      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 md:px-10 md:pb-36 md:pt-32">
        <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
          <span className="text-orchid">(02)</span>
          <span>WHO WE ARE</span>
          <span data-rule className="h-px flex-1 origin-left bg-white/15" />
          <span className="hidden sm:inline">CREATIVITY × TECHNOLOGY</span>
        </div>

        <h2
          ref={heading}
          id="intro-title"
          className="mt-10 font-display text-[clamp(2.6rem,8vw,8rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em] md:mt-14"
        >
          {HEADING.map((w, i) => (
            <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
              <span data-word className={`inline-block origin-bottom-left ${i >= 3 ? "text-gradient" : ""}`}>
                {w}
              </span>
            </span>
          ))}
        </h2>

        <div className="mt-14 grid items-start gap-12 md:mt-24 md:grid-cols-12 md:gap-10">
          <div ref={panel} className="md:col-span-6">
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#09070e] p-4 sm:p-6">
              <PixelGrid />
              <div className="pointer-events-none absolute inset-x-5 bottom-4 flex justify-between font-display text-[10px] tracking-[0.3em] text-lavender/70 sm:inset-x-7 sm:bottom-6">
                <span>MOVE · TAP</span>
                <span>PX / 01</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8 md:pt-6">
            <p data-reveal className="text-xl leading-relaxed text-white sm:text-2xl">
              We combine creative thinking, modern technology and practical strategies to help businesses build
              meaningful digital experiences.
            </p>

            <ul className="mt-12">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className="group relative py-6">
                  <span data-line className="absolute inset-x-0 top-0 h-px origin-left bg-white/12" />
                  <div data-reveal className="flex gap-6">
                    <span className="pt-1 font-display text-xs text-orchid">0{i + 1}</span>
                    <div>
                      <h3 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-orchid sm:text-2xl">
                        {p.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-lavender sm:text-base">{p.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div data-reveal className="mt-10">
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 font-display text-sm font-semibold tracking-[0.14em] uppercase"
              >
                <span className="relative">
                  Discover Passive Pixel
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left bg-orchid transition-transform duration-500 ease-out-expo group-hover:scale-x-0" />
                </span>
                <span className="grid size-9 place-items-center rounded-full border border-white/15 transition-all duration-500 ease-out-expo group-hover:border-orchid group-hover:bg-orchid">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
