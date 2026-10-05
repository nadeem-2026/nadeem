-- Update RLS on reviews to allow anon to read them
drop policy if exists "Anyone can read reviews" on public.reviews;

create policy "Anyone can read reviews" on public.reviews
    for select to public
    using (true);
