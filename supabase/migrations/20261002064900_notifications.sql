begin;

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    title text not null,
    body text not null,
    link text,
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications" on public.notifications
    for select to authenticated
    using ( user_id = (select auth.uid()) );

create policy "Users can update their own notifications" on public.notifications
    for update to authenticated
    using ( user_id = (select auth.uid()) );

create policy "System can insert notifications" on public.notifications
    for insert to authenticated
    with check (true);

commit;
