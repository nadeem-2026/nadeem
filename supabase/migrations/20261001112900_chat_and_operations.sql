begin;

-- Add tour execution columns to bookings
alter table public.bookings 
add column if not exists tour_otp varchar(6),
add column if not exists actual_start_time timestamptz,
add column if not exists actual_end_time timestamptz;

-- Update webhook to generate OTP when captured
create or replace function public.handle_payment_webhook(
    p_charge_id text,
    p_status text,
    p_receipt_url text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_booking_id uuid;
    v_guide_id uuid;
    v_total_amount numeric;
    v_end_time timestamp with time zone;
    v_otp varchar(6);
begin
    -- Generate 6-digit OTP
    v_otp := lpad(floor(random() * 1000000)::text, 6, '0');

    -- Update payment
    update public.payments
    set status = p_status,
        receipt_url = coalesce(p_receipt_url, receipt_url),
        updated_at = now()
    where charge_id = p_charge_id
    returning booking_id into v_booking_id;

    -- If captured, update booking status to 'confirmed', add OTP, and create earning record
    if p_status = 'captured' and v_booking_id is not null then
        update public.bookings
        set status = 'confirmed',
            tour_otp = v_otp
        where id = v_booking_id
        returning guide_id, total_price, end_time into v_guide_id, v_total_amount, v_end_time;

        -- Create guide earning record (10% platform fee)
        insert into public.guide_earnings (
            guide_id,
            booking_id,
            total_amount,
            platform_fee,
            guide_amount,
            available_at
        ) values (
            v_guide_id,
            v_booking_id,
            v_total_amount,
            v_total_amount * 0.10,
            v_total_amount * 0.90,
            v_end_time + interval '24 hours'
        )
        on conflict (booking_id) do nothing;
    end if;
end;
$$;

-- Create chat messages table
create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    sender_id uuid not null references public.profiles(id) on delete restrict,
    message text not null check (char_length(trim(message)) > 0),
    created_at timestamptz not null default now()
);

-- Index for realtime fetching
create index if not exists chat_messages_booking_id_idx on public.chat_messages(booking_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at);

-- RLS for chat messages
alter table public.chat_messages enable row level security;

-- Only booking participants can read messages
create policy "Booking participants can read chat" on public.chat_messages
    for select to authenticated
    using (
        exists (
            select 1 from public.bookings b 
            where b.id = booking_id 
            and (b.tourist_id = (select auth.uid()) or b.guide_id = (select auth.uid()))
        )
    );

-- Only booking participants can insert messages
create policy "Booking participants can insert chat" on public.chat_messages
    for insert to authenticated
    with check (
        sender_id = (select auth.uid()) and
        exists (
            select 1 from public.bookings b 
            where b.id = booking_id 
            and (b.tourist_id = (select auth.uid()) or b.guide_id = (select auth.uid()))
            and b.status in ('confirmed', 'in_progress') -- Only allow chat when active
        )
    );

-- Enable realtime for chat_messages
alter publication supabase_realtime add table public.chat_messages;

-- Create function for guide to start tour
create or replace function public.start_tour(
    p_booking_id uuid,
    p_otp text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_valid boolean;
begin
    -- Check if booking belongs to guide, status is confirmed, and OTP matches
    update public.bookings
    set status = 'in_progress',
        actual_start_time = now(),
        updated_at = now()
    where id = p_booking_id
      and guide_id = (select auth.uid())
      and status = 'confirmed'
      and tour_otp = p_otp
    returning true into v_valid;

    return coalesce(v_valid, false);
end;
$$;

-- Create function for guide to end tour
create or replace function public.end_tour(
    p_booking_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
    v_valid boolean;
begin
    -- Check if booking belongs to guide and status is in_progress
    update public.bookings
    set status = 'completed',
        actual_end_time = now(),
        updated_at = now()
    where id = p_booking_id
      and guide_id = (select auth.uid())
      and status = 'in_progress'
    returning true into v_valid;

    return coalesce(v_valid, false);
end;
$$;

commit;
