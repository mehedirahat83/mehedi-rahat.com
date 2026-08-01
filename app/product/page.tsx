"use client";

import { useEffect, useMemo, useState } from "react";
import MainHeader from "../MainHeader";
import {
  fetchPublishedProduct,
  fetchPublishedProducts,
  type StorefrontProduct,
} from "../productApi";
import SiteFooter from "../SiteFooter";

type CartItem = {
  id: string;
  productId?: string;
  name: string;
  category: string;
  variation: string;
  price: number;
  quantity: number;
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

const reviews = [
  ["Fast activation and helpful support.", "Nayeem Hasan"],
  ["The process was clear and the product worked perfectly.", "Sabbir Ahmed"],
  ["Quick response and dependable after-sales support.", "Farhana Islam"],
  ["Everything was delivered exactly as described.", "Rakib Hossain"],
  ["A smooth purchase experience from start to finish.", "Tanvir Rahman"],
];

const fallbackFaq = [
  [
    "Will I receive a license key?",
    "No. Products use the activation or delivery method shown on this page.",
  ],
  [
    "How quickly will my order be processed?",
    "Most orders are processed within 30 minutes during regular support hours.",
  ],
  [
    "Will I receive updates?",
    "Update coverage follows the license duration shown for the product.",
  ],
  [
    "Can I get help after purchase?",
    "Yes. You can submit a support ticket or activation request from your account.",
  ],
];

function parseFaq(value: string) {
  const rows = value
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const splitAt = row.indexOf("|");
      return splitAt < 0
        ? [row, "Please contact support for details."]
        : [row.slice(0, splitAt), row.slice(splitAt + 1)];
    });
  return rows.length ? rows : fallbackFaq;
}

