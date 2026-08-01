export type ProductVariation = { label: string; price: number };
export type ProductInformation = { label: string; value: string };

export type StorefrontProduct = {
  id: string;
  slug: string;
  categoryId: string;
  category: string;
  name: string;
  license: "One Year" | "Lifetime";
  status: "published";
  basePrice: number;
  price: number;
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

type ProductResponse = {
  ok: boolean;
  product: StorefrontProduct;
  error?: string;
};

type ProductsResponse = {
  ok: boolean;
  products: StorefrontProduct[];
  error?: string;
};

async function parseResponse<T extends { error?: string }>(
  response: Response,
): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T;
  if (!response.ok) {
    throw new Error(body.error || "Products could not be loaded.");
  }
  return body;
}

export async function fetchPublishedProducts(signal?: AbortSignal) {
  const response = await fetch("/api/products?limit=100", {
    cache: "no-store",
    signal,
  });
  return (await parseResponse<ProductsResponse>(response)).products;
}

export async function fetchPublishedProduct(
  identifier: string,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `/api/products/${encodeURIComponent(identifier)}`,
    { cache: "no-store", signal },
  );
  return (await parseResponse<ProductResponse>(response)).product;
}
