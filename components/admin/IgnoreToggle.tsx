"use client";

import { useEffect, useState } from "react";
import { isIgnored, setIgnored } from "@/lib/track";

/** Stops this browser from being counted, so your own visits don't skew the numbers. */
export function IgnoreToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(isIgnored()), []);
  return (
    <label className="adm-switch" title="Saved in this browser only">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          setIgnored(e.target.checked);
          setOn(e.target.checked);
        }}
      />
      Don&apos;t count my visits
    </label>
  );
}
