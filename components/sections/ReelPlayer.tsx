"use client";

import { useEffect, useRef, useState } from "react";
import { vimeoEmbedUrl } from "@/lib/uploads";
import { prefersReducedMotion } from "@/lib/client";

type Props = { src: string; poster?: string; title: string };

/**
 * The hero showreel: muted, autoplaying, looping, with the reel's own labels on top and a
 * Fullscreen button. A Vimeo link plays in Vimeo's player; an uploaded webm/mp4 in a <video>.
 * In the frame the player cannot be clicked (so Vimeo keeps its controls hidden); in fullscreen
 * it gets sound and its controls.
 */
export function ReelPlayer({ src, poster, title }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [full, setFull] = useState(false);
  const vimeo = vimeoEmbedUrl(src, { autoplay: true, muted: true, loop: true, controls: false });

  // Vimeo player commands (setVolume, play…) go through postMessage.
  const vimeoCall = (method: string, value?: unknown) =>
    frame.current?.contentWindow?.postMessage(JSON.stringify(value === undefined ? { method } : { method, value }), "https://player.vimeo.com");

  useEffect(() => {
    const v = vid.current;
    if (v && !prefersReducedMotion()) v.play().catch(() => {});
    const onChange = () => {
      const on = !!box.current && document.fullscreenElement === box.current;
      setFull(on);
      if (v) {
        v.muted = !on;
        v.controls = on;
        v.play().catch(() => {});
      } else {
        vimeoCall("setVolume", on ? 1 : 0);
        vimeoCall("play");
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
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
      // iPhone: only the native video player can go fullscreen.
      v.muted = false;
      v.webkitEnterFullscreen();
    } else if (vimeo) {
      window.open(src, "_blank", "noopener");
    }
  };

  return (
    <>
      <div ref={box} className={full ? "reel-media is-full" : "reel-media"}>
        {vimeo ? (
          <iframe ref={frame} src={vimeo} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen tabIndex={-1} />
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
      <button type="button" className="reel-full" onClick={enterFullscreen} aria-label="Watch the showreel fullscreen with sound" data-track="reel_fullscreen">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
        <span>Fullscreen</span>
      </button>
    </>
  );
}
