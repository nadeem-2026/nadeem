begin;

create type public.booking_status as enum (
  'pending',          -- Tourist requested, waiting for guide
  'awaiting_payment', -- Guide accepted, waiting for tourist to pay
  'confirmed',        -- Tourist paid
  'in_progress',      -- Tour has started
  'completed',        -- Tour finished
  'cancelled',        -- Cancelled by either party
  'declined',         -- Guide declined
  'expired'           -- Time elapsed without action
);

-- Required for constraint to prevent double bookings
create extension if not exists btree_gist;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  tourist_id uuid not null references public.profiles(id) on delete restrict,
  guide_id uuid not null references public.profiles(id) on delete restrict,
  
  start_time timestamptz not null,
  end_time timestamptz not null,
  duration_hours int not null check (duration_hours > 0),
  participants int not null check (participants > 0),
  meeting_point text not null check (char_length(meeting_point) > 0 and char_length(meeting_point) <= 500),
  
  status public.booking_status not null default 'pending',
  total_price numeric not null check (total_price >= 0),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Ensures start_time is before end_time
  constraint valid_time_range check (start_time < end_time),
  
  -- Exclude overlapping bookings for the same guide where status is active/confirmed
  constraint no_double_booking exclude using gist (
    guide_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('confirmed', 'in_progress', 'completed'))
);

-- Indexes for performance
create index bookings_tourist_id_idx on public.bookings(tourist_id);
create index bookings_guide_id_idx on public.bookings(guide_id);
create index bookings_status_idx on public.bookings(status);

-- RLS Policies
alter table public.bookings enable row level security;

-- Tourists can read their own bookings
create policy tourist_read_bookings on public.bookings
  for select to authenticated
  using (tourist_id = (select auth.uid()));

-- Guides can read bookings assigned to them
create policy guide_read_bookings on public.bookings
  for select to authenticated
  using (guide_id = (select auth.uid()));

-- Tourists can insert a 'pending' booking for themselves
create policy tourist_insert_booking on public.bookings
  for insert to authenticated
  with check (
    tourist_id = (select auth.uid()) 
    and status = 'pending'
    and (select private.active_role()) = 'tourist'
  );

-- Guides can update bookings assigned to them
create policy guide_update_booking on public.bookings
  for update to authenticated
  using (
    guide_id = (select auth.uid()) 
    and (select private.active_role()) = 'guide'
  )
  with check (
    guide_id = (select auth.uid())
  );

-- Tourists can update their own bookings (e.g. to cancel)
create policy tourist_update_booking on public.bookings
  for update to authenticated
  using (
    tourist_id = (select auth.uid()) 
    and (select private.active_role()) = 'tourist'
  )
  with check (
    tourist_id = (select auth.uid())
  );

commit;
