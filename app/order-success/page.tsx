"use client";

import { useEffect, useState } from "react";
import SiteFooter from "../SiteFooter";

type Order = { number: string; receiptToken?: string; status: string; customer: { name: string }; payment: string; total: number };

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => setOrder(JSON.parse(localStorage.getItem("mr-last-order") || "null")), []);

  return (
    <main>
      <section className="success-page">
        <div className="success-card">
          <span className="success-check">✓</span>
          <span className="eyebrow">Order received</span>
          <h1>Thank you{order?.customer.name ? `, ${order.customer.name}` : ""}.</h1>
          <p>Your order is now waiting for manual payment verification. It will become Completed after admin approval.</p>
          <span className="order-status-badge">{order?.status === "payment_verification" ? "Payment Verification" : order?.status || "Payment Verification"}</span>
          <div className="success-details">
            <div><span>Order number</span><b>{order?.number || "Pending"}</b></div>
            <div><span>Total</span><b>৳ {(order?.total || 0).toLocaleString("en-US")}</b></div>
            <div><span>Payment</span><b>{order?.payment || "Pending"}</b></div>
          </div>
          {order?.receiptToken && <div className="tracking-token"><span>Private tracking token</span><code>{order.receiptToken}</code><small>Save this token. It is required to securely view this order.</small></div>}
          <div className="success-actions"><a className="button primary" href="/order-tracking">Track this order</a><a className="button secondary" href="/products">Continue shopping</a></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
