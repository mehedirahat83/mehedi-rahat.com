import type { PoolClient, QueryResultRow } from "pg";
import { decryptActivationPassword } from "@/app/server/activationCredentials";

export const orderStatuses = ["payment_verification", "on_hold", "completed", "rejected", "refunded"] as const;
export type OrderStatus = (typeof orderStatuses)[number];
export const activationStatuses = ["pending", "active", "suspended", "revoked"] as const;
export type ActivationStatus = (typeof activationStatuses)[number];
export function isOrderStatus(value: unknown): value is OrderStatus { return typeof value === "string" && orderStatuses.includes(value as OrderStatus); }
export function isActivationStatus(value: unknown): value is ActivationStatus { return typeof value === "string" && activationStatuses.includes(value as ActivationStatus); }
export function normalizeDomain(value: unknown) {
  const input = String(value ?? "").trim().toLowerCase().slice(0, 253);
  if (!input) return null;
  try {
    const hostname = new URL(input.includes("://") ? input : `https://${input}`).hostname.replace(/^www\./, "").replace(/\.$/, "");
    if (!hostname.includes(".") || hostname.length > 253 || !/^[a-z0-9.-]+$/.test(hostname) || hostname.split(".").some((part) => !part || part.length > 63 || part.startsWith("-") || part.endsWith("-"))) return null;
    return hostname;
  } catch { return null; }
}
export async function loadOrder(client: PoolClient, where: "id" | "number", value: string, includePrivateActivationInfo = false) {
  const field = where === "id" ? "o.id" : "o.order_number";
  const result = await client.query(`SELECT o.*,c.name AS customer_name,c.email AS customer_email,c.phone AS customer_phone,p.id AS payment_id,p.method AS submitted_method,p.sender_number,p.transaction_id,p.status AS payment_status,p.verified_by,p.verified_at FROM orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN payment_submissions p ON p.order_id=o.id WHERE ${field}=$1`, [value]);
  if (!result.rows[0]) return null;
  const order = result.rows[0];
  const [items, history, entitlements, activations] = await Promise.all([
    client.query("SELECT * FROM order_items WHERE order_id=$1 ORDER BY id", [order.id]),
    client.query("SELECT * FROM order_status_history WHERE order_id=$1 ORDER BY created_at,id", [order.id]),
    client.query("SELECT * FROM entitlements WHERE order_id=$1 ORDER BY created_at,id", [order.id]),
    client.query(`SELECT a.*,h.id AS history_id,h.from_status AS history_from_status,h.to_status AS history_to_status,h.note AS history_note,h.actor AS history_actor,h.created_at AS history_created_at
      FROM license_activations a JOIN entitlements e ON e.id=a.entitlement_id LEFT JOIN license_activation_history h ON h.activation_id=a.id
      WHERE e.order_id=$1 ORDER BY a.created_at,a.id,h.created_at,h.id`, [order.id]),
  ]);
  return serializeOrder(order, items.rows, history.rows, entitlements.rows, activations.rows, includePrivateActivationInfo);
}

function serializeOrder(order: QueryResultRow, items: QueryResultRow[], history: QueryResultRow[], entitlements: QueryResultRow[], activationRows: QueryResultRow[], includePrivateActivationInfo: boolean) {
  const activations = new Map<string, { id:string;domain:string;status:string;note:string|null;activatedAt:string|null;createdAt:string;updatedAt:string;history:{id:string;fromStatus:string|null;toStatus:string;note:string|null;actor:string;createdAt:string}[] }>();
  for (const row of activationRows) {
    if (!activations.has(row.id)) activations.set(row.id, { id:row.id,domain:row.domain,status:row.status,note:row.note,activatedAt:row.activated_at,createdAt:row.created_at,updatedAt:row.updated_at,history:[] });
    if (row.history_id) activations.get(row.id)?.history.push({ id:row.history_id,fromStatus:row.history_from_status,toStatus:row.history_to_status,note:row.history_note,actor:row.history_actor,createdAt:row.history_created_at });
  }
  return { id: order.id, number: order.order_number, status: order.status, currency: order.currency, subtotal: Number(order.subtotal), discount: Number(order.discount), paymentCharge: Number(order.payment_charge), total: Number(order.total), couponCode: order.coupon_code, payment: order.payment_method, notes: order.notes, createdAt: order.created_at, updatedAt: order.updated_at, completedAt: order.completed_at,
    ...(includePrivateActivationInfo ? { activationInfo: { loginUrl: order.activation_login_url, username: order.activation_username, password: decryptActivationPassword(order.activation_password_encrypted) } } : {}),
    customer: { id: order.customer_id, name: order.customer_name, email: order.customer_email, phone: order.customer_phone },
    paymentSubmission: order.payment_id ? { id: order.payment_id, method: order.submitted_method, senderNumber: order.sender_number, transactionId: order.transaction_id, status: order.payment_status, verifiedBy: order.verified_by, verifiedAt: order.verified_at } : null,
    items: items.map((item) => ({ id: item.id, itemKey: item.item_key, name: item.name, category: item.category, variation: item.variation, unitPrice: Number(item.unit_price), quantity: Number(item.quantity), lineTotal: Number(item.line_total) })),
    history: history.map((entry) => ({ id: entry.id, fromStatus: entry.from_status, toStatus: entry.to_status, note: entry.note, actor: entry.actor, createdAt: entry.created_at })),
    entitlements: entitlements.map((entry) => ({ id: entry.id, orderItemId: entry.order_item_id, itemKey: entry.item_key, variation: entry.variation, licenseId: entry.license_id, activationLimit: Number(entry.activation_limit), status: entry.status, downloadUrl: entry.download_url, createdAt: entry.created_at, activations: activationRows.filter((row) => row.entitlement_id === entry.id).map((row) => activations.get(row.id)).filter((value,index,array) => value && array.indexOf(value) === index) })) };
}
