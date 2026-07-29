"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="system-state-page">
      <section className="system-state-card">
        <p className="system-state-label">Temporary problem</p>
        <h1>This page could not load.</h1>
        <p>
          Your data has not been removed. Please try loading the page again, or
          return to the homepage.
        </p>
        <div className="system-state-actions">
          <button className="system-state-button" type="button" onClick={reset}>
            Try again
          </button>
          <a className="system-state-button secondary" href="/">
            Go to homepage
          </a>
        </div>
      </section>
    </main>
  );
}
