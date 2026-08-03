CREATE TABLE "customer_accounts" ("customer_id" text PRIMARY KEY NOT NULL,"password_hash" text NOT NULL,"created_at" text NOT NULL,"updated_at" text NOT NULL);
--> statement-breakpoint
ALTER TABLE "customer_accounts" ADD CONSTRAINT "customer_accounts_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "customer_password_resets" ("id" text PRIMARY KEY NOT NULL,"customer_id" text NOT NULL,"token_hash" text NOT NULL UNIQUE,"expires_at" timestamp with time zone NOT NULL,"used_at" timestamp with time zone,"created_at" timestamp with time zone DEFAULT now() NOT NULL);
--> statement-breakpoint
ALTER TABLE "customer_password_resets" ADD CONSTRAINT "customer_password_resets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "customer_password_resets_customer_idx" ON "customer_password_resets" USING btree ("customer_id");
