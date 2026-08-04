"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import "./AdminSmtpSettings.module.css";

type Settings = {
  configured: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  fromEmail: string;
  fromName: string;
  notificationEmail: string;
};

const empty: Settings = {
  configured: false,
  host: "",
  port: 587,
  secure: false,
  username: "",
  fromEmail: "",
  fromName: "Mehedi Rahat",
  notificationEmail: "mehedirahat83@gmail.com",
};

export default function AdminSmtpSettings() {
  const [settings, setSettings] = useState<Settings>(empty);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/smtp-settings", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) return window.location.assign("/admin/login");
        setSettings({ ...empty, ...data.settings });
      })
      .catch(() => window.location.assign("/admin/login"));
  }, []);

  function update<Key extends keyof Settings>(key: Key, value: Settings[Key]) {
    setSettings(current => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/smtp-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, password }),
    });
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) return setError(data?.error || "Could not save SMTP settings.");
    setSettings({ ...empty, ...data.settings });
    setPassword("");
    setMessage("SMTP settings and admin notification recipient saved securely.");
  }

  async function test() {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/smtp-settings", { method: "POST" });
    const data = await response.json().catch(() => null);
    setBusy(false);
    if (!response.ok) return setError(data?.error || "SMTP connection failed.");
    setMessage(data.message);
  }

  return <main className="admin-root"><AdminSidebar /><section className="admin-workspace">
    <header className="admin-topbar"><label><span>⌕</span><input placeholder="Search settings..." /></label><div><span className="admin-top-user">M</span><b>Mehedi Rahat</b></div></header>
    <section className="admin-page-title"><div><span className="eyebrow">Email delivery</span><h1>SMTP Settings</h1><p>Manage password reset, transactional email and all admin notifications securely.</p></div></section>
    <form className="admin-card smtp-settings-card" onSubmit={save}>
      <header><div><span className="eyebrow">Primary connection</span><h2>SMTP provider details</h2><p>Passwords remain encrypted and are never shown after saving.</p></div><em className={settings.configured ? "smtp-state configured" : "smtp-state"}>{settings.configured ? "Database settings active" : "Environment fallback active"}</em></header>
      <div className="smtp-grid">
        <label><span>SMTP host</span><input value={settings.host} required onChange={event => update("host", event.target.value)} placeholder="smtp.example.com" /></label>
        <label><span>SMTP port</span><input type="number" min="1" max="65535" value={settings.port} required onChange={event => update("port", Number(event.target.value))} /></label>
        <label><span>SMTP username</span><input value={settings.username} required onChange={event => update("username", event.target.value)} placeholder="email@example.com" /></label>
        <label><span>SMTP password</span><input type="password" value={password} required={!settings.configured} onChange={event => setPassword(event.target.value)} placeholder={settings.configured ? "Leave blank to keep current password" : "Enter SMTP password"} autoComplete="new-password" /></label>
        <label><span>From name</span><input value={settings.fromName} required onChange={event => update("fromName", event.target.value)} placeholder="Mehedi Rahat" /></label>
        <label><span>From email</span><input type="email" value={settings.fromEmail} required onChange={event => update("fromEmail", event.target.value)} placeholder="info@example.com" /></label>
        <label><span>Admin notification email</span><input type="email" value={settings.notificationEmail} required onChange={event => update("notificationEmail", event.target.value)} placeholder="mehedirahat83@gmail.com" /><small>Order, activation and support notifications are all sent here.</small></label>
      </div>
      <label className="smtp-secure"><input type="checkbox" checked={settings.secure} onChange={event => update("secure", event.target.checked)} /><span><b>Use SSL / secure connection</b><small>Enable for port 465. Keep disabled for TLS on port 587.</small></span></label>
      {error && <p className="admin-error-message">{error}</p>}
      {message && <p className="premium-order-notice">✓ {message}</p>}
      <footer><button type="button" onClick={() => void test()} disabled={busy}>{busy ? "Working…" : "Test connection"}</button><button type="submit" disabled={busy}>{busy ? "Saving…" : "Save SMTP settings"}</button></footer>
    </form>
  </section></main>;
}
