create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_username text;
begin
  -- read metadata sent via signUp(options.data)
  v_name := nullif(trim(new.raw_user_meta_data->>'name'), '');
  v_username := lower(nullif(trim(new.raw_user_meta_data->>'username'), ''));

  -- basic validation (matches your NOT NULL + no spaces requirement)
  if v_name is null then
    raise exception 'Missing name in user metadata';
  end if;

  if v_username is null then
    raise exception 'Missing username in user metadata';
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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();