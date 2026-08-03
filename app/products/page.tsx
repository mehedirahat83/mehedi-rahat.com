"use client";

import { useEffect, useMemo, useState } from "react";
import MainHeader from "../MainHeader";
import {
  fetchPublishedProducts,
  type StorefrontProduct,
} from "../productApi";
import SiteFooter from "../SiteFooter";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [category, setCategory] = useState("All products");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void fetchPublishedProducts(controller.signal)
      .then(setProducts)
      .catch((requestError) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Products could not be loaded.",
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [
      "All products",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );
  const visible = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "All products" || product.category === category) &&
          (!query ||
            `${product.name} ${product.category}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [products, category, query],
  );

  return (
    <main>
      <MainHeader active="products" />
      <section className="products-hero">
        <div className="shell products-hero-grid">
          <div>
            <span className="eyebrow">Premium WordPress tools</span>
            <h1>
              Reliable tools at a <em>practical price.</em>
            </h1>
            <p>
              Choose trusted themes, plugins and business tools with clear
              licensing, fast activation and direct support.
            </p>
          </div>
          <div className="products-hero-proof">
            <article>
              <b>{loading ? "—" : products.length}</b>
              <span>Published products</span>
            </article>
            <article>
              <b>Fast</b>
              <span>License activation</span>
            </article>
            <article>
              <b>Direct</b>
              <span>Expert support</span>
            </article>
          </div>
        </div>
      </section>
      <section className="section product-catalog">
        <div className="shell">
          <div className="catalog-toolbar">
            <div>
              <span className="eyebrow">Browse products</span>
              <h2>Find the right tool for your website.</h2>
            </div>
            <label className="catalog-search">
              <span>⌕</span>
              <input
                id="product-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products..."
              />
            </label>
          </div>
          <div className="category-filter">
            {categories.map((item) => (
              <button
                className={category === item ? "active" : ""}
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="catalog-summary">
            <p>
              <b>{visible.length}</b> products available
            </p>
            <span>Secure payment · Fast delivery · Direct support</span>
          </div>
          {loading ? (
            <div className="catalog-empty storefront-state">
              <b>Loading products…</b>
              <p>The latest catalog is being loaded.</p>
            </div>
          ) : error ? (
            <div className="catalog-empty storefront-state error">
              <b>Products are temporarily unavailable</b>
              <p>{error}</p>
              <button type="button" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : visible.length ? (
            <div className="catalog-grid">
              {visible.map((product, index) => {
                const choice = selected[product.id] || 0;
                const variation =
                  product.variations[choice] ||
                  product.variations[0] || {
                    label: "Standard",
                    price: product.basePrice,
                  };
                return (
                  <article className="catalog-card" key={product.id}>
                    <a
                      className={`catalog-art catalog-art-link catalog-art-${(index % 5) + 1}${product.imageUrl ? " catalog-art--featured" : ""}`}
                      href={`/product/${encodeURIComponent(product.slug)}`}
                      aria-label={`View ${product.name}`}
                      style={product.imageUrl ? { margin: 0, borderRadius: "14px 14px 0 0" } : undefined}
                    >
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", padding: 0 }} />
                      ) : (
                        <strong>{product.name.charAt(0)}</strong>
                      )}
                      <div>
                        <i />
                        <i />
                        <i />
                      </div>
                    </a>
                    <div className="catalog-copy">
                      <h3><a href={`/product/${encodeURIComponent(product.slug)}`}>{product.name}</a></h3>
                      <div className="catalog-price">
                        ৳ {variation.price.toLocaleString("en-US")}
                      </div>
                      <div className="variation-options">
                        {product.variations.map((item, itemIndex) => (
                          <button
                            className={choice === itemIndex ? "active" : ""}
                            key={item.label}
                            onClick={() =>
                              setSelected((current) => ({
                                ...current,
                                [product.id]: itemIndex,
                              }))
                            }
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      <div className="catalog-footer">
                        <span>{product.activationType}</span>
                        <a
                          href={`/product/${encodeURIComponent(product.slug)}`}
                        >
                          View details <Arrow />
                        </a>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="catalog-empty">
              <b>No products found</b>
              <p>Try another keyword or category.</p>
            </div>
          )}
        </div>
      </section>
      <section className="catalog-help">
        <div className="shell">
          <div>
            <span className="eyebrow">Need help choosing?</span>
            <h2>Not sure which product fits your website?</h2>
            <p>
              Tell me what you want to build, and I’ll help you choose the right
              tool.
            </p>
          </div>
          <a className="button primary" href="/contact">
            Ask for a recommendation <Arrow />
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
