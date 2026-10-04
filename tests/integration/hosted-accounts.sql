-- Run as the project owner on a development database.
-- All fixtures and decisions are rolled back; no Auth email or JWT is created.
begin;
do $$
declare
  tourist_id uuid := gen_random_uuid();
  guide_id uuid := gen_random_uuid();
  admin_id uuid := gen_random_uuid();
  observed bigint;
begin
  insert into auth.users(id, raw_user_meta_data, email_confirmed_at) values
    (tourist_id, '{"account_type":"admin","display_name":"Temporary verification"}', now()),
    (guide_id, '{"account_type":"guide","display_name":"Temporary verification"}', now()),
    (admin_id, '{"account_type":"tourist","display_name":"Temporary verification"}', now());
  if (select role from public.profiles where id=tourist_id) <> 'tourist' then
    raise exception 'FAIL: metadata granted admin';
  end if;
  -- Owner-only test fixture; this assignment is rolled back below.
  update public.profiles set role='admin' where id=admin_id;

  execute 'set local role anon';
  begin
    perform 1 from public.profiles;
    raise exception 'FAIL: visitor read profiles';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.save_guide_profile('Test','Riyadh','Test',array['Arabic'],array['Riyadh'],100,4,array['Tour'],true);
    raise exception 'FAIL: visitor invoked profile RPC';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub',guide_id::text,true);
  execute 'set local role authenticated';
  select count(*) into observed from public.profiles;
  if observed <> 1 then raise exception 'FAIL: profile isolation'; end if;
  begin
    update public.profiles set role='admin' where id=guide_id;
    raise exception 'FAIL: direct role write';
  exception when insufficient_privilege then null;
  end;
  perform public.save_guide_profile('Test guide','Riyadh','Development verification',array['Arabic'],array['Riyadh'],100,4,array['Tour'],true);
  begin
    perform public.review_guide_profile(guide_id,'approved','Self approval');
    raise exception 'FAIL: self approval';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub',tourist_id::text,true);
  execute 'set local role authenticated';
  select count(*) into observed from public.guide_profiles;
  if observed <> 0 then raise exception 'FAIL: guide data leaked'; end if;
  begin
    perform public.save_guide_profile('Test','City','Bio',array['Arabic'],array['Riyadh'],100,4,array['Tour'],true);
    raise exception 'FAIL: tourist wrote a guide profile';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';

  perform set_config('request.jwt.claim.sub',admin_id::text,true);
  execute 'set local role authenticated';
  perform public.review_guide_profile(guide_id,'approved','Temporary development verification');
  select count(*) into observed from public.audit_logs
    where actor_id=admin_id and subject_id=guide_id and new_status='approved';
  if observed <> 1 then raise exception 'FAIL: missing or duplicate audit'; end if;
  begin
    perform public.review_guide_profile(guide_id,'approved','Repeated approval');
    raise exception 'FAIL: repeated transition';
  exception when invalid_parameter_value then null;
  end;
  execute 'reset role';

  update public.profiles set account_status='suspended' where id=guide_id;
  perform set_config('request.jwt.claim.sub',guide_id::text,true);
  execute 'set local role authenticated';
  select count(*) into observed from public.guide_profiles;
  if observed <> 0 then raise exception 'FAIL: suspended account read guide data'; end if;
  begin
    perform public.save_guide_profile('Test','City','Bio',array['Arabic'],array['Riyadh'],100,4,array['Tour'],true);
    raise exception 'FAIL: suspended account wrote a profile';
  exception when insufficient_privilege then null;
  end;
  execute 'reset role';
end;
$$;
rollback;
select 'PASS: role isolation, guarded RPCs, review audit, suspension; fixtures rolled back' as verification;
