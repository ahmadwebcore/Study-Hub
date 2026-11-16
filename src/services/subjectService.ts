import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Subject, SyllabusUnit } from '../types';
import { SAMPLE_SUBJECTS, SAMPLE_SYLLABUS } from '../data/sampleData';

export const subjectService = {
  async fetchSubjects(): Promise<Subject[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_SUBJECTS;
    }

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*, profiles:teacher_id(full_name), syllabus_units(count), student_subjects(count)')
        .order('name');

      if (error || !data || data.length === 0) {
        return SAMPLE_SUBJECTS;
      }

      return data.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        teacherName: item.profiles?.full_name || 'Ahmad',
        teacherId: item.teacher_id,
        accentColor: item.accent_color || '#14B866',
        totalModules: item.total_modules || 12,
        completedModules: Math.floor((item.total_modules || 12) * 0.7),
        nextClassTime: item.next_class_time || 'Today at 02:30 PM',
        scheduleDays: item.schedule_days || ['Mon', 'Wed', 'Fri'],
        progress: 72,
        category: (item.category as Subject['category']) || 'Compulsory',
        course: item.course || '1st Year FA-IT (Intermediate Part 1)',
        academicSession: item.academic_session || '2026-2027',
        description: item.description || '',
        chapterCount: item.syllabus_units?.[0]?.count ?? 4,
        assignedStudentCount: item.student_subjects?.[0]?.count ?? 3,
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Aug 10, 2026',
      }));
    } catch {
      return SAMPLE_SUBJECTS;
    }
  },

  async createSubject(subject: {
    name: string;
    code: string;
    totalModules: number;
    category: Subject['category'];
    course?: string;
    academicSession?: string;
    description?: string;
    accentColor?: string;
    teacherId?: string;
  }): Promise<{ subject: Subject | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockSubject: Subject = {
        id: `sub_${Date.now()}`,
        name: subject.name,
        code: subject.code.toUpperCase(),
        teacherName: 'Ahmad',
        accentColor: subject.accentColor || '#14B866',
        totalModules: subject.totalModules,
        completedModules: 0,
        nextClassTime: 'Next Monday at 10:00 AM',
        scheduleDays: ['Mon', 'Wed'],
        progress: 0,
        category: subject.category,
        course: subject.course || '1st Year FA-IT (Intermediate Part 1)',
        academicSession: subject.academicSession || '2026-2027',
        description: subject.description || '',
        chapterCount: 0,
        assignedStudentCount: 0,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };
      return { subject: mockSubject, error: null };
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: subject.name,
        code: subject.code.toUpperCase(),
        total_modules: subject.totalModules,
        category: subject.category,
        course: subject.course || '1st Year FA-IT (Intermediate Part 1)',
        academic_session: subject.academicSession || '2026-2027',
        description: subject.description,
        accent_color: subject.accentColor || '#14B866',
        teacher_id: subject.teacherId,
      })
      .select()
      .single();

    if (error) {
      return { subject: null, error: new Error(error.message) };
    }

    return {
      subject: {
        id: data.id,
        name: data.name,
        code: data.code,
        teacherName: 'Ahmad',
        accentColor: data.accent_color,
        totalModules: data.total_modules,
        completedModules: 0,
        nextClassTime: data.next_class_time,
        scheduleDays: data.schedule_days,
        progress: 0,
        category: data.category,
        course: data.course,
        academicSession: data.academic_session,
        description: data.description,
        chapterCount: 0,
        assignedStudentCount: 0,
        createdAt: new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
      error: null,
    };
  },

  async updateSubject(
    subjectId: string,
    updates: {
      name?: string;
      code?: string;
      description?: string;
      course?: string;
      academicSession?: string;
      totalModules?: number;
      category?: Subject['category'];
      accentColor?: string;
    }
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.code !== undefined) payload.code = updates.code.toUpperCase();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.course !== undefined) payload.course = updates.course;
    if (updates.academicSession !== undefined) payload.academic_session = updates.academicSession;
    if (updates.totalModules !== undefined) payload.total_modules = updates.totalModules;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.accentColor !== undefined) payload.accent_color = updates.accentColor;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('subjects').update(payload).eq('id', subjectId);
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  },

  async deleteSubject(subjectId: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  },

  async fetchSubjectStudents(subjectId: string): Promise<string[]> {
    if (!isSupabaseConfigured()) {
      return ['usr_s_01', 'usr_s_02', 'usr_s_03'];
    }

    const { data } = await supabase
      .from('student_subjects')
      .select('student_id')
      .eq('subject_id', subjectId);

    return (data || []).map((row) => row.student_id);
  },

  async assignStudentsToSubject(subjectId: string, studentIds: string[]): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      await supabase.from('student_subjects').delete().eq('subject_id', subjectId);
      if (studentIds.length > 0) {
        const rows = studentIds.map((sId) => ({
          subject_id: subjectId,
          student_id: sId,
        }));
        const { error } = await supabase.from('student_subjects').insert(rows);
        if (error) throw error;
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: new Error(err.message) };
    }
  },

  async fetchSyllabus(subjectId: string): Promise<SyllabusUnit[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId);
    }

    try {
      const { data, error } = await supabase
        .from('syllabus_units')
        .select('*, syllabus_topics(*)')
        .eq('subject_id', subjectId)
        .order('unit_number');

      if (error || !data || data.length === 0) {
        return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId);
      }

      return data.map((unit) => {
        const topics = (unit.syllabus_topics || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          estimatedHours: Number(t.estimated_hours) || 4,
          completed: Boolean(t.completed),
          notesAvailable: Boolean(t.notes_content),
          notesContent: t.notes_content,
        }));
        const completedCount = topics.filter((t: any) => t.completed).length;
        const progress = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

        return {
          id: unit.id,
          subjectId: unit.subject_id,
          subjectName: 'Computer Science',
          unitNumber: unit.unit_number,
          title: unit.title,
          description: unit.description || '',
          topics,
          progress,
        };
      });
    } catch {
      return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId);
    }
  },

  async toggleTopic(topicId: string, completed: boolean) {
    if (!isSupabaseConfigured()) return;
    await supabase.from('syllabus_topics').update({ completed }).eq('id', topicId);
  },
};
