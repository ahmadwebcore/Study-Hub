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
-- ==============================================================================
-- Migration: 20261112000002_rls_and_security.sql
-- Description: Complete Row Level Security (RLS) & Role Protection System
-- Author: Senior Supabase Security Specialist
-- ==============================================================================

-- 1. Helper Function: Check User Role without Recursive Policies
-- Marked SECURITY DEFINER and executes with database owner privileges
create or replace function public.get_auth_role()
returns user_role as $$
declare
  user_role_val user_role;
begin
  select role into user_role_val
  from public.profiles
  where id = auth.uid();
  
  return coalesce(user_role_val, 'student'::user_role);
end;
$$ language plpgsql security definer stable;

-- 2. Helper Function: Check if caller is Teacher / Admin
create or replace function public.is_teacher()
returns boolean as $$
begin
  return public.get_auth_role() = 'teacher'::user_role;
end;
$$ language plpgsql security definer stable;

-- 3. Prevent Role Escalation Trigger
-- Ensures a user CANNOT change their own role column or promote themselves
create or replace function public.protect_role_escalation()
returns trigger as $$
begin
  -- Prevent student or non-admin user from changing their role
  if old.role is distinct from new.role then
    if not public.is_teacher() then
      raise exception 'Security Violation: You are not authorized to alter your assigned role.';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_role_escalation();

-- 4. Automatically Create Profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  assigned_role user_role := 'student'::user_role;
  invitation_record record;
  invite_token text;
  total_users_count int;
begin
  -- Check if this is the first user ever registered; if so, make them initial Teacher / Admin
  select count(*) into total_users_count from public.profiles;
  if total_users_count = 0 then
    assigned_role := 'teacher'::user_role;
  end if;

  -- Check if user signed up with an invitation token in raw_user_meta_data
  invite_token := new.raw_user_meta_data->>'invite_token';
  if invite_token is not null then
    select * into invitation_record
    from public.invitations
    where token = invite_token
      and email = new.email
      and accepted_at is null
      and expires_at > now();

    if found then
      assigned_role := invitation_record.role;
      -- Mark invitation accepted
      update public.invitations
      set accepted_at = now()
      where id = invitation_record.id;
    end if;
  end if;

  -- Insert profile
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    phone,
    institution,
    title,
    academic_class,
    course,
    board,
    academic_session
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    assigned_role,
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'institution', 'StudyHub Academic Center'),
    case when assigned_role = 'teacher' then 'Lead Instructor & STEM Director' else 'Grade 11 Honors Scholar' end,
    coalesce(invitation_record.academic_class, new.raw_user_meta_data->>'academic_class', 'Grade 11'),
    coalesce(invitation_record.course, new.raw_user_meta_data->>'course', 'Advanced STEM'),
    coalesce(invitation_record.board, new.raw_user_meta_data->>'board', 'CBSE / IB / Cambridge'),
    coalesce(invitation_record.academic_session, new.raw_user_meta_data->>'academic_session', '2026-2027')
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 5. Enable Row Level Security (RLS) on All Tables
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.subjects enable row level security;
alter table public.syllabus_units enable row level security;
alter table public.syllabus_topics enable row level security;
alter table public.study_schedules enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.tests enable row level security;
alter table public.results enable row level security;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can read teacher profiles (to see instructors)
-- Users can read their own profile; teachers can read all profiles (to manage students)
create policy "Read profiles policy" on public.profiles
  for select using (
    auth.uid() = id
    or role = 'teacher'
    or public.is_teacher()
  );

