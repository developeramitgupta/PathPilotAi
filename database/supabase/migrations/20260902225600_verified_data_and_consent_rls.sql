-- PathPilot production foundation: provenance, approval gates and minor consent.
-- Apply after Drizzle migration 20260902225505_faulty_luke_cage.sql.
-- This uses Clerk's JWT `sub` claim; it deliberately does not rely on auth.uid().

create or replace function public.is_pathpilot_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.jwt() ->> 'sub')
      and role = 'admin'
  );
$$;

alter table public.data_sources enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.source_records enable row level security;
alter table public.parental_consents enable row level security;
alter table public.admin_audit_events enable row level security;
alter table public.academic_programmes enable row level security;
alter table public.institution_rankings enable row level security;
alter table public.exam_events enable row level security;
alter table public.cutoff_records enable row level security;
alter table public.scholarships enable row level security;

grant select on public.data_sources, public.ingestion_runs, public.source_records,
  public.admin_audit_events
to authenticated;
grant insert, update, delete on public.data_sources, public.ingestion_runs,
  public.source_records, public.admin_audit_events
to authenticated;

create policy "admin_manage_data_sources"
on public.data_sources for all to authenticated
using ((select public.is_pathpilot_admin()))
with check ((select public.is_pathpilot_admin()));

create policy "admin_manage_ingestion_runs"
on public.ingestion_runs for all to authenticated
using ((select public.is_pathpilot_admin()))
with check ((select public.is_pathpilot_admin()));

create policy "admin_manage_source_records"
on public.source_records for all to authenticated
using ((select public.is_pathpilot_admin()))
with check ((select public.is_pathpilot_admin()));

create policy "admin_read_audit_events"
on public.admin_audit_events for select to authenticated
using ((select public.is_pathpilot_admin()));

create policy "admin_write_audit_events"
on public.admin_audit_events for insert to authenticated
with check ((select public.is_pathpilot_admin()));

-- A student can submit a consent request and can see only their own request.
grant select, insert, update on public.parental_consents to authenticated;
create policy "parental_consents_select_student"
on public.parental_consents for select to authenticated
using (student_user_id = (select auth.jwt() ->> 'sub'));
create policy "parental_consents_insert_student"
on public.parental_consents for insert to authenticated
with check (student_user_id = (select auth.jwt() ->> 'sub'));
create policy "parental_consents_update_student"
on public.parental_consents for update to authenticated
using (student_user_id = (select auth.jwt() ->> 'sub'))
with check (student_user_id = (select auth.jwt() ->> 'sub'));

-- Never expose staging or withdrawn data. The old broad public policies are replaced.
drop policy if exists "colleges_public_read" on public.colleges;
drop policy if exists "exams_public_read" on public.exams;
drop policy if exists "degree_options_public_read" on public.degree_options;
drop policy if exists "resources_public_read" on public.resources;
drop policy if exists "opportunities_public_read" on public.opportunities;

create policy "colleges_verified_public_read"
on public.colleges for select to anon, authenticated
using (review_status = 'published');
create policy "exams_verified_public_read"
on public.exams for select to anon, authenticated
using (review_status = 'published');
create policy "degree_options_verified_public_read"
on public.degree_options for select to anon, authenticated
using (review_status = 'published');
create policy "resources_verified_public_read"
on public.resources for select to anon, authenticated
using (review_status = 'published');
create policy "opportunities_verified_public_read"
on public.opportunities for select to anon, authenticated
using (review_status = 'published');

grant select on public.academic_programmes, public.institution_rankings,
  public.exam_events, public.cutoff_records, public.scholarships
to anon, authenticated;
create policy "academic_programmes_verified_public_read"
on public.academic_programmes for select to anon, authenticated
using (review_status = 'published');
create policy "institution_rankings_verified_public_read"
on public.institution_rankings for select to anon, authenticated
using (review_status = 'published');
create policy "exam_events_verified_public_read"
on public.exam_events for select to anon, authenticated
using (review_status = 'published');
create policy "cutoff_records_verified_public_read"
on public.cutoff_records for select to anon, authenticated
using (review_status = 'published');
create policy "scholarships_verified_public_read"
on public.scholarships for select to anon, authenticated
using (review_status = 'published');

-- Admins are the only browser-side writers for public records. Server-side Drizzle
-- migrations/imports use the direct database connection and retain the same review gate.
grant insert, update, delete on public.colleges, public.exams, public.degree_options,
  public.resources, public.opportunities, public.academic_programmes,
  public.institution_rankings, public.exam_events, public.cutoff_records,
  public.scholarships
to authenticated;

create policy "admins_manage_colleges" on public.colleges for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_exams" on public.exams for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_degrees" on public.degree_options for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_resources" on public.resources for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_opportunities" on public.opportunities for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_programmes" on public.academic_programmes for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_rankings" on public.institution_rankings for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_exam_events" on public.exam_events for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_cutoffs" on public.cutoff_records for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
create policy "admins_manage_scholarships" on public.scholarships for all to authenticated
using ((select public.is_pathpilot_admin())) with check ((select public.is_pathpilot_admin()));
