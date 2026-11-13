"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { prefersReducedMotion } from "@/lib/client";

/**
 * Page-wide effects with no markup of their own:
 * - rem grid: scales the root font size up above 1920px wide
 * - reveals: adds `in` to [data-split] and [data-reveal] once they enter the viewport
 * - liquid hover: SVG displacement on card images, driven by a loose spring
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

    // liquid hover
    if (!reduce && matchMedia("(hover:hover) and (min-width:769px)").matches) {
      const NS = "http://www.w3.org/2000/svg";
      document.querySelectorAll<HTMLElement>(".card .ph-art").forEach((art, i) => {
        const id = "liq" + i;
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", "0");
        svg.setAttribute("height", "0");
        svg.style.position = "absolute";
        svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.009" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="0"/></filter>`;
        art.parentNode!.append(svg);
        const disp = svg.querySelector("feDisplacementMap")!, turb = svg.querySelector("feTurbulence")!;
        const card = art.closest(".card")!;
        let x = 0, v = 0, target = 0, run = false, last = 0, raf = 0;
        const step = (t: number) => {
          const dt = Math.min(0.032, (t - last) / 1000 || 0.016);
          last = t;
          v += (140 * (target - x) - 13 * v) * dt;
          x += v * dt;
          disp.setAttribute("scale", (x * 26).toFixed(2));
          turb.setAttribute("baseFrequency", (0.009 + 0.013 * Math.max(0, x)).toFixed(4));
          if (Math.abs(target - x) > 0.002 || Math.abs(v) > 0.002) raf = requestAnimationFrame(step);
          else { run = false; if (!target) art.style.filter = ""; }
        };
        const go = (to: number) => {
          target = to;
          if (to) art.style.filter = `url(#${id})`;
          if (!run) { run = true; last = performance.now(); raf = requestAnimationFrame(step); }
        };
        const enter = () => go(1), leave = () => go(0);
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
          art.style.filter = "";
          svg.remove();
        });
      });
    }

    return () => cleanups.forEach((c) => c());
  }, [pathname]);

  return null;
}
