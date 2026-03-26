begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.raise_immutable_row()
returns trigger
language plpgsql
as $$
begin
  raise exception 'table "%" is append-only; % is not allowed', tg_table_name, tg_op
    using errcode = '0A000';
end;
$$;

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_sites_set_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

create index if not exists idx_sites_user_id on public.sites(user_id);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  site_id uuid not null references public.sites(id) on delete restrict,
  name text not null,
  external_ref text,
  serial_no text,
  device_type text,
  status text not null default 'active' check (status in ('active', 'inactive', 'retired')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, site_id, name)
);

create trigger trg_devices_set_updated_at
before update on public.devices
for each row execute function public.set_updated_at();

create index if not exists idx_devices_user_id on public.devices(user_id);
create index if not exists idx_devices_site_id on public.devices(site_id);

create table if not exists public.viewpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  viewpoint_key text not null,
  name text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id, viewpoint_key)
);

create trigger trg_viewpoints_set_updated_at
before update on public.viewpoints
for each row execute function public.set_updated_at();

create index if not exists idx_viewpoints_user_id on public.viewpoints(user_id);
create index if not exists idx_viewpoints_device_id on public.viewpoints(device_id);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  site_id uuid not null references public.sites(id) on delete restrict,
  title text,
  status text not null default 'uploaded_pending_detection' check (
    status in (
      'draft',
      'uploaded_pending_detection',
      'detected_pending_review',
      'reviewed',
      'workcard_generated',
      'closed'
    )
  ),
  occurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_inspections_set_updated_at
before update on public.inspections
for each row execute function public.set_updated_at();

create index if not exists idx_inspections_user_id on public.inspections(user_id);
create index if not exists idx_inspections_site_id on public.inspections(site_id);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  viewpoint_id uuid references public.viewpoints(id) on delete set null,
  modality text not null check (modality in ('visible', 'infrared', 'video')),
  object_key text not null,
  sha256 text not null,
  mime_type text,
  original_filename text,
  captured_at timestamptz,
  captured_by text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, object_key),
  unique (user_id, sha256, modality)
);

create trigger trg_media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

create index if not exists idx_media_assets_user_id on public.media_assets(user_id);
create index if not exists idx_media_assets_inspection_id on public.media_assets(inspection_id);
create index if not exists idx_media_assets_device_id on public.media_assets(device_id);
create index if not exists idx_media_assets_viewpoint_id on public.media_assets(viewpoint_id);

create table if not exists public.inference_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  job_type text not null check (job_type in ('defect_detection')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'canceled')),
  idempotency_key text,
  input_media_asset_ids uuid[] not null default '{}'::uuid[],
  model_key text not null default 'defect-detector',
  model_version text not null default 'v0',
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create trigger trg_inference_jobs_set_updated_at
before update on public.inference_jobs
for each row execute function public.set_updated_at();

create index if not exists idx_inference_jobs_user_id on public.inference_jobs(user_id);
create index if not exists idx_inference_jobs_inspection_id on public.inference_jobs(inspection_id);
create index if not exists idx_inference_jobs_status on public.inference_jobs(status);

create table if not exists public.defect_candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  inference_job_id uuid references public.inference_jobs(id) on delete set null,
  defect_type text not null,
  confidence numeric not null default 0,
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  evidence_asset_id uuid references public.media_assets(id) on delete set null,
  evidence_object_key text,
  input_media_sha256s text[] not null default '{}'::text[],
  model_key text,
  model_version text,
  change_detection_status text,
  change_detection_note text,
  status text not null default 'candidate' check (status in ('candidate', 'confirmed', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_defect_candidates_set_updated_at
before update on public.defect_candidates
for each row execute function public.set_updated_at();

create index if not exists idx_defect_candidates_user_id on public.defect_candidates(user_id);
create index if not exists idx_defect_candidates_inspection_id on public.defect_candidates(inspection_id);
create index if not exists idx_defect_candidates_status on public.defect_candidates(status);

create table if not exists public.risk_rulesets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  ruleset_key text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'pending', 'active', 'deprecated')),
  name text,
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ruleset_key, version)
);

create trigger trg_risk_rulesets_set_updated_at
before update on public.risk_rulesets
for each row execute function public.set_updated_at();

create index if not exists idx_risk_rulesets_user_id on public.risk_rulesets(user_id);
create index if not exists idx_risk_rulesets_status on public.risk_rulesets(status);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  defect_candidate_id uuid references public.defect_candidates(id) on delete set null,
  ruleset_key text not null,
  ruleset_version text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  rule_refs text[] not null default '{}'::text[],
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_risk_assessments_user_id on public.risk_assessments(user_id);
create index if not exists idx_risk_assessments_inspection_id on public.risk_assessments(inspection_id);

create table if not exists public.workcard_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  template_key text not null,
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'pending', 'active', 'deprecated')),
  name text not null,
  risk_levels text[] not null default '{}'::text[],
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, template_key, version)
);

create trigger trg_workcard_templates_set_updated_at
before update on public.workcard_templates
for each row execute function public.set_updated_at();

create index if not exists idx_workcard_templates_user_id on public.workcard_templates(user_id);
create index if not exists idx_workcard_templates_status on public.workcard_templates(status);

create table if not exists public.work_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  template_key text not null,
  template_version text not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'rejected', 'closed')),
  risk_level text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_work_cards_set_updated_at
before update on public.work_cards
for each row execute function public.set_updated_at();

