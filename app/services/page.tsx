"use client";
import {useEffect,useState} from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";
import {loadServices,StoreService} from "../serviceStore";
import {loadServicesPageSettings,seedServicesPageSettings,ServicesPageSettings} from "../servicesPageStore";

export default function ServicesPage(){
 const[services,setServices]=useState<StoreService[]>([]);
 const[page,setPage]=useState<ServicesPageSettings>(seedServicesPageSettings);
 useEffect(()=>{
  const sync=()=>{setServices(loadServices().filter(x=>x.status==="Published"));setPage(loadServicesPageSettings())};
  sync(); window.addEventListener("mr-services-updated",sync);window.addEventListener("mr-services-page-updated",sync);window.addEventListener("storage",sync);
  return()=>{window.removeEventListener("mr-services-updated",sync);window.removeEventListener("mr-services-page-updated",sync);window.removeEventListener("storage",sync)};
 },[]);
 return <main><MainHeader active="services"/>
  {page.heroVisible&&<section className="services-hero"><div className="shell services-hero-grid">
   <div className="services-hero-copy"><span className="eyebrow">{page.heroEyebrow}</span><h1><span>{page.heroLines[0]}</span><span>{page.heroLines[1]}</span><em>{page.heroLines[2]}</em></h1><p>{page.heroDescription}</p>
    <div className="services-hero-actions"><a className="button primary" href={page.primaryUrl}>{page.primaryLabel} ↗</a><a className="button secondary" href={page.secondaryUrl}>{page.secondaryLabel}</a></div>
    <div className="services-hero-proof">{page.stats.slice(0,3).map(x=><span key={x.label}><strong>{x.value}</strong><small>{x.label}</small></span>)}</div>
   </div>
   <div className="services-capability-panel"><div className="services-capability-top"><div><span>{page.panelEyebrow}</span><strong>{page.panelLines[0]}<br/>{page.panelLines[1]}</strong></div><i><b>{page.panelBadgeValue}</b> {page.panelBadgeLabel}</i></div>
    <div className="services-capability-grid">{page.capabilities.slice(0,4).map((x,i)=><article key={x.title} onClick={()=>location.href=x.url}><i>0{i+1}</i><div><h2>{x.title}</h2><p>{x.description}</p></div><b>↗</b></article>)}</div>
    <div className="services-capability-footer">{page.panelProofs.slice(0,3).map(x=><span key={x}>✓ {x}</span>)}</div>
   </div>
  </div></section>}
  {page.servicesVisible&&<section className="section service-page"><div className="shell"><div className="service-page-grid">{services.map((service,index)=><article key={service.id}><div className="service-page-card-top"><span>0{index+1}</span><i className={`service-icon service-icon-${service.icon}`} aria-hidden="true"/></div><h2>{service.title}</h2><p>{service.description}</p><a href={`/contact?service=${encodeURIComponent(service.title)}`}><span>Discuss this service</span><b>↗</b></a></article>)}</div></div></section>}
  {page.pricingVisible&&<section className="section service-pricing-section" id="service-pricing"><div className="shell"><div className="theme-section-heading service-pricing-heading"><span className="eyebrow">{page.pricingEyebrow}</span><h2>{page.pricingTitle} <em>{page.pricingHighlight}</em></h2><p>{page.pricingDescription}</p></div>
   <div className="service-package-grid">{page.packages.slice(0,4).map((x,i)=><article className={x.popular?"popular":""} key={`${x.name}-${i}`}>{x.popular&&<em className="service-popular-badge">Recommended</em>}<span>Package 0{i+1}</span><h3>{x.name}</h3><div className="service-package-price"><strong>৳ {x.price}</strong><small>{x.note}</small></div><ul>{x.features.map(feature=><li key={feature}>{feature}</li>)}</ul><a href={`/contact?service=${encodeURIComponent(x.name)}`}>Discuss this package <b>↗</b></a></article>)}</div>
  </div></section>}
  {page.fiverrVisible&&<section className="section fiverr-gigs-section"><div className="shell"><div className="fiverr-gigs-heading"><div><span className="eyebrow">{page.fiverrEyebrow}</span><h2>{page.fiverrTitle} <em>{page.fiverrHighlight}</em></h2><p>{page.fiverrDescription}</p></div><a href={page.fiverrLinkUrl}>{page.fiverrLinkLabel} ↗</a></div>
   <div className="fiverr-gig-grid">{page.gigs.slice(0,4).map((gig,i)=><article key={`${gig.title}-${i}`}><div className={`fiverr-gig-cover ${gig.accent}`}><span>FIVERR WEBSITE SERVICE</span><strong>{gig.code}</strong><small>DESIGN • SPEED • SUPPORT</small><i>MR</i></div><div className="fiverr-gig-copy"><span>Gig 0{i+1}</span><h3>{gig.title}</h3><ul>{page.gigBenefits.map(x=><li key={x}>{x}</li>)}</ul><a href={gig.url}>Discuss this gig <b>↗</b></a></div></article>)}</div>
  </div></section>}
  <SiteFooter/>
 </main>
}
