"use client";
import { FormEvent, useState } from "react";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";
export default function ForgotPasswordPage() {
  const [message,setMessage]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const email=new FormData(event.currentTarget).get("email"); const response=await fetch("/api/customer/forgot-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})}).catch(()=>null); const result=await response?.json().catch(()=>null); setBusy(false); if(!response?.ok)return setError(result?.error||"Could not request a reset email."); setMessage("If an account exists for this email, a reset link has been sent."); }
  return <main><AccountHeader/><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Account recovery</span><h1>Reset your password securely.</h1><p>We will email a time-limited link to the address used for your customer account.</p></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">Forgot password</span><h2>Request a reset link</h2><label><span>Email address</span><input name="email" type="email" required placeholder="you@example.com" autoComplete="email"/></label>{error&&<p className="checkout-error">{error}</p>}{message&&<p className="request-success">✓ {message}</p>}<button className="account-submit" type="submit" disabled={busy}>{busy?"Sending…":"Send reset link →"}</button><p className="auth-switch"><a href="/login">Back to sign in</a></p></form></div></section><SiteFooter/></main>;
}
