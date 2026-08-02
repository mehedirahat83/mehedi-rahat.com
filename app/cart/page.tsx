"use client";

import { useEffect, useMemo, useState } from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";
import { loadCart, saveCart, validateCart, type CartItem } from "../cartStore";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    const stored = loadCart();
    if (!stored.length) { setLoading(false); return; }
    void validateCart(stored).then(result => { setItems(result.items); saveCart(result.items); }).catch(reason => setError(reason instanceof Error ? reason.message : "Your cart could not be validated.")).finally(() => setLoading(false));
  }, []);

  function save(next: CartItem[]) { setItems(next); saveCart(next); }
  function changeQuantity(id: string, amount: number) { save(items.map(item => item.id === id ? { ...item, quantity: Math.min(10, Math.max(1, item.quantity + amount)) } : item)); }
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;

  function applyCoupon() {
    const valid = couponCode.trim().toUpperCase() === "MR10";
    setCouponApplied(valid);
    setCouponMessage(valid ? "Coupon applied — you saved 10%." : "This coupon code is not valid.");
    if (valid) localStorage.setItem("mr-coupon", JSON.stringify({ code: "MR10" })); else localStorage.removeItem("mr-coupon");
  }

  return <main>
    <MainHeader />
    <section className="cart-hero"><div className="shell"><span className="eyebrow">Your cart</span><h1>Review your products <em>before checkout.</em></h1><p>Prices and availability are securely confirmed from our live catalog.</p></div></section>
    <section className="section cart-section"><div className="shell">
      {loading ? <div className="empty-cart"><h2>Validating your cart…</h2><p>Please wait while we confirm current prices and availability.</p></div> : error ? <div className="empty-cart"><h2>Your cart needs attention.</h2><p>{error}</p><button className="button primary" onClick={() => { save([]); setError(""); }}>Clear cart</button></div> : items.length ? <div className="cart-layout">
        <div className="cart-products"><div className="cart-list-heading"><h2>Cart items</h2><span>{count} {count === 1 ? "item" : "items"}</span></div>
          {items.map(item => <article className="cart-item" key={item.id}><div className="cart-product-art">{item.name.charAt(0)}</div><div className="cart-item-copy"><span>{item.category}</span><h3>{item.name}</h3><small>{item.variation}</small></div><div className="cart-quantity" aria-label={`${item.name} quantity`}><button onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)}>+</button></div><div className="cart-item-price"><strong>৳ {(item.price * item.quantity).toLocaleString("en-US")}</strong><small>৳ {item.price.toLocaleString("en-US")} each</small></div><button className="cart-remove" onClick={() => save(items.filter(entry => entry.id !== item.id))}>Remove</button></article>)}
          <a className="continue-shopping" href="/products">← Continue shopping</a>
        </div>
        <aside className="cart-summary"><span className="eyebrow">Order summary</span><div className="summary-row"><span>Subtotal</span><b>৳ {subtotal.toLocaleString("en-US")}</b></div><div className="summary-row"><span>Membership discount</span><b>৳ 0</b></div><div className="cart-coupon"><label htmlFor="coupon-code">Have a coupon?</label><div><input id="coupon-code" value={couponCode} onChange={event => { setCouponCode(event.target.value); setCouponMessage(""); }} placeholder="Enter coupon code"/><button onClick={applyCoupon}>Apply</button></div>{couponMessage && <p className={couponApplied ? "success" : "error"}>{couponMessage}</p>}</div>{couponApplied && <div className="summary-row coupon-saving"><span>Coupon discount</span><b>− ৳ {discount.toLocaleString("en-US")}</b></div>}<div className="summary-total"><span>Total</span><strong>৳ {(subtotal - discount).toLocaleString("en-US")}</strong></div><a className="checkout-button" href="/checkout">Proceed to Checkout <span>↗</span></a><p className="cart-secure">✓ Server-validated pricing · Secure checkout</p></aside>
      </div> : <div className="empty-cart"><span>0</span><h2>Your cart is empty.</h2><p>Explore our products and choose the right tools for your website.</p><a className="button primary" href="/products">Browse products ↗</a></div>}
    </div></section><SiteFooter />
  </main>;
}
