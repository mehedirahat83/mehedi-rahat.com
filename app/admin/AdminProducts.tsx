"use client";

import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AdminSidebar from "./AdminSidebar";

type ProductStatus = "published" | "draft";
type ProductVariation = { label: string; price: number };
type ProductInformation = { label: string; value: string };
type ApiProduct = {
  id: string;
  slug: string;
  categoryId: string;
  category: string;
  name: string;
  license: "One Year" | "Lifetime";
  status: ProductStatus;
  basePrice: number;
  description: string;
  features: string;
  faq: string;
  demoUrl: string;
  activationType: string;
  rating: number;
  reviewCount: number;
  imageUrl: string | null;
  imageName: string | null;
  downloadUrl: string | null;
  downloadName: string | null;
  variations: ProductVariation[];
  information: ProductInformation[];
};

type ApiError = {
  error?: string;
  fields?: Record<string, string>;
};

const defaultInformation: ProductInformation[] = [
  { label: "Official Tool", value: "Yes" },
  { label: "Activation Process", value: "Assisted activation" },
  { label: "Auto Update", value: "One Year" },
  { label: "Delivery", value: "30 Minutes Max" },
  { label: "Download file", value: "After order approval" },
];

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiError;
  if (!response.ok) {
    const error = new Error(body.error || "The request could not be completed.");
    Object.assign(error, { fields: body.fields });
    throw error;
  }
  return body;
}

