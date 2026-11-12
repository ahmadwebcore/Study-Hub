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
