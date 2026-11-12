import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserProfile, UserRole } from '../types';
import { SAMPLE_TEACHER, SAMPLE_STUDENT } from '../data/sampleData';

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useRole = (): {
  role: UserRole;
  user: UserProfile;
  userProfile: UserProfile | null;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  isConfigured: boolean;
} => {
  const { role, profile, setRole, toggleDemoRole, isConfigured } = useAuth();
  const fallbackUser = role === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT;

  return {
    role,
    user: profile || fallbackUser,
    userProfile: profile,
    setRole,
    toggleRole: toggleDemoRole,
    isConfigured,
  };
};
