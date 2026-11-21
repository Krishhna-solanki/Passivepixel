"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type PointerEvent } from "react";
import { FOUNDER } from "@/lib/founder";
import { PixelPortrait } from "./PixelPortrait";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADING = ["The", "developer", "behind", "Passive", "Pixel."];

export function Founder() {
  const section = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-fd-word]", {
          yPercent: 110,
          rotate: 6,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-fd-heading]", start: "top 85%" },
        });
        // portrait card rises with a slight rotation (parallax)
        gsap.fromTo(
          card.current,
          { yPercent: 10, rotate: -4 },
          {
            yPercent: -4,
            rotate: 0,
            ease: "none",
            scrollTrigger: { trigger: card.current, start: "top bottom", end: "bottom 30%", scrub: 1 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-fd-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        // skill tiles pop in like pixels, in random order
        gsap.fromTo("[data-fd-skill]", { scale: 0, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: "back.out(2)",
          stagger: { each: 0.035, from: "random" },
          scrollTrigger: { trigger: "[data-fd-skills]", start: "top 85%" },
        });
      });

      // Exit: pin at the bottom while the Process section slides up over this one
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

  function tilt(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 10}deg`);
    el.style.setProperty("--ry", `${x * 12}deg`);
  }
  function untilt(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  }

  const hasPortfolio = FOUNDER.portfolioUrl.length > 0;

  return (
    <section
      ref={section}
      id="founder"
      aria-labelledby="founder-title"
      className="relative z-[60] overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0a12] md:rounded-t-[56px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-40 h-[520px] w-[620px] rounded-full opacity-20 blur-[140px]"
        style={{ background: "var(--logo-gradient)" }}
      />

      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 md:px-10 md:pb-36 md:pt-32">
        <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
          <span className="text-orchid">(06)</span>
          <span>MEET THE FOUNDER</span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        <div className="mt-12 grid items-start gap-14 md:mt-16 md:grid-cols-12 md:gap-10">
          {/* portrait */}
          <div className="md:col-span-5">
            <div ref={card} className="[perspective:1200px]">
              <div
                onPointerMove={tilt}
                onPointerLeave={untilt}
                className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-violet-deep transition-transform duration-500 ease-out-expo [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]"
              >
                <PixelPortrait src={FOUNDER.photo} className="aspect-[4/5] w-full" />

                {/* floating pixels */}
                <span aria-hidden className="absolute right-6 top-8 size-4 animate-[floatPx_5s_ease-in-out_infinite] bg-orchid/80" />
                <span aria-hidden className="absolute right-14 top-16 size-2 animate-[floatPx_6s_ease-in-out_infinite_0.8s] bg-white/70" />
                <span aria-hidden className="absolute left-8 top-1/3 size-3 animate-[floatPx_7s_ease-in-out_infinite_1.6s] bg-electric/80" />

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent p-6 pt-20">
                  <p className="font-display text-2xl font-bold tracking-tight">{FOUNDER.name}</p>
                  <p className="mt-1 text-sm text-lavender">{FOUNDER.role}</p>
                </div>

                {FOUNDER.placeholder && (
                  <span className="absolute left-5 top-5 rounded-full bg-orchid/90 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
                    PLACEHOLDER
                  </span>
                )}
                {/* gradient border on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(195,77,255,0.6)" }}
                />
              </div>
            </div>
          </div>

          {/* text */}
          <div className="md:col-span-7 md:col-start-6 md:pl-8">
            <h2
              data-fd-heading
              id="founder-title"
              className="font-display text-[clamp(2.4rem,5.6vw,5.6rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]"
            >
              {HEADING.map((w, i) => (
                <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                  <span data-fd-word className={`inline-block origin-bottom-left ${i >= 3 ? "text-gradient" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
            </h2>

            <p data-fd-reveal className="mt-8 max-w-xl text-lg leading-relaxed text-white/90 sm:text-xl">
              {FOUNDER.intro}
            </p>

            {/* skills board */}
            <div data-fd-skills className="mt-12 space-y-7">
              {FOUNDER.skills.map((g) => (
                <div key={g.group}>
                  <p className="font-display text-xs tracking-[0.25em] text-lavender">{g.group.toUpperCase()}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <li
                        key={s}
                        data-fd-skill
                        className="group/s relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-orchid/50"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 ease-out group-hover/s:scale-y-100"
                          style={{ background: "linear-gradient(135deg, rgba(217,70,239,0.35), rgba(98,0,234,0.35))" }}
                        />
                        <span className="relative">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div data-fd-reveal className="mt-12 flex flex-wrap items-center gap-4">
              {hasPortfolio ? (
                <a
                  href={FOUNDER.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-electric px-6 py-3.5 font-display text-sm font-semibold transition-colors hover:bg-orchid"
                >
                  View personal portfolio
                  <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-3 rounded-full border border-dashed border-white/20 px-6 py-3.5 font-display text-sm font-semibold text-lavender">
                  Personal portfolio: link coming soon
                </span>
              )}
              {FOUNDER.socials
                .filter((s) => s.url)
                .map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-lavender transition-colors hover:border-white/40 hover:text-white"
                  >
                    {s.label} ↗
                  </a>
                ))}
            </div>
            <p data-fd-reveal className="mt-5 text-xs text-lavender/70">
              The founder&apos;s personal portfolio is kept separate from Passive Pixel client work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
