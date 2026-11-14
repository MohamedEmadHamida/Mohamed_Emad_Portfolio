// Rules shared by the upload button (browser) and the upload endpoints (server).

export type UploadKind = "image" | "media" | "file";

/** Where uploads go: Vercel Blob in production, public/uploads on this machine, or nowhere. */
export type UploadMode = "blob" | "local" | "none";

export const UPLOAD_RULES: Record<UploadKind, { maxBytes: number; types: string[]; accept: string }> = {
  image: {
    maxBytes: 15 * 1024 * 1024,
    types: ["image/webp", "image/jpeg", "image/png", "image/avif", "image/gif"],
    accept: "image/webp,image/jpeg,image/png,image/avif,image/gif",
  },
  // Image or a short looping video (render wall). Videos play muted, so keep them small: webm or mp4.
  media: {
    maxBytes: 50 * 1024 * 1024,
    types: ["image/webp", "image/jpeg", "image/png", "image/avif", "image/gif", "video/webm", "video/mp4"],
    accept: "image/webp,image/jpeg,image/png,image/avif,image/gif,video/webm,video/mp4",
  },
  // Downloads (HDAs, scripts, zips, PDFs…). Any type; size is the only limit.
  file: { maxBytes: 500 * 1024 * 1024, types: [], accept: "" },
};

/** Folder names inside the store, so the bucket stays readable. */
export const UPLOAD_FOLDERS = ["projects", "gallery", "assets", "cv", "misc"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

/** Safe file name: lowercase, dashes, keeps the extension. */
export function cleanFileName(name: string) {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 10) : "";
  return ext ? `${base}.${ext}` : base;
}

/** True when a media URL points at a video file (webm, mp4, mov). */
export const isVideo = (url: string) => /\.(webm|mp4|mov)(\?|#|$)/i.test(url);

export const isBlobUrl = (url: string) => /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(url);

/** A link that downloads instead of opening (Blob honours ?download=1; same-origin files use the download attribute). */
export const downloadHref = (url: string) => (isBlobUrl(url) ? `${url}${url.includes("?") ? "&" : "?"}download=1` : url);

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
