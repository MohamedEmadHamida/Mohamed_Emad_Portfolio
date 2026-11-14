"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/client";

type Props = {
  src: string;
  poster?: string;
  label?: string;
  className?: string;
  /** Shows the player controls (sound, scrubbing, fullscreen). Used for the main film of a project. */
  controls?: boolean;
};

/**
 * Muted looping video that only plays while it is on screen, so a page with several clips
 * does not decode them all at once. Visitors who prefer reduced motion get the first frame.
 */
export function AutoVideo({ src, poster, label, className, controls }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current!;
    if (prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      aria-label={label}
      muted
      loop
      playsInline
      preload="metadata"
      controls={controls}
    />
  );
}
