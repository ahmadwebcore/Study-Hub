import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const storageService = {
  /**
   * Upload student submission document to private 'student-submissions' bucket.
   * Path format: {studentId}/{assignmentId}-{filename}
   */
  async uploadSubmissionFile(
    studentId: string,
    assignmentId: string,
    file: File
  ): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: `mock-submissions/${studentId}/${file.name}`, error: null };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${studentId}/${assignmentId}_${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('student-submissions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { path: null, error: new Error(error.message) };
    }

    return { path: data.path, error: null };
  },

  /**
   * Upload syllabus reference materials to private 'syllabus-materials' bucket.
   */
  async uploadSyllabusMaterial(
    subjectCode: string,
    file: File
  ): Promise<{ path: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { path: `mock-syllabus/${subjectCode}/${file.name}`, error: null };
    }

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${subjectCode}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from('syllabus-materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      return { path: null, error: new Error(error.message) };
    }

    return { path: data.path, error: null };
  },

  /**
   * Create secure time-limited Signed Download URL for private documents.
   * Default validity: 60 minutes (3600 seconds).
   */
  async getSignedDownloadUrl(
    bucket: 'student-submissions' | 'syllabus-materials',
    path: string,
    expiresInSeconds: number = 3600
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { signedUrl: '#preview-download', error: null };
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error) {
      return { signedUrl: null, error: new Error(error.message) };
    }

    return { signedUrl: data.signedUrl, error: null };
  },
};
