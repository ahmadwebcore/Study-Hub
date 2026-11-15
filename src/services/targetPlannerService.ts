// StudyHub 3-Month Target Planner & Syllabus Completion Engine
// Manages the February 28th Target Completion Deadline & May Board Examination Schedule
// Enforces: Weekly Subject Timetable (Mon-Sat, Sunday OFF), Daily Book Quotas, and Teacher Guidance.

import { getLocalBooks } from './bookService';

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

const STORAGE_KEY = 'studyhub_target_planner_v5';

try {
  localStorage.removeItem('studyhub_target_planner_v1');
  localStorage.removeItem('studyhub_target_planner_v2');
  localStorage.removeItem('studyhub_target_planner_v3');
  localStorage.removeItem('studyhub_target_planner_v4');
} catch {}

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
        this.quotas = [];
        const books = getLocalBooks();
        for (const b of books) {
          this.registerBookInternal({
            subjectId: b.subjectId,
            subjectName: b.subjectName,
            code: b.subjectCode,
            bookTitle: b.title,
            totalPages: b.totalPages || 180,
          });
        }
      }
    } catch {
      this.quotas = [];
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotas));
    } catch {}
  }

  private registerBookInternal(params: {
    subjectId: string;
    subjectName: string;
    code: string;
    bookTitle: string;
    totalPages?: number;
  }): void {
    const dayMap: Record<string, SubjectTargetQuota['assignedDay']> = {
      'sub_01': 'Monday',
      'sub_02': 'Tuesday',
      'sub_03': 'Wednesday',
      'sub_04': 'Thursday',
      'sub_05': 'Friday',
      'sub_06': 'Saturday',
    };
    const colorMap: Record<string, string> = {
      'sub_01': '#10B981',
      'sub_02': '#8B5CF6',
      'sub_03': '#3B82F6',
      'sub_04': '#0EA5E9',
      'sub_05': '#059669',
      'sub_06': '#F59E0B',
    };

    const existingIndex = this.quotas.findIndex((q) => q.subjectId === params.subjectId);
    const totalPages = params.totalPages || 180;
    const newQuota: SubjectTargetQuota = {
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      urduName: params.subjectName,
      code: params.code,
      assignedDay: dayMap[params.subjectId] || 'Thursday',
      accentColor: colorMap[params.subjectId] || '#10B981',
      bookTitle: params.bookTitle,
      totalPages,
      completedPages: 0,
      totalChapters: 12,
      completedChapters: 0,
      dailyPageTarget: 2.5,
      dailyTopicsTarget: '1 Chapter Topic + 3 Board Short Questions',
      teacherGuideNote: 'Focus on textbook concepts, solved examples, and board past papers.',
      keyExamTips: [
        'Review textbook summary and key definitions.',
        'Practice board short questions and past 5-year MCQs.',
      ],
    };

    if (existingIndex >= 0) {
      this.quotas[existingIndex] = newQuota;
    } else {
      this.quotas.push(newQuota);
    }
  }

  public registerBook(params: {
    subjectId: string;
    subjectName: string;
    code: string;
    bookTitle: string;
    totalPages?: number;
  }): void {
    this.loadState();
    this.registerBookInternal(params);
    this.saveState();
  }

  public getPlannerStats(): TargetPlannerStats {
    this.loadState();
    const now = new Date();
    const targetDateObj = new Date('2027-02-28T23:59:59');
    const examDateObj = new Date('2027-05-15T09:00:00');

    const diffTargetMs = targetDateObj.getTime() - now.getTime();
    const daysToTarget = Math.max(1, Math.ceil(diffTargetMs / (1000 * 60 * 60 * 24)));

    const diffExamMs = examDateObj.getTime() - now.getTime();
    const daysToExams = Math.max(1, Math.ceil(diffExamMs / (1000 * 60 * 60 * 24)));

    const activeStudyDaysToTarget = Math.max(1, Math.round(daysToTarget * (6 / 7)));

    const totalBookPages = this.quotas.reduce((acc, q) => acc + q.totalPages, 0);
    const totalCompletedPages = this.quotas.reduce((acc, q) => acc + q.completedPages, 0);
    const overallCompletionPercentage = totalBookPages > 0 ? Math.round((totalCompletedPages / totalBookPages) * 100) : 0;

    const updatedQuotas = this.quotas.map((q) => {
      const remainingPages = Math.max(0, q.totalPages - q.completedPages);
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
