"use client";

import { useEffect, useMemo, useState } from "react";
import SiteFooter from "../SiteFooter";

type CartItem = {
  id: string;
  name: string;
  category: string;
  variation: string;
  price: number;
  quantity: number;
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("mr-cart") || "[]"));
    setLoaded(true);
  }, []);

  function save(nextItems: CartItem[]) {
    setItems(nextItems);
    localStorage.setItem("mr-cart", JSON.stringify(nextItems));
  }

  function changeQuantity(id: string, amount: number) {
    save(items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  }

  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items]);
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - couponDiscount;

  function applyCoupon() {
    if (couponCode.trim().toUpperCase() === "MR10") {
      setCouponApplied(true);
      setCouponMessage("Coupon applied — you saved 10%.");
      localStorage.setItem("mr-coupon", JSON.stringify({ code: "MR10", rate: 0.1 }));
    } else {
      setCouponApplied(false);
      setCouponMessage("This coupon code is not valid.");
      localStorage.removeItem("mr-coupon");
    }
  }

  return (
    <main>
      <div className="topbar"><div className="shell topbar-inner"><p>Trusted digital products &amp; web solutions</p><div><span>Support: 10AM–10PM</span><a href="/#membership">Membership benefits</a></div></div></div>
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="/"><span className="brand-mark">MR</span><span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span></a>
          <nav className="desktop-nav"><a href="/">Home</a><a href="/#services">Services</a><a href="/themes">Ready Themes</a><a href="/products">Products</a><a href="/#projects">Projects</a><a href="#support">Support</a></nav>
          <div className="nav-actions"><a className="icon-button nav-search" href="/products">⌕</a><a className="account-link" href="/account">My Account</a><a className="cart-button" href="/cart"><span>Cart</span><b>{count}</b></a></div>
          <details className="mobile-menu"><summary>☰</summary><nav><a href="/">Home</a><a href="/products">Products</a><a href="/cart">Cart</a></nav></details>
        </div>
      </header>

      <section className="cart-hero">
        <div className="shell"><span className="eyebrow">Your cart</span><h1>Review your products <em>before checkout.</em></h1><p>Confirm each product, site variation and quantity before continuing.</p></div>
      </section>

      <section className="section cart-section">
        <div className="shell">
          {!loaded ? null : items.length ? (
            <div className="cart-layout">
              <div className="cart-products">
                <div className="cart-list-heading"><h2>Cart items</h2><span>{count} {count === 1 ? "item" : "items"}</span></div>
                {items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="cart-product-art">E</div>
                    <div className="cart-item-copy"><span>{item.category}</span><h3>{item.name}</h3><small>{item.variation} · One year</small></div>
                    <div className="cart-quantity" aria-label={`${item.name} quantity`}><button onClick={() => changeQuantity(item.id, -1)}>−</button><b>{item.quantity}</b><button onClick={() => changeQuantity(item.id, 1)}>+</button></div>
                    <div className="cart-item-price"><strong>৳ {(item.price * item.quantity).toLocaleString("en-US")}</strong><small>৳ {item.price.toLocaleString("en-US")} each</small></div>
                    <button className="cart-remove" onClick={() => save(items.filter((entry) => entry.id !== item.id))}>Remove</button>
                  </article>
                ))}
                <a className="continue-shopping" href="/products">← Continue shopping</a>
              </div>

              <aside className="cart-summary">
                <span className="eyebrow">Order summary</span>
                <div className="summary-row"><span>Subtotal</span><b>৳ {subtotal.toLocaleString("en-US")}</b></div>
                <div className="summary-row"><span>Membership discount</span><b>৳ 0</b></div>
                <div className="cart-coupon">
                  <label htmlFor="coupon-code">Have a coupon?</label>
                  <div><input id="coupon-code" value={couponCode} onChange={(event) => { setCouponCode(event.target.value); setCouponMessage(""); }} placeholder="Enter coupon code" /><button onClick={applyCoupon}>Apply</button></div>
                  {couponMessage && <p className={couponApplied ? "success" : "error"}>{couponMessage}</p>}
                </div>
                {couponApplied && <div className="summary-row coupon-saving"><span>Coupon discount</span><b>− ৳ {couponDiscount.toLocaleString("en-US")}</b></div>}
                <div className="membership-preview"><span>Silver member</span><p>Spend ৳ {(10000 - Math.min(subtotal, 10000)).toLocaleString("en-US")} more to unlock Gold and 10% discount.</p><i><b style={{ width: `${Math.min(subtotal / 100, 100)}%` }} /></i></div>
                <div className="summary-total"><span>Total</span><strong>৳ {total.toLocaleString("en-US")}</strong></div>
                <a className="checkout-button" href="/checkout">Proceed to Checkout <Arrow /></a>
                <p className="cart-secure">✓ Secure local payment &nbsp; · &nbsp; Direct support</p>
              </aside>
            </div>
          ) : (
            <div className="empty-cart">
              <span>0</span><h2>Your cart is empty.</h2><p>Explore our products and choose the right tools for your website.</p><a className="button primary" href="/products">Browse products <Arrow /></a>
            </div>
          )}
        </div>
      </section>

      <SiteFooter /><footer className="legacy-footer" aria-hidden="true">
        <div className="shell premium-footer-grid">
          <div className="footer-contact"><div className="contact-phone"><span className="contact-symbol">◉</span><div><a href="tel:+8801977024868">01977 02 48 68</a><small>10:00 am to 11:59 pm (everyday)</small></div></div><a className="contact-line" href="#location"><span>◆</span>Bashundhara r/a, Dhaka</a><a className="contact-line" href="mailto:contact@mehedirahat.com"><span>✉</span>contact@mehedirahat.com</a></div>
          <div className="footer-menu"><h3>Services</h3><a href="/#services">Web Development</a><a href="/#services">SEO</a><a href="/#services">Speed Optimization</a></div>
          <div className="footer-menu"><h3>Ready Themes</h3><a href="/#ready-themes">Business Themes</a><a href="/#ready-themes">eCommerce Themes</a><a href="/#ready-themes">Landing Pages</a></div>
          <div className="footer-menu"><h3>Pro tools</h3><a href="/products">WordPress Plugins</a><a href="/products">Page Builders</a><a href="/products">Form Builders</a></div>
        </div>
      </footer>
    </main>
  );
}
