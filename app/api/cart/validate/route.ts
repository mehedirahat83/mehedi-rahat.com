import { calculateOrderTotals, resolveCheckoutItems } from "@/app/server/orderCatalog";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    items?: unknown;
    couponCode?: unknown;
    paymentMethod?: unknown;
  } | null;
  try {
    const items = await resolveCheckoutItems(
      Array.isArray(body?.items) ? body.items : [],
      0,
    );
    const totals = calculateOrderTotals(
      items,
      String(body?.couponCode ?? ""),
      String(body?.paymentMethod ?? ""),
    );
    return Response.json({ ok: true, items, totals }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : "The cart could not be validated.",
    }, { status: 400 });
  }
}
