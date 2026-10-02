create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    tourist_id uuid not null references public.profiles(id) on delete cascade,
    charge_id text not null, -- ID from Tap Payments
    amount numeric not null,
    currency text not null default 'SAR',
    status text not null default 'initiated', -- initiated, captured, failed, declined
    receipt_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(charge_id),
    unique(booking_id) -- One successful payment per booking
);

-- Enable RLS
alter table public.payments enable row level security;

-- Policies for payments
create policy "Tourists can view their own payments"
    on public.payments for select
    using (auth.uid() = tourist_id);

create policy "Guides can view payments for their bookings"
    on public.payments for select
    using (auth.uid() in (select guide_id from public.bookings where id = payments.booking_id));

-- Function to handle webhook payment status update safely
-- This function will only be callable by the service role
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
begin
    -- Update payment
    update public.payments
    set status = p_status,
        receipt_url = coalesce(p_receipt_url, receipt_url),
        updated_at = now()
    where charge_id = p_charge_id
    returning booking_id into v_booking_id;

    -- If captured, update booking status to 'confirmed'
    if p_status = 'captured' and v_booking_id is not null then
        update public.bookings
        set status = 'confirmed'
        where id = v_booking_id;
    end if;
    
    -- If failed, update booking status to 'cancelled' or let it stay awaiting_payment so they can retry.
    -- We will leave it as awaiting_payment so tourist can retry.
end;
$$;
