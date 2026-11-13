"use client";

import { useState } from "react";
import { accentPresets, site } from "@/lib/content";
import { ACCENT_EVENT, vars } from "@/lib/client";

/**
 * Preview tool for the accent color. Rendered only in development (see app/page.tsx);
 * in production the accent comes from the dashboard setting (part 4).
 */
export function AccentSwatch() {
  const [current, setCurrent] = useState(site.accent);

  function pick(value: string) {
    document.documentElement.style.setProperty("--accent", value);
    setCurrent(value);
    window.dispatchEvent(new Event(ACCENT_EVENT));
  }

  return (
    <div className="swatch" role="group" aria-label="Accent color preview">
      <span>Accent</span>
      {accentPresets.map((p) => (
        <button
          key={p.value}
          style={vars({ "--c": p.value })}
          aria-pressed={current === p.value}
          aria-label={p.label}
          onClick={() => pick(p.value)}
        />
      ))}
    </div>
  );
}
