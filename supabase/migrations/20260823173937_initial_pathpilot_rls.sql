-- PathPilot AI RLS baseline.
-- Apply after the Drizzle schema migration has created the tables.
-- Clerk user IDs are text. Never replace these checks with auth.uid().

alter table if exists public.users enable row level security;
alter table if exists public.student_profiles enable row level security;
alter table if exists public.decisions enable row level security;
alter table if exists public.career_matches enable row level security;
alter table if exists public.college_matches enable row level security;
alter table if exists public.roadmaps enable row level security;
alter table if exists public.roadmap_versions enable row level security;
alter table if exists public.roadmap_milestones enable row level security;
alter table if exists public.projects enable row level security;
alter table if exists public.resumes enable row level security;
alter table if exists public.resume_analyses enable row level security;
alter table if exists public.github_analyses enable row level security;
alter table if exists public.opportunity_matches enable row level security;
alter table if exists public.interview_sessions enable row level security;
alter table if exists public.interview_feedback enable row level security;
alter table if exists public.career_simulations enable row level security;
alter table if exists public.career_health_scores enable row level security;
alter table if exists public.progress_snapshots enable row level security;
alter table if exists public.missions enable row level security;
alter table if exists public.mission_milestones enable row level security;
alter table if exists public.achievements enable row level security;
alter table if exists public.shared_access enable row level security;
alter table if exists public.notifications enable row level security;

-- Current Supabase projects can require explicit Data API exposure.
-- Students may mutate only their profile, decision memory, and sharing grants directly.
grant select on public.users, public.student_profiles, public.decisions,
  public.career_matches, public.college_matches, public.roadmaps,
  public.roadmap_versions, public.roadmap_milestones, public.projects,
  public.resumes, public.resume_analyses, public.github_analyses,
  public.opportunity_matches, public.interview_sessions, public.interview_feedback,
  public.career_simulations, public.career_health_scores, public.progress_snapshots,
  public.missions, public.mission_milestones, public.achievements,
  public.shared_access, public.notifications
to authenticated;

grant insert, update on public.student_profiles to authenticated;
grant insert on public.decisions to authenticated;
grant insert, update, delete on public.shared_access to authenticated;

create policy "users_select_own"
on public.users for select to authenticated
using ((select auth.jwt() ->> 'sub') = id);

create policy "profiles_select_own"
on public.student_profiles for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "profiles_insert_own"
on public.student_profiles for insert to authenticated
with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "profiles_update_own"
on public.student_profiles for update to authenticated
using ((select auth.jwt() ->> 'sub') = user_id)
with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "decisions_select_own"
on public.decisions for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "decisions_insert_own"
on public.decisions for insert to authenticated
with check ((select auth.jwt() ->> 'sub') = user_id);

create policy "career_matches_select_own"
on public.career_matches for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "college_matches_select_own"
on public.college_matches for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "roadmaps_select_own"
on public.roadmaps for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "roadmap_versions_select_own"
on public.roadmap_versions for select to authenticated
using (
  exists (
    select 1 from public.roadmaps
    where roadmaps.id = roadmap_versions.roadmap_id
      and roadmaps.user_id = (select auth.jwt() ->> 'sub')
  )
);

create policy "roadmap_milestones_select_own"
on public.roadmap_milestones for select to authenticated
using (
  exists (
    select 1 from public.roadmap_versions
    join public.roadmaps on roadmaps.id = roadmap_versions.roadmap_id
    where roadmap_versions.id = roadmap_milestones.roadmap_version_id
      and roadmaps.user_id = (select auth.jwt() ->> 'sub')
  )
);

create policy "projects_select_own"
on public.projects for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "resumes_select_own"
on public.resumes for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "resume_analyses_select_own"
on public.resume_analyses for select to authenticated
using (
  exists (
    select 1 from public.resumes
    where resumes.id = resume_analyses.resume_id
      and resumes.user_id = (select auth.jwt() ->> 'sub')
  )
);

create policy "github_analyses_select_own"
on public.github_analyses for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "opportunity_matches_select_own"
on public.opportunity_matches for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "interview_sessions_select_own"
on public.interview_sessions for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "interview_feedback_select_own"
on public.interview_feedback for select to authenticated
using (
  exists (
    select 1 from public.interview_sessions
    where interview_sessions.id = interview_feedback.session_id
      and interview_sessions.user_id = (select auth.jwt() ->> 'sub')
  )
);

create policy "career_simulations_select_own"
on public.career_simulations for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "health_scores_select_owner_or_observer"
on public.career_health_scores for select to authenticated
using (
  user_id = (select auth.jwt() ->> 'sub')
  or exists (
    select 1 from public.shared_access
    where shared_access.owner_user_id = career_health_scores.user_id
      and shared_access.grantee_user_id = (select auth.jwt() ->> 'sub')
      and shared_access.revoked_at is null
      and (shared_access.expires_at is null or shared_access.expires_at > now())
  )
);

create policy "progress_snapshots_select_own"
on public.progress_snapshots for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "missions_select_own"
on public.missions for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "mission_milestones_select_own"
on public.mission_milestones for select to authenticated
using (
  exists (
    select 1 from public.missions
    where missions.id = mission_milestones.mission_id
      and missions.user_id = (select auth.jwt() ->> 'sub')
  )
);

create policy "achievements_select_own"
on public.achievements for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

create policy "sharing_select_owner_or_grantee"
on public.shared_access for select to authenticated
using (
  owner_user_id = (select auth.jwt() ->> 'sub')
  or grantee_user_id = (select auth.jwt() ->> 'sub')
);

create policy "sharing_insert_owner"
on public.shared_access for insert to authenticated
with check (owner_user_id = (select auth.jwt() ->> 'sub'));

create policy "sharing_update_owner"
on public.shared_access for update to authenticated
using (owner_user_id = (select auth.jwt() ->> 'sub'))
with check (owner_user_id = (select auth.jwt() ->> 'sub'));

create policy "sharing_delete_owner"
on public.shared_access for delete to authenticated
using (owner_user_id = (select auth.jwt() ->> 'sub'));

create policy "notifications_select_own"
on public.notifications for select to authenticated
using ((select auth.jwt() ->> 'sub') = user_id);

-- Reference tables use RLS too. Public access is explicitly read-only.
alter table if exists public.colleges enable row level security;
alter table if exists public.exams enable row level security;
alter table if exists public.degree_options enable row level security;
alter table if exists public.resources enable row level security;
alter table if exists public.opportunities enable row level security;

grant select on public.colleges, public.exams, public.degree_options,
  public.resources, public.opportunities
to anon, authenticated;

create policy "colleges_public_read" on public.colleges for select to anon, authenticated using (true);
create policy "exams_public_read" on public.exams for select to anon, authenticated using (true);
create policy "degree_options_public_read" on public.degree_options for select to anon, authenticated using (true);
create policy "resources_public_read" on public.resources for select to anon, authenticated using (true);
create policy "opportunities_public_read" on public.opportunities for select to anon, authenticated using (true);
