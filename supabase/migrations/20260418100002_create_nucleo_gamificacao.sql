create table if not exists public.eventos_gamificacao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  book_id text null references public.livros(id) on delete set null,
  event_type text not null,
  xp_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gamification_events_user_id_idx on public.eventos_gamificacao(user_id);
create index if not exists gamification_events_book_id_idx on public.eventos_gamificacao(book_id);
create index if not exists gamification_events_event_type_idx on public.eventos_gamificacao(event_type);
create index if not exists gamification_events_created_at_idx on public.eventos_gamificacao(created_at desc);
create unique index if not exists gamification_events_book_completed_once_idx
  on public.eventos_gamificacao(user_id, book_id, event_type)
  where book_id is not null and event_type = 'book_completed';

create trigger gamification_events_set_updated_at
before update on public.eventos_gamificacao
for each row execute function public.set_updated_at();

create table if not exists public.estatisticas_usuario (
  user_id uuid primary key references public.usuarios(id) on delete cascade,
  xp_points integer not null default 0,
  level integer not null default 1,
  total_books_read integer not null default 0,
  total_pages_read integer not null default 0,
  total_reading_minutes integer not null default 0,
  current_streak integer not null default 0,
  best_streak integer not null default 0,
  badges text[] not null default '{}'::text[],
  last_activity_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_stats_xp_points_idx on public.estatisticas_usuario(xp_points desc);
create index if not exists user_stats_total_books_read_idx on public.estatisticas_usuario(total_books_read desc);

create trigger user_stats_set_updated_at
before update on public.estatisticas_usuario
for each row execute function public.set_updated_at();

alter table public.eventos_gamificacao enable row level security;
alter table public.estatisticas_usuario enable row level security;

create policy "Users can read own gamification events"
  on public.eventos_gamificacao for select
  using (auth.uid() = user_id);

create policy "Users can insert own gamification events"
  on public.eventos_gamificacao for insert
  with check (auth.uid() = user_id);

create policy "Users can update own gamification events"
  on public.eventos_gamificacao for update
  using (auth.uid() = user_id);

create policy "Users can delete own gamification events"
  on public.eventos_gamificacao for delete
  using (auth.uid() = user_id);

create policy "Users can read own stats"
  on public.estatisticas_usuario for select
  using (auth.uid() = user_id);

create policy "Users can insert own stats"
  on public.estatisticas_usuario for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.estatisticas_usuario for update
  using (auth.uid() = user_id);

create policy "Users can delete own stats"
  on public.estatisticas_usuario for delete
  using (auth.uid() = user_id);



