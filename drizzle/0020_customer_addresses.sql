CREATE TABLE IF NOT EXISTS "customer_addresses" (
  "id" text PRIMARY KEY NOT NULL,
  "customer_id" text NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "label" text NOT NULL DEFAULT 'Address',
  "recipient_name" text NOT NULL DEFAULT '',
  "phone" text NOT NULL DEFAULT '',
  "line1" text NOT NULL DEFAULT '',
  "line2" text NOT NULL DEFAULT '',
  "city" text NOT NULL DEFAULT '',
  "postcode" text NOT NULL DEFAULT '',
  "country" text NOT NULL DEFAULT 'Bangladesh',
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "customer_addresses_customer_idx" ON "customer_addresses" ("customer_id");
CREATE INDEX IF NOT EXISTS "customer_addresses_customer_default_idx" ON "customer_addresses" ("customer_id", "is_default");
