create table if not exists public.quiz_sets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text null,
  source_book_id text null references public.livros(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_set_id uuid not null references public.quiz_sets(id) on delete cascade,
  prompt text not null,
  explanation text null,
  question_order integer not null,
  time_limit_seconds integer not null default 28 check (time_limit_seconds > 0),
  xp_reward integer not null default 50 check (xp_reward >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_questions_quiz_set_id_order_key unique (quiz_set_id, question_order)
);

create table if not exists public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  option_text text not null,
  option_order integer not null,
  is_correct boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quiz_options_question_id_order_key unique (question_id, option_order)
);

create unique index if not exists quiz_options_single_correct_idx
  on public.quiz_options(question_id)
  where is_correct;

create index if not exists quiz_sets_source_book_id_idx on public.quiz_sets(source_book_id);
create index if not exists quiz_questions_quiz_set_id_idx on public.quiz_questions(quiz_set_id);
create index if not exists quiz_options_question_id_idx on public.quiz_options(question_id);

drop trigger if exists quiz_sets_set_updated_at on public.quiz_sets;
create trigger quiz_sets_set_updated_at
before update on public.quiz_sets
for each row execute function public.set_updated_at();

drop trigger if exists quiz_questions_set_updated_at on public.quiz_questions;
create trigger quiz_questions_set_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

drop trigger if exists quiz_options_set_updated_at on public.quiz_options;
create trigger quiz_options_set_updated_at
before update on public.quiz_options
for each row execute function public.set_updated_at();

alter table public.quiz_sets enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;

drop policy if exists "Public can read quiz sets" on public.quiz_sets;
create policy "Public can read quiz sets"
  on public.quiz_sets for select
  using (is_active = true);

drop policy if exists "Public can read quiz questions" on public.quiz_questions;
create policy "Public can read quiz questions"
  on public.quiz_questions for select
  using (
    exists (
      select 1
      from public.quiz_sets qs
      where qs.id = quiz_set_id
        and qs.is_active = true
    )
  );

drop policy if exists "Public can read quiz options" on public.quiz_options;
create policy "Public can read quiz options"
  on public.quiz_options for select
  using (
    exists (
      select 1
      from public.quiz_questions qq
      join public.quiz_sets qs on qs.id = qq.quiz_set_id
      where qq.id = question_id
        and qs.is_active = true
    )
  );

drop policy if exists "Admins can insert quiz sets" on public.quiz_sets;
create policy "Admins can insert quiz sets"
  on public.quiz_sets for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update quiz sets" on public.quiz_sets;
create policy "Admins can update quiz sets"
  on public.quiz_sets for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete quiz sets" on public.quiz_sets;
create policy "Admins can delete quiz sets"
  on public.quiz_sets for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert quiz questions" on public.quiz_questions;
create policy "Admins can insert quiz questions"
  on public.quiz_questions for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update quiz questions" on public.quiz_questions;
create policy "Admins can update quiz questions"
  on public.quiz_questions for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete quiz questions" on public.quiz_questions;
create policy "Admins can delete quiz questions"
  on public.quiz_questions for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can insert quiz options" on public.quiz_options;
create policy "Admins can insert quiz options"
  on public.quiz_options for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update quiz options" on public.quiz_options;
create policy "Admins can update quiz options"
  on public.quiz_options for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete quiz options" on public.quiz_options;
create policy "Admins can delete quiz options"
  on public.quiz_options for delete
  to authenticated
  using ((select public.is_admin()));

insert into public.quiz_sets (id, slug, title, description, source_book_id, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'dom-casmurro-basico',
  'Dom Casmurro',
  'Perguntas autorais sobre o romance de Machado de Assis.',
  'L2',
  true
)
on conflict (id) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  source_book_id = excluded.source_book_id,
  is_active = excluded.is_active;

insert into public.quiz_questions (id, quiz_set_id, prompt, explanation, question_order, time_limit_seconds, xp_reward)
values
  (
    '11111111-1111-1111-1111-111111111201',
    '11111111-1111-1111-1111-111111111111',
    'Qual e o verdadeiro nome do protagonista de Dom Casmurro e por que ele recebe esse apelido?',
    'O narrador e Bento Santiago. O apelido "Dom Casmurro" surge depois que um jovem do trem o chama assim por causa do seu jeito fechado e silencioso.',
    1,
    28,
    50
  ),
  (
    '11111111-1111-1111-1111-111111111202',
    '11111111-1111-1111-1111-111111111111',
    'Quem e Capitu na vida de Bentinho?',
    'Capitu e amiga de infancia, vizinha e grande amor de Bentinho, ocupando o centro afetivo do romance.',
    2,
    28,
    50
  ),
  (
    '11111111-1111-1111-1111-111111111203',
    '11111111-1111-1111-1111-111111111111',
    'Qual promessa feita por Dona Gloria influencia o destino do filho?',
    'Dona Gloria promete entregar Bentinho ao seminario caso ele sobreviva, e essa promessa marca boa parte do conflito inicial do livro.',
    3,
    28,
    50
  ),
  (
    '11111111-1111-1111-1111-111111111204',
    '11111111-1111-1111-1111-111111111111',
    'Quem e Escobar no romance?',
    'Escobar e o melhor amigo de Bentinho no seminario e depois se torna figura central na tensao do casal.',
    4,
    28,
    50
  ),
  (
    '11111111-1111-1111-1111-111111111205',
    '11111111-1111-1111-1111-111111111111',
    'Qual caracteristica do romance sustenta ate hoje o debate sobre Capitu?',
    'A narrativa em primeira pessoa por Bentinho cria ambiguidade e torna a suspeita sobre Capitu impossivel de confirmar com certeza.',
    5,
    28,
    50
  )
