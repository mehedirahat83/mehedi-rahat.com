"use client";

export type StoredOrderItem = {
  id?: string;
  name?: string;
  price?: number;
  quantity?: number;
  variation?: string;
  image?: string;
};

export type StoredOrder = {
  number: string;
  receiptToken?: string;
  status: string;
  createdAt?: string;
  total?: number;
  payment?: string;
  items?: StoredOrderItem[];
  [key: string]: unknown;
};

const ORDERS_KEY = "mr-orders";
const LAST_ORDER_KEY = "mr-last-order";
export const ORDER_UPDATED_EVENT = "mr-orders-updated";

function parseValue(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function asOrders(value: unknown): StoredOrder[] {
  if (Array.isArray(value)) return value as StoredOrder[];
  if (value && typeof value === "object" && "number" in value) {
    return [value as StoredOrder];
  }
  return [];
}

export function loadOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];

  const sources = [
    ...asOrders(parseValue(localStorage.getItem(ORDERS_KEY))),
    ...asOrders(parseValue(localStorage.getItem("mr-order-history"))),
    ...asOrders(parseValue(localStorage.getItem(LAST_ORDER_KEY))),
  ];

  const unique = new Map<string, StoredOrder>();
  sources.forEach((order) => {
    if (!order?.number) return;
    const previous = unique.get(order.number);
    unique.set(order.number, previous ? { ...previous, ...order } : order);
  });

  return [...unique.values()];
}

export function saveOrder(order: StoredOrder) {
  if (typeof window === "undefined") return;

  const orders = loadOrders();
  const index = orders.findIndex((item) => item.number === order.number);
  if (index >= 0) orders[index] = { ...orders[index], ...order };
  else orders.unshift(order);

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}

export function updateStoredOrderStatus(number: string, status: string) {
  if (typeof window === "undefined") return;

  const orders = loadOrders().map((order) =>
    order.number === number ? { ...order, status } : order,
  );
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  const lastOrder = asOrders(parseValue(localStorage.getItem(LAST_ORDER_KEY)))[0];
  if (lastOrder?.number === number) {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ ...lastOrder, status }));
  }

  window.dispatchEvent(new Event(ORDER_UPDATED_EVENT));
}

export function completedProductSales(productName: string, productIds: string[] = []): number {
  const normalizedName = productName.trim().toLowerCase();

  return loadOrders()
    .filter((order) => order.status?.trim().toLowerCase() === "completed")
    .reduce((total, order) => {
      const quantity = (order.items ?? []).reduce((itemTotal, item) => {
        const matchesName = item.name?.trim().toLowerCase() === normalizedName;
        const matchesId = Boolean(item.id && productIds.includes(item.id));
        if (!matchesName && !matchesId) return itemTotal;
        return itemTotal + Math.max(1, Number(item.quantity) || 1);
      }, 0);
      return total + quantity;
    }, 0);
}
