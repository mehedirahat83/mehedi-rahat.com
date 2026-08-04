ALTER TABLE "smtp_settings"
  ALTER COLUMN "notification_email" SET DEFAULT 'mehedirahat83@gmail.com';

UPDATE "smtp_settings"
SET "notification_email" = 'mehedirahat83@gmail.com'
WHERE btrim("notification_email") = '';
