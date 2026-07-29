"use client";

import { useEffect, useState } from "react";
import MainHeader from "./MainHeader";
import SiteFooter from "./SiteFooter";
import { loadProjects, seedProjects, StoreProject } from "./projectStore";
import MrCommerceLanding from "./MrCommerceLanding";

export default function ExclusiveLanding({ projectId }: { projectId: string }) {
  const fallback = seedProjects.find(item => item.id === projectId) || seedProjects[0];
  const [project, setProject] = useState<StoreProject>(fallback);
  useEffect(() => {
    const sync = () => setProject(loadProjects().find(item => item.id === projectId) || fallback);
    sync();
    window.addEventListener("mr-projects-updated", sync);
    return () => window.removeEventListener("mr-projects-updated", sync);
  }, [projectId, fallback]);
  const isCommerce = projectId === "mr-commerce-pro";
  if (isCommerce) return <MrCommerceLanding />;
  const features = isCommerce
    ? ["Premium product presentation", "Faster cart and checkout flow", "Customer membership rewards", "Practical store management"]
    : ["Fast news publishing workflow", "Organized media management", "Editorial productivity tools", "Built for active news websites"];

  return <main>
    <MainHeader active="exclusive" />
    <section className="exclusive-hero">
      <div className="shell exclusive-hero-grid">
        <div>
          <span className="eyebrow">MR Exclusive · WordPress Plugin</span>
          <h1>{project.title}<br/><em>built for real work.</em></h1>
          <p>{project.description}</p>
          <div className="exclusive-actions">
            {project.availability === "Live Now"
              ? <a className="button primary" href={project.link || "/contact"}>Explore the plugin ↗</a>
              : <span className="exclusive-coming">Coming Soon</span>}
            <a className="button secondary" href="/contact">Ask a question</a>
          </div>
        </div>
        <div className="exclusive-showcase">
          <span>{project.availability}</span>
          <div className="exclusive-window">
            <i/><i/><i/><strong>{project.title}</strong>
            <b>{isCommerce ? "Commerce operations" : "News workflow"}</b>
            <em/><em/><em/>
          </div>
        </div>
      </div>
    </section>
    <section className="section exclusive-features"><div className="shell">
      <div className="section-heading"><div><span className="eyebrow">Purpose-built features</span><h2>Focused, practical and <em>easy to use.</em></h2></div></div>
      <div className="exclusive-feature-grid">{features.map((feature, index)=><article key={feature}><i>0{index+1}</i><h3>{feature}</h3><p>Designed to keep everyday WordPress work clear, reliable and efficient.</p></article>)}</div>
    </div></section>
    <section className="exclusive-cta"><div className="shell"><div><span className="eyebrow">Need more information?</span><h2>Talk directly with the developer.</h2></div><a className="button primary" href="/contact">Contact Me ↗</a></div></section>
    <SiteFooter/>
  </main>;
}
