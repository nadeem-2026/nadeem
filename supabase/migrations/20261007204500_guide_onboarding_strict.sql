begin;

-- Add strict identity and documentation fields to guide_profiles
alter table public.guide_profiles
  add column if not exists first_name text not null default '',
  add column if not exists last_name text not null default '',
  add column if not exists full_name_ar text not null default '',
  add column if not exists full_name_en text not null default '',
  add column if not exists address_details jsonb not null default '{}'::jsonb,
  add column if not exists national_id_url text,
  add column if not exists official_license_url text,
  add column if not exists language_certificates jsonb not null default '{}'::jsonb;

-- Ensure storage schema and mock definitions exist for local/test environments
create schema if not exists storage;
create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table if not exists storage.objects (
  id uuid default gen_random_uuid() primary key,
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid
);
create or replace function storage.foldername(name text) returns text[] language sql immutable as $$
  select string_to_array(name, '/');
$$;
alter table storage.objects enable row level security;

-- Create secure private bucket for guide documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide_documents',
  'guide_documents',
  false,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'application/pdf']
) on conflict (id) do nothing;

-- RLS policies for guide_documents bucket
drop policy if exists "Guides can upload their own documents" on storage.objects;
create policy "Guides can upload their own documents"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "Guides can update their own documents" on storage.objects;
create policy "Guides can update their own documents"
  on storage.objects for update to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "Guides can view their own documents" on storage.objects;
create policy "Guides can view their own documents"
  on storage.objects for select to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

drop policy if exists "Guides can delete their own documents" on storage.objects;
create policy "Guides can delete their own documents"
  on storage.objects for delete to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

-- Upgrade save_guide_profile while preserving compatibility with 9-parameter calls
drop function if exists public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], text, text, text, text, jsonb, text, text, jsonb, boolean);
drop function if exists private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], text, text, text, text, jsonb, text, text, jsonb, boolean);
drop function if exists public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean);
drop function if exists private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean);

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
  p_language_certificates jsonb default '{}'::jsonb
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
    first_name = coalesce(nullif(btrim(p_first_name), ''), first_name),
    last_name = coalesce(nullif(btrim(p_last_name), ''), last_name),
    full_name_ar = coalesce(nullif(btrim(p_full_name_ar), ''), full_name_ar),
    full_name_en = coalesce(nullif(btrim(p_full_name_en), ''), full_name_en),
    address_details = case when p_address_details is not null and p_address_details <> '{}'::jsonb then p_address_details else address_details end,
    national_id_url = coalesce(p_national_id_url, national_id_url),
    official_license_url = coalesce(p_official_license_url, official_license_url),
    language_certificates = case when p_language_certificates is not null and p_language_certificates <> '{}'::jsonb then p_language_certificates else language_certificates end,
    status = case when p_submit then 'pending_review'::public.guide_status else 'draft'::public.guide_status end,
    review_reason = null, reviewed_by = null, reviewed_at = null, updated_at = now()
    where user_id = auth.uid();
end;
$$;
revoke all on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb) from public, anon, authenticated;
grant execute on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb) to authenticated;

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
  p_language_certificates jsonb default '{}'::jsonb
) returns void language sql security invoker set search_path = '' as $$
  select private.save_guide_profile(
    p_name, p_city, p_bio, p_languages, p_service_areas, p_hourly_rate, p_max_participants, p_inclusions, p_submit,
    p_first_name, p_last_name, p_full_name_ar, p_full_name_en, p_address_details, p_national_id_url, p_official_license_url, p_language_certificates
  );
$$;
revoke all on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], boolean, text, text, text, text, jsonb, text, text, jsonb) to authenticated;

commit;
