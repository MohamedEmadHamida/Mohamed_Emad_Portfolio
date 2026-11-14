"use client";

import { useEffect, useRef, useState } from "react";
import { hasBooted, lockScroll, prefersReducedMotion, unlockScroll } from "@/lib/client";
import { REEL_READY } from "@/components/sections/ReelPlayer";

/** Shortest time on screen, so the count never flashes by. */
const MIN_MS = 1400;
/** Longest wait: after this the site opens even if something is still loading. */
const MAX_MS = 7000;

/** Waits for the first screen: fonts, the showreel poster and the first frame of the reel. */
function firstScreenTasks(): Promise<unknown>[] {
  const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
  const poster = document.querySelector<HTMLImageElement>(".reel-poster");
  if (poster && !poster.complete) tasks.push(new Promise((r) => { poster.addEventListener("load", r, { once: true }); poster.addEventListener("error", r, { once: true }); }));
  if (document.querySelector(".reel-media") && !(window as Window & { __reelReady?: boolean }).__reelReady) {
    tasks.push(new Promise((r) => window.addEventListener(REEL_READY, r, { once: true })));
  }
  return tasks;
}

/**
 * Counts up while the first screen loads, then the counter lifts away and the curtain slides up
 * as the hero rises in underneath (the `hero-in` class on <html>).
 */
export function Preloader({ name }: { name: string }) {
  // Skipped when the visit already started (soft navigation back to the homepage).
  const [skip] = useState(hasBooted);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<"count" | "fade" | "up">("count");
  const done = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const timers: number[] = [];
    let raf = 0;

    const enter = () => {
      if (done.current) return;
      done.current = true;
      root.classList.add("hero-in");
      unlockScroll();
    };

    if (skip || prefersReducedMotion()) {
      enter();
      return;
    }

    lockScroll();
    const t0 = performance.now();
    const tasks = firstScreenTasks();
    let finished = 0, ready = false, shown = 0, leaving = false;
    tasks.forEach((t) => t.then(() => { finished++; if (finished === tasks.length) ready = true; }));

    const leave = () => {
      if (leaving) return;
      leaving = true;
      setCount(100);
      setPhase("fade");
      // The curtain starts moving as the counter fades, and the hero begins rising shortly after,
      // so the two overlap instead of playing one after the other.
      timers.push(window.setTimeout(() => setPhase("up"), 280));
      timers.push(window.setTimeout(enter, 480));
    };

    const tick = (t: number) => {
      const elapsed = t - t0;
      // Real progress drives the count, eased so it climbs smoothly; time alone can reach 90%.
      const real = ready ? 1 : 0.15 + 0.75 * (finished / tasks.length);
      const timeCap = Math.min(0.9, elapsed / MIN_MS);
      const target = ready && elapsed >= MIN_MS ? 1 : Math.min(real, timeCap) || timeCap * 0.5;
      shown += (target - shown) * 0.12;
      setCount(Math.min(100, Math.round(shown * 100)));
      if (target === 1 && shown > 0.995) leave();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Failsafe: open anyway if something never loads or the tab was in the background.
    timers.push(window.setTimeout(leave, MAX_MS));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [skip]);

  if (skip) return null;
  const cls = ["pre", phase !== "count" && "fade", phase === "up" && "up"].filter(Boolean).join(" ");
  return (
    <div className={cls} aria-hidden="true">
      <div className="pre-brand display">{name}</div>
      <div className="pre-count display">
        <span>{count}</span>
        <i>%</i>
      </div>
      <div className="pre-bar" style={{ transform: `scaleX(${count / 100})` }} />
    </div>
  );
}
