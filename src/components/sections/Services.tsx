"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import { SERVICES, type Service } from "@/lib/services";
import { PixelIcon } from "./PixelIcon";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function ServiceCard({ s, i }: { s: Service; i: number }) {
  const card = useRef<HTMLElement>(null);

  // spotlight + subtle 3D tilt that follows the mouse
  function move(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !card.current) return;
    const r = card.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.current.style.setProperty("--mx", `${x * 100}%`);
    card.current.style.setProperty("--my", `${y * 100}%`);
    card.current.style.setProperty("--rx", `${(0.5 - y) * 8}deg`);
    card.current.style.setProperty("--ry", `${(x - 0.5) * 10}deg`);
  }
  function leave() {
    card.current?.style.setProperty("--rx", "0deg");
    card.current?.style.setProperty("--ry", "0deg");
  }

  return (
    <article
      ref={card}
      data-card
      onPointerMove={move}
      onPointerLeave={leave}
      className="group relative shrink-0 [perspective:1200px] max-md:sticky max-md:top-[calc(5.5rem+var(--i)*14px)] md:h-[min(640px,74vh)] md:w-[min(440px,36vw)]"
      style={{ "--i": i } as React.CSSProperties}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#100d17] p-6 transition-[transform,border-color] duration-500 ease-out-expo [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] group-hover:border-orchid/40 group-[.is-active]:border-orchid/30 sm:p-8">
        {/* cursor spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx,50%) var(--my,30%), rgba(195,77,255,0.16), transparent 60%)",
          }}
        />
        {/* gradient line on top edge */}
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-px origin-left scale-x-0 transition-transform duration-700 ease-out-expo group-hover:scale-x-100 group-[.is-active]:scale-x-100"
          style={{ background: "var(--logo-gradient)" }}
        />

        <div className="relative flex items-center justify-between font-display text-xs tracking-[0.25em] text-lavender">
          <span>
            <span className="text-orchid">0{i + 1}</span> / 0{SERVICES.length}
          </span>
          <span className="grid size-9 place-items-center rounded-full border border-white/10 text-white transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-orchid group-hover:bg-orchid">
            ↗
          </span>
        </div>

        <div data-icon className="relative my-2 md:my-auto">
          <PixelIcon cubes={s.icon} />
        </div>

        <div className="relative">
          <h3 className="font-display text-[1.7rem] font-bold leading-[1.05] tracking-[-0.02em] sm:text-3xl">{s.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-lavender sm:text-[0.95rem]">{s.summary}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {s.tags.map((t) => (
              <li
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-lavender transition-colors group-hover:border-white/20"
              >
                {t}
              </li>
            ))}
          </ul>
          <Link
            href={`/services/${s.slug}`}
            className="mt-6 inline-flex items-center gap-2 font-display text-xs font-semibold tracking-[0.18em] uppercase"
          >
            Learn more
            <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Services() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pin the section and scroll the card track horizontally
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const distance = () => el.scrollWidth - window.innerWidth;
        // extra pinned "hold" (one screen) during which Projects slides up over this section
        const holdRatio = window.innerHeight / Math.max(1, distance());

        // each card swings in as it enters from the right (driven by its live position)
        const swing = () => {
          const vw = window.innerWidth;
          cards.forEach((c) => {
            const t = gsap.utils.clamp(0, 1, (vw - c.getBoundingClientRect().left) / (vw * 0.45));
            gsap.set(c, {
              rotateY: -18 * (1 - t),
              rotateZ: 3 * (1 - t),
              y: 60 * (1 - t),
              opacity: 0.25 + 0.75 * t,
              transformPerspective: 1200,
            });
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          onUpdate: swing,
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: swing,
            onUpdate: (st) => {
              const p = Math.min(1, st.progress * (1 + holdRatio));
              if (bar.current) bar.current.style.transform = `scaleX(${p})`;
              const idx = Math.min(SERVICES.length, Math.max(1, Math.ceil(p * SERVICES.length + 0.001)));
              if (count.current) count.current.textContent = `0${idx}`;
            },
          },
        });
        tl.to(el, { x: () => -distance(), duration: 1 }, 0)
          // giant outline word drifts slower than the cards (parallax)
          .to(ghost.current, { xPercent: -30, duration: 1 }, 0)
          // hold: section recedes while the next one covers it
          .to(inner.current, { scale: 0.92, borderRadius: 40, duration: holdRatio }, 1)
          .to(dim.current, { opacity: 0.75, duration: holdRatio }, 1);
      });

      // Mobile: cards stack (CSS sticky); earlier cards shrink back as the next one arrives
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        cards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 70%",
            end: "bottom 30%",
            toggleClass: "is-active",
          });
          const next = cards[i + 1];
          if (!next) return;
          gsap.to(card.firstElementChild, {
            scale: 0.9,
            opacity: 0.45,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 30%", scrub: true },
          });
        });
      });

      // heading reveal (all sizes)
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-sv-word]", {
          yPercent: 110,
          rotate: 5,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section.current, start: "top 75%" },
        });
        gsap.from("[data-sv-fade]", {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.1,
          delay: 0.2,
          scrollTrigger: { trigger: section.current, start: "top 75%" },
        });
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      id="services"
      aria-labelledby="services-title"
      className="relative z-30 md:h-screen"
    >
      {/* overflow-clip (not hidden) so the mobile sticky card stack keeps working */}
      <div
        ref={inner}
        className="relative overflow-clip rounded-t-[32px] border-t border-white/[0.08] bg-obsidian md:h-full md:rounded-t-[56px]"
      >
      {/* faint pixel grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 30% 40%, black 30%, transparent 75%)",
        }}
      />
      {/* giant outline word */}
      <div
        ref={ghost}
        aria-hidden
        className="pointer-events-none absolute bottom-[6vh] left-[4vw] hidden select-none whitespace-nowrap font-display text-[22vw] font-bold leading-none tracking-[-0.05em] text-transparent md:block"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.06)" }}
      >
        SERVICES · SERVICES
      </div>

      <div
        ref={track}
        className="relative flex flex-col gap-6 px-5 pb-24 pt-20 sm:px-8 md:h-full md:w-max md:flex-row md:items-center md:gap-7 md:px-10 md:pb-0 md:pt-0"
      >
        {/* intro panel */}
        <div className="shrink-0 md:w-[min(560px,40vw)] md:pr-10">
          <div data-sv-fade className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
            <span className="text-orchid">(03)</span>
            <span>OUR SERVICES</span>
          </div>
          <h2
            id="services-title"
            className="mt-8 font-display text-[clamp(3rem,7.5vw,7.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em]"
          >
            {["What", "we", "do."].map((w, i) => (
              <span key={w} className="mr-[0.2em] inline-block overflow-hidden pb-[0.06em] align-top last:mr-0">
                <span data-sv-word className={`inline-block origin-bottom-left ${i === 2 ? "text-gradient" : ""}`}>
                  {w}
                </span>
              </span>
            ))}
          </h2>
          <p data-sv-fade className="mt-6 max-w-sm text-base leading-relaxed text-lavender sm:text-lg">
            Five ways we help businesses look better, reach further and work smarter online.
          </p>
          <div data-sv-fade className="mt-10 hidden items-center gap-3 font-display text-[11px] tracking-[0.3em] text-lavender md:flex">
            <span className="relative block h-px w-14 overflow-hidden bg-white/15">
              <span className="absolute inset-y-0 left-0 w-1/2 animate-[slideX_1.8s_ease-in-out_infinite] bg-orchid" />
            </span>
            SCROLL TO EXPLORE
          </div>
        </div>

        {SERVICES.map((s, i) => (
          <ServiceCard key={s.slug} s={s} i={i} />
        ))}

        {/* closing panel */}
        <div className="shrink-0 md:w-[min(420px,34vw)] md:pl-6 md:pr-[8vw]">
          <p className="font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            Need something custom?
          </p>
          <p className="mt-3 text-lavender">Tell us what you have in mind and we&apos;ll shape the right solution.</p>
          <Link
            href="/contact"
            className="group mt-6 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-display text-sm font-semibold text-obsidian transition-colors hover:bg-orchid hover:text-white"
          >
            Talk to us
            <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* progress (desktop) */}
      <div className="pointer-events-none absolute inset-x-10 bottom-8 hidden items-center gap-5 font-display text-xs tracking-[0.25em] text-lavender md:flex">
        <span>
          <span ref={count} className="text-white">
            01
          </span>{" "}
          / 0{SERVICES.length}
        </span>
        <div className="h-px flex-1 bg-white/10">
          <div ref={bar} className="h-full origin-left scale-x-0" style={{ background: "var(--logo-gradient)" }} />
        </div>
      </div>
      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      </div>
    </section>
  );
}