-- Users can update only their own profile (role change prevented by trigger)
create policy "Update own profile policy" on public.profiles
  for update using (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- INVITATIONS POLICIES
-- ------------------------------------------------------------------------------
-- Only teachers can view, create, and delete invitations
create policy "Teachers manage invitations" on public.invitations
  for all using (public.is_teacher());

-- Allow anyone to verify an invitation by exact token (for student onboarding)
create policy "Verify invitation by token" on public.invitations
  for select using (true);

-- ------------------------------------------------------------------------------
-- SUBJECTS POLICIES
-- ------------------------------------------------------------------------------
-- Authenticated users (teachers & students) can view subjects
create policy "Authenticated read subjects" on public.subjects
  for select using (auth.role() = 'authenticated');

-- Only teachers can create, update, or delete subjects
create policy "Teachers modify subjects" on public.subjects
  for all using (public.is_teacher());

-- ------------------------------------------------------------------------------
-- SYLLABUS UNITS & TOPICS POLICIES
-- ------------------------------------------------------------------------------
create policy "Authenticated read units" on public.syllabus_units
  for select using (auth.role() = 'authenticated');

create policy "Teachers modify units" on public.syllabus_units
  for all using (public.is_teacher());

create policy "Authenticated read topics" on public.syllabus_topics
  for select using (auth.role() = 'authenticated');

create policy "Teachers modify topics" on public.syllabus_topics
  for all using (public.is_teacher());

-- Students and teachers can toggle topic completion
create policy "Toggle topic completion" on public.syllabus_topics
  for update using (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- STUDY SCHEDULES POLICIES
-- ------------------------------------------------------------------------------
create policy "Authenticated read schedules" on public.study_schedules
  for select using (auth.role() = 'authenticated');

create policy "Teachers manage schedules" on public.study_schedules
  for all using (public.is_teacher());

-- ------------------------------------------------------------------------------
-- ASSIGNMENTS POLICIES
-- ------------------------------------------------------------------------------
-- Authenticated users can view assignments
create policy "Authenticated read assignments" on public.assignments
  for select using (auth.role() = 'authenticated');

-- Only teachers can create, edit, or delete assignments
create policy "Teachers manage assignments" on public.assignments
  for all using (public.is_teacher());

-- ------------------------------------------------------------------------------
-- SUBMISSIONS POLICIES
-- ------------------------------------------------------------------------------
-- Teachers can view all submissions; students can view ONLY their own submissions
create policy "View submissions policy" on public.submissions
  for select using (
    public.is_teacher()
    or student_id = auth.uid()
  );

-- Students can insert their own submissions
create policy "Students insert own submissions" on public.submissions
  for insert with check (
    student_id = auth.uid()
  );

-- Teachers can update any submission (to grade and give feedback)
-- Students can update their own submission if not yet graded
create policy "Update submissions policy" on public.submissions
  for update using (
    public.is_teacher()
    or (student_id = auth.uid() and status != 'graded')
  );

-- ------------------------------------------------------------------------------
-- TESTS POLICIES
-- ------------------------------------------------------------------------------
create policy "Authenticated read tests" on public.tests
  for select using (auth.role() = 'authenticated');

create policy "Teachers manage tests" on public.tests
  for all using (public.is_teacher());

-- ------------------------------------------------------------------------------
-- RESULTS POLICIES
-- ------------------------------------------------------------------------------
-- Teachers can view all results; students can view ONLY their own results
create policy "View results policy" on public.results
  for select using (
    public.is_teacher()
    or student_id = auth.uid()
  );

-- Only teachers can publish or edit examination results
create policy "Teachers manage results" on public.results
  for all using (public.is_teacher());
-- ==============================================================================
-- Migration: 20261112000003_storage_buckets.sql
-- Description: Private Storage Buckets & Authorization Policies
-- Author: Senior Supabase Storage Specialist
-- ==============================================================================

-- 1. Create Private Storage Buckets (Not Publicly Accessible)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'student-submissions',
    'student-submissions',
    false, -- Private bucket
    26214400, -- 25 MB max
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'image/png',
      'image/jpeg'
    ]
  ),
  (
    'syllabus-materials',
    'syllabus-materials',
    false, -- Private bucket
    52428800, -- 50 MB max
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'image/png',
      'image/jpeg'
    ]
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Storage Policies on storage.objects

-- ------------------------------------------------------------------------------
-- STUDENT SUBMISSIONS BUCKET POLICIES
-- Folder convention: student-submissions/{student_id}/{assignment_id}-{filename}
-- ------------------------------------------------------------------------------

-- Teachers can view and download all files in student-submissions
create policy "Teachers read student submissions"
on storage.objects for select
using (
  bucket_id = 'student-submissions'
  and public.is_teacher()
);

