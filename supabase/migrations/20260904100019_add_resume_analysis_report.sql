-- Keep the complete validated report so students can revisit recommendations
-- without re-uploading or re-running an AI request.
alter table public.resume_analyses
add column if not exists analysis_report jsonb;
