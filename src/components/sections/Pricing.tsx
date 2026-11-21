"use client";

import { useGSAP } from "@gsap/react";
import { AnimatePresence, animate, LayoutGroup, motion, useMotionValue, useTransform, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ADD_ONS, PRICING_NOTES, SOCIAL_PLANS, WEBSITE_PLANS, type Plan } from "@/lib/pricing";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const EASE = [0.16, 1, 0.3, 1] as const;
const TABS = [
  { id: "web", label: "Websites" },
  { id: "social", label: "Social Media" },
  { id: "addons", label: "Add-ons" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Price that counts up from zero whenever it mounts. */
function CountPrice({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, inr);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration: 1.1, ease: EASE });
    return () => c.stop();
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
}

const grid: Variants = { show: { transition: { staggerChildren: 0.08 } } };
const card: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: 18 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.9, ease: EASE } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
};

function PlanCard({ plan }: { plan: Plan }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  const body = (
    <div
      ref={ref}
      onPointerMove={move}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] p-7 ${
        plan.recommended ? "bg-[#130e1d]" : "border border-white/[0.08] bg-[#0f0c15] transition-colors hover:border-white/20"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(360px circle at var(--mx,50%) var(--my,0%), rgba(195,77,255,0.14), transparent 60%)" }}
      />
      <div className="relative flex items-center justify-between">
        <h3 className="font-display text-xl font-bold tracking-tight">{plan.name}</h3>
        {plan.recommended && (
          <span className="rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white" style={{ background: "var(--logo-gradient)" }}>
            RECOMMENDED
          </span>
        )}
      </div>
      <p className="relative mt-2 min-h-[2.5rem] text-sm text-lavender">{plan.bestFor}</p>

      <div className="relative mt-6 flex items-baseline gap-2">
        <span className="font-display text-[2.6rem] font-bold leading-none tracking-[-0.03em] tabular-nums">
          <CountPrice value={plan.price} />
        </span>
        <span className="text-sm text-lavender">{plan.unit}</span>
      </div>

      <ul className="relative mt-7 space-y-3 border-t border-white/[0.08] pt-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-white/85">
            <span aria-hidden className="mt-[5px] size-2.5 shrink-0 rotate-45 rounded-[2px]" style={{ background: "var(--logo-gradient)" }} />
            {f}
          </li>
        ))}
      </ul>

      <Link
        href={`/contact?plan=${plan.id}`}
        className={`relative mt-auto inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 font-display text-sm font-semibold transition-colors ${
          plan.recommended ? "bg-white text-obsidian hover:bg-orchid hover:text-white" : "border border-white/15 hover:border-orchid hover:bg-orchid"
        }`}
        style={{ marginTop: "2rem" }}
      >
        Get started <span aria-hidden>→</span>
      </Link>
    </div>
  );

  return (
    <motion.div variants={card} className="[perspective:1000px]">
      {plan.recommended ? (
        // animated gradient border
        <div className="relative h-full overflow-hidden rounded-[27px] p-px">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 animate-[spin_5s_linear_infinite]"
            style={{ background: "conic-gradient(from 0deg, transparent 0 60%, #D946EF 75%, #6200EA 90%, transparent 100%)" }}
          />
          <div className="relative h-full">{body}</div>
        </div>
      ) : (
        body
      )}
    </motion.div>
  );
}

