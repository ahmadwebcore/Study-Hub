-- ==============================================================================
-- StudyHub LMS — Master Database Setup (Phase 2 & Phase 3 Unified)
-- Run this complete script in the Supabase Dashboard SQL Editor (New query -> Run)
-- ==============================================================================

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. Custom Types & ENUMs
do $$ begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('teacher', 'student');
  end if;
  if not exists (select 1 from pg_type where typname = 'assignment_status') then
    create type assignment_status as enum ('pending', 'submitted', 'graded', 'overdue');
  end if;
  if not exists (select 1 from pg_type where typname = 'assignment_priority') then
    create type assignment_priority as enum ('low', 'medium', 'high');
  end if;
  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type submission_status as enum ('submitted', 'under-review', 'graded');
  end if;
  if not exists (select 1 from pg_type where typname = 'test_type') then
    create type test_type as enum ('Quiz', 'Unit Assessment', 'Midterm Exam', 'Mock Exam');
  end if;
  if not exists (select 1 from pg_type where typname = 'test_status') then
    create type test_status as enum ('scheduled', 'ongoing', 'graded');
  end if;
  if not exists (select 1 from pg_type where typname = 'study_session_type') then
    create type study_session_type as enum ('Lecture', 'Practice Lab', 'Revision', 'Self Study');
  end if;
end $$;

-- 3. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  avatar_url text,
  phone text,
  institution text default 'StudyHub Academic Center',
  title text,
  academic_class text default 'Grade 11',
  course text default 'Advanced STEM',
  board text default 'CBSE / IB / Cambridge',
  academic_session text default '2026-2027',
  roll_number text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  enrolled_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_status on public.profiles(status);

-- 4. Invitations Table (Invitation-based onboarding)
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role user_role not null default 'student',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid not null references public.profiles(id) on delete cascade,
  academic_class text default 'Grade 11',
  course text default 'Advanced STEM',
  board text default 'CBSE / IB / Cambridge',
  academic_session text default '2026-2027',
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_invitations_token on public.invitations(token);
create index if not exists idx_invitations_email on public.invitations(email);

-- 5. Subjects Table
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  teacher_id uuid references public.profiles(id) on delete set null,
  accent_color text not null default '#14B866',
  total_modules int not null default 12 check (total_modules > 0),
  category text not null default 'STEM',
  course text not null default 'Advanced STEM',
  academic_session text not null default '2026-2027',
  description text,
  schedule_days text[] not null default array['Mon', 'Wed', 'Fri'],
  next_class_time text default 'TBD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subjects_code on public.subjects(code);
create index if not exists idx_subjects_course on public.subjects(course);

-- 6. Student-Subject Assignments (Many-to-Many)
create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create index if not exists idx_student_subjects_student on public.student_subjects(student_id);
create index if not exists idx_student_subjects_subject on public.student_subjects(subject_id);

-- 7. Digital Book Library
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  category text not null default 'Textbook' check (category in ('Textbook', 'Reference Book', 'Lecture Notes', 'Lab Manual', 'Exam Revision')),
  file_name text not null,
  file_url text not null,
  file_size text,
  file_type text not null default 'pdf',
  version int not null default 1,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_books_subject on public.books(subject_id);
create index if not exists idx_books_category on public.books(category);

-- 8. Syllabus Units (Chapters)
create table if not exists public.syllabus_units (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unit_number int not null check (unit_number > 0),
  title text not null,
  description text,
  sort_order int not null default 1,
  created_at timestamptz not null default now(),
  unique (subject_id, unit_number)
);

create index if not exists idx_syllabus_units_subject on public.syllabus_units(subject_id);

-- 9. Syllabus Topics
create table if not exists public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.syllabus_units(id) on delete cascade,
  title text not null,
  description text,
  estimated_hours numeric(4,1) not null default 4.0,
  notes_content text,
  attachment_name text,
  attachment_url text,
  completed boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_syllabus_topics_unit on public.syllabus_topics(unit_id);

-- 10. Student Dynamic Topic Progress Tracking
create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.syllabus_topics(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);

create index if not exists idx_topic_progress_student on public.topic_progress(student_id);
create index if not exists idx_topic_progress_topic on public.topic_progress(topic_id);

