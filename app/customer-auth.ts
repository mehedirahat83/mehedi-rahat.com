import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);
const COOKIE = "mr_customer_session";
const TTL = 60 * 60 * 24 * 14;
const secret = () => process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "";
export const now = () => new Date().toISOString();
export const token = () => randomBytes(32).toString("base64url");
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); return `${salt}:${Buffer.from(await scrypt(password, salt, 64) as Buffer).toString("hex")}`; }
export async function verifyPassword(password: string, stored: string) { const [salt, hash] = stored.split(":"); if (!salt || !hash) return false; const calculated = Buffer.from(await scrypt(password, salt, 64) as Buffer); const expected = Buffer.from(hash, "hex"); return calculated.length === expected.length && timingSafeEqual(calculated, expected); }
export function sessionCookie(customerId: string) { const sessionSecret = secret(); if (!sessionSecret) throw new Error("CUSTOMER_SESSION_SECRET is not configured."); const expires = Math.floor(Date.now() / 1000) + TTL; const payload = `${customerId}.${expires}`; const signature = createHmac("sha256", sessionSecret).update(payload).digest("base64url"); const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""; return `${COOKIE}=${Buffer.from(`${payload}.${signature}`).toString("base64url")}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${TTL}${secure}`; }
export function clearCustomerCookie() { return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`; }
export function customerId(request: Request) { const raw = (request.headers.get("cookie") || "").split(";").map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1); const sessionSecret = secret(); if (!raw || !sessionSecret) return null; try { const [id, expires, signature] = Buffer.from(raw,"base64url").toString().split("."); const expected=createHmac("sha256",sessionSecret).update(`${id}.${expires}`).digest("base64url"); const actual = Buffer.from(signature || ""); const expectedBuffer = Buffer.from(expected); return actual.length===expectedBuffer.length && timingSafeEqual(actual,expectedBuffer) && Number(expires)>Date.now()/1000 ? id : null; } catch { return null; } }
