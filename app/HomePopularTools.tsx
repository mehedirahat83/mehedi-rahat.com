"use client";

import { useEffect, useState } from "react";
import { fetchHomepageProducts, type StorefrontProduct } from "./productApi";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function variationSummary(product: StorefrontProduct) {
  if (!product.variations.length) return "Standard access";
  if (product.variations.length === 1) return product.variations[0].label;
  return `${product.variations[0].label} and more`;
}

export default function HomePopularTools() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchHomepageProducts(controller.signal)
      .then(setProducts)
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <section className="section soft-section" id="products">
      <div className="shell">
        <div className="section-heading">
          <div><span className="eyebrow">Popular tools</span><h2>Official tools at a <em>practical price.</em></h2></div>
          <a href="/products">View all products <Arrow /></a>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card reveal" key={product.id}>
              <div className={`product-art product-art-${(index % 10) + 1}${product.imageUrl ? " product-art--featured" : ""}`}>
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-logo">{product.name.slice(0, 1)}</div>}
                <div className="product-art-lines"><i /><i /><i /></div>
              </div>
              <div className="product-copy">
                <h3>{product.name}</h3>
                <div className="product-price">৳ {product.price.toLocaleString("en-US")}</div>
                <div className="product-meta"><span>{variationSummary(product)}</span><span>Instant access</span></div>
                <div className="product-footer"><span>{product.activationType || "Assisted activation"}</span><a href={`/product/${product.slug}`} aria-label={`View ${product.name}`}>View details <Arrow /></a></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
