import type { Metadata } from "next";
import HomeServices from "./HomeServices";
import HomeProjects from "./HomeProjects";
import MainHeader from "./MainHeader";
import HomeReviews from "./HomeReviews";
import HomeHero from "./HomeHero";

export const metadata: Metadata = {
  title: "Mehedi Rahat — Digital Products & Web Solutions",
  description:
    "Trusted WordPress tools, ready websites and practical web solutions for growing businesses.",
};

const baseProducts = [
  ["Elementor Pro", "Page Builder", "৳ 300", "1–100 sites"],
  ["Crocoblock", "Dynamic Toolkit", "৳ 600", "1–10 sites"],
  ["Astra Pro Essential", "Theme Bundle", "৳ 600", "1–10 sites"],
  ["Rank Math Pro", "SEO Toolkit", "৳ 500", "1–10 sites"],
];

const products = [
  ...baseProducts.map((product, index) => [...product, index === 1 ? "One year" : "Lifetime"]),
  ["Tutor LMS Pro", "Learning Platform", "\u09F3 500", "1\u201310 sites", "Lifetime"],
  ["WP Rocket", "Speed Toolkit", "\u09F3 400", "1\u201310 sites", "One year"],
  ["Fluent Forms Pro", "Form Builder", "\u09F3 450", "1\u201310 sites", "Lifetime"],
  ["Essential Addons", "Elementor Addons", "\u09F3 350", "1\u2013100 sites", "Lifetime"],
  ["CartFlows Pro", "Sales Funnel", "\u09F3 500", "1\u201310 sites", "One year"],
  ["WP Social Ninja Pro", "Social Toolkit", "\u09F3 450", "1\u201310 sites", "Lifetime"],
];

const readyThemes = [
  ["Corporate Pro", "Business & Agency", "7 pages", "BDT 8,500"],
  ["Shop Essential", "eCommerce Store", "9 pages", "BDT 12,500"],
  ["Service Expert", "Professional Services", "6 pages", "BDT 7,500"],
];

const memberships = [
  ["Silver", "৳0", "0%"],
  ["Gold", "৳10K", "10%"],
  ["Diamond", "৳50K", "20%"],
  ["VIP", "৳100K", "30%"],
];

const trustPoints = [
  "Secure local payment",
  "Genuine digital products",
  "Fast license activation",
  "Direct expert support",
  "Instant account access",
  "Member-only discounts",
  "Clear setup guidance",
  "Reliable product updates",
];

const advantages = [
  ["Direct expert support", "You talk to the person responsible for the work, so decisions stay clear and fast."],
  ["Practical solutions", "Every recommendation is based on business value, usability and long-term maintenance."],
  ["Transparent delivery", "Clear scope, progress updates and straightforward pricing from start to finish."],
  ["Built for speed", "Lean code, optimized assets and careful engineering without unnecessary page-builder weight."],
];

