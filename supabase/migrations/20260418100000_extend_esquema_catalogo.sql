create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.categorias (
  id text primary key,
  route text not null unique,
  label text not null,
  description text not null,
  emoji text,
  color text,
  bg_color text,
  eyebrow_class text,
  badge_class text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger categories_set_updated_at
before update on public.categorias
for each row execute function public.set_updated_at();

create table if not exists public.filtros_categoria (
  id uuid primary key default gen_random_uuid(),
  category_id text not null references public.categorias(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint category_filters_category_id_label_key unique (category_id, label)
);

create trigger category_filters_set_updated_at
before update on public.filtros_categoria
for each row execute function public.set_updated_at();

create table if not exists public.livros (
  id text primary key,
  category_id text not null references public.categorias(id) on delete cascade,
  filter_id uuid null references public.filtros_categoria(id) on delete set null,
  title text not null,
  author text not null,
  summary text not null,
  cover_url text null,
  cover_emoji text null,
  badge text null,
  file_size_label text null,
  external_url text null,
  pdf_url text null,
  epub_url text null,
  is_free boolean not null default true,
  is_featured boolean not null default false,
  featured_rank integer null,
  estimated_pages integer null,
  is_active boolean not null default true,
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(author, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(summary, '')), 'C')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists books_category_id_idx on public.livros(category_id);
create index if not exists books_filter_id_idx on public.livros(filter_id);
create index if not exists books_is_featured_idx on public.livros(is_featured, featured_rank);
create index if not exists books_search_document_idx on public.livros using gin(search_document);

create trigger books_set_updated_at
before update on public.livros
for each row execute function public.set_updated_at();

alter table public.categorias enable row level security;
alter table public.filtros_categoria enable row level security;
alter table public.livros enable row level security;

create policy "Public can read categories"
  on public.categorias for select
  using (true);

create policy "Public can read category filters"
  on public.filtros_categoria for select
  using (true);

create policy "Public can read books"
  on public.livros for select
  using (true);





