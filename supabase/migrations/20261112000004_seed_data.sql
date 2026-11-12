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
