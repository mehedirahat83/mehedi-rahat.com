"use client";

import { ReactNode, useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (window.location.pathname === "/admin/login") {
      setAllowed(true);
      setReady(true);
      return;
    }

    fetch("/api/admin/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          window.location.replace("/admin/login");
          return;
        }
        setAllowed(true);
      })
      .catch(() => window.location.replace("/admin/login"))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <main className="system-screen system-state-page" aria-live="polite">
        <section className="system-card system-state-card">
          <span className="system-state-mark" aria-hidden="true">MR</span>
          <p className="system-kicker">SECURE ADMIN</p>
          <h1>Opening your dashboard...</h1>
          <p>Your session is being verified.</p>
        </section>
      </main>
    );
  }

  return allowed ? children : null;
}
