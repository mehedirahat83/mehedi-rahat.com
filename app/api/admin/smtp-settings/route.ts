import { isAdminRequest } from "@/app/admin-auth";
import { getSmtpConfig, publicSmtpSettings, saveSmtpSettings, smtpTransport } from "@/app/server/mail";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
export async function GET(request: Request) { if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 }); return Response.json({ ok: true, settings: await publicSmtpSettings() }); }
export async function PUT(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const current = await getSmtpConfig(); const host = text(body?.host, 255); const username = text(body?.username, 255); const password = text(body?.password, 500) || current.password; const fromEmail = text(body?.fromEmail, 255); const fromName = text(body?.fromName, 120); const port = Number(body?.port); const secure = body?.secure === true;
  if (!host || !username || !password || !fromEmail || !fromName || !Number.isInteger(port) || port < 1 || port > 65535) return Response.json({ ok: false, error: "Enter valid SMTP and sender details." }, { status: 400 });
  await saveSmtpSettings({ host, port, secure, username, password, fromEmail, fromName });
  return Response.json({ ok: true, settings: await publicSmtpSettings() });
}
export async function POST(request: Request) { if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 }); try { await smtpTransport(await getSmtpConfig()).verify(); return Response.json({ ok: true, message: "SMTP connection verified successfully." }); } catch (error) { console.error("SMTP test failed", error); return Response.json({ ok: false, error: "SMTP connection failed. Check host, port, encryption, username and password." }, { status: 400 }); } }
