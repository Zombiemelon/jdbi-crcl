begin;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  visibility text not null check (visibility in ('inner', 'outer')),
  created_at timestamptz not null default now()
);

create index if not exists idx_questions_author on public.questions (author_id);
create index if not exists idx_questions_visibility_created on public.questions (visibility, created_at desc);

alter table public.questions enable row level security;

drop policy if exists "questions_owner_all" on public.questions;
create policy "questions_owner_all" on public.questions
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

commit;

