begin;

-- Containment: no financial mutation is enabled until provider verification,
-- retries, refunds and settlement have passed a separate acceptance review.
create or replace function public.handle_payment_webhook(p_charge_id text,p_status text,p_receipt_url text)
returns void language plpgsql security invoker set search_path = '' as $$
begin raise exception 'payments_not_enabled' using errcode = '42501'; end $$;
revoke all on function public.handle_payment_webhook(text,text,text) from public, anon, authenticated, service_role;
revoke insert, update, delete on public.bookings from anon, authenticated;
drop policy tourist_insert_booking on public.bookings;
drop policy tourist_update_booking on public.bookings;
drop policy guide_update_booking on public.bookings;
drop policy "System can insert notifications" on public.notifications;
revoke insert, delete, update on public.notifications from anon, authenticated;
grant update(is_read) on public.notifications to authenticated;

create or replace function private.save_guide_profile(
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
    or p_hourly_rate is null or p_hourly_rate::text in ('NaN','Infinity','-Infinity') or p_hourly_rate < 0
    or p_max_participants is null or p_max_participants < 1 then
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


-- The identity-aware private implementation remains the authorization boundary.
grant execute on function private.save_guide_profile(text,text,text,text[],text[],numeric,integer,text[],boolean) to authenticated;

-- Review fields stay private; discovery returns only the approved public DTO.
drop policy guide_read_approved on public.guide_profiles;
drop policy profile_read_approved on public.profiles;

-- Curated public discovery, without exposing profiles, review reasons or emails.
create function private.list_public_guides() returns table(
  id uuid, display_name text, city text, bio text, hourly_rate numeric,
  languages text[], service_areas text[], max_participants integer, inclusions text[]
) language sql stable security definer set search_path = '' as $$
  select p.id,p.display_name,g.city,g.bio,g.hourly_rate,g.languages,g.service_areas,g.max_participants,g.inclusions
  from public.profiles p join public.guide_profiles g on g.user_id=p.id
  where p.role='guide' and p.account_status='active' and g.status='approved'
$$;
create function public.list_public_guides() returns table(
  id uuid, display_name text, city text, bio text, hourly_rate numeric,
  languages text[], service_areas text[], max_participants integer, inclusions text[]
) language sql stable security invoker set search_path = '' as $$ select * from private.list_public_guides() $$;
revoke all on function private.list_public_guides(), public.list_public_guides() from public;
grant usage on schema private to anon;
grant execute on function private.list_public_guides(),public.list_public_guides() to anon,authenticated;

create policy profile_read_approved on public.profiles for select to authenticated
using (id in (select id from private.list_public_guides()));

-- Keep legacy rows intact; deadlines on pre-existing accepted bookings need review.
alter table public.bookings add column response_expires_at timestamptz,
  add column payment_expires_at timestamptz,
  add column policy_snapshot jsonb not null default '{}';
update public.bookings set response_expires_at=created_at + interval '12 hours' where status='pending';

create function private.guide_available(p_guide uuid,p_start timestamptz,p_end timestamptz)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare s timestamp := p_start at time zone 'Asia/Riyadh'; e timestamp := p_end at time zone 'Asia/Riyadh';
  exception_row public.guide_availability_exceptions%rowtype;
begin
  if s::date <> e::date then return false; end if;
  select * into exception_row from public.guide_availability_exceptions where guide_id=p_guide and exception_date=s::date;
  if found then
    return exception_row.is_available and s::time >= exception_row.start_time and e::time <= exception_row.end_time;
  end if;
  return exists(select 1 from public.guide_availability_weekly where guide_id=p_guide
    and day_of_week=extract(dow from s)::integer and start_time <= s::time and end_time >= e::time);
end $$;
revoke all on function private.guide_available(uuid,timestamptz,timestamptz) from public,anon,authenticated;

create function private.request_booking(p_guide_id uuid,p_start_time timestamptz,p_duration integer,p_participants integer,p_meeting_point text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare g public.guide_profiles%rowtype; settings public.platform_settings%rowtype;
  end_at timestamptz; result uuid;
begin
  if private.active_role() is distinct from 'tourist'::public.account_role then raise exception 'not_authorized' using errcode='42501'; end if;
  select * into settings from public.platform_settings where singleton;
  if p_duration is null or p_duration<=0 or p_participants is null or p_participants<=0
    or p_start_time is null or not isfinite(p_start_time) or p_meeting_point is null
    or length(btrim(p_meeting_point)) not between 1 and 500 then raise exception 'invalid_booking'; end if;
  if p_start_time < now()+make_interval(mins=>settings.minimum_booking_notice_minutes) then raise exception 'minimum_notice'; end if;
  select g1.* into g from public.guide_profiles g1 join public.profiles p on p.id=g1.user_id
    where g1.user_id=p_guide_id and g1.status='approved' and p.account_status='active' and p.role='guide' for update of g1;
  if not found then raise exception 'guide_unavailable'; end if;
  if p_participants>g.max_participants then raise exception 'capacity_exceeded'; end if;
  end_at:=p_start_time+make_interval(hours=>p_duration);
  if not private.guide_available(p_guide_id,p_start_time,end_at) then raise exception 'outside_availability'; end if;
  insert into public.bookings(tourist_id,guide_id,start_time,end_time,duration_hours,participants,meeting_point,total_price,response_expires_at,policy_snapshot)
  values(auth.uid(),p_guide_id,p_start_time,end_at,p_duration,p_participants,btrim(p_meeting_point),g.hourly_rate*p_duration,
    now()+make_interval(mins=>settings.guide_response_minutes),
    jsonb_build_object('hourly_rate',g.hourly_rate,'max_participants',g.max_participants,'inclusions',g.inclusions,
      'buffer_minutes',settings.tour_buffer_minutes,'payment_minutes',settings.payment_window_minutes,'currency','SAR')) returning id into result;
  insert into public.notifications(user_id,title,body,link) values(p_guide_id,'طلب حجز جديد / New booking request','راجع تفاصيل الطلب / Review the request','/ar/bookings/'||result);
  return result;
end $$;
create function public.request_booking(p_guide_id uuid,p_start_time timestamptz,p_duration integer,p_participants integer,p_meeting_point text)
returns uuid language sql security invoker set search_path = '' as $$ select private.request_booking(p_guide_id,p_start_time,p_duration,p_participants,p_meeting_point) $$;
revoke all on function public.request_booking(uuid,timestamptz,integer,integer,text),private.request_booking(uuid,timestamptz,integer,integer,text) from public,anon;
grant execute on function public.request_booking(uuid,timestamptz,integer,integer,text),private.request_booking(uuid,timestamptz,integer,integer,text) to authenticated;

create function private.change_booking_status(p_booking_id uuid,p_status public.booking_status)
returns void language plpgsql security definer set search_path = '' as $$
declare b public.bookings%rowtype; role_now public.account_role := private.active_role(); guide uuid;
  gap integer; deadline integer;
begin
  if role_now is null then raise exception 'not_authorized' using errcode='42501'; end if;
  select guide_id into guide from public.bookings where id=p_booking_id and (tourist_id=auth.uid() or guide_id=auth.uid());
  if guide is null then raise exception 'not_authorized' using errcode='42501'; end if;
  -- Serialize every acceptance for a guide, including non-overlapping requests.
  perform 1 from public.guide_profiles where user_id=guide for update;
  select * into b from public.bookings where id=p_booking_id for update;
  if role_now='tourist' and b.tourist_id=auth.uid() and p_status='cancelled' and b.status in ('pending','awaiting_payment') then
    update public.bookings set status='cancelled',updated_at=now() where id=b.id;
  elsif role_now='guide' and b.guide_id=auth.uid() and b.status='pending' and p_status in ('awaiting_payment','declined') then
    if b.response_expires_at is null or b.response_expires_at<=now() or b.start_time<=now() then raise exception 'request_expired'; end if;
    if p_status='awaiting_payment' then
      if not exists(select 1 from public.guide_profiles where user_id=guide and status='approved') then raise exception 'guide_unavailable'; end if;
      if not private.guide_available(guide,b.start_time,b.end_time) then raise exception 'outside_availability'; end if;
      select tour_buffer_minutes,payment_window_minutes into gap,deadline from public.platform_settings where singleton;
      gap:=coalesce((b.policy_snapshot->>'buffer_minutes')::integer,gap);
      deadline:=coalesce((b.policy_snapshot->>'payment_minutes')::integer,deadline);
      if exists(select 1 from public.bookings other where other.guide_id=guide and other.id<>b.id
        and (other.status in ('confirmed','in_progress','completed') or (other.status='awaiting_payment' and (other.payment_expires_at is null or other.payment_expires_at>now())))
        and other.start_time < b.end_time+make_interval(mins=>greatest(gap,coalesce((other.policy_snapshot->>'buffer_minutes')::integer,gap)))
        and other.end_time+make_interval(mins=>greatest(gap,coalesce((other.policy_snapshot->>'buffer_minutes')::integer,gap))) > b.start_time
      ) then raise exception 'booking_conflict' using errcode='23P01'; end if;
      update public.bookings set status=p_status,payment_expires_at=now()+make_interval(mins=>deadline),updated_at=now() where id=b.id;
    else update public.bookings set status=p_status,updated_at=now() where id=b.id;
    end if;
  else raise exception 'invalid_transition' using errcode='42501'; end if;
  insert into public.notifications(user_id,title,body,link)
    values(case when auth.uid()=b.guide_id then b.tourist_id else b.guide_id end,'تحديث الحجز / Booking update',p_status::text,'/ar/bookings/'||b.id);
end $$;
create function public.change_booking_status(p_booking_id uuid,p_status public.booking_status)
returns void language sql security invoker set search_path = '' as $$ select private.change_booking_status(p_booking_id,p_status) $$;
revoke all on function public.change_booking_status(uuid,public.booking_status),private.change_booking_status(uuid,public.booking_status) from public,anon;
grant execute on function public.change_booking_status(uuid,public.booking_status),private.change_booking_status(uuid,public.booking_status) to authenticated;

-- Move existing codes out of the shared row; the legacy column stays NULL for compatibility.
create table private.booking_start_secrets(
  booking_id uuid primary key references public.bookings(id) on delete cascade,
  code text not null, expires_at timestamptz not null, attempts integer not null default 0,
  consumed_at timestamptz
);
alter table private.booking_start_secrets enable row level security;
revoke all on private.booking_start_secrets from public,anon,authenticated;
insert into private.booking_start_secrets(booking_id,code,expires_at)
  select id,lpad(((('x'||substr(replace(gen_random_uuid()::text,'-',''),1,6))::bit(24)::integer)%1000000)::text,6,'0'),end_time from public.bookings where tour_otp is not null;
update public.bookings set tour_otp=null where tour_otp is not null;
alter table public.bookings add constraint shared_otp_is_empty check(tour_otp is null);

create function private.get_tour_start_code(p_booking_id uuid) returns text
language sql stable security definer set search_path = '' as $$
 select s.code from private.booking_start_secrets s join public.bookings b on b.id=s.booking_id
 where b.id=p_booking_id and b.tourist_id=auth.uid() and private.active_role()='tourist'
 and b.status='confirmed' and s.consumed_at is null and s.expires_at>now() and s.attempts<5
$$;
create function public.get_tour_start_code(p_booking_id uuid) returns text
language sql stable security invoker set search_path = '' as $$ select private.get_tour_start_code(p_booking_id) $$;
revoke all on function private.get_tour_start_code(uuid),public.get_tour_start_code(uuid) from public,anon;
grant execute on function private.get_tour_start_code(uuid),public.get_tour_start_code(uuid) to authenticated;

create function private.start_tour(p_booking_id uuid,p_otp text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare secret private.booking_start_secrets%rowtype;
begin
 if private.active_role() is distinct from 'guide'::public.account_role then return false; end if;
 perform 1 from public.bookings where id=p_booking_id and guide_id=auth.uid() and status='confirmed' for update;
 if not found then return false; end if;
 select * into secret from private.booking_start_secrets where booking_id=p_booking_id for update;
 if not found or secret.consumed_at is not null or secret.expires_at<=now() or secret.attempts>=5 then return false; end if;
 update private.booking_start_secrets set attempts=attempts+1 where booking_id=p_booking_id;
 if p_otp is distinct from secret.code then return false; end if;
 update private.booking_start_secrets set consumed_at=now() where booking_id=p_booking_id;
 update public.bookings set status='in_progress',actual_start_time=now(),updated_at=now() where id=p_booking_id;
 return true;
end $$;
create or replace function public.start_tour(p_booking_id uuid,p_otp text) returns boolean
language sql security invoker set search_path = '' as $$ select private.start_tour(p_booking_id,p_otp) $$;
create function private.end_tour(p_booking_id uuid) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
 if private.active_role() is distinct from 'guide'::public.account_role then return false; end if;
 update public.bookings set status='completed',actual_end_time=now(),updated_at=now()
 where id=p_booking_id and guide_id=auth.uid() and status='in_progress';
 if not found then return false; end if;
 update public.guide_earnings set available_at=now()+interval '24 hours' where booking_id=p_booking_id and status='pending';
 return true;
end $$;
create or replace function public.end_tour(p_booking_id uuid) returns boolean
language sql security invoker set search_path = '' as $$ select private.end_tour(p_booking_id) $$;
revoke all on function public.start_tour(uuid,text),private.start_tour(uuid,text),public.end_tour(uuid),private.end_tour(uuid) from public,anon;
grant execute on function public.start_tour(uuid,text),private.start_tour(uuid,text),public.end_tour(uuid),private.end_tour(uuid) to authenticated;

-- Only trusted writers can create notifications. Reads remain scoped by RLS.
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='notifications') then
  alter publication supabase_realtime add table public.notifications;
 end if;
end $$;
commit;
