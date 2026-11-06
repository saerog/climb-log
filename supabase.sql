-- Run in Supabase SQL Editor. Each user can only read/write their own journal.
create table if not exists public.journals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"checks":{},"entries":[]}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.journals enable row level security;
create policy "Users read own journal" on public.journals for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own journal" on public.journals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own journal" on public.journals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
