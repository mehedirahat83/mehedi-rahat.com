"use client";

import { useEffect, useState } from "react";
import { loadProducts } from "./productStore";
import { loadThemes } from "./themeStore";
import { loadServices } from "./serviceStore";
import { loadProjects } from "./projectStore";

type MainHeaderProps = {
  active?: "home" | "services" | "exclusive" | "themes" | "products" | "projects" | "contact";
};

export default function MainHeader({ active }: MainHeaderProps) {
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchItems, setSearchItems] = useState<{title:string;type:string;href:string;keywords:string}[]>([]);

  useEffect(() => {
    const syncCart = () => {
      try {
        const items = JSON.parse(localStorage.getItem("mr-cart") || "[]") as { quantity?: number }[];
        setCartCount(items.reduce((total, item) => total + (item.quantity || 1), 0));
      } catch {
        setCartCount(0);
      }
    };
    syncCart();
    const products=loadProducts().filter(item=>item.status==="Published").map(item=>({title:item.name,type:"Pro Tool",href:`/product?id=${item.id}`,keywords:`${item.name} ${item.category}`}));
    const themes=loadThemes().filter(item=>item.status==="Published").map(item=>({title:item.name,type:"Ready Theme",href:`/theme?id=${item.id}`,keywords:`${item.name} ${item.category}`}));
    const services=loadServices().filter(item=>item.status==="Published").map(item=>({title:item.title,type:"Service",href:"/services",keywords:`${item.title} ${item.description}`}));
    const projects=loadProjects().filter(item=>item.status==="Published").map(item=>({title:item.title,type:"MR Exclusive",href:item.id==="mr-news-pro"?"/mr-news-pro":item.id==="mr-commerce-pro"?"/mr-commerce-pro":"/client-projects",keywords:`${item.title} ${item.category}`}));
    setSearchItems([...products,...themes,...services,...projects]);
    window.addEventListener("storage", syncCart);
    window.addEventListener("mr-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("mr-cart-updated", syncCart);
    };
  }, []);

  const linkClass = (name: MainHeaderProps["active"]) => active === name ? "active-nav" : undefined;
  const results=query.trim()
    ? searchItems.filter(item=>`${item.title} ${item.keywords}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,7)
    : searchItems.slice(0,5);

  return (
    <>
      <div className="topbar">
        <div className="shell topbar-inner">
          <p>Trusted digital products &amp; web solutions</p>
          <div>
            <span>Support: 10AM–10PM</span>
            <a href="/#membership">Membership benefits</a>
            <a className="top-account" href="/account"><i aria-hidden="true">M</i><span><b>My Account</b><small>Orders &amp; membership</small></span><strong aria-hidden="true">→</strong></a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="/" aria-label="Mehedi Rahat home">
            <span className="brand-mark">MR</span>
            <span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            <a className={linkClass("home")} href="/">Home</a>
            <a className={linkClass("services")} href="/services">Services</a>
            <details className={`exclusive-menu ${active === "exclusive" || active === "themes" ? "is-active" : ""}`}>
              <summary>MR Exclusive <span aria-hidden="true">⌄</span></summary>
              <div className="exclusive-dropdown">
                <a href="/mr-commerce-pro"><b>MR Commerce Pro</b><small>Live WooCommerce solution</small></a>
                <a href="/mr-news-pro"><b>MR News Pro</b><small>News publishing solution</small></a>
                <a href="/themes"><b>Ready Themes</b><small>Browse ready website designs</small></a>
              </div>
            </details>
            <a className={linkClass("products")} href="/products">Pro Tools</a>
            <a className={linkClass("projects")} href="/client-projects">Client Projects</a>
            <a className={linkClass("contact")} href="/contact">Contact</a>
          </nav>
          <div className="nav-actions">
            <button className={`premium-search-button ${searchOpen?"active":""}`} type="button" onClick={()=>setSearchOpen(value=>!value)} aria-label="Search website" aria-expanded={searchOpen}><span aria-hidden="true"></span><b>Search</b></button>
            <a className="cart-button" href="/cart"><span>Cart</span><b>{cartCount}</b></a>
          </div>
          <details className="mobile-menu">
            <summary aria-label="Open menu">☰</summary>
            <nav>
              <a href="/">Home</a><a href="/services">Services</a>
              <span>MR Exclusive</span>
              <a className="mobile-sub-link" href="/mr-commerce-pro">MR Commerce Pro</a>
              <a className="mobile-sub-link" href="/mr-news-pro">MR News Pro</a>
              <a className="mobile-sub-link" href="/themes">Ready Themes</a>
              <a href="/products">Pro Tools</a><a href="/client-projects">Client Projects</a><a href="/contact">Contact</a><a href="/account">My Account</a>
            </nav>
          </details>
        </div>
        {searchOpen&&<div className="site-search-panel">
          <div className="shell site-search-inner">
            <div className="site-search-field"><span aria-hidden="true"></span><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search products, ready themes, services..."/><button type="button" onClick={()=>{setSearchOpen(false);setQuery("")}} aria-label="Close search">×</button></div>
            <div className="site-search-results">
              <div className="site-search-title"><b>{query?"Search results":"Popular destinations"}</b><small>{results.length} items</small></div>
              {results.length?results.map(item=><a key={`${item.type}-${item.title}`} href={item.href}><span><b>{item.title}</b><small>{item.type}</small></span><i aria-hidden="true">↗</i></a>):<p>No matching products, themes or services found.</p>}
            </div>
          </div>
        </div>}
      </header>
    </>
  );
}
