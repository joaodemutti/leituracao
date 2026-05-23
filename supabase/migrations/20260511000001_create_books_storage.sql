insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'books',
  'books',
  true,
  104857600,
  array[
    'application/epub+zip',
    'application/pdf',
    'application/octet-stream'
  ]
)
on conflict (id) do nothing;

create policy "Public read books storage"
  on storage.objects for select
  using (bucket_id = 'books');

create policy "Admin upload books storage"
  on storage.objects for insert
  with check (
    bucket_id = 'books'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin update books storage"
  on storage.objects for update
  using (
    bucket_id = 'books'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

create policy "Admin delete books storage"
  on storage.objects for delete
  using (
    bucket_id = 'books'
    and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
