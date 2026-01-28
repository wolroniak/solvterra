-- SolvTerra Storage Configuration
-- Run this after schema.sql to set up file storage

-- Create the proof-photos bucket (public read access)
insert into storage.buckets (id, name, public)
values ('proof-photos', 'proof-photos', true)
on conflict (id) do nothing;

-- Create the avatars bucket (public read access)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Authenticated users can upload proof photos
create policy "Authenticated users can upload proof photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'proof-photos');

-- Anyone can read proof photos (public viewing)
create policy "Anyone can read proof photos"
on storage.objects for select
to public
using (bucket_id = 'proof-photos');

-- Authenticated users can upload avatars
create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

-- Anyone can read avatars
create policy "Anyone can read avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');