create index if not exists idx_work_cards_user_id on public.work_cards(user_id);
create index if not exists idx_work_cards_inspection_id on public.work_cards(inspection_id);
create index if not exists idx_work_cards_status on public.work_cards(status);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  work_card_id uuid not null references public.work_cards(id) on delete cascade,
  step_no integer not null,
  approver_user_id uuid,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  comment text,
  acted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, work_card_id, step_no)
);

create index if not exists idx_approvals_user_id on public.approvals(user_id);
create index if not exists idx_approvals_work_card_id on public.approvals(work_card_id);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  actor_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create trigger trg_audit_logs_append_only
before update or delete on public.audit_logs
for each row execute function public.raise_immutable_row();

create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);
create index if not exists idx_audit_logs_actor_user_id on public.audit_logs(actor_user_id);

alter table public.sites enable row level security;
alter table public.devices enable row level security;
alter table public.viewpoints enable row level security;
alter table public.inspections enable row level security;
alter table public.media_assets enable row level security;
alter table public.inference_jobs enable row level security;
alter table public.defect_candidates enable row level security;
alter table public.risk_rulesets enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.workcard_templates enable row level security;
alter table public.work_cards enable row level security;
alter table public.approvals enable row level security;
alter table public.audit_logs enable row level security;

create policy sites_select_own on public.sites for select using (auth.uid() = user_id);
create policy sites_insert_own on public.sites for insert with check (auth.uid() = user_id);
create policy sites_update_own on public.sites for update using (auth.uid() = user_id);
create policy sites_delete_own on public.sites for delete using (auth.uid() = user_id);

create policy devices_select_own on public.devices for select using (auth.uid() = user_id);
create policy devices_insert_own on public.devices for insert with check (auth.uid() = user_id);
create policy devices_update_own on public.devices for update using (auth.uid() = user_id);
create policy devices_delete_own on public.devices for delete using (auth.uid() = user_id);

create policy viewpoints_select_own on public.viewpoints for select using (auth.uid() = user_id);
create policy viewpoints_insert_own on public.viewpoints for insert with check (auth.uid() = user_id);
create policy viewpoints_update_own on public.viewpoints for update using (auth.uid() = user_id);
create policy viewpoints_delete_own on public.viewpoints for delete using (auth.uid() = user_id);

create policy inspections_select_own on public.inspections for select using (auth.uid() = user_id);
create policy inspections_insert_own on public.inspections for insert with check (auth.uid() = user_id);
create policy inspections_update_own on public.inspections for update using (auth.uid() = user_id);
create policy inspections_delete_own on public.inspections for delete using (auth.uid() = user_id);

create policy media_assets_select_own on public.media_assets for select using (auth.uid() = user_id);
create policy media_assets_insert_own on public.media_assets for insert with check (auth.uid() = user_id);
create policy media_assets_update_own on public.media_assets for update using (auth.uid() = user_id);
create policy media_assets_delete_own on public.media_assets for delete using (auth.uid() = user_id);

create policy inference_jobs_select_own on public.inference_jobs for select using (auth.uid() = user_id);
create policy inference_jobs_insert_own on public.inference_jobs for insert with check (auth.uid() = user_id);
create policy inference_jobs_update_own on public.inference_jobs for update using (auth.uid() = user_id);
create policy inference_jobs_delete_own on public.inference_jobs for delete using (auth.uid() = user_id);

create policy defect_candidates_select_own on public.defect_candidates for select using (auth.uid() = user_id);
create policy defect_candidates_insert_own on public.defect_candidates for insert with check (auth.uid() = user_id);
create policy defect_candidates_update_own on public.defect_candidates for update using (auth.uid() = user_id);
create policy defect_candidates_delete_own on public.defect_candidates for delete using (auth.uid() = user_id);

create policy risk_rulesets_select_own on public.risk_rulesets for select using (auth.uid() = user_id);
create policy risk_rulesets_insert_own on public.risk_rulesets for insert with check (auth.uid() = user_id);
create policy risk_rulesets_update_own on public.risk_rulesets for update using (auth.uid() = user_id);
create policy risk_rulesets_delete_own on public.risk_rulesets for delete using (auth.uid() = user_id);

create policy risk_assessments_select_own on public.risk_assessments for select using (auth.uid() = user_id);
create policy risk_assessments_insert_own on public.risk_assessments for insert with check (auth.uid() = user_id);
create policy risk_assessments_update_own on public.risk_assessments for update using (auth.uid() = user_id);
create policy risk_assessments_delete_own on public.risk_assessments for delete using (auth.uid() = user_id);

create policy workcard_templates_select_own on public.workcard_templates for select using (auth.uid() = user_id);
create policy workcard_templates_insert_own on public.workcard_templates for insert with check (auth.uid() = user_id);
create policy workcard_templates_update_own on public.workcard_templates for update using (auth.uid() = user_id);
create policy workcard_templates_delete_own on public.workcard_templates for delete using (auth.uid() = user_id);

create policy work_cards_select_own on public.work_cards for select using (auth.uid() = user_id);
create policy work_cards_insert_own on public.work_cards for insert with check (auth.uid() = user_id);
create policy work_cards_update_own on public.work_cards for update using (auth.uid() = user_id);
create policy work_cards_delete_own on public.work_cards for delete using (auth.uid() = user_id);

create policy approvals_select_own on public.approvals for select using (auth.uid() = user_id);
create policy approvals_insert_own on public.approvals for insert with check (auth.uid() = user_id);
create policy approvals_update_own on public.approvals for update using (auth.uid() = user_id);
create policy approvals_delete_own on public.approvals for delete using (auth.uid() = user_id);

create policy audit_logs_select_own on public.audit_logs for select using (auth.uid() = user_id);
create policy audit_logs_insert_own on public.audit_logs for insert with check (auth.uid() = user_id);

commit;
