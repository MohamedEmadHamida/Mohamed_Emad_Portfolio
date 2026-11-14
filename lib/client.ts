// Small browser-side helpers shared by the client components.
import type { CSSProperties } from "react";
import type Lenis from "lenis";

/** Inline style with CSS custom properties, e.g. vars({ "--d": "90ms" }). */
export const vars = (v: Record<`--${string}`, string | number>) => v as CSSProperties;

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Smooth scroll instance and the preloader lock. The lock can be set before Lenis has loaded.
let lenis: Lenis | null = null;
let locked = false;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
  if (lenis && locked) lenis.stop();
}

export function lockScroll() {
  locked = true;
  window.scrollTo(0, 0);
  lenis?.stop();
}

export function unlockScroll() {
  locked = false;
  lenis?.start();
}

export const getLenis = () => lenis;

// The intro (preloader + hero entrance) plays once per visit, only when the visit starts on the homepage.
let booted = false;
export const hasBooted = () => booted;
export const markBooted = () => { booted = true; };

/** Ease in and out: starts gently, speeds up, settles softly. */
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function scrollToElement(el: HTMLElement) {
  if (lenis) {
    // Longer trips take a little longer, so far jumps do not feel like a teleport.
    const dist = Math.abs(el.getBoundingClientRect().top);
    lenis.scrollTo(el, { duration: Math.min(2.2, 0.9 + dist / 4000), easing: easeInOutCubic });
  }
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Fired when the accent color changes, so canvas drawings can re-read --accent. */
export const ACCENT_EVENT = "accentchange";
