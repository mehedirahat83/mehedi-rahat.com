"use client";
import { useEffect,useMemo,useState } from "react";
import SiteFooter from "../SiteFooter";
import { loadThemes,ReadyTheme } from "../themeStore";
import MainHeader from "../MainHeader";

function Arrow(){return <span aria-hidden="true">↗</span>}

export default function ThemesPage(){
  const [themes,setThemes]=useState<ReadyTheme[]>([]),[category,setCategory]=useState("All themes"),[query,setQuery]=useState("");
  useEffect(()=>{
    const sync=()=>setThemes(loadThemes().filter(theme=>theme.status==="Published"));
    sync();
    window.addEventListener("mr-themes-updated",sync);window.addEventListener("storage",sync);
    return()=>{window.removeEventListener("mr-themes-updated",sync);window.removeEventListener("storage",sync)}
  },[]);
  const categories=["All themes",...Array.from(new Set(themes.map(theme=>theme.category)))];
  const visible=useMemo(()=>themes.filter(theme=>(category==="All themes"||theme.category===category)&&(!query||`${theme.name} ${theme.category}`.toLowerCase().includes(query.toLowerCase()))),[themes,category,query]);
  return <main>
    <MainHeader active="themes"/>
    <section className="products-hero themes-catalog-hero"><div className="shell products-hero-grid"><div><span className="eyebrow">Professionally prepared websites</span><h1>Launch faster with a <em>ready-made theme.</em></h1><p>Choose a complete website layout, then customize the content, colors and essential features for your business.</p></div><div className="products-hero-proof"><article><b>{themes.length}+</b><span>Published themes</span></article><article><b>Ready</b><span>Essential pages</span></article><article><b>Flexible</b><span>Easy customization</span></article></div></div></section>
    <section className="section product-catalog theme-catalog"><div className="shell"><div className="catalog-toolbar"><div><span className="eyebrow">Browse ready themes</span><h2>Find a strong starting point for your website.</h2></div><label className="catalog-search"><span>⌕</span><input id="theme-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search ready themes..."/></label></div>
      <div className="category-filter">{categories.map(item=><button className={category===item?"active":""} key={item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      <div className="catalog-summary"><p><b>{visible.length}</b> themes available</p><span>Responsive design · Ready pages · Direct customization support</span></div>
      {visible.length?<div className="catalog-grid theme-catalog-grid">{visible.map((theme,index)=><article className="catalog-card theme-catalog-card" key={theme.id}><a className={`catalog-art catalog-art-${index%5+1}`} href={`/theme?id=${theme.id}`}>{theme.catalogImage?<img src={theme.catalogImage} alt={theme.name}/>:<div className="theme-browser-preview"><span/><i/><b>{theme.name.charAt(0)}</b><em/><em/><em/></div>}<span className="product-verified">{theme.pages} pages</span></a><div className="catalog-copy"><span className="product-category">{theme.category}</span><h3><a href={`/theme?id=${theme.id}`}>{theme.name}</a></h3><div className="theme-card-meta"><span>Complete website</span><strong>BDT {theme.price.toLocaleString("en-US")}</strong></div><div className="theme-feature-chips">{theme.features.split("\n").filter(Boolean).slice(0,2).map(feature=><span key={feature}>✓ {feature}</span>)}</div><div className="catalog-footer"><span>{theme.demo?<a href={theme.demo} target="_blank">Live demo <Arrow/></a>:"Ready to customize"}</span><a href={`/theme?id=${theme.id}`}>View details <Arrow/></a></div></div></article>)}</div>:<div className="catalog-empty"><b>No themes found</b><p>Try another keyword or category.</p></div>}
    </div></section>
    <section className="catalog-help"><div className="shell"><div><span className="eyebrow">Need a unique design?</span><h2>Start with a theme or request a custom website.</h2><p>Tell me about your business and I’ll recommend the best starting point.</p></div><a className="button primary" href="/#support">Discuss your website <Arrow/></a></div></section>
    <SiteFooter/>
  </main>
}
