import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, TZ } from "@/lib/server/analytics";
import { SECTION_LABELS } from "@/lib/analytics-types";
import { fmtClock, fmtCountry, fmtDuration, fmtTime } from "@/lib/format";
import { BarTable } from "@/components/admin/BarTable";

const EVENT_LABELS: Record<string, string> = {
  cv_download: "Downloaded the CV",
  asset_download: "Downloaded a free asset",
  contact_email: "Clicked the email link",
  form_submit: "Sent the contact form",
  outbound: "Opened an outside link",
  project_click: "Clicked a project",
  project_filter: "Filtered projects",
  wall_open: "Opened a render wall frame",
};

/** One visit, in order: pages opened, time on each, which sections held their attention, and what they clicked. */
export default async function SessionPage({ params }: { params: Promise<{ sid: string }> }) {
  const { sid } = await params;
  const s = await getSession(sid);
  if (!s) notFound();
  const { summary: v } = s;

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-eyebrow">
            <Link href="/admin">← Analytics</Link>
          </p>
          <h1>Visit on {fmtTime(v.start, TZ)}</h1>
          <p className="adm-muted">
            {fmtCountry(v.country)}
            {v.city ? ` · ${v.city}` : ""} · {v.device}, {[v.browser, v.os].filter(Boolean).join(", ")} · came from {v.ref ?? "a direct visit"}
          </p>
        </div>
      </div>

      <dl className="adm-stats">
        <div className="adm-stat">
          <dt>Engaged time</dt>
          <dd>{fmtDuration(v.ms)}</dd>
        </div>
        <div className="adm-stat">
          <dt>Pages</dt>
          <dd>{v.pages}</dd>
        </div>
        <div className="adm-stat">
          <dt>Landed on</dt>
          <dd style={{ fontSize: 18 }}>{v.landing}</dd>
        </div>
      </dl>

      <div className="adm-grid">
        {s.pages.map((p) => (
          <section className="adm-card" key={p.path}>
            <div className="adm-card-head">
              <h2>{p.path}</h2>
              <span className="adm-note">
                {fmtDuration(p.ms)} · scrolled {p.scroll}%
              </span>
            </div>
            <BarTable
              valueLabel="Seconds"
              items={p.sections.map((x) => ({ key: x.key, label: SECTION_LABELS[x.key] ?? x.key, value: Math.round(x.ms / 1000) }))}
              empty="Left before any section was measured."
            />
          </section>
        ))}

        <section className="adm-card wide">
          <h2>Timeline</h2>
          <ol className="adm-timeline">
            {s.timeline.map((e, i) => (
              <li key={i}>
                <time>{fmtClock(e.t, TZ)}</time>
                <span className="adm-muted">{e.path}</span>
                <span>
                  {e.type === "pageview" && "Opened the page"}
                  {e.type === "event" && (
                    <>
                      {EVENT_LABELS[e.name ?? ""] ?? e.name}
                      {e.label && <span className="adm-muted"> · {e.label}</span>}
                    </>
                  )}
                  {e.type === "engagement" && (
                    <span className="adm-muted">
                      Spent {fmtDuration(e.ms ?? 0)}
                      {e.sections && Object.keys(e.sections).length > 0 && (
                        <>
                          {" "}
                          · mostly on{" "}
                          {Object.entries(e.sections)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([k, ms]) => `${SECTION_LABELS[k] ?? k} (${fmtDuration(ms)})`)
                            .join(", ")}
                        </>
                      )}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
