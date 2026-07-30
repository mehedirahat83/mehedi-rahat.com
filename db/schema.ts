import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const productCategories = pgTable(
  "product_categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_categories_slug_uidx").on(table.slug),
    uniqueIndex("product_categories_name_uidx").on(table.name),
    index("product_categories_status_sort_idx").on(
      table.status,
      table.sortOrder,
    ),
    check(
      "product_categories_status_check",
      sql`${table.status} in ('active', 'inactive')`,
    ),
    check(
      "product_categories_sort_order_check",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => productCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    license: text("license").notNull(),
    status: text("status").notNull().default("draft"),
    basePrice: integer("base_price").notNull(),
    description: text("description").notNull().default(""),
    features: text("features").notNull().default(""),
    faq: text("faq").notNull().default(""),
    demoUrl: text("demo_url").notNull().default(""),
    activationType: text("activation_type")
      .notNull()
      .default("Assisted activation"),
    ratingTenths: integer("rating_tenths").notNull().default(49),
    reviewCount: integer("review_count").notNull().default(0),
    imageUrl: text("image_url"),
    imageName: text("image_name"),
    downloadUrl: text("download_url"),
    downloadName: text("download_name"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("products_slug_uidx").on(table.slug),
    index("products_category_status_sort_idx").on(
      table.categoryId,
      table.status,
      table.sortOrder,
    ),
    index("products_status_updated_idx").on(table.status, table.updatedAt),
    check(
      "products_license_check",
      sql`${table.license} in ('One Year', 'Lifetime')`,
    ),
    check(
      "products_status_check",
      sql`${table.status} in ('published', 'draft')`,
    ),
    check("products_base_price_check", sql`${table.basePrice} >= 0`),
    check(
      "products_rating_tenths_check",
      sql`${table.ratingTenths} between 0 and 50`,
    ),
    check("products_review_count_check", sql`${table.reviewCount} >= 0`),
    check("products_sort_order_check", sql`${table.sortOrder} >= 0`),
  ],
);

export const productVariations = pgTable(
  "product_variations",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    price: integer("price").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("product_variations_product_label_uidx").on(
      table.productId,
      table.label,
    ),
    index("product_variations_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    check("product_variations_price_check", sql`${table.price} >= 0`),
    check(
      "product_variations_sort_order_check",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const productInformation = pgTable(
  "product_information",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("product_information_product_sort_idx").on(
      table.productId,
      table.sortOrder,
    ),
    check(
      "product_information_sort_order_check",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const enquiries = pgTable(
  "enquiries",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    mobile: text("mobile").notNull(),
    service: text("service").notNull(),
    details: text("details").notNull(),
    status: text("status").notNull().default("new"),
    sourcePath: text("source_path").notNull().default("/contact"),
    emailStatus: text("email_status").notNull().default("pending"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (table) => [
    index("enquiries_created_at_idx").on(table.createdAt),
    index("enquiries_status_idx").on(table.status),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    lifetimeSpend: integer("lifetime_spend").notNull().default(0),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("customers_email_idx").on(table.email)],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    receiptTokenHash: text("receipt_token_hash").notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    status: text("status").notNull().default("payment_verification"),
    currency: text("currency").notNull().default("BDT"),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    paymentCharge: integer("payment_charge").notNull().default(0),
    total: integer("total").notNull(),
    couponCode: text("coupon_code"),
    paymentMethod: text("payment_method").notNull(),
    notes: text("notes"),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    completedAt: text("completed_at"),
  },
  (table) => [
    index("orders_customer_idx").on(table.customerId),
    index("orders_status_idx").on(table.status),
    index("orders_created_idx").on(table.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    itemKey: text("item_key").notNull(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    variation: text("variation").notNull(),
    unitPrice: integer("unit_price").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: integer("line_total").notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const paymentSubmissions = pgTable(
  "payment_submissions",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    method: text("method").notNull(),
    senderNumber: text("sender_number").notNull(),
    transactionId: text("transaction_id").notNull().unique(),
    status: text("status").notNull().default("pending"),
    verifiedBy: text("verified_by"),
    verifiedAt: text("verified_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("payment_order_idx").on(table.orderId),
    index("payment_transaction_idx").on(table.transactionId),
  ],
);

export const orderStatusHistory = pgTable(
  "order_status_history",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    note: text("note"),
    actor: text("actor").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("order_history_order_idx").on(table.orderId)],
);

export const entitlements = pgTable(
  "entitlements",
  {
    id: text("id").primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id),
    orderItemId: text("order_item_id")
      .notNull()
      .references(() => orderItems.id),
    itemKey: text("item_key").notNull(),
    variation: text("variation").notNull(),
    status: text("status").notNull().default("active"),
    downloadUrl: text("download_url"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("entitlements_customer_idx").on(table.customerId),
    index("entitlements_order_idx").on(table.orderId),
  ],
);

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").references(() => orders.id),
    kind: text("kind").notNull(),
    recipient: text("recipient").notNull(),
    subject: text("subject").notNull(),
    status: text("status").notNull().default("pending"),
    providerId: text("provider_id"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: text("created_at").notNull(),
    sentAt: text("sent_at"),
  },
  (table) => [
    index("email_outbox_status_idx").on(table.status),
    index("email_outbox_order_idx").on(table.orderId),
  ],
);
