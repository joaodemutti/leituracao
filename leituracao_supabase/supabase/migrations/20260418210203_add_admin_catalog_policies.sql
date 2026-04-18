create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

drop policy if exists "Admins can insert categories" on public.categorias;
drop policy if exists "Admins can update categories" on public.categorias;
drop policy if exists "Admins can delete categories" on public.categorias;

create policy "Admins can insert categories"
  on public.categorias for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update categories"
  on public.categorias for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete categories"
  on public.categorias for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert category filters" on public.filtros_categoria;
drop policy if exists "Admins can update category filters" on public.filtros_categoria;
drop policy if exists "Admins can delete category filters" on public.filtros_categoria;

create policy "Admins can insert category filters"
  on public.filtros_categoria for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update category filters"
  on public.filtros_categoria for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete category filters"
  on public.filtros_categoria for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert books" on public.livros;
drop policy if exists "Admins can update books" on public.livros;
drop policy if exists "Admins can delete books" on public.livros;

create policy "Admins can insert books"
  on public.livros for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update books"
  on public.livros for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete books"
  on public.livros for delete
  to authenticated
  using ((select public.is_admin()));