-- 11. Study Schedules
create table if not exists public.study_schedules (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  subject_name text not null,
  subject_code text not null,
  title text not null,
  day text not null default 'Today',
  start_time text not null,
  end_time text not null,
  type study_session_type not null default 'Lecture',
  room_or_link text default 'Seminar Room A',
  status text not null default 'upcoming',
  is_live boolean not null default false,
  created_at timestamptz not null default now()
);

-- 12. Assignments & Submissions
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text not null,
  total_marks int not null default 50 check (total_marks > 0),
  due_date timestamptz not null,
  priority assignment_priority not null default 'medium',
  status assignment_status not null default 'pending',
  file_attachment_name text,
  file_attachment_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size text,
  comment text,
  status submission_status not null default 'submitted',
  score numeric(5,2),
  feedback text,
  graded_by uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

-- 13. Tests & Results
create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  date date not null,
  time text not null,
  duration_minutes int not null default 90 check (duration_minutes > 0),
  total_marks int not null default 100 check (total_marks > 0),
  type test_type not null default 'Unit Assessment',
  syllabus_coverage text not null,
  status test_status not null default 'scheduled',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  score numeric(5,2) not null check (score >= 0),
  max_score numeric(5,2) not null default 100,
  grade text not null default 'A*',
  rank text,
  feedback text,
  created_at timestamptz not null default now(),
  unique (test_id, student_id)
);

-- 14. Functions & Triggers
create or replace function public.get_auth_role()
returns public.user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function public.is_teacher()
returns boolean as $$
  select public.get_auth_role() = 'teacher';
$$ language sql stable security definer;

create or replace function public.protect_role_escalation()
returns trigger as $$
begin
  if new.role <> old.role and not public.is_teacher() then
    raise exception 'Unauthorized: Only faculty administrators can elevate user roles.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_role_escalation on public.profiles;
create trigger tr_protect_role_escalation
  before update on public.profiles
  for each row execute function public.protect_role_escalation();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    avatar_url,
    title,
    academic_class,
    course,
    board,
    academic_session,
    roll_number,
    status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop'),
    new.raw_user_meta_data->>'title',
    coalesce(new.raw_user_meta_data->>'academic_class', 'Grade 11'),
    coalesce(new.raw_user_meta_data->>'course', 'Advanced STEM'),
    coalesce(new.raw_user_meta_data->>'board', 'CBSE / IB / Cambridge'),
    coalesce(new.raw_user_meta_data->>'academic_session', '2026-2027'),
    coalesce(new.raw_user_meta_data->>'roll_number', 'SH-' || floor(random() * 9000 + 1000)::text),
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 15. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.invitations enable row level security;
alter table public.subjects enable row level security;
alter table public.student_subjects enable row level security;
alter table public.books enable row level security;
alter table public.syllabus_units enable row level security;
alter table public.syllabus_topics enable row level security;
alter table public.topic_progress enable row level security;
alter table public.study_schedules enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.tests enable row level security;
alter table public.results enable row level security;

-- Profiles Policies
drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "Authenticated read profiles" on public.profiles for select to authenticated using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid() or public.is_teacher());

-- Invitations Policies
drop policy if exists "Teachers manage invitations" on public.invitations;
create policy "Teachers manage invitations" on public.invitations for all to authenticated using (public.is_teacher());

-- Subjects Policies
drop policy if exists "Anyone can read subjects" on public.subjects;
create policy "Anyone can read subjects" on public.subjects for select to authenticated using (true);

drop policy if exists "Teachers manage subjects" on public.subjects;
create policy "Teachers manage subjects" on public.subjects for all to authenticated using (public.is_teacher());

-- Student Subjects Policies
drop policy if exists "Teachers manage student subjects" on public.student_subjects;
create policy "Teachers manage student subjects" on public.student_subjects for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own subject assignments" on public.student_subjects;
create policy "Students read own subject assignments" on public.student_subjects for select to authenticated using (student_id = auth.uid() or public.is_teacher());

-- Books Policies
drop policy if exists "Teachers manage books" on public.books;
create policy "Teachers manage books" on public.books for all to authenticated using (public.is_teacher());

drop policy if exists "Students read books" on public.books;
create policy "Students read books" on public.books for select to authenticated using (true);

