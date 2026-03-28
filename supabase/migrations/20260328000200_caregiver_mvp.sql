create extension if not exists pgcrypto;

create table if not exists public.residents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bed_no text not null,
  care_level text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.care_notes (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(id) on delete cascade,
  author_id uuid not null,
  content_raw text not null,
  content_structured jsonb null,
  created_at timestamptz not null default now()
);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents(id) on delete cascade,
  reporter_id uuid not null,
  type text not null,
  status text not null default 'open',
  description text null,
  created_at timestamptz not null default now()
);

create table if not exists public.handoffs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  shift_date date not null,
  shift_type text not null,
  summary text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  assignee_id uuid not null,
  title text not null,
  due_at timestamptz null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists idx_care_notes_resident_created_at
  on public.care_notes(resident_id, created_at desc);

create index if not exists idx_incidents_status_created_at
  on public.incidents(status, created_at desc);

create index if not exists idx_handoffs_shift_date_type
  on public.handoffs(shift_date desc, shift_type);

alter table public.residents enable row level security;
alter table public.care_notes enable row level security;
alter table public.incidents enable row level security;
alter table public.handoffs enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "residents_select_authenticated" on public.residents;
create policy "residents_select_authenticated"
  on public.residents
  for select
  to authenticated
  using (true);

drop policy if exists "care_notes_select_authenticated" on public.care_notes;
create policy "care_notes_select_authenticated"
  on public.care_notes
  for select
  to authenticated
  using (true);

drop policy if exists "care_notes_insert_authenticated" on public.care_notes;
create policy "care_notes_insert_authenticated"
  on public.care_notes
  for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "incidents_select_authenticated" on public.incidents;
create policy "incidents_select_authenticated"
  on public.incidents
  for select
  to authenticated
  using (true);

drop policy if exists "incidents_insert_authenticated" on public.incidents;
create policy "incidents_insert_authenticated"
  on public.incidents
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists "incidents_update_authenticated" on public.incidents;
create policy "incidents_update_authenticated"
  on public.incidents
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "handoffs_select_authenticated" on public.handoffs;
create policy "handoffs_select_authenticated"
  on public.handoffs
  for select
  to authenticated
  using (true);

drop policy if exists "handoffs_insert_authenticated" on public.handoffs;
create policy "handoffs_insert_authenticated"
  on public.handoffs
  for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "tasks_select_authenticated" on public.tasks;
create policy "tasks_select_authenticated"
  on public.tasks
  for select
  to authenticated
  using (assignee_id = auth.uid());

drop policy if exists "tasks_insert_authenticated" on public.tasks;
create policy "tasks_insert_authenticated"
  on public.tasks
  for insert
  to authenticated
  with check (assignee_id = auth.uid());

drop policy if exists "tasks_update_authenticated" on public.tasks;
create policy "tasks_update_authenticated"
  on public.tasks
  for update
  to authenticated
  using (assignee_id = auth.uid())
  with check (assignee_id = auth.uid());

