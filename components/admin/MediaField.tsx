"use client";

import { createContext, useContext, useRef, useState, type DragEvent } from "react";
import { uploadFile } from "@/lib/upload-client";
import { isVideo, isVimeo, UPLOAD_RULES, type UploadFolder, type UploadKind, type UploadMode } from "@/lib/uploads";

/** Set once by the editor from the server: where uploads go on this deployment. */
export const UploadModeContext = createContext<UploadMode>("none");
export const useUploadMode = () => useContext(UploadModeContext);

type Props = { id: string; kind: UploadKind; folder: UploadFolder; value: string; onChange: (url: string) => void };

/**
 * Image or download field: a URL/path box plus Upload. Drop a file anywhere on the field to upload it.
 * Images show a preview; files show their name with a link to open them.
 */
export function MediaField({ id, kind, folder, value, onChange }: Props) {
  const mode = useUploadMode();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);

  async function take(file: File | undefined) {
    if (!file) return;
    setError("");
    setProgress(0);
    try {
      onChange(await uploadFile(file, { kind, folder, mode, onProgress: setProgress }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  const drop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files[0]);
  };

  const name = value ? decodeURIComponent(value.split("?")[0].split("/").pop() ?? value) : "";

  return (
    <div
      className={over ? "adm-media over" : "adm-media"}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <div className="adm-media-row">
        {kind !== "file" &&
          (value ? (
            isVimeo(value) ? (
              <span className="adm-media-thumb empty">Vimeo</span>
            ) : isVideo(value) ? (
              <video className="adm-media-thumb" src={value} muted loop autoPlay playsInline />
            ) : (
              <img className="adm-media-thumb" src={value} alt="" />
            )
          ) : (
            <span className="adm-media-thumb empty">No image</span>
          ))}
        <div className="adm-media-main">
          <input id={id} className="adm-input" value={value} placeholder={kind !== "file" ? "Upload, drop, or paste a path" : "Upload, drop, or paste a link"} onChange={(e) => onChange(e.target.value)} />
          <div className="adm-media-actions">
            <button type="button" className="adm-btn sm" disabled={progress !== null || mode === "none"} onClick={() => input.current?.click()}>
              {progress !== null ? `Uploading… ${progress}%` : value ? "Replace" : "Upload"}
            </button>
            {value && kind === "file" && (
              <a className="adm-note" href={value} target="_blank" rel="noreferrer">
                {name} ↗
              </a>
            )}
            {value && (
              <button type="button" className="adm-btn sm ghost danger" onClick={() => onChange("")}>
                Clear
              </button>
            )}
            {mode === "none" && <span className="adm-note">Uploads need a Vercel Blob store.</span>}
            {mode === "local" && <span className="adm-note">Saved to public/uploads (this machine only)</span>}
          </div>
          {error && <p className="adm-error">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" hidden accept={UPLOAD_RULES[kind].accept || undefined} onChange={(e) => take(e.target.files?.[0])} />
    </div>
  );
}
