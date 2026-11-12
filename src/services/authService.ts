import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { SAMPLE_TEACHER, SAMPLE_STUDENT } from '../data/sampleData';

export const authService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        name: data.full_name,
        email: data.email,
        role: data.role,
        avatar: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
        title: data.title,
        institution: data.institution || 'StudyHub Academic Center',
        phone: data.phone,
        academicClass: data.academic_class,
        course: data.course,
        board: data.board,
        academicSession: data.academic_session,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch {
      return null;
    }
  },

  async signInWithEmail(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      // Offline / Demo check
      if (email.toLowerCase().includes('teacher') || email.toLowerCase().includes('clara')) {
        return { user: { id: SAMPLE_TEACHER.id, email: SAMPLE_TEACHER.email }, profile: SAMPLE_TEACHER, error: null };
      }
      return { user: { id: SAMPLE_STUDENT.id, email: SAMPLE_STUDENT.email }, profile: SAMPLE_STUDENT, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, profile: null, error };
    }

    const profile = await this.fetchUserProfile(data.user.id);
    return { user: data.user, profile, error: null };
  },

  async signUpTeacher(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: 'usr_t_demo', email },
        profile: { ...SAMPLE_TEACHER, name: fullName, email },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'teacher',
        },
      },
    });

    if (error) {
      return { user: null, profile: null, error };
    }

    const profile = data.user ? await this.fetchUserProfile(data.user.id) : null;
    return { user: data.user, profile, error: null };
  },

  async signUpStudentWithInvite(email: string, password: string, token: string, fullName: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: 'usr_s_demo', email },
        profile: { ...SAMPLE_STUDENT, name: fullName, email },
        error: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invite_token: token,
          role: 'student',
        },
      },
    });

    if (error) {
      return { user: null, profile: null, error };
    }

    const profile = data.user ? await this.fetchUserProfile(data.user.id) : null;
    return { user: data.user, profile, error: null };
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },

  async updatePassword(newPassword: string) {
    if (!isSupabaseConfigured()) {
      return { error: null };
    }

    return await supabase.auth.updateUser({
      password: newPassword,
    });
  },

  // Prepared for Google OAuth (Requirement 5)
  async signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase project credentials not configured in .env');
    }

    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  },
};
