-- ==============================================================================
-- StudyHub LMS — Phase 4: Daily Study Planner & Assignment Management
-- Migration: 20261112000006_phase4_planner_assignments.sql
-- ==============================================================================

-- 1. Create Study Plans Table
create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  teacher_id uuid references public.profiles(id) on delete set null,
  title text not null,
  weekly_goal text,
  daily_target_hours numeric(3,1) not null default 3.0 check (daily_target_hours > 0 and daily_target_hours <= 16),
  start_date date not null default current_date,
  end_date date not null default (current_date + interval '7 days'),
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  teacher_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_study_plans_student on public.study_plans(student_id);
create index if not exists idx_study_plans_status on public.study_plans(status);

-- 2. Create Study Sessions Table
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  unit_id uuid references public.syllabus_units(id) on delete set null,
  topic_id uuid references public.syllabus_topics(id) on delete set null,
  title text not null,
  session_date date not null default current_date,
  start_time text not null default '09:00 AM',
  end_time text not null default '10:30 AM',
  duration_minutes int not null default 90 check (duration_minutes > 0),
  type text not null default 'Self Study' check (type in ('Lecture', 'Practice Lab', 'Revision', 'Self Study', 'Reading', 'Problem Solving')),
  location_or_link text default 'Seminar Hall / Virtual Desk',
  notes text,
  status text not null default 'upcoming' check (status in ('upcoming', 'in_progress', 'completed', 'missed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_study_sessions_student on public.study_sessions(student_id);
create index if not exists idx_study_sessions_date on public.study_sessions(session_date);
create index if not exists idx_study_sessions_subject on public.study_sessions(subject_id);
create index if not exists idx_study_sessions_status on public.study_sessions(status);

-- 3. Extend Assignments Table for Phase 4
do $$ begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='assignment_type') then
    alter table public.assignments add column assignment_type text not null default 'Homework' 
      check (assignment_type in ('Homework', 'Reading Task', 'Written Assignment', 'Short Questions', 'Long Questions', 'Revision Task', 'Practice Exercise'));
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='unit_id') then
    alter table public.assignments add column unit_id uuid references public.syllabus_units(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='topic_id') then
    alter table public.assignments add column topic_id uuid references public.syllabus_topics(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='assigned_to') then
    alter table public.assignments add column assigned_to uuid references public.profiles(id) on delete set null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='submission_instructions') then
    alter table public.assignments add column submission_instructions text;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='assignments' and column_name='allow_resubmission') then
    alter table public.assignments add column allow_resubmission boolean not null default true;
  end if;
end $$;

create index if not exists idx_assignments_assigned_to on public.assignments(assigned_to);
create index if not exists idx_assignments_type on public.assignments(assignment_type);
create index if not exists idx_assignments_unit on public.assignments(unit_id);

-- 4. Enable RLS on Study Plans & Sessions
alter table public.study_plans enable row level security;
alter table public.study_sessions enable row level security;

-- Study Plans Policies
drop policy if exists "Teachers manage all study plans" on public.study_plans;
create policy "Teachers manage all study plans" on public.study_plans
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read own study plans" on public.study_plans;
create policy "Students read own study plans" on public.study_plans
  for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students insert draft study plans" on public.study_plans;
create policy "Students insert draft study plans" on public.study_plans
  for insert to authenticated
  with check (student_id = auth.uid());

-- Study Sessions Policies
drop policy if exists "Teachers manage all study sessions" on public.study_sessions;
create policy "Teachers manage all study sessions" on public.study_sessions
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read assigned study sessions" on public.study_sessions;
create policy "Students read assigned study sessions" on public.study_sessions
  for select to authenticated
  using (student_id = auth.uid() or student_id is null or public.is_teacher());

drop policy if exists "Students insert own study sessions" on public.study_sessions;
create policy "Students insert own study sessions" on public.study_sessions
  for insert to authenticated
  with check (student_id = auth.uid());

drop policy if exists "Students update own session progress" on public.study_sessions;
create policy "Students update own session progress" on public.study_sessions
  for update to authenticated
  using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students delete own study sessions" on public.study_sessions;
create policy "Students delete own study sessions" on public.study_sessions
  for delete to authenticated
  using (student_id = auth.uid() or public.is_teacher());

-- Updated Assignment Read Policy (Student only sees general or specifically assigned)
drop policy if exists "Anyone can read assignments" on public.assignments;
drop policy if exists "Authorized users read assignments" on public.assignments;
create policy "Authorized users read assignments" on public.assignments
  for select to authenticated
  using (assigned_to is null or assigned_to = auth.uid() or public.is_teacher());

-- Submissions Allow Student Resubmission
drop policy if exists "Students update own submissions" on public.submissions;
create policy "Students update own submissions" on public.submissions
  for update to authenticated
  using (student_id = auth.uid() or public.is_teacher());
