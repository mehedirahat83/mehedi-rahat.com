"use client";

import { useState } from "react";

export type ActivationInfo = { loginUrl?: string; username?: string; password?: string };

export default function AdminActivationInfo({ info }: { info?: ActivationInfo }) {
  const [visible, setVisible] = useState(false);
  const hasInfo = Boolean(info?.loginUrl || info?.username || info?.password);
  return <section className="admin-activation-info"><header><div><span className="eyebrow">Activation Info</span><h3>Website access</h3></div><em>{hasInfo ? "Customer provided" : "Not provided"}</em></header>{hasInfo ? <div><span className="activation-login-link"><small>Website login link</small>{info?.loginUrl ? <a href={info.loginUrl} target="_blank" rel="noreferrer">{info.loginUrl} ↗</a> : <b>—</b>}</span><span><small>Username</small><b>{info?.username || "—"}</b></span><span><small>Password</small><b>{info?.password ? (visible ? info.password : "••••••••") : "—"}</b>{info?.password && <button type="button" onClick={() => setVisible(value => !value)}>{visible ? "Hide" : "Show"}</button>}</span></div> : <p>The customer did not submit website credentials with this order.</p>}</section>;
}
