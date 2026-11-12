-- ==============================================================================
-- StudyHub LMS — Phase 5: Test Center, Submissions & Teacher Marking
-- Migration: 20261112000007_phase5_test_center_marking.sql
-- ==============================================================================

-- 1. Extend Tests Table
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tests' and column_name='unit_id') then
    alter table public.tests add column unit_id uuid references public.syllabus_units(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tests' and column_name='assigned_to') then
    alter table public.tests add column assigned_to uuid references public.profiles(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tests' and column_name='passing_marks') then
    alter table public.tests add column passing_marks int not null default 40 check (passing_marks > 0);
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='tests' and column_name='instructions') then
    alter table public.tests add column instructions text;
  end if;
end $$;

create index if not exists idx_tests_unit on public.tests(unit_id);
create index if not exists idx_tests_assigned_to on public.tests(assigned_to);

-- 2. Test Questions Table
create table if not exists public.test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  question_text text not null,
  question_type text not null default 'mcq' check (question_type in ('mcq', 'short_answer', 'long_answer', 'file_upload')),
  subject_id uuid references public.subjects(id) on delete set null,
  unit_id uuid references public.syllabus_units(id) on delete set null,
  marks numeric(4,1) not null default 5 check (marks > 0),
  question_order int not null default 1,
  attachment_url text,
  explanation text,
  created_at timestamptz not null default now()
);

create index if not exists idx_test_questions_test on public.test_questions(test_id);
create index if not exists idx_test_questions_order on public.test_questions(test_id, question_order);

-- 3. Test Options (For MCQs)
create table if not exists public.test_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.test_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order int not null default 1
);

create index if not exists idx_test_options_question on public.test_options(question_id);

-- 4. Test Attempts Table
create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'graded', 'timed_out')),
  total_score numeric(5,2),
  percentage numeric(5,2),
  grade text,
  passed boolean,
  feedback text,
  unique (test_id, student_id)
);

create index if not exists idx_test_attempts_test on public.test_attempts(test_id);
create index if not exists idx_test_attempts_student on public.test_attempts(student_id);
create index if not exists idx_test_attempts_status on public.test_attempts(status);

-- 5. Test Answers Table
create table if not exists public.test_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.test_attempts(id) on delete cascade,
  question_id uuid not null references public.test_questions(id) on delete cascade,
  selected_option_id uuid references public.test_options(id) on delete set null,
  text_answer text,
  file_url text,
  is_flagged_for_review boolean not null default false,
  marks_awarded numeric(4,1) check (marks_awarded >= 0),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  unique (attempt_id, question_id)
);

create index if not exists idx_test_answers_attempt on public.test_answers(attempt_id);
create index if not exists idx_test_answers_question on public.test_answers(question_id);

-- 6. Extend Results Table
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='results' and column_name='passing_marks') then
    alter table public.results add column passing_marks numeric(5,2) not null default 40;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='results' and column_name='passed') then
    alter table public.results add column passed boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='results' and column_name='percentage') then
    alter table public.results add column percentage numeric(5,2) not null default 85;
  end if;
end $$;

-- 7. Enable RLS
alter table public.test_questions enable row level security;
alter table public.test_options enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_answers enable row level security;

-- 8. Policies for Questions & Options
drop policy if exists "Teachers manage test questions" on public.test_questions;
create policy "Teachers manage test questions" on public.test_questions
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read test questions" on public.test_questions;
create policy "Students read test questions" on public.test_questions
  for select to authenticated
  using (true);

drop policy if exists "Teachers manage test options" on public.test_options;
create policy "Teachers manage test options" on public.test_options
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read test options" on public.test_options;
create policy "Students read test options" on public.test_options
  for select to authenticated
  using (true);

-- 9. Policies for Test Attempts
drop policy if exists "Teachers manage test attempts" on public.test_attempts;
create policy "Teachers manage test attempts" on public.test_attempts
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read own attempts" on public.test_attempts;
create policy "Students read own attempts" on public.test_attempts
  for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students start own attempts" on public.test_attempts;
create policy "Students start own attempts" on public.test_attempts
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students submit own attempts" on public.test_attempts;
create policy "Students submit own attempts" on public.test_attempts
  for update to authenticated
  using (student_id = auth.uid() or public.is_teacher());

-- 10. Policies for Test Answers
drop policy if exists "Teachers manage test answers" on public.test_answers;
create policy "Teachers manage test answers" on public.test_answers
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read own answers" on public.test_answers;
create policy "Students read own answers" on public.test_answers
  for select to authenticated
  using (
    exists (
      select 1 from public.test_attempts ta
      where ta.id = test_answers.attempt_id
      and (ta.student_id = auth.uid() or public.is_teacher())
    )
  );

drop policy if exists "Students upsert own answers" on public.test_answers;
create policy "Students upsert own answers" on public.test_answers
  for all to authenticated
  using (
    exists (
      select 1 from public.test_attempts ta
      where ta.id = test_answers.attempt_id
      and (ta.student_id = auth.uid() or public.is_teacher())
    )
  );
