# StudyHub LMS — Production Architecture & Deployment Guide

> **Enterprise-Grade Teacher–Student Learning Management System (LMS)**  
> Built with React 19, TypeScript, Vite, Tailwind CSS, and Supabase (PostgreSQL, Auth, Private Storage, RLS).

---

## 1. System Architecture & Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite 8, React Router v7.
- **Design System**: 2026 Modern Design Directives (Bento grids, subtle frosted glassmorphism, hairline micro-borders, `#14B866` brand accent, dark zinc/#142D27 palette, Plus Jakarta Sans & Inter typography).
- **Forms & Validation**: `react-hook-form` + `zod` schemas.
- **Backend & Database**: Supabase (PostgreSQL 15+).
- **Authentication**: Supabase Auth (Email/Password, persistent sessions, cryptographically secure invitation tokens).
- **Object Storage**: Private Supabase Storage (`student-submissions`, `syllabus-materials`, `course-books`).
- **Authorization**: Row Level Security (RLS) on every table + PostgreSQL Security Definer functions + role escalation protection triggers.
- **Hosting & Edge**: Vercel (SPA rewrites, HTTP security headers, Edge CDN).

---

## 2. Directory Structure

```text
Study Hub/
├── .env.example                # Safe public template for environment configuration
├── .gitignore                  # Production Git ignore (protects .env and secrets)
├── package.json                # Project dependencies and build scripts
├── tsconfig.json               # Strict TypeScript configuration
├── vercel.json                 # Vercel SPA routing rewrite rules & security headers
├── vite.config.ts              # Vite bundler configuration & vendor code splitting
├── supabase/
│   ├── master_setup.sql        # Unified idempotent SQL script (Phases 2–5)
│   └── migrations/             # Versioned incremental migrations
│       ├── 20261112000001_initial_schema.sql
│       ├── 20261112000002_rls_and_security.sql
│       ├── 20261112000003_storage_buckets.sql
│       ├── 20261112000004_seed_data.sql
│       ├── 20261112000005_phase3_academic_management.sql
│       ├── 20261112000006_phase4_planner_assignments.sql
│       └── 20261112000007_phase5_test_center_marking.sql
└── src/
    ├── components/
    │   ├── auth/               # Route guards and protected routing
    │   ├── charts/             # Longitudinal and subject progress visualizers
    │   ├── navigation/         # Floating sidebar, dock navbar, role switcher
    │   └── ui/                 # Atomic design components (Card, Button, Badge, Modal, EmptyState)
    ├── contexts/               # Supabase AuthContext & Session management
    ├── data/                   # Comprehensive offline fallback & sample dataset
    ├── hooks/                  # Role & authentication state hooks
    ├── lib/                    # Supabase client singleton
    ├── pages/
    │   ├── assignments/        # Assignment creator, student center & submissions
    │   ├── auth/               # Login, Forgot Password, Reset Password, Accept Invite
    │   ├── dashboard/          # Teacher & Student high-level cockpits
    │   ├── library/            # Digital Book Library with signed URL downloads
    │   ├── planner/            # Daily, Weekly, Monthly study scheduler & goals
    │   ├── reports/            # Institutional analytics, student dossiers & CSV exports
    │   ├── results/            # Official gradebook, certified scores & transcript export
    │   ├── settings/           # User preferences & security
    │   ├── students/           # Student directory, CRUD, and subject assignments
    │   ├── subjects/           # Curriculum management & student enrollment
    │   ├── submissions/        # Teacher marking console with score verification
    │   ├── syllabus/           # Hierarchical Course -> Subject -> Unit -> Topic tree
    │   └── tests/              # Assessment scheduler & live interactive exam runner
    ├── services/               # Strongly typed Supabase data access services
    ├── types/                  # Global TypeScript entity interfaces
    └── App.tsx                 # Root application component
```

---

## 3. Database Schema Overview

The database uses PostgreSQL with the following core relational models:

1. **`profiles`**: Linked to `auth.users(id)` via cascade; stores user roles (`teacher`, `student`), academic credentials, roll numbers, and active/inactive status.
2. **`invitations`**: Stores teacher-generated cryptographically secure invite tokens with 7-day expiration.
3. **`subjects`**: Academic disciplines with codes, module counts, course streams, and accent color tokens.
4. **`student_subjects`**: M:N join table for assigning students to specific subjects.
5. **`books`**: Digital Library catalog categorized by subject, classification (*Textbook*, *Lab Manual*, etc.), file size, and private storage file URLs.
6. **`syllabus_units` & `syllabus_topics`**: Hierarchical curriculum units with estimated study hours, descriptions, attachments, and theory notes.
7. **`topic_progress`**: Individual student topic completion tracking (`not_started`, `in_progress`, `completed`).
8. **`study_plans` & `study_sessions`**: Weekly goals, daily study hour targets, calendar sessions with duration, location, and completion states.
9. **`assignments` & `submissions`**: Coursework distribution with homework types, chapter linkages, student targets, rubric instructions, private file uploads, and teacher grades.
10. **`tests`, `test_questions`, `test_options`, `test_attempts`, `test_answers`, `results`**: Complete examination infrastructure supporting MCQs, short answers, long derivations, handwritten uploads, countdown timers, and official transcripts.

---

## 4. Security Architecture & Audit Report

- **Row Level Security (RLS)**: Enforced across all tables without exception.
  - Teachers have elevated faculty access through `public.is_teacher()` security definer function.
  - Students can only access their own profile, assigned study plans, assigned tests, own submissions, and certified results.
- **Role Escalation Protection**: Protected by the PostgreSQL trigger `tr_protect_role_escalation` on `profiles`, which raises an exception if any non-faculty user attempts to update their role.
- **Zero Secret Exposure**: The frontend strictly consumes `VITE_SUPABASE_ANON_KEY`. The `service_role` secret is never bundled or referenced in client code.
- **Private Storage**: Buckets `student-submissions`, `syllabus-materials`, and `course-books` are private. Access is mediated via 60-minute time-limited signed URLs (`createSignedUrl`).
- **Dependency Audit**: `npm audit` returned **0 vulnerabilities**.

---

## 5. Environment Variables Guide

Create a `.env` file in the root directory:

```bash
# Supabase Project URL
VITE_SUPABASE_URL=https://xobngxwmlmkmicpkloxd.supabase.co

# Supabase Public Anon Key (Safe for browser deployment)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_jwt_here
```

> **Warning**: Never place secret service-role keys in this file.

---

## 6. Local Development & Production Build

### Running Locally:
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### Production Verification:
```bash
# Run TypeScript type check and production build
npm run build
```
The optimized production bundle generates code-split chunks under `dist/` in under 3.5 seconds.

---

## 7. Production Deployment (Vercel)

### Step 1: Run Master Database Setup
1. Open your Supabase Dashboard &rarr; **SQL Editor**.
2. Open [`supabase/master_setup.sql`](file:///c:/Users/Bilal%20Ahmad/Desktop/Study%20Hub/supabase/master_setup.sql) and paste its complete contents.
3. Click **Run** to execute all tables, storage policies, triggers, and seed records.

### Step 2: Push Repository to GitHub
```bash
git init
git add .
git commit -m "feat: StudyHub LMS Production Release (Phases 1-6)"
git branch -M main
git remote add origin https://github.com/your-username/study-hub.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) (free plan).
2. Click **Add New** &rarr; **Project** and import your `study-hub` GitHub repository.
3. Framework Preset: **Vite**.
4. Root Directory: `./`.
5. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://xobngxwmlmkmicpkloxd.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your-anon-key>`
6. Click **Deploy**. Vercel will build the project and issue a live SSL-secured production URL (e.g., `https://study-hub.vercel.app`).
