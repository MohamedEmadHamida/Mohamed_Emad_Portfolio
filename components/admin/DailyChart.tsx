"use client";

import { useEffect, useRef, useState } from "react";
import { fmtNum } from "@/lib/format";

type Point = { day: string; visitors: number; sessions: number; pageviews: number };

/** Round axis maximum whose half is also a whole number (counts never show as 7.5): 3 → 4, 15 → 20, 37 → 40, 140 → 200. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 2 ? 2 : n <= 4 ? 4 : n <= 6 ? 6 : n <= 8 ? 8 : 10) * p;
}

/**
 * Visitors per day (or per hour for the 24h range). One series in the accent color, so no legend:
 * the card title names it. Hover any column for visitors, visits and page views.
 */
export function DailyChart({ points, hourly }: { points: Point[]; hourly: boolean }) {
  const [hover, setHover] = useState<number | null>(null);
  // Real pixel width, so text and bars are never stretched.
  const [W, setW] = useState(800);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!points.some((p) => p.visitors)) return <p className="adm-empty">No visits in this range yet.</p>;

  const H = 220, padL = 32, padB = 22, padT = 8;
  const max = niceMax(Math.max(...points.map((p) => p.visitors)));
  const ticks = [0, max / 2, max];
  const slot = (W - padL) / points.length;
  const barW = Math.min(24, Math.max(3, slot - 2));
  const y = (v: number) => padT + (H - padT - padB) * (1 - v / max);
  const labelEvery = Math.ceil(points.length / 8);
  const short = (d: string) => (hourly ? d.slice(11, 16) : new Date(d + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }));

  const h = hover !== null ? points[hover] : null;
  const hx = hover !== null ? padL + slot * hover + slot / 2 : 0;

  return (
    <div className="adm-chart" ref={box} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Visitors over time">
        <g className="grid">
          {ticks.map((t) => (
            <line key={t} x1={padL} x2={W} y1={y(t)} y2={y(t)} />
          ))}
        </g>
        <g className="axis">
          {ticks.map((t) => (
            <text key={t} x={padL - 8} y={y(t) + 4} textAnchor="end">
              {fmtNum(t)}
            </text>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 ? (
              <text key={p.day} x={padL + slot * i + slot / 2} y={H - 4} textAnchor="middle">
                {short(p.day)}
              </text>
            ) : null,
          )}
        </g>
        {points.map((p, i) => {
          const x = padL + slot * i + (slot - barW) / 2;
          const top = y(p.visitors);
          const bh = H - padB - top;
          const r = Math.min(4, bh);
          // Rounded data end, square at the baseline.
          const d = p.visitors
            ? `M${x},${H - padB} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${H - padB} Z`
            : "";
          return (
            <g key={p.day}>
              <rect className="hit" x={padL + slot * i} y={padT} width={slot} height={H - padT - padB} onMouseEnter={() => setHover(i)} />
              {d && <path className={hover === i ? "bar on" : "bar"} d={d} pointerEvents="none" />}
            </g>
          );
        })}
      </svg>
      {h && (
        <div className="adm-tip" style={{ left: `${(hx / W) * 100}%`, top: `${(y(h.visitors) / H) * 100}%` }}>
          <b>{hourly ? h.day : new Date(h.day + "T00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</b>
          {fmtNum(h.visitors)} visitors · {fmtNum(h.sessions)} visits · {fmtNum(h.pageviews)} page views
        </div>
      )}
    </div>
  );
}
