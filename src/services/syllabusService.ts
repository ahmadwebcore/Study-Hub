import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SyllabusUnit, SyllabusTopic } from '../types';
import { SAMPLE_SYLLABUS } from '../data/sampleData';

export const syllabusService = {
  async fetchHierarchicalSyllabus(subjectId: string, studentId?: string): Promise<SyllabusUnit[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId || subjectId === 'all');
    }

    try {
      // 1. Fetch chapters and topics
      const { data: units, error } = await supabase
        .from('syllabus_units')
        .select('*, subjects(name), syllabus_topics(*)')
        .eq('subject_id', subjectId)
        .order('sort_order', { ascending: true });

      if (error || !units || units.length === 0) {
        return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId);
      }

      // 2. Fetch student-specific topic progress if studentId is provided
      const progressMap = new Map<string, 'not_started' | 'in_progress' | 'completed'>();
      if (studentId) {
        const { data: progressRows } = await supabase
          .from('topic_progress')
          .select('topic_id, status')
          .eq('student_id', studentId);

        if (progressRows) {
          progressRows.forEach((row) => {
            progressMap.set(row.topic_id, row.status as 'not_started' | 'in_progress' | 'completed');
          });
        }
      }

      // 3. Map into clean hierarchical structure
      return units.map((unit) => {
        const topics = ((unit.syllabus_topics || []) as any[])
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((t) => {
            const studentStatus = progressMap.get(t.id) || (t.completed ? 'completed' : 'not_started');
            return {
              id: t.id,
              title: t.title,
              description: t.description || '',
              estimatedHours: Number(t.estimated_hours) || 4,
              completed: studentStatus === 'completed',
              notesAvailable: Boolean(t.notes_content || t.attachment_url),
              notesContent: t.notes_content,
              attachmentName: t.attachment_name,
              attachmentUrl: t.attachment_url,
              sortOrder: t.sort_order || 0,
              progressStatus: studentStatus,
            };
          });

        const completedCount = topics.filter((t) => t.completed).length;
        const progressPercentage =
          topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

        return {
          id: unit.id,
          subjectId: unit.subject_id,
          subjectName: unit.subjects?.name || 'Academic Subject',
          unitNumber: unit.unit_number,
          title: unit.title,
          description: unit.description || '',
          sortOrder: unit.sort_order || 1,
          topics,
          progress: progressPercentage,
        };
      });
    } catch {
      return SAMPLE_SYLLABUS.filter((u) => u.subjectId === subjectId);
    }
  },

  async createChapter(params: {
    subjectId: string;
    title: string;
    description: string;
    unitNumber: number;
  }): Promise<{ chapter: SyllabusUnit | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockChapter: SyllabusUnit = {
        id: `unit_${Date.now()}`,
        subjectId: params.subjectId,
        subjectName: 'Curriculum Course',
        unitNumber: params.unitNumber,
        title: params.title,
        description: params.description,
        sortOrder: params.unitNumber,
        topics: [],
        progress: 0,
      };
      return { chapter: mockChapter, error: null };
    }

    const { data, error } = await supabase
      .from('syllabus_units')
      .insert({
        subject_id: params.subjectId,
        unit_number: params.unitNumber,
        title: params.title,
        description: params.description,
        sort_order: params.unitNumber,
      })
      .select('*, subjects(name)')
      .single();

    if (error) {
      return { chapter: null, error: new Error(error.message) };
    }

    return {
      chapter: {
        id: data.id,
        subjectId: data.subject_id,
        subjectName: data.subjects?.name || 'Curriculum Course',
        unitNumber: data.unit_number,
        title: data.title,
        description: data.description || '',
        sortOrder: data.sort_order,
        topics: [],
        progress: 0,
      },
      error: null,
    };
  },

  async updateChapter(
    chapterId: string,
    updates: { title?: string; description?: string; unitNumber?: number; sortOrder?: number }
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.unitNumber !== undefined) payload.unit_number = updates.unitNumber;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

    const { error } = await supabase.from('syllabus_units').update(payload).eq('id', chapterId);
    if (error) return { success: false, error: new Error(error.message) };
    return { success: true, error: null };
  },

  async deleteChapter(chapterId: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.from('syllabus_units').delete().eq('id', chapterId);
    if (error) return { success: false, error: new Error(error.message) };
    return { success: true, error: null };
  },

  async createTopic(params: {
    unitId: string;
    title: string;
    description?: string;
    estimatedHours: number;
    notesContent?: string;
    attachmentName?: string;
    attachmentUrl?: string;
  }): Promise<{ topic: SyllabusTopic | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockTopic: SyllabusTopic = {
        id: `top_${Date.now()}`,
        title: params.title,
        description: params.description,
        estimatedHours: params.estimatedHours,
        completed: false,
        notesAvailable: Boolean(params.notesContent || params.attachmentUrl),
        notesContent: params.notesContent,
        attachmentName: params.attachmentName,
        attachmentUrl: params.attachmentUrl,
        progressStatus: 'not_started',
      };
      return { topic: mockTopic, error: null };
    }

    const { data, error } = await supabase
      .from('syllabus_topics')
      .insert({
        unit_id: params.unitId,
        title: params.title,
        description: params.description,
        estimated_hours: params.estimatedHours,
        notes_content: params.notesContent,
        attachment_name: params.attachmentName,
        attachment_url: params.attachmentUrl,
      })
      .select()
      .single();

    if (error) return { topic: null, error: new Error(error.message) };

    return {
      topic: {
        id: data.id,
        title: data.title,
        description: data.description || '',
        estimatedHours: Number(data.estimated_hours) || 4,
        completed: false,
        notesAvailable: Boolean(data.notes_content || data.attachment_url),
        notesContent: data.notes_content,
        attachmentName: data.attachment_name,
        attachmentUrl: data.attachment_url,
        sortOrder: data.sort_order || 0,
        progressStatus: 'not_started',
      },
      error: null,
    };
  },

  async updateTopic(
    topicId: string,
    updates: {
      title?: string;
      description?: string;
      estimatedHours?: number;
      notesContent?: string;
      attachmentName?: string;
      attachmentUrl?: string;
      sortOrder?: number;
    }
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.estimatedHours !== undefined) payload.estimated_hours = updates.estimatedHours;
    if (updates.notesContent !== undefined) payload.notes_content = updates.notesContent;
    if (updates.attachmentName !== undefined) payload.attachment_name = updates.attachmentName;
    if (updates.attachmentUrl !== undefined) payload.attachment_url = updates.attachmentUrl;
    if (updates.sortOrder !== undefined) payload.sort_order = updates.sortOrder;

    const { error } = await supabase.from('syllabus_topics').update(payload).eq('id', topicId);
    if (error) return { success: false, error: new Error(error.message) };
    return { success: true, error: null };
  },

  async deleteTopic(topicId: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.from('syllabus_topics').delete().eq('id', topicId);
    if (error) return { success: false, error: new Error(error.message) };
    return { success: true, error: null };
  },

  /**
   * Update student-specific topic completion status
   */
  async updateStudentTopicProgress(
    studentId: string,
    topicId: string,
    status: 'not_started' | 'in_progress' | 'completed'
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const completedAt = status === 'completed' ? new Date().toISOString() : null;

    const { error } = await supabase.from('topic_progress').upsert(
      {
        student_id: studentId,
        topic_id: topicId,
        status,
        completed_at: completedAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,topic_id' }
    );

    if (error) return { success: false, error: new Error(error.message) };
    return { success: true, error: null };
  },

  async uploadTopicAttachment(topicId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { url: `#preview-notes-${file.name}`, error: null };
    }

    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `topics/${topicId}/${Date.now()}_${sanitized}`;

      const { error: uploadError } = await supabase.storage
        .from('syllabus-materials')
        .upload(storagePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      await supabase
        .from('syllabus_topics')
        .update({ attachment_name: file.name, attachment_url: storagePath })
        .eq('id', topicId);

      return { url: storagePath, error: null };
    } catch (err: any) {
      return { url: null, error: new Error(err.message) };
    }
  },
};
