"use client";

import { useEffect, useState } from "react";
import SiteFooter from "../SiteFooter";

type User = { name: string; email: string; phone?: string; lifetimeSpend?: number };
type Membership = { level: string; discount: string; nextLabel: string; current: { discountPercent: number }; next: { name: string; discountPercent: number } | null; remaining: number; tiers: { name: string; minimumSpend: number; discountPercent: number }[] };
type Order = { number: string; status: string; payment: string; total: number; items?: { name: string; variation: string }[] };

const navItems = [["⌂","Dashboard","/account"],["▣","Orders","/account/orders"],["↓","Downloads","/account/downloads"],["♛","Membership","/account/membership"],["▰","Support Tickets","/account/support-tickets"],["⚙","Activation Requests","/account/activation-requests"],["♡","Wishlist","/account/wishlist"]];
const lowerNav = [["♙","Account Details","/account/account-details"],["◆","Addresses","/account/addresses"],["▣","Payment Methods","/account/payment-methods"]];
const quickActions = [["▣","My Orders","View all your orders and order details.","View Orders"],["↓","Downloads","Access your purchased products and files.","View Downloads"],["◉","Support Tickets","Submit a new ticket or view all tickets.","View Tickets"],["⚿","Activation Request","Request plugin or theme activation support.","New Request"],["♡","Wishlist","View your saved items and products.","View Wishlist"]];

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => { fetch("/api/customer/session", { cache: "no-store" }).then(async (response) => { const result = await response.json(); if (!response.ok) return void window.location.assign("/login"); setUser(result.customer); setMembership(result.membership); setOrder(result.latestOrder); }).catch(() => window.location.assign("/login")); }, []);
  async function logout() { await fetch("/api/customer/session", { method: "DELETE" }); window.location.assign("/login"); }
  if (!user) return <main className="account-loading">Loading your account…</main>;
  const spent = Number(user.lifetimeSpend || 0);
  const remaining = membership?.remaining || 0;
  const progress = membership?.next ? Math.min(100, (spent / Math.max(1, spent + remaining)) * 100) : 100;
  const level = membership?.level || "Silver";
  const discountPercent = membership?.current.discountPercent || 0;
  const nextLevel = membership?.next?.name || "Top tier";

  return <main>
    <section className="portal-page">
      <div className="portal-shell">
        <aside className="portal-sidebar">
          <a className="portal-logo" href="/"><span className="brand-mark">MR</span><span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span></a>
          <nav>{navItems.map(([icon,label,url],i)=><a className={i===0?"active":""} href={url} key={label}><i>{icon}</i><span>{label}</span>{["Orders","Downloads","Support Tickets","Activation Requests"].includes(label)&&<b>{order&&label==="Orders"?1:0}</b>}</a>)}</nav>
          <nav className="portal-secondary-nav">{lowerNav.map(([icon,label,url])=><a href={url} key={label}><i>{icon}</i><span>{label}</span></a>)}<button onClick={logout}><i>↪</i><span>Logout</span></button></nav>
          <div className="portal-help"><i>◉</i><h3>Need Help?</h3><p>We are here to help you.</p><a href="#support-tickets">Create Ticket</a></div>
        </aside>
        <div className="portal-main">
          <div className="portal-top"><label><input placeholder="Search orders, products, tickets..." /><span>⌕</span></label><button aria-label="Notifications">♟</button><div className="portal-user"><span>{user.name.charAt(0)}</span><b>{user.name}</b></div></div>
          <section className="portal-hero">
            <div className="portal-welcome"><span className="portal-avatar">{user.name.charAt(0)}</span><div><h1>Welcome back,<br/>{user.name}! <i>✦</i></h1><p><span>♙ {level} Member</span><span>▣ Member since 2026</span></p></div></div>
            <div className="portal-membership"><small>Your Membership</small><h2>♙ {level} Member</h2><div className="member-metrics"><span><small>Lifetime Purchase</small><b>৳ {spent.toLocaleString("en-US")}</b></span><span><small>Current Discount</small><b>{discountPercent}%</b></span><span><small>Next: {nextLevel}</small><b>{membership?.next?.discountPercent || discountPercent}%</b></span></div><p>✦ {membership?.next ? `Spend ৳ ${remaining.toLocaleString("en-US")} more to unlock ${nextLevel} Benefits` : "You have reached the highest membership level"} <b>{progress.toFixed(0)}%</b></p><div className="portal-progress"><span style={{width:`${progress}%`}}/></div><em>You are now getting {discountPercent}% discount. {membership?.next ? `Next level gives ${membership.next.discountPercent}% discount.` : "Enjoy your highest-tier benefits."}</em></div>
          </section>
          <section className="portal-stats">
            {[["▣",order?1:0,"Total Orders","View Orders →"],["৳",spent.toLocaleString("en-US"),"Total Spent","View details →"],["↓",order?.items?.length||0,"Downloads","View downloads →"],["◉",0,"Support Tickets","View tickets →"],["⚿",0,"Activation Requests","View requests →"]].map(([icon,value,label,link])=><article key={String(label)}><i>{icon}</i><strong>{label==="Total Spent"&&"৳ "}{value}</strong><b>{label}</b><a href="#quick-actions">{link}</a></article>)}
          </section>
          <section className="tier-strip">{(membership?.tiers || []).map((tier,i)=>{const next=membership?.tiers[i+1];const range=next?`৳ ${tier.minimumSpend.toLocaleString("en-US")} – ${(next.minimumSpend-1).toLocaleString("en-US")}`:`৳ ${tier.minimumSpend.toLocaleString("en-US")}+`;return <div className={tier.name===level?"current":""} key={tier.name}><i>{i+1}</i><b>{tier.name}</b><small>{range}</small><strong>{tier.discountPercent}% OFF</strong></div>})}</section>
          <div className="upgrade-notice"><p>🔥 {membership?.next ? <>You are just <b>৳ {remaining.toLocaleString("en-US")}</b> away from {nextLevel} Member and {membership.next.discountPercent}% discount on all products!</> : <>You have reached the highest membership tier.</>}</p><a href="/products">Shop Now ↗</a></div>
          <section className="portal-box" id="quick-actions"><div className="portal-heading"><h2>Quick Actions</h2><a href="/account/orders">View all →</a></div><div className="quick-grid">{quickActions.map(([icon,title,text,action])=><article key={title}><i>{icon}</i><h3>{title}</h3><p>{text}</p><a href={title==="My Orders"?"/account/orders":title==="Downloads"?"/account/downloads":title==="Support Tickets"?"/account/support-tickets":title==="Activation Request"?"/account/activation-requests":"/account/wishlist"}>{action}</a></article>)}</div></section>
          <section className="portal-recent">
            <article><div className="portal-heading"><h2>Recent Orders</h2><a href="#orders">View all orders →</a></div>{order?<div className="recent-order-row"><span><small>{order.number}</small><b>৳ {order.total.toLocaleString("en-US")}</b></span><em>{order.status}</em></div>:<div className="portal-empty"><i>◆</i><b>No recent orders yet</b><p>Your recent purchases will appear here.</p></div>}</article>
            <article><div className="portal-heading"><h2>Latest Downloads</h2><a href="#downloads">View all downloads →</a></div><div className="portal-empty"><i>↓</i><b>No downloads available yet.</b><p>Your purchased files will appear here.</p></div></article>
            <article><div className="portal-heading"><h2>Recent Tickets</h2><a href="#tickets">View all tickets →</a></div><div className="portal-empty"><i>◈</i><b>No tickets yet</b><p>Create a ticket when you need help.</p></div></article>
          </section>
        </div>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
