"use client";

import { type ReactNode, useEffect, useState } from "react";
import SiteFooter from "../SiteFooter";

type User = { name: string; email: string; lifetimeSpend?: number; createdAt?: string };
type Membership = { level: string; current: { discountPercent: number }; next: { name: string; discountPercent: number } | null; remaining: number; tiers: { name: string; minimumSpend: number; discountPercent: number }[] };
type Order = { number: string; status: string; payment: string; total: number; createdAt: string; products: string };
type SupportUpdate = { id: string; authorType: string; authorName: string; body: string; createdAt: string; subject: string; orderNumber: string };
type Ticket = { id: string; subject: string; status: string; priority: string; orderNumber: string; updatedAt: string };
type Dashboard = { orderCount: number; completedOrderCount: number; downloadCount: number; supportTicketCount: number; activationRequestCount: number };

const nav = [["⌂", "Dashboard", "/account"], ["▣", "Orders", "/account/orders"], ["↓", "Downloads", "/account/downloads"], ["♛", "Membership", "/account/membership"], ["▰", "Support Tickets", "/account/support-tickets"], ["⚙", "Activation Requests", "/account/activation-requests"], ["♡", "Wishlist", "/account/wishlist"]];
const money = (value: number) => `৳ ${Number(value || 0).toLocaleString("en-US")}`;
const shortDate = (value: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const title = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentSupport, setRecentSupport] = useState<SupportUpdate[]>([]);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/api/customer/session", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) return void window.location.assign("/login");
      setUser(result.customer); setMembership(result.membership); setDashboard(result.dashboard);
      setRecentOrders(result.recentOrders || []); setRecentSupport(result.recentSupport || []); setRecentTickets(result.recentTickets || []);
    }).catch(() => window.location.assign("/login"));
  }, []);

  async function logout() { await fetch("/api/customer/session", { method: "DELETE" }); window.location.assign("/login"); }
  if (!user) return <main className="account-loading">Loading your account…</main>;

  const spent = Number(user.lifetimeSpend || 0);
  const level = membership?.level || "Silver";
  const discount = membership?.current.discountPercent || 0;
  const remaining = membership?.remaining || 0;
  const progress = membership?.next ? Math.min(100, spent / Math.max(1, spent + remaining) * 100) : 100;
  const memberSince = user.createdAt ? shortDate(user.createdAt) : "Member account";

  return <main><section className="portal-page"><div className="portal-shell">
    <aside className="portal-sidebar"><a className="portal-logo" href="/"><span className="brand-mark">MR</span><span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span></a><nav>{nav.map(([icon, label, href], index) => <a className={index === 0 ? "active" : ""} href={href} key={label}><i>{icon}</i><span>{label}</span>{label === "Orders" && <b>{dashboard?.orderCount || 0}</b>}{label === "Downloads" && <b>{dashboard?.downloadCount || 0}</b>}{label === "Support Tickets" && <b>{dashboard?.supportTicketCount || 0}</b>}{label === "Activation Requests" && <b>{dashboard?.activationRequestCount || 0}</b>}</a>)}</nav><nav className="portal-secondary-nav"><a href="/account/account-details"><i>♙</i><span>Account Details</span></a><a href="/account/addresses"><i>◆</i><span>Addresses</span></a><a href="/account/payment-methods"><i>▣</i><span>Payment Methods</span></a><button onClick={logout}><i>↪</i><span>Logout</span></button></nav><aside className="dashboard-support-card dashboard-sidebar-support"><i>♧</i><span className="eyebrow">Support centre</span><h2>Need help?</h2><p>Our support team is ready to help with your product.</p><a href="/account/support-tickets">Create Ticket →</a></aside></aside>
    <div className="portal-main"><div className="portal-top"><label><input placeholder="Search orders, products, tickets..." /><span>⌕</span></label><div className="portal-user"><span>{user.name.charAt(0)}</span><b>{user.name}</b></div></div>
      <section className="portal-hero"><div className="portal-welcome"><span className="portal-avatar">{user.name.charAt(0)}</span><div><h1>Welcome back,<br />{user.name}!</h1><p className="portal-membership-badges"><span>♛ {level} Member</span><span>◷ Member since {memberSince}</span></p></div></div><div className="portal-membership"><small>Your Membership</small><h2>♛ {level} Member</h2><div className="member-metrics"><span><small>Lifetime Purchase</small><b>{money(spent)}</b></span><span><small>Current Discount</small><b>{discount}%</b></span><span><small>Next: {membership?.next?.name || "Top tier"}</small><b>{membership?.next?.discountPercent || discount}%</b></span></div><p><span>{membership?.next ? `Spend ${money(remaining)} more to unlock ${membership.next.name}` : "You have reached the highest membership level"}</span><b>{progress.toFixed(0)}%</b></p><div className="portal-progress"><span style={{ width: `${progress}%` }} /></div><em>Your discount is automatically applied during checkout.</em></div></section>
      <section className="portal-stats"><Stat icon="▣" value={dashboard?.orderCount || 0} label="Total Orders" href="/account/orders" /><Stat icon="৳" value={money(spent)} label="Total Spent" href="/account/membership" /><Stat icon="↓" value={dashboard?.downloadCount || 0} label="Downloads" href="/account/downloads" /><Stat icon="▰" value={dashboard?.supportTicketCount || 0} label="Support Tickets" href="/account/support-tickets" /><Stat icon="⚙" value={dashboard?.activationRequestCount || 0} label="Activation Requests" href="/account/activation-requests" /></section>
      <section className="tier-strip">{(membership?.tiers || []).map((tier) => <div className={tier.name === level ? "current" : ""} key={tier.name}><b>{tier.name}</b><small>{money(tier.minimumSpend)}+</small><strong>{tier.discountPercent}% OFF</strong></div>)}</section>
      <div className="upgrade-notice"><p>{membership?.next ? <>🔥 You are just <b>{money(remaining)}</b> away from {membership.next.name} Member.</> : "You have reached the highest membership tier."}</p><a href="/products">Shop Now ↗</a></div>
      <section className="dashboard-quick-actions"><header><div><span className="eyebrow">Customer shortcuts</span><h2>Quick Actions</h2></div><a href="/account/account-details">View account →</a></header><div>{[{ icon: "▣", title: "My Orders", text: "View all orders and secure order details.", action: "View Orders", href: "/account/orders" }, { icon: "↓", title: "Downloads", text: "Access your purchased products and files.", action: "View Downloads", href: "/account/downloads" }, { icon: "▰", title: "Support Tickets", text: "Submit a new ticket or check replies.", action: "View Tickets", href: "/account/support-tickets" }, { icon: "⚙", title: "Activation Requests", text: "Send website access for activation.", action: "New Request", href: "/account/activation-requests" }, { icon: "♡", title: "Wishlist", text: "View your saved products and tools.", action: "View Wishlist", href: "/account/wishlist" }].map(action => <article key={action.title}><i>{action.icon}</i><h3>{action.title}</h3><p>{action.text}</p><a href={action.href}>{action.action} →</a></article>)}</div></section>
      <section className="dashboard-live-area"><section className="dashboard-activity-grid"><ActivityCard title="Recent Orders" link="/account/orders" linkText="View all orders" emptyIcon="▣" emptyTitle="No recent orders yet" emptyText="Your purchases will appear here.">{recentOrders.map(order => <a className="dashboard-activity-row" href={`/account/orders/${encodeURIComponent(order.number)}`} key={order.number}><span><b>{order.number}</b><small>{order.products || order.payment} · {shortDate(order.createdAt)}</small></span><strong>{money(order.total)}</strong><em>{title(order.status)}</em></a>)}</ActivityCard><ActivityCard title="Recent Support" link="/account/support-tickets" linkText="Open support" emptyIcon="♧" emptyTitle="No support activity yet" emptyText="Your support updates will appear here.">{recentSupport.map(update => <a className="dashboard-activity-row" href="/account/support-tickets" key={update.id}><span><b>{update.subject}</b><small>{update.authorType === "admin" ? "Support team replied" : `${update.authorName} replied`} · {shortDate(update.createdAt)}</small></span><em>{update.orderNumber}</em></a>)}</ActivityCard><ActivityCard title="Recent Tickets" link="/account/support-tickets" linkText="View all tickets" emptyIcon="▰" emptyTitle="No tickets yet" emptyText="Create a ticket whenever you need help.">{recentTickets.map(ticket => <a className="dashboard-activity-row" href="/account/support-tickets" key={ticket.id}><span><b>{ticket.subject}</b><small>{ticket.orderNumber} · {shortDate(ticket.updatedAt)}</small></span><em className={`ticket-${ticket.status}`}>{title(ticket.status)}</em></a>)}</ActivityCard></section></section>
    </div>
  </div></section><SiteFooter /></main>;
}

function Stat({ icon, value, label, href }: { icon: string; value: string | number; label: string; href: string }) { return <article><i>{icon}</i><strong>{value}</strong><b>{label}</b><a href={href}>View details →</a></article>; }
function Empty({ icon, title, text }: { icon: string; title: string; text: string }) { return <div className="portal-empty"><i>{icon}</i><b>{title}</b><p>{text}</p></div>; }
function ActivityCard({ title, link, linkText, emptyIcon, emptyTitle, emptyText, children }: { title: string; link: string; linkText: string; emptyIcon: string; emptyTitle: string; emptyText: string; children: ReactNode }) { const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children); return <article className="dashboard-activity-card"><header><h2>{title}</h2><a href={link}>{linkText} →</a></header>{hasItems ? <div className="dashboard-activity-list">{children}</div> : <Empty icon={emptyIcon} title={emptyTitle} text={emptyText} />}</article>; }
