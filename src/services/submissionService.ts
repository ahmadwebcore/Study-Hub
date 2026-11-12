import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Submission } from '../types';
import { SAMPLE_SUBMISSIONS } from '../data/sampleData';

export const submissionService = {
  /**
   * Fetch all submissions (or student's own)
   */
  async fetchSubmissions(): Promise<Submission[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_SUBMISSIONS;
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignments(title, total_marks), profiles:student_id(full_name, avatar_url)')
        .order('submitted_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return SAMPLE_SUBMISSIONS;
      }

      return data.map((item) => ({
        id: item.id,
        assignmentId: item.assignment_id,
        assignmentTitle: item.assignments?.title || 'Assignment',
        studentId: item.student_id,
        studentName: item.profiles?.full_name || 'Student',
        studentAvatar: item.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        submittedAt: new Date(item.submitted_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: item.status,
        score: item.score,
        maxScore: item.assignments?.total_marks || 50,
        comment: item.comment,
        fileName: item.file_name,
        fileSize: item.file_size,
        fileUrl: item.file_url,
        feedback: item.feedback,
      }));
    } catch {
      return SAMPLE_SUBMISSIONS;
    }
  },

  /**
   * Upload student submission file (PDF or Images) to private storage
   */
  async uploadSubmissionFile(
    file: File,
    studentId: string
  ): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: `mock-submissions/${file.name}`, error: null };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniquePath = `${studentId}/${Date.now()}_${sanitizedName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('student-submissions')
        .upload(uniquePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) throw error;
      return { path: data.path, error: null };
    } catch (err: unknown) {
      return { path: null, error: err instanceof Error ? err : new Error('File upload failed') };
    }
  },

  /**
   * Get secure signed download URL for student submission
   */
  async getSubmissionDownloadUrl(filePath: string): Promise<string | null> {
    if (!isSupabaseConfigured() || !filePath || filePath.startsWith('#') || filePath.startsWith('mock')) {
      return null;
    }

    try {
      const { data, error } = await supabase.storage
        .from('student-submissions')
        .createSignedUrl(filePath, 3600);

      if (error || !data) return null;
      return data.signedUrl;
    } catch {
      return null;
    }
  },

  /**
   * Submit solution or resubmit
   */
  async submitSolution(params: {
    assignmentId: string;
    studentId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: string;
    comment?: string;
  }): Promise<{ submission: Submission | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockSubm: Submission = {
        id: `subm_${Date.now()}`,
        assignmentId: params.assignmentId,
        assignmentTitle: 'Assignment Solution',
        studentId: params.studentId,
        studentName: 'Alex Rivera',
        studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        submittedAt: 'Just now',
        status: 'submitted',
        maxScore: 50,
        comment: params.comment,
        fileName: params.fileName,
        fileSize: params.fileSize || '1.8 MB',
        fileUrl: params.fileUrl,
      };
      return { submission: mockSubm, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .upsert({
          assignment_id: params.assignmentId,
          student_id: params.studentId,
          file_name: params.fileName,
          file_url: params.fileUrl,
          file_size: params.fileSize,
          comment: params.comment,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .select('*, assignments(title, total_marks)')
        .single();

      if (error) throw error;

      return {
        submission: {
          id: data.id,
          assignmentId: data.assignment_id,
          assignmentTitle: data.assignments?.title || 'Assignment Solution',
          studentId: data.student_id,
          studentName: 'Student',
          studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
          submittedAt: 'Just now',
          status: data.status,
          maxScore: data.assignments?.total_marks || 50,
          comment: data.comment,
          fileName: data.file_name,
          fileSize: data.file_size,
          fileUrl: data.file_url,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { submission: null, error: err instanceof Error ? err : new Error('Failed to submit assignment') };
    }
  },

  /**
   * Teacher grades submission
   */
  async gradeSubmission(
    submissionId: string,
    score: number,
    feedback: string,
    gradedBy?: string
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('submissions')
        .update({
          score,
          feedback,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: gradedBy,
        })
        .eq('id', submissionId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to grade submission') };
    }
  },
};
