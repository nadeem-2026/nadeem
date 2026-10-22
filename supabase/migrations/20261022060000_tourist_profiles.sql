begin;

-- Create tourist_profiles table
create table if not exists public.tourist_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone_number text not null default '' check (char_length(phone_number) <= 30),
  nationality text not null default '' check (char_length(nationality) <= 60),
  country_of_residence text not null default '' check (char_length(country_of_residence) <= 60),
  city_of_residence text not null default '' check (char_length(city_of_residence) <= 60),
  preferred_languages text[] not null default array['ar']::text[],
  interests text[] not null default '{}'::text[],
  travel_style text not null default 'solo' check (travel_style in ('solo', 'family', 'couples', 'friends')),
  dietary_requirements text not null default '' check (char_length(dietary_requirements) <= 250),
  mobility_needs text not null default '' check (char_length(mobility_needs) <= 250),
  emergency_contact_name text not null default '' check (char_length(emergency_contact_name) <= 100),
  emergency_contact_phone text not null default '' check (char_length(emergency_contact_phone) <= 30),
  bio text not null default '' check (char_length(bio) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security
alter table public.tourist_profiles enable row level security;
alter table public.tourist_profiles force row level security;

revoke all on public.tourist_profiles from public, anon, authenticated;
grant select, insert, update on public.tourist_profiles to authenticated;

-- Policies:
-- 1. Tourist can view their own profile
drop policy if exists tourist_profiles_read_own on public.tourist_profiles;
create policy tourist_profiles_read_own on public.tourist_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 2. Tourist can insert their own profile
drop policy if exists tourist_profiles_insert_own on public.tourist_profiles;
create policy tourist_profiles_insert_own on public.tourist_profiles
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- 3. Tourist can update their own profile
drop policy if exists tourist_profiles_update_own on public.tourist_profiles;
create policy tourist_profiles_update_own on public.tourist_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 4. Admins can view any tourist profile
drop policy if exists tourist_profiles_admin_read on public.tourist_profiles;
create policy tourist_profiles_admin_read on public.tourist_profiles
  for select to authenticated
  using (private.active_role() = 'admin');

-- 5. Guides can view tourist profile IF they have a booking with the tourist
drop policy if exists tourist_profiles_guide_read on public.tourist_profiles;
create policy tourist_profiles_guide_read on public.tourist_profiles
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.tourist_id = public.tourist_profiles.user_id
        and b.guide_id = (select auth.uid())
    )
  );

-- Auto-create tourist profile on user registration
create or replace function private.create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
declare selected_role public.account_role;
begin
  selected_role := case when new.raw_user_meta_data->>'account_type' = 'guide'
    then 'guide'::public.account_role else 'tourist'::public.account_role end;
  insert into public.profiles(id, display_name, role)
    values(new.id, left(coalesce(new.raw_user_meta_data->>'display_name', ''), 120), selected_role);
  if selected_role = 'guide' then 
    insert into public.guide_profiles(user_id) values(new.id) on conflict (user_id) do nothing; 
  else
    insert into public.tourist_profiles(user_id) values(new.id) on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

-- Seed existing tourist profiles
insert into public.tourist_profiles(user_id)
select id from public.profiles where role = 'tourist'
on conflict (user_id) do nothing;

-- Stored procedure to safely save/update tourist profile
create or replace function private.save_tourist_profile(
  p_display_name text,
  p_phone_number text,
  p_nationality text,
  p_country_of_residence text,
  p_city_of_residence text,
  p_preferred_languages text[],
  p_interests text[],
  p_travel_style text,
  p_dietary_requirements text,
  p_mobility_needs text,
  p_emergency_contact_name text,
  p_emergency_contact_phone text,
  p_bio text,
  p_avatar_url text default null
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if private.active_role() is distinct from 'tourist'::public.account_role and private.active_role() is distinct from 'admin'::public.account_role then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_display_name is not null and char_length(btrim(p_display_name)) between 1 and 120 then
    update public.profiles set display_name = btrim(p_display_name), updated_at = now() where id = auth.uid();
  end if;

  if p_avatar_url is not null and char_length(p_avatar_url) <= 500 then
    update public.profiles set avatar_url = p_avatar_url, updated_at = now() where id = auth.uid();
  end if;

  insert into public.tourist_profiles (
    user_id,
    phone_number,
    nationality,
    country_of_residence,
    city_of_residence,
    preferred_languages,
    interests,
    travel_style,
    dietary_requirements,
    mobility_needs,
    emergency_contact_name,
    emergency_contact_phone,
    bio,
    updated_at
  ) values (
    auth.uid(),
    coalesce(btrim(p_phone_number), ''),
    coalesce(btrim(p_nationality), ''),
    coalesce(btrim(p_country_of_residence), ''),
    coalesce(btrim(p_city_of_residence), ''),
    coalesce(p_preferred_languages, array['ar']::text[]),
    coalesce(p_interests, '{}'::text[]),
    case when p_travel_style in ('solo', 'family', 'couples', 'friends') then p_travel_style else 'solo' end,
    coalesce(btrim(p_dietary_requirements), ''),
    coalesce(btrim(p_mobility_needs), ''),
    coalesce(btrim(p_emergency_contact_name), ''),
    coalesce(btrim(p_emergency_contact_phone), ''),
    coalesce(btrim(p_bio), ''),
    now()
  )
  on conflict (user_id) do update set
    phone_number = excluded.phone_number,
    nationality = excluded.nationality,
    country_of_residence = excluded.country_of_residence,
    city_of_residence = excluded.city_of_residence,
    preferred_languages = excluded.preferred_languages,
    interests = excluded.interests,
    travel_style = excluded.travel_style,
    dietary_requirements = excluded.dietary_requirements,
    mobility_needs = excluded.mobility_needs,
    emergency_contact_name = excluded.emergency_contact_name,
    emergency_contact_phone = excluded.emergency_contact_phone,
    bio = excluded.bio,
    updated_at = now();
end;
$$;

create or replace function public.save_tourist_profile(
  p_display_name text,
  p_phone_number text,
  p_nationality text,
  p_country_of_residence text,
  p_city_of_residence text,
  p_preferred_languages text[],
  p_interests text[],
  p_travel_style text,
  p_dietary_requirements text,
  p_mobility_needs text,
  p_emergency_contact_name text,
  p_emergency_contact_phone text,
  p_bio text,
  p_avatar_url text default null
) returns void language sql security invoker set search_path = '' as $$
  select private.save_tourist_profile(
    p_display_name,
    p_phone_number,
    p_nationality,
    p_country_of_residence,
    p_city_of_residence,
    p_preferred_languages,
    p_interests,
    p_travel_style,
    p_dietary_requirements,
    p_mobility_needs,
    p_emergency_contact_name,
    p_emergency_contact_phone,
    p_bio,
    p_avatar_url
  );
$$;

revoke all on function private.save_tourist_profile(text, text, text, text, text, text[], text[], text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function private.save_tourist_profile(text, text, text, text, text, text[], text[], text, text, text, text, text, text, text) to authenticated;

revoke all on function public.save_tourist_profile(text, text, text, text, text, text[], text[], text, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.save_tourist_profile(text, text, text, text, text, text[], text[], text, text, text, text, text, text, text) to authenticated;

commit;
