"use client";

import { useEffect, useState } from "react";
import DataRain, { type DataRainPalette } from "@/components/ui/data-rain";
import { ACCENT_EVENT } from "@/lib/client";

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [n >> 16, (n >> 8) & 255, n & 255] as const;
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

/** Mixes two hex colors; t = 0 gives a, t = 1 gives b. */
function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}

/**
 * Palette that follows the site's single accent: resting lines in the bone foreground,
 * lines speeding around the cursor warm up to the accent.
 */
function paletteFor(accent: string): DataRainPalette {
  return { calm: "#f3f1ea", mid: mix(accent, "#f3f1ea", 0.45), hot: accent };
}

function readAccent(fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
}

/** Hero backdrop: falling light lines that part around the cursor, colored from --accent. */
export function HeroRain({ accent }: { accent: string }) {
  const [palette, setPalette] = useState(() => paletteFor(accent));

  useEffect(() => {
    const update = () => setPalette(paletteFor(readAccent(accent)));
    update();
    addEventListener(ACCENT_EVENT, update);
    return () => removeEventListener(ACCENT_EVENT, update);
  }, [accent]);

  return <DataRain fullscreen={false} className="hero-rain" palette={palette} />;
}
