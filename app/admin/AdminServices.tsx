"use client";
import {FormEvent,ReactNode,useEffect,useMemo,useState} from "react";
import AdminSidebar from "./AdminSidebar";
import {loadServices,saveServices,slugify,StoreService} from "../serviceStore";

const iconOptions=["code","seo","speed","wordpress","support","news","social","tools"];

export default function AdminServices({mode}:{mode:"list"|"new"|"edit"}){
  const [services,setServices]=useState<StoreService[]>([]);
  const [editing,setEditing]=useState<StoreService|null>(null);
  const [query,setQuery]=useState(""),[status,setStatus]=useState("All status");
  const [image,setImage]=useState(""),[imageName,setImageName]=useState("");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    const all=loadServices();setServices(all);
    if(mode==="edit"){const id=new URLSearchParams(window.location.search).get("id");const service=all.find(x=>x.id===id)||all[0]||null;setEditing(service);if(service){setImage(service.image||"");setImageName(service.imageName||"")}}
  },[mode]);
  const visible=useMemo(()=>services.filter(service=>(!query||`${service.title} ${service.description}`.toLowerCase().includes(query.toLowerCase()))&&(status==="All status"||service.status===status)),[services,query,status]);
  function persist(next:StoreService[]){const ordered=[...next].sort((a,b)=>a.order-b.order).map((x,i)=>({...x,order:i+1}));setServices(ordered);saveServices(ordered)}
  function move(id:string,direction:-1|1){const next=[...services];const index=next.findIndex(x=>x.id===id),target=index+direction;if(index<0||target<0||target>=next.length)return;[next[index],next[target]]=[next[target],next[index]];persist(next)}
  function remove(service:StoreService){if(confirm(`Delete ${service.title}?`))persist(services.filter(x=>x.id!==service.id))}
  async function upload(file?:File){if(!file)return;if(file.size>1.5*1024*1024){setMessage("Image must be smaller than 1.5 MB.");return}const reader=new FileReader();reader.onload=()=>{setImage(String(reader.result));setImageName(file.name);setMessage("")};reader.readAsDataURL(file)}
  function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const data=new FormData(event.currentTarget),title=String(data.get("title")||"");
    const service:StoreService={id:editing?.id||slugify(title),title,description:String(data.get("description")||""),icon:String(data.get("icon")||"code"),status:String(data.get("status")) as StoreService["status"],order:editing?.order||services.length+1,link:String(data.get("link")||"#support"),image,imageName};
    persist(mode==="edit"?services.map(x=>x.id===editing?.id?service:x):[...services,service]);setEditing(service);setMessage(`${service.title} saved and connected to the Homepage.`);
  }
  return <main className="admin-root"><AdminSidebar active="services"/><section className="admin-workspace"><AdminTop/>
    {mode==="list"?<><div className="admin-page-title"><div><span className="eyebrow">Website content</span><h1>Services</h1><p>Manage the services displayed in the Homepage “What I Do” section.</p></div><a href="/admin/services/new">Add new service +</a></div>
      <section className="product-admin-stats">{[["All services",services.length],["Published",services.filter(x=>x.status==="Published").length],["Drafts",services.filter(x=>x.status==="Draft").length],["Homepage positions",services.length]].map(item=><article key={String(item[0])}><span>{item[0]}</span><strong>{item[1]}</strong></article>)}</section>
      <section className="admin-card product-list-card"><div className="product-toolbar"><label>⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search services..."/></label><select value={status} onChange={e=>setStatus(e.target.value)}><option>All status</option><option>Published</option><option>Draft</option></select></div>
        <div className="service-admin-list"><div className="service-admin-head"><span>Order</span><span>Service</span><span>Description</span><span>Status</span><span>Actions</span></div>{visible.map(service=><div className="service-admin-row" key={service.id}><span className="service-order-actions"><b>{String(service.order).padStart(2,"0")}</b><button onClick={()=>move(service.id,-1)} aria-label="Move up">↑</button><button onClick={()=>move(service.id,1)} aria-label="Move down">↓</button></span><span className="admin-service-name">{service.image?<img src={service.image} alt=""/>:<i className={`service-icon service-icon-${service.icon}`}/>}<b>{service.title}<small>/{service.id}</small></b></span><p>{service.description}</p><em className={service.status.toLowerCase()}>{service.status}</em><span className="product-row-actions"><a href="/#services" target="_blank">View</a><a href={`/admin/services/edit?id=${service.id}`}>Edit</a><button onClick={()=>remove(service)}>×</button></span></div>)}</div>
      </section></>:
      <><div className="admin-page-title"><div><span className="eyebrow">Services management</span><h1>{mode==="new"?"Add Service":"Edit Service"}</h1><p>Control its Homepage content, visual, link, order and publishing status.</p></div><a className="admin-export" href="/admin/services">Back to services →</a></div>
        <form className="product-editor" onSubmit={submit}><div className="product-editor-main">
          <EditorCard title="Service information"><div className="editor-grid"><Field label="Service title"><input name="title" required defaultValue={editing?.title}/></Field><Field label="Publish status"><select name="status" defaultValue={editing?.status||"Published"}><option>Published</option><option>Draft</option></select></Field><Field label="Service icon"><select name="icon" defaultValue={editing?.icon||"code"}>{iconOptions.map(icon=><option key={icon} value={icon}>{iconLabel(icon)}</option>)}</select></Field><Field label="Button link"><input name="link" defaultValue={editing?.link||"#support"} placeholder="#support or /page"/></Field></div><Field label="Service description"><textarea name="description" required defaultValue={editing?.description} placeholder="Write a concise service description..."/></Field></EditorCard>
          <EditorCard title="Homepage card preview"><article className="service-card service-editor-preview"><div className="service-card-top"><span>{String(editing?.order||services.length+1).padStart(2,"0")}</span>{image?<img className="service-uploaded-icon" src={image} alt="Preview"/>:<i className={`service-icon service-icon-${editing?.icon||"code"}`}/>}</div><h3>{editing?.title||"Your service title"}</h3><p>{editing?.description||"The service description will appear here on the Homepage."}</p><a>↗</a></article></EditorCard>
        </div><aside className="product-editor-side"><EditorCard title="Service visual"><label className="image-upload-placeholder">{image?<img src={image} alt="Service preview"/>:<><i>◇</i><b>Upload custom icon</b><small>Optional · PNG, JPG or WebP · max 1.5 MB</small></>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0])}/><span>{imageName||"Choose image"}</span></label>{image&&<button className="remove-service-image" type="button" onClick={()=>{setImage("");setImageName("")}}>Use built-in icon instead</button>}</EditorCard>
          {message&&<p className="editor-saved">✓ {message}</p>}<button className="publish-product" type="submit">{mode==="new"?"Save & Publish Service":"Update Service"} ↗</button><a className="save-draft service-cancel" href="/admin/services">Cancel</a>
        </aside></form></>}
  </section></main>
}
function AdminTop(){return <header className="admin-topbar"><label><span>⌕</span><input placeholder="Search services, products, orders..."/></label><div><button>♟</button><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>}
function EditorCard({title,children}:{title:string;children:ReactNode}){return <section className="admin-card editor-card"><h2>{title}</h2>{children}</section>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="editor-field"><span>{label}</span>{children}</label>}
function iconLabel(icon:string){return ({code:"Website Development",seo:"SEO",speed:"Speed Optimization",wordpress:"WordPress",support:"Maintenance & Support",news:"News Management",social:"Social Media",tools:"Premium Tools"} as Record<string,string>)[icon]||icon}