-- Syllabus Units & Topics Policies
drop policy if exists "Anyone can read syllabus units" on public.syllabus_units;
create policy "Anyone can read syllabus units" on public.syllabus_units for select to authenticated using (true);

drop policy if exists "Teachers manage syllabus units" on public.syllabus_units;
create policy "Teachers manage syllabus units" on public.syllabus_units for all to authenticated using (public.is_teacher());

drop policy if exists "Anyone can read topics" on public.syllabus_topics;
create policy "Anyone can read topics" on public.syllabus_topics for select to authenticated using (true);

drop policy if exists "Teachers manage topics" on public.syllabus_topics;
create policy "Teachers manage topics" on public.syllabus_topics for all to authenticated using (public.is_teacher());

-- Topic Progress Policies
drop policy if exists "Teachers read topic progress" on public.topic_progress;
create policy "Teachers read topic progress" on public.topic_progress for select to authenticated using (public.is_teacher());

drop policy if exists "Students manage own progress" on public.topic_progress;
create policy "Students manage own progress" on public.topic_progress for all to authenticated using (student_id = auth.uid() or public.is_teacher()) with check (student_id = auth.uid() or public.is_teacher());

-- Assignments & Submissions Policies
drop policy if exists "Anyone can read assignments" on public.assignments;
create policy "Anyone can read assignments" on public.assignments for select to authenticated using (true);

drop policy if exists "Teachers manage assignments" on public.assignments;
create policy "Teachers manage assignments" on public.assignments for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own submissions" on public.submissions;
create policy "Students read own submissions" on public.submissions for select to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students insert own submissions" on public.submissions;
create policy "Students insert own submissions" on public.submissions for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Teachers evaluate submissions" on public.submissions;
create policy "Teachers evaluate submissions" on public.submissions for update to authenticated using (public.is_teacher());

-- Tests & Results Policies
drop policy if exists "Anyone can read tests" on public.tests;
create policy "Anyone can read tests" on public.tests for select to authenticated using (true);

drop policy if exists "Teachers manage tests" on public.tests;
create policy "Teachers manage tests" on public.tests for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own results" on public.results;
create policy "Students read own results" on public.results for select to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Teachers manage results" on public.results;
create policy "Teachers manage results" on public.results for all to authenticated using (public.is_teacher());

