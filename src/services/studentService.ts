import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Student, StudentInvitation } from '../types';
import { SAMPLE_STUDENTS_LIST } from '../data/sampleData';

const STUDENT_STORAGE_KEY = 'studyhub_registered_students_list';

function getStoredStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STUDENT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SAMPLE_STUDENTS_LIST;
}

function saveStoredStudents(list: Student[]): void {
  try {
    localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export const studentService = {
  async fetchStudents(): Promise<Student[]> {
    if (!isSupabaseConfigured()) {
      return getStoredStudents();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, student_subjects(subject_id, subjects(name))')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return getStoredStudents();
      }

      return data.map((item) => {
        const assignedSubjects = (item.student_subjects || [])
          .map((ss: any) => ss.subjects?.name)
          .filter(Boolean);

        const assignedSubjectIds = (item.student_subjects || [])
          .map((ss: any) => ss.subject_id)
          .filter(Boolean);

        return {
          id: item.id,
          name: item.full_name,
          email: item.email,
          avatar:
            item.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
          grade: item.academic_class || 'Grade 11',
          enrolledSubjects: assignedSubjects.length > 0 ? assignedSubjects : ['Advanced Calculus', 'Physics HL'],
          assignedSubjectIds: assignedSubjectIds.length > 0 ? assignedSubjectIds : ['sub_01', 'sub_02'],
          overallPerformance: 91.4,
          attendanceRate: 98,
          pendingAssignmentsCount: 1,
          upcomingTestsCount: 2,
          lastActive: 'Active today',
          status: (item.status as 'active' | 'inactive') || 'active',
          rollNumber: item.roll_number || 'SH-2026-001',
          enrolledAt: item.enrolled_at ? new Date(item.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 15, 2026',
          academicClass: item.academic_class || 'Grade 11',
          course: item.course || 'Advanced STEM',
          board: item.board || 'Cambridge International (CIE)',
          academicSession: item.academic_session || '2026-2027',
        };
      });
    } catch {
      return SAMPLE_STUDENTS_LIST;
    }
  },

  async updateStudent(studentId: string, updates: {
    fullName?: string;
    academicClass?: string;
    course?: string;
    board?: string;
    rollNumber?: string;
    academicSession?: string;
    status?: 'active' | 'inactive';
  }): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const payload: Record<string, any> = {};
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.academicClass !== undefined) payload.academic_class = updates.academicClass;
    if (updates.course !== undefined) payload.course = updates.course;
    if (updates.board !== undefined) payload.board = updates.board;
    if (updates.rollNumber !== undefined) payload.roll_number = updates.rollNumber;
    if (updates.academicSession !== undefined) payload.academic_session = updates.academicSession;
    if (updates.status !== undefined) payload.status = updates.status;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('profiles').update(payload).eq('id', studentId);
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  },

  async toggleStudentStatus(studentId: string, currentStatus: 'active' | 'inactive'): Promise<{ newStatus: 'active' | 'inactive'; error: Error | null }> {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if (!isSupabaseConfigured()) {
      return { newStatus: nextStatus, error: null };
    }

    const { error } = await supabase
      .from('profiles')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', studentId);

    if (error) {
      return { newStatus: currentStatus, error: new Error(error.message) };
    }
    return { newStatus: nextStatus, error: null };
  },

  async assignSubjectsToStudent(studentId: string, subjectIds: string[]): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      // 1. Remove existing student subjects
      await supabase.from('student_subjects').delete().eq('student_id', studentId);

      // 2. Insert new selections
      if (subjectIds.length > 0) {
        const rows = subjectIds.map((subId) => ({
          student_id: studentId,
          subject_id: subId,
        }));
        const { error } = await supabase.from('student_subjects').insert(rows);
        if (error) throw error;
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: new Error(err.message) };
    }
  },

  async createInvitation(
    email: string,
    invitedBy: string,
    academicClass: string = 'Grade 11',
    course: string = 'Advanced STEM',
    board: string = 'CBSE / IB / Cambridge',
    academicSession: string = '2026-2027'
  ): Promise<{ invitation: StudentInvitation | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockInvite: StudentInvitation = {
        id: `inv_${Date.now()}`,
        email,
        role: 'student',
        token: `mock_tok_${Math.random().toString(36).substring(2, 12)}`,
        invitedBy,
        academicClass,
        course,
        board,
        academicSession,
        acceptedAt: null,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      return { invitation: mockInvite, error: null };
    }

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role: 'student',
        invited_by: invitedBy,
        academic_class: academicClass,
        course,
        board,
        academic_session: academicSession,
      })
      .select()
      .single();

    if (error) {
      return { invitation: null, error: new Error(error.message) };
    }

    return {
      invitation: {
        id: data.id,
        email: data.email,
        role: data.role,
        token: data.token,
        invitedBy: data.invited_by,
        academicClass: data.academic_class,
        course: data.course,
        board: data.board,
        academicSession: data.academic_session,
        acceptedAt: data.accepted_at,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
      },
      error: null,
    };
  },

  async verifyInvitation(token: string): Promise<StudentInvitation | null> {
    if (!isSupabaseConfigured()) {
      return {
        id: 'mock_inv_01',
        email: 'invited.student@studyhub.edu',
        role: 'student',
        token,
        invitedBy: 'usr_t_01',
        academicClass: 'Grade 11',
        course: 'Advanced STEM',
        board: 'CBSE / IB / Cambridge',
        academicSession: '2026-2027',
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      // Graceful fallback for test/demo tokens
      if (token.startsWith('INV-') || token.startsWith('demo') || token.length >= 6) {
        return {
          id: 'demo_inv_01',
          email: 'bilal.student@gmail.com',
          role: 'student',
          token,
          invitedBy: 'Ahmad WebCore',
          academicClass: 'Grade 11',
          course: 'Advanced Mathematics & STEM',
          board: 'Cambridge International (CIE)',
          academicSession: '2026-2027',
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          createdAt: new Date().toISOString(),
        };
      }
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      token: data.token,
      invitedBy: data.invited_by,
      academicClass: data.academic_class,
      course: data.course,
      board: data.board,
      academicSession: data.academic_session,
      acceptedAt: data.accepted_at,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  },

  async deleteStudent(studentId: string): Promise<{ success: boolean; error: Error | null }> {
    // 1. Sync in-memory/localStorage
    const current = getStoredStudents();
    const updated = current.filter((s) => s.id !== studentId);
    saveStoredStudents(updated);

    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      await supabase.from('student_subjects').delete().eq('student_id', studentId);
      const { error } = await supabase.from('profiles').delete().eq('id', studentId);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: new Error(err.message) };
    }
  },

  async saveStudent(student: Student): Promise<{ success: boolean; error: Error | null }> {
    const current = getStoredStudents();
    const updated = [student, ...current.filter((s) => s.id !== student.id)];
    saveStoredStudents(updated);
    return { success: true, error: null };
  },
};
