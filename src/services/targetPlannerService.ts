// StudyHub 3-Month Target Planner & Syllabus Completion Engine
// Manages the February 28th Target Completion Deadline & May Board Examination Schedule
// Enforces: Weekly Subject Timetable (Mon-Sat, Sunday OFF), Daily Book Quotas, and Teacher Guidance.

export interface SubjectTargetQuota {
  subjectId: string;
  subjectName: string;
  urduName: string;
  code: string;
  assignedDay: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  accentColor: string;
  bookTitle: string;
  totalPages: number;
  completedPages: number;
  totalChapters: number;
  completedChapters: number;
  dailyPageTarget: number;
  dailyTopicsTarget: string;
  teacherGuideNote: string;
  keyExamTips: string[];
}

export interface TargetPlannerStats {
  targetDate: string; // '2027-02-28'
  boardExamDate: string; // '2027-05-15'
  daysToTarget: number;
  activeStudyDaysToTarget: number; // excluding Sundays
  daysToExams: number;
  overallCompletionPercentage: number;
  totalBookPages: number;
  totalCompletedPages: number;
  subjectsQuota: SubjectTargetQuota[];
}

const STORAGE_KEY = 'studyhub_target_planner_v1';

const INITIAL_SUBJECT_QUOTAS: SubjectTargetQuota[] = [
  {
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    urduName: 'Health & Physical Education',
    code: 'FSC-PED-11',
    assignedDay: 'Monday',
    accentColor: '#10B981',
    bookTitle: 'Health & Physical Education (1st Year PTB)',
    totalPages: 140,
    completedPages: 52,
    totalChapters: 8,
    completedChapters: 3,
    dailyPageTarget: 2,
    dailyTopicsTarget: '1 Topic + 3 Board Short Questions',
    teacherGuideNote: 'Focus heavily on human circulatory and muscular systems diagrams and athletics track dimensions.',
    keyExamTips: [
      'Memorize heart chamber flow diagrams and respiratory exchange equations.',
      'Practice 400m track lane measurements and baton exchange zone rules.',
      'Prepare first aid procedures for fractures, sprains, and heat stroke.',
    ],
  },
  {
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    urduName: 'Urdu Compulsory & Grammar',
    code: 'FSC-URD-11',
    assignedDay: 'Tuesday',
    accentColor: '#8B5CF6',
    bookTitle: 'Sarmaya-e-Urdu & Qawaid-o-Insha (1st Year)',
    totalPages: 180,
    completedPages: 68,
    totalChapters: 14,
    completedChapters: 5,
    dailyPageTarget: 2.5,
    dailyTopicsTarget: '1 Lesson Section / 2 Verses Analysis + 1 Grammar Rule',
    teacherGuideNote: 'Master précis (khulasa) formatting with quotes and learn the precise layout of official applications and letters.',
    keyExamTips: [
      'Write Uswa-e-Hasna and Apni Madad Aap summaries in precise 1/3 board length.',
      'Secure 3 full format marks in formal letters (exam center, date, salutations).',
      'Learn definitions and 2 poetic examples each for Tashbeeh, Istiara, and Talmeeh.',
    ],
  },
  {
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    urduName: 'English Compulsory & Composition',
    code: 'FSC-ENG-11',
    assignedDay: 'Wednesday',
    accentColor: '#3B82F6',
    bookTitle: 'English Book 1 (Short Stories) & Grammar Guide',
    totalPages: 190,
    completedPages: 76,
    totalChapters: 15,
    completedChapters: 6,
    dailyPageTarget: 2.5,
    dailyTopicsTarget: '1 Short Story / Play Act + 5 Pair of Words & 1 Tense Drill',
    teacherGuideNote: 'Write short answers strictly within 3–4 lines and memorize board-favourite pairs of words and idioms.',
    keyExamTips: [
      'Themes of Button Button, Clearing in the Sky, and Thank You M’am.',
      'Direct/Indirect speech punctuation changes in assertive and interrogative sentences.',
      'Active to passive voice with prepositional verbs (laugh at, look after).',
    ],
  },
  {
    subjectId: 'sub_04',
    subjectName: 'Computer Science',
    urduName: 'Computer Science Theory & Practice',
    code: 'FSC-CSC-11',
    assignedDay: 'Thursday',
    accentColor: '#14B866',
    bookTitle: 'Computer Science 1st Year (Official Textbook)',
    totalPages: 240,
    completedPages: 96,
    totalChapters: 10,
    completedChapters: 4,
    dailyPageTarget: 3,
    dailyTopicsTarget: '1 Core Architecture Concept + Practical Code / Topology Diagram',
    teacherGuideNote: 'Master computer networking concepts and hardware flow using the AI Study Assistant for practical analogies.',
    keyExamTips: [
      'Compare Bus, Star, Ring, and Mesh topologies with pros, cons, and packet flow.',
      'Internal CPU working: Fetch-Decode-Execute cycle, ALU, Control Unit, and Registers.',
      'Differentiate between LAN, MAN, WAN, and Client-Server vs Peer-to-Peer models.',
    ],
  },
  {
    subjectId: 'sub_05',
    subjectName: 'Islamiyat & Tarjuma-tul-Quran',
    urduName: 'Islamic Studies & Quranic Translation',
    code: 'FSC-ISL-11',
    assignedDay: 'Friday',
    accentColor: '#0EA5E9',
    bookTitle: 'Islamiyat Compulsory & Tarjuma-tul-Quran Majeed',
    totalPages: 130,
    completedPages: 58,
    totalChapters: 10,
    completedChapters: 4,
    dailyPageTarget: 2,
    dailyTopicsTarget: '1 Surah Translation + 1 Creed/Worship Question',
    teacherGuideNote: 'Study accurate translation and comprehend the background context of Surah Al-Baqarah and Al-Anfal.',
    keyExamTips: [
      'Arguments for Monotheism (Tawheed), Prophethood (Risalat), and Hereafter (Akhirat).',
      'Accurate and fluent contextual translation of selected Quranic verses.',
      'Societal and economic impact of Zakat and Rights of Fellow Citizens (Huqooq-ul-Ibad).',
    ],
  },
  {
    subjectId: 'sub_06',
    subjectName: 'Economics',
    urduName: 'Principles of Economics',
    code: 'FSC-ECO-11',
    assignedDay: 'Saturday',
    accentColor: '#F59E0B',
    bookTitle: 'Principles of Economics (1st Year PTB)',
    totalPages: 210,
    completedPages: 74,
    totalChapters: 10,
    completedChapters: 3,
    dailyPageTarget: 2.8,
    dailyTopicsTarget: '1 Law / Diagram + Schedule Tables & Equilibrium Curves',
    teacherGuideNote: 'Economics demands clean geometric graphs with proper X/Y axis labels (Price vs Quantity Demanded/Supplied).',
    keyExamTips: [
      'Law of Diminishing Marginal Utility with complete data table and curve.',
      'Market Equilibrium point where Demand equals Supply (D = S).',
      'Methods of measuring National Income (Product, Income, and Expenditure methods).',
    ],
  },
];

