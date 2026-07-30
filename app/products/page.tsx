"use client";
import { useEffect, useMemo, useState } from "react";
import SiteFooter from "../SiteFooter";
import { loadProducts, StoreProduct } from "../productStore";
import MainHeader from "../MainHeader";

function Arrow(){return <span aria-hidden="true">↗</span>}
export default function ProductsPage(){
  const [products,setProducts]=useState<StoreProduct[]>([]);
  const [category,setCategory]=useState("All products"),[query,setQuery]=useState("");
  const [selected,setSelected]=useState<Record<string,number>>({});
  useEffect(()=>{
    const sync=()=>setProducts(loadProducts().filter(x=>x.status==="Published"));sync();
    window.addEventListener("mr-products-updated",sync);window.addEventListener("storage",sync);
    return()=>{window.removeEventListener("mr-products-updated",sync);window.removeEventListener("storage",sync)}
  },[]);
  const categories=["All products",...Array.from(new Set(products.map(x=>x.category)))];
  const visible=useMemo(()=>products.filter(p=>(category==="All products"||p.category===category)&&(!query||`${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()))),[products,category,query]);
  return <main>
    <MainHeader active="products"/>
    <section className="products-hero"><div className="shell products-hero-grid"><div><span className="eyebrow">Premium WordPress tools</span><h1>Reliable tools at a <em>practical price.</em></h1><p>Choose trusted themes, plugins and business tools with clear licensing, fast activation and direct support.</p></div><div className="products-hero-proof"><article><b>{products.length}+</b><span>Published products</span></article><article><b>Fast</b><span>License activation</span></article><article><b>Direct</b><span>Expert support</span></article></div></div></section>
    <section className="section product-catalog"><div className="shell"><div className="catalog-toolbar"><div><span className="eyebrow">Browse products</span><h2>Find the right tool for your website.</h2></div><label className="catalog-search"><span>⌕</span><input id="product-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></label></div>
      <div className="category-filter">{categories.map(x=><button className={category===x?"active":""} key={x} onClick={()=>setCategory(x)}>{x}</button>)}</div><div className="catalog-summary"><p><b>{visible.length}</b> products available</p><span>Secure payment · Fast delivery · Direct support</span></div>
      {visible.length?<div className="catalog-grid">{visible.map((p,index)=>{const choice=selected[p.id]||0;const variation=p.variations[choice]||p.variations[0];return <article className="catalog-card" key={p.id}><div className={`catalog-art catalog-art-${index%5+1}`}>{p.image?<img src={p.image} alt={p.name}/>:<strong>{p.name.charAt(0)}</strong>}<span className="product-verified"><i/> {p.license}</span><div><i/><i/><i/></div></div><div className="catalog-copy"><span className="product-category">{p.category}</span><h3>{p.name}</h3><div className="catalog-price">৳ {variation.price.toLocaleString("en-US")}</div><div className="variation-options">{p.variations.map((v,i)=><button className={choice===i?"active":""} key={v.label} onClick={()=>setSelected(s=>({...s,[p.id]:i}))}>{v.label}</button>)}</div><div className="catalog-footer"><span>{p.activationType}</span><a href={`/product?id=${p.id}`}>View details <Arrow/></a></div></div></article>})}</div>:<div className="catalog-empty"><b>No products found</b><p>Try another keyword or category.</p></div>}
    </div></section>
    <section className="catalog-help"><div className="shell"><div><span className="eyebrow">Need help choosing?</span><h2>Not sure which product fits your website?</h2><p>Tell me what you want to build, and I’ll help you choose the right tool.</p></div><a className="button primary" href="#support">Ask for a recommendation <Arrow/></a></div></section><SiteFooter/>
  </main>
}
