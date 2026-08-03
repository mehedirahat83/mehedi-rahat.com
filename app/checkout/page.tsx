"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";
import { loadCart, saveCart, validateCart, type CartItem, type ValidatedTotals } from "../cartStore";
import { saveOrder, type StoredOrder } from "../orderStore";

const payments = [
  { id: "bkash", name: "bKash", group: "Mobile Banking", account: "01977024868", accountName: "Mehedi Hassan Rahat", accountType: "Personal", color: "#d81b60" },
  { id: "nagad", name: "Nagad", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", color: "#ee5a24" },
  { id: "rocket", name: "Rocket", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", color: "#7b2d8e" },
  { id: "upay", name: "Upay", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", color: "#f3bb21" },
  { id: "pocket", name: "Pocket", group: "Mobile Banking", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Personal", color: "#526b2d" },
  { id: "city-bank", name: "City Bank", group: "Bank Transfer", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Bank Account", color: "#d72a32" },
  { id: "bank-asia", name: "Bank Asia", group: "Bank Transfer", account: "Configure in Admin", accountName: "Mehedi Hassan Rahat", accountType: "Bank Account", color: "#245eaa" },
];

type CustomerProfile = { id: string; name: string; email: string; phone: string };

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<ValidatedTotals>({ subtotal: 0, discount: 0, paymentCharge: 0, total: 0, couponCode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [payment, setPayment] = useState("bkash");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [customerFields, setCustomerFields] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const cart = loadCart();
    let coupon = "";
    try { coupon = String(JSON.parse(localStorage.getItem("mr-coupon") || "null")?.code || ""); } catch {}
    setCouponCode(coupon);
    if (!cart.length) { setLoading(false); return; }
    void validateCart(cart, coupon, payment).then(result => { setItems(result.items); setTotals(result.totals); saveCart(result.items); }).catch(reason => setError(reason instanceof Error ? reason.message : "Checkout could not be loaded.")).finally(() => setLoading(false));
  }, [payment]);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/customer/session", { cache: "no-store", signal: controller.signal })
      .then(async response => response.ok ? response.json() as Promise<{ customer: CustomerProfile }> : null)
      .then(result => {
        if (!result?.customer) return;
        setCustomer(result.customer);
        setCustomerFields({ name: result.customer.name || "", email: result.customer.email || "", phone: result.customer.phone || "" });
      })
      .catch(error => { if (!(error instanceof DOMException && error.name === "AbortError")) return; });
    return () => controller.abort();
  }, []);

  const selectedPayment = useMemo(() => payments.find(method => method.id === payment) || payments[0], [payment]);

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!items.length) { setError("Your cart is empty."); return; }
    if (!accepted) { setError("Please accept the terms and activation policy."); return; }
    const form = new FormData(event.currentTarget);
    let idempotencyKey = sessionStorage.getItem("mr-checkout-key");
    if (!idempotencyKey) { idempotencyKey = crypto.randomUUID(); sessionStorage.setItem("mr-checkout-key", idempotencyKey); }
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer: { name: form.get("name"), email: form.get("email"), phone: form.get("phone") }, notes: form.get("notes"), activationInfo: { loginUrl: form.get("activationLoginUrl"), username: form.get("activationUsername"), password: form.get("activationPassword") }, items: items.map(item => ({ id: item.productId || item.id, variation: item.variation, quantity: item.quantity })), couponCode, paymentMethod: payment, senderNumber: form.get("senderNumber"), transactionId: form.get("transactionId"), idempotencyKey }) });
      const result = await response.json() as { ok: boolean; error?: string; order?: StoredOrder };
      if (!response.ok || !result.ok || !result.order) throw new Error(result.error || "The order could not be placed.");
      saveOrder(result.order); saveCart([]); localStorage.removeItem("mr-coupon"); sessionStorage.removeItem("mr-checkout-key"); window.location.assign("/order-success");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The order could not be placed."); setSubmitting(false); }
  }

  return <main><MainHeader />
    <section className="checkout-hero"><div className="shell"><span className="eyebrow">Secure checkout</span><h1>Complete your <em>order.</em></h1><p>Every price is verified by the server before your order is saved.</p></div></section>
    <section className="section checkout-section"><form className="shell checkout-layout" onSubmit={placeOrder}>
      <div className="checkout-main">
        <section className="checkout-card"><div className="checkout-card-heading"><span>01</span><div><h2>Customer information</h2><p>We’ll use these details for your order and activation support.</p>{customer && <small className="checkout-signed-in">✓ Signed in as <b>{customer.name}</b></small>}</div></div><div className="checkout-fields"><label className="full-field"><span>Full name *</span><input name="name" required minLength={2} maxLength={120} placeholder="Your full name" autoComplete="name" value={customerFields.name} onChange={event => setCustomerFields(fields => ({ ...fields, name: event.target.value }))}/></label><label><span>Email address *</span><input name="email" type="email" required maxLength={254} placeholder="you@example.com" autoComplete="email" value={customerFields.email} onChange={event => setCustomerFields(fields => ({ ...fields, email: event.target.value }))}/></label><label><span>Phone number *</span><input name="phone" required minLength={8} maxLength={30} placeholder="01XXXXXXXXX" autoComplete="tel" value={customerFields.phone} onChange={event => setCustomerFields(fields => ({ ...fields, phone: event.target.value }))}/></label><label className="full-field"><span>Order notes (optional)</span><textarea name="notes" maxLength={2000} placeholder="Any information we should know before activation?"/></label></div></section>
        <section className="checkout-card activation-info-card"><div className="checkout-card-heading"><span>02</span><div><h2>Activation Info</h2><p>Optional — provide website access only if you want us to handle activation.</p></div></div><div className="checkout-fields"><label className="full-field"><span>Website login link (optional)</span><input name="activationLoginUrl" type="url" inputMode="url" maxLength={500} placeholder="https://example.com/wp-admin" autoComplete="url"/></label><label><span>Username (optional)</span><input name="activationUsername" maxLength={254} placeholder="Website username" autoComplete="off"/></label><label><span>Password (optional)</span><input name="activationPassword" type="password" maxLength={500} placeholder="Website password" autoComplete="new-password"/></label></div><p className="activation-security-note">🔒 Password is encrypted and only visible to authorized administrators.</p></section>
        <section className="checkout-card"><div className="checkout-card-heading"><span>03</span><div><h2>Payment method</h2><p>Select how you would like to complete your payment.</p></div></div>
          {["Mobile Banking", "Bank Transfer"].map(group => <div className="payment-group" key={group}><div className="payment-group-title"><b>{group}</b><span>{payments.filter(method => method.group === group).length} methods</span></div><div className={`payment-method-grid ${group === "Bank Transfer" ? "bank-method-grid" : ""}`}>{payments.filter(method => method.group === group).map(method => { const available = method.account !== "Configure in Admin"; return <label className={`${payment === method.id ? "active" : ""} ${available ? "" : "unavailable"}`} key={method.id}><input type="radio" name="payment" value={method.id} checked={payment === method.id} disabled={!available} onChange={() => { setPayment(method.id); setCopied(false); }}/><span style={{ background: method.color }}>{method.name.charAt(0)}</span><b>{method.name}{available ? "" : " (Coming soon)"}</b><i/></label>; })}</div></div>)}
          <div className="manual-payment-panel"><div className="manual-panel-heading"><span>✓</span><div><small>Secure manual checkout</small><h3>Pay with {selectedPayment.name}</h3></div><b>Secure &amp; Verified</b></div><div className="payment-account-grid"><div className="payment-qr-placeholder"><b>QR</b><span>{selectedPayment.account === "Configure in Admin" ? "Add QR in Admin" : "Scan to pay"}</span></div><div className="payment-account-details"><small>Send money number</small><div className="account-number"><strong>{selectedPayment.account}</strong><button disabled={selectedPayment.account === "Configure in Admin"} onClick={() => { void navigator.clipboard.writeText(selectedPayment.account); setCopied(true); }} type="button">{copied ? "Copied" : "Copy"}</button></div><div className="account-meta"><span><small>Account name</small><b>{selectedPayment.accountName}</b></span><span><small>Account type</small><b>{selectedPayment.accountType}</b></span></div></div></div><div className="payment-submit-fields"><div className="payment-fields-heading"><b>Submit payment details</b><small>Use the same information shown in your payment confirmation.</small></div><div><label><span>Sender mobile number *</span><input name="senderNumber" required minLength={8} maxLength={30} placeholder="01XXXXXXXXX"/></label><label><span>Transaction ID / Reference *</span><input name="transactionId" required minLength={4} maxLength={120} placeholder="Enter transaction reference"/></label></div></div><p className="manual-verify-note">✓ Payment details are verified manually. Order processing starts after verification.</p></div>
        </section>
      </div>
      <aside className="checkout-summary"><span className="eyebrow">Your order</span>{loading ? <p>Validating prices…</p> : <div className="checkout-items">{items.map(item => <article key={item.id}><span>{item.name.charAt(0)}</span><div><b>{item.name}</b><small>{item.variation} × {item.quantity}</small></div><strong>৳ {(item.price * item.quantity).toLocaleString("en-US")}</strong></article>)}</div>}<div className="checkout-totals"><div><span>Subtotal</span><b>৳ {totals.subtotal.toLocaleString("en-US")}</b></div>{totals.discount > 0 && <div className="checkout-coupon-row"><span>Coupon ({totals.couponCode})</span><b>− ৳ {totals.discount.toLocaleString("en-US")}</b></div>}{totals.paymentCharge > 0 && <div><span>Payment charge ({selectedPayment.name})</span><b>৳ {totals.paymentCharge.toLocaleString("en-US")}</b></div>}<div className="checkout-grand-total"><span>Total</span><strong>৳ {totals.total.toLocaleString("en-US")}</strong></div></div><label className="terms-check"><input type="checkbox" checked={accepted} onChange={event => { setAccepted(event.target.checked); setError(""); }}/><span>I agree to the Terms &amp; Conditions, Refund Policy and product activation requirements.</span></label>{error && <p className="checkout-error">{error}</p>}<button className="place-order-button" type="submit" disabled={loading || submitting || !items.length}>{submitting ? "Placing order…" : "Place Order ↗"}</button><p className="checkout-secure-note">✓ Secure checkout · Server-validated total</p></aside>
    </form></section><SiteFooter /></main>;
}
