"use client";
import {useEffect,useState} from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";
import {ClientProjectsPageSettings,loadClientProjectsPageSettings,seedClientProjectsPageSettings} from "../clientProjectsPageStore";

export default function ClientProjectsPage(){
 const[data,setData]=useState<ClientProjectsPageSettings>(seedClientProjectsPageSettings);
 useEffect(()=>{const sync=()=>setData(loadClientProjectsPageSettings());sync();window.addEventListener("mr-client-projects-page-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-client-projects-page-updated",sync);window.removeEventListener("storage",sync)}},[]);
 return <main><MainHeader active="projects"/>
  {data.heroVisible&&<section className="client-projects-hero"><div className="shell client-projects-hero-grid">
   <div className="client-projects-hero-copy"><span className="eyebrow">{data.heroEyebrow}</span><h1><span>{data.heroLines[0]}</span><span>{data.heroLines[1]}</span><span><em>{data.heroLines[2]}</em></span></h1><p>{data.heroDescription}</p></div>
   <aside className="project-reach-card"><div className="project-reach-heading"><div><span>{data.cardEyebrow}</span><h2>{data.cardLines[0]}<br/>{data.cardLines[1]}</h2></div><i>MR</i></div>
    <div className="project-reach-stats">{data.stats.slice(0,2).map((x,i)=><article key={i}><strong>{x.value}</strong><span>{x.label}</span><small>{x.description}</small></article>)}</div>
    <div className="project-country-block"><span>{data.countriesLabel}</span><div>{data.countries.map((country,i)=><i key={`${country}-${i}`}><b>{String(i+1).padStart(2,"0")}</b>{country}</i>)}</div></div>
    <footer>{data.proofPoints.slice(0,2).map((x,i)=><span key={i}>✓ {x}</span>)}</footer>
   </aside>
  </div></section>}
  {data.projectsVisible&&<section className="section client-projects-page"><div className="shell"><div className="client-project-grid">{data.projects.map((project,index)=><article key={`${project.title}-${index}`}>
   <div className={`client-project-art art-${index%3+1}`}><span/><i/><i/><i/></div><span>{project.category}</span><h2>{project.title}</h2><p>{project.description}</p><a href={project.url}>{project.linkLabel} ↗</a>
  </article>)}</div></div></section>}
  <SiteFooter/>
 </main>
}
