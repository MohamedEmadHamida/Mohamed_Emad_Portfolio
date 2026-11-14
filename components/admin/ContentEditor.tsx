"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { Field, SectionDef } from "@/lib/cms-schema";
import { resetContent, saveContent, type SaveResult } from "@/app/admin/(panel)/content/actions";
import { vars } from "@/lib/client";
import { titleFromFileName, uploadFile } from "@/lib/upload-client";
import type { UploadMode } from "@/lib/uploads";
import { MediaField, UploadModeContext, useUploadMode } from "./MediaField";

type Val = unknown;
type Obj = Record<string, Val>;

/** A blank value for a field, used when adding a list item. */
function blank(f: Field): Val {
  switch (f.type) {
    case "select":
      return f.options[0]?.value ?? "";
    case "color":
      return "#ff3b1d";
    case "strings":
    case "list":
      return [];
    case "object":
      return Object.fromEntries(f.fields.map((x) => [x.k, blank(x)]));
    default:
      return "";
  }
}

const move = <T,>(arr: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

function FieldInput({ field, value, onChange, id }: { field: Field; value: Val; onChange: (v: Val) => void; id: string }) {
  switch (field.type) {
    case "textarea":
      return <textarea id={id} className="adm-textarea" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "select":
      return (
        <select id={id} className="adm-select" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "image":
    case "media":
    case "file":
      return <MediaField id={id} kind={field.type} folder={field.folder} value={(value as string) ?? ""} onChange={onChange} />;
    case "color": {
      const c = (value as string) || "#ff3b1d";
      return (
        <div className="adm-color">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(c) ? c : "#ff3b1d"} onChange={(e) => onChange(e.target.value)} aria-label={field.label} />
          <input id={id} className="adm-input" value={c} onChange={(e) => onChange(e.target.value)} />
          {field.presets?.map((p) => (
            <button
              key={p.value}
              type="button"
              className="adm-swatch"
              style={vars({ "--c": p.value })}
              aria-pressed={c.toLowerCase() === p.value}
              aria-label={p.label}
              title={p.label}
              onClick={() => onChange(p.value)}
            />
          ))}
        </div>
      );
    }
    case "strings": {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className="adm-strings">
          {arr.map((s, i) => (
            <div className="adm-strings-row" key={i}>
              {field.multiline ? (
                <textarea className="adm-textarea" value={s} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} />
              ) : (
                <input className="adm-input" value={s} onChange={(e) => onChange(arr.map((x, j) => (j === i ? e.target.value : x)))} />
              )}
              <span style={{ display: "flex", gap: 4 }}>
                <button type="button" className="adm-btn sm ghost" onClick={() => onChange(move(arr, i, -1))} aria-label="Move up">↑</button>
                <button type="button" className="adm-btn sm ghost" onClick={() => onChange(move(arr, i, 1))} aria-label="Move down">↓</button>
                <button type="button" className="adm-btn sm ghost danger" onClick={() => onChange(arr.filter((_, j) => j !== i))} aria-label="Remove">✕</button>
              </span>
            </div>
          ))}
          <div>
            <button type="button" className="adm-btn sm" onClick={() => onChange([...arr, ""])}>
              + Add {field.itemLabel ?? "item"}
            </button>
          </div>
        </div>
      );
    }
    case "list":
      return <ListField field={field} value={value} onChange={onChange} id={id} />;
    case "object":
      return (
        <div className="adm-group">
          <ObjectFields field={field} value={value} onChange={onChange} idPrefix={id} />
        </div>
      );
    default:
      return <input id={id} className="adm-input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

/** Repeating items (projects, gallery images, reviews…): collapsible, reorderable, removable. */
function ListField({ field, value, onChange, id }: { field: Extract<Field, { type: "list" }>; value: Val; onChange: (v: Val) => void; id: string }) {
  const mode = useUploadMode();
  const bulkInput = useRef<HTMLInputElement>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const [bulkError, setBulkError] = useState("");
  const arr = Array.isArray(value) ? (value as Obj[]) : [];
  const itemField: Field = { k: "", label: "", type: "object", fields: field.item };

  // Several images at once: one new item per image, uploaded one after another.
  async function uploadMany(files: FileList | null) {
    const b = field.bulkUpload;
    if (!b || !files?.length) return;
    setBulkError("");
    let next = [...arr];
    const list = [...files];
    for (let n = 0; n < list.length; n++) {
      setBulk({ done: n, total: list.length });
      try {
        const url = await uploadFile(list[n], { kind: "image", folder: b.folder, mode });
        const item = blank(itemField) as Obj;
        item[b.src] = url;
        if (b.alt) item[b.alt] = titleFromFileName(list[n].name);
        next = [...next, item];
        onChange(next);
      } catch (err) {
        setBulkError(err instanceof Error ? err.message : "Upload failed.");
      }
    }
    setBulk(null);
    if (bulkInput.current) bulkInput.current.value = "";
  }

  return (
        <div className="adm-strings">
          {arr.map((item, i) => {
            const title = (field.titleKey && (item?.[field.titleKey] as string)) || `${field.itemLabel ?? "Item"} ${i + 1}`;
            return (
              <details className="adm-item" key={i} open={arr.length <= 1 || i === added}>
                <summary>
                  <span className="t">{title}</span>
                  <button type="button" className="adm-btn sm ghost" onClick={(e) => { e.preventDefault(); onChange(move(arr, i, -1)); }} aria-label="Move up">↑</button>
                  <button type="button" className="adm-btn sm ghost" onClick={(e) => { e.preventDefault(); onChange(move(arr, i, 1)); }} aria-label="Move down">↓</button>
                  <button
                    type="button"
                    className="adm-btn sm ghost danger"
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm(`Remove "${title}"?`)) onChange(arr.filter((_, j) => j !== i));
                    }}
                  >
                    Remove
                  </button>
                </summary>
                <div className="adm-item-body">
                  <ObjectFields field={itemField} value={item} onChange={(v) => onChange(arr.map((x, j) => (j === i ? (v as Obj) : x)))} idPrefix={`${id}-${i}`} />
                </div>
              </details>
            );
          })}
          <div className="adm-media-actions">
            <button
              type="button"
              className="adm-btn sm"
              onClick={() => {
                setAdded(arr.length);
                onChange([...arr, blank(itemField) as Obj]);
              }}
            >
              + Add {field.itemLabel ?? "item"}
            </button>
            {field.bulkUpload && (
              <>
                <button type="button" className="adm-btn sm" disabled={!!bulk || mode === "none"} onClick={() => bulkInput.current?.click()}>
                  {bulk ? `Uploading ${bulk.done + 1} of ${bulk.total}…` : "↑ Upload images"}
                </button>
                <input ref={bulkInput} type="file" hidden multiple accept="image/webp,image/jpeg,image/png,image/avif,image/gif" onChange={(e) => uploadMany(e.target.files)} />
              </>
            )}
          </div>
          {bulkError && <p className="adm-error">{bulkError}</p>}
        </div>
  );
}

