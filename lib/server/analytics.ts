import "server-only";
import type { Document } from "mongodb";
import { getDb } from "./db";

/** Days in the dashboard are counted in this time zone. */
export const TZ = "Africa/Cairo";
export const RANGES = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 } as const;
export type RangeKey = keyof typeof RANGES;

export type Row = { key: string; count: number; extra?: number };

export type SessionSummary = {
  sid: string;
  start: Date;
  end: Date;
  country: string | null;
  city: string | null;
  device: string;
  browser: string | null;
  os: string | null;
  ref: string | null;
  landing: string;
  pages: number;
  ms: number;
  events: string[];
};

export type Overview = {
  range: RangeKey;
  visitors: number;
  sessions: number;
  pageviews: number;
  avgSessionMs: number;
  bounceRate: number;
  cvDownloads: number;
  projectViews: number;
  contactClicks: number;
  daily: { day: string; visitors: number; sessions: number; pageviews: number }[];
  pages: (Row & { avgMs: number })[];
  projects: (Row & { avgMs: number })[];
  sections: { key: string; totalMs: number; sessions: number; avgMs: number }[];
  referrers: Row[];
  campaigns: Row[];
  countries: Row[];
  cities: Row[];
  devices: Row[];
  browsers: Row[];
  events: { name: string; label: string | null; count: number }[];
  recent: SessionSummary[];
};

const since = (range: RangeKey) => new Date(Date.now() - RANGES[range] * 24 * 60 * 60 * 1000);

/** Every day (or hour, for 24h) in the range as "YYYY-MM-DD" / "YYYY-MM-DD HH:00" in TZ, so empty days show as 0. */
function buckets(range: RangeKey) {
  const hourly = range === "24h";
  const step = hourly ? 3600_000 : 86_400_000;
  const count = hourly ? 24 : RANGES[range];
  const parts = (d: Date) =>
    Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
        .formatToParts(d)
        .map((p) => [p.type, p.value]),
    );
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const p = parts(new Date(Date.now() - i * step));
    out.push(hourly ? `${p.year}-${p.month}-${p.day} ${p.hour}:00` : `${p.year}-${p.month}-${p.day}`);
  }
  return out;
}

