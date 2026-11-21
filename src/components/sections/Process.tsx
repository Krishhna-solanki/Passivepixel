"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { getLenis } from "@/lib/heroState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    title: "Discover",
    text: "We learn about your business, goals, audience and competitors to understand what success looks like.",
    items: ["Discovery call", "Goals & audience", "Competitor review"],
  },
  {
    title: "Plan",
    text: "We define scope, structure, features and timeline, so everyone knows exactly what is being built and when.",
    items: ["Sitemap", "Feature list", "Timeline"],
  },
  {
    title: "Design",
    text: "We create the look and feel: layouts, visuals and interactions that fit your brand.",
    items: ["Wireframes", "UI design", "Prototype"],
  },
  {
    title: "Develop",
    text: "We build it with modern, fast and reliable technology, tested across devices and browsers.",
    items: ["Frontend & backend", "Responsive build", "Testing"],
  },
  {
    title: "Launch",
    text: "We go live with domain, hosting, SEO basics and analytics set up, plus a smooth handover.",
    items: ["Deployment", "SEO setup", "Analytics"],
  },
  {
    title: "Support & Improve",
    text: "After launch we maintain, update and keep improving your site based on real results.",
    items: ["Maintenance", "Updates", "Improvements"],
  },
];

// staircase geometry (svg units, viewBox 600×600): each step rises up and to the right
const NODE = STEPS.map((_, i) => ({ x: 60 + i * 96, y: 540 - i * 96 }));
const PATH = NODE.reduce(
  (d, n, i) => (i === 0 ? `M${n.x} ${n.y}` : `${d} H${n.x} V${n.y}`),
  "",
);

