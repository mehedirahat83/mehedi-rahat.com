import type { PoolClient, QueryResultRow } from "pg";
import { getPool } from "@/db";

export type ProductStatus = "published" | "draft";
export type ProductLicense = "One Year" | "Lifetime";
export type ProductVariationInput = { label: string; price: number; activationLimit?: number };
export type ProductInformationInput = { label: string; value: string };

export type ProductWriteInput = {
  name?: string;
  slug?: string;
  categoryId?: string;
  license?: ProductLicense;
  status?: ProductStatus;
  basePrice?: number;
  description?: string;
  features?: string;
  faq?: string;
  demoUrl?: string;
  activationType?: string;
  ratingTenths?: number;
  reviewCount?: number;
  imageUrl?: string | null;
  imageName?: string | null;
  downloadUrl?: string | null;
  downloadName?: string | null;
  resellUrl?: string;
  sortOrder?: number;
  homepageFeatured?: boolean;
  homepageSortOrder?: number;
  variations?: ProductVariationInput[];
  information?: ProductInformationInput[];
};

type ValidationResult =
  | { ok: true; value: ProductWriteInput }
  | { ok: false; error: string; fields: Record<string, string> };

const licenses = new Set<ProductLicense>(["One Year", "Lifetime"]);
const statuses = new Set<ProductStatus>(["published", "draft"]);
export function activationLimitForVariation(label: string) { const match = label.match(/(\d+)\s*sites?/i); return match ? Math.max(1, Number(match[1])) : 1; }

function has(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function nullableText(value: unknown, max: number) {
  if (value === null || value === undefined || value === "") return null;
  return text(value, max) || null;
}

function integer(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function isSafeResourceUrl(value: string | null) {
  if (!value) return true;
  if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/]+={0,2}$/i.test(value)) return true;
  if (value.startsWith("/")) return !value.startsWith("//");
  if (value.startsWith("#")) return value.length > 1;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function validateProductInput(
  input: unknown,
  options: { partial?: boolean } = {},
): ValidationResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {
      ok: false,
      error: "A valid product object is required.",
      fields: { body: "Expected a JSON object." },
    };
  }

  const body = input as Record<string, unknown>;
  const partial = options.partial === true;
  const value: ProductWriteInput = {};
  const fields: Record<string, string> = {};

  const required = (key: string) => !partial || has(body, key);

  if (required("name")) {
    value.name = text(body.name, 160);
    if (value.name.length < 2) fields.name = "Use at least 2 characters.";
  }

  if (has(body, "slug")) {
    value.slug = slugify(text(body.slug, 180));
    if (!value.slug) fields.slug = "Use a valid URL slug.";
  }

  if (required("categoryId")) {
    value.categoryId = text(body.categoryId, 100);
    if (!value.categoryId) fields.categoryId = "Select a category.";
  }

  if (required("license")) {
    const license = text(body.license, 40) as ProductLicense;
    if (!licenses.has(license)) {
      fields.license = "License must be One Year or Lifetime.";
    } else {
      value.license = license;
    }
  }

  if (has(body, "status") || !partial) {
    const status = text(body.status ?? "draft", 20).toLowerCase() as ProductStatus;
    if (!statuses.has(status)) {
      fields.status = "Status must be published or draft.";
    } else {
      value.status = status;
    }
  }

  if (required("basePrice")) {
    const parsed = integer(body.basePrice);
    if (parsed === null || parsed < 0 || parsed > 100_000_000) {
      fields.basePrice = "Use a non-negative whole-number price.";
    } else {
      value.basePrice = parsed;
    }
  }

  const boundedTextFields = [
    ["description", 20_000],
    ["features", 20_000],
    ["faq", 20_000],
    ["activationType", 160],
  ] as const;
  for (const [key, max] of boundedTextFields) {
    if (has(body, key)) value[key] = text(body[key], max);
  }

  if (has(body, "demoUrl")) {
    value.demoUrl = text(body.demoUrl, 2048);
    if (!isSafeResourceUrl(value.demoUrl)) {
      fields.demoUrl = "Use a valid HTTP(S) or site-relative URL.";
    }
  }

  if (has(body, "resellUrl")) {
    value.resellUrl = text(body.resellUrl, 2048) || "#resell";
    if (!isSafeResourceUrl(value.resellUrl)) {
      fields.resellUrl = "Use a valid HTTP(S) or site-relative URL.";
    }
  }

  const resourceFields = ["imageUrl", "downloadUrl"] as const;
  for (const key of resourceFields) {
    if (!has(body, key)) continue;
    value[key] = nullableText(body[key], key === "imageUrl" ? 2_100_000 : 2048);
    if (!isSafeResourceUrl(value[key] ?? null)) {
      fields[key] = "Use a valid HTTP(S) or site-relative URL.";
    }
  }

  const fileNameFields = ["imageName", "downloadName"] as const;
  for (const key of fileNameFields) {
    if (has(body, key)) value[key] = nullableText(body[key], 255);
  }

  if (has(body, "rating") || has(body, "ratingTenths")) {
    const ratingTenths = has(body, "ratingTenths")
      ? integer(body.ratingTenths)
      : Math.round(Number(body.rating) * 10);
    if (
      ratingTenths === null ||
      !Number.isFinite(ratingTenths) ||
      ratingTenths < 0 ||
      ratingTenths > 50
    ) {
      fields.rating = "Rating must be between 0 and 5.";
    } else {
      value.ratingTenths = ratingTenths;
    }
  }

  for (const key of ["reviewCount", "sortOrder"] as const) {
    if (!has(body, key)) continue;
    const parsed = integer(body[key]);
    if (parsed === null || parsed < 0) {
      fields[key] = "Use a non-negative whole number.";
    } else {
      value[key] = parsed;
    }
  }

  if (has(body, "homepageFeatured")) {
    if (typeof body.homepageFeatured !== "boolean") {
      fields.homepageFeatured = "Choose whether this product appears on the homepage.";
    } else {
      value.homepageFeatured = body.homepageFeatured;
    }
  }

  if (has(body, "homepageSortOrder")) {
    const parsed = integer(body.homepageSortOrder);
    if (parsed === null || parsed < 0) {
      fields.homepageSortOrder = "Use a non-negative whole number.";
    } else {
      value.homepageSortOrder = parsed;
    }
  }

  if (has(body, "variations")) {
    if (!Array.isArray(body.variations) || body.variations.length > 50) {
      fields.variations = "Provide no more than 50 variations.";
    } else {
      const variations: ProductVariationInput[] = [];
      const labels = new Set<string>();
      body.variations.forEach((item, index) => {
        const row =
          item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
        const label = text(row.label, 100);
        const price = integer(row.price);
        const normalizedLabel = label.toLowerCase();
        if (!label || price === null || price < 0 || labels.has(normalizedLabel)) {
          fields[`variations.${index}`] =
            "Each variation needs a unique label and non-negative price.";
          return;
        }
        labels.add(normalizedLabel);
        variations.push({ label, price });
      });
      value.variations = variations;
    }
  }

  if (has(body, "information")) {
    if (!Array.isArray(body.information) || body.information.length > 50) {
      fields.information = "Provide no more than 50 information rows.";
    } else {
      const information: ProductInformationInput[] = [];
      body.information.forEach((item, index) => {
        const row =
          item && typeof item === "object" && !Array.isArray(item)
            ? (item as Record<string, unknown>)
            : {};
        const label = text(row.label, 120);
        const rowValue = text(row.value, 500);
        if (!label || !rowValue) {
          fields[`information.${index}`] =
            "Each information row needs a label and value.";
          return;
        }
        information.push({ label, value: rowValue });
      });
      value.information = information;
    }
  }

  if (!partial && !value.variations?.length && value.basePrice !== undefined) {
    value.variations = [{ label: "01 Site", price: value.basePrice }];
  }
  if (!partial) value.information ??= [];

  if (Object.keys(fields).length) {
    return {
      ok: false,
      error: "Please correct the highlighted product fields.",
      fields,
    };
  }
  if (partial && Object.keys(value).length === 0) {
    return {
      ok: false,
      error: "No supported product fields were provided.",
      fields: { body: "Provide at least one field to update." },
    };
  }
  return { ok: true, value };
}

