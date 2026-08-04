ALTER TABLE "smtp_settings" ADD COLUMN IF NOT EXISTS "notification_email" text NOT NULL DEFAULT '';
