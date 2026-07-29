"use client";
import {useEffect,useState} from "react";
import {loadProjects,seedProjects,StoreProject} from "./projectStore";
import {loadHomepageSettings,seedHomepageSettings} from "./homepageStore";
export default function HomeProjects(){
  const[projects,setProjects]=useState<StoreProject[]>(seedProjects),[home,setHome]=useState(seedHomepageSettings);
  useEffect(()=>{const sync=()=>{setProjects(loadProjects().filter(x=>x.status==="Published"));setHome(loadHomepageSettings())};sync();window.addEventListener("mr-projects-updated",sync);window.addEventListener("mr-homepage-updated",sync);window.addEventListener("storage",sync);return()=>{window.removeEventListener("mr-projects-updated",sync);window.removeEventListener("mr-homepage-updated",sync);window.removeEventListener("storage",sync)}},[]);
  if(!home.projectsVisible)return null;
  return <section className="section work-section" id="projects"><div className="shell">
    <div className="section-heading"><div><span className="eyebrow">{home.projectsEyebrow}</span><h2>{home.projectsTitle} <em>{home.projectsHighlight}</em></h2></div><a href={home.projectsLinkUrl}>{home.projectsLinkLabel} <span aria-hidden="true">↗</span></a></div>
    <div className="work-grid">{projects.map((project,index)=><article className={`work-card work-card-${index+1}`} key={project.id}>
      <div className={`work-preview${project.image?" has-project-image":""}`} aria-hidden="true">{project.image?<img src={project.image} alt=""/>:<><span className="preview-top"><i/><i/><i/></span><span className="preview-copy"><b/><b/><small/></span><span className="preview-panels"><i/><i/><i/></span></>}</div>
      <div className="work-copy"><span>{String(index+1).padStart(2,"0")} / {project.category}</span><h3>{project.title}</h3><p>{project.description}</p><div className="project-card-footer">{project.availability==="Live Now"?<a className="project-status-button live" href={project.link||"#support"} aria-label={`Open ${project.title}`}>Live Now <span aria-hidden="true">↗</span></a>:<span className="project-status-button soon">Coming Soon <i aria-hidden="true">●</i></span>}<span className="project-type-label"><i>WP</i>{project.projectType}</span></div></div>
    </article>)}</div>
  </div></section>
}
