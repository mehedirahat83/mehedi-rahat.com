import { customerId, hashPassword, now, verifyPassword } from "@/app/customer-auth";
import { getPool } from "@/db";

const text = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function currentCustomer(request: Request) {
  const id = customerId(request);
  if (!id) return null;
  const result = await getPool().query("SELECT id,name,email,phone,lifetime_spend AS \"lifetimeSpend\" FROM customers WHERE id=$1", [id]);
  return result.rows[0] || null;
}

export async function GET(request: Request) {
  const customer = await currentCustomer(request);
  return customer ? Response.json({ ok: true, customer }) : Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export async function PATCH(request: Request) {
  const customer = await currentCustomer(request);
  if (!customer) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = text(body?.name, 100), phone = text(body?.phone, 30);
  if (name.length < 2 || phone.length < 6) return Response.json({ ok: false, error: "Enter a valid name and phone number." }, { status: 400 });
  const result = await getPool().query("UPDATE customers SET name=$1,phone=$2,updated_at=$3 WHERE id=$4 RETURNING id,name,email,phone,lifetime_spend AS \"lifetimeSpend\"", [name, phone, now(), customer.id]);
  return Response.json({ ok: true, customer: result.rows[0] });
}

export async function PUT(request: Request) {
  const id = customerId(request);
  if (!id) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const email = text(body?.email, 254).toLowerCase(), currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  if (!validEmail(email) || !currentPassword) return Response.json({ ok: false, error: "Enter a valid new email and your current password." }, { status: 400 });
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const account = await client.query("SELECT c.email,a.password_hash FROM customers c JOIN customer_accounts a ON a.customer_id=c.id WHERE c.id=$1 FOR UPDATE", [id]);
    if (!account.rows[0] || !(await verifyPassword(currentPassword, account.rows[0].password_hash))) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "Current password did not match." }, { status: 401 }); }
    if (account.rows[0].email === email) { await client.query("ROLLBACK"); return Response.json({ ok: false, error: "That is already your account email." }, { status: 400 }); }
    const result = await client.query("UPDATE customers SET email=$1,updated_at=$2 WHERE id=$3 RETURNING id,name,email,phone,lifetime_spend AS \"lifetimeSpend\"", [email, now(), id]);
    await client.query("COMMIT");
    return Response.json({ ok: true, customer: result.rows[0], message: "Email address updated securely." });
  } catch (error) { await client.query("ROLLBACK").catch(() => undefined); const status = error && typeof error === "object" && "code" in error && String(error.code) === "23505" ? 409 : 500; return Response.json({ ok: false, error: status === 409 ? "That email is already in use." : "Email could not be updated." }, { status }); } finally { client.release(); }
}

export async function POST(request: Request) {
  const id = customerId(request);
  if (!id) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!currentPassword || password.length < 8) return Response.json({ ok: false, error: "Enter your current password and a new password of at least 8 characters." }, { status: 400 });
  const account = await getPool().query("SELECT password_hash FROM customer_accounts WHERE customer_id=$1", [id]);
  if (!account.rows[0] || !(await verifyPassword(currentPassword, account.rows[0].password_hash))) return Response.json({ ok: false, error: "Current password did not match." }, { status: 401 });
  await getPool().query("UPDATE customer_accounts SET password_hash=$1,updated_at=$2 WHERE customer_id=$3", [await hashPassword(password), now(), id]);
  await getPool().query("UPDATE customer_password_resets SET used_at=now() WHERE customer_id=$1 AND used_at IS NULL", [id]);
  return Response.json({ ok: true, message: "Password changed securely." });
}
