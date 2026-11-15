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

const STORAGE_KEY = 'studyhub_media_library_v5';

try {
  localStorage.removeItem('studyhub_media_library');
  localStorage.removeItem('studyhub_media_library_v1');
  localStorage.removeItem('studyhub_media_library_v2');
  localStorage.removeItem('studyhub_media_library_v3');
  localStorage.removeItem('studyhub_media_library_v4');
} catch {}

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'med_henza_01',
    name: 'Health_Physical_Education_11_Gilani.pdf',
    originalName: 'ہیلتھ اینڈ فزیکل ایجوکیشن گیارہویں جماعت (پروفیسر سید بشارت حسین گیلانی).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_physical_edu.jpg',
    thumbnailUrl: '/covers/cover_physical_edu.jpg',
    fileSizeBytes: 14880000,
    formattedSize: '14.2 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    subjectCode: 'FAIT-PED-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'پروفیسر سید بشارت حسین گیلانی (گولڈ میڈلسٹ)۔ کوڈ 92.97۔ انسانی جسمانی ساخت، نظام دوران خون، تنفس اور اتھلیٹکس قوانین۔',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_02',
    name: 'Urdu_Compulsory_11_PECTAA.pdf',
    originalName: 'اُردو 11 لازمی درسی کتاب (پنجاب ایجوکیشن کریکولم PECTAA).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_urdu_ptb.jpg',
    thumbnailUrl: '/covers/cover_urdu_ptb.jpg',
    fileSizeBytes: 17610000,
    formattedSize: '16.8 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'قومی نصاب 2023 کی بنیاد پر۔ اسوہ حسنہ، اپنی مدد آپ، نظمیں، غزلیں اور مشقی سوالات۔',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_03',
    name: 'Sharh_Sarmaya_e_Urdu_11_Prof_Rao_Khalid.pdf',
    originalName: 'شرح سرمایہ اردو انشائی و معروضی 11 (پروفیسر راؤ خالد محمود).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_urdu_sharh.jpg',
    thumbnailUrl: '/covers/cover_urdu_sharh.jpg',
    fileSizeBytes: 23590000,
    formattedSize: '22.5 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'کیپٹن سیریز خان پور / رحیم یار خان۔ مکمل خلاصہ جات، تشریحات، خطوط، مکالمات، درخواستی فریم ورک اور معروضی حل۔',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_04',
    name: 'English_11_Textbook_PECTAA.pdf',
    originalName: 'English 11 Textbook (Punjab Curriculum & Textbook Board PECTAA).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_english_ptb.png',
    thumbnailUrl: '/covers/cover_english_ptb.png',
    fileSizeBytes: 16140000,
    formattedSize: '15.4 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FAIT-ENG-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'PECTAA Official Curriculum: Book-1 Short Stories (Button Button, Clearing in the Sky) & Book-3 Plays/Poems.',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_05',
    name: 'Sunshine_English_Comprehensive_Edition_11.pdf',
    originalName: 'Sunshine English Comprehensive Edition Intermediate Part-I (Prof. Musarrat Hussain).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_english_sunshine.png',
    thumbnailUrl: '/covers/cover_english_sunshine.png',
    fileSizeBytes: 25270000,
    formattedSize: '24.1 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FAIT-ENG-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'Sunshine Publications, Urdu Bazaar, Lahore. Complete Board Grammar: Tenses, Direct/Indirect, Active/Passive, Pairs of Words & Composition.',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_06',
    name: 'Tarjuma_tul_Quran_Majeed_Hamdard_11.pdf',
    originalName: 'ترجمۃ القرآن المجید مختصر انٹرمیڈیٹ پارٹ 1 (ہمدرد نوٹس سیریز).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_tarjuma_ptb.jpg',
    thumbnailUrl: '/covers/cover_tarjuma_ptb.jpg',
    fileSizeBytes: 14260000,
    formattedSize: '13.6 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_05',
    subjectName: 'Tarjuma-tul-Quran',
    subjectCode: 'FAIT-TQM-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'ہمدرد نوٹس سیریز / ہمدرد کتب خانہ لاہور۔ مطابق ماڈل پیپر۔ منتخب قرآنی آیات کا لفظی اور با محاورہ ترجمہ و مشقی سوالات۔',
    tasksGenerated: true,
  },
  {
    id: 'med_henza_07',
    name: 'Islamiyat_Lazmi_11_PECTAA.pdf',
    originalName: 'اسلامیات لازمی گیارہویں جماعت (پنجاب ایجوکیشن کریکولم PECTAA).pdf',
    category: 'book',
    fileType: 'pdf',
    fileUrl: '/covers/cover_islamiat_ptb.jpg',
    thumbnailUrl: '/covers/cover_islamiat_ptb.jpg',
    fileSizeBytes: 12370000,
    formattedSize: '11.8 MB',
    uploadedBy: 'Ahmad',
    uploadedByRole: 'teacher',
    subjectId: 'sub_06',
    subjectName: 'Islamiyat Lazmi',
    subjectCode: 'FAIT-ISL-11',
    uploadedAt: 'Nov 16, 2026',
    description: 'عقائد و عبادات (نماز، روزہ، زکوٰۃ، حج)، اسوہ رسول ﷺ، اور حقوق العباد۔',
    tasksGenerated: true,
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
