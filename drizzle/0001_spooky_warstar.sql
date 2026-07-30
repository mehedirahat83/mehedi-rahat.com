CREATE TABLE "product_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_status_check" CHECK ("product_categories"."status" in ('active', 'inactive')),
	CONSTRAINT "product_categories_sort_order_check" CHECK ("product_categories"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_information" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_information_sort_order_check" CHECK ("product_information"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "product_variations" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"label" text NOT NULL,
	"price" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_variations_price_check" CHECK ("product_variations"."price" >= 0),
	CONSTRAINT "product_variations_sort_order_check" CHECK ("product_variations"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"license" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"base_price" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"features" text DEFAULT '' NOT NULL,
	"faq" text DEFAULT '' NOT NULL,
	"demo_url" text DEFAULT '' NOT NULL,
	"activation_type" text DEFAULT 'Assisted activation' NOT NULL,
	"rating_tenths" integer DEFAULT 49 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"image_name" text,
	"download_url" text,
	"download_name" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_license_check" CHECK ("products"."license" in ('One Year', 'Lifetime')),
	CONSTRAINT "products_status_check" CHECK ("products"."status" in ('published', 'draft')),
	CONSTRAINT "products_base_price_check" CHECK ("products"."base_price" >= 0),
	CONSTRAINT "products_rating_tenths_check" CHECK ("products"."rating_tenths" between 0 and 50),
	CONSTRAINT "products_review_count_check" CHECK ("products"."review_count" >= 0),
	CONSTRAINT "products_sort_order_check" CHECK ("products"."sort_order" >= 0)
);
--> statement-breakpoint
ALTER TABLE "product_information" ADD CONSTRAINT "product_information_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_product_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_categories_slug_uidx" ON "product_categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "product_categories_name_uidx" ON "product_categories" USING btree ("name");--> statement-breakpoint
CREATE INDEX "product_categories_status_sort_idx" ON "product_categories" USING btree ("status","sort_order");--> statement-breakpoint
CREATE INDEX "product_information_product_sort_idx" ON "product_information" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variations_product_label_uidx" ON "product_variations" USING btree ("product_id","label");--> statement-breakpoint
CREATE INDEX "product_variations_product_sort_idx" ON "product_variations" USING btree ("product_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_uidx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_status_sort_idx" ON "products" USING btree ("category_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "products_status_updated_idx" ON "products" USING btree ("status","updated_at");