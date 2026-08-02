import { isAdminRequest } from "@/app/admin-auth";
import { getPool } from "@/db";
import {
  activationLimitForVariation,
  databaseError,
  findProduct,
  unauthorized,
  validateProductInput,
  type ProductWriteInput,
} from "../shared";

type RouteContext = { params: Promise<{ id: string }> };

async function identifier(context: RouteContext) {
  const value = decodeURIComponent((await context.params).id).trim();
  return value.slice(0, 180);
}

export async function GET(request: Request, context: RouteContext) {
  const id = await identifier(context);
  if (!id) {
    return Response.json(
      { ok: false, error: "A product identifier is required." },
      { status: 400 },
    );
  }

  const includeDrafts =
    new URL(request.url).searchParams.get("include") === "drafts";
  if (includeDrafts && !(await isAdminRequest(request))) return unauthorized();

  try {
    const product = await findProduct(id, includeDrafts);
    if (!product) {
      return Response.json(
        { ok: false, error: "Product not found." },
        { status: 404 },
      );
    }
    return Response.json(
      { ok: true, product },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return databaseError(error, "The product could not be loaded.");
  }
}

const columns: Partial<Record<keyof ProductWriteInput, string>> = {
  name: "name",
  slug: "slug",
  categoryId: "category_id",
  license: "license",
  status: "status",
  basePrice: "base_price",
  description: "description",
  features: "features",
  faq: "faq",
  demoUrl: "demo_url",
  activationType: "activation_type",
  ratingTenths: "rating_tenths",
  reviewCount: "review_count",
  imageUrl: "image_url",
  imageName: "image_name",
  downloadUrl: "download_url",
  downloadName: "download_name",
  sortOrder: "sort_order",
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const id = await identifier(context);
  if (!id) {
    return Response.json(
      { ok: false, error: "A product identifier is required." },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => null);
  const validation = validateProductInput(body, { partial: true });
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
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const existing = await client.query<{ id: string }>(
      "SELECT id FROM products WHERE id=$1 OR slug=$1 FOR UPDATE",
      [id],
    );
    const productId = existing.rows[0]?.id;
    if (!productId) {
      await client.query("ROLLBACK");
      return Response.json(
        { ok: false, error: "Product not found." },
        { status: 404 },
      );
    }

    const updates: string[] = [];
    const parameters: unknown[] = [];
    for (const [key, column] of Object.entries(columns) as [
      keyof ProductWriteInput,
      string,
    ][]) {
      if (!(key in value)) continue;
      parameters.push(value[key]);
      updates.push(`${column}=$${parameters.length}`);
    }
    if (updates.length) {
      parameters.push(productId);
      await client.query(
        `UPDATE products SET ${updates.join(",")},updated_at=now()
         WHERE id=$${parameters.length}`,
        parameters,
      );
    }

    if (value.variations) {
      await client.query(
        "DELETE FROM product_variations WHERE product_id=$1",
        [productId],
      );
      for (const [index, variation] of value.variations.entries()) {
        await client.query(
          `INSERT INTO product_variations
            (id,product_id,label,price,activation_limit,sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            crypto.randomUUID(),
            productId,
            variation.label,
            variation.price,
            activationLimitForVariation(variation.label),
            index,
          ],
        );
      }
    }
    if (value.information) {
      await client.query(
        "DELETE FROM product_information WHERE product_id=$1",
        [productId],
      );
      for (const [index, information] of value.information.entries()) {
        await client.query(
          `INSERT INTO product_information
            (id,product_id,label,value,sort_order) VALUES ($1,$2,$3,$4,$5)`,
          [
            crypto.randomUUID(),
            productId,
            information.label,
            information.value,
            index,
          ],
        );
      }
    }

    await client.query("COMMIT");
    const product = await findProduct(productId, true);
    return Response.json({ ok: true, product });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    return databaseError(error, "The product could not be updated.");
  } finally {
    client.release();
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminRequest(request))) return unauthorized();
  const id = await identifier(context);
  if (!id) {
    return Response.json(
      { ok: false, error: "A product identifier is required." },
      { status: 400 },
    );
  }

  try {
    const result = await getPool().query<{ id: string }>(
      "DELETE FROM products WHERE id=$1 OR slug=$1 RETURNING id",
      [id],
    );
    if (!result.rowCount) {
      return Response.json(
        { ok: false, error: "Product not found." },
        { status: 404 },
      );
    }
    return Response.json({ ok: true, deletedId: result.rows[0].id });
  } catch (error) {
    return databaseError(error, "The product could not be deleted.");
  }
}
