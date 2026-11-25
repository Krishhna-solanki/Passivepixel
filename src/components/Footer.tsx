"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { getLenis } from "@/lib/heroState";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];

const BIG = "PASSIVE PIXEL";

function BigLetter({ ch, i, progress }: { ch: string; i: number; progress: MotionValue<number> }) {
  // letters rise one after another as the footer is revealed
  const start = 0.35 + i * 0.03;
  const y = useTransform(progress, [start, Math.min(1, start + 0.35)], ["100%", "0%"]);
  if (ch === " ") return <span className="inline-block w-[0.25em]" />;
  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        style={{ y }}
        className="inline-block transition-[color,transform] duration-300 hover:-translate-y-[0.06em] hover:text-orchid"
      >
        {ch}
      </motion.span>
    </span>
  );
}

function Soon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-lavender/50">
      {children}
      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] tracking-[0.15em]">SOON</span>
    </span>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return <p className="font-display text-[11px] tracking-[0.3em] text-lavender">{children}</p>;
}

const linkCls =
  "group relative inline-block text-white/85 transition-colors hover:text-white after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-orchid after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100";

export function Footer() {
  const wrap = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start end", "end end"] });
  // parallax: the footer content starts lower and settles as it is uncovered
  const desktop = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
  // (desktop only: on mobile the footer is in normal flow, so there is nothing to uncover)
  const contentY = useTransform(scrollYProgress, [0, 1], desktop ? ["-35%", "0%"] : ["0%", "0%"]);
  const glowOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 0.35]);

  return (
    // clip-path makes the fixed footer visible only inside this wrapper → "reveal from underneath"
    <div
      ref={wrap}
      className="relative md:h-[min(780px,100vh)]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <footer className="relative w-full overflow-hidden bg-obsidian md:fixed md:bottom-0 md:h-[min(780px,100vh)]">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[1100px] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: "var(--logo-gradient)", opacity: glowOpacity }}
        />
        <motion.div
          style={{ y: contentY }}
          className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 pb-6 pt-16 sm:px-8 md:px-10 md:pt-14"
        >
          {/* top row */}
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
            <div>
              {/* the tagline version of the logo file is cropped on the right, so use the full logo + text tagline */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/passivepixel-logo.png" alt="Passive Pixel" className="h-10 w-auto md:h-12" />
              <p className="mt-3 font-display text-[11px] tracking-[0.35em] text-lavender">{SITE.tagline}</p>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-lavender">
                Creative technology and digital growth studio. Websites, branding, social media, SEO and automation.
              </p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3.5 font-display text-sm font-semibold text-obsidian transition-colors hover:bg-orchid hover:text-white"
            >
              Start a project
              <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-1">→</span>
            </Link>
          </div>

          {/* columns */}
          <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-12 md:grid-cols-4">
            <nav aria-label="Footer">
              <ColTitle>NAVIGATE</ColTitle>
              <ul className="mt-5 space-y-2.5 text-sm">
                {NAV.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className={linkCls}>
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <ColTitle>SERVICES</ColTitle>
              <ul className="mt-5 space-y-2.5 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} className={linkCls}>
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <ColTitle>CONTACT</ColTitle>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li>
                  {SITE.email ? (
                    <a href={`mailto:${SITE.email}`} className={linkCls}>
                      {SITE.email}
                    </a>
                  ) : (
                    <Soon>Email</Soon>
                  )}
                </li>
                <li>
                  {SITE.whatsapp ? (
                    <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className={linkCls}>
                      WhatsApp {SITE.whatsappDisplay}
                    </a>
                  ) : (
                    <Soon>WhatsApp</Soon>
                  )}
                </li>
                <li>
                  <Link href="/contact" className={linkCls}>
                    Contact form
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ColTitle>FOLLOW</ColTitle>
              <ul className="mt-5 space-y-2.5 text-sm">
                {SITE.socials.map((s) => (
                  <li key={s.label}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className={linkCls}>
                        {s.label} ↗
                      </a>
                    ) : (
                      <Soon>{s.label}</Soon>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* giant brand name */}
          <p
            aria-hidden
            className="mt-auto select-none whitespace-nowrap pt-10 font-display text-[13.5vw] font-bold leading-[0.8] tracking-[-0.06em] text-white md:pt-8 md:text-[min(12.5vw,12rem)]"
          >
            {BIG.split("").map((ch, i) => (
              <BigLetter key={i} ch={ch} i={i} progress={scrollYProgress} />
            ))}
          </p>

          {/* bottom bar */}
          <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 text-xs text-lavender sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {SITE.year} {SITE.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms &amp; Conditions
              </Link>
              <button
                type="button"
                onClick={() => getLenis()?.scrollTo(0, { duration: 2 })}
                className="group inline-flex items-center gap-2 hover:text-white"
              >
                Back to top
                <span className="grid size-7 place-items-center rounded-full border border-white/15 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-orchid group-hover:bg-orchid group-hover:text-white">
                  ↑
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
