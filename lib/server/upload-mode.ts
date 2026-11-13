import "server-only";
import type { UploadMode } from "@/lib/uploads";

/**
 * Vercel Blob when its token is set (Vercel → Storage → Blob adds BLOB_READ_WRITE_TOKEN).
 * Without it, uploads are written to public/uploads, which only works on this machine:
 * Vercel's file system is read-only.
 */
export function uploadMode(): UploadMode {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  if (process.env.NODE_ENV !== "production") return "local";
  return "none";
}
