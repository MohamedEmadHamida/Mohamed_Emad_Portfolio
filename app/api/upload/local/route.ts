import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { isAdmin } from "@/lib/server/auth";
import { uploadMode } from "@/lib/server/upload-mode";
import { cleanFileName, UPLOAD_FOLDERS, UPLOAD_RULES, type UploadKind } from "@/lib/uploads";

export const runtime = "nodejs";

/** Development fallback when there is no Blob token: saves the file to public/uploads/<folder>/. */
export async function POST(request: Request) {
  if (uploadMode() !== "local") return NextResponse.json({ error: "Local uploads are only available in development." }, { status: 404 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const kind: UploadKind = form.get("kind") === "file" ? "file" : "image";
  const folder = String(form.get("folder") ?? "misc");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });
  if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) return NextResponse.json({ error: "Unknown folder." }, { status: 400 });

  const rules = UPLOAD_RULES[kind];
  if (file.size > rules.maxBytes) return NextResponse.json({ error: "File is too large." }, { status: 400 });
  if (rules.types.length && !rules.types.includes(file.type)) return NextResponse.json({ error: `Not an allowed type (${file.type || "unknown"}).` }, { status: 400 });

  const name = cleanFileName(file.name).replace(/(\.[a-z0-9]+)?$/, (ext) => `-${randomBytes(4).toString("hex")}${ext}`);
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${folder}/${name}`, size: file.size });
}
