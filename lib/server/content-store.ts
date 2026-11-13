import "server-only";
import { unstable_cache } from "next/cache";
import { defaultContent, type ContentKey, type SiteContent } from "@/lib/content";
import { getDb } from "./db";

export const CONTENT_TAG = "content";

type ContentDoc = { _id: ContentKey; data: unknown; updatedAt: Date };

async function load(): Promise<SiteContent> {
  try {
    const db = await getDb();
    if (!db) return defaultContent;
    const docs = await db.collection<ContentDoc>("content").find().toArray();
    const merged: Record<string, unknown> = { ...defaultContent };
    for (const d of docs) if (d._id in defaultContent) merged[d._id] = d.data;
    return merged as SiteContent;
  } catch (err) {
    console.error("[content] falling back to defaults:", err);
    return defaultContent;
  }
}

/**
 * Site content: saved CMS sections from MongoDB, defaults from lib/content.ts for the rest.
 * Cached across requests and deployments; a save in the dashboard invalidates the "content" tag.
 */
export const getContent = unstable_cache(load, ["site-content-v1"], { tags: [CONTENT_TAG], revalidate: 3600 });

export async function getProjectBySlug(slug: string) {
  return (await getContent()).projects.find((p) => p.slug === slug);
}

/** Which sections have been saved in the dashboard (the rest still use the defaults). */
export async function getSavedSections() {
  const db = await getDb();
  if (!db) return {} as Partial<Record<ContentKey, Date>>;
  const docs = await db.collection<ContentDoc>("content").find({}, { projection: { updatedAt: 1 } }).toArray();
  return Object.fromEntries(docs.map((d) => [d._id, d.updatedAt])) as Partial<Record<ContentKey, Date>>;
}

export async function saveSection(key: ContentKey, data: unknown) {
  const db = await getDb();
  if (!db) throw new Error("MONGODB_URI is not set, so content cannot be saved.");
  await db.collection<ContentDoc>("content").updateOne({ _id: key }, { $set: { data, updatedAt: new Date() } }, { upsert: true });
}

export async function resetSection(key: ContentKey) {
  const db = await getDb();
  if (!db) throw new Error("MONGODB_URI is not set.");
  await db.collection<ContentDoc>("content").deleteOne({ _id: key });
}
