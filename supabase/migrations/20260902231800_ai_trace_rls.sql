-- AI observability is private to the student (and server-side administrators).
alter table public.ai_traces enable row level security;

grant select on public.ai_traces to authenticated;
create policy "ai_traces_select_own"
on public.ai_traces for select to authenticated
using (user_id = (select auth.jwt() ->> 'sub'));
