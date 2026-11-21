"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getLenis, useIntroDone } from "@/lib/heroState";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const intro = useIntroDone();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else if (intro) lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, intro]);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={intro ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="fixed inset-x-0 top-0 z-[90] px-4 pt-4 md:px-6"
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-[1400px] items-center justify-between rounded-full py-2.5 pl-5 pr-2.5 transition-all duration-500 ease-out-expo ${
            scrolled
              ? "border border-white/10 bg-obsidian/60 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
              : "border border-transparent bg-transparent"
          }`}
        >
          <Link href="/" aria-label="Passive Pixel home" className="relative z-10 flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/passivepixel-logo.png"
              alt="Passive Pixel"
              className="hidden h-9 w-auto sm:block"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/passivepixel-icon.png" alt="Passive Pixel" className="h-9 w-auto sm:hidden" />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="group relative block px-4 py-2 text-sm text-lavender transition-colors hover:text-white"
                >
                  {l.label}
                  <span className="absolute inset-x-4 bottom-1 h-px origin-left scale-x-0 bg-orchid transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="group hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 font-display text-sm font-semibold text-obsidian transition-colors hover:bg-orchid hover:text-white sm:inline-flex"
            >
              Let&apos;s Talk
              <span className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                ↗
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-10 grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur-md lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all duration-500 ease-out-expo ${
                    open ? "top-1/2 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-5 bg-white transition-all duration-500 ease-out-expo ${
                    open ? "top-1/2 -rotate-45" : "top-full"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 44px) 44px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 44px) 44px)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[80] flex flex-col justify-between bg-violet-deep px-6 pb-10 pt-28 lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline gap-4 py-2 font-display text-5xl font-bold tracking-tight"
                    >
                      <span className="font-sans text-xs font-medium text-orchid">0{i + 1}</span>
                      {l.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-6"
            >
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-electric px-6 py-3.5 font-display font-semibold"
              >
                Let&apos;s Talk ↗
              </Link>
              <p className="font-display text-xs tracking-[0.3em] text-lavender">THINK DIGITAL. GROW BIGGER.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
