"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { getLenis, markBooted, scrollToElement, setLenis } from "@/lib/client";

/**
 * Lenis smooth scrolling, smooth scrolling for every in-page "#id" link,
 * and the scroll position after a soft navigation between pages.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const firstRoute = useRef(true);

  useEffect(() => {
    markBooted();
    const lenis = new Lenis({ smoothWheel: true });
    setLenis(lenis);
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    });

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest?.('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute("href")!;
      const el = href.length > 1 ? document.querySelector<HTMLElement>(href) : null;
      if (!el) return;
      e.preventDefault();
      scrollToElement(el);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  // After a soft navigation: jump to the "/#id" section if there is one, otherwise to the top.
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    const raf = requestAnimationFrame(() => {
      const lenis = getLenis();
      lenis?.resize();
      const el = location.hash.length > 1 ? document.querySelector<HTMLElement>(location.hash) : null;
      if (lenis) lenis.scrollTo(el ?? 0, { immediate: true, force: true });
      else if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
