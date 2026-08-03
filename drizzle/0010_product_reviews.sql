CREATE TABLE "product_reviews" (
  "id" text PRIMARY KEY NOT NULL,
  "product_id" text NOT NULL REFERENCES "products"("id") ON DELETE cascade,
  "author_name" text NOT NULL,
  "rating" integer NOT NULL,
  "body" text NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "reviewed_at" timestamp with time zone,
  "reviewed_by" text,
  CONSTRAINT "product_reviews_rating_check" CHECK ("product_reviews"."rating" between 1 and 5),
  CONSTRAINT "product_reviews_status_check" CHECK ("product_reviews"."status" in ('pending', 'approved', 'rejected'))
);--> statement-breakpoint
CREATE INDEX "product_reviews_product_status_created_idx" ON "product_reviews" USING btree ("product_id","status","created_at");--> statement-breakpoint
INSERT INTO "product_reviews" ("id","product_id","author_name","rating","body","status","created_at","reviewed_at","reviewed_by")
SELECT p.id || '-review-' || seeded.position, p.id, seeded.author_name, 5, seeded.body, 'approved', now(), now(), 'system'
FROM "products" p
CROSS JOIN (VALUES
  (1,'Nayeem Hasan','Fast activation and helpful support.'),
  (2,'Sabbir Ahmed','The process was clear and the product worked perfectly.'),
  (3,'Farhana Islam','Quick response and dependable after-sales support.'),
  (4,'Rakib Hossain','Everything was delivered exactly as described.'),
  (5,'Tanvir Rahman','A smooth purchase experience from start to finish.')
) AS seeded(position,author_name,body)
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
UPDATE "products" p
SET "review_count" = totals.review_count,
    "rating_tenths" = totals.rating_tenths
FROM (
  SELECT product_id, count(*)::integer AS review_count, round(avg(rating) * 10)::integer AS rating_tenths
  FROM "product_reviews"
  WHERE status='approved'
  GROUP BY product_id
) totals
WHERE totals.product_id=p.id;
