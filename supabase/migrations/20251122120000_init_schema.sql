-- Initial schema for profiles, circles, and related tables
begin;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  interests text[] default '{}',
  credibility_score numeric default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (name in ('inner', 'outer')),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists public.circle_members (
  circle_id uuid not null references public.circles (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (circle_id, friend_id)
);

create table if not exists public.friends (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_circles_owner on public.circles (owner_id);
create index if not exists idx_circle_members_circle on public.circle_members (circle_id);
create index if not exists idx_friends_user on public.friends (user_id);

alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.friends enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "circles_owner_select" on public.circles;
create policy "circles_owner_select" on public.circles
  for select using (auth.uid() = owner_id);
drop policy if exists "circles_owner_all" on public.circles;
create policy "circles_owner_all" on public.circles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "circle_members_owner_manage" on public.circle_members;
create policy "circle_members_owner_manage" on public.circle_members
  for all using (
    exists (
      select 1 from public.circles c
      where c.id = circle_members.circle_id and c.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.circles c
      where c.id = circle_members.circle_id and c.owner_id = auth.uid()
    )
  );
drop policy if exists "circle_members_member_view" on public.circle_members;
create policy "circle_members_member_view" on public.circle_members
  for select using (friend_id = auth.uid());

drop policy if exists "friends_owner_all" on public.friends;
create policy "friends_owner_all" on public.friends
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

commit;

