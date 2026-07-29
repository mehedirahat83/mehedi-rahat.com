"use client";

import { useEffect, useState } from "react";
import SiteFooter from "../SiteFooter";

type Order = { number: string; status: string; customer: { name: string }; payment: string; total: number };

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
          <span className="order-status-badge">{order?.status || "Payment Verification"}</span>
          <div className="success-details">
            <div><span>Order number</span><b>{order?.number || "Pending"}</b></div>
            <div><span>Total</span><b>৳ {(order?.total || 0).toLocaleString("en-US")}</b></div>
            <div><span>Payment</span><b>{order?.payment || "Pending"}</b></div>
          </div>
          <div className="success-actions"><a className="button primary" href="/products">Continue shopping</a><a className="button secondary" href="/">Back to home</a></div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
