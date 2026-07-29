"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import SiteFooter from "../SiteFooter";
import MainHeader from "../MainHeader";
import { saveOrder } from "../orderStore";

type CartItem = { id: string; name: string; category: string; variation: string; price: number; quantity: number };

const payments = [
  { id: "bkash", name: "bKash", group: "Mobile Banking", account: "01977024868", accountName: "Mehedi Hassan Rahat", accountType: "Personal", chargeRate: 0.0185, color: "#d81b60" },
  { id: "nagad", name: "Nagad", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", chargeRate: 0, color: "#ee5a24" },
  { id: "rocket", name: "Rocket", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", chargeRate: 0, color: "#7b2d8e" },
  { id: "upay", name: "Upay", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", chargeRate: 0, color: "#f3bb21" },
  { id: "pocket", name: "Pocket", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", chargeRate: 0, color: "#526b2d" },
  { id: "city-bank", name: "City Bank", group: "Bank Transfer", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Bank Account", chargeRate: 0, color: "#d72a32" },
  { id: "bank-asia", name: "Bank Asia", group: "Bank Transfer", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Bank Account", chargeRate: 0, color: "#245eaa" },
];

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponRate, setCouponRate] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [payment, setPayment] = useState("bkash");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("mr-cart") || "[]"));
    const coupon = JSON.parse(localStorage.getItem("mr-coupon") || "null") as { code: string; rate: number } | null;
    if (coupon) { setCouponRate(coupon.rate); setCouponCode(coupon.code); }
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const discount = Math.round(subtotal * couponRate);
  const selectedPayment = payments.find((method) => method.id === payment) || payments[0];
  const paymentCharge = Math.round((subtotal - discount) * selectedPayment.chargeRate);
  const total = subtotal - discount + paymentCharge;
  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) { setError("Your cart is empty."); return; }
    if (!accepted) { setError("Please accept the terms and activation policy."); return; }
    const form = new FormData(event.currentTarget);
    const transactionId = String(form.get("transactionId") ?? "").trim();
    const orderReference = transactionId
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(-8)
      .padStart(8, "0");
    const order = {
      number: `MR-${orderReference}`,
      status: "Payment Verification",
      createdAt: new Date().toISOString(),
      customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone") },
      items, payment, subtotal, discount, paymentCharge, total, senderNumber: form.get("senderNumber"), transactionId,
    };
    saveOrder(order);
    localStorage.removeItem("mr-cart");
    localStorage.removeItem("mr-coupon");
    window.location.assign("/order-success");
  }

  return (
    <main>
      <MainHeader/>

      <section className="checkout-hero"><div className="shell"><span className="eyebrow">Secure checkout</span><h1>Complete your <em>order.</em></h1><p>Your order details and payment information are reviewed before confirmation.</p></div></section>

      <section className="section checkout-section">
        <form className="shell checkout-layout" onSubmit={placeOrder}>
          <div className="checkout-main">
            <section className="checkout-card">
              <div className="checkout-card-heading"><span>01</span><div><h2>Customer information</h2><p>We’ll use these details for your order and activation support.</p></div></div>
              <div className="checkout-fields">
                <label className="full-field"><span>Full name *</span><input name="name" required placeholder="Your full name" /></label>
                <label><span>Email address *</span><input name="email" type="email" required placeholder="you@example.com" /></label>
                <label><span>Phone number *</span><input name="phone" required placeholder="01XXXXXXXXX" /></label>
                <label className="full-field"><span>Order notes (optional)</span><textarea name="notes" placeholder="Any information we should know before activation?" /></label>
              </div>
            </section>

            <section className="checkout-card">
              <div className="checkout-card-heading"><span>02</span><div><h2>Payment method</h2><p>Select how you would like to complete your payment.</p></div></div>
              <div className="payment-group">
                <div className="payment-group-title"><b>Mobile Banking</b><span>5 methods</span></div>
                <div className="payment-method-grid">
                  {payments.filter((method) => method.group === "Mobile Banking").map((method) => <label className={payment === method.id ? "active" : ""} key={method.id}><input type="radio" name="payment" value={method.id} checked={payment === method.id} onChange={() => { setPayment(method.id); setCopied(false); }} /><span style={{ background: method.color }}>{method.name.slice(0, 1)}</span><b>{method.name}</b><i /></label>)}
                </div>
              </div>
              <div className="payment-group">
                <div className="payment-group-title"><b>Bank Transfer</b><span>2 methods</span></div>
                <div className="payment-method-grid bank-method-grid">
                  {payments.filter((method) => method.group === "Bank Transfer").map((method) => <label className={payment === method.id ? "active" : ""} key={method.id}><input type="radio" name="payment" value={method.id} checked={payment === method.id} onChange={() => { setPayment(method.id); setCopied(false); }} /><span style={{ background: method.color }}>{method.name.slice(0, 1)}</span><b>{method.name}</b><i /></label>)}
                </div>
              </div>

              <div className="manual-payment-panel">
                <div className="manual-panel-heading"><span>✓</span><div><small>Secure manual checkout</small><h3>Pay with {selectedPayment.name}</h3></div><b>Secure &amp; Verified</b></div>
                <div className="payment-account-grid">
                  <div className="payment-qr-placeholder"><b>QR</b><span>{selectedPayment.account === "Configure in Admin" ? "Add QR in Admin" : "Scan to pay"}</span></div>
                  <div className="payment-account-details">
                    <small>Send money number</small>
                    <div className="account-number"><strong>{selectedPayment.account}</strong><button disabled={selectedPayment.account === "Configure in Admin"} onClick={() => { navigator.clipboard.writeText(selectedPayment.account); setCopied(true); }} type="button">{copied ? "Copied" : "Copy"}</button></div>
                    <div className="account-meta"><span><small>Account name</small><b>{selectedPayment.accountName}</b></span><span><small>Account type</small><b>{selectedPayment.accountType}</b></span></div>
                  </div>
                </div>
                <div className="payment-steps"><div><b>1</b><span>Open {selectedPayment.name} app</span></div><div><b>2</b><span>Select Send Money</span></div><div><b>3</b><span>Send exact total</span></div><div><b>4</b><span>Use your mobile number</span></div><div><b>5</b><span>Copy Transaction ID</span></div><div><b>6</b><span>Place your order</span></div></div>
                <div className="payment-submit-fields"><div className="payment-fields-heading"><b>Submit payment details</b><small>Use the same information shown in your payment confirmation.</small></div><div><label><span>Sender mobile number *</span><input name="senderNumber" required placeholder="01XXXXXXXXX" /></label><label><span>Transaction ID / Reference *</span><input name="transactionId" required placeholder="Enter transaction reference" /></label></div></div>
                <p className="manual-verify-note">✓ Payment details are verified manually. Order processing starts only after verification.</p>
              </div>
            </section>
          </div>

          <aside className="checkout-summary">
            <span className="eyebrow">Your order</span>
            <div className="checkout-items">{items.map((item) => <article key={item.id}><span>E</span><div><b>{item.name}</b><small>{item.variation} × {item.quantity}</small></div><strong>৳ {(item.price * item.quantity).toLocaleString("en-US")}</strong></article>)}</div>
            <div className="checkout-totals"><div><span>Subtotal</span><b>৳ {subtotal.toLocaleString("en-US")}</b></div><div><span>Membership discount</span><b>৳ 0</b></div>{couponRate > 0 && <div className="checkout-coupon-row"><span>Coupon ({couponCode})</span><b>− ৳ {discount.toLocaleString("en-US")}</b></div>}{paymentCharge > 0 && <div><span>Cash-out charge ({selectedPayment.name})</span><b>৳ {paymentCharge.toLocaleString("en-US")}</b></div>}<div className="checkout-grand-total"><span>Total</span><strong>৳ {total.toLocaleString("en-US")}</strong></div></div>
            <label className="terms-check"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setError(""); }} /><span>I agree to the Terms &amp; Conditions, Refund Policy and product activation requirements.</span></label>
            {error && <p className="checkout-error">{error}</p>}
            <button className="place-order-button" type="submit">Place Order <span>↗</span></button>
            <p className="checkout-secure-note">✓ Secure checkout · Your information is protected</p>
          </aside>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
