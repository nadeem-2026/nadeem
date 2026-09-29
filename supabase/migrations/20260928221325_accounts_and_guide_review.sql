begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create type public.account_role as enum ('tourist', 'guide', 'admin');
create type public.account_status as enum ('active', 'suspended');
create type public.guide_status as enum ('draft', 'pending_review', 'approved', 'rejected', 'suspended');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null default '' check (char_length(display_name) <= 120),
  role public.account_role not null default 'tourist',
  account_status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guide_profiles (
  user_id uuid primary key references public.profiles(id) on delete restrict,
  city text not null default '' check (char_length(city) <= 120),
  bio text not null default '' check (char_length(bio) <= 2000),
  status public.guide_status not null default 'draft',
  review_reason text check (char_length(review_reason) <= 1000),
  reviewed_by uuid references public.profiles(id) on delete restrict,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index guide_review_queue on public.guide_profiles(status, updated_at desc);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  subject_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  previous_status public.guide_status not null,
  new_status public.guide_status not null,
  reason text not null check (char_length(btrim(reason)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index audit_logs_subject_time on public.audit_logs(subject_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.profiles force row level security;
alter table public.guide_profiles enable row level security;
alter table public.guide_profiles force row level security;
alter table public.audit_logs enable row level security;
alter table public.audit_logs force row level security;
revoke all on public.profiles, public.guide_profiles, public.audit_logs from public, anon, authenticated;
revoke all on sequence public.audit_logs_id_seq from public, anon, authenticated;
grant select on public.profiles, public.guide_profiles, public.audit_logs to authenticated;

create function private.active_role() returns public.account_role
language sql stable security definer set search_path = '' as $$
  select p.role from public.profiles p join auth.users u on u.id = p.id
  where p.id = (select auth.uid()) and p.account_status = 'active' and u.email_confirmed_at is not null
$$;
revoke all on function private.active_role() from public, anon, authenticated;
grant execute on function private.active_role() to authenticated;

create policy profile_read on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.active_role()) = 'admin');
create policy guide_read on public.guide_profiles for select to authenticated
using ((select private.active_role()) is not null and (user_id = (select auth.uid()) or (select private.active_role()) = 'admin'));
create policy audit_read on public.audit_logs for select to authenticated
using ((select private.active_role()) = 'admin');

create function private.create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare selected_role public.account_role;
begin
  -- Only the two public registration roles are accepted. Later metadata edits
  -- never affect the authoritative database role or the review state.
  selected_role := case when new.raw_user_meta_data->>'account_type' = 'guide'
    then 'guide'::public.account_role else 'tourist'::public.account_role end;
  insert into public.profiles(id, display_name, role)
    values(new.id, left(coalesce(new.raw_user_meta_data->>'display_name', ''), 120), selected_role);
  if selected_role = 'guide' then insert into public.guide_profiles(user_id) values(new.id); end if;
  return new;
end;
$$;
revoke all on function private.create_profile() from public, anon, authenticated;
create trigger nadeem_create_profile after insert on auth.users
for each row execute function private.create_profile();

-- Preserve pre-existing users; never grant an administrative role from metadata.
insert into public.profiles(id, display_name, role)
select id, left(coalesce(raw_user_meta_data->>'display_name', ''), 120),
  case when raw_user_meta_data->>'account_type' = 'guide' then 'guide'::public.account_role else 'tourist'::public.account_role end
from auth.users on conflict (id) do nothing;
insert into public.guide_profiles(user_id)
select id from public.profiles where role = 'guide' on conflict (user_id) do nothing;

create function public.save_guide_profile(p_name text, p_city text, p_bio text, p_submit boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare current_status public.guide_status;
begin
  if private.active_role() is distinct from 'guide'::public.account_role then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_name is null or p_city is null or p_bio is null or p_submit is null
    or char_length(btrim(p_name)) not between 1 and 120
    or char_length(btrim(p_city)) not between 1 and 120
    or char_length(btrim(p_bio)) not between 1 and 2000 then
    raise exception 'invalid_profile' using errcode = '22023';
  end if;
  select status into current_status from public.guide_profiles where user_id = auth.uid() for update;
  if current_status is null or current_status not in ('draft', 'rejected') then
    raise exception 'profile_locked' using errcode = '42501';
  end if;
  update public.profiles set display_name = btrim(p_name), updated_at = now() where id = auth.uid();
  update public.guide_profiles set city = btrim(p_city), bio = btrim(p_bio),
    status = case when p_submit then 'pending_review'::public.guide_status else 'draft'::public.guide_status end,
    review_reason = null, reviewed_by = null, reviewed_at = null, updated_at = now()
    where user_id = auth.uid();
end;
$$;
revoke all on function public.save_guide_profile(text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, boolean) to authenticated;

create function public.review_guide_profile(p_guide_id uuid, p_decision public.guide_status, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare previous public.guide_status;
begin
  if private.active_role() is distinct from 'admin'::public.account_role then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_reason is null or char_length(btrim(p_reason)) not between 1 and 1000 then
    raise exception 'reason_required' using errcode = '22023';
  end if;
  if p_guide_id is null or p_guide_id = auth.uid() then raise exception 'invalid_target' using errcode = '22023'; end if;
  select status into previous from public.guide_profiles where user_id = p_guide_id for update;
  if previous is null or not coalesce(
    (previous = 'pending_review' and p_decision in ('approved', 'rejected')) or
    (previous = 'approved' and p_decision = 'suspended') or
    (previous = 'suspended' and p_decision = 'approved'), false) then
    raise exception 'invalid_transition' using errcode = '22023';
  end if;
  if not exists(select 1 from public.profiles where id = p_guide_id and role = 'guide' and account_status = 'active') then
    raise exception 'inactive_guide' using errcode = '42501';
  end if;
  update public.guide_profiles set status = p_decision, review_reason = btrim(p_reason),
    reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now() where user_id = p_guide_id;
  insert into public.audit_logs(actor_id, subject_id, action, previous_status, new_status, reason)
    values(auth.uid(), p_guide_id, 'guide_review', previous, p_decision, btrim(p_reason));
end;
$$;
revoke all on function public.review_guide_profile(uuid, public.guide_status, text) from public, anon, authenticated;
grant execute on function public.review_guide_profile(uuid, public.guide_status, text) to authenticated;

comment on table public.guide_profiles is 'Phase 2 private initial profiles. No public search or booking access. Payment onboarding, required documents, pricing, availability, and publication rules remain separate.';
comment on table public.profiles is 'Authoritative roles. No client insert/update/delete grants. Admin bootstrap is a deliberate owner action, not a signup option.';
commit;
