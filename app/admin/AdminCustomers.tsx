"use client";

import { useCallback, useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminCustomers.module.css";

type Customer = { id: string; name: string; email: string; phone: string; lifetimeSpend: number; createdAt: string; hasAccount: boolean; orderCount: number; lastOrderAt?: string; membership: { level: string; discountPercent: number } };
type Stats = { total: number; registered: number; purchasers: number; paying: number };
const emptyStats: Stats = { total: 0, registered: 0, purchasers: 0, paying: 0 };
const date = (value?: string) => value ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(new Date(value)) : "No orders yet";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]), [stats, setStats] = useState<Stats>(emptyStats), [search, setSearch] = useState(""), [page, setPage] = useState(1), [pages, setPages] = useState(1), [total, setTotal] = useState(0), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/customers?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Customers could not be loaded.");
      setCustomers(data.customers || []); setStats({ ...emptyStats, ...data.stats }); setPages(data.pagination.pages); setTotal(data.pagination.total);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Customers could not be loaded."); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { const timer = window.setTimeout(() => void load(), 220); return () => window.clearTimeout(timer); }, [load]);
  const initials = (name: string) => name.trim().charAt(0).toUpperCase() || "C";
  return <main className="admin-root"><AdminSidebar active="customers"/><section className="admin-workspace">
    <header className="admin-topbar"><label><span>⌕</span><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search customer name, email or phone..."/></label><div><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>
    <div className="admin-page-title"><div><span className="eyebrow">CUSTOMER MANAGEMENT</span><h1>Customers</h1><p>View registered accounts, purchase history and customer value in one place.</p></div><button className="admin-outline-button" onClick={() => void load()}>Refresh customers ↻</button></div>
    <section className="admin-kpis customer-kpis"><article><i>♟</i><div><span>All customers</span><strong>{stats.total}</strong></div></article><article><i className="kpi-1">✓</i><div><span>Registered accounts</span><strong>{stats.registered}</strong></div></article><article><i className="kpi-2">▣</i><div><span>Purchased at least once</span><strong>{stats.purchasers}</strong></div></article><article><i className="kpi-3">৳</i><div><span>Paying customers</span><strong>{stats.paying}</strong></div></article></section>
    <section className="admin-card customers-panel"><header className="customers-panel-head"><div><span className="eyebrow">CUSTOMER DIRECTORY</span><h2>{total} customer{total === 1 ? "" : "s"}</h2></div><span>Highest lifetime spend first</span></header>{error && <p className="admin-error-message">{error}</p>}<div className="customers-table"><div className={`${styles.tableHead} customers-table-head`}><span>Customer</span><span>Membership</span><span>Account</span><span>Orders</span><span>Lifetime spend</span><span>Last activity</span><span>Action</span></div>{loading ? <p className="customers-state">Loading customers…</p> : customers.length ? customers.map(customer => <article className={styles.row} key={customer.id}><span className="customer-cell"><i>{initials(customer.name)}</i><span><b>{customer.name}</b><small>{customer.email}<br/>{customer.phone}</small></span></span><span><em className={`${styles.membership} ${styles[customer.membership.level.toLowerCase()] || ""}`}>{customer.membership.level}<small>{customer.membership.discountPercent}% off</small></em></span><span><em className={customer.hasAccount ? "customer-account active" : "customer-account"}>{customer.hasAccount ? "Registered" : "Order customer"}</em></span><strong>{customer.orderCount}</strong><strong>৳ {customer.lifetimeSpend.toLocaleString("en-US")}</strong><span className="customer-date">{date(customer.lastOrderAt || customer.createdAt)}<small>{customer.lastOrderAt ? "Latest order" : "Joined"}</small></span><a className={styles.action} href={`/admin/customers/${encodeURIComponent(customer.id)}`}>View profile →</a></article>) : <p className="customers-state">No customers found for this search.</p>}</div><footer className="customers-pagination"><button disabled={page <= 1} onClick={() => setPage(current => current - 1)}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(current => current + 1)}>Next →</button></footer></section>
  </section></main>;
}
