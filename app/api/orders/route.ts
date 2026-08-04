import { getPool } from "@/db";
import { calculateOrderTotals, resolveCheckoutItems } from "@/app/server/orderCatalog";
import { encryptActivationPassword } from "@/app/server/activationCredentials";
import { customerId as sessionCustomerId } from "@/app/customer-auth";
import { membershipFor } from "@/app/membership";
import { adminNotificationEmail, sendSupportTicketEmail } from "@/app/server/mail";

const paymentMethods = new Set(["bkash"]);
const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const customer = body?.customer && typeof body.customer === "object" ? body.customer as Record<string, unknown> : {};
  let name = clean(customer.name, 120);
  let email = clean(customer.email, 254).toLowerCase();
  let phone = clean(customer.phone, 30);
  const notes = clean(body?.notes, 2000);
  const activationInfo = body?.activationInfo && typeof body.activationInfo === "object" ? body.activationInfo as Record<string, unknown> : {};
  const activationLoginUrl = clean(activationInfo.loginUrl, 500);
  const activationUsername = clean(activationInfo.username, 254);
  const activationPassword = clean(activationInfo.password, 500);
  const paymentMethod = clean(body?.paymentMethod, 40);
  const senderNumber = clean(body?.senderNumber, 30);
  const transactionId = clean(body?.transactionId, 120).toUpperCase();
  const idempotencyKey = clean(body?.idempotencyKey, 120);
  const signedInCustomer = sessionCustomerId(request);
  let membershipPercent = 0;
  if (signedInCustomer) {
    const profile = await getPool().query<{ name: string; email: string; phone: string; lifetime_spend: number }>("SELECT name,email,phone,lifetime_spend FROM customers WHERE id=$1", [signedInCustomer]);
    if (profile.rows[0]) { ({ name, email, phone } = profile.rows[0]); membershipPercent = (await membershipFor(Number(profile.rows[0].lifetime_spend))).current.discountPercent; }
  }
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || phone.length < 8) {
    return Response.json({ ok: false, error: "Please provide valid customer information." }, { status: 400 });
  }
  if (!paymentMethods.has(paymentMethod) || senderNumber.length < 8 || transactionId.length < 4 || idempotencyKey.length < 16) {
    return Response.json({ ok: false, error: "Please provide valid payment details." }, { status: 400 });
  }
  if (activationLoginUrl) {
    try { const parsed = new URL(activationLoginUrl); if (!new Set(["http:", "https:"]).has(parsed.protocol)) throw new Error(); }
    catch { return Response.json({ ok: false, error: "Please provide a valid website login link." }, { status: 400 }); }
  }

  const client = await getPool().connect();
  try {
    const items = await resolveCheckoutItems(Array.isArray(body?.items) ? body.items : [], 0);
    const totals = calculateOrderTotals(items, clean(body?.couponCode, 40), paymentMethod, membershipPercent);
    const existing = await client.query<{ order_number: string; total: number; status: string }>(
      "SELECT order_number,total,status FROM orders WHERE idempotency_key=$1",
      [idempotencyKey],
    );
    if (existing.rows[0]) {
      return Response.json({ ok: true, order: { number: existing.rows[0].order_number, total: Number(existing.rows[0].total), status: existing.rows[0].status, payment: paymentMethod, customer: { name } } });
    }

    const now = new Date().toISOString();
    const orderId = crypto.randomUUID();
    const customerId = crypto.randomUUID();
    await client.query("BEGIN");
    const sequenceResult = await client.query<{ value: string }>("SELECT nextval('order_number_seq')::text AS value");
    const orderNumber = `MR-${sequenceResult.rows[0].value}`;
    const customerResult = await client.query<{ id: string }>(
      `INSERT INTO customers (id,email,name,phone,lifetime_spend,created_at,updated_at)
       VALUES ($1,$2,$3,$4,0,$5,$5)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,updated_at=EXCLUDED.updated_at
       RETURNING id`,
      [customerId, email, name, phone, now],
    );
    const storedCustomerId = customerResult.rows[0].id;
    await client.query(
      `INSERT INTO orders (id,order_number,customer_id,status,currency,subtotal,discount,payment_charge,total,coupon_code,payment_method,notes,activation_login_url,activation_username,activation_password_encrypted,idempotency_key,created_at,updated_at)
       VALUES ($1,$2,$3,'payment_verification','BDT',$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$15)`,
      [orderId, orderNumber, storedCustomerId, totals.subtotal, totals.discount, totals.paymentCharge, totals.total, totals.couponCode || null, paymentMethod, notes || null, activationLoginUrl || null, activationUsername || null, encryptActivationPassword(activationPassword), idempotencyKey, now],
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (id,order_id,item_key,name,category,variation,unit_price,quantity,line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [crypto.randomUUID(), orderId, item.itemKey, item.name, item.category, item.variation, item.unitPrice, item.quantity, item.lineTotal],
      );
    }
    await client.query(
      `INSERT INTO payment_submissions (id,order_id,method,sender_number,transaction_id,status,created_at)
       VALUES ($1,$2,$3,$4,$5,'pending',$6)`,
      [crypto.randomUUID(), orderId, paymentMethod, senderNumber, transactionId, now],
    );
    await client.query(
      `INSERT INTO order_status_history (id,order_id,from_status,to_status,note,actor,created_at)
       VALUES ($1,$2,NULL,'payment_verification','Order submitted by customer','customer',$3)`,
      [crypto.randomUUID(), orderId, now],
    );
    await client.query("COMMIT");
    void adminNotificationEmail().then((adminEmail) => adminEmail ? sendSupportTicketEmail({
      to: adminEmail,
      subject: `New order · ${orderNumber}`,
      message: `${name} placed ${orderNumber} for ৳ ${totals.total.toLocaleString("en-US")}. Review its payment and items in the admin dashboard.`,
    }).catch(() => undefined) : undefined).catch(() => undefined);
    return Response.json({ ok: true, order: { number: orderNumber, status: "payment_verification", createdAt: now, customer: { name, email, phone }, items: items.map(item => ({ id: item.itemKey, name: item.name, variation: item.variation, price: item.unitPrice, quantity: item.quantity })), payment: paymentMethod, subtotal: totals.subtotal, discount: totals.discount, paymentCharge: totals.paymentCharge, total: totals.total, senderNumber, transactionId } }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    const message = code === "23505" ? "This payment reference has already been used." : error instanceof Error ? error.message : "The order could not be created.";
    return Response.json({ ok: false, error: message }, { status: code === "23505" ? 409 : 400 });
  } finally {
    client.release();
  }
}
