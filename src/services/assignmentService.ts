import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Assignment, AssignmentType } from '../types';
import { SAMPLE_ASSIGNMENTS } from '../data/sampleData';

export const assignmentService = {
  /**
   * Fetch assignments with full relation joins and student submission awareness
   */
  async fetchAssignments(studentId?: string): Promise<Assignment[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_ASSIGNMENTS;
    }

    try {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          topics:topic_id(title),
          assigned_student:assigned_to(full_name),
          submissions(id, student_id, submitted_at, file_name, file_url, status, score, feedback, comment)
        `)
        .order('due_date', { ascending: true });

      if (studentId) {
        query = query.or(`assigned_to.is.null,assigned_to.eq.${studentId}`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SAMPLE_ASSIGNMENTS;
      }

      const now = new Date();

      return data.map((item) => {
        // Find if this student has a submission
        const mySub = studentId
          ? item.submissions?.find((s: { student_id: string }) => s.student_id === studentId)
          : null;

        const dueDateObj = new Date(item.due_date);
        const isPastDue = now > dueDateObj;

        // Determine status
        let computedStatus: 'pending' | 'submitted' | 'graded' | 'overdue' = 'pending';
        if (mySub) {
          if (mySub.status === 'graded') {
            computedStatus = 'graded';
          } else {
            computedStatus = 'submitted';
          }
        } else if (isPastDue) {
          computedStatus = 'overdue';
        }

        return {
          id: item.id,
          title: item.title,
          subjectId: item.subject_id,
          subjectName: item.subjects?.name || 'Academic Subject',
          subjectCode: item.subjects?.code || 'SUBJ-101',
          unitId: item.unit_id,
          unitTitle: item.units?.title,
          topicId: item.topic_id,
          topicTitle: item.topics?.title,
          assignedTo: item.assigned_to,
          assignedStudentName: item.assigned_student?.full_name,
          assignmentType: (item.assignment_type as AssignmentType) || 'Homework',
          dueDate: dueDateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          assignedDate: new Date(item.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          totalMarks: item.total_marks || 50,
          description: item.description,
          submissionInstructions: item.submission_instructions,
          allowResubmission: item.allow_resubmission ?? true,
          status: studentId ? computedStatus : ('pending' as const),
          priority: item.priority || 'medium',
          submissionCount: item.submissions?.length || 0,
          totalStudents: 4,
          fileAttachmentName: item.file_attachment_name,
          fileAttachmentUrl: item.file_attachment_url,
          mySubmission: mySub
            ? {
                id: mySub.id,
                submittedAt: new Date(mySub.submitted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                fileName: mySub.file_name,
                fileUrl: mySub.file_url,
                status: mySub.status,
                score: mySub.score,
                feedback: mySub.feedback,
                comment: mySub.comment,
              }
            : undefined,
        };
      });
    } catch {
      return SAMPLE_ASSIGNMENTS;
    }
  },

  /**
   * Upload an assignment attachment file to Supabase Storage
   */
  async uploadAttachment(file: File): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: `mock-attachments/${file.name}`, error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `assignments/${Date.now()}_${sanitizedName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('syllabus-materials')
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
      return { path: data.path, error: null };
    } catch (err: unknown) {
      return { path: null, error: err instanceof Error ? err : new Error('Attachment upload failed') };
    }
  },

  /**
   * Get secure signed download URL for an attachment
   */
  async getAttachmentDownloadUrl(filePath: string): Promise<string | null> {
    if (!isSupabaseConfigured() || !filePath || filePath.startsWith('#') || filePath.startsWith('mock')) {
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from('syllabus-materials')
        .createSignedUrl(filePath, 3600); // 60 minutes

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Create a new assignment
   */
  async createAssignment(assignment: {
    title: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    unitId?: string;
    unitTitle?: string;
    topicId?: string;
    topicTitle?: string;
    assignedTo?: string;
    assignmentType?: AssignmentType;
    description: string;
    submissionInstructions?: string;
    totalMarks: number;
    dueDate: string;
    createdBy?: string;
    fileAttachmentName?: string;
    fileAttachmentUrl?: string;
  }): Promise<{ assignment: Assignment | null; error: Error | null }> {
    const finalType = assignment.assignmentType || 'Homework';
    if (!isSupabaseConfigured()) {
      const mockAsg: Assignment = {
        id: `asg_${Date.now()}`,
        title: assignment.title,
        subjectId: assignment.subjectId,
        subjectName: assignment.subjectName,
        subjectCode: assignment.subjectCode,
        unitId: assignment.unitId,
        unitTitle: assignment.unitTitle,
        topicId: assignment.topicId,
        topicTitle: assignment.topicTitle,
        assignedTo: assignment.assignedTo,
        assignmentType: finalType,
        dueDate: assignment.dueDate,
        assignedDate: 'Just now',
        totalMarks: assignment.totalMarks,
        description: assignment.description,
        submissionInstructions: assignment.submissionInstructions,
        status: 'pending',
        priority: 'medium',
        submissionCount: 0,
        totalStudents: 4,
        fileAttachmentName: assignment.fileAttachmentName,
        fileAttachmentUrl: assignment.fileAttachmentUrl,
      };
      return { assignment: mockAsg, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert({
          title: assignment.title,
          subject_id: assignment.subjectId,
          unit_id: assignment.unitId || null,
          topic_id: assignment.topicId || null,
          assigned_to: assignment.assignedTo || null,
          assignment_type: finalType,
          description: assignment.description,
          submission_instructions: assignment.submissionInstructions || null,
          total_marks: assignment.totalMarks,
          due_date: new Date(assignment.dueDate).toISOString(),
          created_by: assignment.createdBy || null,
          file_attachment_name: assignment.fileAttachmentName || null,
          file_attachment_url: assignment.fileAttachmentUrl || null,
        })
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          topics:topic_id(title),
          assigned_student:assigned_to(full_name)
        `)
        .single();

      if (error) throw error;

      return {
        assignment: {
          id: data.id,
          title: data.title,
          subjectId: data.subject_id,
          subjectName: data.subjects?.name || assignment.subjectName,
          subjectCode: data.subjects?.code || assignment.subjectCode,
          unitId: data.unit_id,
          unitTitle: data.units?.title || assignment.unitTitle,
          topicId: data.topic_id,
          topicTitle: data.topics?.title || assignment.topicTitle,
          assignedTo: data.assigned_to,
          assignedStudentName: data.assigned_student?.full_name,
          assignmentType: data.assignment_type as AssignmentType,
          dueDate: assignment.dueDate,
          assignedDate: 'Just now',
          totalMarks: data.total_marks,
          description: data.description,
          submissionInstructions: data.submission_instructions,
          status: 'pending',
          priority: data.priority,
          submissionCount: 0,
          totalStudents: 4,
          fileAttachmentName: data.file_attachment_name,
          fileAttachmentUrl: data.file_attachment_url,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { assignment: null, error: err instanceof Error ? err : new Error('Failed to create assignment') };
    }
  },

  /**
   * Delete an assignment
   */
  async deleteAssignment(id: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to delete assignment') };
    }
  },
};