type ProductRow = QueryResultRow & {
  id: string;
  slug: string;
  category_id: string;
  category_name: string;
  name: string;
  license: ProductLicense;
  status: ProductStatus;
  base_price: number;
  description: string;
  features: string;
  faq: string;
  demo_url: string;
  activation_type: string;
  rating_tenths: number;
  review_count: number;
  image_url: string | null;
  image_name: string | null;
  download_url: string | null;
  download_name: string | null;
  resell_url: string;
  sort_order: number;
  homepage_featured: boolean;
  homepage_sort_order: number;
  created_at: Date | string;
  updated_at: Date | string;
};

const productSelect = `SELECT p.id,p.slug,p.category_id,c.name AS category_name,
  p.name,p.license,p.status,p.base_price,p.description,p.features,p.faq,
  p.demo_url,p.activation_type,p.rating_tenths,p.review_count,p.image_url,
  p.image_name,p.download_url,p.download_name,p.resell_url,p.sort_order,p.homepage_featured,
  p.homepage_sort_order,p.created_at,p.updated_at
  FROM products p
  INNER JOIN product_categories c ON c.id=p.category_id`;

function serializeProduct(
  row: ProductRow,
  variations: ProductVariationInput[],
  information: ProductInformationInput[],
) {
  return {
    id: row.id,
    slug: row.slug,
    categoryId: row.category_id,
    category: row.category_name,
    name: row.name,
    license: row.license,
    status: row.status,
    basePrice: Number(row.base_price),
    price: Number(row.base_price),
    description: row.description,
    features: row.features,
    faq: row.faq,
    demoUrl: row.demo_url,
    activationType: row.activation_type,
    rating: Number(row.rating_tenths) / 10,
    reviewCount: Number(row.review_count),
    imageUrl: row.image_url,
    imageName: row.image_name,
    downloadUrl: row.download_url,
    downloadName: row.download_name,
    resellUrl: row.resell_url,
    sortOrder: Number(row.sort_order),
    homepageFeatured: row.homepage_featured,
    homepageSortOrder: Number(row.homepage_sort_order),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    variations,
    information,
  };
}

