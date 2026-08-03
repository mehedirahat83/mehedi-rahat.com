import { isAdminRequest } from "@/app/admin-auth";
import { getPool } from "@/db";
import { membershipFor } from "@/app/membership";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  if (!(await isAdminRequest(request))) return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const id = (await context.params).id;
  const pool = getPool();
  const [profile, orders, licenses] = await Promise.all([
    pool.query(`SELECT c.id,c.name,c.email,c.phone,c.created_at AS "createdAt",c.lifetime_spend AS "lifetimeSpend",
      (a.customer_id IS NOT NULL) AS "hasAccount" FROM customers c LEFT JOIN customer_accounts a ON a.customer_id=c.id WHERE c.id=$1`, [id]),
    pool.query(`SELECT o.id,o.order_number AS number,o.status,o.total,o.payment_method AS payment,o.created_at AS "createdAt",
      p.transaction_id AS "transactionId",(SELECT string_agg(oi.name,' · ' ORDER BY oi.id) FROM order_items oi WHERE oi.order_id=o.id) AS "productNames",
      (SELECT count(*)::int FROM license_activations la JOIN entitlements e ON e.id=la.entitlement_id WHERE e.order_id=o.id AND la.status='active') AS "activeDomains"
      FROM orders o LEFT JOIN payment_submissions p ON p.order_id=o.id WHERE o.customer_id=$1 ORDER BY o.created_at DESC`, [id]),
    pool.query(`SELECT e.id,e.license_id AS "licenseId",e.status,e.activation_limit AS "activationLimit",oi.name AS "productName",oi.variation,
      coalesce(json_agg(json_build_object('id',la.id,'domain',la.domain,'status',la.status,'activatedAt',la.activated_at) ORDER BY la.activated_at) FILTER (WHERE la.id IS NOT NULL),'[]'::json) AS activations
      FROM entitlements e JOIN orders o ON o.id=e.order_id JOIN order_items oi ON oi.id=e.order_item_id LEFT JOIN license_activations la ON la.entitlement_id=e.id
      WHERE o.customer_id=$1 GROUP BY e.id,oi.id ORDER BY e.created_at DESC`, [id]),
  ]);
  const customer = profile.rows[0];
  if (!customer) return Response.json({ ok: false, error: "Customer not found." }, { status: 404 });
  const orderList = orders.rows.map(row => ({ ...row, total: Number(row.total), activeDomains: Number(row.activeDomains) }));
  const completed = orderList.filter(order => order.status === "completed"), refunded = orderList.filter(order => order.status === "refunded");
  const normalizedCustomer = { ...customer, lifetimeSpend: Number(customer.lifetimeSpend) };
  return Response.json({ ok: true, customer: normalizedCustomer, membership: await membershipFor(normalizedCustomer.lifetimeSpend), orders: orderList, licenses: licenses.rows, summary: { totalOrders: orderList.length, completedOrders: completed.length, refundedOrders: refunded.length, completedValue: completed.reduce((sum, order) => sum + order.total, 0), activeDomains: orderList.reduce((sum, order) => sum + order.activeDomains, 0) } });
}
