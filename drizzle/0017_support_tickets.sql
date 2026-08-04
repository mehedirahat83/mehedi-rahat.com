CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" text PRIMARY KEY NOT NULL,
  "customer_id" text NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "order_id" text NOT NULL REFERENCES "orders"("id") ON DELETE restrict,
  "subject" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'normal' CHECK ("priority" in ('low','normal','high','urgent')),
  "status" text NOT NULL DEFAULT 'open' CHECK ("status" in ('open','waiting_customer','waiting_admin','closed')),
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  "closed_at" text
);
CREATE INDEX IF NOT EXISTS "support_tickets_customer_updated_idx" ON "support_tickets" ("customer_id","updated_at");
CREATE INDEX IF NOT EXISTS "support_tickets_status_updated_idx" ON "support_tickets" ("status","updated_at");
CREATE INDEX IF NOT EXISTS "support_tickets_order_idx" ON "support_tickets" ("order_id");
CREATE TABLE IF NOT EXISTS "support_ticket_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "ticket_id" text NOT NULL REFERENCES "support_tickets"("id") ON DELETE cascade,
  "author_type" text NOT NULL CHECK ("author_type" in ('customer','admin')),
  "author_name" text NOT NULL,
  "body" text NOT NULL,
  "created_at" text NOT NULL
);
CREATE INDEX IF NOT EXISTS "support_ticket_messages_ticket_created_idx" ON "support_ticket_messages" ("ticket_id","created_at");
