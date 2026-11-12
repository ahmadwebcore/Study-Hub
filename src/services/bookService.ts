import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BookItem } from '../types';
import { SAMPLE_BOOKS } from '../data/sampleData';

export const bookService = {
  async fetchBooks(filters?: { subjectId?: string; category?: string; search?: string }): Promise<BookItem[]> {
    if (!isSupabaseConfigured()) {
      let result = [...SAMPLE_BOOKS];
      if (filters?.subjectId && filters.subjectId !== 'all') {
        result = result.filter((b) => b.subjectId === filters.subjectId);
      }
      if (filters?.category && filters.category !== 'all') {
        result = result.filter((b) => b.category === filters.category);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.subjectName.toLowerCase().includes(query) ||
            b.description.toLowerCase().includes(query)
        );
      }
      return result;
    }

    try {
      let query = supabase
        .from('books')
        .select('*, subjects(name, code), profiles:uploaded_by(full_name)')
        .order('uploaded_at', { ascending: false });

      if (filters?.subjectId && filters.subjectId !== 'all') {
        query = query.eq('subject_id', filters.subjectId);
      }
      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SAMPLE_BOOKS;
      }

      const mapped = data.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        subjectId: item.subject_id,
        subjectName: item.subjects?.name || 'General Curriculum',
        subjectCode: item.subjects?.code || 'GEN-101',
        category: item.category as BookItem['category'],
        fileName: item.file_name,
        fileUrl: item.file_url,
        fileSize: item.file_size || '12.4 MB',
        fileType: item.file_type || 'pdf',
        version: item.version || 1,
        uploadedAt: new Date(item.uploaded_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        uploadedBy: item.profiles?.full_name || 'Faculty Member',
      }));

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        return mapped.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.subjectName.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q)
        );
      }

      return mapped;
    } catch {
      return SAMPLE_BOOKS;
    }
  },

  async uploadBook(params: {
    title: string;
    description: string;
    subjectId: string;
    category: BookItem['category'];
    file: File;
    uploadedBy?: string;
  }): Promise<{ book: BookItem | null; error: Error | null }> {
    // 1. Validate File Size (Max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (params.file.size > MAX_SIZE) {
      return { book: null, error: new Error('File exceeds maximum allowable size of 50 MB.') };
    }

    // 2. Validate Allowed Extensions
    const ext = params.file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'docx', 'doc', 'epub', 'zip'].includes(ext)) {
      return {
        book: null,
        error: new Error('Invalid document format. Only PDF, Word (DOCX), EPUB and ZIP archives are permitted.'),
      };
    }

    const fileSizeStr = `${(params.file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (!isSupabaseConfigured()) {
      const mockBook: BookItem = {
        id: `book_${Date.now()}`,
        title: params.title,
        description: params.description,
        subjectId: params.subjectId,
        subjectName: 'Advanced Calculus & Vectors',
        subjectCode: 'MATH-301',
        category: params.category,
        fileName: params.file.name,
        fileUrl: `books/${params.file.name}`,
        fileSize: fileSizeStr,
        fileType: ext,
        version: 1,
        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        uploadedBy: 'Dr. Clara Evans',
      };
      return { book: mockBook, error: null };
    }

    try {
      // Upload file to private 'course-books' bucket
      const sanitizedName = params.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${params.subjectId}/${Date.now()}_${sanitizedName}`;

      const { error: storageError } = await supabase.storage
        .from('course-books')
        .upload(storagePath, params.file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (storageError) {
        return { book: null, error: new Error(storageError.message) };
      }

      // Record in public.books table
      const { data, error: dbError } = await supabase
        .from('books')
        .insert({
          title: params.title,
          description: params.description,
          subject_id: params.subjectId,
          category: params.category,
          file_name: params.file.name,
          file_url: storagePath,
          file_size: fileSizeStr,
          file_type: ext,
          version: 1,
          uploaded_by: params.uploadedBy,
        })
        .select('*, subjects(name, code)')
        .single();

      if (dbError) {
        return { book: null, error: new Error(dbError.message) };
      }

      return {
        book: {
          id: data.id,
          title: data.title,
          description: data.description || '',
          subjectId: data.subject_id,
          subjectName: data.subjects?.name || 'General Course',
          subjectCode: data.subjects?.code || 'GEN-101',
          category: data.category as BookItem['category'],
          fileName: data.file_name,
          fileUrl: data.file_url,
          fileSize: data.file_size,
          fileType: data.file_type,
          version: data.version,
          uploadedAt: new Date(data.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          uploadedBy: 'Faculty Member',
        },
        error: null,
      };
    } catch (err: any) {
      return { book: null, error: new Error(err.message) };
    }
  },

  async updateBook(
    bookId: string,
    updates: {
      title?: string;
      description?: string;
      category?: BookItem['category'];
      subjectId?: string;
    }
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const payload: Record<string, any> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.subjectId !== undefined) payload.subject_id = updates.subjectId;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('books').update(payload).eq('id', bookId);
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  },

  async replaceBookFile(bookId: string, newFile: File): Promise<{ success: boolean; error: Error | null }> {
    const ext = newFile.name.split('.').pop()?.toLowerCase() || '';
    const fileSizeStr = `${(newFile.size / (1024 * 1024)).toFixed(1)} MB`;

    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const sanitizedName = newFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `updates/${Date.now()}_${sanitizedName}`;

      const { error: storageError } = await supabase.storage
        .from('course-books')
        .upload(storagePath, newFile, { upsert: true });

      if (storageError) throw storageError;

      const { error: updateError } = await supabase
        .from('books')
        .update({
          file_name: newFile.name,
          file_url: storagePath,
          file_size: fileSizeStr,
          file_type: ext,
          version: supabase.rpc('increment_version', { row_id: bookId }) || 2,
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookId);

      if (updateError) throw updateError;

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: new Error(err.message) };
    }
  },

  async deleteBook(bookId: string): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    const { error } = await supabase.from('books').delete().eq('id', bookId);
    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  },

  async getSignedDownloadUrl(filePath: string): Promise<{ signedUrl: string | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { signedUrl: '#preview-download', error: null };
    }

    const { data, error } = await supabase.storage
      .from('course-books')
      .createSignedUrl(filePath, 3600); // 60 mins

    if (error) {
      return { signedUrl: null, error: new Error(error.message) };
    }
    return { signedUrl: data.signedUrl, error: null };
  },
};
