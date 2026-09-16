CREATE TYPE "public"."recommendation_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."recommendation_status" AS ENUM('draft', 'pending_review', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"interaction_id" text NOT NULL,
	"status" "recommendation_status" NOT NULL,
	"title" text NOT NULL,
	"rationale" text NOT NULL,
	"summary" text,
	"priority" "recommendation_priority",
	"client_evidence" jsonb,
	"knowledge_citations" jsonb,
	"created_at" timestamp with time zone NOT NULL,
	"reviewer_id" text,
	"reviewed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_interaction_id_interactions_id_fk" FOREIGN KEY ("interaction_id") REFERENCES "public"."interactions"("id") ON DELETE no action ON UPDATE no action;