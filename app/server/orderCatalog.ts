export type CheckoutItemInput = {
  id?: unknown;
  variation?: unknown;
  quantity?: unknown;
};

import { getPool } from "@/db";

export type ResolvedOrderItem = {
  itemKey: string;
  name: string;
  category: string;
  variation: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

const themes = {
  "corporate-pro": ["Corporate Pro", 8500],
  "shop-essential": ["Shop Essential", 12500],
  "service-expert": ["Service Expert", 7500],
  "news-portal": ["News Portal", 15000],
  "clinic-care": ["Clinic Care", 12000],
  "course-academy": ["Course Academy", 18000],
} as const;

function normaliseThemePack(value: string) {
  const match = value.match(/pack\s*0?([123])/i);
  return match ? `Pack 0${match[1]}` : null;
}

function safeQuantity(value: unknown) {
  const quantity = Number(value ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error("Invalid item quantity.");
  }
  return quantity;
}

export async function resolveCheckoutItems(
  inputs: CheckoutItemInput[],
  completedCommerceSales: number,
): Promise<ResolvedOrderItem[]> {
  if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 25) {
    throw new Error("Your cart is empty or contains too many items.");
  }

  const resolved: ResolvedOrderItem[] = [];
  for (const input of inputs) {
    const id = String(input.id ?? "").trim().toLowerCase();
    const requestedVariation = String(input.variation ?? "").trim();
    const quantity = safeQuantity(input.quantity);

    if (id === "mr-commerce-pro-license") {
      const unitPrice = completedCommerceSales < 20 ? 3000 : 5000;
      resolved.push({
        itemKey: "mr-commerce-pro-license",
        name: "MR Commerce Pro",
        category: "MR Exclusive",
        variation: "Lifetime",
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      });
      continue;
    }

    if (id.startsWith("theme-")) {
      const themeKey = Object.keys(themes)
        .sort((a, b) => b.length - a.length)
        .find((key) => id === `theme-${key}` || id.startsWith(`theme-${key}-`));
      if (!themeKey) throw new Error(`Unknown Ready Theme item: ${id}`);
      const pack = normaliseThemePack(requestedVariation || id);
      if (!pack) throw new Error("Invalid Ready Theme package.");
      const [name, basePrice] = themes[themeKey as keyof typeof themes];
      const multiplier = pack === "Pack 01" ? 1 : pack === "Pack 02" ? 1.45 : 1.9;
      const unitPrice =
        pack === "Pack 01" ? basePrice : Math.ceil((basePrice * multiplier) / 500) * 500;
      resolved.push({
        itemKey: themeKey,
        name,
        category: "Ready Theme",
        variation: pack,
        unitPrice,
        quantity,
        lineTotal: unitPrice * quantity,
      });
      continue;
    }

    const productId = String(input.id ?? "").trim().toLowerCase();
    const result = await getPool().query<{
      id: string;
      name: string;
      category: string;
      label: string;
      price: number;
    }>(
      `SELECT p.id,p.name,c.name AS category,v.label,v.price
       FROM products p
       INNER JOIN product_categories c ON c.id=p.category_id
       INNER JOIN product_variations v ON v.product_id=p.id
       WHERE (p.id=$1 OR p.slug=$1) AND p.status='published'
         AND lower(v.label)=lower($2)
       LIMIT 1`,
      [productId, requestedVariation],
    );
    const product = result.rows[0];
    if (!product) throw new Error("A product or variation in your cart is no longer available.");
    const unitPrice = Number(product.price);
    resolved.push({
      itemKey: product.id,
      name: product.name,
      category: product.category,
      variation: product.label,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    });
  }
  return resolved;
}

export function calculateOrderTotals(
  items: ResolvedOrderItem[],
  couponCode: string,
  paymentMethod: string,
) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const normalisedCoupon = couponCode.trim().toUpperCase();
  const discount = normalisedCoupon === "MR10" ? Math.round(subtotal * 0.1) : 0;
  const afterDiscount = subtotal - discount;
  const paymentCharge =
    paymentMethod === "bkash" ? Math.round(afterDiscount * 0.0185) : 0;
  return {
    subtotal,
    discount,
    paymentCharge,
    total: afterDiscount + paymentCharge,
    couponCode: normalisedCoupon === "MR10" ? "MR10" : "",
  };
}
