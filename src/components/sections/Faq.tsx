"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { FAQS } from "@/lib/faq";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;

// 7×9 bitmap of a question mark
const MARK = [
  ".XXXXX.",
  "XX...XX",
  "XX...XX",
  ".....XX",
  "...XXX.",
  "...XX..",
  "...XX..",
  ".......",
  "...XX..",
];

/** Big pixel "?" — pixels pop in, glow on hover, and ripple whenever `pulse` changes. */
function PixelQuestion({ pulse }: { pulse: number }) {
  const cells = MARK.flatMap((row, y) => row.split("").map((c, x) => ({ x, y, on: c === "X" })));
  return (
    <div
      aria-hidden
      className="grid w-fit gap-1.5"
      style={{ gridTemplateColumns: `repeat(${MARK[0].length}, minmax(0, 1fr))` }}
    >
      {cells.map((c, i) =>
        c.on ? (
          <motion.span
            key={`${i}-${pulse}`}
            data-faq-px
            className="block size-5 rounded-[3px] transition-[filter,translate] duration-300 hover:-translate-y-1 hover:brightness-150 sm:size-6"
            style={{
              background: `color-mix(in oklab, #D946EF ${100 - ((c.x + (MARK.length - c.y)) / 16) * 100}%, #6200EA)`,
            }}
            initial={pulse ? { scale: 0.4, opacity: 0.4 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: EASE, delay: (c.x + c.y) * 0.03 }}
          />
        ) : (
          <span key={i} className="block size-5 rounded-[3px] bg-white/[0.03] sm:size-6" />
        ),
      )}
    </div>
  );
}

function FaqItem({
  i,
  q,
  a,
  topic,
  open,
  onToggle,
}: {
  i: number;
  q: string;
  a: string;
  topic: string;
  open: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  return (
    <li data-faq-item className="relative border-b border-white/[0.08]">
      {/* active gradient bar */}
      <motion.span
        aria-hidden
        className="absolute left-0 top-0 h-full w-0.5 origin-top"
        style={{ background: "var(--logo-gradient)" }}
        initial={false}
        animate={{ scaleY: open ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          className="group flex w-full items-center gap-5 py-6 pl-5 pr-1 text-left sm:gap-8 sm:py-8 sm:pl-8"
        >
          <span className="w-8 shrink-0 font-display text-xs tracking-[0.2em] text-orchid">0{i + 1}</span>
          <span className="flex-1">
            <span className="block font-display text-[11px] tracking-[0.25em] text-lavender/70">{topic.toUpperCase()}</span>
            <span
              className={`mt-1.5 block font-display text-lg font-semibold leading-snug tracking-tight transition-colors sm:text-2xl ${
                open ? "text-white" : "text-white/85 group-hover:text-white"
              }`}
            >
              {q}
            </span>
          </span>
          <span
            className={`relative grid size-11 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo ${
              open ? "rotate-45 border-transparent bg-orchid" : "border-white/15 group-hover:border-orchid"
            }`}
          >
            <span className="absolute h-px w-4 bg-white" />
            <span className="absolute h-4 w-px bg-white" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={{ height: 0 }}
            animate={{ height: "auto", transition: { duration: 0.55, ease: EASE } }}
            exit={{ height: 0, transition: { duration: 0.4, ease: EASE } }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-8 pl-[4.25rem] pr-4 text-base leading-relaxed text-lavender sm:pl-[6rem] sm:text-lg">
              {a.split(" ").map((w, k) => (
                <motion.span
                  key={k}
                  className="inline-block pr-[0.27em]"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.08 + k * 0.012 }}
                >
                  {w}
                </motion.span>
              ))}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const [pulse, setPulse] = useState(0);
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  const toggle = (i: number) => {
    setOpen((o) => (o === i ? null : i));
    setPulse((p) => p + 1);
  };

  // section height changes when answers open/close → re-measure pinned transitions
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 650);
    return () => clearTimeout(t);
  }, [open]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-faq-word]", {
          yPercent: 110,
          rotate: 6,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: "[data-faq-heading]", start: "top 85%" },
        });
        gsap.fromTo(
          "[data-faq-px]",
          { scale: 0, rotate: 45 },
          {
            scale: 1,
            rotate: 0,
            duration: 0.6,
            ease: "back.out(2)",
            stagger: { each: 0.025, from: "random" },
            scrollTrigger: { trigger: "[data-faq-mark]", start: "top 85%" },
          },
        );
        gsap.fromTo(
          "[data-faq-item]",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.07,
            scrollTrigger: { trigger: "[data-faq-list]", start: "top 85%" },
          },
        );
      });

      // Exit: pin at the bottom while the closing CTA slides up over this section
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

  // FAQPage structured data for search engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section
      ref={section}
      id="faq"
      aria-labelledby="faq-title"
      className="relative z-[75] overflow-clip rounded-t-[32px] border-t border-white/[0.08] bg-obsidian md:rounded-t-[56px]"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[620px] rounded-full opacity-15 blur-[140px]"
          style={{ background: "var(--logo-gradient)" }}
        />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 md:px-10 md:pb-36 md:pt-32">
          <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
            <span className="text-orchid">(09)</span>
            <span>FAQ</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <div className="mt-12 grid gap-14 md:mt-16 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-5">
              <div className="md:sticky md:top-32">
                <h2
                  data-faq-heading
                  id="faq-title"
                  className="font-display text-[clamp(2.6rem,6vw,6rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]"
                >
                  {["Good", "questions.", "Clear", "answers."].map((w, i) => (
                    <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                      <span data-faq-word className={`inline-block origin-bottom-left ${i >= 2 ? "text-gradient" : ""}`}>
                        {w}
                      </span>
                    </span>
                  ))}
                </h2>
                <div data-faq-mark className="mt-10 hidden md:block">
                  <PixelQuestion pulse={pulse} />
                </div>
                <p className="mt-10 max-w-sm text-lavender">Can&apos;t find what you&apos;re looking for? Ask us directly.</p>
                <Link
                  href="/contact"
                  className="group mt-5 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 font-display text-sm font-semibold text-obsidian transition-colors hover:bg-orchid hover:text-white"
                >
                  Ask a question
                  <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>

            <ul data-faq-list className="border-t border-white/[0.08] md:col-span-7">
              {FAQS.map((f, i) => (
                <FaqItem key={f.q} i={i} {...f} open={open === i} onToggle={() => toggle(i)} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
