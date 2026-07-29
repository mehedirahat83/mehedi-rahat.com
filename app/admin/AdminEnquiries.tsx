"use client";

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "./AdminSidebar";

type Status = "new" | "in_progress" | "replied" | "closed";
type Enquiry = {
  id: string; name: string; email: string; mobile: string; service: string;
  details: string; status: Status; sourcePath: string;
  emailStatus: "pending" | "sent" | "not_configured" | "failed";
  createdAt: number; updatedAt: number;
};
const statuses: Status[] = ["new", "in_progress", "replied", "closed"];
const statusLabel: Record<Status, string> = {
  new: "New", in_progress: "In progress", replied: "Replied", closed: "Closed",
};
const formatDate = (value: number) => new Intl.DateTimeFormat("en-BD", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
}).format(new Date(value));

function AdminTop() {
  return <header className="admin-topbar">
    <label><span>⌕</span><input placeholder="Search enquiries, customers, services..." /></label>
    <div><button>♟</button><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div>
  </header>;
}

export default function AdminEnquiries() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/enquiries", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load enquiries.");
      setItems(data.enquiries || []);
      setSelectedId((current) => current || data.enquiries?.[0]?.id || "");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load enquiries.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) =>
      (filter === "all" || item.status === filter) &&
      (!query || [item.name, item.email, item.mobile, item.service, item.details]
        .join(" ").toLowerCase().includes(query)));
  }, [filter, items, search]);
  const selected = items.find((item) => item.id === selectedId) || visible[0];

  async function changeStatus(status: Status) {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selected.id, status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Status could not be updated.");
      setItems((current) => current.map((item) =>
        item.id === selected.id ? { ...item, status, updatedAt: Date.now() } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Status could not be updated.");
    } finally { setSaving(false); }
  }

  const whatsapp = selected?.mobile.replace(/\D/g, "").replace(/^0/, "88") || "";
  const count = (status: Status) => items.filter((item) => item.status === status).length;

  return <main className="admin-root">
    <AdminSidebar active="enquiries" />
    <section className="admin-workspace">
      <AdminTop />
      <div className="admin-page-title">
        <div><span className="eyebrow">CUSTOMER COMMUNICATION</span><h1>Enquiries</h1>
          <p>Review requirements, contact customers and track every response.</p></div>
        <button className="admin-outline-button" onClick={() => void load()}>Refresh enquiries ↻</button>
      </div>

      <section className="enquiry-kpis">
        <article><span>All enquiries</span><strong>{items.length}</strong></article>
        <article><span>New</span><strong>{count("new")}</strong></article>
        <article><span>In progress</span><strong>{count("in_progress")}</strong></article>
        <article><span>Closed</span><strong>{count("closed")}</strong></article>
      </section>

      <section className="admin-panel enquiry-panel">
        <div className="enquiry-toolbar">
          <div className="enquiry-filters">
            {(["all", ...statuses] as const).map((status) =>
              <button className={filter === status ? "active" : ""} key={status}
                onClick={() => setFilter(status)}>
                {status === "all" ? "All" : statusLabel[status]}
              </button>)}
          </div>
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone or service..." aria-label="Search enquiries" />
        </div>
        {error && <p className="admin-error-message">{error}</p>}
        <div className="enquiry-admin-layout">
          <div className="enquiry-list">
            {loading && <p className="enquiry-empty">Loading enquiries...</p>}
            {!loading && !visible.length && <p className="enquiry-empty">No enquiries found.</p>}
            {visible.map((item) => <button key={item.id}
              className={`enquiry-list-item ${selected?.id === item.id ? "active" : ""}`}
              onClick={() => setSelectedId(item.id)}>
              <span className={`enquiry-status-dot ${item.status}`} />
              <span className="enquiry-list-copy"><strong>{item.name}</strong>
                <small>{item.service} · {formatDate(item.createdAt)}</small></span>
              <span className={`enquiry-badge ${item.status}`}>{statusLabel[item.status]}</span>
            </button>)}
          </div>

          <aside className="enquiry-detail">
            {!selected ? <p className="enquiry-empty">Select an enquiry to view details.</p> : <>
              <div className="enquiry-detail-head"><div><span className="eyebrow">ENQUIRY DETAILS</span>
                <h2>{selected.name}</h2><p>{selected.service}</p></div>
                <span className={`enquiry-badge ${selected.status}`}>{statusLabel[selected.status]}</span>
              </div>
              <dl className="enquiry-contact-grid">
                <div><dt>Email</dt><dd>{selected.email}</dd></div>
                <div><dt>Mobile</dt><dd>{selected.mobile}</dd></div>
                <div><dt>Received</dt><dd>{formatDate(selected.createdAt)}</dd></div>
                <div><dt>Email alert</dt><dd className={`email-state ${selected.emailStatus}`}>
                  {selected.emailStatus.replace("_", " ")}</dd></div>
              </dl>
              <div className="enquiry-message"><span>Project requirement</span><p>{selected.details}</p></div>
              <div className="enquiry-actions">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.service)} enquiry`}>Reply by email ↗</a>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Open WhatsApp ↗</a>
              </div>
              <label className="enquiry-status-control"><span>Workflow status</span>
                <select disabled={saving} value={selected.status}
                  onChange={(event) => void changeStatus(event.target.value as Status)}>
                  {statuses.map((status) => <option value={status} key={status}>{statusLabel[status]}</option>)}
                </select>
              </label>
            </>}
          </aside>
        </div>
      </section>
    </section>
  </main>;
}
