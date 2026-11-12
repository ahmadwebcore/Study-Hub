-- ==============================================================================
-- Migration: 20261112000005_phase3_academic_management.sql
-- Description: Phase 3 Academic Management System: Students, Subjects, Books & Syllabus
-- Author: Senior Supabase Database Architect
-- ==============================================================================

-- 1. Extend profiles with roll_number, status, enrolled_at
alter table public.profiles
  add column if not exists roll_number text,
  add column if not exists status text not null default 'active' check (status in ('active', 'inactive')),
  add column if not exists enrolled_at timestamptz not null default now();

create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_roll on public.profiles(roll_number);

-- 2. Extend subjects with description, course, academic_session
alter table public.subjects
  add column if not exists description text,
  add column if not exists course text not null default 'Advanced STEM',
  add column if not exists academic_session text not null default '2026-2027';

create index if not exists idx_subjects_course on public.subjects(course);
create index if not exists idx_subjects_session on public.subjects(academic_session);

-- 3. Student-Subject Assignment Table (Many-to-Many)
create table if not exists public.student_subjects (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  unique (student_id, subject_id)
);

create index if not exists idx_student_subjects_student on public.student_subjects(student_id);
create index if not exists idx_student_subjects_subject on public.student_subjects(subject_id);

-- 4. Digital Books & Study Materials Library
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

-- 5. Extend Syllabus Units with sort_order
alter table public.syllabus_units
  add column if not exists sort_order int not null default 1;

-- 6. Extend Syllabus Topics with description, attachments
alter table public.syllabus_topics
  add column if not exists description text,
  add column if not exists attachment_name text,
  add column if not exists attachment_url text;

-- 7. Student-Specific Topic Progress Table (Dynamically Calculated Progress)
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
create index if not exists idx_topic_progress_status on public.topic_progress(status);

-- 8. Enable Row Level Security (RLS) on new tables
alter table public.student_subjects enable row level security;
alter table public.books enable row level security;
alter table public.topic_progress enable row level security;

-- Student Subjects Policies
drop policy if exists "Teachers manage student subjects" on public.student_subjects;
create policy "Teachers manage student subjects" on public.student_subjects
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read own subject assignments" on public.student_subjects;
create policy "Students read own subject assignments" on public.student_subjects
  for select to authenticated
  using (student_id = auth.uid());

-- Books Policies
drop policy if exists "Teachers manage books" on public.books;
create policy "Teachers manage books" on public.books
  for all to authenticated
  using (public.is_teacher());

drop policy if exists "Students read authorized books" on public.books;
create policy "Students read authorized books" on public.books
  for select to authenticated
  using (
    public.is_teacher() or
    exists (
      select 1 from public.student_subjects ss
      where ss.student_id = auth.uid() and ss.subject_id = public.books.subject_id
    ) or
    -- Allow general curriculum books if not yet assigned
    not exists (
      select 1 from public.student_subjects where student_id = auth.uid()
    )
  );

-- Topic Progress Policies
drop policy if exists "Teachers read all topic progress" on public.topic_progress;
create policy "Teachers read all topic progress" on public.topic_progress
  for select to authenticated
  using (public.is_teacher());

drop policy if exists "Students read own topic progress" on public.topic_progress;
create policy "Students read own topic progress" on public.topic_progress
  for select to authenticated
  using (student_id = auth.uid());

drop policy if exists "Students update own topic progress" on public.topic_progress;
create policy "Students update own topic progress" on public.topic_progress
  for all to authenticated
  using (student_id = auth.uid() or public.is_teacher())
  with check (student_id = auth.uid() or public.is_teacher());

-- 9. Private Storage Bucket for Digital Book Library
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  (
    'course-books',
    'course-books',
    false, -- Private bucket
    52428800, -- 50 MB max
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/epub+zip',
      'application/zip'
    ]
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage Policies for course-books
drop policy if exists "Teachers manage course books" on storage.objects;
create policy "Teachers manage course books" on storage.objects
  for all to authenticated
  using (bucket_id = 'course-books' and public.is_teacher())
  with check (bucket_id = 'course-books' and public.is_teacher());

drop policy if exists "Students read course books" on storage.objects;
create policy "Students read course books" on storage.objects
  for select to authenticated
  using (bucket_id = 'course-books');
