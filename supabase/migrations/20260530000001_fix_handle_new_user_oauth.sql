-- Fix handle_new_user trigger to support OAuth providers (e.g. Google).
-- OAuth logins don't send custom metadata (name/username), so we fall back to
-- the provider's full_name and auto-generate a username from the email prefix.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_username text;
  v_base_username text;
  v_counter int := 0;
begin
  -- Try explicit metadata first (email/password signup sends these)
  v_name     := nullif(trim(new.raw_user_meta_data->>'name'), '');
  v_username := lower(nullif(trim(new.raw_user_meta_data->>'username'), ''));

  -- Fall back to Google/OAuth provider fields
  if v_name is null then
    v_name := nullif(trim(new.raw_user_meta_data->>'full_name'), '');
  end if;

  if v_name is null then
    raise exception 'Missing name in user metadata';
  end if;

  -- Auto-generate username from email prefix when not supplied (OAuth users)
  if v_username is null then
    v_base_username := lower(regexp_replace(
      split_part(new.email, '@', 1),
      '[^a-z0-9_]', '', 'g'
    ));

    if v_base_username = '' then
      v_base_username := 'user';
    end if;

    v_username := v_base_username;

    -- Append a counter until the username is unique
    while exists (select 1 from public.usuarios where username = v_username) loop
      v_counter := v_counter + 1;
      v_username := v_base_username || v_counter::text;
    end loop;
  end if;

  if v_username ~ '\s' then
    raise exception 'Username cannot contain spaces';
  end if;

  insert into public.usuarios (id, name, username, email)
  values (
    new.id,
    v_name,
    v_username,
    new.email
  );

  insert into public.estatisticas_usuario (user_id)
  values (new.id);

  return new;
end;
$$;
