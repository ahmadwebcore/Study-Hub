-- ==============================================================================
-- Migration: 20261112000001_initial_schema.sql
-- Description: Core Database Schema for StudyHub LMS
-- Author: Senior Supabase Architect
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Custom Types & ENUMs
create type user_role as enum ('teacher', 'student');
create type assignment_status as enum ('pending', 'submitted', 'graded', 'overdue');
create type assignment_priority as enum ('low', 'medium', 'high');
create type submission_status as enum ('submitted', 'under-review', 'graded');
create type test_type as enum ('Quiz', 'Unit Assessment', 'Midterm Exam', 'Mock Exam');
create type test_status as enum ('scheduled', 'ongoing', 'graded');
create type study_session_type as enum ('Lecture', 'Practice Lab', 'Revision', 'Self Study');

-- 2. Profiles Table
-- Inherits from auth.users.id
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  avatar_url text,
  phone text,
  institution text default 'StudyHub Academic Center',
  title text, -- e.g. "Senior Academic Lead" or "Grade 11 Scholar"
  
  -- Student Academic Details (Specified in requirement 4)
  academic_class text default 'Grade 11',
  course text default 'Advanced STEM',
  board text default 'CBSE / IB / Cambridge',
  academic_session text default '2026-2027',
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for role lookup & email queries
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_email on public.profiles(email);

-- 3. Student Invitations Table (Invitation-based onboarding)
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role user_role not null default 'student',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  
  -- Pre-assigned student academic details
  academic_class text default 'Grade 11',
  course text default 'Advanced STEM',
  board text default 'CBSE / IB / Cambridge',
  academic_session text default '2026-2027',
  
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index idx_invitations_token on public.invitations(token);
create index idx_invitations_email on public.invitations(email);

-- 4. Subjects Table
create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  teacher_id uuid references public.profiles(id) on delete set null,
  accent_color text not null default '#14B866',
  total_modules int not null default 12 check (total_modules > 0),
  category text not null default 'STEM',
  schedule_days text[] not null default array['Mon', 'Wed', 'Fri'],
  next_class_time text default 'TBD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subjects_code on public.subjects(code);

-- 5. Syllabus Units Table
create table public.syllabus_units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unit_number int not null check (unit_number > 0),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  unique (subject_id, unit_number)
);

create index idx_syllabus_units_subject on public.syllabus_units(subject_id);

-- 6. Syllabus Topics Table
create table public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.syllabus_units(id) on delete cascade,
  title text not null,
  estimated_hours numeric not null default 4 check (estimated_hours > 0),
  notes_content text,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_syllabus_topics_unit on public.syllabus_topics(unit_id);

-- 7. Study Planner Schedules Table
create table public.study_schedules (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid references public.subjects(id) on delete set null,
  subject_name text not null,
  subject_code text not null,
  title text not null,
  day text not null,
  start_time text not null,
  end_time text not null,
  type study_session_type not null default 'Lecture',
  room_or_link text not null,
  status text not null default 'upcoming',
  created_by uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index idx_study_schedules_day on public.study_schedules(day);

-- 8. Assignments Table
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text not null,
  total_marks int not null default 50 check (total_marks > 0),
  due_date timestamptz not null,
  priority assignment_priority not null default 'medium',
  file_attachment_url text,
  file_attachment_name text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_assignments_subject on public.assignments(subject_id);
create index idx_assignments_due_date on public.assignments(due_date);

-- 9. Submissions Table
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  file_url text not null,
  file_name text not null,
  file_size text,
  comment text,
  status submission_status not null default 'submitted',
  score numeric check (score >= 0),
  feedback text,
  graded_at timestamptz,
  graded_by uuid references public.profiles(id) on delete set null,
  unique (assignment_id, student_id)
);

create index idx_submissions_assignment on public.submissions(assignment_id);
create index idx_submissions_student on public.submissions(student_id);

-- 10. Tests & Quizzes Table
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  date date not null,
  time text not null,
  duration_minutes int not null default 60 check (duration_minutes > 0),
  total_marks int not null default 100 check (total_marks > 0),
  type test_type not null default 'Unit Assessment',
  syllabus_coverage text not null,
  status test_status not null default 'scheduled',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tests_subject on public.tests(subject_id);
create index idx_tests_date on public.tests(date);

-- 11. Results Table
create table public.results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null check (score >= 0),
  max_score numeric not null check (max_score > 0),
  grade text not null,
  rank text,
  feedback text,
  created_at timestamptz not null default now(),
  unique (test_id, student_id)
);

create index idx_results_test on public.results(test_id);
create index idx_results_student on public.results(student_id);

-- 12. Timestamp Update Trigger Function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_subjects_updated_at before update on public.subjects
  for each row execute function public.handle_updated_at();

create trigger set_assignments_updated_at before update on public.assignments
  for each row execute function public.handle_updated_at();

create trigger set_tests_updated_at before update on public.tests
  for each row execute function public.handle_updated_at();
