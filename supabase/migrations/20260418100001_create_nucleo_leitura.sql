create table if not exists public.progresso_leitura (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  book_id text not null references public.livros(id) on delete cascade,
  status text not null default 'reading' check (status in ('reading', 'finished', 'abandoned')),
  epub_location text null,
  current_page integer null,
  estimated_pages integer null,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  started_at timestamptz not null default now(),
  last_opened_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  finished_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_progress_user_id_book_id_key unique (user_id, book_id)
);

create index if not exists reading_progress_user_id_idx on public.progresso_leitura(user_id);
create index if not exists reading_progress_book_id_idx on public.progresso_leitura(book_id);
create index if not exists reading_progress_status_idx on public.progresso_leitura(status);

create trigger reading_progress_set_updated_at
before update on public.progresso_leitura
for each row execute function public.set_updated_at();

create table if not exists public.sessoes_leitura (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  book_id text not null references public.livros(id) on delete cascade,
  session_date date not null default current_date,
  start_location text null,
  end_location text null,
  start_page integer null,
  end_page integer null,
  pages_delta integer not null default 0,
  minutes_spent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reading_sessions_user_id_idx on public.sessoes_leitura(user_id);
create index if not exists reading_sessions_book_id_idx on public.sessoes_leitura(book_id);
create index if not exists reading_sessions_session_date_idx on public.sessoes_leitura(session_date);
create index if not exists reading_sessions_user_id_session_date_idx on public.sessoes_leitura(user_id, session_date);

create trigger reading_sessions_set_updated_at
before update on public.sessoes_leitura
for each row execute function public.set_updated_at();

alter table public.progresso_leitura enable row level security;
alter table public.sessoes_leitura enable row level security;

create policy "Users can read own reading progress"
  on public.progresso_leitura for select
  using (auth.uid() = user_id);

create policy "Users can insert own reading progress"
  on public.progresso_leitura for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reading progress"
  on public.progresso_leitura for update
  using (auth.uid() = user_id);

create policy "Users can delete own reading progress"
  on public.progresso_leitura for delete
  using (auth.uid() = user_id);

create policy "Users can read own reading sessions"
  on public.sessoes_leitura for select
  using (auth.uid() = user_id);

create policy "Users can insert own reading sessions"
  on public.sessoes_leitura for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reading sessions"
  on public.sessoes_leitura for update
  using (auth.uid() = user_id);

create policy "Users can delete own reading sessions"
  on public.sessoes_leitura for delete
  using (auth.uid() = user_id);



