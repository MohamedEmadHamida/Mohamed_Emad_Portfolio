import Link from "next/link";
import { notFound } from "next/navigation";
import { sectionByKey } from "@/lib/cms-schema";
import { getContent, getSavedSections } from "@/lib/server/content-store";
import { ContentEditor } from "@/components/admin/ContentEditor";

export default async function EditSection({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const def = sectionByKey(key);
  if (!def) notFound();
  const [content, saved] = await Promise.all([getContent(), getSavedSections()]);

  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-eyebrow">
            <Link href="/admin/content">← Content</Link>
          </p>
          <h1>{def.title}</h1>
          <p className="adm-muted">{def.description}</p>
        </div>
      </div>
      <ContentEditor key={def.key} def={def} initial={content[def.key]} isSaved={!!saved[def.key]} />
    </>
  );
}
