"use client";

import { useEffect, useRef, useState } from "react";
import { hasBooted, lockScroll, prefersReducedMotion, unlockScroll } from "@/lib/client";

const DURATION = 2000;

/** Counts 0 to 100%, slides away, then starts the hero entrance (the `hero-in` class on <html>). */
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
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DURATION);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setPhase("fade");
        timers.push(window.setTimeout(() => {
          setPhase("up");
          timers.push(window.setTimeout(enter, 350));
        }, 500));
      }
    };
    raf = requestAnimationFrame(tick);
    // Failsafe if the tab was in the background and rAF never ran.
    timers.push(window.setTimeout(() => { setPhase("up"); enter(); }, 6000));

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
    </div>
  );
}
