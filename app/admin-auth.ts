import { env } from "cloudflare:workers";

const ADMIN_COOKIE = "mr_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdminEnvironment = {
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
};

function getAdminConfig() {
  const bindings = env as unknown as AdminEnvironment;
  const configured = Boolean(
    bindings.ADMIN_EMAIL &&
      bindings.ADMIN_PASSWORD &&
      bindings.ADMIN_SESSION_SECRET,
  );
  const allowLocalFallback =
    process.env.NODE_ENV !== "production" && !configured;

  return {
    configured,
    email: (
      bindings.ADMIN_EMAIL ||
      (allowLocalFallback ? "admin@localhost" : "")
    )
      .trim()
      .toLowerCase(),
    password:
      bindings.ADMIN_PASSWORD || (allowLocalFallback ? "change-me-now" : ""),
    secret:
      bindings.ADMIN_SESSION_SECRET ||
      (allowLocalFallback ? "local-development-session-secret" : ""),
  };
}

function toBase64Url(value: string | Uint8Array) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
}

function signaturesMatch(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  let difference = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";

  for (const cookie of cookieHeader.split(";")) {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    if (cookieName === name) return valueParts.join("=");
  }

  return "";
}

export async function createAdminSession(email: string, password: string) {
  const config = getAdminConfig();
  const normalizedEmail = email.trim().toLowerCase();

  if (
    !config.email ||
    !config.password ||
    normalizedEmail !== config.email ||
    password !== config.password
  ) {
    return null;
  }

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = toBase64Url(`${normalizedEmail}|${expiresAt}`);
  const signature = await sign(payload, config.secret);
  return `${payload}.${signature}`;
}

export async function isAdminRequest(request: Request) {
  const token = getCookie(request, ADMIN_COOKIE);
  const [payload, signature] = token.split(".");
  const config = getAdminConfig();

  if (!payload || !signature || !config.secret) return false;

  const expectedSignature = await sign(payload, config.secret);
  if (!signaturesMatch(signature, expectedSignature)) return false;

  try {
    const [email, expiresAt] = fromBase64Url(payload).split("|");
    return (
      email === config.email &&
      Number(expiresAt) > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function adminSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearAdminSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function isAdminLoginConfigured() {
  return getAdminConfig().configured;
}
