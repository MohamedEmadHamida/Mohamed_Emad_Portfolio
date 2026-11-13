import { NextResponse, userAgent, type NextRequest } from "next/server";
import { getDb } from "@/lib/server/db";
import { visitorHash } from "@/lib/server/session";
import { EVENT_NAMES, type TrackPayload } from "@/lib/analytics-types";

export const runtime = "nodejs";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|curl|wget|python-requests|axios|node-fetch/i;
const MAX_BODY = 8 * 1024;

const str = (v: unknown, max: number) => (typeof v === "string" && v.length > 0 ? v.slice(0, max) : undefined);
const num = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : undefined;

/** Accepts only the three known payload shapes, with lengths and numbers clamped. */
function clean(raw: unknown): TrackPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const sid = str(r.sid, 40);
  const path = str(r.path, 300);
  if (!sid || !path || !path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return null;

  if (r.type === "pageview") {
    const u = (r.utm && typeof r.utm === "object" ? r.utm : {}) as Record<string, unknown>;
    const utm = { source: str(u.source, 100), medium: str(u.medium, 100), campaign: str(u.campaign, 100) };
    return {
      type: "pageview",
      sid,
      path,
      ref: str(r.ref, 300),
      utm: utm.source || utm.medium || utm.campaign ? utm : undefined,
      sw: num(r.sw, 0, 10000),
    };
  }
  if (r.type === "engagement") {
    const ms = num(r.ms, 0, 30 * 60 * 1000);
    if (!ms) return null;
    const sections: Record<string, number> = {};
    if (r.sections && typeof r.sections === "object") {
      for (const [k, v] of Object.entries(r.sections as Record<string, unknown>).slice(0, 30)) {
        const key = k.replace(/[^\w-]/g, "").slice(0, 40);
        const val = num(v, 0, 30 * 60 * 1000);
        if (key && val) sections[key] = val;
      }
    }
    return { type: "engagement", sid, path, ms, sections, scroll: num(r.scroll, 0, 100) ?? 0 };
  }
  if (r.type === "event") {
    const name = EVENT_NAMES.find((n) => n === r.name);
    if (!name) return null;
    return { type: "event", sid, path, name, label: str(r.label, 200) };
  }
  return null;
}

function refInfo(ref: string | undefined) {
  if (!ref) return {};
  try {
    const u = new URL(ref);
    return { ref: u.hostname.replace(/^www\./, "") + u.pathname.replace(/\/$/, ""), refHost: u.hostname.replace(/^www\./, "") };
  } catch {
    return {};
  }
}

const header = (req: NextRequest, name: string) => {
  const v = req.headers.get(name);
  if (!v) return undefined;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
};

export async function POST(req: NextRequest) {
  const ok = new NextResponse(null, { status: 204 });
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || BOT.test(ua)) return ok;

    const text = await req.text();
    if (text.length > MAX_BODY) return ok;
    const p = clean(JSON.parse(text));
    if (!p) return ok;

    const db = await getDb();
    if (!db) return ok;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
    const agent = userAgent(req);
    const doc: Record<string, unknown> = {
      t: new Date(),
      type: p.type,
      sid: p.sid,
      path: p.path,
      vid: await visitorHash(ip, ua),
      // Geo comes from Vercel's edge headers; empty when running locally.
      country: header(req, "x-vercel-ip-country") ?? null,
      region: header(req, "x-vercel-ip-country-region") ?? null,
      city: header(req, "x-vercel-ip-city") ?? null,
      device: agent.device.type ?? "desktop",
      browser: agent.browser.name ?? null,
      os: agent.os.name ?? null,
    };
    if (p.type === "pageview") Object.assign(doc, refInfo(p.ref), { utm: p.utm, sw: p.sw });
    if (p.type === "engagement") Object.assign(doc, { ms: p.ms, sections: p.sections, scroll: p.scroll });
    if (p.type === "event") Object.assign(doc, { name: p.name, label: p.label });

    await db.collection("events").insertOne(doc);
  } catch (err) {
    console.error("[track]", err);
  }
  return ok;
}
