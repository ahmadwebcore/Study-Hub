import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from '../services/authService';
import { UserProfile, UserRole } from '../types';
import { SAMPLE_TEACHER, SAMPLE_STUDENT } from '../data/sampleData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string, roleMode?: UserRole) => Promise<{ error: Error | null }>;
  completeTwoFactorAuth: (email: string, targetRole?: UserRole) => void;
  signUpTeacher: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signUpStudentWithInvite: (email: string, password: string, token: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  toggleDemoRole: () => void;
  setRole: (role: UserRole) => void;
  switchToTeacher: () => void;
  switchToStudent: () => void;
  authenticatedRole: UserRole;
  canSwitchRole: boolean;
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const sanitizeProfile = (p: UserProfile | null, fallbackRole: UserRole): UserProfile => {
    if (!p) return fallbackRole === 'teacher' ? { ...SAMPLE_TEACHER } : { ...SAMPLE_STUDENT };
    const clean = { ...p };
    try {
      const emailKey = clean.email ? `studyhub_avatar_${clean.email.toLowerCase()}` : '';
      const savedEmailAvatar = emailKey ? localStorage.getItem(emailKey) : null;
      const savedTeacherAvatar = localStorage.getItem('studyhub_custom_avatar_ahmad');
      const savedStudentAvatar = localStorage.getItem('studyhub_custom_avatar_henza') || localStorage.getItem('studyhub_custom_avatar_student');

      if (savedEmailAvatar) {
        clean.avatar = savedEmailAvatar;
      } else if (fallbackRole === 'teacher' && savedTeacherAvatar) {
        clean.avatar = savedTeacherAvatar;
      } else if (fallbackRole === 'student' && savedStudentAvatar) {
        clean.avatar = savedStudentAvatar;
      }
    } catch {}

    if (clean.email && clean.email.toLowerCase().includes('bilal')) {
      clean.email = 'henzanoor@gmail.com';
      clean.name = 'Henza Noor';
    }
    if (clean.name && (clean.name.toLowerCase().includes('bilal') || clean.name.toLowerCase().includes('scholar'))) {
      clean.name = 'Henza Noor';
      clean.email = 'henzanoor@gmail.com';
    }
    if (clean.email && clean.email.toLowerCase().includes('clara')) {
      clean.email = 'ahmadwebcore@gmail.com';
      clean.name = 'Ahmad';
    }
    if (clean.name && clean.name.toLowerCase().includes('clara')) {
      clean.name = 'Ahmad';
      clean.email = 'ahmadwebcore@gmail.com';
    }
    return clean;
  };

  const [authenticatedRole, setAuthenticatedRole] = useState<UserRole>(() => {
    try {
      const savedAuthRole = localStorage.getItem('studyhub_authenticated_role') as UserRole;
      if (savedAuthRole === 'teacher' || savedAuthRole === 'student') return savedAuthRole;
      const savedUserStr = localStorage.getItem('studyhub_logged_in_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed.email?.toLowerCase().includes('henza') || parsed.name?.toLowerCase().includes('henza')) {
          return 'student';
        }
      }
    } catch {}
    return 'teacher';
  });

  const canSwitchRole = authenticatedRole === 'teacher';

  const [demoRole, setDemoRole] = useState<UserRole>(() => {
    try {
      const savedRole = localStorage.getItem('studyhub_active_role');
      if (savedRole === 'student' || savedRole === 'teacher') return savedRole;
    } catch {}
    return 'teacher';
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const savedUserStr = localStorage.getItem('studyhub_logged_in_user');
      const savedRole = (localStorage.getItem('studyhub_active_role') as UserRole) || 'teacher';
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        return sanitizeProfile(parsed, savedRole);
      }
      return sanitizeProfile(savedRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT, savedRole);
    } catch {
      return sanitizeProfile(SAMPLE_TEACHER, 'teacher');
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  const configured = isSupabaseConfigured();
  const isDemoMode = !configured || user === null;

  const updateAvatar = (avatarUrl: string) => {
    const cleanUrl = avatarUrl.trim();
    try {
      const activeRole = profile?.role || demoRole;
      if (activeRole === 'teacher') {
        localStorage.setItem('studyhub_custom_avatar_ahmad', cleanUrl);
      } else {
        localStorage.setItem('studyhub_custom_avatar_henza', cleanUrl);
        localStorage.setItem('studyhub_custom_avatar_student', cleanUrl);
      }
      if (profile?.email) {
        localStorage.setItem(`studyhub_avatar_${profile.email.toLowerCase()}`, cleanUrl);
      }
      if (profile) {
        const updated = { ...profile, avatar: cleanUrl };
        localStorage.setItem('studyhub_logged_in_user', JSON.stringify(updated));
      }
    } catch {}
    setProfile((prev) => (prev ? { ...prev, avatar: cleanUrl } : prev));
    window.dispatchEvent(new CustomEvent('studyhub_avatar_updated', { detail: cleanUrl }));
  };

  useEffect(() => {
    let mounted = true;

    // Purge any legacy localStorage keys containing bilal, clara, or outdated student names
    try {
      const studentEmail = localStorage.getItem('studyhub_student_configured_gmail');
      if (!studentEmail || studentEmail.includes('bilal') || studentEmail.includes('studyhub.edu')) {
        localStorage.setItem('studyhub_student_configured_gmail', 'henzanoor@gmail.com');
      }
      const teacherEmail = localStorage.getItem('studyhub_teacher_configured_gmail');
      if (teacherEmail && teacherEmail.includes('clara')) {
        localStorage.setItem('studyhub_teacher_configured_gmail', 'ahmadwebcore@gmail.com');
      }
    } catch {}

    async function initAuth() {
      // Check stored session first
      try {
        const savedUserStr = localStorage.getItem('studyhub_logged_in_user');
        const savedRole = (localStorage.getItem('studyhub_active_role') as UserRole) || demoRole;
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          const sanitized = sanitizeProfile(parsed, savedRole);
          if (mounted) {
            setProfile(sanitized);
            setUser({ id: sanitized.id, email: sanitized.email } as User);
            setDemoRole(savedRole);
          }
        }
      } catch {}

      if (!configured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user && mounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          const userProfile = await authService.fetchUserProfile(initialSession.user.id);
          if (mounted) {
            const sanitized = sanitizeProfile(userProfile, demoRole);
            setProfile(sanitized);
            try {
              localStorage.setItem('studyhub_logged_in_user', JSON.stringify(sanitized));
            } catch {}
          }
        }
      } catch {
        // Handled via stored profile
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (configured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          if (!mounted) return;

          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const userProfile = await authService.fetchUserProfile(currentSession.user.id);
            if (mounted) {
              const sanitized = sanitizeProfile(userProfile, demoRole);
              setProfile(sanitized);
              try {
                localStorage.setItem('studyhub_logged_in_user', JSON.stringify(sanitized));
              } catch {}
            }
          } else if (event === 'SIGNED_OUT') {
            // Only clear user if the user deliberately signed out
            const savedUserStr = localStorage.getItem('studyhub_logged_in_user');
            if (!savedUserStr) {
              setSession(null);
              setUser(null);
            }
          } else {
            // Keep local persistent session alive indefinitely (never kick user out automatically)
            try {
              const savedUserStr = localStorage.getItem('studyhub_logged_in_user');
              const savedRole = (localStorage.getItem('studyhub_active_role') as UserRole) || demoRole;
              if (savedUserStr) {
                const parsed = JSON.parse(savedUserStr);
                const sanitized = sanitizeProfile(parsed, savedRole);
                setUser({ id: sanitized.id, email: sanitized.email } as User);
                setProfile(sanitized);
                setDemoRole(savedRole);
              }
            } catch {}
          }
          setLoading(false);
        }
      );

      return () => {
        mounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [configured, demoRole]);

  const signIn = async (email: string, password: string, roleMode: UserRole = 'teacher') => {
    setLoading(true);
    const { user: authedUser, profile: authedProfile, error } = await authService.signInWithEmail(email, password, roleMode);
    setLoading(false);
    if (error) {
      return { error: new Error(error.message) };
    }
    if (authedUser) {
      setUser(authedUser as User);
      const sanitized = sanitizeProfile(authedProfile, roleMode);
      setProfile(sanitized);
      setAuthenticatedRole(roleMode);
      try {
        localStorage.setItem('studyhub_authenticated_role', roleMode);
        localStorage.setItem('studyhub_active_role', roleMode);
        localStorage.setItem('studyhub_logged_in_user', JSON.stringify(sanitized));
      } catch {}
    }
    return { error: null };
  };

  const completeTwoFactorAuth = (email: string, targetRole: UserRole = 'teacher') => {
    setRole(targetRole);
    setAuthenticatedRole(targetRole);
    const base = targetRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT;
    const authedProfile = sanitizeProfile({ ...base, email }, targetRole);
    setUser({ id: authedProfile.id, email } as User);
    setProfile(authedProfile);
    try {
      localStorage.setItem('studyhub_authenticated_role', targetRole);
      localStorage.setItem('studyhub_active_role', targetRole);
      localStorage.setItem('studyhub_logged_in_user', JSON.stringify(authedProfile));
    } catch {}
    sessionStorage.removeItem('studyhub_pending_2fa');
  };

  const signUpTeacher = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const { user: authedUser, profile: authedProfile, error } = await authService.signUpTeacher(email, password, fullName);
    setLoading(false);
    if (error) {
      return { error: new Error(error.message) };
    }
    if (authedUser) {
      setUser(authedUser as User);
      setProfile(authedProfile);
    }
    return { error: null };
  };

  const signUpStudentWithInvite = async (email: string, password: string, token: string, fullName: string) => {
    setLoading(true);
    const { user: authedUser, profile: authedProfile, error } = await authService.signUpStudentWithInvite(email, password, token, fullName);
    setLoading(false);
    if (error) {
      return { error: new Error(error.message) };
    }
    if (authedUser) {
      setUser(authedUser as User);
      setProfile(authedProfile);
    }
    return { error: null };
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem('studyhub_logged_in_user');
      localStorage.removeItem('studyhub_active_role');
      localStorage.removeItem('studyhub_authenticated_role');
    } catch {}
    setAuthenticatedRole('teacher');
    setDemoRole('teacher');
    setProfile(sanitizeProfile(SAMPLE_TEACHER, 'teacher'));
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await authService.updatePassword(password);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  const toggleDemoRole = () => {
    if (!canSwitchRole) {
      console.warn('Access denied: Student accounts cannot convert perspective to teacher.');
      return;
    }
    const nextRole = demoRole === 'teacher' ? 'student' : 'teacher';
    setRole(nextRole);
  };

  const setRole = (newRole: UserRole) => {
    if (newRole === 'teacher' && !canSwitchRole) {
      console.warn('Access denied: Student accounts cannot convert their role to teacher.');
      return;
    }
    try {
      localStorage.setItem('studyhub_active_role', newRole);
    } catch {}
    setDemoRole(newRole);
    const base = newRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT;
    const sanitized = sanitizeProfile(base, newRole);
    setProfile(sanitized);
    try {
      localStorage.setItem('studyhub_logged_in_user', JSON.stringify(sanitized));
    } catch {}
  };

  const switchToTeacher = () => {
    if (!canSwitchRole) return;
    setRole('teacher');
  };

  const switchToStudent = () => {
    if (!canSwitchRole) return;
    setRole('student');
  };

  const currentRole: UserRole = profile?.role || demoRole;
  const currentUserProfile: UserProfile = profile || (demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: currentUserProfile,
        role: currentRole,
        authenticatedRole,
        canSwitchRole,
        session,
        loading,
        isConfigured: configured,
        isDemoMode,
        signIn,
        completeTwoFactorAuth,
        signUpTeacher,
        signUpStudentWithInvite,
        signOut,
        resetPassword,
        updatePassword,
        toggleDemoRole,
        setRole,
        switchToTeacher,
        switchToStudent,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