on conflict (id) do update
set
  quiz_set_id = excluded.quiz_set_id,
  prompt = excluded.prompt,
  explanation = excluded.explanation,
  question_order = excluded.question_order,
  time_limit_seconds = excluded.time_limit_seconds,
  xp_reward = excluded.xp_reward;

insert into public.quiz_options (id, question_id, option_text, option_order, is_correct)
values
  ('11111111-1111-1111-1111-111111111301', '11111111-1111-1111-1111-111111111201', 'Bentinho Santiago, chamado de "Dom Casmurro" por um jovem no trem por seu jeito calado e fechado.', 1, true),
  ('11111111-1111-1111-1111-111111111302', '11111111-1111-1111-1111-111111111201', 'Bentinho, apelidado assim por Capitu em sinal de carinho na adolescencia.', 2, false),
  ('11111111-1111-1111-1111-111111111303', '11111111-1111-1111-1111-111111111201', 'Santiago Bento, nome herdado do pai e abreviado pelos colegas do seminario.', 3, false),
  ('11111111-1111-1111-1111-111111111304', '11111111-1111-1111-1111-111111111201', 'Dom Bento Casmurro, nome escolhido por ele ao publicar suas memorias.', 4, false),

  ('11111111-1111-1111-1111-111111111305', '11111111-1111-1111-1111-111111111202', 'Sua vizinha, amiga de infancia e depois esposa.', 1, true),
  ('11111111-1111-1111-1111-111111111306', '11111111-1111-1111-1111-111111111202', 'A prima distante que conhece no seminario.', 2, false),
  ('11111111-1111-1111-1111-111111111307', '11111111-1111-1111-1111-111111111202', 'A governanta da casa de Dona Gloria.', 3, false),
  ('11111111-1111-1111-1111-111111111308', '11111111-1111-1111-1111-111111111202', 'A irma de Escobar, com quem Bentinho quase se casa.', 4, false),

  ('11111111-1111-1111-1111-111111111309', '11111111-1111-1111-1111-111111111203', 'Entregar Bentinho ao seminario para a vida religiosa.', 1, true),
  ('11111111-1111-1111-1111-111111111310', '11111111-1111-1111-1111-111111111203', 'Casar Bentinho com uma herdeira da familia.', 2, false),
  ('11111111-1111-1111-1111-111111111311', '11111111-1111-1111-1111-111111111203', 'Enviar Bentinho para estudar em Coimbra.', 3, false),
  ('11111111-1111-1111-1111-111111111312', '11111111-1111-1111-1111-111111111203', 'Fazer Bentinho assumir os negocios do pai.', 4, false),

  ('11111111-1111-1111-1111-111111111313', '11111111-1111-1111-1111-111111111204', 'O melhor amigo de Bentinho e colega do seminario.', 1, true),
  ('11111111-1111-1111-1111-111111111314', '11111111-1111-1111-1111-111111111204', 'O advogado da familia Santiago.', 2, false),
  ('11111111-1111-1111-1111-111111111315', '11111111-1111-1111-1111-111111111204', 'O padre que tenta afastar Bentinho de Capitu.', 3, false),
  ('11111111-1111-1111-1111-111111111316', '11111111-1111-1111-1111-111111111204', 'O primo de Capitu que retorna da Europa.', 4, false),

  ('11111111-1111-1111-1111-111111111317', '11111111-1111-1111-1111-111111111205', 'A ambiguidade da narracao em primeira pessoa de Bentinho.', 1, true),
  ('11111111-1111-1111-1111-111111111318', '11111111-1111-1111-1111-111111111205', 'Uma carta final de Capitu confessando tudo.', 2, false),
  ('11111111-1111-1111-1111-111111111319', '11111111-1111-1111-1111-111111111205', 'Um julgamento formal narrado no ultimo capitulo.', 3, false),
  ('11111111-1111-1111-1111-111111111320', '11111111-1111-1111-1111-111111111205', 'Um diario secreto de Escobar encontrado por Ezequiel.', 4, false)
on conflict (id) do update
set
  question_id = excluded.question_id,
  option_text = excluded.option_text,
  option_order = excluded.option_order,
  is_correct = excluded.is_correct;
