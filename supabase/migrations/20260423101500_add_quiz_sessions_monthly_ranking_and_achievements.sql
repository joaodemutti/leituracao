create table if not exists public.sessoes_quiz (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  source_book_id text null references public.livros(id) on delete set null,
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quiz_sessions_user_id_idx on public.sessoes_quiz(user_id);
create index if not exists quiz_sessions_completed_at_idx on public.sessoes_quiz(completed_at desc);

create trigger quiz_sessions_set_updated_at
before update on public.sessoes_quiz
for each row execute function public.set_updated_at();

alter table public.sessoes_quiz enable row level security;

create policy "Users can read own quiz sessions"
  on public.sessoes_quiz for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz sessions"
  on public.sessoes_quiz for insert
  with check (auth.uid() = user_id);

create policy "Users can update own quiz sessions"
  on public.sessoes_quiz for update
  using (auth.uid() = user_id);

create policy "Users can delete own quiz sessions"
  on public.sessoes_quiz for delete
  using (auth.uid() = user_id);

create or replace view public.ranking_mensal as
with monthly_points as (
  select
    ge.user_id,
    sum(ge.xp_delta)::integer as xp_points
  from public.eventos_gamificacao ge
  where ge.created_at >= date_trunc('month', now())
  group by ge.user_id
)
select
  us.user_id,
  coalesce(nullif(u.name, ''), u.username) as display_name,
  u.username,
  us.level,
  coalesce(mp.xp_points, 0) as xp_points,
  us.total_books_read,
  rank() over (order by coalesce(mp.xp_points, 0) desc, us.total_books_read desc, us.updated_at asc) as rank
from public.estatisticas_usuario us
join public.usuarios u on u.id = us.user_id
left join monthly_points mp on mp.user_id = us.user_id;

create or replace view public.conquistas_usuario
with (security_invoker = true) as
with user_quiz_stats as (
  select
    sq.user_id,
    count(*)::integer as quiz_sessions
  from public.sessoes_quiz sq
  group by sq.user_id
),
user_education_books as (
  select
    rp.user_id,
    count(distinct rp.book_id)::integer as education_books
  from public.progresso_leitura rp
  join public.livros l on l.id = rp.book_id
  where rp.status = 'finished'
    and l.category_id = 'educacao'
  group by rp.user_id
)
select
  us.user_id,
  'first_book'::text as achievement_id,
  'Primeiro livro'::text as title,
  'Registrou a primeira leitura completa.'::text as description,
  '📖'::text as icon,
  1::integer as sort_order,
  us.updated_at as earned_at
from public.estatisticas_usuario us
where us.total_books_read >= 1

union all

select
  us.user_id,
  'streak_7',
  'Sequencia 7',
  'Leu por 7 dias seguidos.',
  '🔥',
  2,
  us.updated_at
from public.estatisticas_usuario us
where us.best_streak >= 7

union all

select
  rg.user_id,
  'top_10',
  'Top 10',
  'Entrou no top 10 do ranking geral.',
  '🏆',
  3,
  now()
from public.ranking_geral rg
where rg.rank <= 10

union all

select
  coalesce(uqs.user_id, us.user_id),
  'quiz_master',
  'Quiz Master',
  'Completou 10 quizzes.',
  '🧠',
  4,
  us.updated_at
from public.estatisticas_usuario us
join user_quiz_stats uqs on uqs.user_id = us.user_id
where uqs.quiz_sessions >= 10

union all

select
  coalesce(ueb.user_id, us.user_id),
  'educador',
  'Educador',
  'Concluiu 5 livros da trilha de educacao.',
  '🎓',
  5,
  us.updated_at
from public.estatisticas_usuario us
join user_education_books ueb on ueb.user_id = us.user_id
where ueb.education_books >= 5

union all

select
  us.user_id,
  'mestre',
  'Mestre',
  'Alcancou o nivel 10.',
  '🌟',
  6,
  us.updated_at
from public.estatisticas_usuario us
where us.level >= 10

union all

select
  us.user_id,
  'voraz',
  'Voraz',
  'Concluiu 50 livros.',
  '📚',
  7,
  us.updated_at
from public.estatisticas_usuario us
where us.total_books_read >= 50;
