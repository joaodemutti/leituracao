-- Promote an existing auth user to admin for catalog management.
-- Replace the email with the target account and ask the user to sign out/in again.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'admin@example.com';

-- Optional check
select id, email, raw_app_meta_data
from auth.users
where email = 'admin@example.com';
