// Small display helpers for the dashboard.

export const fmtNum = (n: number) => new Intl.NumberFormat("en").format(n);

export const fmtPct = (r: number) => `${Math.round(r * 100)}%`;

/** 74_000 → "1m 14s", 4_000 → "4s". */
export function fmtDuration(ms: number) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), r = s % 60;
  if (m < 60) return r ? `${m}m ${r}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function fmtTime(d: Date | string, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

export function fmtClock(d: Date | string, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(d));
}

/** "EG" → "Egypt". (No flag emoji: Windows shows them as two letters.) */
export function fmtCountry(code: string | null | undefined) {
  if (!code || code.length !== 2) return code || "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
