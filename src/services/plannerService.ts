import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { StudySession, StudyPlan, StudySessionStatus } from '../types';
import { SAMPLE_TODAY_SCHEDULE, SAMPLE_STUDY_PLANS } from '../data/sampleData';

export const plannerService = {
  /**
   * Fetch study sessions with optional date and student filters
   */
  async fetchSessions(filters?: { date?: string; studentId?: string }): Promise<StudySession[]> {
    if (!isSupabaseConfigured()) {
      let filtered = [...SAMPLE_TODAY_SCHEDULE];
      if (filters?.date) {
        filtered = filtered.filter((s) => s.sessionDate === filters.date);
      }
      return filtered;
    }

    try {
      let query = supabase
        .from('study_sessions')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          topics:topic_id(title)
        `)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters?.date) {
        query = query.eq('session_date', filters.date);
      }
      if (filters?.studentId) {
        query = query.or(`student_id.eq.${filters.studentId},student_id.is.null`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SAMPLE_TODAY_SCHEDULE;
      }

      return data.map((item) => ({
        id: item.id,
        studentId: item.student_id,
        subjectId: item.subject_id,
        subjectName: item.subjects?.name || 'General Academic Focus',
        subjectCode: item.subjects?.code || 'STUDY-101',
        unitId: item.unit_id,
        unitTitle: item.units?.title,
        topicId: item.topic_id,
        topicTitle: item.topics?.title,
        title: item.title,
        sessionDate: item.session_date,
        startTime: item.start_time,
        endTime: item.end_time,
        durationMinutes: item.duration_minutes || 90,
        type: item.type,
        roomOrLink: item.location_or_link || 'Seminar Room',
        locationOrLink: item.location_or_link || 'Seminar Room',
        notes: item.notes,
        status: item.status,
        createdBy: item.created_by,
      }));
    } catch {
      return SAMPLE_TODAY_SCHEDULE;
    }
  },

  /**
   * Create a new study session
   */
  async createSession(session: {
    studentId?: string;
    subjectId?: string;
    subjectName?: string;
    subjectCode?: string;
    unitId?: string;
    unitTitle?: string;
    topicId?: string;
    topicTitle?: string;
    title: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    type: 'Lecture' | 'Practice Lab' | 'Revision' | 'Self Study' | 'Reading' | 'Problem Solving';
    locationOrLink?: string;
    notes?: string;
    createdBy?: string;
  }): Promise<{ session: StudySession | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const newSession: StudySession = {
        id: `sch_${Date.now()}`,
        studentId: session.studentId,
        subjectId: session.subjectId,
        subjectName: session.subjectName || 'Advanced Calculus',
        subjectCode: session.subjectCode || 'MATH-301',
        unitId: session.unitId,
        unitTitle: session.unitTitle,
        topicId: session.topicId,
        topicTitle: session.topicTitle,
        title: session.title,
        sessionDate: session.sessionDate,
        startTime: session.startTime,
        endTime: session.endTime,
        durationMinutes: session.durationMinutes,
        type: session.type,
        locationOrLink: session.locationOrLink || 'Study Desk',
        roomOrLink: session.locationOrLink || 'Study Desk',
        notes: session.notes,
        status: 'upcoming',
        createdBy: session.createdBy,
      };
      return { session: newSession, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          student_id: session.studentId || null,
          subject_id: session.subjectId || null,
          unit_id: session.unitId || null,
          topic_id: session.topicId || null,
          title: session.title,
          session_date: session.sessionDate,
          start_time: session.startTime,
          end_time: session.endTime,
          duration_minutes: session.durationMinutes,
          type: session.type,
          location_or_link: session.locationOrLink || 'Study Desk',
          notes: session.notes,
          status: 'upcoming',
          created_by: session.createdBy || null,
        })
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          topics:topic_id(title)
        `)
        .single();

      if (error) throw error;

      return {
        session: {
          id: data.id,
          studentId: data.student_id,
          subjectId: data.subject_id,
          subjectName: data.subjects?.name || session.subjectName || 'Study Subject',
          subjectCode: data.subjects?.code || session.subjectCode || 'SUBJ',
          unitId: data.unit_id,
          unitTitle: data.units?.title || session.unitTitle,
          topicId: data.topic_id,
          topicTitle: data.topics?.title || session.topicTitle,
          title: data.title,
          sessionDate: data.session_date,
          startTime: data.start_time,
          endTime: data.end_time,
          durationMinutes: data.duration_minutes,
          type: data.type,
          locationOrLink: data.location_or_link,
          roomOrLink: data.location_or_link,
          notes: data.notes,
          status: data.status,
          createdBy: data.created_by,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { session: null, error: err instanceof Error ? err : new Error('Failed to create study session') };
    }
  },

  /**
   * Update an existing study session
   */
  async updateSession(
    id: string,
    updates: Partial<StudySession>
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const payload: Record<string, unknown> = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.sessionDate !== undefined) payload.session_date = updates.sessionDate;
      if (updates.startTime !== undefined) payload.start_time = updates.startTime;
      if (updates.endTime !== undefined) payload.end_time = updates.endTime;
      if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.locationOrLink !== undefined) payload.location_or_link = updates.locationOrLink;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.status !== undefined) payload.status = updates.status;

      const { error } = await supabase.from('study_sessions').update(payload).eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to update session') };
    }
  },

  /**
   * Delete a study session
   */
  async deleteSession(id: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('study_sessions').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to delete session') };
    }
  },

  /**
   * Quick status toggle (e.g. mark completed)
   */
  async toggleSessionStatus(
    id: string,
    status: StudySessionStatus
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to update status') };
    }
  },

  /**
   * Fetch study plans (all for teacher, or student's own)
   */
  async fetchStudyPlans(studentId?: string): Promise<StudyPlan[]> {
    if (!isSupabaseConfigured()) {
      if (studentId) {
        return SAMPLE_STUDY_PLANS.filter((p) => p.studentId === studentId);
      }
      return SAMPLE_STUDY_PLANS;
    }

    try {
      let query = supabase
        .from('study_plans')
        .select(`
          *,
          profiles:student_id(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SAMPLE_STUDY_PLANS;
      }

      return data.map((item) => ({
        id: item.id,
        studentId: item.student_id,
        studentName: item.profiles?.full_name || 'Enrolled Student',
        studentAvatar: item.profiles?.avatar_url,
        teacherId: item.teacher_id,
        title: item.title,
        weeklyGoal: item.weekly_goal,
        dailyTargetHours: item.daily_target_hours || 3.0,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        teacherNotes: item.teacher_notes,
        createdAt: new Date(item.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }));
    } catch {
      return SAMPLE_STUDY_PLANS;
    }
  },

  /**
   * Create or assign a study plan to a student
   */
  async createStudyPlan(plan: {
    studentId: string;
    studentName?: string;
    teacherId?: string;
    title: string;
    weeklyGoal: string;
    dailyTargetHours: number;
    startDate: string;
    endDate: string;
    teacherNotes?: string;
  }): Promise<{ plan: StudyPlan | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockPlan: StudyPlan = {
        id: `plan_${Date.now()}`,
        studentId: plan.studentId,
        studentName: plan.studentName || 'Student',
        teacherId: plan.teacherId,
        title: plan.title,
        weeklyGoal: plan.weeklyGoal,
        dailyTargetHours: plan.dailyTargetHours,
        startDate: plan.startDate,
        endDate: plan.endDate,
        status: 'approved',
        teacherNotes: plan.teacherNotes,
        createdAt: 'Just now',
        totalSessions: 12,
        completedSessions: 0,
      };
      return { plan: mockPlan, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          student_id: plan.studentId,
          teacher_id: plan.teacherId || null,
          title: plan.title,
          weekly_goal: plan.weeklyGoal,
          daily_target_hours: plan.dailyTargetHours,
          start_date: plan.startDate,
          end_date: plan.endDate,
          status: 'approved',
          teacher_notes: plan.teacherNotes || null,
        })
        .select(`
          *,
          profiles:student_id(full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      return {
        plan: {
          id: data.id,
          studentId: data.student_id,
          studentName: data.profiles?.full_name || plan.studentName || 'Student',
          studentAvatar: data.profiles?.avatar_url,
          teacherId: data.teacher_id,
          title: data.title,
          weeklyGoal: data.weekly_goal,
          dailyTargetHours: data.daily_target_hours,
          startDate: data.start_date,
          endDate: data.end_date,
          status: data.status,
          teacherNotes: data.teacher_notes,
          createdAt: 'Just now',
        },
        error: null,
      };
    } catch (err: unknown) {
      return { plan: null, error: err instanceof Error ? err : new Error('Failed to create study plan') };
    }
  },

  /**
   * Teacher approves or rejects a student plan
   */
  async updatePlanStatus(
    planId: string,
    status: 'approved' | 'rejected',
    teacherNotes?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const payload: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (teacherNotes !== undefined) payload.teacher_notes = teacherNotes;

      const { error } = await supabase.from('study_plans').update(payload).eq('id', planId);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to update plan') };
    }
  },
};
