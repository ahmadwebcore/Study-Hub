export interface MediaItem {
  id: string;
  name: string;
  originalName: string;
  category: 'syllabus' | 'submission' | 'book' | 'image' | 'notes';
  fileType: 'pdf' | 'doc' | 'docx' | 'image' | 'text';
  fileUrl: string;
  thumbnailUrl?: string;
  fileSizeBytes: number;
  formattedSize: string;
  uploadedBy: string;
  uploadedByRole: 'teacher' | 'student';
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  uploadedAt: string;
  description?: string;
  tasksGenerated?: boolean;
}

const STORAGE_KEY = 'studyhub_media_library';

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med_001',
    name: 'FSc_Part1_Physics_PunjabBoard_Syllabus.pdf',
    originalName: 'FSc Part 1 Physics Punjab Board Official Syllabus.pdf',
    category: 'syllabus',
    fileType: 'pdf',
    fileUrl: '/mock-materials/fsc_physics_11_syllabus.pdf',
    fileSizeBytes: 2450000,
    formattedSize: '2.34 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_fsc_phy11',
    subjectName: 'Physics (1st Year FSc)',
    subjectCode: 'PHY-11',
    uploadedAt: 'Nov 12, 2026',
    description: 'Punjab & Federal Board official Intermediate Part 1 Physics breakdown: Measurements, Vectors, Work & Energy, Circular Motion.',
    tasksGenerated: true,
  },
  {
    id: 'med_002',
    name: 'Math_Calculus_Differential_Equations_Roadmap.docx',
    originalName: 'Mathematics 12th Differentiation & Analytic Geometry.docx',
    category: 'syllabus',
    fileType: 'docx',
    fileUrl: '/mock-materials/math_12_differentiation_roadmap.docx',
    fileSizeBytes: 1280000,
    formattedSize: '1.22 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_fsc_math12',
    subjectName: 'Mathematics (2nd Year FSc)',
    subjectCode: 'MATH-12',
    uploadedAt: 'Nov 11, 2026',
    description: 'FSc Part 2 Calculus roadmap: Functions & Limits, Differentiation, Integration by Parts, Conic Sections.',
    tasksGenerated: true,
  },
  {
    id: 'med_003',
    name: 'Chemistry_Organic_Mechanisms_Notes_Screenshot.png',
    originalName: 'Screenshot 2026-11-10 Alkyl Halides Reactions.png',
    category: 'image',
    fileType: 'image',
    fileUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=300&auto=format&fit=crop',
    fileSizeBytes: 864000,
    formattedSize: '844 KB',
    uploadedBy: 'Henza Noor',
    uploadedByRole: 'student',
    subjectId: 'sub_fsc_chem12',
    subjectName: 'Chemistry (2nd Year FSc)',
    subjectCode: 'CHEM-12',
    uploadedAt: 'Nov 10, 2026',
    description: 'Screenshot of handwritten reaction mechanism notes for SN1 vs SN2 kinetics uploaded for faculty review.',
    tasksGenerated: false,
  },
  {
    id: 'med_004',
    name: 'Physics_Electrostatics_Chapter_Worksheet.pdf',
    originalName: 'Electrostatics Gauss Law Practice Worksheet.pdf',
    category: 'syllabus',
    fileType: 'pdf',
    fileUrl: '/mock-materials/physics_electrostatics_worksheet.pdf',
    fileSizeBytes: 1850000,
    formattedSize: '1.76 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_fsc_phy12',
    subjectName: 'Physics (2nd Year FSc)',
    subjectCode: 'PHY-12',
    uploadedAt: 'Nov 09, 2026',
    description: 'Chapter 12 Electric Charges and Coulomb Law numerical practice problems.',
    tasksGenerated: true,
  },
  {
    id: 'med_005',
    name: 'Student_Worksheet_Calculus_Integration_Solution.png',
    originalName: 'Calculus_Integration_By_Parts_Student_Solution.png',
    category: 'submission',
    fileType: 'image',
    fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300&auto=format&fit=crop',
    fileSizeBytes: 1420000,
    formattedSize: '1.35 MB',
    uploadedBy: 'Henza Noor',
    uploadedByRole: 'student',
    subjectId: 'sub_fsc_math12',
    subjectName: 'Mathematics (2nd Year FSc)',
    subjectCode: 'MATH-12',
    uploadedAt: 'Nov 08, 2026',
    description: 'Student submitted handwritten solution page with complete step-by-step integrals for faculty sign-off.',
    tasksGenerated: false,
  },
];

