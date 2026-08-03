import { clearCustomerCookie, customerId, now } from "@/app/customer-auth";
import { membershipFor } from "@/app/membership";
import { getPool } from "@/db";

async function account(request: Request) {
  const id = customerId(request);
  if (!id) return null;
  const result = await getPool().query("SELECT id,name,email,phone,lifetime_spend AS \"lifetimeSpend\" FROM customers WHERE id=$1", [id]);
  return result.rows[0] || null;
}
export async function GET(request: Request) {
  const customer = await account(request);
  if (!customer) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const latest = await getPool().query("SELECT order_number AS number,status,payment_method AS payment,total FROM orders WHERE customer_id=$1 ORDER BY created_at DESC LIMIT 1", [customer.id]);
  return Response.json({ ok: true, customer, latestOrder: latest.rows[0] || null, membership: await membershipFor(Number(customer.lifetimeSpend) || 0) }, { headers: { "Cache-Control": "no-store" } });
}
export async function PATCH(request: Request) {
  const customer = await account(request); if (!customer) return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim().slice(0,100) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim().slice(0,30) : "";
  if (name.length < 2 || phone.length < 6) return Response.json({ ok: false, error: "Enter a valid name and phone number." }, { status: 400 });
  const result = await getPool().query("UPDATE customers SET name=$1,phone=$2,updated_at=$3 WHERE id=$4 RETURNING id,name,email,phone,lifetime_spend AS \"lifetimeSpend\"", [name, phone, now(), customer.id]);
  return Response.json({ ok: true, customer: result.rows[0] });
}
export async function DELETE() { return Response.json({ ok: true }, { headers: { "Set-Cookie": clearCustomerCookie() } }); }
