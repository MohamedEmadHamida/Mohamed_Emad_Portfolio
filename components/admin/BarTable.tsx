import type { ReactNode } from "react";
import { vars } from "@/lib/client";
import { fmtNum } from "@/lib/format";

type Item = { key: string; label?: ReactNode; value: number; extra?: ReactNode; href?: string };

/**
 * Ranked list with an inline magnitude bar behind each row (one hue, length = value).
 * The numbers are always printed, so the bar is never the only way to read the value.
 */
export function BarTable({ items, valueLabel, extraLabel, empty = "No data yet." }: { items: Item[]; valueLabel: string; extraLabel?: string; empty?: string }) {
  if (!items.length) return <p className="adm-empty">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div>
      <div className="adm-bars-head">
        <span />
        <span>{valueLabel}</span>
        <span>{extraLabel ?? ""}</span>
      </div>
      <div className="adm-bars">
        {items.map((i) => (
          <div key={i.key} className="adm-bar" style={vars({ "--w": `${Math.max(2, (i.value / max) * 100)}%` })} title={i.key}>
            <span className="k">{i.href ? <a href={i.href}>{i.label ?? i.key}</a> : i.label ?? i.key}</span>
            <span className="v">{fmtNum(i.value)}</span>
            <span className="x">{i.extra ?? ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
