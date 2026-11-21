"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

const MotionLink = motion.create(Link);

export function MagneticButton({ href, children, variant = "primary", className = "" }: Props) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function move(e: PointerEvent<HTMLAnchorElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.4);
  }
  function leave() {
    x.set(0);
    y.set(0);
  }

  const base =
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-7 py-4 font-display text-sm font-semibold tracking-[0.14em] uppercase outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orchid focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian";
  const styles =
    variant === "primary"
      ? "bg-electric text-white shadow-[0_10px_40px_-10px_rgba(139,53,245,0.7)]"
      : "border border-white/15 bg-white/[0.03] text-white backdrop-blur-md hover:border-white/35";

  return (
    <MotionLink
      href={href}
      onPointerMove={move}
      onPointerLeave={leave}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${styles} ${className}`}
    >
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0"
          style={{ background: "var(--logo-gradient)" }}
        />
      )}
      <span className="relative">{children}</span>
      <span
        aria-hidden
        className="relative grid size-6 place-items-center overflow-hidden rounded-full bg-white/15"
      >
        <svg
          viewBox="0 0 12 12"
          className="size-3 transition-transform duration-500 ease-out-expo group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M3 9L9 3M4 3h5v5" />
        </svg>
      </span>
    </MotionLink>
  );
}
