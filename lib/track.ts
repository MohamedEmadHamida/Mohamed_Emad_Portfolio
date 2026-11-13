// Browser side of the analytics. Cookieless: the session id lives in sessionStorage (one tab visit),
// nothing identifies a person. Events go to /api/track with sendBeacon so they survive page close.
import type { EventName, TrackPayload } from "./analytics-types";

const SESSION_KEY = "ma_sid";
const IGNORE_KEY = "ma_ignore";
const SESSION_IDLE_MS = 30 * 60 * 1000;

export function isIgnored() {
  try {
    return localStorage.getItem(IGNORE_KEY) === "1";
  } catch {
    return false;
  }
}

/** The dashboard's "don't count my visits" switch. */
export function setIgnored(on: boolean) {
  try {
    if (on) localStorage.setItem(IGNORE_KEY, "1");
    else localStorage.removeItem(IGNORE_KEY);
  } catch {
    /* storage blocked: nothing to do */
  }
}

let memorySession: { id: string; last: number } | null = null;

/** Current session id, and whether it was just started (new tab, or 30 min without activity). */
export function session(): { sid: string; fresh: boolean } {
  const now = Date.now();
  let s: { id: string; last: number } | null = memorySession;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) s = JSON.parse(raw);
  } catch {
    /* sessionStorage blocked: keep the in-memory one */
  }
  const fresh = !s || now - s.last > SESSION_IDLE_MS;
  if (fresh || !s) s = { id: crypto.randomUUID().replace(/-/g, "").slice(0, 20), last: now };
  s.last = now;
  memorySession = s;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return { sid: s.id, fresh };
}

export function send(payload: TrackPayload) {
  if (isIgnored()) return;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon?.(("/api/track"), new Blob([body], { type: "application/json" }))) return;
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/track", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } }).catch(() => {});
}

/** Record a named event from anywhere in the site, e.g. track("wall_open", "Forest House"). */
export function track(name: EventName, label?: string) {
  if (typeof window === "undefined") return;
  send({ type: "event", sid: session().sid, path: location.pathname, name, label: label?.slice(0, 200) });
}
