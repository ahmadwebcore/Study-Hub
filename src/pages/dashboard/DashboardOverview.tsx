import React from 'react';
import { useRole } from '../../hooks/useRole';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentDashboard } from './StudentDashboard';

export const DashboardOverview: React.FC = () => {
  const { role } = useRole();

  if (role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
};
