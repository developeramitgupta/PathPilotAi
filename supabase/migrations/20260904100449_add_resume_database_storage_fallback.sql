-- Storage remains preferred. This private, server-only fallback keeps resume
-- uploads usable while a deployment is missing its Supabase Storage secret.
alter table public.resumes
add column if not exists file_name text,
add column if not exists mime_type text,
add column if not exists file_bytes bytea;
