-- Caregiver MVP hardening: 约束、索引、状态机、审计字段

-- 1) 数据约束：避免 type/status/shift_type 任意字符串进入表
alter table public.incidents
  add constraint if not exists incidents_type_check
  check (type in ('fall','fever','refusal','breathing','vitals','other')) not valid;

alter table public.incidents
  add constraint if not exists incidents_status_check
  check (status in ('open','acknowledged','resolved','archived')) not valid;

alter table public.handoffs
  add constraint if not exists handoffs_shift_type_check
  check (shift_type in ('day','night')) not valid;

-- 如需更严格，可补充 tasks.status / residents.care_level 的 CHECK

alter table public.incidents validate constraint incidents_type_check;
alter table public.incidents validate constraint incidents_status_check;
alter table public.handoffs validate constraint handoffs_shift_type_check;

-- 2) 审计字段：便于观测与并发控制
alter table public.incidents
  add column if not exists updated_at timestamptz not null default now();

alter table public.incidents
  add column if not exists updated_by uuid null;

-- 3) 索引：覆盖常用查询（按 resident 维度拉取事件列表）
create index if not exists idx_incidents_resident_created_at
  on public.incidents(resident_id, created_at desc);

-- 4) 状态机 + 只读字段保护：防止通过 update 修改关键字段；并限制 status 流转
create or replace function public.caregiver_is_valid_incident_transition(old_status text, new_status text)
returns boolean
language sql
stable
as $$
  select
    case
      when old_status = new_status then true
      when old_status = 'open' and new_status in ('acknowledged','archived') then true
      when old_status = 'acknowledged' and new_status in ('resolved','archived') then true
      when old_status = 'resolved' and new_status in ('archived') then true
      else false
    end
$$;

create or replace function public.caregiver_enforce_incidents_update()
returns trigger
language plpgsql
as $$
begin
  -- 仅允许 authenticated 调用（冗余防护；正常情况下 RLS 已保证）
  if auth.uid() is null then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  -- 禁止修改关键字段
  if new.resident_id is distinct from old.resident_id
     or new.reporter_id is distinct from old.reporter_id
     or new.type is distinct from old.type
     or new.created_at is distinct from old.created_at then
    raise exception 'IMMUTABLE_FIELD' using errcode = 'P0001';
  end if;

  -- 状态机校验
  if not public.caregiver_is_valid_incident_transition(old.status, new.status) then
    raise exception 'INVALID_STATUS_TRANSITION' using errcode = 'P0001';
  end if;

  -- 自动补齐审计字段
  new.updated_at := now();
  new.updated_by := auth.uid();

  return new;
end;
$$;

drop trigger if exists trg_caregiver_enforce_incidents_update on public.incidents;
create trigger trg_caregiver_enforce_incidents_update
before update on public.incidents
for each row
execute function public.caregiver_enforce_incidents_update();
