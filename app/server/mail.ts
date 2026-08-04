import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import nodemailer from "nodemailer";
import { getPool } from "@/db";

export type SmtpConfig = { host: string; port: number; secure: boolean; username: string; password: string; fromEmail: string; fromName: string; notificationEmail: string };
const SETTINGS_ID = "primary";
export const DEFAULT_ADMIN_NOTIFICATION_EMAIL = "mehedirahat83@gmail.com";

function encryptionKey() {
  const value = process.env.SMTP_SETTINGS_ENCRYPTION_KEY || process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("SMTP_SETTINGS_ENCRYPTION_KEY is not configured.");
  return createHash("sha256").update(value).digest();
}
export function encryptSmtpPassword(value: string) { const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv); const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]); return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`; }
function decryptSmtpPassword(value: string) { const [ivValue, tagValue, encryptedValue] = value.split("."); if (!ivValue || !tagValue || !encryptedValue) throw new Error("Stored SMTP password is invalid."); const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url")); decipher.setAuthTag(Buffer.from(tagValue, "base64url")); return Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8"); }
function defaultNotificationEmail() { return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_NOTIFICATION_EMAIL; }
function envConfig(): SmtpConfig { return { host: process.env.SMTP_HOST || "", port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", username: process.env.SMTP_USER || "", password: process.env.SMTP_PASSWORD || "", fromEmail: process.env.MAIL_FROM || process.env.SMTP_USER || "", fromName: process.env.MAIL_FROM_NAME || "Mehedi Rahat", notificationEmail: defaultNotificationEmail() }; }
export async function getSmtpConfig(): Promise<SmtpConfig> { const result = await getPool().query("SELECT host,port,secure,username,password_encrypted,from_email,from_name,notification_email FROM smtp_settings WHERE id=$1", [SETTINGS_ID]); const row = result.rows[0]; return row ? { host: row.host, port: Number(row.port), secure: Boolean(row.secure), username: row.username, password: decryptSmtpPassword(row.password_encrypted), fromEmail: row.from_email, fromName: row.from_name, notificationEmail: row.notification_email || defaultNotificationEmail() } : envConfig(); }
export function smtpTransport(config: SmtpConfig) { return nodemailer.createTransport({ host: config.host, port: config.port, secure: config.secure, auth: { user: config.username, pass: config.password } }); }
export async function sendPasswordReset(to: string, link: string) { const config = await getSmtpConfig(); await smtpTransport(config).sendMail({ from: `${config.fromName} <${config.fromEmail}>`, to, subject: "Reset your Mehedi Rahat account password", text: `Reset your password: ${link}\nThis link expires in 30 minutes.` }); }
export async function sendSupportTicketEmail(input: { to: string; subject: string; message: string }) {
  const config = await getSmtpConfig();
  if (!config.host || !config.username || !config.password || !config.fromEmail) return;
  await smtpTransport(config).sendMail({
    from: `${config.fromName} <${config.fromEmail}>`,
    to: input.to,
    subject: input.subject,
    text: `${input.message}\n\nOpen your account dashboard to view or reply to this support conversation.\n\nMehedi Rahat · Digital Growth Partner`,
  });
}
export async function adminNotificationEmail() { return (await getSmtpConfig()).notificationEmail; }
// Kept as an internal compatibility alias while all admin notifications use one setting.
export async function supportNotificationEmail() { return adminNotificationEmail(); }
export async function publicSmtpSettings() { const result = await getPool().query("SELECT host,port,secure,username,from_email AS \"fromEmail\",from_name AS \"fromName\",notification_email AS \"notificationEmail\",updated_at AS \"updatedAt\" FROM smtp_settings WHERE id=$1", [SETTINGS_ID]); const row = result.rows[0]; return row ? { configured: true, ...row, notificationEmail: row.notificationEmail || defaultNotificationEmail() } : { configured: false, host: process.env.SMTP_HOST || "", port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === "true", username: process.env.SMTP_USER || "", fromEmail: process.env.MAIL_FROM || process.env.SMTP_USER || "", fromName: process.env.MAIL_FROM_NAME || "Mehedi Rahat", notificationEmail: defaultNotificationEmail(), updatedAt: null }; }
export async function saveSmtpSettings(input: SmtpConfig) { await getPool().query("INSERT INTO smtp_settings (id,host,port,secure,username,password_encrypted,from_email,from_name,notification_email,updated_by,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'admin',now()) ON CONFLICT (id) DO UPDATE SET host=EXCLUDED.host,port=EXCLUDED.port,secure=EXCLUDED.secure,username=EXCLUDED.username,password_encrypted=EXCLUDED.password_encrypted,from_email=EXCLUDED.from_email,from_name=EXCLUDED.from_name,notification_email=EXCLUDED.notification_email,updated_by='admin',updated_at=now()", [SETTINGS_ID, input.host, input.port, input.secure, input.username, encryptSmtpPassword(input.password), input.fromEmail, input.fromName, input.notificationEmail]); }
