ALTER TABLE "orders" DROP CONSTRAINT "orders_status_check";--> statement-breakpoint
ALTER TABLE "payment_submissions" DROP CONSTRAINT "payment_submissions_status_check";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_check" CHECK ("orders"."status" in ('payment_verification', 'on_hold', 'completed', 'rejected', 'refunded'));--> statement-breakpoint
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_status_check" CHECK ("payment_submissions"."status" in ('pending', 'held', 'approved', 'rejected', 'refunded'));