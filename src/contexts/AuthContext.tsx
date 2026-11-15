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
  updateAvatar: (avatarUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(SAMPLE_TEACHER);
  const [demoRole, setDemoRole] = useState<UserRole>('teacher');
  const [loading, setLoading] = useState<boolean>(true);

  const configured = isSupabaseConfigured();
  const isDemoMode = !configured || user === null;

  const sanitizeProfile = (p: UserProfile | null, fallbackRole: UserRole): UserProfile => {
    if (!p) return fallbackRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT;
    const clean = { ...p };
    try {
      const savedTeacherAvatar = localStorage.getItem('studyhub_custom_avatar_ahmad');
      const savedStudentAvatar = localStorage.getItem('studyhub_custom_avatar_student');
      if (fallbackRole === 'teacher' && savedTeacherAvatar) {
        clean.avatar = savedTeacherAvatar;
      } else if (fallbackRole === 'student' && savedStudentAvatar) {
        clean.avatar = savedStudentAvatar;
      }
    } catch {}
    if (clean.email && clean.email.toLowerCase().includes('bilal')) {
      clean.email = 'student@studyhub.edu';
      clean.name = 'Student Scholar';
    }
    if (clean.name && clean.name.toLowerCase().includes('bilal')) {
      clean.name = 'Student Scholar';
      clean.email = 'student@studyhub.edu';
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

  const updateAvatar = (avatarUrl: string) => {
    const cleanUrl = avatarUrl.trim();
    try {
      const activeRole = profile?.role || demoRole;
      if (activeRole === 'teacher') {
        localStorage.setItem('studyhub_custom_avatar_ahmad', cleanUrl);
      } else {
        localStorage.setItem('studyhub_custom_avatar_student', cleanUrl);
      }
    } catch {}
    setProfile((prev) => (prev ? { ...prev, avatar: cleanUrl } : prev));
  };

  useEffect(() => {
    let mounted = true;

    // Purge any legacy localStorage keys containing bilal or clara
    try {
      const studentEmail = localStorage.getItem('studyhub_student_configured_gmail');
      if (studentEmail && studentEmail.includes('bilal')) {
        localStorage.setItem('studyhub_student_configured_gmail', 'student@studyhub.edu');
      }
      const teacherEmail = localStorage.getItem('studyhub_teacher_configured_gmail');
      if (teacherEmail && teacherEmail.includes('clara')) {
        localStorage.setItem('studyhub_teacher_configured_gmail', 'ahmadwebcore@gmail.com');
      }
    } catch {}

    async function initAuth() {
      if (!configured) {
        setProfile(demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
        setLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user && mounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          const userProfile = await authService.fetchUserProfile(initialSession.user.id);
          if (mounted) {
            setProfile(sanitizeProfile(userProfile, demoRole));
          }
        }
      } catch {
        // Fallback to demo profile if network or session fetch failed
        if (mounted) {
          setProfile(demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (configured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (_event, currentSession) => {
          if (!mounted) return;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user) {
            const userProfile = await authService.fetchUserProfile(currentSession.user.id);
            if (mounted) setProfile(sanitizeProfile(userProfile, demoRole));
          } else {
            if (mounted) setProfile(demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
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
      setProfile(authedProfile);
    }
    return { error: null };
  };

  const completeTwoFactorAuth = (email: string, targetRole: UserRole = 'teacher') => {
    setRole(targetRole);
    const authedProfile = targetRole === 'teacher'
      ? { ...SAMPLE_TEACHER, email }
      : { ...SAMPLE_STUDENT, email };
    setUser({ id: authedProfile.id, email } as User);
    setProfile(authedProfile);
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
    setProfile(demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
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
    const nextRole = demoRole === 'teacher' ? 'student' : 'teacher';
    setDemoRole(nextRole);
    setProfile(nextRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
  };

  const setRole = (newRole: UserRole) => {
    setDemoRole(newRole);
    setProfile(newRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);
  };

  const currentRole: UserRole = profile?.role || demoRole;
  const currentUserProfile: UserProfile = profile || (demoRole === 'teacher' ? SAMPLE_TEACHER : SAMPLE_STUDENT);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: currentUserProfile,
        role: currentRole,
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
