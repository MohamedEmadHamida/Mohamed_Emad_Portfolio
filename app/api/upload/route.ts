import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdmin } from "@/lib/server/auth";
import { UPLOAD_FOLDERS, UPLOAD_RULES, type UploadKind } from "@/lib/uploads";

export const runtime = "nodejs";

/**
 * Vercel Blob client uploads: the browser asks here for a short-lived token, then sends the file
 * straight to Blob storage. Files never pass through this function, so the 4.5MB request limit
 * of serverless functions does not apply.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!(await isAdmin())) throw new Error("Not logged in.");
        const { kind } = JSON.parse(clientPayload || "{}") as { kind?: UploadKind };
        const rules = UPLOAD_RULES[kind === "file" || kind === "media" ? kind : "image"];
        const folder = pathname.split("/")[0];
        if (!(UPLOAD_FOLDERS as readonly string[]).includes(folder)) throw new Error("Unknown upload folder.");
        return {
          allowedContentTypes: rules.types.length ? rules.types : undefined,
          maximumSizeInBytes: rules.maxBytes,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
      // Called by Vercel after the upload finishes (not on localhost). Nothing to record:
      // the dashboard saves the returned URL into the content when you press Save.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
