"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, safeEqual, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/server/session";

// Best-effort brute-force brake: per IP, 5 failed attempts lock the form for 15 minutes.
// In-memory, so it resets on a cold start; the long random password is the real protection.
const attempts = new Map<string, { n: number; until: number }>();

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) return { error: "ADMIN_PASSWORD and SESSION_SECRET are not set on the server." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const a = attempts.get(ip);
  if (a && a.until > Date.now()) return { error: "Too many attempts. Try again in 15 minutes." };

  const password = String(form.get("password") ?? "");
  if (!safeEqual(password, expected)) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(ip, { n, until: n >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong password." };
  }
  attempts.delete(ip);

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
