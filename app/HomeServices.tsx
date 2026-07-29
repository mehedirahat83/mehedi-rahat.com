"use client";
import {useEffect,useState} from "react";
import {loadServices,seedServices,StoreService} from "./serviceStore";
import {loadHomepageSettings,seedHomepageSettings} from "./homepageStore";

export default function HomeServices(){
  const[services,setServices]=useState<StoreService[]>(seedServices),[home,setHome]=useState(seedHomepageSettings);
  useEffect(()=>{const sync=()=>{setServices(loadServices().filter(service=>service.status==="Published"));setHome(loadHomepageSettings())};sync();window.addEventListener("mr-services-updated",sync);window.addEventListener("mr-homepage-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-services-updated",sync);window.removeEventListener("mr-homepage-updated",sync);window.removeEventListener("storage",sync)}},[]);
  if(!home.servicesVisible)return null;
  return <section className="section" id="services"><div className="shell">
    <div className="section-heading compact-heading"><div><span className="eyebrow">{home.servicesEyebrow}</span><h2>{home.servicesTitle} <em>{home.servicesHighlight}</em></h2></div><a href={home.servicesLinkUrl}>{home.servicesLinkLabel} <span aria-hidden="true">↗</span></a></div>
    <div className="service-grid">{services.map((service,index)=><article className="service-card reveal" key={service.id}>
      <div className="service-card-top"><span>{String(index+1).padStart(2,"0")}</span>{service.image?<img className="service-uploaded-icon" src={service.image} alt=""/>:<i className={`service-icon service-icon-${service.icon}`} aria-hidden="true"/>}</div>
      <h3>{service.title}</h3><p>{service.description}</p><a href={service.link||"#support"} aria-label={`Learn about ${service.title}`}><span aria-hidden="true">↗</span></a>
    </article>)}</div>
  </div></section>
}
