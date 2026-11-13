"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { track } from "@/lib/track";

type Field = "name" | "email" | "message";

const checks: Record<Field, (v: string) => boolean> = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  message: (v) => v.trim().length >= 20,
};

/** Validates only. Sending is added with the backend in part 6. */
export function ContactForm({ className, style }: { className?: string; style?: CSSProperties }) {
  const [bad, setBad] = useState<Partial<Record<Field, boolean>>>({});
  const [note, setNote] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Partial<Record<Field, boolean>> = {};
    let first: Field | null = null;
    for (const f of Object.keys(checks) as Field[]) {
      const ok = checks[f](String(data.get(f) ?? ""));
      next[f] = !ok;
      if (!ok && !first) first = f;
    }
    setBad(next);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      setNote("");
    } else {
      track("form_submit");
      setNote("The form is valid. Nothing was sent, because sending is added with the backend.");
    }
  }

  const field = (f: Field) => (bad[f] ? "field bad" : "field");

  return (
    <form ref={formRef} className={className} style={style} noValidate data-reveal onSubmit={onSubmit}>
      <div className={field("name")}>
        <label className="label" htmlFor="f-name">Name</label>
        <input id="f-name" name="name" autoComplete="name" required />
        <p className="err">Add your name.</p>
      </div>
      <div className={field("email")}>
        <label className="label" htmlFor="f-email">Email</label>
        <input id="f-email" name="email" type="email" autoComplete="email" required />
        <p className="err">Add a valid email address.</p>
      </div>
      <div className={field("message")}>
        <label className="label" htmlFor="f-msg">Project brief</label>
        <textarea id="f-msg" name="message" required />
        <p className="err">Write at least 20 characters about the project.</p>
      </div>
      <div className="cta">
        <button className="btn primary" type="submit">Send message</button>
      </div>
      <p className="note" role="status">{note}</p>
    </form>
  );
}
