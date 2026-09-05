CREATE TYPE "public"."ConsentStatus" AS ENUM('pending', 'granted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."IngestionRunStatus" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."RecordReviewStatus" AS ENUM('draft', 'pending_review', 'published', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."SourceKind" AS ENUM('data_gov', 'ugc', 'nirf', 'josaa', 'nta', 'github', 'official_website', 'admin_upload');--> statement-breakpoint
CREATE TYPE "public"."StudentAgeBand" AS ENUM('under_13', 'minor', 'adult');--> statement-breakpoint
CREATE TABLE "academic_programmes" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"name" text NOT NULL,
	"field" text NOT NULL,
	"degree" text NOT NULL,
	"duration_months" integer,
	"annual_cost_inr" integer,
	"source_record_id" text,
	"source_url" text NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"last_verified_at" timestamp (3),
	"effective_from" timestamp (3),
	"effective_to" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "admin_audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"actor_user_id" text,
	"action" text NOT NULL,
	"subject_type" text NOT NULL,
	"subject_id" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cutoff_records" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"programme_id" text,
	"exam_key" text NOT NULL,
	"counselling_body" text NOT NULL,
	"cycle_year" integer NOT NULL,
	"round" text NOT NULL,
	"category" text NOT NULL,
	"quota" text,
	"opening_rank" integer,
	"closing_rank" integer NOT NULL,
	"source_record_id" text,
	"source_url" text NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"last_verified_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"kind" "SourceKind" NOT NULL,
	"website_url" text NOT NULL,
	"api_base_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_events" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"cycle_year" integer NOT NULL,
	"application_open_at" timestamp (3),
	"application_close_at" timestamp (3),
	"exam_at" timestamp (3),
	"result_at" timestamp (3),
	"source_record_id" text,
	"source_url" text NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"last_verified_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "ingestion_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"requested_by_user_id" text,
	"status" "IngestionRunStatus" DEFAULT 'queued' NOT NULL,
	"summary" jsonb,
	"error_message" text,
	"started_at" timestamp (3),
	"completed_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institution_rankings" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"framework" text NOT NULL,
	"category" text NOT NULL,
	"ranking_year" integer NOT NULL,
	"rank" integer NOT NULL,
	"score" text,
	"source_record_id" text,
	"source_url" text NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"last_verified_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "parental_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"student_user_id" text NOT NULL,
	"parent_email" text NOT NULL,
	"consent_token_hash" text NOT NULL,
	"status" "ConsentStatus" DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp (3) DEFAULT now() NOT NULL,
	"granted_at" timestamp (3),
	"revoked_at" timestamp (3),
	"expires_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"provider" text NOT NULL,
	"eligibility" text NOT NULL,
	"amount_label" text,
	"deadline_at" timestamp (3),
	"source_record_id" text,
	"source_url" text NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"last_verified_at" timestamp (3),
	"effective_from" timestamp (3),
	"effective_to" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE "source_records" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"ingestion_run_id" text,
	"external_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"source_url" text NOT NULL,
	"payload" jsonb NOT NULL,
	"payload_hash" text NOT NULL,
	"effective_from" timestamp (3),
	"effective_to" timestamp (3),
	"retrieved_at" timestamp (3) NOT NULL,
	"review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL,
	"reviewed_by_user_id" text,
	"reviewed_at" timestamp (3),
	"published_at" timestamp (3),
	"created_at" timestamp (3) DEFAULT now() NOT NULL,
	"updated_at" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "source_record_id" text;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "last_verified_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "effective_from" timestamp (3);--> statement-breakpoint
ALTER TABLE "colleges" ADD COLUMN "effective_to" timestamp (3);--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "source_record_id" text;--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "last_verified_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "effective_from" timestamp (3);--> statement-breakpoint
ALTER TABLE "degree_options" ADD COLUMN "effective_to" timestamp (3);--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "source_record_id" text;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "last_verified_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "effective_from" timestamp (3);--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "effective_to" timestamp (3);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "source_record_id" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "source_url" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "application_url" text;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "deadline_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "last_verified_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "effective_from" timestamp (3);--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "effective_to" timestamp (3);--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "source_record_id" text;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "review_status" "RecordReviewStatus" DEFAULT 'pending_review' NOT NULL;--> statement-breakpoint
ALTER TABLE "resources" ADD COLUMN "last_verified_at" timestamp (3);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "age_band" "StudentAgeBand" DEFAULT 'adult' NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "preferred_locale" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "academic_programmes" ADD CONSTRAINT "academic_programmes_institution_id_colleges_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "academic_programmes" ADD CONSTRAINT "academic_programmes_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cutoff_records" ADD CONSTRAINT "cutoff_records_institution_id_colleges_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cutoff_records" ADD CONSTRAINT "cutoff_records_programme_id_academic_programmes_id_fk" FOREIGN KEY ("programme_id") REFERENCES "public"."academic_programmes"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "cutoff_records" ADD CONSTRAINT "cutoff_records_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exam_events" ADD CONSTRAINT "exam_events_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ingestion_runs" ADD CONSTRAINT "ingestion_runs_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "institution_rankings" ADD CONSTRAINT "institution_rankings_institution_id_colleges_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."colleges"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "institution_rankings" ADD CONSTRAINT "institution_rankings_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "parental_consents" ADD CONSTRAINT "parental_consents_student_user_id_users_id_fk" FOREIGN KEY ("student_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_ingestion_run_id_ingestion_runs_id_fk" FOREIGN KEY ("ingestion_run_id") REFERENCES "public"."ingestion_runs"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "academic_programmes_institution_review_idx" ON "academic_programmes" USING btree ("institution_id","review_status");--> statement-breakpoint
CREATE INDEX "admin_audit_events_subject_created_at_idx" ON "admin_audit_events" USING btree ("subject_type","subject_id","created_at");--> statement-breakpoint
CREATE INDEX "cutoff_records_institution_cycle_idx" ON "cutoff_records" USING btree ("institution_id","cycle_year");--> statement-breakpoint
CREATE INDEX "cutoff_records_review_exam_cycle_idx" ON "cutoff_records" USING btree ("review_status","exam_key","cycle_year");--> statement-breakpoint
CREATE UNIQUE INDEX "data_sources_key_key" ON "data_sources" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "exam_events_exam_id_cycle_year_key" ON "exam_events" USING btree ("exam_id","cycle_year");--> statement-breakpoint
CREATE INDEX "exam_events_review_cycle_idx" ON "exam_events" USING btree ("review_status","cycle_year");--> statement-breakpoint
CREATE INDEX "ingestion_runs_source_id_created_at_idx" ON "ingestion_runs" USING btree ("source_id","created_at");--> statement-breakpoint
CREATE INDEX "ingestion_runs_status_created_at_idx" ON "ingestion_runs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "institution_rankings_institution_year_idx" ON "institution_rankings" USING btree ("institution_id","ranking_year");--> statement-breakpoint
CREATE INDEX "institution_rankings_review_year_idx" ON "institution_rankings" USING btree ("review_status","ranking_year");--> statement-breakpoint
CREATE UNIQUE INDEX "parental_consents_token_key" ON "parental_consents" USING btree ("consent_token_hash");--> statement-breakpoint
CREATE INDEX "parental_consents_student_status_idx" ON "parental_consents" USING btree ("student_user_id","status");--> statement-breakpoint
CREATE INDEX "scholarships_review_deadline_idx" ON "scholarships" USING btree ("review_status","deadline_at");--> statement-breakpoint
CREATE UNIQUE INDEX "source_records_source_external_hash_key" ON "source_records" USING btree ("source_id","external_id","payload_hash");--> statement-breakpoint
CREATE INDEX "source_records_entity_review_retrieved_idx" ON "source_records" USING btree ("entity_type","review_status","retrieved_at");--> statement-breakpoint
ALTER TABLE "colleges" ADD CONSTRAINT "colleges_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "degree_options" ADD CONSTRAINT "degree_options_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_source_record_id_source_records_id_fk" FOREIGN KEY ("source_record_id") REFERENCES "public"."source_records"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "colleges_review_verified_idx" ON "colleges" USING btree ("review_status","last_verified_at");--> statement-breakpoint
CREATE INDEX "degree_options_review_verified_idx" ON "degree_options" USING btree ("review_status","last_verified_at");--> statement-breakpoint
CREATE INDEX "exams_review_verified_idx" ON "exams" USING btree ("review_status","last_verified_at");--> statement-breakpoint
CREATE INDEX "opportunities_review_deadline_idx" ON "opportunities" USING btree ("review_status","deadline_at");--> statement-breakpoint
CREATE INDEX "resources_review_verified_idx" ON "resources" USING btree ("review_status","last_verified_at");