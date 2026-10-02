begin;

create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null unique references public.bookings(id) on delete cascade,
    tourist_id uuid not null references public.profiles(id) on delete cascade,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    rating int not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews" on public.reviews
    for select to authenticated
    using (true);

create policy "Tourists can insert review for their booking" on public.reviews
    for insert to authenticated
    with check (
        tourist_id = (select auth.uid()) and
        exists (
            select 1 from public.bookings b 
            where b.id = booking_id 
            and b.tourist_id = (select auth.uid())
            and b.status = 'completed'
        )
    );

create table if not exists public.complaints (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null unique references public.bookings(id) on delete cascade,
    tourist_id uuid not null references public.profiles(id) on delete cascade,
    guide_id uuid not null references public.profiles(id) on delete cascade,
    reason text not null check (char_length(trim(reason)) > 0),
    status text not null default 'pending',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.complaints enable row level security;

create policy "Admins can read complaints" on public.complaints
    for select to authenticated
    using ( (select private.active_role()) = 'admin' );

create policy "Participants can read their own complaints" on public.complaints
    for select to authenticated
    using ( tourist_id = (select auth.uid()) or guide_id = (select auth.uid()) );

create policy "Tourists can insert complaints" on public.complaints
    for insert to authenticated
    with check (
        tourist_id = (select auth.uid()) and
        exists (
            select 1 from public.bookings b 
            where b.id = booking_id 
            and b.tourist_id = (select auth.uid())
            and b.status in ('in_progress', 'completed')
        )
    );

commit;
