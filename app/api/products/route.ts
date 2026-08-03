import { isAdminRequest } from "@/app/admin-auth";
import { getPool } from "@/db";
import {
  activationLimitForVariation,
  databaseError,
  findProduct,
  listHomepageProducts,
  listProducts,
  slugify,
  unauthorized,
  validateProductInput,
} from "./shared";

function pagination(url: URL) {
  const requestedPage = Number(url.searchParams.get("page") ?? 1);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 50);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const limit =
    Number.isSafeInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 50;
  return { page, limit, offset: (page - 1) * limit };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get("include") === "drafts";
  const homepageOnly = url.searchParams.get("homepage") === "featured";
  if (includeDrafts && !(await isAdminRequest(request))) return unauthorized();

  const { page, limit, offset } = pagination(url);
  try {
    const products = homepageOnly
      ? await listHomepageProducts(limit)
      : await listProducts({ includeDrafts, limit, offset });
    return Response.json(
      {
        ok: true,
        products,
        pagination: {
          page,
          limit,
          returned: products.length,
          hasMore: products.length === limit,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return databaseError(error, "Products could not be loaded.");
  }
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return unauthorized();

  const body = await request.json().catch(() => null);
  const validation = validateProductInput(body);
  if (!validation.ok) {
    return Response.json(
      {
        ok: false,
        error: validation.error,
        fields: validation.fields,
      },
      { status: 400 },
    );
  }

  const value = validation.value;
  const id = crypto.randomUUID();
  const slug = value.slug || slugify(value.name || "");
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO products
        (id,slug,category_id,name,license,status,base_price,description,features,
         faq,demo_url,activation_type,rating_tenths,review_count,image_url,
         image_name,download_url,download_name,sort_order,homepage_featured,
         homepage_sort_order,created_at,updated_at)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,now(),now())`,
      [
        id,
        slug,
        value.categoryId,
        value.name,
        value.license,
        value.status ?? "draft",
        value.basePrice,
        value.description ?? "",
        value.features ?? "",
        value.faq ?? "",
        value.demoUrl ?? "",
        value.activationType || "Assisted activation",
        value.ratingTenths ?? 49,
        value.reviewCount ?? 0,
        value.imageUrl ?? null,
        value.imageName ?? null,
        value.downloadUrl ?? null,
        value.downloadName ?? null,
        value.sortOrder ?? 0,
        value.homepageFeatured ?? false,
        value.homepageSortOrder ?? 0,
      ],
    );

    for (const [index, variation] of (value.variations ?? []).entries()) {
      await client.query(
        `INSERT INTO product_variations
          (id,product_id,label,price,activation_limit,sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
        [crypto.randomUUID(), id, variation.label, variation.price, activationLimitForVariation(variation.label), index],
      );
    }
    for (const [index, information] of (value.information ?? []).entries()) {
      await client.query(
        `INSERT INTO product_information
          (id,product_id,label,value,sort_order) VALUES ($1,$2,$3,$4,$5)`,
        [
          crypto.randomUUID(),
          id,
          information.label,
          information.value,
          index,
        ],
      );
    }

    await client.query("COMMIT");
    const product = await findProduct(id, true);
    return Response.json({ ok: true, product }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    return databaseError(error, "The product could not be created.");
  } finally {
    client.release();
  }
}