export default function AdminProducts({
  mode,
}: {
  mode: "list" | "new" | "edit";
}) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([
    { label: "01 Site", price: 300 },
  ]);
  const [information, setInformation] =
    useState<ProductInformation[]>(defaultInformation);
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All status");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/products?include=drafts&limit=100", {
        cache: "no-store",
      });
      const body = await readJson<{ products: ApiProduct[] }>(response);
      setProducts(body.products);
      return body.products;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Products could not be loaded.",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const all = await loadAll();
      if (mode !== "edit") return;
      const id = new URLSearchParams(window.location.search).get("id");
      const product = all.find(
        (item) => item.id === id || item.slug === id,
      );
      if (!product) {
        setError("The selected product could not be found.");
        return;
      }
      setEditing(product);
      setVariations(product.variations);
      setInformation(product.information);
      setDescription(product.description);
    })();
  }, [loadAll, mode]);

  const categories = useMemo(
    () =>
      Array.from(
        new Map(
          products.map((product) => [
            product.categoryId,
            { id: product.categoryId, name: product.category },
          ]),
        ).values(),
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [products],
  );

  const visible = useMemo(
    () =>
      products.filter(
        (product) =>
          (!query ||
            `${product.name} ${product.category} ${product.slug}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (category === "All categories" ||
            product.categoryId === category) &&
          (status === "All status" || product.status === status),
      ),
    [products, query, category, status],
  );

  async function remove(product: ApiProduct) {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    setError("");
    try {
      await readJson(
        await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
          method: "DELETE",
        }),
      );
      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setMessage(`${product.name} was deleted.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The product could not be deleted.",
      );
    }
  }

  async function toggleStatus(product: ApiProduct) {
    const nextStatus: ProductStatus =
      product.status === "published" ? "draft" : "published";
    setError("");
    try {
      const body = await readJson<{ product: ApiProduct }>(
        await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        }),
      );
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? body.product : item,
        ),
      );
      setMessage(
        `${product.name} is now ${
          nextStatus === "published" ? "published" : "a draft"
        }.`,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The status could not be changed.",
      );
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;
    const requestedStatus =
      submitter?.value ||
      String(form.get("status") || editing?.status || "draft");
    const payload = {
      name: String(form.get("name") || ""),
      slug: String(form.get("slug") || ""),
      categoryId: String(form.get("categoryId") || ""),
      license: String(form.get("license") || ""),
      status: requestedStatus,
      basePrice: Number(variations[0]?.price ?? 0),
      description,
      features: String(form.get("features") || ""),
      demoUrl: String(form.get("demoUrl") || ""),
      activationType: String(
        form.get("activationType") || "Assisted activation",
      ),
      rating: Number(form.get("rating") || 0),
      reviewCount: Number(form.get("reviewCount") || 0),
      imageUrl: String(form.get("imageUrl") || "") || null,
      imageName: String(form.get("imageName") || "") || null,
      downloadUrl: String(form.get("downloadUrl") || "") || null,
      downloadName: String(form.get("downloadName") || "") || null,
      variations,
      information,
    };

    try {
      const url = editing
        ? `/api/products/${encodeURIComponent(editing.id)}`
        : "/api/products";
      const body = await readJson<{ product: ApiProduct }>(
        await fetch(url, {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      setEditing(body.product);
      setProducts((current) => {
        const exists = current.some((item) => item.id === body.product.id);
        return exists
          ? current.map((item) =>
              item.id === body.product.id ? body.product : item,
            )
          : [body.product, ...current];
      });
      setMessage(
        `${body.product.name} was ${
          editing ? "updated" : "created"
        } successfully.`,
      );
      if (!editing) {
        window.history.replaceState(
          null,
          "",
          `/admin/products/edit?id=${encodeURIComponent(body.product.id)}`,
        );
      }
    } catch (requestError) {
      const typed = requestError as Error & {
        fields?: Record<string, string>;
      };
      setError(typed.message || "The product could not be saved.");
      setFieldErrors(typed.fields || {});
    } finally {
      setSaving(false);
    }
  }

  const editorLoading = mode === "edit" && loading && !editing;

  return (
    <main className="admin-root">
      <AdminSidebar active="products" />
      <section className="admin-workspace">
        <AdminTop />
        {mode === "list" ? (
          <>
            <div className="admin-page-title">
              <div>
                <span className="eyebrow">Content management</span>
                <h1>Products</h1>
                <p>Add, edit, publish and organize every storefront product.</p>
              </div>
              <a href="/admin/products/new">Add new product +</a>
            </div>
            <section className="product-admin-stats">
              {[
                ["All products", products.length],
                [
                  "Published",
                  products.filter((item) => item.status === "published").length,
                ],
                [
                  "Drafts",
                  products.filter((item) => item.status === "draft").length,
                ],
                ["Categories", categories.length],
              ].map((item) => (
                <article key={String(item[0])}>
                  <span>{item[0]}</span>
                  <strong>{item[1]}</strong>
                </article>
              ))}
            </section>
            {message && <p className="editor-saved">✓ {message}</p>}
            {error && <p className="editor-error">{error}</p>}
            <section className="admin-card product-list-card">
              <div className="product-toolbar">
                <label>
                  ⌕
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products..."
                  />
                </label>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>All categories</option>
                  {categories.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>All status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              {loading ? (
                <div className="admin-product-state">Loading products…</div>
              ) : visible.length ? (
                <div className="product-admin-table">
                  <div className="product-table-head">
                    <span>Product</span>
                    <span>Category</span>
                    <span>License</span>
                    <span>Variations</span>
                    <span>Starting price</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {visible.map((product) => (
                    <div className="product-table-row" key={product.id}>
                      <span className="admin-product-name">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" />
                        ) : (
                          <i>{product.name.charAt(0)}</i>
                        )}
                        <b>
                          {product.name}
                          <small>/{product.slug}</small>
                        </b>
                      </span>
                      <span>{product.category}</span>
                      <span>{product.license}</span>
                      <span>{product.variations.length}</span>
                      <strong>
                        ৳ {product.basePrice.toLocaleString("en-US")}
                      </strong>
                      <em className={product.status}>{product.status}</em>
                      <span className="product-row-actions">
                        <a
                          href={`/product?id=${encodeURIComponent(product.slug)}`}
                          target="_blank"
                        >
                          View
                        </a>
                        <a
                          href={`/admin/products/edit?id=${encodeURIComponent(
                            product.id,
                          )}`}
                        >
                          Edit
                        </a>
                        <button
                          type="button"
                          className="product-status-action"
                          onClick={() => void toggleStatus(product)}
                        >
                          {product.status === "published"
                            ? "Unpublish"
                            : "Publish"}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${product.name}`}
                          onClick={() => void remove(product)}
                        >
                          ×
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-product-state">
                  <b>No products found</b>
                  <p>Try changing the search or filters.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <div className="admin-page-title">
              <div>
                <span className="eyebrow">Product management</span>
                <h1>{editing || mode === "edit" ? "Edit Product" : "Add Product"}</h1>
                <p>
                  Configure storefront content, pricing, variations and
                  delivery references.
                </p>
              </div>
              <a className="admin-export" href="/admin/products">
                Back to products →
              </a>
            </div>
            {editorLoading ? (
              <div className="admin-card admin-product-state">
                Loading product…
              </div>
            ) : mode === "edit" && !editing ? (
              <div className="admin-card admin-product-state">
                <b>Product not found</b>
                <p>{error}</p>
                <a href="/admin/products">Return to all products</a>
              </div>
            ) : (
              <form
                className="product-editor"
                onSubmit={(event) => void submit(event)}
              >
                <div className="product-editor-main">
                  <EditorCard title="Basic information">
                    <div className="editor-grid">
                      <Field label="Product name" error={fieldErrors.name}>
                        <input
                          name="name"
                          required
                          defaultValue={editing?.name}
                        />
                      </Field>
                      <Field label="URL slug" error={fieldErrors.slug}>
                        <input
                          name="slug"
                          required
                          defaultValue={editing?.slug}
                          placeholder="elementor-pro"
                        />
                      </Field>
                      <Field label="Category" error={fieldErrors.categoryId}>
                        <select
                          name="categoryId"
                          required
                          defaultValue={editing?.categoryId || ""}
                        >
                          <option value="" disabled>
                            Select a category
                          </option>
                          {categories.map((item) => (
                            <option value={item.id} key={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="License duration" error={fieldErrors.license}>
                        <select
                          name="license"
                          defaultValue={editing?.license || "One Year"}
                        >
                          <option>One Year</option>
                          <option>Lifetime</option>
                        </select>
                      </Field>
                      <Field label="Publish status" error={fieldErrors.status}>
                        <select
                          name="status"
                          defaultValue={editing?.status || "draft"}
                        >
                          <option value="published">Published</option>
                          <option value="draft">Draft</option>
                        </select>
                      </Field>
                      <Field label="Rating score (0–5)" error={fieldErrors.rating}>
                        <input
                          name="rating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          defaultValue={editing?.rating ?? 4.9}
                        />
                      </Field>
                      <Field label="Verified review count">
                        <input
                          name="reviewCount"
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={editing?.reviewCount ?? 5}
                        />
                      </Field>
                    </div>
                    <Field label="Product description">
                      <RichTextEditor
                        value={description}
                        onChange={setDescription}
                      />
                    </Field>
                  </EditorCard>
                  <EditorCard title="Variations & pricing">
                    {fieldErrors.variations && (
                      <small className="field-error">
                        {fieldErrors.variations}
                      </small>
                    )}
                    <div className="variation-editor">
                      {variations.map((variation, index) => (
                        <div key={`${variation.label}-${index}`}>
                          <input
                            aria-label="Variation name"
                            value={variation.label}
                            onChange={(event) =>
                              setVariations((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <label>
                            ৳
                            <input
                              aria-label="Variation price"
                              type="number"
                              min="0"
                              value={variation.price}
                              onChange={(event) =>
                                setVariations((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          ...item,
                                          price: Number(event.target.value),
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            aria-label="Remove variation"
                            onClick={() =>
                              setVariations((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="add-row-button"
                      type="button"
                      onClick={() =>
                        setVariations((current) => [
                          ...current,
                          { label: "New variation", price: 0 },
                        ])
                      }
                    >
                      + Add variation
                    </button>
                  </EditorCard>
                  <EditorCard title="Product information table">
                    <p className="editor-card-note">
                      These rows appear beside the product image on the Product
                      Details page.
                    </p>
                    <div className="information-editor">
                      {information.map((row, index) => (
                        <div key={`${row.label}-${index}`}>
                          <input
                            aria-label="Information label"
                            value={row.label}
                            placeholder="Label"
                            onChange={(event) =>
                              setInformation((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, label: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <input
                            aria-label="Information value"
                            value={row.value}
                            placeholder="Value"
                            onChange={(event) =>
                              setInformation((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, value: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                          <button
                            type="button"
                            aria-label="Remove information row"
                            onClick={() =>
                              setInformation((current) =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      className="add-row-button"
                      type="button"
                      onClick={() =>
                        setInformation((current) => [
                          ...current,
                          { label: "New information", value: "Value" },
                        ])
                      }
                    >
                      + Add information row
                    </button>
                  </EditorCard>
                  <EditorCard title="Product page content">
                    <Field label="Features (one per line)">
                      <textarea
                        name="features"
                        defaultValue={editing?.features}
                        placeholder={
                          "Official product\nFast activation\nReliable updates"
                        }
                      />
                    </Field>
                  </EditorCard>
                </div>
                <aside className="product-editor-side">
                  <EditorCard title="Media references">
                    <p className="editor-card-note">
                      Permanent file uploads will be added in the Media Upload
                      phase. For now, use HTTPS or site-relative URLs.
                    </p>
                    <Field label="Product image URL" error={fieldErrors.imageUrl}>
                      <input
                        name="imageUrl"
                        defaultValue={editing?.imageUrl || ""}
                        placeholder="/images/product.webp"
                      />
                    </Field>
                    <Field label="Image name">
                      <input
                        name="imageName"
                        defaultValue={editing?.imageName || ""}
                        placeholder="product.webp"
                      />
                    </Field>
                  </EditorCard>
                  <EditorCard title="Links & delivery">
                    <Field label="Live demo URL" error={fieldErrors.demoUrl}>
                      <input
                        name="demoUrl"
                        defaultValue={editing?.demoUrl}
                        placeholder="https://..."
                      />
                    </Field>
                    <Field
                      label="Download URL"
                      error={fieldErrors.downloadUrl}
                    >
                      <input
                        name="downloadUrl"
                        defaultValue={editing?.downloadUrl || ""}
                        placeholder="/downloads/file.zip"
                      />
                    </Field>
                    <Field label="Download file name">
                      <input
                        name="downloadName"
                        defaultValue={editing?.downloadName || ""}
                        placeholder="product.zip"
                      />
                    </Field>
                    <Field label="Activation type">
                      <select
                        name="activationType"
                        defaultValue={
                          editing?.activationType || "Assisted activation"
                        }
                      >
                        <option>Assisted activation</option>
                        <option>Download only</option>
                        <option>License key</option>
                      </select>
                    </Field>
                  </EditorCard>
                  {message && <p className="editor-saved">✓ {message}</p>}
                  {error && <p className="editor-error">{error}</p>}
                  <button
                    className="publish-product"
                    type="submit"
                    name="intent"
                    value="published"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : editing ? "Update & publish" : "Create & publish"} ↗
                  </button>
                  <button
                    className="save-draft"
                    type="submit"
                    name="intent"
                    value="draft"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save as draft"}
                  </button>
                </aside>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function AdminTop() {
  return (
    <header className="admin-topbar">
      <label>
        <span>⌕</span>
        <input placeholder="Search products, orders, customers..." />
      </label>
      <div>
        <span className="admin-top-user">M</span>
        <b>Mehedi Rahat</b>
      </div>
    </header>
  );
}

function EditorCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="admin-card editor-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="editor-field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) {
      editor.current.innerHTML = value;
    }
  }, [value]);
  function run(command: string, argument?: string) {
    editor.current?.focus();
    document.execCommand(command, false, argument);
    onChange(editor.current?.innerHTML || "");
  }
  function link() {
    const url = prompt("Enter link URL", "https://");
    if (url) run("createLink", url);
  }
  return (
    <div className="rich-text-editor">
      <div
        className="rich-text-toolbar"
        onMouseDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) {
            event.preventDefault();
          }
        }}
      >
        <select
          aria-label="Text style"
          defaultValue="p"
          onChange={(event) => run("formatBlock", event.target.value)}
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
        <button type="button" title="Bold" onClick={() => run("bold")}>
          <b>B</b>
        </button>
        <button type="button" title="Italic" onClick={() => run("italic")}>
          <i>I</i>
        </button>
        <button
          type="button"
          title="Bulleted list"
          onClick={() => run("insertUnorderedList")}
        >
          • List
        </button>
        <button
          type="button"
          title="Numbered list"
          onClick={() => run("insertOrderedList")}
        >
          1. List
        </button>
        <button type="button" title="Add link" onClick={link}>
          Link
        </button>
        <button
          type="button"
          title="Remove formatting"
          onClick={() => run("removeFormat")}
        >
          Clear
        </button>
      </div>
      <div
        ref={editor}
        className="rich-text-canvas"
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write and format the complete product description..."
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
      />
    </div>
  );
}
