ALTER TABLE "interactions" ADD COLUMN "verified_fact_paths" jsonb;--> statement-breakpoint
ALTER TYPE "public"."audit_action" ADD VALUE 'interaction_facts_verified';
