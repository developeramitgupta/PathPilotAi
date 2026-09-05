CREATE SCHEMA IF NOT EXISTS "public";--> statement-breakpoint
CREATE SCHEMA IF NOT EXISTS "extensions";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";--> statement-breakpoint
SET search_path TO public, extensions;--> statement-breakpoint
CREATE TYPE "public"."DecisionAction" AS ENUM('accepted', 'rejected', 'snoozed');--> statement-breakpoint
CREATE TYPE "public"."DecisionTargetType" AS ENUM('career', 'college', 'exam', 'degree', 'opportunity', 'project');--> statement-breakpoint
CREATE TYPE "public"."DemandTrend" AS ENUM('growing', 'stable', 'declining');--> statement-breakpoint
CREATE TYPE "public"."MissionLevel" AS ENUM('explorer', 'builder', 'achiever', 'pro');--> statement-breakpoint
CREATE TYPE "public"."ObserverRole" AS ENUM('parent', 'counselor');--> statement-breakpoint
CREATE TYPE "public"."ProjectStatus" AS ENUM('suggested', 'in_progress', 'shipped');--> statement-breakpoint
CREATE TYPE "public"."RoadmapMilestoneStatus" AS ENUM('upcoming', 'active', 'done');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('student', 'parent', 'counselor', 'admin');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_key" text NOT NULL,
	"unlocked_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_health_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"score" integer NOT NULL,
	"breakdown" jsonb NOT NULL,
	"weekly_delta" integer DEFAULT 0 NOT NULL,
	"last_computed" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"career_key" text NOT NULL,
	"career_name" text NOT NULL,
	"compatibility" integer NOT NULL,
	"why" text NOT NULL,
	"reasoning_refs" text[],
	"salary_band_entry" text NOT NULL,
	"salary_band_mid" text,
	"salary_band_senior" text,
	"demand_trend" "DemandTrend" NOT NULL,
	"generated_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_simulations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_role" text NOT NULL,
	"target_company" text,
	"timeline" jsonb NOT NULL,
	"skill_gaps" jsonb NOT NULL,
	"salary_band" text NOT NULL,
	"success_band" text NOT NULL,
	"scoring_factors" jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "college_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"college_id" text NOT NULL,
	"compatibility" integer NOT NULL,
	"why" text NOT NULL,
	"reasoning_refs" text[],
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "colleges" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"type" text NOT NULL,
	"annual_cost_inr" integer NOT NULL,
	"branches" text[],
	"hostel_available" boolean DEFAULT false NOT NULL,
	"culture_tags" text[],
	"placement_band_label" text,
	"is_mock_data" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_type" "DecisionTargetType" NOT NULL,
	"target_id" text NOT NULL,
	"action" "DecisionAction" NOT NULL,
	"reason" text,
	"snoozed_until" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "degree_options" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"duration_months" integer NOT NULL,
	"average_cost_inr" integer NOT NULL,
	"flexibility_score" integer NOT NULL,
	"outcomes" text[],
	"is_mock_data" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"difficulty" integer NOT NULL,
	"eligibility" text NOT NULL,
	"accepted_career_keys" text[],
	"accepted_college_count" integer NOT NULL,
	"mock_dates" jsonb NOT NULL,
	"tips" text[],
	"is_mock_data" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "github_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"score" integer NOT NULL,
	"languages" jsonb NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"score" integer NOT NULL,
	"strengths" text[],
	"improvements" text[]
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"persona" text NOT NULL,
	"difficulty" text NOT NULL,
	"transcript" jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mission_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"mission_id" text NOT NULL,
	"title" text NOT NULL,
	"weight" integer NOT NULL,
	"status" "RoadmapMilestoneStatus" DEFAULT 'upcoming' NOT NULL,
	"completed_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"goal" text NOT NULL,
	"level" "MissionLevel" NOT NULL,
	"progress_pct" integer NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"org" text NOT NULL,
	"location" text NOT NULL,
	"description" text,
	"tags" text[],
	"is_mock_data" boolean DEFAULT true NOT NULL,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "opportunity_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"why" text NOT NULL,
	"reasoning_refs" text[]
);
--> statement-breakpoint
CREATE TABLE "progress_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" text NOT NULL,
	"tech_stack" text[],
	"status" "ProjectStatus" DEFAULT 'suggested' NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"shipped_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"free" boolean NOT NULL,
	"skill_tag" text NOT NULL,
	"style_tags" text[],
	"est_minutes" integer,
	"embedding" vector(1536)
);
--> statement-breakpoint
CREATE TABLE "resume_analyses" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"score" integer NOT NULL,
	"formatting_score" integer NOT NULL,
	"keyword_score" integer NOT NULL,
	"grammar_score" integer NOT NULL,
	"impact_score" integer NOT NULL,
	"missing_skills" text[],
	"top_fixes" text[]
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmap_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"roadmap_version_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"phase" text NOT NULL,
	"status" "RoadmapMilestoneStatus" DEFAULT 'upcoming' NOT NULL,
	"est_weeks" integer NOT NULL,
	"order_index" integer NOT NULL,
	"completed_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "roadmap_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"roadmap_id" text NOT NULL,
	"version" integer NOT NULL,
	"changelog" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roadmaps" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"career_key" text NOT NULL,
	"career_name" text NOT NULL,
	"active_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared_access" (
	"id" text PRIMARY KEY NOT NULL,
	"owner_user_id" text NOT NULL,
	"role" "ObserverRole" NOT NULL,
	"invite_code" text NOT NULL,
	"grantee_user_id" text,
	"expires_at" timestamp (3),
	"revoked_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"interests" text[],
	"favorite_subjects" text[],
	"work_style" jsonb NOT NULL,
	"hobbies" text[],
	"salary_expectation" text NOT NULL,
	"location_pref" text NOT NULL,
	"study_pref" text NOT NULL,
	"higher_studies_lean" integer NOT NULL,
	"strengths" text[],
	"weaknesses" text[],
	"current_stage" text,
	"onboarding_done" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"role" "UserRole" DEFAULT 'student' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"city" text,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_health_scores" ADD CONSTRAINT "career_health_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_matches" ADD CONSTRAINT "career_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "career_simulations" ADD CONSTRAINT "career_simulations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "college_matches" ADD CONSTRAINT "college_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "college_matches" ADD CONSTRAINT "college_matches_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "github_analyses" ADD CONSTRAINT "github_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "interview_feedback" ADD CONSTRAINT "interview_feedback_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mission_milestones" ADD CONSTRAINT "mission_milestones_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "missions" ADD CONSTRAINT "missions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "opportunity_matches" ADD CONSTRAINT "opportunity_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "opportunity_matches" ADD CONSTRAINT "opportunity_matches_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "progress_snapshots" ADD CONSTRAINT "progress_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "resume_analyses" ADD CONSTRAINT "resume_analyses_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "roadmap_milestones" ADD CONSTRAINT "roadmap_milestones_roadmap_version_id_roadmap_versions_id_fk" FOREIGN KEY ("roadmap_version_id") REFERENCES "public"."roadmap_versions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "roadmap_versions" ADD CONSTRAINT "roadmap_versions_roadmap_id_roadmaps_id_fk" FOREIGN KEY ("roadmap_id") REFERENCES "public"."roadmaps"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_access" ADD CONSTRAINT "shared_access_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shared_access" ADD CONSTRAINT "shared_access_grantee_user_id_users_id_fk" FOREIGN KEY ("grantee_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "achievements_user_id_badge_key_key" ON "achievements" USING btree ("user_id","badge_key");--> statement-breakpoint
CREATE UNIQUE INDEX "career_health_scores_user_id_key" ON "career_health_scores" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_matches_user_id_compatibility_idx" ON "career_matches" USING btree ("user_id","compatibility");--> statement-breakpoint
CREATE INDEX "career_simulations_user_id_created_at_idx" ON "career_simulations" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "college_matches_user_id_compatibility_idx" ON "college_matches" USING btree ("user_id","compatibility");--> statement-breakpoint
CREATE UNIQUE INDEX "college_matches_user_id_college_id_key" ON "college_matches" USING btree ("user_id","college_id");--> statement-breakpoint
CREATE INDEX "colleges_state_city_idx" ON "colleges" USING btree ("state","city");--> statement-breakpoint
CREATE INDEX "decisions_user_id_created_at_idx" ON "decisions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "decisions_user_id_target_type_target_id_idx" ON "decisions" USING btree ("user_id","target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "degree_options_key_key" ON "degree_options" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "exams_name_key" ON "exams" USING btree ("name");--> statement-breakpoint
CREATE INDEX "github_analyses_user_id_created_at_idx" ON "github_analyses" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "interview_feedback_session_id_key" ON "interview_feedback" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "interview_sessions_user_id_created_at_idx" ON "interview_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "mission_milestones_mission_id_status_idx" ON "mission_milestones" USING btree ("mission_id","status");--> statement-breakpoint
CREATE INDEX "missions_user_id_updated_at_idx" ON "missions" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_read_created_at_idx" ON "notifications" USING btree ("user_id","read","created_at");--> statement-breakpoint
CREATE INDEX "opportunities_type_location_idx" ON "opportunities" USING btree ("type","location");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunity_matches_user_id_opportunity_id_key" ON "opportunity_matches" USING btree ("user_id","opportunity_id");--> statement-breakpoint
CREATE INDEX "progress_snapshots_user_id_created_at_idx" ON "progress_snapshots" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_user_id_status_idx" ON "projects" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "resources_skill_tag_idx" ON "resources" USING btree ("skill_tag");--> statement-breakpoint
CREATE UNIQUE INDEX "resume_analyses_resume_id_key" ON "resume_analyses" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resumes_user_id_created_at_idx" ON "resumes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "roadmap_milestones_roadmap_version_id_order_index_key" ON "roadmap_milestones" USING btree ("roadmap_version_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "roadmap_versions_roadmap_id_version_key" ON "roadmap_versions" USING btree ("roadmap_id","version");--> statement-breakpoint
CREATE INDEX "roadmaps_user_id_updated_at_idx" ON "roadmaps" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "shared_access_invite_code_key" ON "shared_access" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "shared_access_owner_user_id_revoked_at_idx" ON "shared_access" USING btree ("owner_user_id","revoked_at");--> statement-breakpoint
CREATE INDEX "shared_access_grantee_user_id_revoked_at_idx" ON "shared_access" USING btree ("grantee_user_id","revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "student_profiles_user_id_key" ON "student_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email");
