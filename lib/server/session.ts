// Admin session token: "<expiry ms>.<hmac>". No user database; there is one admin and one password.
// Uses Web Crypto so the same code runs in proxy.ts and in server actions.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const enc = new TextEncoder();

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Buffer.from(sig).toString("base64url");
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (at least 32 characters).");
  return s;
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string) {
  const x = enc.encode(a), y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

export async function createSessionToken() {
  const exp = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${exp}.${await hmac(exp, secret())}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token || !process.env.SESSION_SECRET) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  return safeEqual(sig, await hmac(exp, secret()));
}

/** Short daily hash for an anonymous visitor: same person + same day = same id. Nothing is stored to compute it. */
export async function visitorHash(ip: string, ua: string) {
  const day = new Date().toISOString().slice(0, 10);
  return (await hmac(`${day}|${ip}|${ua}`, secret())).slice(0, 16);
}
