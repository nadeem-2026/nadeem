create table if not exists public.guide_earnings (
    id uuid primary key default gen_random_uuid(),
    guide_id uuid not null references public.profiles(id) on delete cascade,
    booking_id uuid not null references public.bookings(id) on delete cascade,
    total_amount numeric not null,
    platform_fee numeric not null, -- 10%
    guide_amount numeric not null, -- 90%
    status text not null default 'pending', -- pending (before tour finishes), available (after 24h of end_time), paid (payout processed)
    available_at timestamp with time zone not null, -- 24 hours after booking.end_time
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(booking_id)
);

-- Enable RLS
alter table public.guide_earnings enable row level security;

-- Policies for guide_earnings
create policy "Guides can view their own earnings"
    on public.guide_earnings for select
    using (auth.uid() = guide_id);

-- Update the handle_payment_webhook function to also create an earning record when captured
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
begin
    -- Update payment
    update public.payments
    set status = p_status,
        receipt_url = coalesce(p_receipt_url, receipt_url),
        updated_at = now()
    where charge_id = p_charge_id
    returning booking_id into v_booking_id;

    -- If captured, update booking status to 'confirmed' and create earning record
    if p_status = 'captured' and v_booking_id is not null then
        update public.bookings
        set status = 'confirmed'
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
