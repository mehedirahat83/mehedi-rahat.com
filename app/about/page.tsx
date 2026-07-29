import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";

const principles = [
  ["01", "Practical first", "Every decision starts with the real business goal, not unnecessary features."],
  ["02", "Clear communication", "You work directly with the person responsible for planning and delivery."],
  ["03", "Built for growth", "The foundation stays fast, manageable and ready for the next stage."],
  ["04", "Support that continues", "Guidance does not disappear when the website or product goes live."],
];

const capabilities = [
  ["Website", "Custom Websites", "Business, eCommerce, LMS, listing and landing-page solutions built around exact requirements.", "/services"],
  ["Theme", "Ready Websites", "Professionally prepared designs that reduce launch time without losing essential customization.", "/ready-themes"],
  ["Tools", "Premium Tools", "Reliable WordPress products, assisted activation, updates and dependable after-sales support.", "/products"],
  ["Product", "Own Products", "MR Commerce Pro and MR News Pro—purpose-built products developed from practical workflows.", "/mr-commerce-pro"],
];

const workflow = [
  ["01", "Understand", "Clarify the business, users, priorities and the result the project must achieve."],
  ["02", "Plan", "Choose the right structure, technology and feature scope before development begins."],
  ["03", "Build", "Create a responsive, focused and performance-conscious experience."],
  ["04", "Support", "Launch carefully, guide the team and improve the solution as the business grows."],
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <MainHeader />
      <section className="about-hero">
        <div className="shell about-hero-grid">
          <div className="about-hero-copy">
            <p className="eyebrow">About Mehedi Rahat</p>
            <h1>Experience behind<br />practical digital<br /><span>growth solutions.</span></h1>
            <p className="about-lead">I am Mehedi Rahat—a full-stack developer and product designer with 15+ years of practical experience. I help businesses in Bangladesh and worldwide launch better websites, use dependable digital products and manage their online growth with clarity.</p>
            <div className="about-actions"><a className="about-primary" href="/contact">Discuss a project ↗</a><a className="about-secondary" href="/services">View services</a></div>
            <div className="about-stats">
              <div><strong>15+</strong><span>Years experience</span></div><div><strong>3,000+</strong><span>Websites completed</span></div><div><strong>25+</strong><span>Countries served</span></div><div><strong>4.9/5</strong><span>Client rating</span></div>
            </div>
          </div>
          <aside className="about-positioning">
            <div className="about-positioning-top"><p>Complete digital growth partner</p><span>MR</span></div>
            <h2>One partner.<br />Three ways to grow.</h2>
            <div className="about-focus-list">
              <a href="/services"><b>01</b><span><strong>Custom Websites</strong><small>Built around your business goals</small></span><i>↗</i></a>
              <a href="/ready-themes"><b>02</b><span><strong>Ready Websites</strong><small>Professional sites with a faster launch</small></span><i>↗</i></a>
              <a href="/products"><b>03</b><span><strong>Premium Tools</strong><small>Reliable products, licensing and support</small></span><i>↗</i></a>
            </div>
            <div className="about-positioning-foot"><span>✓ Direct communication</span><span>✓ Practical guidance</span></div>
          </aside>
        </div>
      </section>

      <section className="about-story">
        <div className="shell">
          <div className="about-section-intro about-intro-split"><div><p className="eyebrow">My approach</p><h2>Built from real projects,<br /><span>not just theory.</span></h2></div><p>Years of building client websites, supporting WordPress users and developing my own products have shaped a simple approach: keep the experience clear, the feature set useful and the final system easy to operate.</p></div>
          <div className="about-principles">{principles.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div>
      </section>

      <section className="about-capabilities">
        <div className="shell">
          <div className="about-section-intro"><p className="eyebrow">What I work on</p><h2>Connected solutions for<br /><span>real business needs.</span></h2></div>
          <div className="about-capability-grid">{capabilities.map(([tag, title, description, href], index) => <article key={title}><div><span>{String(index + 1).padStart(2, "0")}</span><b>{tag}</b></div><h3>{title}</h3><p>{description}</p><a href={href}>Explore ↗</a></article>)}</div>
        </div>
      </section>

      <section className="about-workflow">
        <div className="shell">
          <div className="about-section-intro light"><p className="eyebrow">A clearer workflow</p><h2>From first conversation<br />to dependable delivery.</h2></div>
          <div className="about-workflow-grid">{workflow.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div>
        </div>
      </section>

      <section className="about-products">
        <div className="shell">
          <div className="about-section-intro about-intro-split"><div><p className="eyebrow">Developed by me</p><h2>Products shaped by<br /><span>practical experience.</span></h2></div><p>These products turn recurring WordPress business problems into focused, manageable workflows.</p></div>
          <div className="about-product-grid">
            <article><div><span>WordPress plugin</span><b>Live now</b></div><h3>MR Commerce Pro</h3><p>A practical WooCommerce toolkit for safer orders, Bangladesh payments, store operations, growth and customer management.</p><a href="/mr-commerce-pro">Explore MR Commerce Pro ↗</a></article>
            <article><div><span>WordPress plugin</span><b>Coming soon</b></div><h3>MR News Pro</h3><p>A focused news-management solution for faster publishing, media handling and the daily workflow of active news websites.</p><span className="about-coming">Product page coming soon</span></article>
          </div>
        </div>
      </section>

      <section className="about-global">
        <div className="shell about-global-grid">
          <div><p className="eyebrow">Bangladesh to worldwide</p><h2>Local understanding.<br /><span>Global delivery.</span></h2><p>I understand the compact, practical experience Bangladeshi customers prefer, while years of international work keep the process and delivery ready for clients worldwide.</p></div>
          <div className="about-country-card"><strong>25+ countries served</strong><div>{["USA", "UK", "Italy", "France", "Germany", "Switzerland"].map((country, index) => <span key={country}><b>{String(index + 1).padStart(2, "0")}</b>{country}</span>)}</div></div>
        </div>
      </section>

      <section className="about-cta"><div className="shell"><div className="about-cta-card"><div><p className="eyebrow">Ready to move forward?</p><h2>Let’s turn your requirement into a practical solution.</h2></div><a href="/contact">Start a conversation ↗</a></div></div></section>
      <SiteFooter />
    </main>
  );
}
