CREATE TABLE "license_activation_history" (
	"id" text PRIMARY KEY NOT NULL,
	"activation_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"note" text,
	"actor" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_activations" (
	"id" text PRIMARY KEY NOT NULL,
	"entitlement_id" text NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"note" text,
	"activated_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "license_activations_status_check" CHECK ("license_activations"."status" in ('pending', 'active', 'suspended', 'revoked'))
);
--> statement-breakpoint
ALTER TABLE "entitlements" ADD COLUMN "license_id" text;--> statement-breakpoint
ALTER TABLE "entitlements" ADD COLUMN "activation_limit" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variations" ADD COLUMN "activation_limit" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
UPDATE "product_variations" SET "activation_limit" = CASE WHEN "label" ~* '([0-9]+)\s*sites?' THEN GREATEST(1, ((regexp_match("label", '([0-9]+)\s*sites?', 'i'))[1])::integer) ELSE 1 END;--> statement-breakpoint
UPDATE "entitlements" e SET "license_id" = concat('LIC-',upper(substr(md5(e."order_item_id"),1,6)),'-',upper(substr(md5(e."order_id"),1,4))), "activation_limit" = COALESCE(pv."activation_limit",1) * oi."quantity" FROM "order_items" oi LEFT JOIN "product_variations" pv ON pv."product_id"=oi."item_key" AND pv."label"=oi."variation" WHERE e."order_item_id"=oi."id";--> statement-breakpoint
ALTER TABLE "license_activation_history" ADD CONSTRAINT "license_activation_history_activation_id_license_activations_id_fk" FOREIGN KEY ("activation_id") REFERENCES "public"."license_activations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_entitlement_id_entitlements_id_fk" FOREIGN KEY ("entitlement_id") REFERENCES "public"."entitlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_activation_history_activation_idx" ON "license_activation_history" USING btree ("activation_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "license_activations_entitlement_domain_uidx" ON "license_activations" USING btree ("entitlement_id","domain");--> statement-breakpoint
CREATE INDEX "license_activations_domain_idx" ON "license_activations" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "license_activations_status_idx" ON "license_activations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "entitlements_license_id_uidx" ON "entitlements" USING btree ("license_id");--> statement-breakpoint
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_activation_limit_check" CHECK ("entitlements"."activation_limit" >= 1);--> statement-breakpoint
ALTER TABLE "product_variations" ADD CONSTRAINT "product_variations_activation_limit_check" CHECK ("product_variations"."activation_limit" >= 1);
