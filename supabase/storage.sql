-- SolvTerra Storage Configuration
-- Run this after schema.sql to set up file storage

-- Create the proof-photos bucket (public access for demo)
insert into storage.buckets (id, name, public)
values ('proof-photos', 'proof-photos', true)
on conflict (id) do nothing;

-- Allow anyone to upload files (no RLS for demo)
create policy "Allow public uploads"
on storage.objects for insert
to anon
with check (bucket_id = 'proof-photos');

-- Allow anyone to read files
create policy "Allow public reads"
on storage.objects for select
to anon
using (bucket_id = 'proof-photos');
