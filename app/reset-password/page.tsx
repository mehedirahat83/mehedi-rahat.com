"use client";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AccountHeader from "../AccountHeader";
import SiteFooter from "../SiteFooter";
function ResetPasswordForm() {
  const params=useSearchParams(); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const token=params.get("token")||"";
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const data=new FormData(event.currentTarget);const password=String(data.get("password")||"");if(password!==String(data.get("confirm")||""))return setError("Passwords do not match.");setBusy(true);setError("");const response=await fetch("/api/customer/reset-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,password})}).catch(()=>null);const result=await response?.json().catch(()=>null);setBusy(false);if(!response?.ok)return setError(result?.error||"Password could not be reset.");window.location.assign("/account");}
  return <main><AccountHeader/><section className="account-auth-section"><div className="auth-layout shell"><div className="auth-message"><span className="eyebrow">Account recovery</span><h1>Choose a new password.</h1><p>Use a strong password with at least eight characters.</p></div><form className="auth-card" onSubmit={submit}><span className="eyebrow">Reset password</span><h2>Set a new password</h2><label><span>New password</span><input name="password" type="password" minLength={8} required autoComplete="new-password"/></label><label><span>Confirm password</span><input name="confirm" type="password" minLength={8} required autoComplete="new-password"/></label>{error&&<p className="checkout-error">{error}</p>}<button className="account-submit" disabled={!token||busy} type="submit">{busy?"Saving…":"Save new password →"}</button>{!token&&<p className="checkout-error">This reset link is invalid.</p>}</form></div></section><SiteFooter/></main>;
}

export default function ResetPasswordPage() { return <Suspense fallback={<main className="account-loading">Loading password reset…</main>}><ResetPasswordForm /></Suspense>; }
