ALTER TYPE "public"."recommendation_status" ADD VALUE 'superseded' BEFORE 'pending_review';--> statement-breakpoint
ALTER TABLE "recommendations" ADD COLUMN "superseded_at" timestamp with time zone;
