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

export function scrollToElement(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el);
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Fired when the accent color changes, so canvas drawings can re-read --accent. */
export const ACCENT_EVENT = "accentchange";
