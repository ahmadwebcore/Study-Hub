// StudyHub Task Management & Weekly Schedule Service
// Handles daily tasks breakdown from PDFs & Syllabus, enforces Sunday Off,
// manages Teacher Approval Gate, and triggers automatic late alerts.

import { emailService } from './emailService';
import { testService } from './testService';
import { notificationService } from './notificationService';
import { getPakistanHoliday } from '../data/pakistanHolidays';

export interface DailyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  sourceType: 'syllabus' | 'book_pdf' | 'manual' | 'document' | 'screenshot';
  sourceTitle: string;
  title: string;
  description: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isSundayOff: boolean;
  isPakistanHoliday?: boolean;
  holidayName?: string;
  urduName?: string;
  priority?: 'low' | 'normal' | 'high';
  pagesRange?: string;
  estimatedMinutes: number;
  status: 'pending' | 'submitted_for_approval' | 'approved' | 'revision_requested' | 'overdue';
  studentSubmission?: {
    submittedAt: string;
    notes: string;
    attachmentUrl?: string;
    attachmentName?: string;
  };
  approval?: {
    approvedBy: string;
    approvedAt: string;
    feedback?: string;
  };
  overdueAlertSent?: boolean;
  studentId: string;
  studentName: string;
}

const STORAGE_KEY = 'studyhub_weekly_daily_tasks_v6';

// Helpers to format dates and get day of week
const DAY_NAMES: DailyTask['dayOfWeek'][] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Initial realistic seed tasks for 1st Year FA-IT (BISE DG Khan)
const SEED_TASKS: DailyTask[] = [];

