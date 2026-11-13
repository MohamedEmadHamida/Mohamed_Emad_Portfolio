import Link from "next/link";
import { getOverview, RANGES, TZ, type RangeKey } from "@/lib/server/analytics";
import { getContent } from "@/lib/server/content-store";
import { SECTION_LABELS } from "@/lib/analytics-types";
import { fmtCountry, fmtDuration, fmtNum, fmtPct, fmtTime } from "@/lib/format";
import { BarTable } from "@/components/admin/BarTable";
import { DailyChart } from "@/components/admin/DailyChart";

const EVENT_LABELS: Record<string, string> = {
  cv_download: "CV downloaded",
  contact_email: "Email link clicked",
  form_submit: "Contact form sent",
  outbound: "Outbound link",
  project_click: "Project card clicked",
  project_filter: "Project filter used",
  wall_open: "Render wall frame opened",
};

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const { range: r } = await searchParams;
  const range: RangeKey = r && r in RANGES ? (r as RangeKey) : "30d";
  const [o, content] = await Promise.all([getOverview(range), getContent()]);
  const projectTitle = new Map(content.projects.map((p) => [p.slug, p.title]));

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-eyebrow">Analytics</p>
          <h1>Who visited, and what they looked at</h1>
        </div>
        <nav className="adm-tabs" aria-label="Date range">
          {(Object.keys(RANGES) as RangeKey[]).map((k) => (
            <Link key={k} href={`/admin?range=${k}`} aria-current={k === range ? "true" : undefined}>
              {k === "24h" ? "24 hours" : `${RANGES[k]} days`}
            </Link>
          ))}
        </nav>
      </div>

      {!o ? (
        <p className="adm-empty">Connect a database (MONGODB_URI) to start collecting visits.</p>
      ) : (
        <>
          <dl className="adm-stats">
            <Stat label="Visitors" value={fmtNum(o.visitors)} note="unique per day, approximate" />
            <Stat label="Visits" value={fmtNum(o.sessions)} note={`${fmtPct(o.bounceRate)} left right away`} />
            <Stat label="Page views" value={fmtNum(o.pageviews)} />
            <Stat label="Avg. time per visit" value={fmtDuration(o.avgSessionMs)} note="tab visible and active" />
            <Stat label="Project pages opened" value={fmtNum(o.projectViews)} />
            <Stat label="CV downloads" value={fmtNum(o.cvDownloads)} />
            <Stat label="Contact clicks" value={fmtNum(o.contactClicks)} note="email link + form" />
          </dl>

          <div className="adm-grid">
            <section className="adm-card wide">
              <div className="adm-card-head">
                <h2>Visitors {range === "24h" ? "per hour" : "per day"}</h2>
                <span className="adm-note">Hover a column for details</span>
              </div>
              <DailyChart points={o.daily} hourly={range === "24h"} />
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Most watched sections</h2>
                <span className="adm-note">time on screen</span>
              </div>
              <BarTable
                valueLabel="Visits"
                extraLabel="Avg"
                items={[...o.sections].sort((a, b) => b.sessions - a.sessions || b.avgMs - a.avgMs).map((s) => ({
                  key: s.key,
                  label: SECTION_LABELS[s.key] ?? s.key,
                  value: s.sessions,
                  extra: fmtDuration(s.avgMs),
                }))}
                empty="No section data yet."
              />
              <p className="adm-note" style={{ marginTop: 8 }}>Visits = visits that saw the section. Avg = average time it stayed on screen.</p>
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Projects opened</h2>
              </div>
              <BarTable
                valueLabel="Views"
                extraLabel="Avg time"
                items={o.projects.map((p) => ({
                  key: p.key,
                  label: projectTitle.get(p.key) ?? p.key,
                  value: p.count,
                  extra: fmtDuration(p.avgMs),
                  href: `/projects/${p.key}`,
                }))}
                empty="No project page opened yet."
              />
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Pages</h2>
              </div>
              <BarTable valueLabel="Views" extraLabel="Avg time" items={o.pages.map((p) => ({ key: p.key, value: p.count, extra: fmtDuration(p.avgMs) }))} />
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Where visitors came from</h2>
              </div>
              <BarTable valueLabel="Visits" items={o.referrers.map((x) => ({ key: x.key, value: x.count }))} />
              {o.campaigns.length > 0 && (
                <>
                  <h2 style={{ marginTop: 18 }}>Campaigns (UTM)</h2>
                  <BarTable valueLabel="Visits" items={o.campaigns.map((x) => ({ key: x.key, value: x.count }))} />
                </>
              )}
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Countries</h2>
              </div>
              <BarTable valueLabel="Visits" items={o.countries.map((x) => ({ key: x.key, label: fmtCountry(x.key === "Unknown" ? null : x.key), value: x.count }))} />
              {o.cities.length > 0 && (
                <>
                  <h2 style={{ marginTop: 18 }}>Cities</h2>
                  <BarTable valueLabel="Visits" items={o.cities.map((x) => ({ key: x.key, value: x.count }))} />
                </>
              )}
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Actions</h2>
              </div>
              <BarTable
                valueLabel="Times"
                items={o.events.map((e) => ({
                  key: `${e.name}:${e.label}`,
                  label: (
                    <>
                      {EVENT_LABELS[e.name] ?? e.name}
                      {e.label && <span className="adm-muted"> · {e.name === "project_click" ? projectTitle.get(e.label) ?? e.label : e.label}</span>}
                    </>
                  ),
                  value: e.count,
                }))}
                empty="No clicks recorded yet."
              />
            </section>

            <section className="adm-card">
              <div className="adm-card-head">
                <h2>Devices</h2>
              </div>
              <BarTable valueLabel="Visits" items={o.devices.map((x) => ({ key: x.key, label: x.key[0].toUpperCase() + x.key.slice(1), value: x.count }))} />
              <h2 style={{ marginTop: 18 }}>Browsers</h2>
              <BarTable valueLabel="Visits" items={o.browsers.map((x) => ({ key: x.key, value: x.count }))} />
            </section>

            <section className="adm-card wide">
              <div className="adm-card-head">
                <h2>Recent visits</h2>
                <span className="adm-note">Open a visit to see what that visitor did, page by page</span>
              </div>
              {o.recent.length === 0 ? (
                <p className="adm-empty">No visits yet.</p>
              ) : (
                <div className="adm-scroll">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>When</th>
                        <th>From</th>
                        <th>Device</th>
                        <th>Came from</th>
                        <th>Landed on</th>
                        <th className="num">Pages</th>
                        <th className="num">Time</th>
                        <th>Did</th>
                      </tr>
                    </thead>
                    <tbody>
                      {o.recent.map((s) => (
                        <tr key={s.sid}>
                          <td>
                            <Link href={`/admin/sessions/${s.sid}`}>{fmtTime(s.start, TZ)}</Link>
                          </td>
                          <td>
                            {fmtCountry(s.country)}
                            {s.city && <span className="adm-muted"> · {s.city}</span>}
                          </td>
                          <td>
                            {s.device}
                            <span className="adm-muted"> · {[s.browser, s.os].filter(Boolean).join(", ")}</span>
                          </td>
                          <td>{s.ref ?? <span className="adm-muted">Direct</span>}</td>
                          <td>{s.landing}</td>
                          <td className="num">{s.pages}</td>
                          <td className="num">{fmtDuration(s.ms)}</td>
                          <td>
                            {[...new Set(s.events)].map((e) => (
                              <span key={e} className={e === "cv_download" || e === "contact_email" || e === "form_submit" ? "adm-chip hot" : "adm-chip"}>
                                {EVENT_LABELS[e] ?? e}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="adm-stat">
      <dt>{label}</dt>
      <dd>
        {value}
        {note && <small>{note}</small>}
      </dd>
    </div>
  );
}
