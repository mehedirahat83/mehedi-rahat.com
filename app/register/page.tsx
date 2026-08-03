"use client";

import { FormEvent, useState } from "react";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";

export default function RegisterPage() {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); const password = String(data.get("password") || "");
    if (password !== String(data.get("confirm") || "")) return setError("Passwords do not match.");
    setError(""); setBusy(true);
    const response = await fetch("/api/customer/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), phone: data.get("phone"), email: data.get("email"), password }) }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setBusy(false); if (!response?.ok) return setError(result?.error || "Your account could not be created.");
    window.location.assign("/account");
  }
  return <main><AccountHeader /><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Join membership</span><h1>Every purchase takes you closer to better rewards.</h1><p>Create one account for your products, activations, orders and spending-based membership discounts.</p><div className="auth-benefits"><span>Silver — 0% discount</span><span>Gold — 10% discount</span><span>Diamond &amp; VIP — up to 30%</span></div></div><form className="auth-card register-card" onSubmit={submit}><span className="eyebrow">Customer registration</span><h2>Create your account</h2><div className="auth-field-grid"><label><span>Full name</span><input name="name" required placeholder="Your full name" autoComplete="name" /></label><label><span>Phone number</span><input name="phone" required placeholder="01XXXXXXXXX" autoComplete="tel" /></label></div><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label><div className="auth-field-grid"><label><span>Password</span><input name="password" type="password" required placeholder="Minimum 8 characters" minLength={8} autoComplete="new-password" /></label><label><span>Confirm password</span><input name="confirm" type="password" required placeholder="Repeat password" minLength={8} autoComplete="new-password" /></label></div>{error && <p className="checkout-error">{error}</p>}<button className="account-submit" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account →"}</button><p className="auth-switch">Already registered? <a href="/login">Sign in</a></p></form></div></section><SiteFooter /></main>;
}
