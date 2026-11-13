"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/server/auth";
import { CONTENT_TAG, resetSection, saveSection } from "@/lib/server/content-store";
import { sanitize, sectionByKey } from "@/lib/cms-schema";

export type SaveResult = { ok: boolean; errors?: string[]; message?: string };

function refreshSite() {
  updateTag(CONTENT_TAG); // content cache
  revalidatePath("/", "layout"); // every prerendered page of the site
}

export async function saveContent(key: string, json: string): Promise<SaveResult> {
  await requireAdmin();
  const def = sectionByKey(key);
  if (!def) return { ok: false, errors: ["Unknown section."] };
  if (json.length > 500_000) return { ok: false, errors: ["Too much content in one save."] };

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, errors: ["Could not read the form data."] };
  }
  const errors: string[] = [];
  const clean = sanitize(def.root, raw, "", errors);
  if (errors.length) return { ok: false, errors };

  try {
    await saveSection(def.key, clean);
  } catch (err) {
    return { ok: false, errors: [err instanceof Error ? err.message : "Saving failed."] };
  }
  refreshSite();
  return { ok: true, message: "Saved. The site shows the change now." };
}

export async function resetContent(key: string): Promise<SaveResult> {
  await requireAdmin();
  const def = sectionByKey(key);
  if (!def) return { ok: false, errors: ["Unknown section."] };
  try {
    await resetSection(def.key);
  } catch (err) {
    return { ok: false, errors: [err instanceof Error ? err.message : "Reset failed."] };
  }
  refreshSite();
  return { ok: true, message: "Back to the default content." };
}
