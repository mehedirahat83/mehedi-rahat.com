import { hashPassword, now, sessionCookie } from "@/app/customer-auth";
import { getPool } from "@/db";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const value = (input: unknown, length: number) => typeof input === "string" ? input.trim().slice(0, length) : "";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = value(body?.name, 100);
  const email = value(body?.email, 254).toLowerCase();
  const phone = value(body?.phone, 30);
  const password = typeof body?.password === "string" ? body.password : "";
  if (name.length < 2 || !emailPattern.test(email) || phone.length < 6 || password.length < 8) return Response.json({ ok: false, error: "Enter a valid name, email, phone number and password of at least 8 characters." }, { status: 400 });
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    // Lock only the customer row. PostgreSQL cannot lock the nullable side of a LEFT JOIN.
    const found = await client.query("SELECT id FROM customers WHERE email=$1 FOR UPDATE", [email]);
    const existing = found.rows[0];
    if (existing) {
      const account = await client.query("SELECT customer_id FROM customer_accounts WHERE customer_id=$1", [existing.id]);
      if (account.rows[0]) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "An account already exists for this email. Please sign in or reset your password." }, { status: 409 }); }
    }
    const customerId = existing?.id || crypto.randomUUID();
    const timestamp = now();
    if (existing) await client.query("UPDATE customers SET name=$1,phone=$2,updated_at=$3 WHERE id=$4", [name, phone, timestamp, customerId]);
    else await client.query("INSERT INTO customers (id,email,name,phone,lifetime_spend,created_at,updated_at) VALUES ($1,$2,$3,$4,0,$5,$5)", [customerId, email, name, phone, timestamp]);
    await client.query("INSERT INTO customer_accounts (customer_id,password_hash,created_at,updated_at) VALUES ($1,$2,$3,$3)", [customerId, await hashPassword(password), timestamp]);
    await client.query("COMMIT");
    return Response.json({ ok: true }, { status: 201, headers: { "Set-Cookie": sessionCookie(customerId) } });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined); console.error("Could not register customer", error);
    return Response.json({ ok: false, error: "Your account could not be created." }, { status: 500 });
  } finally { client.release(); }
}
