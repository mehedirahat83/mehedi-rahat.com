"use client";

import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error || "Sign in failed. Please check your details.");
        return;
      }

      window.location.replace("/admin");
    } catch {
      setError("The server could not be reached. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login-screen">
      <section className="admin-login-card">
        <div className="admin-login-brand">
          <span aria-hidden="true">MR</span>
          <div>
            <strong>MEHEDI RAHAT</strong>
            <small>Secure Admin Panel</small>
          </div>
        </div>

        <div className="admin-login-copy">
          <p>ADMIN ACCESS</p>
          <h1>Welcome back.</h1>
          <span>Sign in to manage your website, orders and customer operations.</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              autoComplete="username"
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="admin-login-error" role="alert">{error}</p> : null}

          <button disabled={submitting} type="submit">
            {submitting ? "Signing in..." : "Sign in securely"}
          </button>
        </form>

        <a className="admin-login-back" href="/">Back to website</a>
      </section>
    </main>
  );
}
