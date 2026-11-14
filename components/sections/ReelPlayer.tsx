"use client";

import { useEffect, useRef, useState } from "react";
import { vimeoEmbedUrl } from "@/lib/uploads";
import { prefersReducedMotion } from "@/lib/client";

type Props = { src: string; poster?: string; title: string };

/**
 * The hero showreel, playing muted on a loop.
 * - A Vimeo link uses Vimeo's own player (its controls include sound and fullscreen).
 * - An uploaded webm/mp4 gets a fullscreen button; in fullscreen it plays with sound and controls.
 */
export function ReelPlayer({ src, poster, title }: Props) {
  const vimeo = vimeoEmbedUrl(src, { autoplay: true, muted: true, loop: true });
  if (vimeo) {
    return <iframe className="reel-video" src={vimeo} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  }
  return <FileReel src={src} poster={poster} title={title} />;
}

function FileReel({ src, poster, title }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const v = ref.current!;
    if (!prefersReducedMotion()) v.play().catch(() => {});
    // Fullscreen: sound and controls on. Back in the frame: muted, no controls, still looping.
    const onChange = () => {
      const on = document.fullscreenElement === v;
      setFull(on);
      v.muted = !on;
      v.controls = on;
      if (!on) v.play().catch(() => {});
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [src]);

  const enterFullscreen = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => {});
    else if (v.webkitEnterFullscreen) {
      // iPhone: only the native player can go fullscreen.
      v.muted = false;
      v.webkitEnterFullscreen();
    }
  };

  return (
    <>
      <video ref={ref} className="reel-video" src={src} poster={poster} aria-label={title} muted loop playsInline autoPlay preload="auto" />
      {!full && (
        <button type="button" className="reel-full" onClick={enterFullscreen} aria-label="Watch the showreel fullscreen with sound" data-track="reel_fullscreen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
          <span>Fullscreen</span>
        </button>
      )}
    </>
  );
}