export default function ProductPage() {
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [selected, setSelected] = useState(0);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const identifier = new URLSearchParams(window.location.search).get("id");
    if (!identifier) {
      setError("Product not found.");
      setLoading(false);
      return () => controller.abort();
    }
    void Promise.all([
      fetchPublishedProduct(identifier, controller.signal),
      fetchPublishedProducts(controller.signal),
    ])
      .then(([currentProduct, allProducts]) => {
        setProduct(currentProduct);
        setProducts(allProducts);
      })
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
            : "Product not found.",
        );
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const related = useMemo(
    () => products.filter((item) => item.id !== product?.id).slice(0, 7),
    [products, product],
  );

  if (loading) {
    return (
      <main>
        <MainHeader active="products" />
        <div className="success-page product-public-state">
          <div className="success-card">
            <h1>Loading product…</h1>
            <p>The latest product details are being loaded.</p>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (!product) {
    return (
      <main>
        <MainHeader active="products" />
        <div className="success-page product-public-state">
          <div className="success-card">
            <h1>Product not found.</h1>
            <p>{error || "This product may be unpublished or removed."}</p>
            <a className="button primary" href="/products">
              Browse products
            </a>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const variation = product.variations[selected] ||
    product.variations[0] || { label: "Standard", price: product.basePrice };
  const faqs = parseFaq(product.faq);

  function add() {
    if (!product) return;
    const cart = JSON.parse(
      localStorage.getItem("mr-cart") || "[]",
    ) as CartItem[];
    const cartId = `${product.id}-${variation.label}`;
    const existing = cart.find((item) => item.id === cartId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: cartId,
        productId: product.id,
        name: product.name,
        category: product.category,
        variation: variation.label,
        price: variation.price,
        quantity: 1,
      });
    }
    localStorage.setItem("mr-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("mr-cart-updated"));
    setAdded(true);
  }

  return (
    <main>
      <MainHeader active="products" />
      <div className="product-breadcrumb">
        <div className="shell">
          <a href="/">Home</a>
          <span>›</span>
          <a href="/products">Products</a>
          <span>›</span>
          <b>{product.name}</b>
        </div>
      </div>

      <section className="section product-detail-section">
        <div className="shell product-detail-grid">
          <div className="detail-media-card">
            <div className="detail-art">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} />
              ) : (
                <>
                  <span className="detail-license">{product.license}</span>
                  <div className="detail-logo">{product.name.charAt(0)}</div>
                  <b>{product.name.toUpperCase()}</b>
                  <small>PRO</small>
                </>
              )}
            </div>
            <div className="detail-quick-links">
              <a
                className="detail-demo"
                href={product.demoUrl || "#product-description"}
                target={product.demoUrl ? "_blank" : undefined}
                rel={product.demoUrl ? "noreferrer" : undefined}
                title={
                  product.demoUrl
                    ? "Open live demo"
                    : "Live demo link has not been added yet"
                }
              >
                Live Demo <Arrow />
              </a>
              <a href="#faq">FAQ</a>
            </div>
            <a className="detail-resell-link" href="#resell">
              Resell Our Tools <Arrow />
            </a>
          </div>
          <div className="detail-purchase-card">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="detail-rating">
              <span>★★★★★</span>
              <strong>{product.rating.toFixed(1)}</strong>
              <small>{product.reviewCount} verified reviews</small>
            </div>
            <div className="detail-facts">
              {product.information.map((item) => (
                <div key={item.label}>
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                </div>
              ))}
            </div>
            <div className="detail-variation">
              <label>Choose site variation</label>
              <div>
                {product.variations.map((item, index) => (
                  <button
                    className={selected === index ? "active" : ""}
                    onClick={() => {
                      setSelected(index);
                      setAdded(false);
                    }}
                    key={item.label}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="detail-buy-row">
              <div>
                <small>Your price</small>
                <strong>৳ {variation.price.toLocaleString("en-US")}</strong>
              </div>
              <button className={added ? "added" : ""} onClick={add}>
                {added ? "Added to Cart ✓" : "Add to Cart"}
              </button>
            </div>
            <p className="detail-safe-note">
              ✓ Secure local payment · Fast assisted activation
            </p>
          </div>
          <aside className="related-tools-card">
            <div className="related-heading">
              <span className="eyebrow">More products</span>
              <h2>You may also need.</h2>
            </div>
            <div className="related-list">
              {related.map((item, index) => (
                <a
                  href={`/product?id=${encodeURIComponent(item.slug)}`}
                  key={item.id}
                >
                  <span className={`related-icon related-icon-${(index % 4) + 1}`}>
                    {item.name.charAt(0)}
                  </span>
                  <div>
                    <b>{item.name}</b>
                    <small>
                      From ৳ {item.basePrice.toLocaleString("en-US")}
                    </small>
                  </div>
                  <Arrow />
                </a>
              ))}
            </div>
            <a className="related-all" href="/products">
              View all products <Arrow />
            </a>
          </aside>
        </div>
        <div className="shell product-policy-note">
          <span className="policy-icon">i</span>
          <div>
            <span className="policy-label">Please read before ordering</span>
            <b>Important activation information</b>
            <p>
              Our premium tools use official licensed access. We do not provide
              GPL, nulled or cracked tools. Assisted activation may require
              temporary WordPress admin access. Please contact support if you
              prefer another activation method.
            </p>
          </div>
        </div>
      </section>

      <section
        className="section product-content-section"
        id="product-description"
      >
        <div className="shell product-content-grid">
          <article className="product-description-card">
            <span className="eyebrow">Product description</span>
            <h2>{product.name}</h2>
            <div
              className="product-rich-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            <div className="description-points">
              {product.features
                .split("\n")
                .filter(Boolean)
                .map((item) => (
                  <span key={item}>{item}</span>
                ))}
            </div>
          </article>
          <aside className="product-review-card">
            <span className="eyebrow">Customer reviews</span>
            <div className="review-overview">
              <strong>{product.rating.toFixed(1)}</strong>
              <div>
                <span>★★★★★</span>
                <small>{product.reviewCount} verified customer reviews</small>
              </div>
            </div>
            <div className="review-list">
              {reviews.map(([text, name]) => (
                <blockquote key={name}>
                  <span>★★★★★</span>
                  <p>{text}</p>
                  <footer>
                    <b>{name}</b>
                    <small>Verified purchase</small>
                  </footer>
                </blockquote>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section product-faq-section" id="faq">
        <div className="shell product-faq-grid">
          <div>
            <span className="eyebrow">Product FAQ</span>
            <h2>Answers before you purchase.</h2>
            <p>Product information is managed from the Admin Dashboard.</p>
          </div>
          <div className="product-faq-list">
            {faqs.map((item, index) => (
              <details open={index === 0} key={item[0]}>
                <summary>
                  {item[0]}
                  <span>+</span>
                </summary>
                <p>{item[1]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="section product-resell-section" id="resell">
        <div className="shell product-resell-panel">
          <div>
            <span className="eyebrow">Resell our tools</span>
            <h2>Offer trusted tools to your clients.</h2>
          </div>
          <a className="button primary" href="/contact">
            Discuss reseller access <Arrow />
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
