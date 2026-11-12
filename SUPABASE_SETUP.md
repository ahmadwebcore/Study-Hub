# StudyHub — Supabase Setup & Deployment Guide

This guide walks you through provisioning, configuring, and verifying the production-grade Supabase backend for **StudyHub**.

---

## Prerequisites
- A free or paid account at [Supabase.com](https://supabase.com).
- Node.js 18+ and npm installed on your development machine.
- Web browser with access to the Supabase Dashboard.

---

## Step 1: Create a Free Supabase Project

1. Log in to [Supabase Dashboard](https://app.supabase.com).
2. Click **New Project**.
3. Choose your organization and fill in project details:
   - **Name**: `StudyHub-LMS` (or your preferred name)
   - **Database Password**: Generate and securely store a strong database password.
   - **Region**: Select the region closest to your users.
   - **Pricing Plan**: Free tier is completely sufficient.
4. Click **Create new project** and wait 1–2 minutes while Supabase provisions the PostgreSQL cluster, Auth service, and Storage engine.

---

## Step 2: Configure Environment Variables

1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon in sidebar) -> **API**.
2. Locate the following two values:
   - **Project URL**: (e.g., `https://abcdefghijklm.supabase.co`)
   - **Project API Keys** -> `anon` / `public`: (a long JWT string)
   > [!WARNING]
   > Never use or expose the `service_role` key in frontend code. Only use the `anon` public key.

3. In the root directory of the StudyHub project, create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your actual project keys:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key-here
   ```
5. Restart the development server so Vite loads the new environment variables:
   ```bash
   npm.cmd run dev
   ```

---

## Step 3: Run Database Migrations

StudyHub includes version-controlled SQL migrations located in `supabase/migrations/`.

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Run the migrations **in numerical order**:

### Migration 1: Core Schema & Enums
- Copy the entire contents of [`supabase/migrations/20261112000001_initial_schema.sql`](file:///c:/Users/Bilal%20Ahmad/Desktop/Study%20Hub/supabase/migrations/20261112000001_initial_schema.sql).
- Paste into SQL Editor and click **Run**.
- *Creates tables*: `profiles`, `invitations`, `subjects`, `syllabus_units`, `syllabus_topics`, `study_schedules`, `assignments`, `submissions`, `tests`, `results`.

### Migration 2: Security & Row Level Security (RLS)
- Copy the entire contents of [`supabase/migrations/20261112000002_rls_and_security.sql`](file:///c:/Users/Bilal%20Ahmad/Desktop/Study%20Hub/supabase/migrations/20261112000002_rls_and_security.sql).
- Paste into SQL Editor and click **Run**.
- *Configures*: `get_auth_role()`, `is_teacher()`, `protect_role_escalation` trigger, `handle_new_user` auth trigger, and RLS policies on all tables.

### Migration 3: Storage Buckets & Policies
- Copy the entire contents of [`supabase/migrations/20261112000003_storage_buckets.sql`](file:///c:/Users/Bilal%20Ahmad/Desktop/Study%20Hub/supabase/migrations/20261112000003_storage_buckets.sql).
- Paste into SQL Editor and click **Run**.
- *Configures*: Private buckets `student-submissions` and `syllabus-materials` with strict storage RLS policies.

### Migration 4: Initial Academic Curriculum Seed Data (Optional)
- Copy the entire contents of [`supabase/migrations/20261112000004_seed_data.sql`](file:///c:/Users/Bilal%20Ahmad/Desktop/Study%20Hub/supabase/migrations/20261112000004_seed_data.sql).
- Paste into SQL Editor and click **Run**.
- *Seeds*: Standard STEM subjects (Advanced Calculus, Quantum Mechanics, Organic Chemistry, Classical Mechanics), syllabus units, diagnostic tests, assignments, and sample schedule.

---

## Step 4: Create the Initial Teacher / Admin Account

The teacher serves as the administrator of the LMS.

### Method A: Through StudyHub Web UI (Recommended)
1. Open StudyHub at `http://localhost:5173/login`.
2. Select the **Teacher Portal** tab.
3. Enter your teacher credentials (e.g. `teacher@studyhub.edu` and a secure password).
4. If this is a fresh setup with email verification enabled, check your email inbox to confirm your account.
5. Once logged in, your profile is created automatically in `public.profiles` with `role = 'teacher'`.

### Method B: Through Supabase Dashboard
1. Go to **Authentication** -> **Users** -> **Add user** -> **Create user**.
2. Enter email: `teacher@studyhub.edu` and set a password. Auto-confirm email if desired.
3. Run this single query in the **SQL Editor** to ensure the initial profile has the teacher role:
   ```sql
   UPDATE public.profiles
   SET role = 'teacher', full_name = 'Dr. Clara Evans'
   WHERE email = 'teacher@studyhub.edu';
   ```

---

## Step 5: Invite the First Student

StudyHub enforces an invitation-only onboarding flow for students.

1. Log in as the **Teacher**.
2. Navigate to the **Students** page from the sidebar (`/students`).
3. Click the **Invite Student** button.
4. Fill out the student's details:
   - Full Name: `Ryan Patel`
   - Email: `ryan.patel@student.studyhub.edu`
   - Academic Class: `Grade 12`
   - Course: `Advanced STEM Honors`
   - Board: `Cambridge International (CIE / A-Levels)`
   - Academic Session: `2026–2027`
5. Click **Create & Send Invitation**.
6. The modal displays a secure invitation link:
   ```
   http://localhost:5173/accept-invite?token=inv_sec_...
   ```
7. Copy this link and send it to the student.
8. The student opens the link, sets their password, and immediately accesses their personalized student dashboard.

---

## Step 6: Configure Private Storage Verification

1. In the Supabase Dashboard, click on **Storage** in the left sidebar.
2. Verify that two buckets are listed:
   - `student-submissions` (Private, 25MB limit)
   - `syllabus-materials` (Private, 50MB limit)
3. Ensure **Public bucket** is toggled **OFF** for both.
4. All file downloads in StudyHub use 60-minute signed temporary URLs (`storageService.createSignedDownloadUrl`), guaranteeing academic privacy.

---

## Step 7: Configure Authentication & Security Settings

In Supabase Dashboard under **Authentication** -> **URL Configuration**:
- **Site URL**: `http://localhost:5173` (or your production domain when deployed)
- **Redirect URLs**: Add `http://localhost:5173/**` and `http://localhost:5173/reset-password`

Under **Authentication** -> **Email Templates**:
- Customize the Confirmation, Invite, and Reset Password email templates with the StudyHub branding colors (`#14B866` and `#142D27`).

---

## Step 8: Verification Checklist

| Test Item | Expected Result | Verified |
|---|---|---|
| Teacher Login | Authenticates and lands on `/` with Teacher Command Center | Yes |
| Student Login | Authenticates and lands on `/` with Student Dashboard | Yes |
| Role Guard | Student navigating to `/students` is redirected with access denied notice | Yes |
| Direct RLS Check | Querying another user's submissions via REST API returns empty array | Yes |
| Storage Access | Unsigned URLs to submission files return 403 Forbidden | Yes |
| Role Escalation | Attempting to update `role = 'teacher'` via client API fails with trigger exception | Yes |

---

## Troubleshooting

- **"Invalid API key" error**: Verify that `VITE_SUPABASE_ANON_KEY` in `.env` contains the full public JWT and no surrounding quotes or whitespace.
- **"Network error / Failed to fetch"**: Check that `VITE_SUPABASE_URL` begins with `https://` and does not include trailing slashes.
- **Vite not reloading `.env`**: Stop the dev server (`Ctrl+C`), and re-run `npm.cmd run dev`.
- **Operating in Demo Mode**: If credentials are unset or invalid, StudyHub automatically switches to safe Demo & Preview mode so the application remains fully interactive without crashing.
