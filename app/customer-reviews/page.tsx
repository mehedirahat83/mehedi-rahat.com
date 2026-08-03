"use client";

import { useEffect, useState } from "react";
import MainHeader from "../MainHeader";
import SiteFooter from "../SiteFooter";

type CustomerReview = {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  productName: string;
  productSlug: string;
};

type ReviewsResponse = {
  reviews: CustomerReview[];
  page: number;
  pageSize: number;
  total: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function CustomerReviewsPage() {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void fetch(`/api/reviews?page=${page}`, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = await response.json() as ReviewsResponse & { error?: string };
        if (!response.ok) throw new Error(body.error || "Reviews could not be loaded.");
        setData(body);
      })
      .catch((requestError) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") return;
        setError(requestError instanceof Error ? requestError.message : "Reviews could not be loaded.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [page]);

  const pages = Math.max(1, Math.ceil((data?.total || 0) / (data?.pageSize || 20)));

  return <main className="customer-reviews-page">
    <MainHeader />
    <section className="customer-reviews-hero">
      <div className="shell">
        <span className="eyebrow">Customer feedback</span>
        <h1>Customer <em>Reviews</em></h1>
        <p>Real feedback from customers who purchased and used our products.</p>
      </div>
    </section>
    <section className="section customer-review-section">
      <div className="shell">
        <header className="customer-review-heading">
          <div><span className="eyebrow">Verified purchases</span><h2>What customers are saying.</h2></div>
          <span>{data?.total || 0} approved reviews</span>
        </header>
        {loading ? <div className="customer-review-state">Loading customer reviews...</div> : error ? <div className="customer-review-state error">{error}</div> : data?.reviews.length ? <div className="customer-review-grid">
          {data.reviews.map((review) => <article key={review.id}>
            <header><div><span className="customer-review-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><small>Verified purchase</small></div><time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time></header>
            <p>{review.body}</p>
            <footer><div><b>{review.authorName}</b><small>Purchased <a href={`/product/${review.productSlug}`}>{review.productName}</a></small></div><a href={`/product/${review.productSlug}`} aria-label={`View ${review.productName}`}>View product →</a></footer>
          </article>)}
        </div> : <div className="customer-review-state">No approved reviews have been published yet.</div>}
        {data && pages > 1 && <nav className="customer-review-pagination" aria-label="Review pages"><button disabled={page === 1} onClick={() => setPage((current) => current - 1)}>← Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage((current) => current + 1)}>Next →</button></nav>}
      </div>
    </section>
    <SiteFooter />
  </main>;
}
