begin;
-- Existing bookings are never silently converted. Only future bookings are demos.
alter table public.bookings add column is_demo boolean not null default false;
alter table public.bookings alter column is_demo set default true;
comment on column public.bookings.is_demo is 'Academic simulation only. Never proof of real payment.';
create table public.demo_payments (
 booking_id uuid primary key references public.bookings(id) on delete cascade,
 outcome text not null check(outcome in ('success','failed','cancelled','refunded')),
 amount numeric not null, platform_fee numeric not null, guide_amount numeric not null,
 attempts integer not null default 1, updated_at timestamptz not null default now()
);
alter table public.demo_payments enable row level security;
revoke all on public.demo_payments from public, anon, authenticated;
grant select on public.demo_payments to authenticated;
create policy demo_participants_read on public.demo_payments for select to authenticated using (
 exists(select 1 from public.bookings b where b.id=booking_id and (b.tourist_id=(select auth.uid()) or b.guide_id=(select auth.uid())))
);
create function private.simulate_payment(p_booking_id uuid,p_outcome text) returns text
language plpgsql security definer set search_path='' as $$
declare b public.bookings%rowtype; g uuid; prior text; fee numeric; rate integer;
begin
 if private.active_role() is distinct from 'tourist'::public.account_role then raise exception 'not_authorized' using errcode='42501'; end if;
 if p_outcome is null or p_outcome not in ('success','failed','cancelled','refunded') then raise exception 'invalid_outcome'; end if;
 select guide_id into g from public.bookings where id=p_booking_id and tourist_id=auth.uid();
 if g is null then raise exception 'not_authorized' using errcode='42501'; end if;
 -- Match acceptance lock ordering to serialize confirmations and cancellations.
 perform 1 from public.guide_profiles where user_id=g for update;
 select * into b from public.bookings where id=p_booking_id for update;
 if not b.is_demo then raise exception 'not_demo_booking'; end if;
 select outcome into prior from public.demo_payments where booking_id=b.id;
 -- Network retries must not create another payment or rotate the tour code.
 if prior='success' and p_outcome='success' then return prior; end if;
 if prior='refunded' and p_outcome='refunded' then return prior; end if;
 if p_outcome='refunded' then
   if prior is distinct from 'success' or b.status<>'confirmed' or b.start_time<=now() then raise exception 'invalid_transition'; end if;
   update public.demo_payments set outcome='refunded',updated_at=now() where booking_id=b.id;
   update public.bookings set status='cancelled',updated_at=now() where id=b.id;
   delete from private.booking_start_secrets where booking_id=b.id;
 else
   if b.status<>'awaiting_payment' then raise exception 'invalid_transition'; end if;
   if b.payment_expires_at is null or b.payment_expires_at<=now() or b.start_time<=now() then raise exception 'payment_expired'; end if;
   if not exists(select 1 from public.guide_profiles gp join public.profiles p on p.id=gp.user_id where gp.user_id=g and gp.status='approved' and p.account_status='active') then raise exception 'guide_unavailable'; end if;
   select commission_basis_points into rate from public.platform_settings where singleton;
   fee:=round(b.total_price*rate/10000,2);
   insert into public.demo_payments(booking_id,outcome,amount,platform_fee,guide_amount)
    values(b.id,p_outcome,b.total_price,fee,b.total_price-fee)
    on conflict(booking_id) do update set outcome=excluded.outcome,attempts=public.demo_payments.attempts+1,updated_at=now();
   if p_outcome='success' then
     update public.bookings set status='confirmed',updated_at=now() where id=b.id;
     insert into private.booking_start_secrets(booking_id,code,expires_at)
      values(b.id,lpad(((('x'||substr(replace(gen_random_uuid()::text,'-',''),1,6))::bit(24)::integer)%1000000)::text,6,'0'),b.end_time);
   end if;
 end if;
 if p_outcome in ('success','refunded') then
   insert into public.notifications(user_id,title,body,link) values(g,'محاكاة دفع / Simulated payment',p_outcome||' — no real money','/ar/bookings/'||b.id);
 end if;
 return p_outcome;
end $$;
create function public.simulate_payment(p_booking_id uuid,p_outcome text) returns text
language sql security invoker set search_path='' as $$ select private.simulate_payment(p_booking_id,p_outcome) $$;
revoke all on function public.simulate_payment(uuid,text),private.simulate_payment(uuid,text) from public,anon;
grant execute on function public.simulate_payment(uuid,text),private.simulate_payment(uuid,text) to authenticated;
commit;
