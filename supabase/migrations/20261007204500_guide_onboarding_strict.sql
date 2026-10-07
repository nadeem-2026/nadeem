begin;

-- Add strict identity and documentation fields to guide_profiles
alter table public.guide_profiles
  add column first_name text not null default '',
  add column last_name text not null default '',
  add column full_name_ar text not null default '',
  add column full_name_en text not null default '',
  add column address_details jsonb not null default '{}'::jsonb,
  add column national_id_url text,
  add column official_license_url text,
  add column language_certificates jsonb not null default '{}'::jsonb;

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
create policy "Guides can upload their own documents"
  on storage.objects for insert to authenticated
  with check ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Guides can update their own documents"
  on storage.objects for update to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Guides can view their own documents"
  on storage.objects for select to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

create policy "Guides can delete their own documents"
  on storage.objects for delete to authenticated
  using ( bucket_id = 'guide_documents' and (storage.foldername(name))[1] = auth.uid()::text );

-- We will also need to update save_guide_profile RPC, but since the onboarding will now be multi-step
-- we will drop save_guide_profile and use direct Supabase table mutations from the client,
-- or create a new comprehensive save_guide_profile RPC. 
-- Since RLS is already active on guide_profiles, guides can update their own profiles directly if the policy allows.
-- Let's check existing policies on guide_profiles. Wait, we can just recreate the save_guide_profile function.

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
  p_first_name text,
  p_last_name text,
  p_full_name_ar text,
  p_full_name_en text,
  p_address_details jsonb,
  p_national_id_url text,
  p_official_license_url text,
  p_language_certificates jsonb,
  p_submit boolean default false
) returns void language plpgsql security definer set search_path = '' as $$
declare current_status public.guide_status;
begin
  if private.active_role() is distinct from 'guide'::public.account_role then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_submit then
    if char_length(btrim(p_first_name)) < 2 or char_length(btrim(p_last_name)) < 2 
       or char_length(btrim(p_full_name_ar)) < 5 or char_length(btrim(p_full_name_en)) < 5
       or p_national_id_url is null or p_official_license_url is null then
       raise exception 'missing_strict_identity' using errcode = '22023';
    end if;
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
    first_name = btrim(coalesce(p_first_name, '')),
    last_name = btrim(coalesce(p_last_name, '')),
    full_name_ar = btrim(coalesce(p_full_name_ar, '')),
    full_name_en = btrim(coalesce(p_full_name_en, '')),
    address_details = coalesce(p_address_details, '{}'::jsonb),
    national_id_url = coalesce(p_national_id_url, national_id_url),
    official_license_url = coalesce(p_official_license_url, official_license_url),
    language_certificates = coalesce(p_language_certificates, '{}'::jsonb),
    status = case when p_submit then 'pending_review'::public.guide_status else 'draft'::public.guide_status end,
    review_reason = null, reviewed_by = null, reviewed_at = null, updated_at = now()
    where user_id = auth.uid();
end;
$$;
revoke all on function private.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], text, text, text, text, jsonb, text, text, jsonb, boolean) from public, anon, authenticated;

create function public.save_guide_profile(
  p_name text,
  p_city text,
  p_bio text,
  p_languages text[],
  p_service_areas text[],
  p_hourly_rate numeric,
  p_max_participants integer,
  p_inclusions text[],
  p_first_name text,
  p_last_name text,
  p_full_name_ar text,
  p_full_name_en text,
  p_address_details jsonb,
  p_national_id_url text,
  p_official_license_url text,
  p_language_certificates jsonb,
  p_submit boolean default false
) returns void language sql security invoker set search_path = '' as $$
  select private.save_guide_profile(p_name, p_city, p_bio, p_languages, p_service_areas, p_hourly_rate, p_max_participants, p_inclusions, p_first_name, p_last_name, p_full_name_ar, p_full_name_en, p_address_details, p_national_id_url, p_official_license_url, p_language_certificates, p_submit);
$$;
revoke all on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], text, text, text, text, jsonb, text, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, text[], text[], numeric, integer, text[], text, text, text, text, jsonb, text, text, jsonb, boolean) to authenticated;

commit;
