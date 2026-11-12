import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardOverview } from '../pages/dashboard/DashboardOverview';
import { StudentsPage } from '../pages/students/StudentsPage';
import { SubjectsPage } from '../pages/subjects/SubjectsPage';
import { LibraryPage } from '../pages/library/LibraryPage';
import { SyllabusPage } from '../pages/syllabus/SyllabusPage';
import { StudyPlannerPage } from '../pages/planner/StudyPlannerPage';
import { AssignmentsPage } from '../pages/assignments/AssignmentsPage';
import { TestsPage } from '../pages/tests/TestsPage';
import { SubmissionsPage } from '../pages/submissions/SubmissionsPage';
import { ResultsPage } from '../pages/results/ResultsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { WeeklyTasksPage } from '../pages/tasks/WeeklyTasksPage';
import { CompletedWorkPage } from '../pages/tasks/CompletedWorkPage';
import { TestSubmissionPage } from '../pages/tests/TestSubmissionPage';

// Authentication Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { AcceptInvitePage } from '../pages/auth/AcceptInvitePage';
import { LandingPage } from '../pages/landing/LandingPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing & Authentication Screens */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/welcome" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/accept-invite" element={<AcceptInvitePage />} />

      {/* Main Authenticated Application Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />

        {/* Core LMS Screens */}
        <Route
          path="/students"
          element={
            <ProtectedRoute requiredRole="teacher">
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="/planner" element={<StudyPlannerPage />} />
        <Route path="/weekly-tasks" element={<WeeklyTasksPage />} />
        <Route path="/completed-work" element={<CompletedWorkPage />} />
        <Route path="/assignments" element={<AssignmentsPage />} />
        <Route path="/tests" element={<TestsPage />} />
        <Route path="/test-submit" element={<TestSubmissionPage />} />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute requiredRole="teacher">
              <SubmissionsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
