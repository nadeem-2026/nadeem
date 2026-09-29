begin;

-- Preserve the validated, identity-aware implementations in an unexposed schema.
alter function public.save_guide_profile(text, text, text, boolean) set schema private;
alter function public.review_guide_profile(uuid, public.guide_status, text) set schema private;

-- Public RPCs use the caller's privileges. The private implementations retain
-- their own authoritative role, confirmation, suspension and transition checks.
create function public.save_guide_profile(p_name text, p_city text, p_bio text, p_submit boolean default false)
returns void language sql security invoker set search_path = '' as $$
  select private.save_guide_profile(p_name, p_city, p_bio, p_submit);
$$;
create function public.review_guide_profile(p_guide_id uuid, p_decision public.guide_status, p_reason text)
returns void language sql security invoker set search_path = '' as $$
  select private.review_guide_profile(p_guide_id, p_decision, p_reason);
$$;

revoke all on function public.save_guide_profile(text, text, text, boolean),
  public.review_guide_profile(uuid, public.guide_status, text),
  private.save_guide_profile(text, text, text, boolean),
  private.review_guide_profile(uuid, public.guide_status, text) from public, anon, authenticated;
grant execute on function public.save_guide_profile(text, text, text, boolean),
  public.review_guide_profile(uuid, public.guide_status, text),
  private.save_guide_profile(text, text, text, boolean),
  private.review_guide_profile(uuid, public.guide_status, text) to authenticated;

create index guide_profiles_reviewed_by_idx on public.guide_profiles(reviewed_by);
create index audit_logs_actor_id_idx on public.audit_logs(actor_id);

comment on function private.review_guide_profile(uuid, public.guide_status, text) is
  'Internal guarded implementation. Keep private schema outside the Data API exposed schemas; authenticated EXECUTE is required by the security-invoker public wrapper.';
commit;
