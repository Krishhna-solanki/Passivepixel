"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { getLenis, heroState, setLenis, useIntroDone } from "@/lib/heroState";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scrolling, synced with GSAP ScrollTrigger. Locked until the intro finishes. */
export function SmoothScroll() {
  const intro = useIntroDone();

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({ lerp: reduced ? 1 : 0.085, smoothWheel: !reduced, anchors: true });
    setLenis(lenis);
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lastY = window.scrollY;
    const tick = (time: number) => {
      lenis.raf(time * 1000);
      const y = window.scrollY;
      heroState.velocity = y - lastY; // works for wheel (Lenis) and native touch scroll
      lastY = y;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    const l = getLenis();
    if (!l) return;
    if (intro) {
      l.start();
      ScrollTrigger.refresh();
    } else {
      l.stop();
    }
  }, [intro]);

  return null;
}