class TargetPlannerService {
  private quotas: SubjectTargetQuota[] = [];

  constructor() {
    this.loadState();
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.quotas = JSON.parse(stored);
      } else {
        this.quotas = [...INITIAL_SUBJECT_QUOTAS];
        this.saveState();
      }
    } catch {
      this.quotas = [...INITIAL_SUBJECT_QUOTAS];
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotas));
    } catch {
      // storage unavailable
    }
  }

  public getPlannerStats(): TargetPlannerStats {
    this.loadState();
    const now = new Date();
    // February 28, 2027 deadline
    const targetDateObj = new Date('2027-02-28T23:59:59');
    // May 15, 2027 Board Exams
    const examDateObj = new Date('2027-05-15T09:00:00');

    const diffTargetMs = targetDateObj.getTime() - now.getTime();
    const daysToTarget = Math.max(1, Math.ceil(diffTargetMs / (1000 * 60 * 60 * 24)));

    const diffExamMs = examDateObj.getTime() - now.getTime();
    const daysToExams = Math.max(1, Math.ceil(diffExamMs / (1000 * 60 * 60 * 24)));

    // Active study days (subtracting Sundays, approx 6/7)
    const activeStudyDaysToTarget = Math.max(1, Math.round(daysToTarget * (6 / 7)));

    const totalBookPages = this.quotas.reduce((acc, q) => acc + q.totalPages, 0);
    const totalCompletedPages = this.quotas.reduce((acc, q) => acc + q.completedPages, 0);
    const overallCompletionPercentage = Math.round((totalCompletedPages / totalBookPages) * 100);

    // Calculate dynamic daily target for each subject based on remaining active study days
    const updatedQuotas = this.quotas.map((q) => {
      const remainingPages = Math.max(0, q.totalPages - q.completedPages);
      // Since each subject has 1 dedicated day per week, calculate number of subject sessions remaining
      const weeksRemaining = Math.max(1, Math.ceil(activeStudyDaysToTarget / 6));
      const pagesPerSession = (remainingPages / weeksRemaining).toFixed(1);

      return {
        ...q,
        dailyPageTarget: parseFloat(pagesPerSession),
      };
    });

    return {
      targetDate: '2027-02-28',
      boardExamDate: '2027-05-15',
      daysToTarget,
      activeStudyDaysToTarget,
      daysToExams,
      overallCompletionPercentage,
      totalBookPages,
      totalCompletedPages,
      subjectsQuota: updatedQuotas,
    };
  }

  public updateSubjectProgress(subjectId: string, additionalPages: number): TargetPlannerStats {
    this.loadState();
    const index = this.quotas.findIndex((q) => q.subjectId === subjectId);
    if (index !== -1) {
      const q = this.quotas[index];
      const nextPages = Math.min(q.totalPages, q.completedPages + additionalPages);
      const ratio = nextPages / q.totalPages;
      const nextChapters = Math.min(q.totalChapters, Math.round(ratio * q.totalChapters));

      this.quotas[index] = {
        ...q,
        completedPages: nextPages,
        completedChapters: nextChapters,
      };
      this.saveState();
    }
    return this.getPlannerStats();
  }

  public recordStudySession(subjectId: string, pages: number = 1): TargetPlannerStats {
    return this.updateSubjectProgress(subjectId, pages);
  }

  public getSubjectQuota(subjectId: string): SubjectTargetQuota | undefined {
    this.loadState();
    return this.quotas.find((q) => q.subjectId === subjectId);
  }

  public getTodayTarget(): {
    dayOfWeek: string;
    quota?: SubjectTargetQuota;
    isSundayOff: boolean;
  } {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
    const todayName = days[new Date().getDay()];

    if (todayName === 'Sunday') {
      return {
        dayOfWeek: 'Sunday',
        isSundayOff: true,
      };
    }

    const quota = this.quotas.find((q) => q.assignedDay === todayName);
    return {
      dayOfWeek: todayName,
      quota,
      isSundayOff: false,
    };
  }
}

export const targetPlannerService = new TargetPlannerService();
