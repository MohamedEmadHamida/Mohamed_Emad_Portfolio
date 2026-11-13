"use client";

import { useEffect, useState } from "react";
import { pad2, prefersReducedMotion } from "@/lib/client";

/** Slate timecode on the showreel placeholder, ticking at 24 fps. */
export function Timecode() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setFrame((f) => (f + 1) % (24 * 60)), 1000 / 24);
    return () => window.clearInterval(id);
  }, []);

  return <span>00:00:{pad2(Math.floor(frame / 24))}:{pad2(frame % 24)}</span>;
}
