create or replace function public.get_user_count()
returns bigint
language sql
stable
security definer
as $$
  select count(*) from public.usuarios;
$$;

grant execute on function public.get_user_count() to anon, authenticated;
