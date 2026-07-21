// One shared site password (design doc §12: "no per-user accounts, no roles, no
// session infrastructure beyond what's needed to keep that one password gated").
// A session is a signed, expiring cookie — nothing is written to D1 to track it.
// Verifying a request costs one HMAC check, no database round trip.

const COOKIE_NAME = "wm_session";
const SESSION_HOURS = 24 * 30; // 30 days — re-enter the password monthly, not daily

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(secret, payload) {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" }[c]));
}

export async function makeSessionCookie(env) {
  const expires = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = `ok.${expires}`;
  const sig = await sign(env.SESSION_SECRET, payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_HOURS * 3600}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function isAuthenticated(request, env) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  const value = decodeURIComponent(match[1]);
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [tag, expiresStr, sig] = parts;
  const payload = `${tag}.${expiresStr}`;
  const expected = await sign(env.SESSION_SECRET, payload);
  if (expected !== sig) return false;
  if (tag !== "ok") return false;
  if (Date.now() > Number(expiresStr)) return false;
  return true;
}

export function checkPassword(submitted, env) {
  // Constant-time-ish comparison; site password is low-stakes per design doc §12
  // but there's no reason to make timing attacks free.
  const a = String(submitted || "");
  const b = String(env.SITE_PASSWORD || "");
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
