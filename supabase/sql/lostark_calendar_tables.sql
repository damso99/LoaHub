-- LoaHub Lost Ark Calendar cache tables
-- 실행 순서:
-- 1. Supabase SQL Editor에서 이 파일 실행
-- 2. 이후 Edge Function 배포
-- 3. Cron SQL 실행

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

create table if not exists public.lostark_calendar_schedules (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null,
  week_end_date date not null,
  category_name text not null,
  contents_name text not null,
  contents_icon text not null default '',
  min_item_level integer,
  location text not null default '',
  start_time_kst timestamp without time zone not null,
  start_date date not null,
  start_hhmm varchar(5) not null,
  slot_hhmm varchar(5) not null,
  rewards jsonb not null default '[]'::jsonb,
  raw_content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists uq_lostark_calendar_schedules_unique
  on public.lostark_calendar_schedules (category_name, contents_name, location, start_time_kst);

create index if not exists idx_lostark_calendar_schedules_active_date
  on public.lostark_calendar_schedules (is_active, start_date, slot_hhmm, category_name, start_time_kst);

drop trigger if exists trg_lostark_calendar_schedules_updated_at on public.lostark_calendar_schedules;
create trigger trg_lostark_calendar_schedules_updated_at
before update on public.lostark_calendar_schedules
for each row
execute function public.set_updated_at();

create table if not exists public.lostark_calendar_sync_logs (
  id uuid primary key default gen_random_uuid(),
  sync_type text not null,
  status text not null,
  week_start_date date,
  week_end_date date,
  fetched_count integer,
  filtered_count integer,
  saved_count integer,
  message text,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.lostark_calendar_schedules enable row level security;
alter table public.lostark_calendar_sync_logs enable row level security;

drop policy if exists select_active_lostark_calendar_schedules on public.lostark_calendar_schedules;
create policy select_active_lostark_calendar_schedules
on public.lostark_calendar_schedules
for select
to anon, authenticated
using (is_active = true);

grant select on public.lostark_calendar_schedules to anon, authenticated, service_role;
revoke all on public.lostark_calendar_sync_logs from anon, authenticated;
revoke all on public.lostark_calendar_sync_logs from public;

create or replace function public.replace_lostark_calendar_week(
  p_week_start_date date,
  p_week_end_date date,
  p_rows jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_count integer := 0;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) = 0 then
    return 0;
  end if;

  create temporary table if not exists tmp_lostark_calendar_rows (
    week_start_date date,
    week_end_date date,
    category_name text,
    contents_name text,
    contents_icon text,
    min_item_level integer,
    location text,
    start_time_kst timestamp without time zone,
    start_date date,
    start_hhmm varchar(5),
    slot_hhmm varchar(5),
    rewards jsonb,
    raw_content jsonb
  ) on commit drop;

  truncate table tmp_lostark_calendar_rows;

  insert into tmp_lostark_calendar_rows (
    week_start_date,
    week_end_date,
    category_name,
    contents_name,
    contents_icon,
    min_item_level,
    location,
    start_time_kst,
    start_date,
    start_hhmm,
    slot_hhmm,
    rewards,
    raw_content
  )
  select
    week_start_date,
    week_end_date,
    category_name,
    contents_name,
    coalesce(contents_icon, ''),
    min_item_level,
    coalesce(location, ''),
    start_time_kst,
    start_date,
    start_hhmm,
    slot_hhmm,
    coalesce(rewards, '[]'::jsonb),
    coalesce(raw_content, '{}'::jsonb)
  from jsonb_to_recordset(p_rows) as item(
    week_start_date date,
    week_end_date date,
    category_name text,
    contents_name text,
    contents_icon text,
    min_item_level integer,
    location text,
    start_time_kst timestamp without time zone,
    start_date date,
    start_hhmm varchar(5),
    slot_hhmm varchar(5),
    rewards jsonb,
    raw_content jsonb
  );

  update public.lostark_calendar_schedules schedule
  set is_active = false
  where schedule.is_active = true
    and (
      schedule.week_start_date <> p_week_start_date
      or schedule.week_end_date <> p_week_end_date
      or not exists (
        select 1
        from tmp_lostark_calendar_rows incoming
        where incoming.category_name = schedule.category_name
          and incoming.contents_name = schedule.contents_name
          and incoming.location = schedule.location
          and incoming.start_time_kst = schedule.start_time_kst
      )
    );

  insert into public.lostark_calendar_schedules (
    id,
    week_start_date,
    week_end_date,
    category_name,
    contents_name,
    contents_icon,
    min_item_level,
    location,
    start_time_kst,
    start_date,
    start_hhmm,
    slot_hhmm,
    rewards,
    raw_content,
    is_active
  )
  select
    gen_random_uuid(),
    incoming.week_start_date,
    incoming.week_end_date,
    incoming.category_name,
    incoming.contents_name,
    incoming.contents_icon,
    incoming.min_item_level,
    incoming.location,
    incoming.start_time_kst,
    incoming.start_date,
    incoming.start_hhmm,
    incoming.slot_hhmm,
    incoming.rewards,
    incoming.raw_content,
    true
  from tmp_lostark_calendar_rows incoming
  on conflict (category_name, contents_name, location, start_time_kst)
  do update set
    week_start_date = excluded.week_start_date,
    week_end_date = excluded.week_end_date,
    contents_icon = excluded.contents_icon,
    min_item_level = excluded.min_item_level,
    start_date = excluded.start_date,
    start_hhmm = excluded.start_hhmm,
    slot_hhmm = excluded.slot_hhmm,
    rewards = excluded.rewards,
    raw_content = excluded.raw_content,
    is_active = true,
    updated_at = now();

  get diagnostics saved_count = row_count;
  return saved_count;
end;
$$;
