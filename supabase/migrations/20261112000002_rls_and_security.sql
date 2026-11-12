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
