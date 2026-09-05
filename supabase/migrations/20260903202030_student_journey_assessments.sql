-- Versioned student-journey assessments. The application writes through its
-- server-side Drizzle connection; direct Data API access remains owner-only.
alter table if exists public.student_profiles
  add column if not exists student_journey text not null default 'education-planner',
  add column if not exists assessment_version integer not null default 1,
  add column if not exists stage_changed_at timestamp(3);

create table if not exists public.student_journey_assessments (
  id text primary key not null,
  user_id text not null references public.users(id) on delete cascade on update cascade,
  student_journey text not null,
  assessment_version integer not null,
  responses jsonb not null,
  result jsonb,
  completed_at timestamp(3) not null default now()
);

create index if not exists student_journey_assessments_user_journey_completed_idx
  on public.student_journey_assessments(user_id, student_journey, completed_at);

alter table public.student_journey_assessments enable row level security;
grant select, insert on public.student_journey_assessments to authenticated;

create policy "student_journey_assessments_select_own"
on public.student_journey_assessments for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "student_journey_assessments_insert_own"
on public.student_journey_assessments for insert to authenticated
with check ((select auth.jwt() ->> 'sub') = user_id);
