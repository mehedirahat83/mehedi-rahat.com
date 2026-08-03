CREATE TABLE "smtp_settings" (
  "id" text PRIMARY KEY NOT NULL,
  "host" text NOT NULL,
  "port" integer NOT NULL,
  "secure" boolean DEFAULT false NOT NULL,
  "username" text NOT NULL,
  "password_encrypted" text NOT NULL,
  "from_email" text NOT NULL,
  "from_name" text NOT NULL,
  "updated_by" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
