"use client";

import { useEffect, useState } from "react";
import MainHeader from "./MainHeader";
import SiteFooter from "./SiteFooter";
import {
  loadMrCommercePageSettings,
  seedMrCommercePageSettings,
} from "./mrCommercePageStore";
import { completedProductSales, ORDER_UPDATED_EVENT } from "./orderStore";

function youtubeEmbed(url: string) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : "";
}

export default function MrCommerceLanding() {
  const [content, setContent] = useState(seedMrCommercePageSettings);
  const [added, setAdded] = useState(false);
  const [freeMessage, setFreeMessage] = useState(false);
  const [sold, setSold] = useState(0);

  useEffect(() => {
    const sync = () => setContent(loadMrCommercePageSettings());
    const syncOrders = () =>
      setSold(
        completedProductSales("MR Commerce Pro", [
          "mr-commerce-pro-license",
          "mr-commerce-pro-launch-license",
        ]),
      );
    sync();
    syncOrders();
    window.addEventListener("mr-commerce-page-updated", sync);
    window.addEventListener(ORDER_UPDATED_EVENT, syncOrders);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mr-commerce-page-updated", sync);
      window.removeEventListener(ORDER_UPDATED_EVENT, syncOrders);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function addProToCart() {
    const cart = JSON.parse(localStorage.getItem("mr-cart") || "[]") as Array<{
      id: string; name: string; category: string; variation: string; price: number; quantity: number;
    }>;
    const id = "mr-commerce-pro-license";
    const regularPrice = Number(content.proRegularPrice.replace(/[^\d]/g, "")) || 5000;
    const launchActive = sold < Math.max(1, content.launchLimit);
    const currentPrice = launchActive ? content.proPrice : regularPrice;
    const variation = launchActive ? "Pro · Launch License" : "Pro · Lifetime License";
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
      existing.price = currentPrice;
      existing.variation = variation;
    }
    else cart.push({
      id,
      name: content.proTitle,
      category: "MR Exclusive",
      variation: "Pro · Launch License",
      price: currentPrice,
      quantity: 1,
    });
    if (!existing) cart[cart.length - 1].variation = variation;
    localStorage.setItem("mr-cart", JSON.stringify(cart));
    setAdded(true);
    window.dispatchEvent(new Event("mr-cart-updated"));
  }

  const launchLimit = Math.max(1, content.launchLimit);
  const claimed = Math.min(launchLimit, sold);
  const remaining = Math.max(0, launchLimit - claimed);
  const launchActive = sold < launchLimit;
  const regularPrice = Number(content.proRegularPrice.replace(/[^\d]/g, "")) || 5000;
  const currentProPrice = launchActive ? content.proPrice : regularPrice;
  const embedUrl = youtubeEmbed(content.videoUrl);
  const artStyles = ["fraud", "payment", "shipping", "growth"];

  return <main className="mrc-page">
    <MainHeader active="exclusive" />

    <section className="mrc-hero">
      <div className="shell mrc-hero-grid">
        <div className="mrc-hero-copy">
          <span className="eyebrow">{content.heroEyebrow}</span>
          <h1>{content.heroTitle} <em>{content.heroHighlight}</em></h1>
          <p>{content.heroDescription}</p>
          <div className="mrc-hero-actions">
            <a className="button primary" href={content.primaryUrl}>{content.primaryLabel} ↘</a>
            <a className="button secondary" href={content.secondaryUrl}>{content.secondaryLabel}</a>
          </div>
          <div className="mrc-proof">
            {content.stats.map(stat => <span key={`${stat.value}-${stat.label}`}>
              <strong>{stat.value}</strong><small>{stat.label}</small>
            </span>)}
          </div>
        </div>
        <div className="mrc-video-card">
          <div className="mrc-video-screen">
            {embedUrl ? <iframe src={embedUrl} title={content.videoTitle} allowFullScreen /> :
              content.videoUrl ? <video src={content.videoUrl} controls /> : <>
                <span>{content.videoEyebrow}</span>
                <button type="button" aria-label="Video will be added here"><i>▶</i></button>
                <strong>{content.videoTitle}</strong>
                <small>{content.videoDescription}</small>
              </>}
          </div>
          <div className="mrc-video-foot">{content.videoProofs.map(item => <span key={item}>{item}</span>)}</div>
        </div>
      </div>
    </section>

    <section className="section mrc-overview">
      <div className="shell">
        <div className="section-heading mrc-section-heading">
          <div>
            <span className="eyebrow">{content.overviewEyebrow}</span>
            <h2><span>{content.overviewTitle}</span><span><em>{content.overviewHighlight}</em></span></h2>
          </div>
          <p>{content.overviewDescription}</p>
        </div>
        <div className="mrc-overview-grid">
          {content.overviewCards.map(item => <article key={item.number}>
            <i>{item.number}</i><h3>{item.title}</h3><p>{item.description}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section mrc-feature-stories" id="features">
      <div className="shell">
        <div className="mrc-stories-title">
          <span className="eyebrow">{content.featuresEyebrow}</span>
          <h2>{content.featuresTitle} <em>{content.featuresHighlight}</em></h2>
        </div>
        {content.featureGroups.map((feature, index) => <article className={index % 2 ? "reverse" : ""} key={feature.number}>
          <div className={`mrc-feature-art ${artStyles[index % artStyles.length]} ${feature.image ? "has-image" : ""}`}>
            {feature.image ? <img src={feature.image} alt={feature.title} /> : <>
              <div className="mrc-browser-bar"><i/><i/><i/><span>Live feature screenshot</span></div>
              <div className="mrc-art-body"><b>{feature.label}</b><strong>{feature.title}</strong><span/><span/><span/></div>
              <em>Replace with your real plugin screenshot</em>
            </>}
          </div>
          <div className="mrc-feature-copy">
            <span>{feature.number} · {feature.label}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            <ul>{feature.points.map(point => <li key={point}>{point}</li>)}</ul>
          </div>
        </article>)}
      </div>
    </section>

    <section className="section mrc-capabilities">
      <div className="shell">
        <div className="section-heading mrc-section-heading">
          <div><span className="eyebrow">{content.capabilitiesEyebrow}</span><h2>{content.capabilitiesTitle} <em>{content.capabilitiesHighlight}</em></h2></div>
        </div>
        <div className="mrc-capability-grid">
          {content.capabilityGroups.map((group, index) => <article key={`${group.title}-${index}`}>
            <i>0{index + 1}</i><h3>{group.title}</h3><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul>
          </article>)}
        </div>
      </div>
    </section>

    <section className="section mrc-workflow">
      <div className="shell">
        <div className="mrc-stories-title">
          <span className="eyebrow">{content.workflowEyebrow}</span>
          <h2>{content.workflowTitle} <em>{content.workflowHighlight}</em></h2>
        </div>
        <div>{content.workflowSteps.map(item => <article key={item.number}>
          <i>{item.number}</i><h3>{item.title}</h3><p>{item.description}</p>
        </article>)}</div>
      </div>
    </section>

    <section className="section mrc-pricing" id="pricing">
      <div className="shell">
        <div className="mrc-stories-title">
          <span className="eyebrow">{content.pricingEyebrow}</span>
          <h2><span>{content.pricingTitle}</span><span><em>{content.pricingHighlight}</em></span></h2>
        </div>
        <div className="mrc-pricing-grid">
          <article className="mrc-plan free">
            <span>Free</span><h3>{content.freeTitle}</h3>
            <strong>{content.freePrice}<small>{content.freePriceNote}</small></strong>
            <p>{content.freeDescription}</p>
            <ul>{content.freeFeatures.map(item => <li key={item}>{item}</li>)}</ul>
            <div className="mrc-free-value">
              <div><b>{content.freeValueTitle}</b><small>{content.freeValueDescription}</small></div>
              <div className="mrc-free-value-points">{content.freeBenefits.map(item => <span key={item}>{item}</span>)}</div>
            </div>
            {content.freeDownloadUrl ?
              <a href={content.freeDownloadUrl} download>{content.freeButtonLabel} ↧</a> :
              <button type="button" onClick={() => setFreeMessage(true)}>{content.freeButtonLabel} ↧</button>}
            {freeMessage && <small className="mrc-download-note">Admin থেকে Free plugin download URL যোগ করলে এখান থেকে সরাসরি ডাউনলোড হবে।</small>}
          </article>
          <article className="mrc-plan pro">
            <div className="mrc-launch-badge">{launchActive ? content.launchBadge : "Regular price"}</div>
            <span>Pro</span><h3>{content.proTitle}</h3>
            <div className="mrc-price">
              <strong>৳{currentProPrice.toLocaleString("en-US")}</strong>
              {launchActive && <del>{content.proRegularPrice}</del>}
            </div>
            <p>{content.proDescription}</p>
            <div className="mrc-sale-progress">
              <div><span>Launch licenses claimed</span><b>{claimed}/{launchLimit}</b></div>
              <i><em style={{width: `${(claimed / launchLimit) * 100}%`}} /></i>
              <small>{launchActive ? `${remaining} launch-price licenses remaining` : "Launching offer completed · Regular price is active"}</small>
            </div>
            <ul>{content.proFeatures.map(item => <li key={item}>{item}</li>)}</ul>
            {added ? <a href="/cart">View Cart · ৳{currentProPrice.toLocaleString("en-US")} →</a> :
              <button type="button" onClick={addProToCart}>{content.proButtonLabel} →</button>}
          </article>
        </div>
      </div>
    </section>

    <SiteFooter />
  </main>;
}
