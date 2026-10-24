begin;

-- Add personal_photo_url to guide_profiles
alter table public.guide_profiles
  add column if not exists personal_photo_url text;

-- Drop previous 17-parameter signature to prevent ambiguous function call (code 42725)
drop function if exists public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb);
drop function if exists private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb);

-- Upgrade private.save_guide_profile to accept and save personal_photo_url
create function private.save_guide_profile(
  p_name text,
  p_city text,
  p_bio text,
  p_languages text[],
  p_service_areas text[],
  p_hourly_rate numeric,
  p_max_participants integer,
  p_inclusions text[],
  p_submit boolean default false,
  p_first_name text default '',
  p_last_name text default '',
  p_full_name_ar text default '',
  p_full_name_en text default '',
  p_address_details jsonb default '{}'::jsonb,
  p_national_id_url text default null,
  p_official_license_url text default null,
  p_language_certificates jsonb default '{}'::jsonb,
  p_personal_photo_url text default null
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
  
  update public.profiles set 
    display_name = btrim(p_name), 
    avatar_url = coalesce(nullif(btrim(p_personal_photo_url), ''), avatar_url),
    updated_at = now() 
  where id = auth.uid();

  update public.guide_profiles set 
    city = btrim(p_city), 
    bio = btrim(p_bio),
    languages = coalesce(p_languages, '{}'),
    service_areas = coalesce(p_service_areas, '{}'),
    hourly_rate = coalesce(p_hourly_rate, 0),
    max_participants = coalesce(p_max_participants, 1),
    inclusions = coalesce(p_inclusions, '{}'),
    first_name = coalesce(nullif(btrim(p_first_name), ''), first_name),
    last_name = coalesce(nullif(btrim(p_last_name), ''), last_name),
    full_name_ar = coalesce(nullif(btrim(p_full_name_ar), ''), full_name_ar),
    full_name_en = coalesce(nullif(btrim(p_full_name_en), ''), full_name_en),
    address_details = case when p_address_details is not null and p_address_details <> '{}'::jsonb then p_address_details else address_details end,
    national_id_url = coalesce(p_national_id_url, national_id_url),
    official_license_url = coalesce(p_official_license_url, official_license_url),
    language_certificates = case when p_language_certificates is not null and p_language_certificates <> '{}'::jsonb then p_language_certificates else language_certificates end,
    personal_photo_url = coalesce(nullif(btrim(p_personal_photo_url), ''), personal_photo_url),
    status = case when p_submit then 'pending_review'::public.guide_status else 'draft'::public.guide_status end,
    review_reason = null, reviewed_by = null, reviewed_at = null, updated_at = now()
  where user_id = auth.uid();
end;
$$;

revoke all on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb, text) to authenticated;

-- Upgrade public.save_guide_profile to accept and forward personal_photo_url
create function public.save_guide_profile(
  p_name text,
  p_city text,
  p_bio text,
  p_languages text[],
  p_service_areas text[],
  p_hourly_rate numeric,
  p_max_participants integer,
  p_inclusions text[],
  p_submit boolean default false,
  p_first_name text default '',
  p_last_name text default '',
  p_full_name_ar text default '',
  p_full_name_en text default '',
  p_address_details jsonb default '{}'::jsonb,
  p_national_id_url text default null,
  p_official_license_url text default null,
  p_language_certificates jsonb default '{}'::jsonb,
  p_personal_photo_url text default null
) returns void language sql security invoker set search_path = '' as $$
  select private.save_guide_profile(
    p_name, p_city, p_bio, p_languages, p_service_areas, p_hourly_rate, p_max_participants, p_inclusions, p_submit,
    p_first_name, p_last_name, p_full_name_ar, p_full_name_en, p_address_details, p_national_id_url, p_official_license_url, p_language_certificates,
    p_personal_photo_url
  );
$$;

revoke all on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb, text) to authenticated;

commit;
