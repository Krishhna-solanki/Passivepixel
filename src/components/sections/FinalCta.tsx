"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { MagneticButton } from "@/components/MagneticButton";
import type { CtaShared } from "./CtaScene";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// WebGL is loaded only when the section gets close to the viewport
const CtaScene = dynamic(() => import("./CtaScene"), { ssr: false });

export function FinalCta() {
  const section = useRef<HTMLElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const shared = useRef<CtaShared>({ assemble: 0, bursts: 0 });
  const [mounted, setMounted] = useState(false); // has the 3D scene been loaded?
  const [visible, setVisible] = useState(false); // is it on screen (render loop on)?

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          near.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const onScreen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    near.observe(el);
    onScreen.observe(el);
    return () => {
      near.disconnect();
      onScreen.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      // the sculpture assembles as the section scrolls into view
      ScrollTrigger.create({
        trigger: section.current,
        start: "top 90%",
        end: "top 10%",
        scrub: true,
        onUpdate: (s) => {
          shared.current.assemble = s.progress;
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-cta-char]",
          { yPercent: 115, rotate: 8 },
          {
            yPercent: 0,
            rotate: 0,
            ease: "expo.out",
            duration: 1.1,
            stagger: 0.025,
            scrollTrigger: { trigger: "[data-cta-title]", start: "top 85%" },
          },
        );
        gsap.fromTo(
          "[data-cta-fade]",
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
            stagger: 0.1,
            delay: 0.3,
            scrollTrigger: { trigger: "[data-cta-title]", start: "top 85%" },
          },
        );
      });
    },
    { scope: section },
  );

  function move(e: PointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || !glow.current || !section.current) return;
    const r = section.current.getBoundingClientRect();
    glow.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`;
  }
  function burst() {
    shared.current.bursts += 1;
  }

  // split into characters for the reveal, keeping words together
  const line = (text: string, gradient = false) => (
    <span className="block">
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="mr-[0.25em] inline-block overflow-hidden pb-[0.06em] align-top last:mr-0">
          {word.split("").map((ch, ci) => (
            <span key={ci} data-cta-char className={`inline-block ${gradient ? "text-gradient" : ""}`}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );

  return (
    <section
      ref={section}
      id="cta"
      aria-labelledby="cta-title"
      onPointerMove={move}
      onPointerDown={burst}
      className="relative z-[78] flex min-h-screen items-center overflow-hidden rounded-t-[32px] border-t border-white/[0.08] bg-[#0c0a12] md:rounded-t-[56px]"
    >
      {/* 3D pixel sculpture */}
      <div className="absolute inset-0">{mounted && <CtaScene shared={shared} active={visible} />}</div>

      {/* cursor glow */}
      <div
        ref={glow}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 hidden size-[520px] rounded-full opacity-25 blur-[100px] md:block"
        style={{ background: "var(--logo-gradient)", transform: "translate(50vw, 50vh) translate(-50%, -50%)" }}
      />
      {/* readability veils */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0a12] via-[#0c0a12]/60 to-transparent md:hidden" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#0c0a12] via-[#0c0a12]/70 to-transparent md:block" />

      <div className="relative mx-auto w-full max-w-[1400px] px-5 pb-20 pt-[52vh] sm:px-8 md:px-10 md:py-32">
        <div data-cta-fade className="flex items-center gap-4 font-display text-[11px] tracking-[0.3em] text-lavender sm:text-xs">
          <span className="text-orchid">(10)</span>
          <span>LET&apos;S TALK</span>
        </div>

        <h2
          data-cta-title
          id="cta-title"
          className="mt-8 font-display text-[clamp(2.8rem,7.2vw,7.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.045em]"
        >
          {line("Have an idea?")}
          {line("Let's make it real.", true)}
        </h2>

        <p data-cta-fade className="mt-8 max-w-lg text-lg leading-relaxed text-lavender">
          Your next digital project starts with a conversation. Let&apos;s create something meaningful together.
        </p>

        <div data-cta-fade className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <MagneticButton href="/contact?type=project">Start your project</MagneticButton>
          <MagneticButton href="/contact" variant="ghost">
            Contact us
          </MagneticButton>
        </div>

        <p data-cta-fade className="mt-10 hidden font-display text-[11px] tracking-[0.3em] text-lavender/60 md:block">
          TIP: CLICK ANYWHERE TO SHAKE THINGS UP
        </p>
      </div>
    </section>
  );
}