class MediaService {
  private mediaItems: MediaItem[] = [];

  constructor() {
    this.loadMedia();
  }

  private loadMedia(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.mediaItems = JSON.parse(stored);
      } else {
        this.mediaItems = [...INITIAL_MEDIA_ITEMS];
        this.saveMedia();
      }
    } catch {
      this.mediaItems = [...INITIAL_MEDIA_ITEMS];
    }
  }

  private saveMedia(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mediaItems));
    } catch {
      // Ignore storage errors
    }
  }

  public getMediaItems(filterCategory?: string, searchTerm?: string): MediaItem[] {
    this.loadMedia();
    return this.mediaItems.filter((item) => {
      const matchesCategory =
        !filterCategory || filterCategory === 'all'
          ? true
          : item.category === filterCategory ||
            (filterCategory === 'image' && item.fileType === 'image') ||
            (filterCategory === 'documents' && (item.fileType === 'pdf' || item.fileType === 'doc' || item.fileType === 'docx'));

      const matchesSearch =
        !searchTerm
          ? true
          : item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.subjectName && item.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }

  public addMediaItem(item: Partial<MediaItem>): MediaItem {
    this.loadMedia();
    const bytes = item.fileSizeBytes || 1024 * 1024;
    const formatted =
      bytes > 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : `${Math.round(bytes / 1024)} KB`;

    const newItem: MediaItem = {
      id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: item.name || 'uploaded_file',
      originalName: item.originalName || item.name || 'uploaded_document',
      category: item.category || 'syllabus',
      fileType: item.fileType || 'pdf',
      fileUrl: item.fileUrl || '#preview',
      thumbnailUrl: item.thumbnailUrl,
      fileSizeBytes: bytes,
      formattedSize: item.formattedSize || formatted,
      uploadedBy: item.uploadedBy || 'Faculty Lead',
      uploadedByRole: item.uploadedByRole || 'teacher',
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      subjectCode: item.subjectCode,
      uploadedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      description: item.description,
      tasksGenerated: item.tasksGenerated || false,
    };

    this.mediaItems.unshift(newItem);
    this.saveMedia();
    return newItem;
  }

  public deleteMediaItem(id: string): boolean {
    this.loadMedia();
    const initialLength = this.mediaItems.length;
    this.mediaItems = this.mediaItems.filter((m) => m.id !== id);
    if (this.mediaItems.length !== initialLength) {
      this.saveMedia();
      return true;
    }
    return false;
  }

  public markTasksGenerated(id: string): void {
    this.loadMedia();
    const item = this.mediaItems.find((m) => m.id === id);
    if (item) {
      item.tasksGenerated = true;
      this.saveMedia();
    }
  }

  public getMediaStats() {
    this.loadMedia();
    const totalBytes = this.mediaItems.reduce((acc, curr) => acc + curr.fileSizeBytes, 0);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

    return {
      totalCount: this.mediaItems.length,
      totalBytes,
      formattedSize: `${totalMB} MB`,
      syllabusCount: this.mediaItems.filter((m) => m.category === 'syllabus').length,
      submissionsCount: this.mediaItems.filter((m) => m.category === 'submission').length,
      imagesCount: this.mediaItems.filter((m) => m.fileType === 'image').length,
      docsCount: this.mediaItems.filter((m) => m.fileType === 'pdf' || m.fileType === 'doc' || m.fileType === 'docx').length,
    };
  }
}

export const mediaService = new MediaService();