/** One pass per question. Volumes for a portfolio are small, so plain aggregations over raw events are fine. */
export async function getOverview(range: RangeKey): Promise<Overview | null> {
  const db = await getDb();
  if (!db) return null;
  const ev = db.collection("events");
  const from = since(range);
  const inRange = { t: { $gte: from } };

  // Session-level facts: first event (landing, referrer, geo, device), counts and engaged time.
  const sessionStage: Document[] = [
    { $match: inRange },
    { $sort: { t: 1 } },
    {
      $group: {
        _id: "$sid",
        start: { $first: "$t" },
        end: { $last: "$t" },
        vid: { $first: "$vid" },
        country: { $first: "$country" },
        city: { $first: "$city" },
        device: { $first: "$device" },
        browser: { $first: "$browser" },
        os: { $first: "$os" },
        ref: { $max: "$refHost" },
        refFull: { $max: "$ref" },
        utm: { $max: "$utm.campaign" },
        utmSource: { $max: "$utm.source" },
        landing: { $first: "$path" },
        pages: { $sum: { $cond: [{ $eq: ["$type", "pageview"] }, 1, 0] } },
        ms: { $sum: { $ifNull: ["$ms", 0] } },
        events: { $push: { $cond: [{ $eq: ["$type", "event"] }, "$name", "$$REMOVE"] } },
      },
    },
  ];

  const [facets] = await ev
    .aggregate([
      ...sessionStage,
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                sessions: { $sum: 1 },
                visitors: { $addToSet: "$vid" },
                pageviews: { $sum: "$pages" },
                ms: { $sum: "$ms" },
                bounces: { $sum: { $cond: [{ $and: [{ $lte: ["$pages", 1] }, { $lt: ["$ms", 10000] }] }, 1, 0] } },
              },
            },
            { $project: { sessions: 1, visitors: { $size: "$visitors" }, pageviews: 1, ms: 1, bounces: 1 } },
          ],
          referrers: [
            { $group: { _id: { $ifNull: ["$ref", "Direct / none"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 },
          ],
          campaigns: [
            { $match: { $or: [{ utm: { $ne: null } }, { utmSource: { $ne: null } }] } },
            { $group: { _id: { $concat: [{ $ifNull: ["$utmSource", "?"] }, " / ", { $ifNull: ["$utm", "—"] }] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          countries: [
            { $group: { _id: { $ifNull: ["$country", "Unknown"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 },
          ],
          cities: [
            { $match: { city: { $ne: null } } },
            { $group: { _id: { $concat: ["$city", ", ", { $ifNull: ["$country", "?"] }] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 12 },
          ],
          devices: [{ $group: { _id: { $ifNull: ["$device", "desktop"] }, count: { $sum: 1 } } }, { $sort: { count: -1 } }],
          browsers: [
            { $group: { _id: { $ifNull: ["$browser", "Unknown"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
          ],
          recent: [{ $sort: { start: -1 } }, { $limit: 40 }],
        },
      },
    ])
    .toArray();

  const [daily, pages, engagementByPath, sections, events] = await Promise.all([
    ev
      .aggregate([
        { $match: inRange },
        {
          $group: {
            _id: { $dateToString: { format: range === "24h" ? "%Y-%m-%d %H:00" : "%Y-%m-%d", date: "$t", timezone: TZ } },
            visitors: { $addToSet: "$vid" },
            sessions: { $addToSet: "$sid" },
            pageviews: { $sum: { $cond: [{ $eq: ["$type", "pageview"] }, 1, 0] } },
          },
        },
        { $project: { visitors: { $size: "$visitors" }, sessions: { $size: "$sessions" }, pageviews: 1 } },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    ev
      .aggregate([{ $match: { ...inRange, type: "pageview" } }, { $group: { _id: "$path", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 30 }])
      .toArray(),
    ev.aggregate([{ $match: { ...inRange, type: "engagement" } }, { $group: { _id: "$path", ms: { $sum: "$ms" } } }]).toArray(),
    ev
      .aggregate([
        { $match: { ...inRange, type: "engagement" } },
        { $project: { sid: 1, s: { $objectToArray: { $ifNull: ["$sections", {}] } } } },
        { $unwind: "$s" },
        { $group: { _id: "$s.k", totalMs: { $sum: "$s.v" }, sessions: { $addToSet: "$sid" } } },
        { $project: { totalMs: 1, sessions: { $size: "$sessions" } } },
        { $sort: { totalMs: -1 } },
      ])
      .toArray(),
    ev
      .aggregate([
        { $match: { ...inRange, type: "event" } },
        { $group: { _id: { name: "$name", label: "$label" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 60 },
      ])
      .toArray(),
  ]);

  const msByPath = new Map(engagementByPath.map((d) => [d._id as string, d.ms as number]));
  const pageRows = pages.map((p) => ({ key: p._id as string, count: p.count as number, avgMs: Math.round((msByPath.get(p._id) ?? 0) / p.count) }));
  const totals = facets.totals[0] ?? { sessions: 0, visitors: 0, pageviews: 0, ms: 0, bounces: 0 };
  const rows = (arr: Document[]): Row[] => arr.map((d) => ({ key: String(d._id), count: d.count }));
  const evRows = events.map((e) => ({ name: e._id.name as string, label: (e._id.label as string) ?? null, count: e.count as number }));
  const countOf = (name: string) => evRows.filter((e) => e.name === name).reduce((a, e) => a + e.count, 0);

  return {
    range,
    visitors: totals.visitors,
    sessions: totals.sessions,
    pageviews: totals.pageviews,
    avgSessionMs: totals.sessions ? Math.round(totals.ms / totals.sessions) : 0,
    bounceRate: totals.sessions ? totals.bounces / totals.sessions : 0,
    cvDownloads: countOf("cv_download"),
    projectViews: pageRows.filter((p) => p.key.startsWith("/projects/")).reduce((a, p) => a + p.count, 0),
    contactClicks: countOf("contact_email") + countOf("form_submit"),
    daily: (() => {
      const byDay = new Map(daily.map((d) => [d._id as string, d]));
      return buckets(range).map((day) => {
        const d = byDay.get(day);
        return { day, visitors: d?.visitors ?? 0, sessions: d?.sessions ?? 0, pageviews: d?.pageviews ?? 0 };
      });
    })(),
    pages: pageRows,
    projects: pageRows.filter((p) => p.key.startsWith("/projects/")).map((p) => ({ ...p, key: p.key.slice("/projects/".length) })),
    sections: sections.map((s) => ({ key: s._id, totalMs: s.totalMs, sessions: s.sessions, avgMs: s.sessions ? Math.round(s.totalMs / s.sessions) : 0 })),
    referrers: rows(facets.referrers),
    campaigns: rows(facets.campaigns),
    countries: rows(facets.countries),
    cities: rows(facets.cities),
    devices: rows(facets.devices),
    browsers: rows(facets.browsers),
    events: evRows,
    recent: facets.recent.map((s: Document) => ({
      sid: s._id,
      start: s.start,
      end: s.end,
      country: s.country,
      city: s.city,
      device: s.device ?? "desktop",
      browser: s.browser,
      os: s.os,
      ref: s.refFull ?? s.ref ?? null,
      landing: s.landing,
      pages: s.pages,
      ms: s.ms,
      events: s.events,
    })),
  };
}

export type SessionDetail = {
  summary: SessionSummary;
  timeline: { t: Date; type: string; path: string; name?: string; label?: string; ms?: number; scroll?: number; sections?: Record<string, number> }[];
  /** Per page: total engaged time and time per section, summed over flushes. */
  pages: { path: string; ms: number; scroll: number; sections: { key: string; ms: number }[] }[];
};

export async function getSession(sid: string): Promise<SessionDetail | null> {
  const db = await getDb();
  if (!db) return null;
  const events = await db.collection("events").find({ sid: String(sid).slice(0, 40) }).sort({ t: 1 }).limit(1000).toArray();
  if (!events.length) return null;
  const first = events[0];
  const byPath = new Map<string, { ms: number; scroll: number; sections: Map<string, number> }>();
  for (const e of events) {
    if (e.type !== "engagement") continue;
    const p = byPath.get(e.path) ?? { ms: 0, scroll: 0, sections: new Map() };
    p.ms += e.ms ?? 0;
    p.scroll = Math.max(p.scroll, e.scroll ?? 0);
    for (const [k, v] of Object.entries((e.sections ?? {}) as Record<string, number>)) p.sections.set(k, (p.sections.get(k) ?? 0) + v);
    byPath.set(e.path, p);
  }
  return {
    summary: {
      sid,
      start: first.t,
      end: events[events.length - 1].t,
      country: first.country,
      city: first.city,
      device: first.device ?? "desktop",
      browser: first.browser,
      os: first.os,
      ref: events.find((e) => e.ref)?.ref ?? null,
      landing: first.path,
      pages: events.filter((e) => e.type === "pageview").length,
      ms: events.reduce((a, e) => a + (e.ms ?? 0), 0),
      events: events.filter((e) => e.type === "event").map((e) => e.name),
    },
    timeline: events.map((e) => ({ t: e.t, type: e.type, path: e.path, name: e.name, label: e.label, ms: e.ms, scroll: e.scroll, sections: e.sections })),
    pages: [...byPath.entries()]
      .map(([path, p]) => ({ path, ms: p.ms, scroll: p.scroll, sections: [...p.sections.entries()].map(([key, ms]) => ({ key, ms })).sort((a, b) => b.ms - a.ms) }))
      .sort((a, b) => b.ms - a.ms),
  };
}
