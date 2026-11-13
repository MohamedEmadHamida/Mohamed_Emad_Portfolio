"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="adm-form">
      <input type="hidden" name="next" value={next} />
      <label className="adm-label" htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required autoFocus className="adm-input" />
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      <button className="adm-btn primary" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
