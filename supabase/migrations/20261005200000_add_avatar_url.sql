-- Add avatar_url to profiles
alter table public.profiles add column avatar_url text check (char_length(avatar_url) <= 500);

-- Drop dependent policy first
drop policy if exists profile_read_approved on public.profiles;

-- Drop the existing functions since the return signature is changing
drop function if exists public.list_public_guides();
drop function if exists private.list_public_guides();

-- Recreate private function with avatar_url
create function private.list_public_guides() returns table(
  id uuid, display_name text, avatar_url text, city text, bio text, hourly_rate numeric,
  languages text[], service_areas text[], max_participants integer, inclusions text[]
) language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, p.avatar_url, g.city, g.bio, g.hourly_rate, g.languages, g.service_areas, g.max_participants, g.inclusions
  from public.profiles p join public.guide_profiles g on g.user_id=p.id
  where p.role='guide' and p.account_status='active' and g.status='approved'
$$;

-- Recreate public function with avatar_url
create function public.list_public_guides() returns table(
  id uuid, display_name text, avatar_url text, city text, bio text, hourly_rate numeric,
  languages text[], service_areas text[], max_participants integer, inclusions text[]
) language sql stable security invoker set search_path = '' as $$ 
  select * from private.list_public_guides() 
$$;

revoke all on function private.list_public_guides(), public.list_public_guides() from public;
grant execute on function private.list_public_guides(), public.list_public_guides() to anon, authenticated;

-- Recreate the dependent policy
create policy profile_read_approved on public.profiles for select to authenticated
using (id in (select id from private.list_public_guides()));
