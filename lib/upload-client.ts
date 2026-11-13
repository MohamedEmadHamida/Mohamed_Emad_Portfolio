// Browser side of uploads, used by the dashboard's image and file fields.
import { cleanFileName, fmtBytes, UPLOAD_RULES, type UploadFolder, type UploadKind, type UploadMode } from "./uploads";

type Options = { kind: UploadKind; folder: UploadFolder; mode: UploadMode; onProgress?: (pct: number) => void };

/** Uploads one file and returns its public URL. Throws an Error with a readable message. */
export async function uploadFile(file: File, { kind, folder, mode, onProgress }: Options): Promise<string> {
  const rules = UPLOAD_RULES[kind];
  if (file.size > rules.maxBytes) throw new Error(`${file.name} is ${fmtBytes(file.size)}; the limit is ${fmtBytes(rules.maxBytes)}.`);
  if (rules.types.length && !rules.types.includes(file.type)) throw new Error(`${file.name}: use WebP, JPG, PNG, AVIF or GIF.`);

  if (mode === "blob") {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(`${folder}/${cleanFileName(file.name)}`, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: JSON.stringify({ kind }),
      multipart: file.size > 50 * 1024 * 1024,
      onUploadProgress: (e) => onProgress?.(Math.round(e.percentage)),
    });
    return blob.url;
  }

  if (mode === "local") {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    body.append("folder", folder);
    onProgress?.(10);
    const res = await fetch("/api/upload/local", { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
    onProgress?.(100);
    return json.url;
  }

  throw new Error("Uploads need a Vercel Blob store: Vercel → Storage → Create → Blob, then redeploy.");
}

/** "forest-house_02.webp" → "Forest house 02", a starting point for an image description. */
export const titleFromFileName = (name: string) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
  return base ? base[0].toUpperCase() + base.slice(1) : "Image";
};