class TaskService {
  private tasks: DailyTask[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let loaded = JSON.parse(stored) as DailyTask[];
        // Sanitize legacy data: replace any legacy Math/FSc Pre-Engineering tasks with FA-IT & enforce "Ahmad"
        const hasLegacyMath = loaded.some(
          (t) => (t.subjectCode && t.subjectCode.includes('MATH')) || (t.title && t.title.includes('Calculus'))
        );
        if (hasLegacyMath) {
          loaded = [...SEED_TASKS];
        } else {
          loaded = loaded.map((t) => {
            if (t.approval && t.approval.approvedBy && t.approval.approvedBy.includes('WebCore')) {
              t.approval.approvedBy = 'Ahmad';
            }
            if (t.subjectCode && t.subjectCode.startsWith('FSC-')) {
              t.subjectCode = t.subjectCode.replace('FSC-', 'FAIT-');
            }
            return t;
          });
        }
        this.tasks = loaded;
      } else {
        this.tasks = [...SEED_TASKS];
        this.saveTasks();
      }
    } catch {
      this.tasks = [...SEED_TASKS];
    }
  }

  private saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {
      // storage unavailable
    }
  }

  public getTasks(filters?: {
    subjectId?: string;
    status?: DailyTask['status'] | 'all';
    studentId?: string;
  }): DailyTask[] {
    this.loadTasks();
    let result = [...this.tasks];

    if (filters?.subjectId && filters.subjectId !== 'all') {
      result = result.filter((t) => t.subjectId === filters.subjectId);
    }

    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }

    if (filters?.studentId) {
      result = result.filter((t) => t.studentId === filters.studentId);
    }

    return result;
  }

  public getApprovedCompletedTasks(studentId?: string): DailyTask[] {
    this.loadTasks();
    return this.tasks.filter(
      (t) => t.status === 'approved' && !t.isSundayOff && (!studentId || t.studentId === studentId)
    );
  }

  public createCustomTask(params: {
    title: string;
    description: string;
    subjectId: string;
    subjectName: string;
    dueDate: string;
    estimatedMinutes?: number;
    studentId?: string;
    studentName?: string;
  }): DailyTask {
    this.loadTasks();

    const d = new Date(params.dueDate);
    const dayName = DAY_NAMES[d.getDay()] || 'Monday';
    const isSunday = d.getDay() === 0;

    const newTask: DailyTask = {
      id: `tsk_manual_${Date.now()}`,
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      subjectCode: 'FSC-TASK',
      sourceType: 'manual',
      sourceTitle: 'Custom Study Target',
      title: params.title,
      description: params.description,
      assignedDate: new Date().toISOString().slice(0, 10),
      dueDate: params.dueDate,
      dayOfWeek: dayName,
      isSundayOff: isSunday,
      estimatedMinutes: params.estimatedMinutes || 45,
      status: 'pending',
      studentId: params.studentId || 'usr_student_demo',
      studentName: params.studentName || 'Henza Noor',
    };

    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  // Generate Daily Tasks from an Uploaded PDF or Syllabus (Enforces Sunday OFF!)
  public generateDailyTasksFromSource(params: {
    sourceType: 'syllabus' | 'book_pdf';
    sourceTitle: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    studentId?: string;
    studentName?: string;
    totalPagesOrTopics: number;
    startPage?: number;
  }): DailyTask[] {
    this.loadTasks();
    const created: DailyTask[] = [];
    const studentId = params.studentId || 'usr_student_demo';
    const studentName = params.studentName || 'Henza Noor';

    const startPage = params.startPage || 1;
    const pagesPerDay = Math.max(15, Math.ceil(params.totalPagesOrTopics / 6));

    // Schedule 7 days: Monday through Saturday with work, Sunday explicitly OFF!
    const baseDate = new Date();
    // Align to current week's Monday
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    baseDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const taskDate = new Date(baseDate);
      taskDate.setDate(baseDate.getDate() + i);

      const year = taskDate.getFullYear();
      const month = String(taskDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(taskDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      const dayName = DAY_NAMES[taskDate.getDay()];

      const isSunday = taskDate.getDay() === 0;
      const pkHoliday = getPakistanHoliday(dateStr);

      if (isSunday) {
        // Enforce Sunday OFF!
        const sundayTask: DailyTask = {
          id: `tsk_sun_${Date.now()}_${i}`,
          subjectId: params.subjectId,
          subjectName: params.subjectName,
          subjectCode: params.subjectCode,
          sourceType: params.sourceType,
          sourceTitle: params.sourceTitle,
          title: 'Sunday Off — Scheduled Rest & Light Revision',
          description: `No new syllabus pages assigned from ${params.sourceTitle}. Relax, prepare for next week, and review completed notes.`,
          assignedDate: dateStr,
          dueDate: dateStr,
          dayOfWeek: 'Sunday',
          isSundayOff: true,
          estimatedMinutes: 0,
          status: 'approved',
          studentId,
          studentName,
        };
        created.push(sundayTask);
      } else if (pkHoliday && pkHoliday.isOffDay) {
        // Enforce Pakistan Gazetted Holiday OFF!
        const holidayTask: DailyTask = {
          id: `tsk_pk_${Date.now()}_${i}`,
          subjectId: params.subjectId,
          subjectName: params.subjectName,
          subjectCode: params.subjectCode,
          sourceType: params.sourceType,
          sourceTitle: params.sourceTitle,
          title: `🇵🇰 Public Holiday — ${pkHoliday.name} (Off Day)`,
          description: `${pkHoliday.description} Official Gazetted Holiday observed across Pakistan. Zero tasks or tests scheduled.`,
          assignedDate: dateStr,
          dueDate: dateStr,
          dayOfWeek: dayName,
          isSundayOff: false,
          isPakistanHoliday: true,
          holidayName: pkHoliday.name,
          urduName: pkHoliday.urduName,
          estimatedMinutes: 0,
          status: 'approved',
          studentId,
          studentName,
        };
        created.push(holidayTask);
      } else {
        const fromPage = startPage + (i * pagesPerDay);
        const toPage = Math.min(fromPage + pagesPerDay - 1, startPage + params.totalPagesOrTopics);

        const regularTask: DailyTask = {
          id: `tsk_${Date.now()}_${i}`,
          subjectId: params.subjectId,
          subjectName: params.subjectName,
          subjectCode: params.subjectCode,
          sourceType: params.sourceType,
          sourceTitle: params.sourceTitle,
          title: `Day ${i + 1}: ${params.sourceTitle} (Pages ${fromPage} - ${toPage})`,
          description: `Daily reading and exercise target assigned from ${params.sourceTitle}. Submit notes when completed for teacher approval.`,
          assignedDate: dateStr,
          dueDate: dateStr,
          dayOfWeek: dayName,
          isSundayOff: false,
          pagesRange: `Pages ${fromPage} - ${toPage}`,
          estimatedMinutes: 60,
          status: 'pending',
          studentId,
          studentName,
        };
        created.push(regularTask);
      }
    }

    this.tasks = [...created, ...this.tasks];
    this.saveTasks();
    return created;
  }

  // Generate 1-Month (4-Week) Daily Tasks from an Uploaded PDF, Doc, or Screenshot Image
  // Strictly enforces: Monday-Saturday Active Study, Sundays OFF, Pakistan Holidays OFF
  public generateMonthlyTasksFromSource(params: {
    sourceType: 'syllabus' | 'book_pdf' | 'document' | 'screenshot';
    sourceTitle: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    studentId?: string;
    studentName?: string;
    totalWeeks?: number;
    dailyMinutes?: number;
    customTopics?: string[];
    startDate?: string;
    enforceSundayOff?: boolean;
    enforcePakistanHolidays?: boolean;
    tasksPerDay?: number;
  }): DailyTask[] {
    this.loadTasks();
    const created: DailyTask[] = [];
    const studentId = params.studentId || 'usr_student_demo';
    const studentName = params.studentName || 'Henza Noor';
    const numWeeks = params.totalWeeks || 4;
    const totalDays = numWeeks * 7;
    const dailyMinutes = params.dailyMinutes || 45;
    const enforceSunday = params.enforceSundayOff !== false;
    const enforceHolidays = params.enforcePakistanHolidays !== false;
    const tasksPerDay = params.tasksPerDay || 1;

    // Start date setup
    let baseDate: Date;
    if (params.startDate) {
      baseDate = new Date(params.startDate);
    } else {
      baseDate = new Date();
      const day = baseDate.getDay();
      const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
      baseDate.setDate(diff);
    }

    let studyDayCounter = 1;

    for (let i = 0; i < totalDays; i++) {
      const taskDate = new Date(baseDate);
      taskDate.setDate(baseDate.getDate() + i);

      const year = taskDate.getFullYear();
      const month = String(taskDate.getMonth() + 1).padStart(2, '0');
      const dateNum = String(taskDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${dateNum}`;
      const dayName = DAY_NAMES[taskDate.getDay()];

      const isSunday = taskDate.getDay() === 0;
      const pkHoliday = getPakistanHoliday(dateStr);
      const weekNumber = Math.floor(i / 7) + 1;

      if (isSunday && enforceSunday) {
        // Enforce Sunday OFF!
        const sundayTask: DailyTask = {
          id: `tsk_month_sun_${Date.now()}_${i}`,
          subjectId: params.subjectId,
          subjectName: params.subjectName,
          subjectCode: params.subjectCode,
          sourceType: params.sourceType,
          sourceTitle: params.sourceTitle,
          title: `Sunday Off — Week ${weekNumber} Rest & Revision`,
          description: `Mandatory rest day for ${params.sourceTitle}. Zero tasks or submissions required on Sundays. Consolidate weekly notes.`,
          assignedDate: dateStr,
          dueDate: dateStr,
          dayOfWeek: 'Sunday',
          isSundayOff: true,
          estimatedMinutes: 0,
          status: 'approved',
          studentId,
          studentName,
        };
        created.push(sundayTask);
      } else if (pkHoliday && pkHoliday.isOffDay && enforceHolidays) {
        // Pakistan Gazetted Holiday OFF!
        const holidayTask: DailyTask = {
          id: `tsk_month_pk_${Date.now()}_${i}`,
          subjectId: params.subjectId,
          subjectName: params.subjectName,
          subjectCode: params.subjectCode,
          sourceType: params.sourceType,
          sourceTitle: params.sourceTitle,
          title: `🇵🇰 Public Holiday — ${pkHoliday.name} (Off Day)`,
          description: `${pkHoliday.description} Official Gazetted holiday observed across Pakistan. Zero tasks or exams scheduled.`,
          assignedDate: dateStr,
          dueDate: dateStr,
          dayOfWeek: dayName,
          isSundayOff: false,
          isPakistanHoliday: true,
          holidayName: pkHoliday.name,
          urduName: pkHoliday.urduName,
          estimatedMinutes: 0,
          status: 'approved',
          studentId,
          studentName,
        };
        created.push(holidayTask);
      } else {
        const topicSuffix = params.customTopics && params.customTopics.length > 0
          ? params.customTopics[(studyDayCounter - 1) % params.customTopics.length]
          : `Module ${studyDayCounter}: Key Concepts & Numerical Problem Set`;

        for (let t = 0; t < tasksPerDay; t++) {
          const isSecond = t === 1;
          const taskTitle = isSecond
            ? `W${weekNumber} D${studyDayCounter} Practice: ${topicSuffix} (Exercises)`
            : `W${weekNumber} D${studyDayCounter}: ${topicSuffix}`;

          const regularTask: DailyTask = {
            id: `tsk_month_${Date.now()}_${i}_${t}`,
            subjectId: params.subjectId,
            subjectName: params.subjectName,
            subjectCode: params.subjectCode,
            sourceType: params.sourceType,
            sourceTitle: params.sourceTitle,
            title: taskTitle,
            description: isSecond
              ? `Solve end-of-chapter numerical questions and exercise problems for ${topicSuffix}. Submit work for teacher verification.`
              : `Daily syllabus study target derived from ${params.sourceTitle}. Study assigned section, solve practice questions, and submit your handwritten or typed solution for teacher evaluation.`,
            assignedDate: dateStr,
            dueDate: dateStr,
            dayOfWeek: dayName,
            isSundayOff: false,
            pagesRange: `Target Unit ${Math.ceil(studyDayCounter / 3)}`,
            estimatedMinutes: isSecond ? Math.round(dailyMinutes * 0.75) : dailyMinutes,
            status: 'pending',
            studentId,
            studentName,
          };
          created.push(regularTask);
        }
        studyDayCounter++;
      }
    }

    this.tasks = [...created, ...this.tasks];
    this.saveTasks();
    return created;
  }

  // Generate Daily Tasks for ENTIRE BOOK & Schedule Daily Test Series (Nov -> Feb 28 Target Deadline)
  public generateEntireBookTasksAndDailyTests(params: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    bookTitle: string;
    sourceType?: 'book_pdf' | 'syllabus' | 'document' | 'screenshot';
    totalPages?: number;
    totalChapters?: number;
    studentName?: string;
    startDate?: string;
  }): { tasks: DailyTask[]; testsCount: number } {
    this.loadTasks();
    const createdTasks: DailyTask[] = [];
    const studentId = 'usr_student_demo';
    const studentName = params.studentName || 'Henza Noor';
    const totalPages = params.totalPages || 200;
    const totalChapters = params.totalChapters || 10;
    const pagesPerChapter = Math.max(12, Math.round(totalPages / totalChapters));

    // Timetable mapping: Mon: Phys Ed, Tue: Urdu, Wed: English, Thu: Computer, Fri: Islamiyat, Sat: Economics
    const subjectDayMap: Record<string, DailyTask['dayOfWeek']> = {
      'sub_01': 'Monday',
      'sub_02': 'Tuesday',
      'sub_03': 'Wednesday',
      'sub_04': 'Thursday',
      'sub_05': 'Friday',
      'sub_06': 'Saturday',
    };
    const designatedDay = subjectDayMap[params.subjectId] || 'Thursday';

    const baseDate = params.startDate ? new Date(params.startDate) : new Date();
    // 14 weeks to complete before Feb 28th
    const totalWeeks = 14;

    for (let w = 0; w < totalWeeks; w++) {
      const chapterNum = Math.min(totalChapters, w + 1);
      const chStartPage = ((chapterNum - 1) * pagesPerChapter) + 1;
      const chEndPage = Math.min(totalPages, chapterNum * pagesPerChapter);

      for (let d = 0; d < 7; d++) {
        const taskDate = new Date(baseDate);
        taskDate.setDate(baseDate.getDate() + (w * 7) + d);

        const year = taskDate.getFullYear();
        const month = String(taskDate.getMonth() + 1).padStart(2, '0');
        const dateNum = String(taskDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dateNum}`;
        const dayName = DAY_NAMES[taskDate.getDay()];

        const isSunday = taskDate.getDay() === 0;
        const pkHoliday = getPakistanHoliday(dateStr);

        if (isSunday) {
          // Mandatory Sunday Rest Policy
          createdTasks.push({
            id: `tsk_eb_sun_${w}_${d}_${Date.now()}`,
            subjectId: params.subjectId,
            subjectName: params.subjectName,
            subjectCode: params.subjectCode,
            sourceType: params.sourceType || 'book_pdf',
            sourceTitle: params.bookTitle,
            title: `Sunday Off — Scheduled Rest & Light Revision`,
            description: `Zero new assignments from ${params.bookTitle}. Rest day for mental consolidation and past week review.`,
            assignedDate: dateStr,
            dueDate: dateStr,
            dayOfWeek: 'Sunday',
            isSundayOff: true,
            estimatedMinutes: 0,
            status: 'approved',
            studentId,
            studentName,
          });
        } else if (pkHoliday && pkHoliday.isOffDay) {
          createdTasks.push({
            id: `tsk_eb_pk_${w}_${d}_${Date.now()}`,
            subjectId: params.subjectId,
            subjectName: params.subjectName,
            subjectCode: params.subjectCode,
            sourceType: params.sourceType || 'book_pdf',
            sourceTitle: params.bookTitle,
            title: `🇵🇰 Public Holiday — ${pkHoliday.name} (Off Day)`,
            description: `${pkHoliday.description} Observed across Pakistan. Zero tasks scheduled.`,
            assignedDate: dateStr,
            dueDate: dateStr,
            dayOfWeek: dayName,
            isSundayOff: false,
            isPakistanHoliday: true,
            holidayName: pkHoliday.name,
            urduName: pkHoliday.urduName,
            estimatedMinutes: 0,
            status: 'approved',
            studentId,
            studentName,
          });
        } else if (dayName === designatedDay) {
          // Primary Intensive Chapter Day (e.g. Thursday for Computer Science)
          createdTasks.push({
            id: `tsk_eb_core_${w}_${d}_${Date.now()}`,
            subjectId: params.subjectId,
            subjectName: params.subjectName,
            subjectCode: params.subjectCode,
            sourceType: params.sourceType || 'book_pdf',
            sourceTitle: params.bookTitle,
            title: `Week ${w + 1} Deep Study: Chapter ${chapterNum} (Pages ${chStartPage}–${chEndPage})`,
            description: `Primary subject study day for ${params.subjectName}. Read chapter ${chapterNum} in ${params.bookTitle}, complete numericals & practice questions, then prepare for the 50-mark Daily Test.`,
            assignedDate: dateStr,
            dueDate: dateStr,
            dayOfWeek: dayName,
            isSundayOff: false,
            pagesRange: `Pages ${chStartPage} – ${chEndPage}`,
            estimatedMinutes: 60,
            priority: 'high',
            status: 'pending',
            studentId,
            studentName,
          });
        } else {
          // Daily Reading Quota Day (~2.5 pages / day to hit Feb 28 deadline)
          const dailySubPage = chStartPage + Math.min(pagesPerChapter, d * 3);
          createdTasks.push({
            id: `tsk_eb_quota_${w}_${d}_${Date.now()}`,
            subjectId: params.subjectId,
            subjectName: params.subjectName,
            subjectCode: params.subjectCode,
            sourceType: params.sourceType || 'book_pdf',
            sourceTitle: params.bookTitle,
            title: `Daily Reading Quota: ${params.subjectName} (Target: ~2.5 Pages)`,
            description: `Review Chapter ${chapterNum} key definitions and 3 board exam short questions from ${params.bookTitle} (Page ~${dailySubPage}).`,
            assignedDate: dateStr,
            dueDate: dateStr,
            dayOfWeek: dayName,
            isSundayOff: false,
            pagesRange: `Page ~${dailySubPage}`,
            estimatedMinutes: 30,
            status: 'pending',
            studentId,
            studentName,
          });
        }
      }
    }

    // Schedule Daily Test Series in testService
    const scheduledTests = testService.scheduleDailyTestsForBook({
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      subjectCode: params.subjectCode,
      bookTitle: params.bookTitle,
      assignedDay: designatedDay as any,
      totalWeeks: 12,
      startDate: params.startDate,
    });

    // Save newly created tasks
    this.tasks = [...createdTasks, ...this.tasks];
    this.saveTasks();

    // Dispatch Student Gmail Alert
    emailService.dispatchManualNotification({
      recipientEmail: 'student@studyhub.edu',
      recipientName: studentName,
      subject: `📚 Entire Book Loaded: Daily Tasks & Test Series for ${params.subjectName}`,
      message: `Faculty Lead Ahmad uploaded "${params.bookTitle}". The entire book has been broken into daily targets and a 30-mark Daily Test Series scheduled every ${designatedDay} through February 28th.`,
    });

    // Dispatch In-App Notification
    notificationService.addNotification({
      title: `📚 Entire Book Loaded: ${params.subjectName}`,
      message: `All chapters and daily tasks scheduled through Feb 28th + 30-mark Daily Tests created for ${designatedDay}s.`,
      category: 'assignment',
    });

    return { tasks: createdTasks, testsCount: scheduledTests.length };
  }

  // Delete a task manually
  public deleteTask(id: string): boolean {
    this.loadTasks();
    const prevLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== prevLen) {
      this.saveTasks();
      return true;
    }
    return false;
  }

  // Update a task manually (Title, Due Date, Duration, Priority, Description)
  public updateTask(id: string, updates: Partial<DailyTask>): DailyTask | null {
    this.loadTasks();
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    let dayOfWeek = this.tasks[index].dayOfWeek;
    let isSundayOff = this.tasks[index].isSundayOff;

    if (updates.dueDate) {
      const d = new Date(updates.dueDate);
      const dayName = DAY_NAMES[d.getDay()] || 'Monday';
      dayOfWeek = dayName;
      isSundayOff = d.getDay() === 0;
    }

    this.tasks[index] = {
      ...this.tasks[index],
      ...updates,
      dayOfWeek,
      isSundayOff: updates.isSundayOff !== undefined ? updates.isSundayOff : isSundayOff,
    };

    this.saveTasks();
    return this.tasks[index];
  }

  // Student submits work (Enters "Awaiting Teacher Approval" gate)
  public submitTaskForApproval(
    taskId: string,
    notes: string,
    attachmentName?: string
  ): DailyTask | null {
    this.loadTasks();
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      status: 'submitted_for_approval',
      studentSubmission: {
        submittedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        notes: notes || 'Student has completed daily pages and exercises.',
        attachmentName,
      },
    };

    this.saveTasks();
    return this.tasks[taskIndex];
  }

  // Teacher Approval Gate: Work is NOT completed until Teacher approves!
  public approveTask(taskId: string, teacherName: string, feedback?: string): DailyTask | null {
    this.loadTasks();
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      status: 'approved',
      approval: {
        approvedBy: teacherName || 'Ahmad',
        approvedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        feedback: feedback || 'Work verified by faculty evaluation. Certified complete.',
      },
    };

    this.saveTasks();
    return this.tasks[taskIndex];
  }

  // Teacher requests revision
  public requestRevision(taskId: string, teacherName: string, feedback: string): DailyTask | null {
    this.loadTasks();
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      status: 'revision_requested',
      approval: {
        approvedBy: teacherName,
        approvedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        feedback: feedback || 'Please review step-by-step working and resubmit.',
      },
    };

    this.saveTasks();
    return this.tasks[taskIndex];
  }

  // Automatic Late Alerts Scanner
  public checkAndDispatchLateAlerts(): { alertedCount: number; alertedTasks: DailyTask[] } {
    this.loadTasks();
    const today = new Date().toISOString().split('T')[0];
    const alerted: DailyTask[] = [];

    this.tasks = this.tasks.map((task) => {
      if (
        !task.isSundayOff &&
        task.status === 'pending' &&
        task.dueDate < today &&
        !task.overdueAlertSent
      ) {
        // Dispatch late alert to student Gmail!
        emailService.sendDeadlineReminder({
          studentEmail: 'student@studyhub.edu',
          studentName: task.studentName,
          itemTitle: task.title,
          itemType: 'assignment',
          subjectName: task.subjectName,
          dueDate: `Overdue since ${task.dueDate}`,
          instructions: 'This daily task has passed its target deadline. Please submit your work immediately for teacher verification.',
        });

        alerted.push(task);
        return {
          ...task,
          status: 'overdue',
          overdueAlertSent: true,
        };
      }
      return task;
    });

    this.saveTasks();
    return { alertedCount: alerted.length, alertedTasks: alerted };
  }
}

export const taskService = new TaskService();
