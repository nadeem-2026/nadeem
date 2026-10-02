begin;

-- 1. Allow authenticated users (tourists and other guides) to see approved guide profiles
create policy guide_read_approved on public.guide_profiles
  for select to authenticated
  using (status = 'approved');

-- 2. Allow authenticated users to see the base profile (display_name, etc.) of approved guides
create policy profile_read_approved on public.profiles
  for select to authenticated
  using (
    id in (
      select user_id from public.guide_profiles where status = 'approved'
    )
  );

commit;
