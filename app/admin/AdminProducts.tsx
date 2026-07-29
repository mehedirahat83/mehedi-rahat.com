"use client";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { loadCategories, loadProducts, saveProducts, slugify, StoreProduct, ProductVariation, ProductInformation } from "../productStore";

export default function AdminProducts({mode}:{mode:"list"|"new"|"edit"}) {
  const [products,setProducts]=useState<StoreProduct[]>([]);
  const [editing,setEditing]=useState<StoreProduct|null>(null);
  const [variations,setVariations]=useState<ProductVariation[]>([{label:"01 Site",price:300}]);
  const [information,setInformation]=useState<ProductInformation[]>([{label:"Official Tool",value:"Yes"},{label:"Activation Process",value:"Assisted activation"},{label:"Auto Update",value:"One Year"},{label:"Delivery",value:"30 Minutes Max"},{label:"Download file",value:"After order approval"}]);
  const [image,setImage]=useState(""),[imageName,setImageName]=useState("");
  const [download,setDownload]=useState(""),[downloadName,setDownloadName]=useState("");
  const [description,setDescription]=useState("");
  const [saved,setSaved]=useState(false),[message,setMessage]=useState("");
  const [query,setQuery]=useState(""),[category,setCategory]=useState("All categories"),[status,setStatus]=useState("All status");

  useEffect(()=>{
    const all=loadProducts();setProducts(all);
    if(mode==="edit"){
      const id=new URLSearchParams(window.location.search).get("id");
      const product=all.find(x=>x.id===id)||all[0]||null;
      setEditing(product);
      if(product){setVariations(product.variations);setInformation(product.information);setImage(product.image||"");setImageName(product.imageName||"");setDownload(product.download||"");setDownloadName(product.downloadName||"");setDescription(product.description||"")}
    }
  },[mode]);

  const visible=useMemo(()=>products.filter(p=>
    (!query||`${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()))&&
    (category==="All categories"||p.category===category)&&(status==="All status"||p.status===status)
  ),[products,query,category,status]);
  const categories=loadCategories(products);
  function persist(next:StoreProduct[]){setProducts(next);saveProducts(next)}

  async function upload(file:File|undefined,type:"image"|"download"){
    if(!file)return;
    const max=type==="image"?1.5:2;
    if(file.size>max*1024*1024){setMessage(`${type==="image"?"Image":"File"} must be smaller than ${max} MB for the local prototype.`);return}
    const data=await fileToData(file);
    if(type==="image"){setImage(data);setImageName(file.name)}else{setDownload(data);setDownloadName(file.name)}
    setMessage("");
  }
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();const f=new FormData(e.currentTarget);
    const name=String(f.get("name")||"");
    const product:StoreProduct={
      id:editing?.id||slugify(name),name,category:String(f.get("category")),
      license:String(f.get("license")) as StoreProduct["license"],status:String(f.get("status")) as StoreProduct["status"],
      price:Number(variations[0]?.price||0),variations,description,
      features:String(f.get("features")||""),faq:editing?.faq||"",demo:String(f.get("demo")||""),
      activationType:String(f.get("activationType")||"Assisted activation"),
      rating:Math.min(5,Math.max(0,Number(f.get("rating")||4.9))),reviewCount:Math.max(0,Number(f.get("reviewCount")||0)),
      information,image,imageName,download,downloadName,
    };
    persist(mode==="edit"?products.map(x=>x.id===editing?.id?product:x):[product,...products]);
    setSaved(true);setMessage(`${product.name} saved and connected to the storefront.`);
  }
  function remove(product:StoreProduct){if(confirm(`Delete ${product.name}? This cannot be undone in the local prototype.`))persist(products.filter(x=>x.id!==product.id))}

  return <main className="admin-root"><AdminSidebar active="products"/><section className="admin-workspace"><AdminTop/>
    {mode==="list"?<><div className="admin-page-title"><div><span className="eyebrow">Content management</span><h1>Products</h1><p>Add, edit, publish and organize every storefront product.</p></div><a href="/admin/products/new">Add new product +</a></div>
    <section className="product-admin-stats">{[["All products",products.length],["Published",products.filter(x=>x.status==="Published").length],["Drafts",products.filter(x=>x.status==="Draft").length],["Categories",categories.length]].map(x=><article key={String(x[0])}><span>{x[0]}</span><strong>{x[1]}</strong></article>)}</section>
    <section className="admin-card product-list-card"><div className="product-toolbar"><label>⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." /></label><select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select><select value={status} onChange={e=>setStatus(e.target.value)}><option>All status</option><option>Published</option><option>Draft</option></select></div>
    <div className="product-admin-table"><div className="product-table-head"><span>Product</span><span>Category</span><span>License</span><span>Variations</span><span>Starting price</span><span>Status</span><span>Action</span></div>{visible.map(p=><div className="product-table-row" key={p.id}><span className="admin-product-name">{p.image?<img src={p.image} alt=""/>:<i>{p.name.charAt(0)}</i>}<b>{p.name}<small>/{p.id}</small></b></span><span>{p.category}</span><span>{p.license}</span><span>{p.variations.length}</span><strong>৳ {p.price.toLocaleString("en-US")}</strong><em className={p.status.toLowerCase()}>{p.status}</em><span className="product-row-actions"><a href={`/product?id=${p.id}`} target="_blank">View</a><a href={`/admin/products/edit?id=${p.id}`}>Edit</a><button onClick={()=>remove(p)}>×</button></span></div>)}</div></section></>:
    <><div className="admin-page-title"><div><span className="eyebrow">Product management</span><h1>{mode==="new"?"Add Product":"Edit Product"}</h1><p>Configure storefront content, pricing, variations, media and delivery.</p></div><a className="admin-export" href="/admin/products">Back to products →</a></div>
    <form className="product-editor" onSubmit={submit}><div className="product-editor-main">
      <EditorCard title="Basic information"><div className="editor-grid"><Field label="Product name"><input name="name" required defaultValue={editing?.name}/></Field><Field label="Category"><input name="category" list="product-categories" required defaultValue={editing?.category}/><datalist id="product-categories">{categories.map(x=><option value={x} key={x}/>)}</datalist></Field><Field label="License duration"><select name="license" defaultValue={editing?.license||"One Year"}><option>One Year</option><option>Lifetime</option></select></Field><Field label="Publish status"><select name="status" defaultValue={editing?.status||"Published"}><option>Published</option><option>Draft</option></select></Field><Field label="Rating score (0–5)"><input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={editing?.rating??4.9}/></Field><Field label="Verified review count"><input name="reviewCount" type="number" min="0" step="1" defaultValue={editing?.reviewCount??5}/></Field></div><Field label="Product description"><RichTextEditor value={description} onChange={setDescription}/></Field></EditorCard>
      <EditorCard title="Variations & pricing"><div className="variation-editor">{variations.map((v,i)=><div key={i}><input aria-label="Variation name" value={v.label} onChange={e=>setVariations(variations.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><label>৳ <input aria-label="Variation price" type="number" min="0" value={v.price} onChange={e=>setVariations(variations.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))}/></label><button type="button" onClick={()=>setVariations(variations.filter((_,j)=>j!==i))}>×</button></div>)}</div><button className="add-row-button" type="button" onClick={()=>setVariations([...variations,{label:"New variation",price:0}])}>+ Add variation</button></EditorCard>
      <EditorCard title="Product information table"><p className="editor-card-note">These rows appear beside the product image on the Product Details page.</p><div className="information-editor">{information.map((row,i)=><div key={i}><input aria-label="Information label" value={row.label} placeholder="Label" onChange={e=>setInformation(information.map((x,j)=>j===i?{...x,label:e.target.value}:x))}/><input aria-label="Information value" value={row.value} placeholder="Value" onChange={e=>setInformation(information.map((x,j)=>j===i?{...x,value:e.target.value}:x))}/><button type="button" onClick={()=>setInformation(information.filter((_,j)=>j!==i))}>×</button></div>)}</div><button className="add-row-button" type="button" onClick={()=>setInformation([...information,{label:"New information",value:"Value"}])}>+ Add information row</button></EditorCard>
      <EditorCard title="Product page content"><Field label="Features (one per line)"><textarea name="features" defaultValue={editing?.features} placeholder={"Official product\nFast activation\nReliable updates"}/></Field><p className="editor-card-note">The same global Product FAQ is used for every product and can be managed from Products → Product FAQ.</p></EditorCard>
    </div><aside className="product-editor-side">
      <EditorCard title="Product media"><label className="image-upload-placeholder">{image?<img src={image} alt="Product preview"/>:<><i>◇</i><b>Upload product image</b><small>PNG, JPG or WebP · max 1.5 MB</small></>}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>upload(e.target.files?.[0],"image")}/><span>{imageName||"Choose image"}</span></label></EditorCard>
      <EditorCard title="Links & delivery"><Field label="Live demo URL"><input name="demo" type="url" defaultValue={editing?.demo} placeholder="https://..."/></Field><Field label="Download file"><label className="file-picker">{downloadName||"No file selected"}<input type="file" onChange={e=>upload(e.target.files?.[0],"download")}/><span>Choose</span></label></Field><Field label="Activation type"><select name="activationType" defaultValue={editing?.activationType||"Assisted activation"}><option>Assisted activation</option><option>Download only</option><option>License key</option></select></Field></EditorCard>
      {message&&<p className={saved?"editor-saved":"editor-warning"}>{saved?"✓ ":""}{message}</p>}<button className="publish-product" type="submit">{mode==="new"?"Save & Publish Product":"Update Product"} ↗</button><button className="save-draft" type="submit" onClick={e=>{const form=e.currentTarget.form;form?.querySelector<HTMLSelectElement>('select[name="status"]')?.setAttribute("value","Draft")}}>Save changes</button>
    </aside></form></>}</section></main>;
}
function AdminTop(){return <header className="admin-topbar"><label><span>⌕</span><input placeholder="Search products, orders, customers..." /></label><div><button>♟</button><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>}
function EditorCard({title,children}:{title:string;children:ReactNode}){return <section className="admin-card editor-card"><h2>{title}</h2>{children}</section>}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="editor-field"><span>{label}</span>{children}</label>}
export function RichTextEditor({value,onChange}:{value:string;onChange:(value:string)=>void}){
  const editor=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(editor.current&&editor.current.innerHTML!==value)editor.current.innerHTML=value},[value]);
  function run(command:string,argument?:string){
    editor.current?.focus();
    document.execCommand(command,false,argument);
    onChange(editor.current?.innerHTML||"");
  }
  function link(){
    const url=prompt("Enter link URL","https://");
    if(url)run("createLink",url);
  }
  return <div className="rich-text-editor">
    <div className="rich-text-toolbar" onMouseDown={e=>{if((e.target as HTMLElement).closest("button"))e.preventDefault()}}>
      <select aria-label="Text style" defaultValue="p" onChange={e=>run("formatBlock",e.target.value)}><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option></select>
      <button type="button" title="Bold" onClick={()=>run("bold")}><b>B</b></button>
      <button type="button" title="Italic" onClick={()=>run("italic")}><i>I</i></button>
      <button type="button" title="Bulleted list" onClick={()=>run("insertUnorderedList")}>• List</button>
      <button type="button" title="Numbered list" onClick={()=>run("insertOrderedList")}>1. List</button>
      <button type="button" title="Add link" onClick={link}>Link</button>
      <button type="button" title="Remove formatting" onClick={()=>run("removeFormat")}>Clear</button>
    </div>
    <div ref={editor} className="rich-text-canvas" contentEditable suppressContentEditableWarning data-placeholder="Write and format the complete product description..." onInput={e=>onChange(e.currentTarget.innerHTML)}/>
  </div>
}
function fileToData(file:File){return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})}
