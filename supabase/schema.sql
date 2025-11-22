-- Supabase schema for crcl. auth + circles (email-based signup/login)
-- Run with `supabase db push` or psql in your project. RLS is enabled by default.

-- extensions
create extension if not exists "uuid-ossp";

-- profiles: 1-1 with auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  interests text[] default '{}',
  credibility_score numeric default 0,
  created_at timestamptz not null default now()
);

-- circles: inner/outer per user
create table if not exists public.circles (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (name in ('inner', 'outer')),
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

-- circle memberships
create table if not exists public.circle_members (
  circle_id uuid not null references public.circles (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (circle_id, friend_id)
);

-- friendships (simple accepted list)
create table if not exists public.friends (
  user_id uuid not null references auth.users (id) on delete cascade,
  friend_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);

-- questions
create table if not exists public.questions (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  visibility text not null check (visibility in ('inner', 'outer')),
  created_at timestamptz not null default now()
);

-- indexes for performance
create index if not exists idx_profiles_email on public.profiles (email);
create index if not exists idx_circles_owner on public.circles (owner_id);
create index if not exists idx_circle_members_circle on public.circle_members (circle_id);
create index if not exists idx_friends_user on public.friends (user_id);
create index if not exists idx_questions_author on public.questions (author_id);
create index if not exists idx_questions_visibility_created on public.questions (visibility, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.circles enable row level security;
alter table public.circle_members enable row level security;
alter table public.friends enable row level security;
alter table public.questions enable row level security;

-- profiles: users can read/update their own profile
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- circles: owners manage their circles
create policy "circles_owner_select" on public.circles
  for select using (auth.uid() = owner_id);
create policy "circles_owner_all" on public.circles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- circle_members: owners manage membership; members can read their inclusion
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
create policy "circle_members_member_view" on public.circle_members
  for select using (friend_id = auth.uid());

-- friends: user can see/manage their own friend rows
create policy "friends_owner_all" on public.friends
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- questions: authors manage their own
create policy "questions_owner_all" on public.questions
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

-- helper default circles (optional) - call from server after signup
-- insert into public.circles (owner_id, name) values (auth.uid(), 'inner'), (auth.uid(), 'outer');
