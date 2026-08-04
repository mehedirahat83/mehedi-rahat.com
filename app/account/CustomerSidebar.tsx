"use client";

const primary = [["⌂", "Dashboard", "/account"], ["▣", "Orders", "/account/orders"], ["↓", "Downloads", "/account/downloads"], ["♛", "Membership", "/account/membership"], ["▰", "Support Tickets", "/account/support-tickets"], ["⚙", "Activation Requests", "/account/activation-requests"], ["♡", "Wishlist", "/account/wishlist"]];
const secondary = [["♙", "Account Details", "/account/account-details"], ["◆", "Addresses", "/account/addresses"], ["▣", "Payment Methods", "/account/payment-methods"]];

export default function CustomerSidebar({ active }: { active?: string }) {
  async function logout() { await fetch("/api/customer/session", { method: "DELETE" }); window.location.assign("/login"); }
  const link = ([icon, label, href]: string[]) => <a className={active === href ? "active" : ""} href={href} key={label}><i>{icon}</i><span>{label}</span></a>;
  return <aside className="portal-sidebar portal-inner-sidebar"><a className="portal-logo" href="/"><span className="brand-mark">MR</span><span><b>MEHEDI RAHAT</b><small>Digital Growth Partner</small></span></a><nav>{primary.map(link)}</nav><nav className="portal-secondary-nav">{secondary.map(link)}<button type="button" onClick={logout}><i>↪</i><span>Logout</span></button></nav></aside>;
}
