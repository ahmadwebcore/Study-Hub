import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Submission, ResultRecord } from '../types';
import { SAMPLE_SUBMISSIONS } from '../data/sampleData';
import { saveLocalTestStatus, saveLocalCertifiedResult } from './testService';

const SUBMISSIONS_STORAGE_KEY = 'studyhub_submissions_v5';

export function getLocalSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SAMPLE_SUBMISSIONS;
}

export function saveLocalSubmissions(subs: Submission[]) {
  try {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(subs));
  } catch {}
}

export const submissionService = {
  /**
   * Fetch all submissions (or student's own)
   */
  async fetchSubmissions(): Promise<Submission[]> {
    if (!isSupabaseConfigured()) {
      return getLocalSubmissions();
    }

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*, assignments(title, total_marks), profiles:student_id(full_name, avatar_url)')
        .order('submitted_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return getLocalSubmissions();
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
        maxScore: item.assignments?.total_marks || 30,
        comment: item.comment,
        fileName: item.file_name,
        fileSize: item.file_size,
        fileUrl: item.file_url,
        feedback: item.feedback,
      }));
    } catch {
      return getLocalSubmissions();
    }
  },

  /**
   * Create or update student submission (supports multi-page camera/browser uploads)
   */
  async createSubmission(params: {
    assignmentId: string;
    assignmentTitle: string;
    subjectName?: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    maxScore: number;
    comment?: string;
    fileName: string;
    fileSize?: string;
    fileUrl?: string;
    pageCount?: number;
    pageThumbnails?: string[];
    isRetest?: boolean;
  }): Promise<Submission> {
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId: params.assignmentId,
      assignmentTitle: params.assignmentTitle,
      subjectName: params.subjectName,
      studentId: params.studentId,
      studentName: params.studentName,
      studentAvatar: params.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      submittedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'submitted',
      maxScore: params.maxScore || 30,
      comment: params.comment,
      fileName: params.fileName,
      fileSize: params.fileSize || '2.4 MB',
      fileUrl: params.fileUrl,
      pageCount: params.pageCount || 1,
      pageThumbnails: params.pageThumbnails,
      isRetest: params.isRetest || false,
    };

    // Update local store
    const current = getLocalSubmissions();
    const updated = [newSub, ...current.filter((s) => s.id !== newSub.id)];
    saveLocalSubmissions(updated);

    // Save test status as submitted
    if (params.assignmentId) {
      saveLocalTestStatus(params.assignmentId, 'submitted');
    }

    // Trigger reactive window events
    window.dispatchEvent(new CustomEvent('studyhub_submissions_updated', { detail: newSub }));
    window.dispatchEvent(new CustomEvent('studyhub_tests_updated', { detail: { testId: params.assignmentId, status: 'submitted' } }));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('submissions').upsert({
          id: newSub.id,
          assignment_id: params.assignmentId,
          student_id: params.studentId,
          file_name: params.fileName,
          file_url: params.fileUrl,
          file_size: params.fileSize,
          comment: params.comment,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        });
      } catch {}
    }

    return newSub;
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
    const sub = await this.createSubmission({
      assignmentId: params.assignmentId,
      assignmentTitle: 'Assignment Solution',
      studentId: params.studentId,
      studentName: 'Henza Noor',
      fileName: params.fileName,
      fileUrl: params.fileUrl,
      fileSize: params.fileSize,
      comment: params.comment,
      maxScore: 30,
    });
    return { submission: sub, error: null };
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
    const subs = getLocalSubmissions();
    const targetIdx = subs.findIndex((s) => s.id === submissionId);
    let targetSub: Submission | null = null;

    if (targetIdx >= 0) {
      targetSub = {
        ...subs[targetIdx],
        score,
        feedback,
        status: 'graded',
      };
      subs[targetIdx] = targetSub;
      saveLocalSubmissions(subs);
    }

    if (targetSub) {
      const maxMarks = targetSub.maxScore || 30;
      const passingMarks = Math.round(maxMarks * 0.5);
      const isPassed = score >= passingMarks;
      const percentage = Math.round((score / maxMarks) * 100);
      const grade =
        percentage >= 90 ? 'A*' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 50 ? 'D' : 'F';

      // Record in test statuses
      saveLocalTestStatus(targetSub.assignmentId, isPassed ? 'passed' : 'failed_retest', score);

      // Record certified result
      const certifiedResult: ResultRecord = {
        id: `cert_${Date.now()}`,
        testId: targetSub.assignmentId,
        testTitle: targetSub.assignmentTitle,
        subjectName: targetSub.subjectName || 'FA-IT Examination',
        subjectCode: 'FAIT-EXAM-11',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        studentId: targetSub.studentId,
        studentName: targetSub.studentName,
        studentAvatar: targetSub.studentAvatar,
        score,
        maxScore: maxMarks,
        percentage,
        passingMarks,
        passed: isPassed,
        grade,
        rank: isPassed ? 'Top 10%' : 'Needs Retake',
        feedback: feedback || (isPassed ? 'Verified by Faculty Lead Ahmad.' : 'Retest required. Please revise.'),
      };
      saveLocalCertifiedResult(certifiedResult);

      window.dispatchEvent(new CustomEvent('studyhub_submissions_updated', { detail: targetSub }));
      window.dispatchEvent(new CustomEvent('studyhub_tests_updated', { detail: { testId: targetSub.assignmentId, status: isPassed ? 'passed' : 'failed_retest', score } }));
      window.dispatchEvent(new CustomEvent('studyhub_certified_results_update', { detail: certifiedResult }));
    }

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
