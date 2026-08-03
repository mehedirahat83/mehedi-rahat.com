"use client";

import { FormEvent, useState } from "react";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";

export default function LoginPage() {
  const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/customer/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setBusy(false); if (!response?.ok) return setError(result?.error || "Could not sign in. Please try again.");
    window.location.assign("/account");
  }
  return <main><AccountHeader /><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Welcome back</span><h1>Access your purchases, rewards and support.</h1><p>Sign in to manage orders, product activation and your membership benefits from one simple dashboard.</p><div className="auth-benefits"><span>✓ Track every order</span><span>✓ View membership progress</span><span>✓ Get product support</span></div></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">Customer login</span><h2>Sign in to your account</h2><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" autoComplete="email" /></label><label><span>Password</span><input name="password" type="password" required placeholder="Enter your password" autoComplete="current-password" /></label><div className="auth-row"><label className="remember"><input type="checkbox" /> Remember me</label><a href="/forgot-password">Forgot password?</a></div>{error && <p className="checkout-error">{error}</p>}<button className="account-submit" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button><p className="auth-switch">New customer? <a href="/register">Create an account</a></p></form></div></section><SiteFooter /></main>;
}
