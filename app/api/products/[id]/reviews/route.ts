import { isAdminRequest } from "@/app/admin-auth";
import { getPool } from "@/db";

type RouteContext = { params: Promise<{ id: string }> };
type ReviewStatus = "pending" | "approved" | "rejected";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function rating(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 5 ? parsed : null;
}

async function submissionFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const source = `${forwarded}|${userAgent}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function productId(context: RouteContext) {
  return decodeURIComponent((await context.params).id).trim().slice(0, 180);
}

export async function GET(request: Request, context: RouteContext) {
  const id = await productId(context);
  const includePending = new URL(request.url).searchParams.get("include") === "all";
  if (includePending && !(await isAdminRequest(request))) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const result = await getPool().query(
    `SELECT id,author_name AS "authorName",rating,body,status,created_at AS "createdAt"
     FROM product_reviews WHERE product_id=$1 ${includePending ? "" : "AND status='approved'"}
     ORDER BY created_at DESC,id DESC`,
    [id],
  );
  return Response.json({ ok: true, reviews: result.rows }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, context: RouteContext) {
  const id = await productId(context);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const authorName = text(body?.name, 80);
  const reviewBody = text(body?.review, 1_000);
  const reviewRating = rating(body?.rating);
  if (authorName.length < 2 || reviewBody.length < 10 || reviewRating === null) {
    return Response.json({ ok: false, error: "Enter your name, a review of at least 10 characters, and a rating." }, { status: 400 });
  }
  const product = await getPool().query("SELECT id FROM products WHERE (id=$1 OR slug=$1) AND status='published'", [id]);
  if (!product.rows[0]) return Response.json({ ok: false, error: "Product not found." }, { status: 404 });
  const client = await getPool().connect();
  try {
    const fingerprint = await submissionFingerprint(request);
    const recent = await client.query(
      "SELECT count(*)::int AS count FROM product_review_submissions WHERE fingerprint=$1 AND created_at > now() - interval '1 hour'",
      [fingerprint],
    );
    if (Number(recent.rows[0]?.count || 0) >= 3) {
      return Response.json({ ok: false, error: "Too many review submissions. Please try again in an hour." }, { status: 429 });
    }
    await client.query("BEGIN");
    await client.query(
      "INSERT INTO product_review_submissions (id,fingerprint,created_at) VALUES ($1,$2,now())",
      [crypto.randomUUID(), fingerprint],
    );
    const result = await client.query(
      `INSERT INTO product_reviews (id,product_id,author_name,rating,body,status,created_at)
       VALUES ($1,$2,$3,$4,$5,'pending',now())
       RETURNING id,author_name AS "authorName",rating,body,status,created_at AS "createdAt"`,
      [crypto.randomUUID(), product.rows[0].id, authorName, reviewRating, reviewBody],
    );
    await client.query("COMMIT");
    return Response.json({ ok: true, review: result.rows[0] }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Could not submit product review", error);
    return Response.json({ ok: false, error: "Your review could not be submitted." }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }
  const id = await productId(context);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const reviewId = text(body?.reviewId, 100);
  const status = text(body?.status, 20) as ReviewStatus;
  if (!reviewId || !new Set<ReviewStatus>(["approved", "rejected"]).has(status)) {
    return Response.json({ ok: false, error: "Choose a review and moderation decision." }, { status: 400 });
  }
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const updated = await client.query(
      `UPDATE product_reviews SET status=$1,reviewed_at=now(),reviewed_by='admin'
       WHERE id=$2 AND product_id=(SELECT id FROM products WHERE id=$3 OR slug=$3)
       RETURNING product_id`,
      [status, reviewId, id],
    );
    const resolvedProductId = updated.rows[0]?.product_id;
    if (!resolvedProductId) {
      await client.query("ROLLBACK");
      return Response.json({ ok: false, error: "Review not found." }, { status: 404 });
    }
    await client.query(
      `UPDATE products SET review_count=(SELECT count(*)::int FROM product_reviews WHERE product_id=$1 AND status='approved'),
       rating_tenths=COALESCE((SELECT round(avg(rating)*10)::int FROM product_reviews WHERE product_id=$1 AND status='approved'),0),updated_at=now()
       WHERE id=$1`,
      [resolvedProductId],
    );
    await client.query("COMMIT");
    return Response.json({ ok: true });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    console.error("Could not moderate product review", error);
    return Response.json({ ok: false, error: "Could not update the review." }, { status: 500 });
  } finally {
    client.release();
  }
}
