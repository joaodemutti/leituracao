-- Apaga a tabela antiga e recria corretamente
drop table if exists public.usuarios;

create table public.usuarios (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  username    text not null unique,
  email       text not null unique,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create policy "Usuário lê próprio perfil"
  on public.usuarios for select
  using (auth.uid() = id);

create policy "Usuário insere próprio perfil"
  on public.usuarios for insert
  with check (auth.uid() = id);

create policy "Usuário atualiza próprio perfil"
  on public.usuarios for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and is_admin = (select u.is_admin from public.usuarios u where u.id = auth.uid())
  );

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select coalesce(
    (select is_admin from public.usuarios where id = auth.uid()),
    false
  );
$$;