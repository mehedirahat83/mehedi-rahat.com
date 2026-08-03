ALTER TABLE "products" ADD COLUMN "homepage_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "homepage_sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_homepage_sort_order_check" CHECK ("products"."homepage_sort_order" >= 0);--> statement-breakpoint
CREATE INDEX "products_homepage_featured_idx" ON "products" USING btree ("homepage_featured","status","homepage_sort_order");--> statement-breakpoint
UPDATE "products" SET "homepage_featured" = true WHERE "status" = 'published';