async function loadChildren(client: PoolClient, productIds: string[]) {
  if (!productIds.length) {
    return {
      variations: new Map<string, ProductVariationInput[]>(),
      information: new Map<string, ProductInformationInput[]>(),
    };
  }
  const [variationResult, informationResult] = await Promise.all([
    client.query(
      `SELECT product_id,label,price,activation_limit FROM product_variations
       WHERE product_id=ANY($1::text[]) ORDER BY product_id,sort_order,id`,
      [productIds],
    ),
    client.query(
      `SELECT product_id,label,value FROM product_information
       WHERE product_id=ANY($1::text[]) ORDER BY product_id,sort_order,id`,
      [productIds],
    ),
  ]);
  const variations = new Map<string, ProductVariationInput[]>();
  for (const row of variationResult.rows) {
    const list = variations.get(row.product_id) ?? [];
    list.push({ label: row.label, price: Number(row.price), activationLimit: Number(row.activation_limit) });
    variations.set(row.product_id, list);
  }
  const information = new Map<string, ProductInformationInput[]>();
  for (const row of informationResult.rows) {
    const list = information.get(row.product_id) ?? [];
    list.push({ label: row.label, value: row.value });
    information.set(row.product_id, list);
  }
  return { variations, information };
}

export async function listProducts(options: {
  includeDrafts: boolean;
  limit: number;
  offset: number;
  orderByCompletedSales?: boolean;
}) {
  const client = await getPool().connect();
  try {
    const where = options.includeDrafts ? "" : "WHERE p.status='published'";
    const salesJoin = options.orderByCompletedSales
      ? `LEFT JOIN (
          SELECT oi.item_key, SUM(oi.quantity)::int AS completed_sales
          FROM order_items oi
          INNER JOIN orders o ON o.id=oi.order_id
          WHERE o.status='completed'
          GROUP BY oi.item_key
        ) completed_sales ON completed_sales.item_key=p.id`
      : "";
    const ordering = options.orderByCompletedSales
      ? "COALESCE(completed_sales.completed_sales,0) DESC,p.sort_order,p.name,p.id"
      : "p.sort_order,p.name,p.id";
    const result = await client.query<ProductRow>(
      `${productSelect} ${salesJoin} ${where}
       ORDER BY ${ordering} LIMIT $1 OFFSET $2`,
      [options.limit, options.offset],
    );
    const ids = result.rows.map((row) => row.id);
    const children = await loadChildren(client, ids);
    return result.rows.map((row) =>
      serializeProduct(
        row,
        children.variations.get(row.id) ?? [],
        children.information.get(row.id) ?? [],
      ),
    );
  } finally {
    client.release();
  }
}

export async function listHomepageProducts(limit: number) {
  const client = await getPool().connect();
  try {
    const result = await client.query<ProductRow>(
      `WITH homepage_sales AS (
        SELECT p.id,
          COALESCE(SUM(CASE WHEN o.status='completed' THEN oi.quantity ELSE 0 END),0)::int AS completed_sales
        FROM products p
        LEFT JOIN order_items oi ON oi.item_key=p.id
        LEFT JOIN orders o ON o.id=oi.order_id
        WHERE p.status='published' AND p.homepage_featured=true
        GROUP BY p.id
      )
      ${productSelect}
      INNER JOIN homepage_sales hs ON hs.id=p.id
      ORDER BY hs.completed_sales DESC,p.homepage_sort_order,p.sort_order,p.name,p.id
      LIMIT $1`,
      [limit],
    );
    const ids = result.rows.map((row) => row.id);
    const children = await loadChildren(client, ids);
    return result.rows.map((row) =>
      serializeProduct(
        row,
        children.variations.get(row.id) ?? [],
        children.information.get(row.id) ?? [],
      ),
    );
  } finally {
    client.release();
  }
}

export async function findProduct(
  identifier: string,
  includeDrafts: boolean,
) {
  const client = await getPool().connect();
  try {
    const visibility = includeDrafts ? "" : "AND p.status='published'";
    const result = await client.query<ProductRow>(
      `${productSelect} WHERE (p.id=$1 OR p.slug=$1) ${visibility} LIMIT 1`,
      [identifier],
    );
    const row = result.rows[0];
    if (!row) return null;
    const children = await loadChildren(client, [row.id]);
    return serializeProduct(
      row,
      children.variations.get(row.id) ?? [],
      children.information.get(row.id) ?? [],
    );
  } finally {
    client.release();
  }
}

export function unauthorized() {
  return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

export function databaseError(error: unknown, fallback: string) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  if (code === "23505") {
    return Response.json(
      { ok: false, error: "A product with this name or slug already exists." },
      { status: 409 },
    );
  }
  if (code === "23503") {
    return Response.json(
      { ok: false, error: "The selected category does not exist." },
      { status: 400 },
    );
  }
  console.error(fallback, error);
  return Response.json({ ok: false, error: fallback }, { status: 500 });
}
