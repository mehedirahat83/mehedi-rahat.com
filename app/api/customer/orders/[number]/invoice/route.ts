import { customerId } from "@/app/customer-auth";
import { getPool } from "@/db";

type RouteContext = { params: Promise<{ number: string }> };

function text(value: unknown) {
  return String(value ?? "").replace(/[^\x20-\x7e]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(value: unknown) {
  return `BDT ${Number(value || 0).toLocaleString("en-US")}`;
}

function invoicePdf(lines: string[]) {
  const commands = ["BT", "/F1 19 Tf", "48 794 Td", `(${text(lines[0])}) Tj`, "0 -28 Td", "/F1 10 Tf"];
  for (const line of lines.slice(1)) commands.push(`(${text(line)}) Tj`, "0 -17 Td");
  commands.push("ET");
  const stream = commands.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf, "utf8")); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

export async function GET(request: Request, context: RouteContext) {
  const customer = customerId(request);
  if (!customer) return Response.json({ ok: false, error: "Sign in to download an invoice." }, { status: 401 });
  const number = decodeURIComponent((await context.params).number).trim().slice(0, 80);
  const pool = getPool();
  const orderResult = await pool.query(`SELECT o.id,o.order_number,o.status,o.payment_method,o.subtotal,o.discount,o.payment_charge,o.total,o.currency,o.created_at,c.name,c.email,c.phone
    FROM orders o JOIN customers c ON c.id=o.customer_id WHERE o.order_number=$1 AND o.customer_id=$2`, [number, customer]);
  const order = orderResult.rows[0];
  if (!order) return Response.json({ ok: false, error: "Order not found." }, { status: 404 });
  const items = await pool.query("SELECT name,variation,quantity,line_total FROM order_items WHERE order_id=$1 ORDER BY id", [order.id]);
  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(order.created_at));
  const lines = [
    "MEHEDI RAHAT - ORDER INVOICE",
    "",
    `Invoice for: ${order.order_number}`,
    `Issue date: ${date}`,
    `Order status: ${String(order.status).replaceAll("_", " ")}`,
    "",
    "BILLED TO",
    String(order.name),
    String(order.email),
    order.phone ? String(order.phone) : "",
    "",
    "PURCHASED PRODUCTS",
    ...items.rows.map((item) => `${item.name} - ${item.variation} x ${item.quantity}    ${money(item.line_total)}`),
    "",
    `Subtotal: ${money(order.subtotal)}`,
    ...(Number(order.discount) > 0 ? [`Discount: -${money(order.discount)}`] : []),
    `Payment charge: ${money(order.payment_charge)}`,
    `TOTAL: ${money(order.total)}`,
    "",
    `Payment method: ${order.payment_method}`,
    "Thank you for your purchase.",
  ].filter(Boolean);
  return new Response(invoicePdf(lines), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="invoice-${order.order_number}.pdf"`, "Cache-Control": "no-store" } });
}
