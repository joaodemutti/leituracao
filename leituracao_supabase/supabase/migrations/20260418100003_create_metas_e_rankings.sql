create table if not exists public.metas_leitura (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.usuarios(id) on delete cascade,
  title text not null,
  goal_type text not null check (goal_type in ('daily', 'weekly', 'monthly', 'annual', 'custom')),
  metric_type text not null check (metric_type in ('books', 'pages', 'minutes', 'streak')),
  target_value integer not null check (target_value > 0),
  period_start date not null,
  period_end date not null,
  reward_xp integer not null default 0,
  status text not null default 'active' check (status in ('active', 'completed', 'expired', 'cancelled')),
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_goals_period_check check (period_end >= period_start)
);

create index if not exists reading_goals_user_id_idx on public.metas_leitura(user_id);
create index if not exists reading_goals_status_idx on public.metas_leitura(status);
create index if not exists reading_goals_period_idx on public.metas_leitura(period_start, period_end);

create trigger reading_goals_set_updated_at
before update on public.metas_leitura
for each row execute function public.set_updated_at();

alter table public.metas_leitura enable row level security;

create policy "Users can read own goals"
  on public.metas_leitura for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.metas_leitura for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.metas_leitura for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.metas_leitura for delete
  using (auth.uid() = user_id);

create or replace view public.progresso_metas
with (security_invoker = true) as
select
  g.id,
  g.user_id,
  g.title,
  g.goal_type,
  g.metric_type,
  g.target_value,
  g.period_start,
  g.period_end,
  g.reward_xp,
  g.status,
  g.completed_at,
  case g.metric_type
    when 'books' then coalesce((
      select count(*)::integer
      from public.progresso_leitura rp
      where rp.user_id = g.user_id
        and rp.status = 'finished'
        and rp.finished_at::date between g.period_start and g.period_end
    ), 0)
    when 'pages' then coalesce((
      select sum(greatest(rs.pages_delta, 0))::integer
      from public.sessoes_leitura rs
      where rs.user_id = g.user_id
        and rs.session_date between g.period_start and g.period_end
    ), 0)
    when 'minutes' then coalesce((
      select sum(greatest(rs.minutes_spent, 0))::integer
      from public.sessoes_leitura rs
      where rs.user_id = g.user_id
        and rs.session_date between g.period_start and g.period_end
    ), 0)
    when 'streak' then coalesce((
      select us.current_streak
      from public.estatisticas_usuario us
      where us.user_id = g.user_id
    ), 0)
    else 0
  end as current_value,
  least(
    100,
    round(
      (
        case g.metric_type
          when 'books' then coalesce((
            select count(*)::numeric
            from public.progresso_leitura rp
            where rp.user_id = g.user_id
              and rp.status = 'finished'
              and rp.finished_at::date between g.period_start and g.period_end
          ), 0)
          when 'pages' then coalesce((
            select sum(greatest(rs.pages_delta, 0))::numeric
            from public.sessoes_leitura rs
            where rs.user_id = g.user_id
              and rs.session_date between g.period_start and g.period_end
          ), 0)
          when 'minutes' then coalesce((
            select sum(greatest(rs.minutes_spent, 0))::numeric
            from public.sessoes_leitura rs
            where rs.user_id = g.user_id
              and rs.session_date between g.period_start and g.period_end
          ), 0)
          when 'streak' then coalesce((
            select us.current_streak::numeric
            from public.estatisticas_usuario us
            where us.user_id = g.user_id
          ), 0)
          else 0
        end / nullif(g.target_value::numeric, 0)
      ) * 100
    )
  )::integer as progress_percentage
from public.metas_leitura g;

create or replace view public.ranking_geral as
select
  us.user_id,
  coalesce(nullif(u.name, ''), u.username) as display_name,
  u.username,
  us.level,
  us.xp_points,
  us.total_books_read,
  rank() over (order by us.xp_points desc, us.total_books_read desc, us.updated_at asc) as rank
from public.estatisticas_usuario us
join public.usuarios u on u.id = us.user_id;

create or replace view public.ranking_semanal as
with weekly_points as (
  select
    ge.user_id,
    sum(ge.xp_delta)::integer as xp_points
  from public.eventos_gamificacao ge
  where ge.created_at >= date_trunc('week', now())
  group by ge.user_id
)
select
  us.user_id,
  coalesce(nullif(u.name, ''), u.username) as display_name,
  u.username,
  us.level,
  coalesce(wp.xp_points, 0) as xp_points,
  us.total_books_read,
  rank() over (order by coalesce(wp.xp_points, 0) desc, us.total_books_read desc, us.updated_at asc) as rank
from public.estatisticas_usuario us
join public.usuarios u on u.id = us.user_id
left join weekly_points wp on wp.user_id = us.user_id;



