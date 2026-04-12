-- ============================================================
--  GAMIFICATION SETUP — LeiturAção
--  Execute este script no SQL Editor do seu painel Supabase:
--  painel → SQL Editor → New query → cole e clique em Run
-- ============================================================

-- 1. Tabela de progresso de leitura por livro
create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  current_page int default 0,
  total_pages int not null,
  completion_percentage int default 0,
  started_at timestamptz default now(),
  last_read_at timestamptz default now(),
  finished_at timestamptz,
  status text default 'reading', -- 'reading', 'finished', 'abandoned'
  created_at timestamptz default now(),
  unique(user_id, book_id)
);

-- 2. Tabela de estatísticas do usuário
create table if not exists public.user_stats (
  id uuid primary key references auth.users(id) on delete cascade,
  total_books_read int default 0,
  total_pages_read int default 0,
  total_reading_hours int default 0,
  current_streak int default 0,
  best_streak int default 0,
  badges text[] default '{}',
  xp_points int default 0,
  level int default 1,
  updated_at timestamptz default now()
);

-- 3. Tabela de leitura diária (para análises)
create table if not exists public.daily_reading (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  pages_read int default 0,
  minutes_spent int default 0,
  read_date date default current_date,
  created_at timestamptz default now(),
  unique(user_id, book_id, read_date)
);

-- ======= ATIVA ROW LEVEL SECURITY (RLS) =======

-- Segurança para reading_progress
alter table public.reading_progress enable row level security;

create policy "Usuário vê apenas próprio progresso"
  on public.reading_progress
  for select
  using (auth.uid() = user_id);

create policy "Usuário insere apenas próprio progresso"
  on public.reading_progress
  for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza apenas próprio progresso"
  on public.reading_progress
  for update
  using (auth.uid() = user_id);

-- Segurança para user_stats
alter table public.user_stats enable row level security;

create policy "Usuário vê apenas próprias estatísticas"
  on public.user_stats
  for select
  using (auth.uid() = id);

create policy "Usuário insere apenas próprias estatísticas"
  on public.user_stats
  for insert
  with check (auth.uid() = id);

create policy "Usuário atualiza apenas próprias estatísticas"
  on public.user_stats
  for update
  using (auth.uid() = id);

-- Segurança para daily_reading
alter table public.daily_reading enable row level security;

create policy "Usuário vê apenas própria leitura diária"
  on public.daily_reading
  for select
  using (auth.uid() = user_id);

create policy "Usuário insere apenas própria leitura diária"
  on public.daily_reading
  for insert
  with check (auth.uid() = user_id);

create policy "Usuário atualiza apenas própria leitura diária"
  on public.daily_reading
  for update
  using (auth.uid() = user_id);

-- ======= ÍNDICES PARA PERFORMANCE =======

create index if not exists idx_reading_progress_user_id on public.reading_progress(user_id);
create index if not exists idx_reading_progress_book_id on public.reading_progress(book_id);
create index if not exists idx_daily_reading_user_id on public.daily_reading(user_id);
create index if not exists idx_daily_reading_read_date on public.daily_reading(read_date);

-- ============================================================
--  Pronto! Agora abra o arquivo services/ReadingService.js
-- ============================================================
