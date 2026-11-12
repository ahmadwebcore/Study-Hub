import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'teacher' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, role, loading, isDemoMode } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9F8]">
        <LoadingSpinner size="lg" label="Authenticating session..." />
      </div>
    );
  }

  // If user is not authenticated and not in demo mode, redirect to login
  if (!user && !isDemoMode) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required (e.g. teacher on /students or /submissions)
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 text-center rounded-3xl bg-white border border-[#e1ede7] shadow-card space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#142D27]">Faculty Authority Required</h2>
        <p className="text-xs text-[#557067] leading-relaxed">
          The requested console is restricted to faculty members. You are currently browsing StudyHub under the <strong>Student Role</strong>.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" size="sm" onClick={() => window.location.href = '/login'}>
            Faculty Login Required
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard'}>
            Return to Student Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
