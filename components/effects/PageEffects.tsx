"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/client";

/**
 * Page-wide effects with no markup of their own:
 * - rem grid: scales the root font size up above 1920px wide
 * - reveals: adds `in` to [data-split] and [data-reveal] once they enter the viewport
 */
export function PageEffects() {
  // Lives in the layout, so it re-runs for each page after a soft navigation.
  const pathname = usePathname();

  // rem grid
  useEffect(() => {
    const root = document.documentElement;
    const grid = () => {
      const w = innerWidth, size = 16 - (16 * (((1920 - w) / 1920) * 100 * 0.6666)) / 100;
      if (size > 16) root.style.fontSize = size + "px";
      else root.style.removeProperty("font-size");
    };
    grid();
    addEventListener("resize", grid);
    return () => removeEventListener("resize", grid);
  }, []);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const cleanups: (() => void)[] = [];

    // reveals; split titles get a per-line delay measured from the word positions
    const lines = (el: Element) => {
      const tops: number[] = [];
      el.querySelectorAll<HTMLElement>(".w").forEach((w) => {
        let i = tops.indexOf(w.offsetTop);
        if (i < 0) { tops.push(w.offsetTop); i = tops.length - 1; }
        (w.firstElementChild as HTMLElement).style.transitionDelay = i * 90 + "ms";
      });
    };
    const targets = document.querySelectorAll("[data-split],[data-reveal]");
    if (!reduce) {
      const io = new IntersectionObserver((es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          if (e.target.hasAttribute("data-split")) lines(e.target);
          e.target.classList.add("in");
          io.unobserve(e.target);
        }),
      );
      targets.forEach((t) => io.observe(t));
      cleanups.push(() => io.disconnect());
    } else targets.forEach((t) => t.classList.add("in"));

    return () => cleanups.forEach((c) => c());
  }, [pathname]);

  return null;
}