function ObjectFields({ field, value, onChange, idPrefix }: { field: Extract<Field, { type: "object" }>; value: Val; onChange: (v: Val) => void; idPrefix: string }) {
  const obj = (value && typeof value === "object" ? value : {}) as Obj;
  return (
    <>
      {field.fields.map((f) => {
        const id = `${idPrefix}-${f.k}`;
        return (
          <div className="adm-field" key={f.k}>
            <label className="adm-label" htmlFor={id}>
              {f.label}
              {f.optional && <span className="adm-muted"> · optional</span>}
            </label>
            <FieldInput field={f} value={obj[f.k]} id={id} onChange={(v) => onChange({ ...obj, [f.k]: v })} />
            {f.help && <p className="adm-help">{f.help}</p>}
          </div>
        );
      })}
    </>
  );
}

export function ContentEditor({ def, initial, isSaved, uploadMode }: { def: SectionDef; initial: Val; isSaved: boolean; uploadMode: UploadMode }) {
  const [value, setValue] = useState<Val>(initial);
  const [dirty, setDirty] = useState(false);
  const [result, setResult] = useState<SaveResult | null>(null);
  const [pending, start] = useTransition();

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Live preview of the accent color inside the dashboard while editing settings.
  const accent = def.key === "site" ? ((value as Obj)?.accent as string) : undefined;
  useEffect(() => {
    if (accent && /^#[0-9a-f]{6}$/i.test(accent)) document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  const change = (v: Val) => {
    setValue(v);
    setDirty(true);
    setResult(null);
  };

  return (
    <UploadModeContext.Provider value={uploadMode}>
    <form
      className="adm-editor"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveContent(def.key, JSON.stringify(value));
          setResult(r);
          if (r.ok) setDirty(false);
        });
      }}
    >
      {def.root.type === "object" ? (
        <div className="adm-group">
          <ObjectFields field={def.root} value={value} onChange={change} idPrefix={def.key} />
        </div>
      ) : (
        <div className="adm-field">
          <FieldInput field={def.root} value={value} onChange={change} id={def.key} />
        </div>
      )}

      <div className="adm-savebar">
        <button type="submit" className="adm-btn primary" disabled={pending || !dirty}>
          {pending ? "Saving…" : "Save"}
        </button>
        {isSaved && (
          <button
            type="button"
            className="adm-btn ghost danger"
            disabled={pending}
            onClick={() => {
              if (!confirm("Throw away the saved version and go back to the default content for this section?")) return;
              start(async () => {
                const r = await resetContent(def.key);
                setResult(r);
                if (r.ok) location.reload();
              });
            }}
          >
            Reset to default
          </button>
        )}
        {dirty && !pending && <span className="adm-note">Unsaved changes</span>}
        {result?.ok && <span className="adm-ok">{result.message}</span>}
        {result && !result.ok && (
          <ul className="adm-error" role="alert">
            {result.errors?.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
    </form>
    </UploadModeContext.Provider>
  );
}