export function Process() {
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const traveler = useRef<SVGGElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const stepsShare = useRef(1); // fraction of the pin used by the steps (rest = exit hold)
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const activeRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: pinned stepper. The staircase draws itself and a glowing pixel climbs it.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const p = path.current!;
        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        const proxy = { v: 0 };
        const stepsDist = () => window.innerHeight * 0.7 * STEPS.length;
        const holdRatio = window.innerHeight / stepsDist();
        stepsShare.current = 1 / (1 + holdRatio);

        const render = () => {
          p.style.strokeDashoffset = `${len * (1 - proxy.v)}`;
          const pt = p.getPointAtLength(len * proxy.v);
          traveler.current?.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          const idx = Math.min(STEPS.length - 1, Math.floor(proxy.v * STEPS.length + 0.0001));
          if (idx !== activeRef.current) {
            setDir(idx > activeRef.current ? 1 : -1);
            activeRef.current = idx;
            setActive(idx);
          }
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${stepsDist() + window.innerHeight}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        trigger.current = tl.scrollTrigger ?? null;
        tl.to(proxy, { v: 1, duration: 1, onUpdate: render }, 0)
          // exit hold: recede while the next section slides over
          .to(inner.current, { scale: 0.92, borderRadius: 40, duration: holdRatio }, 1)
          .to(dim.current, { opacity: 0.75, duration: holdRatio }, 1);
        render();

        gsap.from("[data-pr-word]", {
          yPercent: 110,
          rotate: 6,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: section.current, start: "top 70%" },
        });
      });

      // Mobile (and reduced motion): vertical timeline whose line fills as you scroll
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-pr-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-pr-list]", start: "top 70%", end: "bottom 60%", scrub: true },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-pr-item]").forEach((el) => {
          ScrollTrigger.create({ trigger: el, start: "top 65%", end: "bottom 35%", toggleClass: "is-active" });
          gsap.from(el, { y: 40, opacity: 0, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
        });
      });
    },
    { scope: section },
  );

  function goTo(i: number) {
    const st = trigger.current;
    if (!st) return;
    const y = st.start + (st.end - st.start) * stepsShare.current * ((i + 0.5) / STEPS.length);
    getLenis()?.scrollTo(y, { duration: 1.2 });
  }

  const step = STEPS[active];

  return (
    <section
      ref={section}
      id="process"
      aria-labelledby="process-title"
      className="relative z-[65] motion-safe:md:h-screen"
    >
      <div
        ref={inner}
        className="relative overflow-clip rounded-t-[32px] border-t border-white/[0.08] bg-obsidian motion-safe:md:h-full md:rounded-t-[56px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at 70% 50%, black 25%, transparent 70%)",
          }}
        />

        {/* ---------- desktop pinned stepper ---------- */}
        <div className="relative mx-auto hidden h-full max-w-[1400px] grid-cols-12 items-center gap-10 px-10 motion-safe:md:grid">
          <div className="col-span-5 flex h-full flex-col justify-center py-24">
            <div className="flex items-center gap-4 font-display text-xs tracking-[0.3em] text-lavender">
              <span className="text-orchid">(07)</span>
              <span>OUR PROCESS</span>
            </div>
            <h2
              id="process-title"
              className="mt-6 font-display text-[clamp(2.4rem,4.6vw,4.6rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]"
            >
              {["From", "idea", "to", "digital", "impact."].map((w, i) => (
                <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                  <span data-pr-word className={`inline-block origin-bottom-left ${i >= 3 ? "text-gradient" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
            </h2>

            {/* active step */}
            <div className="relative mt-10 min-h-[260px]">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={active}
                  custom={dir}
                  initial="enter"
                  animate="show"
                  exit="leave"
                  variants={{
                    enter: (d: number) => ({ opacity: 0, y: d * 40, filter: "blur(6px)" }),
                    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
                    leave: (d: number) => ({ opacity: 0, y: d * -40, filter: "blur(6px)", transition: { duration: 0.3 } }),
                  }}
                >
                  <div className="flex items-baseline gap-4">
                    <span className="text-gradient font-display text-7xl font-bold leading-none tracking-tight">
                      0{active + 1}
                    </span>
                    <h3 className="font-display text-3xl font-bold tracking-tight">{step.title}</h3>
                  </div>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-lavender">{step.text}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {step.items.map((it) => (
                      <li key={it} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/85">
                        {it}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* step navigator */}
            <ol className="mt-6 flex gap-2" aria-label="Process steps">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Step ${i + 1}: ${s.title}`}
                    aria-current={i === active ? "step" : undefined}
                    className="group flex items-center py-2"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-500 ease-out-expo ${
                        i === active ? "w-10 bg-orchid" : i < active ? "w-4 bg-electric/70" : "w-4 bg-white/15 group-hover:bg-white/40"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* staircase */}
          <div className="relative col-span-7 col-start-6 aspect-square max-h-[78vh] w-full justify-self-center">
            <svg viewBox="0 0 600 600" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="pr-grad" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#6200EA" />
                  <stop offset="0.5" stopColor="#A020F0" />
                  <stop offset="1" stopColor="#D946EF" />
                </linearGradient>
                <filter id="pr-glow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" />
                </filter>
              </defs>
              {/* track */}
              <path d={PATH} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" strokeDasharray="6 8" />
              {/* drawn progress */}
              <path ref={path} d={PATH} fill="none" stroke="url(#pr-grad)" strokeWidth="4" strokeLinecap="square" />
              {/* nodes */}
              {NODE.map((n, i) => {
                const done = i <= active;
                return (
                  <g key={i} transform={`translate(${n.x} ${n.y})`}>
                    <rect
                      x={-16}
                      y={-16}
                      width={32}
                      height={32}
                      rx={5}
                      fill={done ? "url(#pr-grad)" : "#100d17"}
                      stroke={done ? "none" : "rgba(255,255,255,0.18)"}
                      strokeWidth="1.5"
                      style={{ transition: "fill .4s" }}
                    />
                    {i === active && (
                      <rect x={-26} y={-26} width={52} height={52} rx={8} fill="none" stroke="#C34DFF" strokeOpacity="0.6">
                        <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite" />
                      </rect>
                    )}
                  </g>
                );
              })}
              {/* climbing pixel */}
              <g ref={traveler} transform={`translate(${NODE[0].x} ${NODE[0].y})`}>
                <rect x={-14} y={-14} width={28} height={28} fill="#D946EF" filter="url(#pr-glow)" opacity="0.9" />
                <rect x={-7} y={-7} width={14} height={14} rx={2} fill="#fff" />
              </g>
            </svg>

            {/* node labels (HTML so they stay crisp) */}
            {NODE.map((n, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                tabIndex={-1}
                className={`absolute -translate-y-1/2 whitespace-nowrap transition-all duration-500 ease-out-expo ${
                  i === 0 ? "text-left" : "-translate-x-full text-right"
                } ${i === active ? "opacity-100" : i < active ? "opacity-60" : "opacity-30 hover:opacity-60"}`}
                // first label sits above its node; the rest sit to the LEFT (the stair line arrives from below)
                style={
                  i === 0
                    ? { left: `calc(${(n.x / 600) * 100}% - 8px)`, top: `calc(${(n.y / 600) * 100}% - 46px)` }
                    : { left: `calc(${(n.x / 600) * 100}% - 34px)`, top: `${(n.y / 600) * 100}%` }
                }
              >
                <span className="font-display text-[11px] tracking-[0.25em] text-orchid">0{i + 1}</span>
                <span className={`ml-2 font-display text-sm font-semibold ${i === active ? "text-white" : "text-lavender"}`}>
                  {STEPS[i].title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- mobile / reduced-motion timeline ---------- */}
        <div className="relative px-5 pb-24 pt-20 sm:px-8 motion-safe:md:hidden md:px-10">
          <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender">
            <span className="text-orchid">(07)</span>
            <span>OUR PROCESS</span>
          </div>
          <h2 className="mt-6 font-display text-[clamp(2.4rem,9vw,4rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]">
            From idea to <span className="text-gradient">digital impact.</span>
          </h2>

          <ol data-pr-list className="relative mt-12 space-y-5 pl-10">
            <span aria-hidden className="absolute bottom-6 left-[13px] top-6 w-0.5 bg-white/10" />
            <span
              data-pr-line
              aria-hidden
              className="absolute bottom-6 left-[13px] top-6 w-0.5 origin-top"
              style={{ background: "var(--logo-gradient)" }}
            />
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                data-pr-item
                className="group relative rounded-[22px] border border-white/[0.08] bg-[#100d17] p-6 transition-colors duration-500 [&.is-active]:border-orchid/30"
              >
                <span
                  aria-hidden
                  className="absolute -left-[35px] top-7 size-4 rounded-[3px] border border-white/20 bg-obsidian transition-all duration-500 group-[.is-active]:scale-125 group-[.is-active]:border-transparent group-[.is-active]:bg-orchid"
                />
                <div className="flex items-baseline gap-3">
                  <span className="text-gradient font-display text-3xl font-bold">0{i + 1}</span>
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-lavender">{s.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.items.map((it) => (
                    <li key={it} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/80">
                      {it}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      </div>
    </section>
  );
}
