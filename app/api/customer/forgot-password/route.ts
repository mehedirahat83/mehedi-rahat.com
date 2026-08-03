import { digest, token } from "@/app/customer-auth";
import { sendPasswordReset } from "@/app/server/mail";
import { getPool } from "@/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0,254) : "";
  const found = await getPool().query("SELECT c.id,c.email FROM customers c JOIN customer_accounts a ON a.customer_id=c.id WHERE c.email=$1", [email]);
  const customer = found.rows[0];
  if (!customer) return Response.json({ ok: true });
  const rawToken = token();
  try {
    await getPool().query("DELETE FROM customer_password_resets WHERE customer_id=$1 OR expires_at < now()", [customer.id]);
    await getPool().query("INSERT INTO customer_password_resets (id,customer_id,token_hash,expires_at) VALUES ($1,$2,$3,now() + interval '30 minutes')", [crypto.randomUUID(), customer.id, digest(rawToken)]);
    const link = `${new URL(request.url).origin}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordReset(customer.email, link);
    return Response.json({ ok: true });
  } catch (error) { console.error("Could not send password reset", error); return Response.json({ ok: false, error: "Reset email could not be sent. Please try again." }, { status: 500 }); }
}