-- 16. Private Storage Buckets
insert into storage.buckets (id, name, public, file_size_limit)
values 
  ('student-submissions', 'student-submissions', false, 26214400),
  ('syllabus-materials', 'syllabus-materials', false, 52428800),
  ('course-books', 'course-books', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "Teachers storage student submissions" on storage.objects;
create policy "Teachers storage student submissions" on storage.objects for all using (bucket_id = 'student-submissions' and public.is_teacher());

drop policy if exists "Students storage student submissions" on storage.objects;
create policy "Students storage student submissions" on storage.objects for select using (bucket_id = 'student-submissions' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Students upload student submissions" on storage.objects;
create policy "Students upload student submissions" on storage.objects for insert with check (bucket_id = 'student-submissions' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Teachers storage course books" on storage.objects;
create policy "Teachers storage course books" on storage.objects for all using (bucket_id = 'course-books' and public.is_teacher());

drop policy if exists "Anyone read course books" on storage.objects;
create policy "Anyone read course books" on storage.objects for select using (bucket_id = 'course-books');

-- 17. Seed Data
insert into public.subjects (id, name, code, accent_color, total_modules, category, course, academic_session, description, schedule_days, next_class_time)
values
  ('11111111-1111-1111-1111-111111111101', 'Advanced Calculus & Vectors', 'MATH-301', '#14B866', 14, 'STEM', 'Advanced STEM', '2026-2027', 'Differential forms, vector fields, and multivariable optimization.', array['Mon', 'Wed', 'Fri'], 'Today at 02:30 PM'),
  ('11111111-1111-1111-1111-111111111102', 'Quantum Physics & Mechanics', 'PHYS-202', '#0EA5E9', 12, 'STEM', 'Advanced STEM', '2026-2027', 'Wave equations, photoelectric effect, and quantum operators.', array['Tue', 'Thu'], 'Tomorrow at 10:00 AM'),
  ('11111111-1111-1111-1111-111111111103', 'Organic & Analytical Chemistry', 'CHEM-205', '#F59E0B', 16, 'STEM', 'Advanced STEM', '2026-2027', 'Reaction kinetics, stereochemistry, and spectroscopy analysis.', array['Tue', 'Thu', 'Sat'], 'Thursday at 01:15 PM'),
  ('11111111-1111-1111-1111-111111111104', 'Data Structures & Algorithms', 'CS-401', '#8B5CF6', 10, 'STEM', 'Advanced STEM', '2026-2027', 'Balanced binary trees, dynamic programming, and asymptotic bounds.', array['Mon', 'Fri'], 'Friday at 11:30 AM')
on conflict (code) do nothing;

insert into public.syllabus_units (id, subject_id, unit_number, title, description, sort_order)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 1, 'Foundations of Differential Calculus', 'Epsilon-delta definitions, continuity, differentiability, Mean Value Theorem.', 1),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 2, 'Integral Calculus & Vector Fields', 'Riemann sums, Fundamental Theorem of Calculus, line integrals and Green theorem.', 2)
on conflict do nothing;

insert into public.syllabus_topics (id, unit_id, title, description, estimated_hours, notes_content, completed, sort_order)
values
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222201', 'Formal Definition of Limits & Rigorous Proofs', 'Rigorous mathematical proof strategies for limits.', 4, 'Limit definitions: For every epsilon > 0, there exists delta > 0...', true, 1),
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222201', 'Intermediate Value and Extreme Value Theorems', 'Theorems on compactness and interval continuity.', 3, 'Proof methodologies for compact sets and continuous functions.', true, 2),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'Derivatives of Implicit & Inverse Trigonometric Functions', 'Jacobian matrices and implicit function differentiation.', 5, 'Chain rule applications and inverse Jacobian determinants.', true, 3),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222202', 'Techniques of Advanced Integration (Partial Fractions)', 'Decomposition of complex rational algebraic functions.', 6, 'Decomposition of rational algebraic functions over irreducible quadratics.', true, 1),
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222202', 'Improper Integrals and Convergence Criteria', 'Integral convergence tests and comparison proofs.', 4, 'Comparison test and limit comparison for infinite upper bounds.', true, 2),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222202', 'Introduction to Line Integrals in Conservative Vector Fields', 'Gradient vector fields, path independence and curl.', 6, 'Gradient fields, potential functions, and path independence.', false, 3)
on conflict do nothing;

insert into public.books (title, description, subject_id, category, file_name, file_url, file_size, file_type)
values
  ('Stewart Calculus: Early Transcendentals (9th Edition)', 'Comprehensive textbook covering single and multivariable differential & integral calculus.', '11111111-1111-1111-1111-111111111101', 'Textbook', 'stewart_calculus_9th.pdf', 'calculus/stewart_calculus_9th.pdf', '24.5 MB', 'pdf'),
  ('Vector Analysis & Field Theory Reference Manual', 'Rigorous theoretical handbook on gradient, divergence, curl, and Stokes theorem.', '11111111-1111-1111-1111-111111111101', 'Reference Book', 'vector_field_theory_handbook.pdf', 'calculus/vector_field_theory_handbook.pdf', '8.2 MB', 'pdf'),
  ('Principles of Quantum Mechanics (Griffiths)', 'Standard undergraduate lecture notes and solved operator problems.', '11111111-1111-1111-1111-111111111102', 'Textbook', 'griffiths_quantum_mechanics.pdf', 'physics/griffiths_quantum_mechanics.pdf', '18.1 MB', 'pdf'),
  ('Organic Chemistry Laboratory Safety & Reaction Protocols', 'Step-by-step procedural manual for synthesis, filtration, and titration exercises.', '11111111-1111-1111-1111-111111111103', 'Lab Manual', 'organic_chem_lab_manual.docx', 'chemistry/organic_chem_lab_manual.docx', '4.7 MB', 'docx')
on conflict do nothing;


-- ==============================================================================
-- 18. Phase 4: Daily Study Planner & Assignment Management
-- ==============================================================================

-- Study Plans Table
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

-- Study Sessions Table
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

-- Extend Assignments Table
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

-- Enable RLS
alter table public.study_plans enable row level security;
alter table public.study_sessions enable row level security;

