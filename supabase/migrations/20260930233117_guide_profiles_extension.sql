begin;

alter table public.guide_profiles
  add column languages text[] not null default '{}',
  add column service_areas text[] not null default '{}',
  add column hourly_rate numeric(10,2) not null default 0.00 check (hourly_rate >= 0),
  add column max_participants integer not null default 1 check (max_participants > 0),
  add column inclusions text[] not null default '{}';

create table public.guide_availability_weekly (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guide_profiles(user_id) on delete restrict,
  day_of_week integer not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_time < end_time),
  unique (guide_id, day_of_week)
);

alter table public.guide_availability_weekly enable row level security;
alter table public.guide_availability_weekly force row level security;

create policy weekly_availability_read on public.guide_availability_weekly
  for select to authenticated using (true);

create policy weekly_availability_write on public.guide_availability_weekly
  for all to authenticated
  using (guide_id = (select auth.uid()))
  with check (guide_id = (select auth.uid()));

create table public.guide_availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guide_profiles(user_id) on delete restrict,
  exception_date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (is_available = false and start_time is null and end_time is null) or
    (is_available = true and start_time is not null and end_time is not null and start_time < end_time)
  ),
  unique (guide_id, exception_date)
);

alter table public.guide_availability_exceptions enable row level security;
alter table public.guide_availability_exceptions force row level security;

create policy exceptions_availability_read on public.guide_availability_exceptions
  for select to authenticated using (true);

create policy exceptions_availability_write on public.guide_availability_exceptions
  for all to authenticated
  using (guide_id = (select auth.uid()))
  with check (guide_id = (select auth.uid()));

revoke all on public.guide_availability_weekly, public.guide_availability_exceptions from public, anon, authenticated;
grant select, insert, update, delete on public.guide_availability_weekly, public.guide_availability_exceptions to authenticated;

-- Upgrade the save_guide_profile function
drop function if exists public.save_guide_profile(text, text, text, boolean);
drop function if exists private.save_guide_profile(text, text, text, boolean);

create function private.save_guide_profile(
  p_name text,
  p_city text,
  p_bio text,
  p_languages text[],
  p_service_areas text[],
  p_hourly_rate numeric,
  p_max_participants integer,
  p_inclusions text[],
  p_submit boolean default false
) returns void language plpgsql security definer set search_path = '' as $$
declare current_status public.guide_status;
begin
  if private.active_role() is distinct from 'guide'::public.account_role then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_name is null or p_city is null or p_bio is null or p_submit is null
    or char_length(btrim(p_name)) not between 1 and 120
    or char_length(btrim(p_city)) not between 1 and 120
    or char_length(btrim(p_bio)) not between 1 and 2000
    or p_hourly_rate < 0
    or p_max_participants < 1 then
    raise exception 'invalid_profile' using errcode = '22023';
  end if;
  select status into current_status from public.guide_profiles where user_id = auth.uid() for update;
  if current_status is null or current_status not in ('draft', 'rejected') then
    raise exception 'profile_locked' using errcode = '42501';
  end if;
  update public.profiles set display_name = btrim(p_name), updated_at = now() where id = auth.uid();
  update public.guide_profiles set 
    city = btrim(p_city), 
    bio = btrim(p_bio),
    languages = coalesce(p_languages, '{}'),
    service_areas = coalesce(p_service_areas, '{}'),
    hourly_rate = coalesce(p_hourly_rate, 0),
    max_participants = coalesce(p_max_participants, 1),
    inclusions = coalesce(p_inclusions, '{}'),
    status = case when p_submit then 'pending_review'::public.guide_status else 'draft'::public.guide_status end,
    review_reason = null, reviewed_by = null, reviewed_at = null, updated_at = now()
    where user_id = auth.uid();
end;
$$;
revoke all on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean) from public, anon, authenticated;

create function public.save_guide_profile(
  p_name text,
  p_city text,
  p_bio text,
  p_languages text[],
  p_service_areas text[],
  p_hourly_rate numeric,
  p_max_participants integer,
  p_inclusions text[],
  p_submit boolean default false
) returns void language sql security invoker set search_path = '' as $$
  select private.save_guide_profile(p_name, p_city, p_bio, p_languages, p_service_areas, p_hourly_rate, p_max_participants, p_inclusions, p_submit);
$$;
revoke all on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean) to authenticated;

commit;
