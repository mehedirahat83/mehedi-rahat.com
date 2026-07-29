"use client";
import {useEffect,useState} from "react";
import AdminSidebar from "./AdminSidebar";
import {ClientProjectsPageSettings,loadClientProjectsPageSettings,saveClientProjectsPageSettings,seedClientProjectsPageSettings} from "../clientProjectsPageStore";

export default function AdminClientProjectsPage(){
 const[data,setData]=useState<ClientProjectsPageSettings>(seedClientProjectsPageSettings),[message,setMessage]=useState("");
 useEffect(()=>setData(loadClientProjectsPageSettings()),[]);
 const set=<K extends keyof ClientProjectsPageSettings>(key:K,value:ClientProjectsPageSettings[K])=>setData(c=>({...c,[key]:value}));
 const stat=(index:number,field:"value"|"label"|"description",value:string)=>set("stats",data.stats.map((x,i)=>i===index?{...x,[field]:value}:x));
 const project=(index:number,field:"title"|"category"|"description"|"url"|"linkLabel",value:string)=>set("projects",data.projects.map((x,i)=>i===index?{...x,[field]:value}:x));
 const save=()=>{saveClientProjectsPageSettings(data);setMessage("Client Projects Page saved and connected to the live page.")};
 return <main className="admin-root"><AdminSidebar active="pages"/><section className="admin-workspace"><Top/>
  <div className="admin-page-title"><div><span className="eyebrow">Website content</span><h1>Client Projects Page</h1><p>Edit the hero, global delivery highlights and every project card.</p></div><a href="/client-projects" target="_blank">View Client Projects Page ↗</a></div>
  <div className="homepage-editor-layout"><div className="homepage-editor-main">
   <Card title="Hero content" visible={data.heroVisible} toggle={v=>set("heroVisible",v)}>
    <div className="editor-grid"><Field label="Eyebrow"><input value={data.heroEyebrow} onChange={e=>set("heroEyebrow",e.target.value)}/></Field>{data.heroLines.slice(0,3).map((x,i)=><Field key={i} label={`Headline line ${i+1}${i===2?" (highlighted)":""}`}><input value={x} onChange={e=>set("heroLines",data.heroLines.map((v,n)=>n===i?e.target.value:v))}/></Field>)}</div>
    <Field label="Hero description"><textarea value={data.heroDescription} onChange={e=>set("heroDescription",e.target.value)}/></Field>
   </Card>
   <Card title="Global delivery card">
    <div className="editor-grid"><Field label="Card eyebrow"><input value={data.cardEyebrow} onChange={e=>set("cardEyebrow",e.target.value)}/></Field>{data.cardLines.slice(0,2).map((x,i)=><Field key={i} label={`Card heading line ${i+1}`}><input value={x} onChange={e=>set("cardLines",data.cardLines.map((v,n)=>n===i?e.target.value:v))}/></Field>)}</div>
    <div className="homepage-stat-editor">{data.stats.slice(0,2).map((x,i)=><div key={i}><b>Statistic {i+1}</b><input value={x.value} onChange={e=>stat(i,"value",e.target.value)} placeholder="Value"/><input value={x.label} onChange={e=>stat(i,"label",e.target.value)} placeholder="Label"/><input value={x.description} onChange={e=>stat(i,"description",e.target.value)} placeholder="Description"/></div>)}</div>
    <div className="editor-grid"><Field label="Country section label"><input value={data.countriesLabel} onChange={e=>set("countriesLabel",e.target.value)}/></Field><Field label="Countries (one per line)"><textarea value={data.countries.join("\n")} onChange={e=>set("countries",lines(e.target.value))}/></Field><Field label="Bottom proof points (one per line)"><textarea value={data.proofPoints.join("\n")} onChange={e=>set("proofPoints",lines(e.target.value))}/></Field></div>
   </Card>
   <Card title="Project cards" visible={data.projectsVisible} toggle={v=>set("projectsVisible",v)}>
    <div className="client-project-admin-list">{data.projects.map((x,i)=><section key={i}><div><b>Project {String(i+1).padStart(2,"0")}</b><button type="button" onClick={()=>set("projects",data.projects.filter((_,n)=>n!==i))}>Remove</button></div><div className="editor-grid"><Field label="Category"><input value={x.category} onChange={e=>project(i,"category",e.target.value)}/></Field><Field label="Project title"><input value={x.title} onChange={e=>project(i,"title",e.target.value)}/></Field><Field label="Button label"><input value={x.linkLabel} onChange={e=>project(i,"linkLabel",e.target.value)}/></Field><Field label="Button URL"><input value={x.url} onChange={e=>project(i,"url",e.target.value)}/></Field></div><Field label="Description"><textarea value={x.description} onChange={e=>project(i,"description",e.target.value)}/></Field></section>)}</div>
    <button className="save-draft client-project-add" type="button" onClick={()=>set("projects",[...data.projects,{title:"New Project",category:"Category",description:"Add the project description here.",url:"/contact",linkLabel:"Discuss a similar project"}])}>+ Add project card</button>
   </Card>
  </div><aside className="homepage-editor-side"><section className="admin-card homepage-status-card"><span className="eyebrow">Client Projects status</span><h2>Ready to update</h2><p>All saved content appears on the public Client Projects Page immediately.</p><ul><li>Three-line hero headline</li><li>Global delivery statistics</li><li>Highlighted countries</li><li>Project cards and links</li></ul></section>{message&&<p className="editor-saved">✓ {message}</p>}<button className="publish-product" onClick={save}>Save Client Projects Page ↗</button><button className="save-draft" onClick={()=>{setData(seedClientProjectsPageSettings);saveClientProjectsPageSettings(seedClientProjectsPageSettings);setMessage("Default Client Projects content restored.")}}>Restore default content</button></aside></div>
 </section></main>
}
const lines=(value:string)=>value.split("\n").map(x=>x.trim()).filter(Boolean);
function Top(){return <header className="admin-topbar"><label><span>⌕</span><input placeholder="Search Client Projects settings..."/></label><div><button>♟</button><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="editor-field"><span>{label}</span>{children}</label>}
function Card({title,visible,toggle,children}:{title:string;visible?:boolean;toggle?:(value:boolean)=>void;children:React.ReactNode}){return <section className="admin-card editor-card homepage-section-editor"><div className="homepage-editor-heading"><h2>{title}</h2>{toggle&&<label><input type="checkbox" checked={visible} onChange={e=>toggle(e.target.checked)}/> Show on Client Projects Page</label>}</div><div className="services-admin-card-body">{children}</div></section>}
