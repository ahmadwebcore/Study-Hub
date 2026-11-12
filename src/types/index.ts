export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  avatar: string;
  avatarUrl?: string;
  title?: string;
  institution: string;
  phone?: string;
  grade?: string;

  // Student Academic Details (Requirement 4)
  academicClass?: string;     // e.g. "Grade 11"
  course?: string;            // e.g. "Advanced STEM"
  board?: string;             // e.g. "CBSE / IB / Cambridge"
  academicSession?: string;   // e.g. "2026-2027"
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentInvitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  invitedBy: string;
  academicClass: string;
  course: string;
  board: string;
  academicSession: string;
  acceptedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  grade: string;
  enrolledSubjects: string[];
  overallPerformance: number; // percentage e.g. 88
  attendanceRate: number; // e.g. 96
  pendingAssignmentsCount: number;
  upcomingTestsCount: number;
  lastActive: string;
  status: 'active' | 'inactive';
  rollNumber?: string;
  enrolledAt?: string;
  assignedSubjectIds?: string[];
  academicClass?: string;
  course?: string;
  board?: string;
  academicSession?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  teacherId?: string;
  accentColor: string;
  totalModules: number;
  completedModules: number;
  nextClassTime: string;
  scheduleDays: string[];
  progress: number;
  category: 'STEM' | 'Humanities' | 'Languages' | 'Commerce';
  course?: string;
  academicSession?: string;
  description?: string;
  chapterCount?: number;
  assignedStudentCount?: number;
  createdAt?: string;
}

export interface BookItem {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  category:
    | 'Textbook'
    | 'Reference Book'
    | 'Lecture Notes'
    | 'Lab Manual'
    | 'Exam Revision'
    | 'Daily Reading Log'
    | 'Student Notes';
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  version: number;
  uploadedAt: string;
  uploadedBy?: string;
  totalPages?: number;
  currentPage?: number;
  weeklyPagesRead?: number;
  weeklyTargetPages?: number;
  monthlyPagesRead?: number;
  monthlyTargetPages?: number;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  description?: string;
  estimatedHours: number;
  completed: boolean;
  notesAvailable: boolean;
  notesContent?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  sortOrder?: number;
  progressStatus?: 'not_started' | 'in_progress' | 'completed';
}

export interface SyllabusUnit {
  id: string;
  subjectId: string;
  subjectName: string;
  unitNumber: number;
  title: string;
  description: string;
  sortOrder?: number;
  topics: SyllabusTopic[];
  progress: number;
}

export interface TopicProgress {
  id: string;
  studentId: string;
  topicId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedAt?: string;
  updatedAt: string;
}

export type StudySessionType =
  | 'Lecture'
  | 'Practice Lab'
  | 'Revision'
  | 'Self Study'
  | 'Reading'
  | 'Problem Solving';

export type StudySessionStatus = 'upcoming' | 'in_progress' | 'completed' | 'missed' | 'in-progress';

export interface StudySession {
  id: string;
  studentId?: string;
  subjectId?: string;
  subjectName: string;
  subjectCode: string;
  unitId?: string;
  unitTitle?: string;
  topicId?: string;
  topicTitle?: string;
  title: string;
  sessionDate: string; // YYYY-MM-DD
  day?: string; // 'Today', 'Monday', etc.
  startTime: string;
  endTime: string;
  durationMinutes: number;
  type: StudySessionType;
  roomOrLink?: string;
  locationOrLink?: string;
  notes?: string;
  status: StudySessionStatus;
  createdBy?: string;
}

export type StudyScheduleItem = StudySession;

export interface StudyPlan {
  id: string;
  studentId: string;
  studentName?: string;
  studentAvatar?: string;
  teacherId?: string;
  title: string;
  weeklyGoal?: string;
  dailyTargetHours: number;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  teacherNotes?: string;
  createdAt: string;
  totalSessions?: number;
  completedSessions?: number;
}

export type AssignmentType =
  | 'Homework'
  | 'Reading Task'
  | 'Written Assignment'
  | 'Short Questions'
  | 'Long Questions'
  | 'Revision Task'
  | 'Practice Exercise';

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  unitId?: string;
  unitTitle?: string;
  topicId?: string;
  topicTitle?: string;
  assignedTo?: string; // studentId or undefined for all
  assignedStudentName?: string;
  assignmentType?: AssignmentType;
  dueDate: string;
  assignedDate: string;
  totalMarks: number;
  description: string;
  submissionInstructions?: string;
  allowResubmission?: boolean;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  submissionCount?: number;
  totalStudents?: number;
  fileAttachmentName?: string;
  fileAttachmentUrl?: string;
  mySubmission?: {
    id: string;
    submittedAt: string;
    fileName: string;
    fileUrl?: string;
    status: 'submitted' | 'under-review' | 'graded';
    score?: number;
    feedback?: string;
    comment?: string;
  };
}

export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'file_upload';

export interface TestOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect?: boolean;
  sortOrder: number;
}

export interface TestQuestion {
  id: string;
  testId: string;
  questionText: string;
  questionType: QuestionType;
  subjectId?: string;
  unitId?: string;
  marks: number;
  questionOrder: number;
  attachmentUrl?: string;
  explanation?: string;
  options?: TestOption[];
}

export interface TestAnswer {
  id?: string;
  attemptId?: string;
  questionId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  fileUrl?: string;
  fileName?: string;
  isFlaggedForReview?: boolean;
  marksAwarded?: number;
  feedback?: string;
}

export interface TestAttempt {
  id: string;
  testId: string;
  studentId: string;
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'graded' | 'timed_out';
  totalScore?: number;
  percentage?: number;
  grade?: string;
  passed?: boolean;
  feedback?: string;
  answers?: TestAnswer[];
}

export interface TestItem {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  unitId?: string;
  unitTitle?: string;
  assignedTo?: string;
  assignedStudentName?: string;
  date: string;
  time: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  instructions?: string;
  type: 'Quiz' | 'Unit Assessment' | 'Midterm Exam' | 'Mock Exam';
  syllabusCoverage: string;
  status: 'scheduled' | 'ongoing' | 'graded';
  averageScore?: number;
  studentScore?: number;
  questions?: TestQuestion[];
  myAttempt?: TestAttempt;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  subjectName?: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  status: 'submitted' | 'under-review' | 'graded';
  score?: number;
  maxScore: number;
  comment?: string;
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  feedback?: string;
}

export interface ResultRecord {
  id: string;
  testId?: string;
  testTitle: string;
  subjectName: string;
  subjectCode: string;
  date: string;
  studentId?: string;
  studentName: string;
  studentAvatar: string;
  score: number;
  maxScore: number;
  percentage?: number;
  passingMarks?: number;
  passed?: boolean;
  grade: string;
  rank: string;
  feedback: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'submission' | 'grade' | 'test' | 'assignment' | 'schedule';
  actorName: string;
  actorAvatar: string;
  role: UserRole;
  metaBadge?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'assignment' | 'test' | 'grade' | 'schedule' | 'system';
}

export interface PerformanceMetric {
  period: string; // e.g. "Week 1", "Sep", etc.
  classAverage: number;
  studentScore: number;
  targetScore: number;
}
