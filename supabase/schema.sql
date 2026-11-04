-- Run once in the Supabase SQL Editor. Enable Anonymous Sign-ins in Auth settings.
begin;
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  description text not null default '' check (char_length(description) <= 5000),
  status text not null default 'todo' check (status in ('todo','in_progress','in_review','done')),
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  due_date date,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index tasks_user_created_idx on public.tasks(user_id, created_at);
alter table public.tasks enable row level security;
revoke all on table public.tasks from anon;
grant select, insert, update, delete on public.tasks to authenticated;
create policy "Guests read their own tasks" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "Guests create their own tasks" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Guests update their own tasks" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Guests delete their own tasks" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);
commit;