const testimonials = [
  ["The whole process was simple and the final website feels much faster. Support was clear whenever we needed help.", "Arif Hossain", "Business Owner", "/client-arif-placeholder.webp"],
  ["I received the product and activation support quickly. The instructions were easy to follow and everything worked.", "Nusrat Jahan", "Digital Marketer", "/client-nusrat-placeholder.webp"],
  ["A dependable person for WordPress and web work. He understands the requirement before suggesting a solution.", "Tanvir Ahmed", "Agency Founder", "/client-tanvir-placeholder.webp"],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <MainHeader active="home" />
      <HomeHero />

      <section className="hero hero-static">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">15+ years of practical experience</span>
            <h1>
              <span className="hero-line">Modern websites</span>
              <span className="hero-line">and tools that <em>grow</em></span>
              <span className="hero-line"><em>your business.</em></span>
            </h1>
            <p><strong>Mehedi Rahat</strong> is the passionate full stack developer &amp; product designer having 15 years of experiences over 24+ country worldwide. Expert for LMS website, listing site, eCommerce, elementor business website, landing page &amp; many more.</p>
            <div className="hero-actions">
              <a className="button primary" href="#products">Explore Products <Arrow /></a>
              <a className="button secondary" href="#services">View Services</a>
            </div>
            <div className="trust-row">
              <span><b>3K+</b> Projects</span><span><b>2.8K+</b> Clients</span><span><b>4.9/5</b> Rating</span>
            </div>
          </div>
          <div className="hero-visual" aria-label="Mehedi Rahat digital solutions">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />
            <div className="hero-message-card">
              <span className="message-kicker">Complete digital growth partner</span>
              <h2>One expert.<br /><em>Three ways to grow.</em></h2>
              <div className="solution-list">
                <article><span>01</span><div><b>Custom Websites</b><small>Built around your exact business goals</small></div><i>↗</i></article>
                <article><span>02</span><div><b>Ready Websites</b><small>Professional websites with a faster launch</small></div><i>↗</i></article>
                <article><span>03</span><div><b>Premium Tools</b><small>Reliable products, licensing and support</small></div><i>↗</i></article>
              </div>
              <div className="message-proof"><span><b>15 years</b><small>Experience</small></span><span><b>24+ countries</b><small>Worldwide reach</small></span></div>
            </div>
            <div className="float-card float-member"><span>MR</span><p><small>Built personally by</small><b>Full-stack developer</b></p></div>
            <div className="float-card float-speed"><b>4.9/5</b><small>Client rating</small></div>
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="proof-fade proof-fade-left" />
        <div className="proof-track">
          {[0, 1].map((group) => (
            <div className="proof-group" key={group} aria-hidden={group === 1}>
              {trustPoints.map((point) => <span key={`${group}-${point}`}><i aria-hidden="true">✓</i>{point}</span>)}
            </div>
          ))}
        </div>
        <div className="proof-fade proof-fade-right" />
      </section>

      <HomeServices />

      <section className="section theme-section" id="ready-themes">
        <div className="shell">
          <div className="section-heading theme-heading">
            <div><span className="eyebrow light">Ready website themes</span><h2>Launch faster with a <em>complete, ready-made website.</em></h2></div>
            <div><p>Choose a professionally prepared layout, then customize its content, colors and essential features for your business.</p><a href="#all-themes">Explore all themes <Arrow /></a></div>
          </div>
          <div className="theme-grid">
            {readyThemes.map(([name, category, pages, price], index) => (
              <article className="theme-card" key={name}>
                <div className={`theme-browser theme-browser-${index + 1}`} aria-hidden="true">
                  <span className="theme-browser-bar"><i /><i /><i /><b /></span>
                  <div className="theme-browser-body">
                    <span className="theme-mini-nav"><b /><i /><i /><i /></span>
                    <span className="theme-mini-hero"><small /><b /><b /><i /></span>
                    <span className="theme-mini-cards"><i /><i /><i /></span>
                  </div>
                </div>
                <div className="theme-card-copy">
                  <span>{category}</span><h3>{name}</h3>
                  <div><small>{pages}</small><strong>{price}</strong></div>
                  <a href="#theme-details">View live demo <Arrow /></a>
                </div>
              </article>
            ))}
          </div>
          <div className="theme-note"><span>Need a unique design?</span><p>Start with a ready theme or request a fully custom website based on your exact business requirements.</p><a href="#support">Discuss your website <Arrow /></a></div>
        </div>
      </section>

      <HomeProjects />

      <section className="section membership-section" id="membership">
        <div className="shell membership-grid">
          <div className="membership-copy">
            <span className="eyebrow light">Membership rewards</span>
            <h2>Buy more, level up and <em>save on every purchase.</em></h2>
            <p>Your completed purchases automatically upgrade your membership. Your discount is applied at checkout—no coupon hunting required.</p>
            <a className="button white-button" href="/account#membership">View membership details <Arrow /></a>
          </div>
          <div className="level-list">
            {memberships.map(([level, spend, discount], index) => (
              <article key={level} className={index === 2 ? "active-level" : ""}>
                <span>{index + 1}</span><div><b>{level}</b><small>From {spend} spending</small></div><strong>{discount}<small> discount</small></strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft-section" id="products">
        <div className="shell">
          <div className="section-heading">
            <div><span className="eyebrow">Popular tools</span><h2>Official tools at a <em>practical price.</em></h2></div>
            <a href="/products">View all products <Arrow /></a>
          </div>
          <div className="product-grid">
            {products.map(([name, category, price, variation, licensePeriod], index) => (
              <article className="product-card reveal" key={name}>
                <div className={`product-art product-art-${index + 1}`}>
                  <span className="product-verified"><i aria-hidden="true" /> {licensePeriod}</span>
                  <div className="product-logo">{name.slice(0, 1)}</div>
                  <div className="product-art-lines"><i /><i /><i /></div>
                </div>
                <div className="product-copy">
                  <span className="product-category">{category}</span>
                  <h3>{name}</h3>
                  <div className="product-meta"><span>{variation}</span><span>Instant access</span></div>
                  <div className="product-footer"><strong>{price}</strong><button aria-label={`View ${name}`}>View details <Arrow /></button></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section value-section">
        <div className="shell value-grid">
          <div className="value-intro">
            <span className="eyebrow">Why work with me</span>
            <h2>Useful technology, delivered with <em>clarity and care.</em></h2>
            <p>A successful website needs more than a polished screen. It should stay fast, make buying easy and remain manageable as your business grows.</p>
            <div className="experience-card">
              <strong>15+</strong>
              <span>Years solving practical web and digital-business challenges</span>
            </div>
          </div>
          <div className="advantage-list">
            {advantages.map(([title, text], index) => (
              <article key={title} className="advantage-item reveal">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <HomeReviews />

      <section className="section closing-cta-section">
        <div className="shell cta-panel">
          <div className="cta-copy">
            <span className="eyebrow">Need the right solution?</span>
            <h2>Start with a trusted product <em>or discuss your project.</em></h2>
            <p>Choose a ready solution, or talk directly with me about your requirements.</p>
          </div>
          <div className="cta-actions"><a className="button primary" href="#products">View products <Arrow /></a><a className="button secondary" href="#support">Discuss a project</a></div>
        </div>
      </section>

      <footer className="site-footer" id="support">
        <div className="shell premium-footer-grid">
          <div className="footer-contact">
            <div className="contact-phone"><span className="contact-symbol">◉</span><div><a href="tel:+8801977024868">01977 02 48 68</a><small>10:00 am to 11:59 pm (everyday)</small></div></div>
            <a className="contact-line" href="#location"><span>◆</span>Bashundhara r/a, Dhaka</a>
            <a className="contact-line" href="mailto:contact@mehedirahat.com"><span>✉</span>contact@mehedirahat.com</a>
            <div className="social-links" aria-label="Social media">
              <a href="#facebook" aria-label="Facebook">f</a><a href="#linkedin" aria-label="LinkedIn">in</a><a href="#x" aria-label="X">X</a><a href="#whatsapp" aria-label="WhatsApp">w</a><a href="#youtube" aria-label="YouTube">▶</a>
            </div>
            <a className="resell-link" href="#resell">Resell our tools <Arrow /></a>
          </div>

          <div className="footer-menu">
            <h3>Services</h3>
            <a href="#services">Web Design &amp; Development</a>
            <a href="#services">Search Engine Optimization</a>
            <a href="#services">Web Speed Optimization</a>
            <a href="#services">WordPress Bug Fixing</a>
            <a href="#services">Website Maintenance</a>
            <a href="#services">News Site Management</a>
          </div>

          <div className="footer-menu">
            <h3>Ready Themes</h3>
            <a href="#ready-themes">Newspaper Themes</a>
            <a href="#ready-themes">Landing Pages</a>
            <a href="#ready-themes">eCommerce Themes</a>
            <a href="#ready-themes">Directory &amp; Listing</a>
            <a href="#ready-themes">Hospital &amp; Clinics</a>
            <a href="#ready-themes">School &amp; Colleges</a>
          </div>

          <div className="footer-menu">
            <h3>Pro tools</h3>
            <a href="#products">WordPress Themes</a>
            <a href="#products">WordPress Plugins</a>
            <a href="#products">Elementor Addons</a>
            <a href="#products">Page Builders</a>
            <a href="#products">Form Builders</a>
            <a href="#products">Affiliate Marketing</a>
          </div>
        </div>

        <div className="shell footer-pill">
          <nav aria-label="Footer navigation"><a href="/about">About</a><a href="#contact">Contact</a><a href="#testimonials">Testimonials</a><a href="#refund">Refund Policy</a><a href="#terms">Terms &amp; Conditions</a><a href="#privacy">Privacy policy</a><a href="#faq">FAQ</a><a href="#blog">Blog</a></nav>
          <div className="payment-badges" aria-label="Accepted payment methods"><span>bKash</span><span>Nagad</span><span>Rocket</span><span>Payoneer</span><span>Wise</span><span>Fiverr</span></div>
        </div>
      </footer>
    </main>
  );
}
