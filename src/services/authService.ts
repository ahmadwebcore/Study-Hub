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
      const cleanEmail = email.trim().toLowerCase();

      // Check registered students in localStorage (from invitation tokens)
      const registeredStudents = JSON.parse(
        localStorage.getItem('studyhub_registered_students') || '[]'
      ) as Array<{ email: string; password: string; name: string }>;

      const registered = registeredStudents.find(
        (s) => s.email.toLowerCase() === cleanEmail
      );

      // 1. Teacher Account Check
      const isTeacher =
        cleanEmail === 'ahmadwebcore@gmail.com' ||
        cleanEmail === 'teacher@studyhub.edu';

      if (isTeacher) {
        if (password !== 'password123' && password !== 'Ahmad@2026') {
          return {
            user: null,
            profile: null,
            error: new Error('Incorrect password. For demo faculty, use password: password123 or Ahmad@2026'),
          };
        }
        return {
          user: { id: SAMPLE_TEACHER.id, email: SAMPLE_TEACHER.email },
          profile: SAMPLE_TEACHER,
          error: null,
        };
      }

      // 2. Custom Registered Student via Invite Token
      if (registered) {
        if (password !== registered.password) {
          return {
            user: null,
            profile: null,
            error: new Error('Incorrect password for this registered student account.'),
          };
        }
        const studentProfile: UserProfile = {
          ...SAMPLE_STUDENT,
          name: registered.name,
          email: registered.email,
        };
        return {
          user: { id: `usr_${registered.email}`, email: registered.email },
          profile: studentProfile,
          error: null,
        };
      }

      // 3. Default Demo Student Account
      const isStudent =
        cleanEmail === 'bilal.student@gmail.com' ||
        cleanEmail === 'student@studyhub.edu';

      if (isStudent) {
        if (password !== 'password123') {
          return {
            user: null,
            profile: null,
            error: new Error('Incorrect password. For demo student, use password: password123'),
          };
        }
        return {
          user: { id: SAMPLE_STUDENT.id, email: SAMPLE_STUDENT.email },
          profile: SAMPLE_STUDENT,
          error: null,
        };
      }

      // 4. Unrecognized Account
      return {
        user: null,
        profile: null,
        error: new Error('No account found with this email. Enrolled students must redeem their invitation token first.'),
      };
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
      const cleanEmail = email.trim().toLowerCase();
      const registered = JSON.parse(
        localStorage.getItem('studyhub_registered_students') || '[]'
      ) as Array<{ email: string; password: string; name: string; token: string }>;

      // Add or update
      const filtered = registered.filter((s) => s.email.toLowerCase() !== cleanEmail);
      filtered.push({ email: cleanEmail, password, name: fullName, token });
      localStorage.setItem('studyhub_registered_students', JSON.stringify(filtered));

      return {
        user: { id: `usr_${cleanEmail}`, email: cleanEmail },
        profile: { ...SAMPLE_STUDENT, name: fullName, email: cleanEmail },
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