export function Pricing() {
  const [tab, setTab] = useState<Tab>("web");
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);

  // re-measure scroll animations after the tab changes the section height
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(t);
  }, [tab]);

  // Exit: pin at the bottom while the next section slides up over this one
  useGSAP(
    () => {
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

  return (
    <section
      ref={section}
      id="pricing"
      aria-labelledby="pricing-title"
      className="relative z-[70] overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0a12] motion-safe:md:-mt-[100vh] md:rounded-t-[56px]"
    >
      <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-obsidian opacity-0" />
      <div ref={inner} className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[1000px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[140px]"
          style={{ background: "var(--logo-gradient)" }}
        />

        <div className="relative mx-auto max-w-[1400px] px-5 pb-24 pt-20 sm:px-8 md:px-10 md:pb-36 md:pt-32">
          <div className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
            <span className="text-orchid">(08)</span>
            <span>PRICING</span>
            <span className="h-px flex-1 bg-white/15" />
          </div>

          <div className="mt-10 flex flex-col gap-10 md:mt-14 md:flex-row md:items-end md:justify-between">
            <motion.h2
              id="pricing-title"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              className="max-w-[12ch] font-display text-[clamp(2.6rem,7vw,7rem)] font-bold uppercase leading-[0.92] tracking-[-0.045em]"
            >
              {["Invest", "in", "your", "digital", "future."].map((w, i) => (
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

            {/* tabs */}
            <LayoutGroup>
              <div role="tablist" aria-label="Pricing category" className="flex w-fit gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
                {TABS.map((t) => {
                  const on = t.id === tab;
                  return (
                    <button
                      key={t.id}
                      role="tab"
                      aria-selected={on}
                      onClick={() => setTab(t.id)}
                      className={`relative rounded-full px-4 py-2.5 text-sm transition-colors sm:px-5 ${on ? "text-white" : "text-lavender hover:text-white"}`}
                    >
                      {on && (
                        <motion.span
                          layoutId="pp-price-tab"
                          className="absolute inset-0 rounded-full bg-electric"
                          transition={{ type: "spring", stiffness: 400, damping: 34 }}
                        />
                      )}
                      <span className="relative">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="mt-14 md:mt-20">
            <AnimatePresence mode="wait">
              {tab === "addons" ? (
                <motion.div
                  key="addons"
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={grid}
                  className="grid gap-6 lg:grid-cols-12"
                >
                  <ul className="divide-y divide-white/[0.08] overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0f0c15] lg:col-span-8">
                    {ADD_ONS.map((a) => (
                      <motion.li
                        key={a.id}
                        variants={card}
                        className="group flex flex-col gap-2 px-6 py-6 transition-colors hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between sm:px-8"
                      >
                        <div className="flex items-start gap-4">
                          <span aria-hidden className="mt-2 size-2.5 shrink-0 rotate-45 rounded-[2px] bg-electric transition-colors group-hover:bg-orchid" />
                          <div>
                            <p className="font-display text-lg font-semibold">{a.name}</p>
                            <p className="mt-1 text-sm text-lavender">{a.desc}</p>
                          </div>
                        </div>
                        <p className="pl-6 font-display text-2xl font-bold tabular-nums sm:pl-0 sm:text-right">
                          <CountPrice value={a.price} />
                          <span className="ml-2 font-sans text-xs font-normal text-lavender">{a.unit}</span>
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                  <motion.div variants={card} className="lg:col-span-4">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[26px] p-8" style={{ background: "linear-gradient(150deg, #2a0f55, #120d1c 60%)" }}>
                      <span aria-hidden className="absolute right-8 top-8 size-5 animate-[floatPx_5s_ease-in-out_infinite] bg-orchid" />
                      <span aria-hidden className="absolute right-16 top-16 size-3 animate-[floatPx_6s_ease-in-out_infinite_1s] bg-white/70" />
                      <p className="font-display text-xs tracking-[0.25em] text-lavender">CUSTOM WORK</p>
                      <h3 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight">Automation & custom development</h3>
                      <p className="mt-3 text-sm leading-relaxed text-lavender">
                        Workflow automation, Excel automation, API integrations and custom business tools, priced to your requirements.
                      </p>
                      <Link
                        href="/contact?plan=custom"
                        className="mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 font-display text-sm font-semibold text-obsidian transition-colors hover:bg-orchid hover:text-white"
                        style={{ marginTop: "2rem" }}
                      >
                        Request a quote →
                      </Link>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key={tab}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  variants={grid}
                  className={`grid gap-5 ${tab === "web" ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3"}`}
                >
                  {(tab === "web" ? WEBSITE_PLANS : SOCIAL_PLANS).map((p) => (
                    <PlanCard key={p.id} plan={p} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* custom quote + notes */}
          <div className="mt-10 grid gap-6 md:mt-14 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              {PRICING_NOTES.map((n) => (
                <p key={n} className="flex gap-3 py-1.5 text-sm text-lavender">
                  <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-lavender/60" />
                  {n}
                </p>
              ))}
            </div>
            <div className="flex md:col-span-5 md:justify-end">
              <Link
                href="/contact?plan=custom"
                className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 font-display text-sm font-semibold transition-colors hover:border-orchid hover:bg-orchid"
              >
                Need a custom quotation?
                <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