-- Study Plans RLS Policies
drop policy if exists "Teachers manage all study plans" on public.study_plans;
create policy "Teachers manage all study plans" on public.study_plans for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own study plans" on public.study_plans;
create policy "Students read own study plans" on public.study_plans for select to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students insert draft study plans" on public.study_plans;
create policy "Students insert draft study plans" on public.study_plans for insert to authenticated with check (student_id = auth.uid());

-- Study Sessions RLS Policies
drop policy if exists "Teachers manage all study sessions" on public.study_sessions;
create policy "Teachers manage all study sessions" on public.study_sessions for all to authenticated using (public.is_teacher());

drop policy if exists "Students read assigned study sessions" on public.study_sessions;
create policy "Students read assigned study sessions" on public.study_sessions for select to authenticated using (student_id = auth.uid() or student_id is null or public.is_teacher());

drop policy if exists "Students insert own study sessions" on public.study_sessions;
create policy "Students insert own study sessions" on public.study_sessions for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Students update own session progress" on public.study_sessions;
create policy "Students update own session progress" on public.study_sessions for update to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students delete own study sessions" on public.study_sessions;
create policy "Students delete own study sessions" on public.study_sessions for delete to authenticated using (student_id = auth.uid() or public.is_teacher());

-- Assignments and Submissions Updated RLS
drop policy if exists "Anyone can read assignments" on public.assignments;
drop policy if exists "Authorized users read assignments" on public.assignments;
create policy "Authorized users read assignments" on public.assignments for select to authenticated using (assigned_to is null or assigned_to = auth.uid() or public.is_teacher());

drop policy if exists "Students update own submissions" on public.submissions;
create policy "Students update own submissions" on public.submissions for update to authenticated using (student_id = auth.uid() or public.is_teacher());


-- ==============================================================================
-- 19. Phase 5: Test Center, Submissions & Teacher Marking
-- ==============================================================================

-- Extend Tests Table
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

-- Test Questions Table
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

-- Test Options
create table if not exists public.test_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.test_questions(id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order int not null default 1
);

-- Test Attempts Table
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

-- Test Answers Table
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

-- Extend Results Table
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

-- Enable RLS
alter table public.test_questions enable row level security;
alter table public.test_options enable row level security;
alter table public.test_attempts enable row level security;
alter table public.test_answers enable row level security;

-- Policies for Questions & Options
drop policy if exists "Teachers manage test questions" on public.test_questions;
create policy "Teachers manage test questions" on public.test_questions for all to authenticated using (public.is_teacher());

drop policy if exists "Students read test questions" on public.test_questions;
create policy "Students read test questions" on public.test_questions for select to authenticated using (true);

drop policy if exists "Teachers manage test options" on public.test_options;
create policy "Teachers manage test options" on public.test_options for all to authenticated using (public.is_teacher());

drop policy if exists "Students read test options" on public.test_options;
create policy "Students read test options" on public.test_options for select to authenticated using (true);

-- Policies for Attempts & Answers
drop policy if exists "Teachers manage test attempts" on public.test_attempts;
create policy "Teachers manage test attempts" on public.test_attempts for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own attempts" on public.test_attempts;
create policy "Students read own attempts" on public.test_attempts for select to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Students start own attempts" on public.test_attempts;
create policy "Students start own attempts" on public.test_attempts for insert to authenticated with check (student_id = auth.uid());

drop policy if exists "Students submit own attempts" on public.test_attempts;
create policy "Students submit own attempts" on public.test_attempts for update to authenticated using (student_id = auth.uid() or public.is_teacher());

drop policy if exists "Teachers manage test answers" on public.test_answers;
create policy "Teachers manage test answers" on public.test_answers for all to authenticated using (public.is_teacher());

drop policy if exists "Students read own answers" on public.test_answers;
create policy "Students read own answers" on public.test_answers for select to authenticated using (
  exists (select 1 from public.test_attempts ta where ta.id = test_answers.attempt_id and (ta.student_id = auth.uid() or public.is_teacher()))
);

drop policy if exists "Students upsert own answers" on public.test_answers;
create policy "Students upsert own answers" on public.test_answers for all to authenticated using (
  exists (select 1 from public.test_attempts ta where ta.id = test_answers.attempt_id and (ta.student_id = auth.uid() or public.is_teacher()))
);
