import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export async function isAdmin() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action (proxy.ts also guards /admin, this is the second lock). */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
