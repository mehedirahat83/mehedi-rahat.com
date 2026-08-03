import { digest, hashPassword, now, sessionCookie } from "@/app/customer-auth";
import { getPool } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const rawToken = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!rawToken || password.length < 8) return Response.json({ ok: false, error: "Choose a password of at least 8 characters." }, { status: 400 });
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const found = await client.query("SELECT id,customer_id FROM customer_password_resets WHERE token_hash=$1 AND used_at IS NULL AND expires_at > now() FOR UPDATE", [digest(rawToken)]);
    const reset = found.rows[0];
    if (!reset) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "This reset link is invalid or has expired." }, { status: 400 }); }
    await client.query("UPDATE customer_accounts SET password_hash=$1,updated_at=$2 WHERE customer_id=$3", [await hashPassword(password), now(), reset.customer_id]);
    await client.query("UPDATE customer_password_resets SET used_at=now() WHERE customer_id=$1", [reset.customer_id]);
    await client.query("COMMIT");
    return Response.json({ ok: true }, { headers: { "Set-Cookie": sessionCookie(reset.customer_id) } });
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); console.error("Could not reset password", error); return Response.json({ ok: false, error: "Password could not be reset." }, { status: 500 }); } finally { client.release(); }
}
