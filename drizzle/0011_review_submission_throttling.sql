CREATE TABLE "product_review_submissions" (
  "id" text PRIMARY KEY NOT NULL,
  "fingerprint" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "product_review_submissions_fingerprint_created_idx"
  ON "product_review_submissions" USING btree ("fingerprint", "created_at");
