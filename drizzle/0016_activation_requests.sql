CREATE TABLE IF NOT EXISTS "activation_requests" (
  "id" text PRIMARY KEY NOT NULL,
  "order_id" text NOT NULL REFERENCES "orders"("id") ON DELETE cascade,
  "customer_id" text NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "website_login_url" text NOT NULL,
  "username" text,
  "password_encrypted" text,
  "customer_note" text,
  "admin_note" text,
  "status" text NOT NULL DEFAULT 'pending' CHECK ("status" in ('pending', 'approved', 'rejected')),
  "reviewed_by" text,
  "reviewed_at" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "activation_requests_customer_created_idx" ON "activation_requests" ("customer_id","created_at");
CREATE INDEX IF NOT EXISTS "activation_requests_order_idx" ON "activation_requests" ("order_id");
CREATE TABLE IF NOT EXISTS "activation_request_history" (
  "id" text PRIMARY KEY NOT NULL,
  "request_id" text NOT NULL REFERENCES "activation_requests"("id") ON DELETE cascade,
  "from_status" text,
  "to_status" text NOT NULL,
  "note" text,
  "actor" text NOT NULL,
  "created_at" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "activation_request_history_request_idx" ON "activation_request_history" ("request_id","created_at");
