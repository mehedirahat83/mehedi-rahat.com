"use client";

import { FormEvent, useState } from "react";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";

export default function LoginPage() {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = String(data.get("password") || "");
    const saved = JSON.parse(localStorage.getItem("mr-user") || "null");
    const isDemo = email === "demo@mehedirahat.com" && password === "demo1234";
    if (!isDemo && (!saved || saved.email !== email || saved.password !== password)) return setError("Email or password did not match.");
    const user = isDemo ? { name: "Demo Customer", email, phone: "01900 000000" } : saved;
    localStorage.setItem("mr-session", JSON.stringify({ name: user.name, email: user.email, phone: user.phone }));
    window.location.href = "/account";
  }
  return <main><AccountHeader /><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Welcome back</span><h1>Access your purchases, rewards and support.</h1><p>Sign in to manage orders, product activation and your membership benefits from one simple dashboard.</p><div className="auth-benefits"><span>✓ Track every order</span><span>✓ View membership progress</span><span>✓ Get product support</span></div></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">Customer login</span><h2>Sign in to your account</h2><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" /></label><label><span>Password</span><input name="password" type="password" required placeholder="Enter your password" /></label><div className="auth-row"><label className="remember"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div>{error && <p className="checkout-error">{error}</p>}<button className="account-submit" type="submit">Sign in ↗</button><p className="auth-switch">New customer? <a href="/register">Create an account</a></p><p className="demo-login">Demo: demo@mehedirahat.com / demo1234</p></form></div></section><SiteFooter /></main>;
}
