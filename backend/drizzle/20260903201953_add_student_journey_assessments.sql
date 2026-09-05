CREATE TABLE "student_journey_assessments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"student_journey" text NOT NULL,
	"assessment_version" integer NOT NULL,
	"responses" jsonb NOT NULL,
	"result" jsonb,
	"completed_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "student_journey" text DEFAULT 'education-planner' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "assessment_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "stage_changed_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "student_journey_assessments" ADD CONSTRAINT "student_journey_assessments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "student_journey_assessments_user_journey_completed_idx" ON "student_journey_assessments" USING btree ("user_id","student_journey","completed_at");