"use client";

import { useEffect, useState } from "react";
import SiteFooter from "../../SiteFooter";

const variations = [
  { label: "01 Site", price: 300 },
  { label: "05 Sites", price: 450 },
  { label: "10 Sites", price: 600 },
  { label: "50 Sites", price: 900 },
  { label: "100 Sites", price: 1200 },
];

const productData = {
  name: "Elementor Pro",
  category: "Page Builder",
  information: [
    { label: "Official Tool", value: "Yes" },
    { label: "Activation Process", value: "We will activate it" },
    { label: "Auto Update", value: "One Year" },
    { label: "Delivery", value: "30 Minutes Max" },
    { label: "Pro Templates", value: "Included" },
    { label: "Pro Features", value: "Included" },
  ],
};

const related = [
  ["Crocoblock", "C", "৳ 600"],
  ["Astra Pro Essential", "A", "৳ 600"],
  ["Rank Math Pro", "R", "৳ 500"],
  ["WP Rocket", "W", "৳ 400"],
  ["Tutor LMS Pro", "T", "৳ 500"],
  ["Fluent Forms Pro", "F", "৳ 450"],
  ["CartFlows Pro", "C", "৳ 500"],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ElementorProPage() {
  const [selected, setSelected] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("mr-cart") || "[]") as { quantity: number }[];
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
  }, []);

  function addToCart() {
    const variation = variations[selected];
    const cart = JSON.parse(localStorage.getItem("mr-cart") || "[]") as Array<{ id: string; name: string; category: string; variation: string; price: number; quantity: number }>;
    const id = `elementor-pro-${variation.label.toLowerCase().replaceAll(" ", "-")}`;
    const existing = cart.find((item) => item.id === id);
    if (existing) existing.quantity += 1;
    else cart.push({ id, name: productData.name, category: productData.category, variation: variation.label, price: variation.price, quantity: 1 });
    localStorage.setItem("mr-cart", JSON.stringify(cart));
    setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    window.location.assign("/cart");
  }

  return (
    <main>
      <div className="topbar"><div className="shell topbar-inner"><p>Trusted digital products &amp; web solutions</p><div><span>Support: 10AM–10PM</span><a href="/#membership">Membership benefits</a></div></div></div>
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="/"><span className="brand-mark">MR</span><span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span></a>
          <nav className="desktop-nav"><a href="/">Home</a><a href="/#services">Services</a><a href="/themes">Ready Themes</a><a className="active-nav" href="/products">Products</a><a href="/#projects">Projects</a><a href="#support">Support</a></nav>
          <div className="nav-actions"><a className="icon-button nav-search" href="/products">⌕</a><a className="account-link" href="/account">My Account</a><a className="cart-button" href="/cart"><span>Cart</span><b>{cartCount}</b></a></div>
          <details className="mobile-menu"><summary>☰</summary><nav><a href="/">Home</a><a href="/products">Products</a><a href="#support">Support</a></nav></details>
        </div>
      </header>

      <div className="product-breadcrumb"><div className="shell"><a href="/">Home</a><span>›</span><a href="/products">Products</a><span>›</span><b>Elementor Pro</b></div></div>

      <section className="section product-detail-section">
        <div className="shell product-detail-grid">
          <div className="detail-media-card">
            <div className="detail-art"><span className="detail-license">One year</span><div className="detail-logo">E</div><b>ELEMENTOR</b><small>PRO</small></div>
            <div className="detail-quick-links"><a className="detail-demo" href="#live-demo">Live Demo <Arrow /></a><a href="#faq">FAQ</a></div>
            <a className="detail-resell-link" href="#resell">Resell Our Tools <Arrow /></a>
          </div>

          <div className="detail-purchase-card">
            <span className="product-category">{productData.category}</span>
            <h1>{productData.name}</h1>
            <div className="detail-rating"><span>★★★★★</span><small>4.9 · 47 customer reviews</small></div>
            <div className="detail-facts">
              {productData.information.map(({ label, value }) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
            </div>
            <div className="detail-variation">
              <label>Choose site variation</label>
              <div>{variations.map((variation, index) => <button className={selected === index ? "active" : ""} key={variation.label} onClick={() => { setSelected(index); setAdded(false); }}>{variation.label}</button>)}</div>
            </div>
            <div className="detail-buy-row"><div><small>Your price</small><strong>৳ {variations[selected].price.toLocaleString("en-US")}</strong></div><button className={added ? "added" : ""} onClick={addToCart}>{added ? "Added to Cart ✓" : "Add to Cart"}</button></div>
            <p className="detail-safe-note">✓ Secure local payment &nbsp; · &nbsp; Fast assisted activation</p>
          </div>

          <aside className="related-tools-card">
            <div className="related-heading"><span className="eyebrow">More tools</span><h2>You may also need.</h2></div>
            <div className="related-list">
              {related.map(([name, letter, price], index) => <a href="/products" key={name}><span className={`related-icon related-icon-${index + 1}`}>{letter}</span><div><b>{name}</b><small>From {price}</small></div><Arrow /></a>)}
            </div>
            <a className="related-all" href="/products">View all products <Arrow /></a>
          </aside>
        </div>

        <div className="shell product-policy-note">
          <span className="policy-icon" aria-hidden="true">i</span>
          <div>
            <span className="policy-label">Please read before ordering</span>
            <b>Important activation information</b>
            <p>Our all premium tools license are 100% official. We don’t provide any gpl, null or crack tools. Also we don’t provide license key. We will active our license to your site. <strong>Need your Temp Login access or WP admin pass for activation.</strong> If you dont want to share admin pass please dont place order.</p>
          </div>
        </div>
      </section>

      <section className="section product-content-section">
        <div className="shell product-content-grid">
          <article className="product-description-card">
            <span className="eyebrow">Product description</span>
            <h2>Build complete WordPress websites with Elementor Pro.</h2>
            <p>Elementor Pro gives you a complete visual website-building experience for WordPress. Create responsive pages, headers, footers, templates, forms and dynamic layouts without writing code.</p>
            <p>This assisted activation package is suitable for business websites, landing pages, online stores, LMS websites and client projects. Select the number of sites you need before adding the product to your cart.</p>
            <div className="description-points">
              <span>Advanced Pro widgets</span><span>Theme Builder</span><span>Form Builder</span><span>WooCommerce Builder</span><span>Popup Builder</span><span>Premium templates</span>
            </div>
          </article>
          <aside className="product-review-card" id="reviews">
            <span className="eyebrow">Customer reviews</span>
            <div className="review-overview"><strong>4.9</strong><div><span>★★★★★</span><small>Based on 47 reviews</small></div></div>
            <div className="review-list">
              <blockquote><span>★★★★★</span><p>Activation was completed quickly and everything worked as expected.</p><footer><b>Rahim Ahmed</b><small>Verified purchase</small></footer></blockquote>
              <blockquote><span>★★★★★</span><p>Clear instructions and helpful support. The process was very easy.</p><footer><b>Shakil Hasan</b><small>Verified purchase</small></footer></blockquote>
              <blockquote><span>★★★★★</span><p>The activation was fast and the Pro features are working perfectly on my website.</p><footer><b>Mahmudul Islam</b><small>Verified purchase</small></footer></blockquote>
              <blockquote><span>★★★★★</span><p>Good value for the price. I received clear support throughout the entire process.</p><footer><b>Nafisa Rahman</b><small>Verified purchase</small></footer></blockquote>
              <blockquote><span>★★★★★</span><p>A smooth experience from order to activation. I would purchase again.</p><footer><b>Tanvir Hossain</b><small>Verified purchase</small></footer></blockquote>
            </div>
            <button className="review-button" type="button">Write a review</button>
          </aside>
        </div>
      </section>

      <section className="section product-benefits">
        <div className="shell">
          <div className="section-heading"><div><span className="eyebrow">What you receive</span><h2>Everything needed to start <em>building professionally.</em></h2></div></div>
          <div className="benefit-grid">
            {[["01","Complete Pro features","Use advanced widgets, forms, theme building and professional design controls."],["02","Premium templates","Access professionally designed templates and reusable website sections."],["03","Guided activation","Get clear instructions and direct assistance throughout the activation process."],["04","Reliable support","Receive practical support when you need help with access or activation."]].map(([number,title,text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section product-faq-section" id="faq">
        <div className="shell product-faq-grid">
          <div><span className="eyebrow">Product FAQ</span><h2>Answers before you purchase.</h2><p>Clear information about activation, updates, access and support.</p></div>
          <div className="product-faq-list">
            <details open><summary>Will I receive a license key?<span>+</span></summary><p>No. This package includes assisted activation using our licensed access. The activation method is clearly shown before checkout.</p></details>
            <details><summary>How quickly will it be activated?<span>+</span></summary><p>Most activations are completed within 30 minutes during regular support hours.</p></details>
            <details><summary>Will I receive updates?<span>+</span></summary><p>Update coverage follows the period shown on the product card and your order details.</p></details>
            <details><summary>What happens if I rebuild my website?<span>+</span></summary><p>Contact support with your order information. Reactivation eligibility depends on the purchased site variation and support period.</p></details>
          </div>
        </div>
      </section>

      <section className="section product-resell-section" id="resell">
        <div className="shell product-resell-panel"><div><span className="eyebrow">Resell our tools</span><h2>Offer trusted tools to your own clients.</h2><p>Choose reseller-friendly packages for agencies, freelancers and website service providers.</p></div><a className="button primary" href="#support">Discuss reseller access <Arrow /></a></div>
      </section>

      <SiteFooter /><footer className="legacy-footer" aria-hidden="true">
        <div className="shell premium-footer-grid">
          <div className="footer-contact"><div className="contact-phone"><span className="contact-symbol">◉</span><div><a href="tel:+8801977024868">01977 02 48 68</a><small>10:00 am to 11:59 pm (everyday)</small></div></div><a className="contact-line" href="#location"><span>◆</span>Bashundhara r/a, Dhaka</a><a className="contact-line" href="mailto:contact@mehedirahat.com"><span>✉</span>contact@mehedirahat.com</a><div className="social-links"><a href="#facebook">f</a><a href="#linkedin">in</a><a href="#x">X</a><a href="#whatsapp">w</a><a href="#youtube">▶</a></div><a className="resell-link" href="#resell">Resell our tools <Arrow /></a></div>
          <div className="footer-menu"><h3>Services</h3><a href="/#services">Web Design &amp; Development</a><a href="/#services">Search Engine Optimization</a><a href="/#services">Web Speed Optimization</a><a href="/#services">WordPress Bug Fixing</a><a href="/#services">Website Maintenance</a></div>
          <div className="footer-menu"><h3>Ready Themes</h3><a href="/#ready-themes">Newspaper Themes</a><a href="/#ready-themes">Landing Pages</a><a href="/#ready-themes">eCommerce Themes</a><a href="/#ready-themes">Directory &amp; Listing</a><a href="/#ready-themes">Hospital &amp; Clinics</a></div>
          <div className="footer-menu"><h3>Pro tools</h3><a href="/products">WordPress Themes</a><a href="/products">WordPress Plugins</a><a href="/products">Elementor Addons</a><a href="/products">Page Builders</a><a href="/products">Form Builders</a></div>
        </div>
      </footer>
    </main>
  );
}