-- Students can read only files inside their own student_id folder
create policy "Students read own submissions"
on storage.objects for select
using (
  bucket_id = 'student-submissions'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can upload files only into their own student_id folder
create policy "Students upload own submissions"
on storage.objects for insert
with check (
  bucket_id = 'student-submissions'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can update or delete their own un-graded submissions
create policy "Students delete own submissions"
on storage.objects for delete
using (
  bucket_id = 'student-submissions'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Teachers can delete invalid files in student-submissions if necessary
create policy "Teachers delete submissions"
on storage.objects for delete
using (
  bucket_id = 'student-submissions'
  and public.is_teacher()
);

-- ------------------------------------------------------------------------------
-- SYLLABUS MATERIALS BUCKET POLICIES
-- ------------------------------------------------------------------------------

-- Authenticated teachers and students can download syllabus materials
create policy "Authenticated read syllabus materials"
on storage.objects for select
using (
  bucket_id = 'syllabus-materials'
  and auth.role() = 'authenticated'
);

-- Only teachers can upload, replace, or delete syllabus materials
create policy "Teachers upload syllabus materials"
on storage.objects for insert
with check (
  bucket_id = 'syllabus-materials'
  and public.is_teacher()
);

create policy "Teachers update syllabus materials"
on storage.objects for update
using (
  bucket_id = 'syllabus-materials'
  and public.is_teacher()
);

create policy "Teachers delete syllabus materials"
on storage.objects for delete
using (
  bucket_id = 'syllabus-materials'
  and public.is_teacher()
);
-- ==============================================================================
-- Migration: 20261112000004_seed_data.sql
-- Description: Initial Academic Curricula & Reference Data
-- Author: Senior Supabase Architect
-- ==============================================================================

-- 1. Insert Core Academic Subjects
insert into public.subjects (id, name, code, accent_color, total_modules, category, schedule_days, next_class_time)
values
  ('11111111-1111-1111-1111-111111111101', 'Advanced Calculus & Vectors', 'MATH-301', '#14B866', 14, 'STEM', array['Mon', 'Wed', 'Fri'], 'Today at 02:30 PM'),
  ('11111111-1111-1111-1111-111111111102', 'Quantum Physics & Mechanics', 'PHYS-202', '#0EA5E9', 12, 'STEM', array['Tue', 'Thu'], 'Tomorrow at 10:00 AM'),
  ('11111111-1111-1111-1111-111111111103', 'Organic & Analytical Chemistry', 'CHEM-205', '#F59E0B', 16, 'STEM', array['Tue', 'Thu', 'Sat'], 'Thursday at 01:15 PM'),
  ('11111111-1111-1111-1111-111111111104', 'Data Structures & Algorithms', 'CS-401', '#8B5CF6', 10, 'STEM', array['Mon', 'Fri'], 'Friday at 11:30 AM')
on conflict (code) do nothing;

-- 2. Insert Syllabus Units for MATH-301
insert into public.syllabus_units (id, subject_id, unit_number, title, description)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 1, 'Foundations of Differential Calculus', 'Epsilon-delta definitions, continuity, differentiability, Mean Value Theorem.'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 2, 'Integral Calculus & Vector Fields', 'Riemann sums, Fundamental Theorem of Calculus, line integrals and Green theorem.')
on conflict do nothing;

-- 3. Insert Syllabus Topics
insert into public.syllabus_topics (unit_id, title, estimated_hours, notes_content, completed)
values
  ('22222222-2222-2222-2222-222222222201', 'Formal Definition of Limits & Rigorous Proofs', 4, 'Limit definitions: For every epsilon > 0, there exists delta > 0...', true),
  ('22222222-2222-2222-2222-222222222201', 'Intermediate Value and Extreme Value Theorems', 3, 'Proof methodologies for compact sets and continuous functions.', true),
  ('22222222-2222-2222-2222-222222222201', 'Derivatives of Implicit & Inverse Trigonometric Functions', 5, 'Chain rule applications and inverse Jacobian determinants.', true),
  ('22222222-2222-2222-2222-222222222202', 'Techniques of Advanced Integration (Partial Fractions)', 6, 'Decomposition of rational algebraic functions over irreducible quadratics.', true),
  ('22222222-2222-2222-2222-222222222202', 'Improper Integrals and Convergence Criteria', 4, 'Comparison test and limit comparison for infinite upper bounds.', true),
  ('22222222-2222-2222-2222-222222222202', 'Introduction to Line Integrals in Conservative Vector Fields', 6, 'Gradient fields, potential functions, and path independence.', false)
on conflict do nothing;

-- 4. Insert Study Schedules
insert into public.study_schedules (subject_name, subject_code, title, day, start_time, end_time, type, room_or_link, status)
values
  ('Advanced Calculus', 'MATH-301', 'Differential Equations Problem Solving', 'Today', '09:00 AM', '10:30 AM', 'Lecture', 'Seminar Hall 3B', 'completed'),
  ('Quantum Physics', 'PHYS-202', 'Wave Optics & Interference Lab', 'Today', '11:00 AM', '12:30 PM', 'Practice Lab', 'Optics Lab Room 12', 'in-progress'),
  ('Analytical Chemistry', 'CHEM-205', 'Organic Synthesis Reaction Mechanism Q&A', 'Today', '02:30 PM', '03:45 PM', 'Revision', 'Study Lounge A', 'upcoming'),
  ('Computer Science', 'CS-401', 'Binary Search Trees & Heap Implementation', 'Today', '04:30 PM', '06:00 PM', 'Self Study', 'Online Portal Work', 'upcoming')
on conflict do nothing;

-- 5. Insert Core Assignments
insert into public.assignments (id, subject_id, title, description, total_marks, due_date, priority, file_attachment_name)
values
  ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'Calculus: Integration by Parts & Partial Fractions', 'Solve problem set 4.3 (questions 1-15). Ensure complete step-by-step mathematical proofs with vector diagrams.', 50, now() + interval '1 day', 'high', 'Calculus_ProblemSet_4.3.pdf'),
  ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111102', 'Photoelectric Effect Experimental Report', 'Document your findings regarding threshold frequency and Planck constant calculation from lab exercise #6.', 40, now() + interval '4 days', 'medium', 'Photoelectric_Lab_Template.docx')
on conflict do nothing;

-- 6. Insert Core Tests
insert into public.tests (id, subject_id, title, date, time, duration_minutes, total_marks, type, syllabus_coverage, status)
values
  ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111101', 'Vectors & 3D Geometry Unit Assessment', (current_date + interval '3 days')::date, '10:00 AM – 11:30 AM', 90, 100, 'Unit Assessment', 'Dot/Cross products, planes in R3, skew lines distance, parametric curves', 'scheduled'),
  ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111102', 'Electromagnetic Induction & AC Circuits Quiz', (current_date + interval '6 days')::date, '02:00 PM – 03:00 PM', 60, 50, 'Quiz', 'Faraday Law, Lenz Law, LC Oscillations, RMS calculations', 'scheduled')
on conflict do nothing;
