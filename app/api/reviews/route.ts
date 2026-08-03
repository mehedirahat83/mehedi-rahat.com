import { getPool } from "@/db";

const PAGE_SIZE = 20;

export async function GET(request: Request) {
  const requestedPage = Number(new URL(request.url).searchParams.get("page") || "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const offset = (page - 1) * PAGE_SIZE;
  const pool = getPool();
  const [reviews, total] = await Promise.all([
    pool.query(
      `SELECT r.id,r.author_name AS "authorName",r.rating,r.body,r.created_at AS "createdAt",
              p.name AS "productName",p.slug AS "productSlug"
       FROM product_reviews r
       INNER JOIN products p ON p.id=r.product_id
       WHERE r.status='approved' AND p.status='published'
       ORDER BY r.created_at DESC,r.id DESC
       LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset],
    ),
    pool.query("SELECT count(*)::int AS total FROM product_reviews r INNER JOIN products p ON p.id=r.product_id WHERE r.status='approved' AND p.status='published'"),
  ]);
  return Response.json(
    { ok: true, reviews: reviews.rows, page, pageSize: PAGE_SIZE, total: total.rows[0]?.total || 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}
