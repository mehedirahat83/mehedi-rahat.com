import type { Metadata } from "next";
import HomeServices from "./HomeServices";
import HomeProjects from "./HomeProjects";
import MainHeader from "./MainHeader";
import HomeReviews from "./HomeReviews";
import HomeHero from "./HomeHero";
import HomePopularTools from "./HomePopularTools";
import SiteFooter from "./SiteFooter";

export const metadata: Metadata = {
  title: "Mehedi Rahat — Digital Products & Web Solutions",
  description:
    "Trusted WordPress tools, ready websites and practical web solutions for growing businesses.",
};

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

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <main>
      <MainHeader active="home" />
      <HomeHero />

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

      <HomePopularTools />

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

      <SiteFooter />

    </main>
  );
}
