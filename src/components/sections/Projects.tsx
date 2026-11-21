"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { PROJECT_FILTERS, PROJECTS, type Project } from "@/lib/projects";
import { MockSite } from "./MockSite";

const EASE = [0.16, 1, 0.3, 1] as const;
type Filter = (typeof PROJECT_FILTERS)[number];

const HEADING = ["Ideas", "turned", "into", "digital", "experiences."];

function ProjectCard({ p, onHover }: { p: Project; onHover: (on: boolean) => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduced ? ["0%", "0%"] : ["-7%", "7%"]);

  const enter = (e: PointerEvent) => e.pointerType === "mouse" && onHover(true);
  const leave = () => onHover(false);

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.35 } }}
      transition={{ duration: 0.8, ease: EASE }}
      className="group"
    >
      <Link
        href={`/work/${p.slug}`}
        onPointerEnter={enter}
        onPointerLeave={leave}
        className="block rounded-[26px] outline-none focus-visible:ring-2 focus-visible:ring-orchid md:cursor-none"
        aria-label={`${p.name}: view case study`}
      >
        <motion.div
          initial={reduced ? false : { clipPath: "inset(14% 8% 14% 8% round 26px)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 26px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.3, ease: EASE }}
          className="relative aspect-[16/11] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#110e18]"
        >
          {/* parallax layer */}
          <motion.div style={{ y }} className="absolute -inset-y-[8%] inset-x-0">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(120% 90% at 20% 10%, color-mix(in oklab, ${p.mock.accent} 35%, #110e18), #0d0b13 70%)`,
              }}
            />
            {/* browser frame */}
            <div className="absolute inset-x-[7%] bottom-[2%] top-[16%] overflow-hidden rounded-t-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10 transition-transform duration-700 ease-out-expo [transform:perspective(1200px)_rotateX(0deg)] group-hover:[transform:perspective(1200px)_rotateX(5deg)_translateY(-2%)]">
              <div className="flex items-center gap-1.5 bg-[#1b1823] px-3 py-2">
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
                <span className="size-2 rounded-full bg-white/20" />
                <span className="ml-3 h-4 flex-1 rounded-full bg-white/[0.06] px-3 text-[9px] leading-4 text-white/40">
                  {p.slug}.com
                </span>
              </div>
              <div className="h-full overflow-hidden">
                {/* the page scrolls inside the frame on hover */}
                <div className="transition-transform duration-[2600ms] ease-in-out group-hover:-translate-y-[38%]">
                  <MockSite mock={p.mock} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute left-4 top-4 flex gap-2 sm:left-5 sm:top-5">
            <span className="rounded-full border border-white/15 bg-obsidian/60 px-3 py-1 text-[10px] font-medium tracking-[0.18em] text-white backdrop-blur-md">
              {p.category.toUpperCase()}
            </span>
            {p.demo && (
              <span className="rounded-full bg-orchid/90 px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
                DEMO
              </span>
            )}
          </div>
        </motion.div>
      </Link>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-[-0.02em] transition-colors group-hover:text-orchid sm:text-3xl">
            {p.name}
          </h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-lavender sm:text-base">{p.description}</p>
        </div>
        <span className="shrink-0 pt-2 font-display text-xs tracking-[0.2em] text-lavender">{p.year}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.services.map((s) => (
          <span key={s} className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/80">
            {s}
          </span>
        ))}
        {p.tech.map((t) => (
          <span key={t} className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] text-lavender">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-5 flex gap-6 font-display text-xs font-semibold tracking-[0.18em] uppercase">
        <Link href={`/work/${p.slug}`} className="group/l inline-flex items-center gap-2 hover:text-orchid">
          Case study <span className="transition-transform duration-500 group-hover/l:translate-x-1">→</span>
        </Link>
        {p.liveUrl && (
          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lavender hover:text-white">
            Live site ↗
          </a>
        )}
      </div>
    </motion.article>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>("All");
  const [hovering, setHovering] = useState(false);
  const list = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  // cursor-following "View" badge (desktop mouse only)
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const sx = useSpring(mx, { stiffness: 350, damping: 30, mass: 0.5 });
  const sy = useSpring(my, { stiffness: 350, damping: 30, mass: 0.5 });

  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  // Exit: pin at the bottom while the About section slides up over this one
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
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
        tl.to(
          inner.current,
          {
            scale: 0.92,
            transformOrigin: () => `50% ${(section.current?.offsetHeight ?? 0) - window.innerHeight / 2}px`,
            duration: 1,
          },
          0,
        ).to(dim.current, { opacity: 0.75, duration: 1 }, 0);
      }
    },
    { scope: section },
  );

  // page height changes after filtering → re-measure scroll animations
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 750);
    return () => clearTimeout(t);
  }, [filter]);

  return (
    <section
      ref={section}
      id="work"
      aria-labelledby="work-title"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(e.clientX);
        my.set(e.clientY);
      }}
      className="relative z-40 overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0a12] motion-safe:md:-mt-[100vh] md:rounded-t-[56px]"
    >
      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 h-[500px] w-[700px] rounded-full opacity-20 blur-[140px]"
        style={{ background: "var(--logo-gradient)" }}
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 md:px-10 md:pb-36 md:pt-32">
        <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
          <span className="text-orchid">(04)</span>
          <span>SELECTED WORK</span>
          <span className="h-px flex-1 bg-white/15" />
          <span>({String(PROJECTS.length).padStart(2, "0")})</span>
        </div>

        {/* the HEADING is observed (words start clipped, so they can't be observed themselves) */}
        <motion.h2
          id="work-title"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-10 max-w-[14ch] font-display text-[clamp(2.6rem,7vw,7rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em] md:mt-14"
        >
          {HEADING.map((w, i) => (
            <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
              <motion.span
                className={`inline-block origin-bottom-left ${i >= 3 ? "text-gradient" : ""}`}
                variants={{
                  hidden: { y: "110%", rotate: 6 },
                  show: { y: "0%", rotate: 0, transition: { duration: 1.1, ease: EASE, delay: i * 0.07 } },
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        {/* filters */}
        <LayoutGroup>
          <div
            role="tablist"
            aria-label="Filter projects"
            className="mt-12 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] md:mt-16"
          >
            {PROJECT_FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(f)}
                  className={`relative shrink-0 rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    active ? "border-transparent text-white" : "border-white/10 text-lavender hover:text-white"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="pp-filter"
                      className="absolute inset-0 rounded-full bg-electric"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">{f === "All" ? "All Work" : f.replace(" Project", "")}</span>
                </button>
              );
            })}
          </div>

          <motion.div
            layout
            className="mt-12 grid gap-x-10 gap-y-20 md:grid-cols-2 md:[&>*:nth-child(even)]:mt-32"
          >
            <AnimatePresence mode="popLayout">
              {list.map((p) => (
                <ProjectCard key={p.slug} p={p} onHover={setHovering} />
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-10 md:flex-row md:items-center">
          <p className="max-w-md text-lavender">
            Every project starts with understanding the business behind it. Here&apos;s a look at how we work.
          </p>
          <Link
            href="/work"
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 font-display text-sm font-semibold transition-colors hover:border-orchid hover:bg-orchid"
          >
            View all projects
            <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
      </div>

      {/* cursor badge (outside the scaled wrapper so `fixed` stays relative to the viewport) */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[60] hidden size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-xs font-semibold tracking-[0.18em] text-white md:grid"
        style={{ x: sx, y: sy, background: "var(--logo-gradient)" }}
        animate={{ scale: hovering ? 1 : 0, opacity: hovering ? 1 : 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        VIEW ↗
      </motion.div>
    </section>
  );
}
