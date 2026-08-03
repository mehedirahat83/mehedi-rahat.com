import { sessionCookie, verifyPassword } from "@/app/customer-auth";
import { getPool } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const result = await getPool().query("SELECT c.id,a.password_hash FROM customers c JOIN customer_accounts a ON a.customer_id=c.id WHERE c.email=$1", [email]);
  const account = result.rows[0];
  if (!account || !(await verifyPassword(password, account.password_hash))) return Response.json({ ok: false, error: "Email or password did not match." }, { status: 401 });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(account.id) } });
}
