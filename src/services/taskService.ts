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

const STORAGE_KEY = 'studyhub_weekly_daily_tasks';

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

// Initial realistic seed tasks
const SEED_TASKS: DailyTask[] = [
  {
    id: 'tsk_01',
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    subjectCode: 'FSC-PED-11',
    sourceType: 'book_pdf',
    sourceTitle: 'Physical Education 1st Year (PTB)',
    title: 'Circulatory System Anatomy & 400m Track Examination Rules',
    description: 'Study human heart anatomy, blood circulation, and 400m track baton exchange zone rules. Solve textbook short questions.',
    assignedDate: '2026-11-09',
    dueDate: '2026-11-09',
    dayOfWeek: 'Monday',
    isSundayOff: false,
    pagesRange: 'Pages 12 - 18',
    estimatedMinutes: 60,
    status: 'approved',
    studentSubmission: {
      submittedAt: 'Nov 09, 2026 at 06:15 PM',
      notes: 'Uploaded heart diagram and track rules notes with complete labels.',
    },
    approval: {
      approvedBy: 'Ahmad',
      approvedAt: 'Nov 09, 2026 at 08:30 PM',
      feedback: 'Excellent work! Heart anatomy diagram is clear and exam outline is complete. Marks: 28/30',
    },
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_02',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FSC-URD-11',
    sourceType: 'book_pdf',
    sourceTitle: 'Sarmaya-e-Urdu (1st Year)',
    title: 'Lesson Uswa-e-Hasna Summary & Formal Letter Writing',
    description: 'Write a one-third summary of Shibli Nomani’s Uswa-e-Hasna and practice board-format letter to a friend.',
    assignedDate: '2026-11-10',
    dueDate: '2026-11-10',
    dayOfWeek: 'Tuesday',
    isSundayOff: false,
    pagesRange: 'Pages 5 - 12',
    estimatedMinutes: 75,
    status: 'approved',
    studentSubmission: {
      submittedAt: 'Nov 10, 2026 at 05:40 PM',
      notes: 'Written according to board summary length rules and letter format standards.',
    },
    approval: {
      approvedBy: 'Ahmad',
      approvedAt: 'Nov 10, 2026 at 07:15 PM',
      feedback: 'Neat presentation and accurate spelling. Summary length is strictly adhering to board guidelines. Marks: 29/30',
    },
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_03',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FSC-ENG-11',
    sourceType: 'book_pdf',
    sourceTitle: 'English Book 1 & Board Grammar',
    title: 'Button, Button Short Questions & Direct/Indirect Drill',
    description: 'Solve 5 board short questions from Button Button and convert 10 sentences to Indirect speech.',
    assignedDate: '2026-11-11',
    dueDate: '2026-11-11',
    dayOfWeek: 'Wednesday',
    isSundayOff: false,
    pagesRange: 'Pages 1 - 8',
    estimatedMinutes: 90,
    status: 'submitted_for_approval',
    studentSubmission: {
      submittedAt: 'Nov 11, 2026 at 07:00 PM',
      notes: 'Completed all 5 short answers and punctuation rules. Ready for evaluation.',
    },
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_04',
    subjectId: 'sub_04',
    subjectName: 'Computer Science',
    subjectCode: 'FSC-CSC-11',
    sourceType: 'book_pdf',
    sourceTitle: 'Computer Science 1st Year PTB',
    title: 'Network Topologies & Bus Architecture Deep Dive',
    description: 'Understand Bus, Star, and Ring topologies. Use AI Study Assistant for practical analogies and complete block diagrams.',
    assignedDate: '2026-11-12',
    dueDate: '2026-11-12',
    dayOfWeek: 'Thursday',
    isSundayOff: false,
    pagesRange: 'Pages 24 - 35',
    estimatedMinutes: 80,
    status: 'pending',
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_05',
    subjectId: 'sub_05',
    subjectName: 'Islamiyat & Tarjuma',
    subjectCode: 'FSC-ISL-11',
    sourceType: 'book_pdf',
    sourceTitle: 'Islamiyat Compulsory & Tarjuma-tul-Quran (Part 1)',
    title: 'Impact of Monotheism (Tawheed) & Surah Al-Baqarah Ruku 1',
    description: 'Study the practical impact of Tawheed on human conduct and write fluent contextual translation of Surah Al-Baqarah Verses 1–7.',
    assignedDate: '2026-11-13',
    dueDate: '2026-11-13',
    dayOfWeek: 'Friday',
    isSundayOff: false,
    pagesRange: 'Pages 1 - 10',
    estimatedMinutes: 60,
    status: 'pending',
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_06',
    subjectId: 'sub_06',
    subjectName: 'Economics',
    subjectCode: 'FSC-ECO-11',
    sourceType: 'book_pdf',
    sourceTitle: 'Principles of Economics 1st Year (Punjab Board)',
    title: 'Law of Demand Assumptions & Schedule Diagram',
    description: 'Define Law of Demand, construct schedule table, and plot the downward sloping demand curve neatly with axis markings.',
    assignedDate: '2026-11-14',
    dueDate: '2026-11-14',
    dayOfWeek: 'Saturday',
    isSundayOff: false,
    pagesRange: 'Pages 18 - 26',
    estimatedMinutes: 75,
    status: 'pending',
    studentId: 'usr_s_01',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_07',
    subjectId: 'sub_general',
    subjectName: 'Academic Rest Day',
    subjectCode: 'REST-000',
    sourceType: 'manual',
    sourceTitle: 'System Policy: Mandatory Rest Day',
    title: 'Sunday Off — Scheduled Rest & Light Self-Revision',
    description: 'No new chapters or mandatory submissions are assigned on Sunday. Relax, consolidate notes, or prepare for upcoming assessments.',
    assignedDate: '2026-11-15',
    dueDate: '2026-11-15',
    dayOfWeek: 'Sunday',
    isSundayOff: true,
    estimatedMinutes: 0,
    status: 'approved',
    studentId: 'usr_student_demo',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_pk_01',
    subjectId: 'sub_general',
    subjectName: 'National Gazetted Holiday',
    subjectCode: 'PK-OFF',
    sourceType: 'manual',
    sourceTitle: 'Pakistan Academic Calendar',
    title: '🇵🇰 Public Holiday — Iqbal Day (Off Day)',
    description: 'National gazetted holiday commemorated across Pakistan in honour of Allama Muhammad Iqbal. Zero tasks or exams scheduled.',
    assignedDate: '2026-11-09',
    dueDate: '2026-11-09',
    dayOfWeek: 'Monday',
    isSundayOff: false,
    isPakistanHoliday: true,
    holidayName: 'Iqbal Day',
    urduName: 'Youm-e-Iqbal',
    estimatedMinutes: 0,
    status: 'approved',
    studentId: 'usr_student_demo',
    studentName: 'Student Scholar',
  },
  {
    id: 'tsk_pk_02',
    subjectId: 'sub_general',
    subjectName: 'National Gazetted Holiday',
    subjectCode: 'PK-OFF',
    sourceType: 'manual',
    sourceTitle: 'Pakistan Academic Calendar',
    title: '🇵🇰 Public Holiday — Quaid-e-Azam Day & Christmas (Off Day)',
    description: 'National gazetted holiday celebrating the birth of Quaid-e-Azam Muhammad Ali Jinnah and Christmas. Official off day across all academic institutions.',
    assignedDate: '2026-12-25',
    dueDate: '2026-12-25',
    dayOfWeek: 'Friday',
    isSundayOff: false,
    isPakistanHoliday: true,
    holidayName: 'Quaid-e-Azam Day & Christmas',
    urduName: 'Quaid-e-Azam Day & Christmas',
    estimatedMinutes: 0,
    status: 'approved',
    studentId: 'usr_student_demo',
    studentName: 'Student Scholar',
  },
];

class TaskService {
  private tasks: DailyTask[] = [];

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.tasks = JSON.parse(stored);
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
      studentName: params.studentName || 'Student Scholar',
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
    const studentName = params.studentName || 'Student Scholar';

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
    const studentName = params.studentName || 'Student Scholar';
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
    const studentName = params.studentName || 'Student Scholar';
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
