"use client";

import { useEffect, useRef, useState } from "react";
import { vimeoEmbedUrl } from "@/lib/uploads";
import { prefersReducedMotion } from "@/lib/client";

type Props = { src: string; poster?: string; title: string };

/** Fired (and remembered) once the reel can show its first frame, so the preloader can wait for it. */
export const REEL_READY = "reel-ready";
function markReady() {
  const w = window as Window & { __reelReady?: boolean };
  if (w.__reelReady) return;
  w.__reelReady = true;
  window.dispatchEvent(new Event(REEL_READY));
}

const VIMEO = "https://player.vimeo.com";

/**
 * The hero showreel: muted, autoplaying, looping, with the reel's labels on top, a scrub slider
 * and a Fullscreen button. A Vimeo link plays in Vimeo's player (driven through its postMessage API);
 * an uploaded webm/mp4 in a <video>. It pauses whenever it is off screen or the tab is hidden.
 */
export function ReelPlayer({ src, poster, title }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const scrub = useRef<HTMLInputElement>(null);
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const vimeo = vimeoEmbedUrl(src, { autoplay: true, muted: true, loop: true, controls: false });

  const vimeoCall = (method: string, value?: unknown) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), VIMEO);

  useEffect(() => {
    const v = vid.current;
    const reduce = prefersReducedMotion();
    let onScreen = true, dragging = false, duration = 0, raf = 0;
    const retries: number[] = [];
    const onReady = () => setReady(true);
    if ((window as Window & { __reelReady?: boolean }).__reelReady) onReady();
    window.addEventListener(REEL_READY, onReady);

    const play = () => (v ? v.play().catch(() => {}) : vimeoCall("play"));
    const pause = () => (v ? v.pause() : vimeoCall("pause"));
    const sync = () => (onScreen && !document.hidden && !reduce ? play() : pause());
    const show = (fraction: number) => {
      if (!scrub.current || dragging) return;
      scrub.current.value = String(Math.round(fraction * 1000));
      scrub.current.style.setProperty("--p", `${fraction * 100}%`);
    };

    // Plays only while the reel is on screen.
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.15 });
    io.observe(box.current!);
    document.addEventListener("visibilitychange", sync);

    // Slider position follows the video.
    let onMessage: ((e: MessageEvent) => void) | null = null;
    if (v) {
      const loop = () => {
        if (v.duration) show(v.currentTime / v.duration);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      if (v.readyState >= 2) markReady();
      else v.addEventListener("loadeddata", markReady, { once: true });
    } else {
      const subscribe = () => {
        ["timeupdate", "play"].forEach((name) => vimeoCall("addEventListener", name));
        vimeoCall("getDuration");
        sync();
      };
      onMessage = (e: MessageEvent) => {
        if (e.origin !== VIMEO || e.source !== frame.current?.contentWindow) return;
        let d: { event?: string; method?: string; value?: unknown; data?: { percent?: number; duration?: number } };
        try { d = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch { return; }
        if (d.event === "ready") subscribe();
        else if (d.method === "getDuration" && typeof d.value === "number") duration = d.value;
        else if ((d.event === "timeupdate" || d.event === "playProgress") && d.data) {
          // "playProgress" is the same update under the player's older event name.
          if (d.data.duration) duration = d.data.duration;
          show(d.data.percent ?? 0);
          markReady();
        } else if (d.event === "play") markReady();
      };
      window.addEventListener("message", onMessage);
      // Vimeo's "ready" may already have been sent before this listener existed (the frame is in the
      // server HTML), so also subscribe on load and a few times while the player starts. Repeats are harmless.
      frame.current?.addEventListener("load", subscribe);
      subscribe();
      retries.push(window.setTimeout(subscribe, 1500), window.setTimeout(subscribe, 4000));
    }

    // Scrubbing: drag or click the slider to move through the reel.
    const input = scrub.current!;
    const seek = () => {
      const f = Number(input.value) / 1000;
      input.style.setProperty("--p", `${f * 100}%`);
      if (v && v.duration) v.currentTime = f * v.duration;
      else if (duration) vimeoCall("setCurrentTime", f * duration);
    };
    const down = () => { dragging = true; };
    const up = () => { dragging = false; };
    input.addEventListener("input", seek);
    input.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);

    // Fullscreen: sound and controls on; back in the frame: muted again.
    const onFull = () => {
      const on = document.fullscreenElement === box.current;
      setFull(on);
      if (v) { v.muted = !on; v.controls = on; }
      else vimeoCall("setVolume", on ? 1 : 0);
      sync();
    };
    document.addEventListener("fullscreenchange", onFull);

    return () => {
      io.disconnect();
      retries.forEach(clearTimeout);
      window.removeEventListener(REEL_READY, onReady);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", sync);
      document.removeEventListener("fullscreenchange", onFull);
      if (onMessage) window.removeEventListener("message", onMessage);
      input.removeEventListener("input", seek);
      input.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const enterFullscreen = () => {
    const el = box.current;
    const v = vid.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
      // Unmute inside the click, while the browser still counts it as the visitor's action.
      if (v) v.muted = false;
      else vimeoCall("setVolume", 1);
    } else if (v?.webkitEnterFullscreen) {
      v.muted = false; // iPhone: only the native player can go fullscreen
      v.webkitEnterFullscreen();
    } else if (vimeo) {
      window.open(src, "_blank", "noopener");
    }
  };

  return (
    <>
      <div ref={box} className={["reel-media", full && "is-full", ready && "is-ready"].filter(Boolean).join(" ")}>
        {vimeo ? (
          <iframe ref={frame} src={vimeo} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen tabIndex={-1} onLoad={() => setTimeout(markReady, 1500)} />
        ) : (
          <video ref={vid} src={src} poster={poster} aria-label={title} muted loop playsInline autoPlay preload="auto" />
        )}
        {full && (
          <button type="button" className="reel-full reel-exit" onClick={() => document.exitFullscreen().catch(() => {})} aria-label="Exit fullscreen">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
            </svg>
            <span>Exit</span>
          </button>
        )}
      </div>
      <input ref={scrub} className="reel-scrub" type="range" min={0} max={1000} defaultValue={0} aria-label="Move through the showreel" />
      <button type="button" className="reel-full" onClick={enterFullscreen} aria-label="Watch the showreel fullscreen with sound" data-track="reel_fullscreen">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
        <span>Fullscreen</span>
      </button>
    </>
  );
}
