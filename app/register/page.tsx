"use client";

import { FormEvent, useState } from "react";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";

export default function RegisterPage() {
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const user = { name: String(data.get("name") || ""), email: String(data.get("email") || "").trim().toLowerCase(), phone: String(data.get("phone") || ""), password };
    localStorage.setItem("mr-user", JSON.stringify(user));
    localStorage.setItem("mr-session", JSON.stringify({ name: user.name, email: user.email, phone: user.phone }));
    window.location.href = "/account";
  }
  return <main><AccountHeader /><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Join membership</span><h1>Every purchase takes you closer to better rewards.</h1><p>Create one account for your products, activations, orders and spending-based membership discounts.</p><div className="auth-benefits"><span>Silver — 0% discount</span><span>Gold — 10% discount</span><span>Diamond &amp; VIP — up to 30%</span></div></div><form className="auth-card register-card" onSubmit={submit}><span className="eyebrow">Customer registration</span><h2>Create your account</h2><div className="auth-field-grid"><label><span>Full name</span><input name="name" required placeholder="Your full name" /></label><label><span>Phone number</span><input name="phone" required placeholder="01XXXXXXXXX" /></label></div><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" /></label><div className="auth-field-grid"><label><span>Password</span><input name="password" type="password" required placeholder="Minimum 6 characters" /></label><label><span>Confirm password</span><input name="confirm" type="password" required placeholder="Repeat password" /></label></div>{error && <p className="checkout-error">{error}</p>}<button className="account-submit" type="submit">Create account ↗</button><p className="auth-switch">Already registered? <a href="/login">Sign in</a></p></form></div></section><SiteFooter /></main>;
}
