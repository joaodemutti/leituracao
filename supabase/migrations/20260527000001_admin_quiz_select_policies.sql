drop policy if exists "Admins can read all quiz sets" on public.quiz_sets;
create policy "Admins can read all quiz sets"
  on public.quiz_sets for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can read all quiz questions" on public.quiz_questions;
create policy "Admins can read all quiz questions"
  on public.quiz_questions for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can read all quiz options" on public.quiz_options;
create policy "Admins can read all quiz options"
  on public.quiz_options for select
  to authenticated
  using ((select public.is_admin()));
