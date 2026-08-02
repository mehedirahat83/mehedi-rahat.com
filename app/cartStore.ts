"use client";

export type CartItem = { id: string; productId?: string; name: string; category: string; variation: string; price: number; quantity: number };
export type ValidatedTotals = { subtotal: number; discount: number; paymentCharge: number; total: number; couponCode: string };
export const CART_UPDATED_EVENT = "mr-cart-updated";

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(localStorage.getItem("mr-cart") || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem("mr-cart", JSON.stringify(items));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export async function validateCart(items: CartItem[], couponCode = "", paymentMethod = "") {
  const response = await fetch("/api/cart/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map(item => ({ id: item.productId || item.id, variation: item.variation, quantity: item.quantity })), couponCode, paymentMethod }) });
  const result = await response.json() as { ok: boolean; error?: string; items?: Array<{ itemKey: string; name: string; category: string; variation: string; unitPrice: number; quantity: number }>; totals?: ValidatedTotals };
  if (!response.ok || !result.ok || !result.items || !result.totals) throw new Error(result.error || "Your cart could not be validated.");
  return { items: result.items.map(item => {
    const productId = item.category === "Ready Theme" ? `theme-${item.itemKey}` : item.itemKey;
    return { id: `${productId}-${item.variation}`, productId, name: item.name, category: item.category, variation: item.variation, price: item.unitPrice, quantity: item.quantity };
  }), totals: result.totals };
}
