export default function NotFound() {
  return (
    <main className="system-state-page">
      <section className="system-state-card">
        <p className="system-state-label">404 · Page not found</p>
        <h1>The page is not available.</h1>
        <p>
          The link may be outdated or the page may have moved. Use the homepage
          to continue browsing.
        </p>
        <div className="system-state-actions">
          <a className="system-state-button" href="/">
            Go to homepage
          </a>
          <a className="system-state-button secondary" href="/contact">
            Contact support
          </a>
        </div>
      </section>
    </main>
  );
}
