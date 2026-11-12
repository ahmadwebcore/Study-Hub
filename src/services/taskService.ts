// StudyHub Task Management & Weekly Schedule Service
// Handles daily tasks breakdown from PDFs & Syllabus, enforces Sunday Off,
// manages Teacher Approval Gate, and triggers automatic late alerts.

import { emailService } from './emailService';
import { getPakistanHoliday } from '../data/pakistanHolidays';

export interface DailyTask {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  sourceType: 'syllabus' | 'book_pdf' | 'manual';
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
    subjectName: 'Advanced Calculus & Vectors',
    subjectCode: 'MATH-301',
    sourceType: 'book_pdf',
    sourceTitle: 'Stewart Calculus (9th Edition)',
    title: 'Differential Operators & Surface Integrals',
    description: 'Read pages 340-355 and solve fundamental vector field boundary equations.',
    assignedDate: '2026-11-09',
    dueDate: '2026-11-09',
    dayOfWeek: 'Monday',
    isSundayOff: false,
    pagesRange: 'Pages 340 - 355',
    estimatedMinutes: 60,
    status: 'approved',
    studentSubmission: {
      submittedAt: 'Nov 09, 2026 at 06:15 PM',
      notes: 'Completed all 5 surface integral exercises with complete working calculations.',
    },
    approval: {
      approvedBy: 'Ahmad WebCore',
      approvedAt: 'Nov 09, 2026 at 08:30 PM',
      feedback: 'Verified. Working calculations are rigorous and notation is exact.',
    },
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
  },
  {
    id: 'tsk_02',
    subjectId: 'sub_01',
    subjectName: 'Advanced Calculus & Vectors',
    subjectCode: 'MATH-301',
    sourceType: 'book_pdf',
    sourceTitle: 'Stewart Calculus (9th Edition)',
    title: 'Stokes Theorem & Curl Fields Formulation',
    description: 'Read pages 356-370 and complete the curl field parameterization exercise.',
    assignedDate: '2026-11-10',
    dueDate: '2026-11-10',
    dayOfWeek: 'Tuesday',
    isSundayOff: false,
    pagesRange: 'Pages 356 - 370',
    estimatedMinutes: 75,
    status: 'approved',
    studentSubmission: {
      submittedAt: 'Nov 10, 2026 at 05:40 PM',
      notes: 'Attached scanned notes on Stokes theorem proof.',
    },
    approval: {
      approvedBy: 'Ahmad WebCore',
      approvedAt: 'Nov 10, 2026 at 07:15 PM',
      feedback: 'Good proof steps. Well done.',
    },
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
  },
  {
    id: 'tsk_03',
    subjectId: 'sub_02',
    subjectName: 'Quantum Physics & Mechanics',
    subjectCode: 'PHYS-202',
    sourceType: 'syllabus',
    sourceTitle: 'Syllabus Unit 2: Wave Mechanics',
    title: 'Time-Independent Schrödinger Equation Derivation',
    description: 'Study syllabus unit 2.1 notes and write out particle in a box wave function.',
    assignedDate: '2026-11-11',
    dueDate: '2026-11-11',
    dayOfWeek: 'Wednesday',
    isSundayOff: false,
    pagesRange: 'Pages 45 - 60',
    estimatedMinutes: 90,
    status: 'submitted_for_approval',
    studentSubmission: {
      submittedAt: 'Nov 11, 2026 at 07:00 PM',
      notes: 'Submitted wave equation solutions. Awaiting teacher review.',
    },
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
  },
  {
    id: 'tsk_04',
    subjectId: 'sub_02',
    subjectName: 'Quantum Physics & Mechanics',
    subjectCode: 'PHYS-202',
    sourceType: 'book_pdf',
    sourceTitle: 'Principles of Quantum Mechanics (Griffiths)',
    title: 'Harmonic Oscillator & Ladder Operators',
    description: 'Read Griffiths pages 120-135 and derive algebraic raising and lowering operators.',
    assignedDate: '2026-11-12',
    dueDate: '2026-11-12',
    dayOfWeek: 'Thursday',
    isSundayOff: false,
    pagesRange: 'Pages 120 - 135',
    estimatedMinutes: 80,
    status: 'pending',
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
  },
  {
    id: 'tsk_05',
    subjectId: 'sub_03',
    subjectName: 'Organic & Analytical Chemistry',
    subjectCode: 'CHEM-205',
    sourceType: 'book_pdf',
    sourceTitle: 'Organic Chemistry Lab Manual',
    title: 'Electrophilic Aromatic Substitution Reaction Steps',
    description: 'Review mechanism steps for benzene nitration and halogenation in lab manual.',
    assignedDate: '2026-11-13',
    dueDate: '2026-11-13',
    dayOfWeek: 'Friday',
    isSundayOff: false,
    pagesRange: 'Pages 80 - 95',
    estimatedMinutes: 60,
    status: 'pending',
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
  },
  {
    id: 'tsk_06',
    subjectId: 'sub_04',
    subjectName: 'Data Structures & Algorithms',
    subjectCode: 'CS-401',
    sourceType: 'syllabus',
    sourceTitle: 'Syllabus Unit 3: Dynamic Programming',
    title: 'Longest Common Subsequence & Memoization Table',
    description: 'Implement DP bottom-up tabular approach for LCS problem.',
    assignedDate: '2026-11-14',
    dueDate: '2026-11-14',
    dayOfWeek: 'Saturday',
    isSundayOff: false,
    pagesRange: 'Pages 210 - 225',
    estimatedMinutes: 90,
    status: 'pending',
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
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
    studentName: 'Bilal Ahmad',
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
    urduName: 'یومِ اقبال',
    estimatedMinutes: 0,
    status: 'approved',
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
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
    urduName: 'یومِ قائد اعظم و کرسمس',
    estimatedMinutes: 0,
    status: 'approved',
    studentId: 'usr_student_demo',
    studentName: 'Bilal Ahmad',
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
    const studentName = params.studentName || 'Bilal Ahmad';

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
        approvedBy: teacherName || 'Ahmad WebCore',
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
          studentEmail: 'bilal.student@gmail.com',
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
