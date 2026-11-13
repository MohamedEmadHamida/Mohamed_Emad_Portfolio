"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { send, session, track } from "@/lib/track";

let lastPageview = { path: "", t: 0 };

const IDLE_MS = 60_000; // no input or scroll for a minute = away, time stops counting
const TICK_MS = 1000;

/**
 * Collects, for every page view:
 * - the page view itself (with referrer and UTM tags on the first page of a visit)
 * - engaged time: seconds the tab was visible and the visitor active
 * - time each section was on screen (<section>/<footer> children of <main> with an id, or any data-section)
 * - deepest scroll position
 * - clicks on the CV, email, outbound and project links (plus events sent with track())
 */
export function Tracker() {
  const pathname = usePathname();
  const lastActive = useRef(Date.now());

  // Clicks anywhere on the site, and activity for the idle timer.
  useEffect(() => {
    const active = () => { lastActive.current = Date.now(); };
    const onClick = (e: MouseEvent) => {
      active();
      const el = (e.target as Element).closest?.("a,[data-track]") as HTMLElement | null;
      if (!el) return;
      const custom = el.getAttribute("data-track");
      if (custom) return track(custom as Parameters<typeof track>[0], el.getAttribute("data-track-label") ?? undefined);
      const href = el.getAttribute("href") ?? "";
      if (/\.pdf($|\?)/i.test(href) || el.hasAttribute("download")) return track("cv_download", href);
      if (href.startsWith("mailto:")) return track("contact_email", href.slice(7));
      const project = href.match(/^\/projects\/([^/?#]+)/);
      if (project) return track("project_click", project[1]);
      if (/^https?:\/\//.test(href) && !href.startsWith(location.origin)) {
        try {
          const u = new URL(href);
          return track("outbound", u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, ""));
        } catch {
          /* ignore malformed */
        }
      }
    };
    const evs = ["scroll", "pointermove", "keydown", "touchstart"] as const;
    evs.forEach((ev) => addEventListener(ev, active, { passive: true }));
    document.addEventListener("click", onClick, true);
    return () => {
      evs.forEach((ev) => removeEventListener(ev, active));
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  // One page view: send it, then measure time and sections until the route changes or the tab closes.
  useEffect(() => {
    const { sid, fresh } = session();
    const params = new URLSearchParams(location.search);
    const utm = {
      source: params.get("utm_source") ?? undefined,
      medium: params.get("utm_medium") ?? undefined,
      campaign: params.get("utm_campaign") ?? undefined,
    };
    const hasUtm = !!(utm.source || utm.medium || utm.campaign);
    let ref: string | undefined;
    if (fresh && document.referrer) {
      try {
        if (new URL(document.referrer).origin !== location.origin) ref = document.referrer.slice(0, 300);
      } catch {
        /* ignore */
      }
    }
    // Same page reported twice within a second (React dev double-run, fast re-render) counts once.
    const now = Date.now();
    if (!(lastPageview.path === pathname && now - lastPageview.t < 1000)) {
      send({ type: "pageview", sid, path: pathname, ref, utm: fresh && hasUtm ? utm : undefined, sw: innerWidth });
    }
    lastPageview = { path: pathname, t: now };

    // Section visibility: a section counts while it fills at least half the screen
    // (or, for short sections, while at least half of it is visible).
    const inView = new Set<string>();
    const sectionMs: Record<string, number> = {};
    let ms = 0;
    let maxScroll = 0;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const key = el.dataset.section || el.id;
          const visible = e.intersectionRect.height;
          const need = Math.min(innerHeight * 0.5, e.boundingClientRect.height * 0.5);
          if (e.isIntersecting && visible >= need) inView.add(key);
          else inView.delete(key);
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>("main > section[id], main > footer[id], main > [data-section]").forEach((el) => io.observe(el));
    });

    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastActive.current > IDLE_MS) return;
      ms += TICK_MS;
      inView.forEach((k) => { sectionMs[k] = (sectionMs[k] ?? 0) + TICK_MS; });
      const doc = document.documentElement;
      const depth = Math.round(((scrollY + innerHeight) / Math.max(doc.scrollHeight, 1)) * 100);
      maxScroll = Math.max(maxScroll, Math.min(100, depth));
    }, TICK_MS);

    // Send what was measured since the last flush (so partial flushes add up on the server).
    const flush = () => {
      if (ms < TICK_MS) return;
      send({ type: "engagement", sid: session().sid, path: pathname, ms, sections: { ...sectionMs }, scroll: maxScroll });
      ms = 0;
      for (const k in sectionMs) delete sectionMs[k];
    };
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    addEventListener("pagehide", flush);

    return () => {
      flush();
      cancelAnimationFrame(raf);
      clearInterval(tick);
      io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      removeEventListener("pagehide", flush);
    };
  }, [pathname]);

  return null;
}
