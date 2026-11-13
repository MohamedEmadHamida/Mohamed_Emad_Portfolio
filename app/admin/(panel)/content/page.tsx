import Link from "next/link";
import { SECTIONS } from "@/lib/cms-schema";
import { getSavedSections } from "@/lib/server/content-store";
import { TZ } from "@/lib/server/analytics";
import { fmtTime } from "@/lib/format";

export default async function ContentIndex() {
  const saved = await getSavedSections();
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-eyebrow">Content</p>
          <h1>Edit the site</h1>
          <p className="adm-muted">Changes go live as soon as you save. Sections you never saved use the default text from the code.</p>
        </div>
      </div>
      <div className="adm-sections">
        {SECTIONS.map((s) => (
          <Link key={s.key} href={`/admin/content/${s.key}`} className="adm-section-link">
            <b>{s.title}</b>
            <span className="adm-note">{s.description}</span>
            <span className="adm-note">{saved[s.key] ? `Edited ${fmtTime(saved[s.key]!, TZ)}` : "Default"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
