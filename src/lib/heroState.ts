import type Lenis from "lenis";
import { useSyncExternalStore } from "react";

/**
 * Mutable values shared between the DOM and the WebGL scene.
 * Written by GSAP / event handlers, read inside animation frames (no React re-renders).
 */
export const heroState = {
  /** 0 → hero at top, 1 → next section fully covers the hero */
  progress: 0,
  /** 0 → before the loader opens, 1 → intro fly-in finished */
  intro: 0,
  /** scroll velocity in px per frame (signed, + = scrolling down) */
  velocity: 0,
  /** last pointer / touch position, normalised to -1..1 (y up) */
  pointer: { x: 0, y: 0 },
  pointerType: "" as "" | "mouse" | "touch" | "pen",
  /** seconds (performance.now) of the last pointer / touch input */
  lastInput: -100,
  /** tap / click shockwaves */
  pulses: [] as { x: number; y: number; t: number }[],
};

export const nowSec = () => performance.now() / 1000;

/** How strongly the pointer should currently push things (touch fades out after release). */
export function inputStrength(now: number) {
  if (heroState.pointerType === "") return 0;
  if (heroState.pointerType === "mouse") return 1;
  const idle = now - heroState.lastInput;
  return Math.max(0, Math.min(1, 1 - (idle - 1.2) / 0.8));
}

/* ---------- smooth scroll instance ---------- */

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

/* ---------- intro (loader) state ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();
let introDone = false;
let sceneReady = false;
const sceneListeners = new Set<Listener>();

export function finishIntro() {
  if (introDone) return;
  introDone = true;
  listeners.forEach((l) => l());
}

export function useIntroDone() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => introDone,
    () => false,
  );
}

export function signalSceneReady() {
  if (sceneReady) return;
  sceneReady = true;
  sceneListeners.forEach((l) => l());
}

export function onSceneReady(cb: Listener) {
  if (sceneReady) {
    cb();
    return () => {};
  }
  sceneListeners.add(cb);
  return () => sceneListeners.delete(cb);
}

/* ---------- deterministic random (lint-safe, same layout every load) ---------- */

export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
