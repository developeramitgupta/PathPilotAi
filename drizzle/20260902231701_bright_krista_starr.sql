CREATE TABLE "ai_traces" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"graph" text NOT NULL,
	"route" text NOT NULL,
	"prompt_version" text NOT NULL,
	"provider_model" text,
	"input_hash" text NOT NULL,
	"evidence_refs" text[],
	"confidence_band" text,
	"status" text NOT NULL,
	"failure_code" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_traces" ADD CONSTRAINT "ai_traces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "ai_traces_user_id_created_at_idx" ON "ai_traces" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_traces_route_created_at_idx" ON "ai_traces" USING btree ("route","created_at");