import {
  UserProfile,
  Student,
  Subject,
  SyllabusUnit,
  StudyScheduleItem,
  Assignment,
  TestItem,
  Submission,
  ResultRecord,
  ActivityItem,
  NotificationItem,
  PerformanceMetric,
  BookItem,
  StudyPlan,
} from '../types';

/**
 * SAMPLE DATA FOR UI PREVIEW ONLY
 * =========================================================================
 * This data is statically defined to demonstrate UI layouts, data visualization,
 * responsive design, and role-based workflows for Phase 1.
 * In subsequent phases, this will be replaced with live Supabase client queries.
 * =========================================================================
 */

export const SAMPLE_TEACHER: UserProfile = {
  id: 'usr_t_01',
  name: 'Ahmad',
  email: 'ahmadwebcore@gmail.com',
  role: 'teacher',
  title: 'Faculty Lead & Academic Director',
  avatar: '',
  institution: 'Global Science Academy, Fatehpur',
  phone: '+92 300 1234567',
};

export const SAMPLE_STUDENT: UserProfile = {
  id: 'usr_s_01',
  name: 'Henza Noor',
  email: 'dbaddiesvlog@gmail.com',
  role: 'student',
  title: '1st Year FA-IT Scholar (BISE DG Khan)',
  grade: '1st Year FA-IT',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  institution: 'Global Science Academy, Fatehpur',
  phone: '+92 300 7654321',
};

export const SAMPLE_STUDENTS_LIST: Student[] = [
  {
    id: 'usr_s_01',
    name: 'Henza Noor',
    email: 'dbaddiesvlog@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    grade: '1st Year FA-IT',
    enrolledSubjects: [
      'Physical Education',
      'Urdu & Grammar',
      'English & Grammar',
      'Computer Science',
      'Tarjuma-tul-Quran & Islamiyat',
      'Principles of Economics',
    ],
    overallPerformance: 92.5,
    attendanceRate: 98,
    pendingAssignmentsCount: 1,
    upcomingTestsCount: 2,
    lastActive: 'Just now',
    status: 'active',
    rollNumber: 'GSA-2026-042',
    enrolledAt: 'Aug 15, 2026',
    assignedSubjectIds: ['sub_01', 'sub_02', 'sub_03', 'sub_04', 'sub_05', 'sub_06', 'sub_07'],
    academicClass: '1st Year Intermediate',
    course: '1st Year FA-IT (Intermediate Part 1)',
    board: 'BISE D.G. Khan (Dera Ghazi Khan Board)',
    academicSession: '2026-2027',
  },
];

export const SAMPLE_SUBJECTS: Subject[] = [
  {
    id: 'sub_01',
    name: 'Physical Education',
    code: 'FAIT-PED-11',
    teacherName: 'Ahmad',
    accentColor: '#10B981',
    totalModules: 8,
    completedModules: 3,
    nextClassTime: 'Monday at 09:00 AM',
    scheduleDays: ['Mon'],
    progress: 38,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): انسانی جسمانی ساخت، ہڈیوں کے جوڑ، دوران خون کا نظام، اور اتھلیٹکس قوانین۔',
    chapterCount: 8,
    assignedStudentCount: 1,
    createdAt: 'Aug 10, 2026',
  },
  {
    id: 'sub_02',
    name: 'Urdu & Grammar',
    code: 'FAIT-URD-11',
    teacherName: 'Ahmad',
    accentColor: '#8B5CF6',
    totalModules: 14,
    completedModules: 5,
    nextClassTime: 'Tuesday at 10:00 AM',
    scheduleDays: ['Tue'],
    progress: 36,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'اُردو 11 لازمی (PECTAA) و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): اسوہ حسنہ، اپنی مدد آپ، خطوط، مکالمات، اور قواعد و انشا۔',
    chapterCount: 14,
    assignedStudentCount: 1,
    createdAt: 'Aug 12, 2026',
  },
  {
    id: 'sub_03',
    name: 'English & Grammar',
    code: 'FAIT-ENG-11',
    teacherName: 'Ahmad',
    accentColor: '#3B82F6',
    totalModules: 15,
    completedModules: 6,
    nextClassTime: 'Wednesday at 11:15 AM',
    scheduleDays: ['Wed'],
    progress: 40,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'English 11 Textbook (Book 1 Short Stories & Book 3 Plays) & Sunshine English Comprehensive Guide: Tenses, Direct/Indirect, Pairs of Words.',
    chapterCount: 15,
    assignedStudentCount: 1,
    createdAt: 'Aug 12, 2026',
  },
  {
    id: 'sub_04',
    name: 'Computer Science & Entrepreneurship',
    code: 'FAIT-CSC-11',
    teacherName: 'Ahmad',
    accentColor: '#059669',
    totalModules: 10,
    completedModules: 4,
    nextClassTime: 'Thursday at 11:30 AM',
    scheduleDays: ['Thu'],
    progress: 40,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (آئی ٹی سیریز — طارق محمود، عمران سعید): ریائزڈ نیشنل کریکولم PECTAA، پائتھن پروگرامنگ (Python)، ڈیٹا کمیونیکیشن، نیٹ ورکس اور 600+ سوالات مع مکمل حل۔',
    chapterCount: 10,
    assignedStudentCount: 1,
    createdAt: 'Aug 15, 2026',
  },
  {
    id: 'sub_05',
    name: 'اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)',
    code: 'FAIT-ISL/TQM-11',
    teacherName: 'Ahmad',
    accentColor: '#0EA5E9',
    totalModules: 12,
    completedModules: 5,
    nextClassTime: 'Friday at 09:30 AM',
    scheduleDays: ['Fri'],
    progress: 40,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'اسلامیات لازمی 11 (PECTAA درسی کتاب) و ترجمۃ القرآن المجید (ہمدرد نوٹس سیریز): عقائد و عبادات، زکوٰۃ، اور سورۃ البقرہ کا لفظی و با محاورہ ترجمہ۔',
    chapterCount: 12,
    assignedStudentCount: 1,
    createdAt: 'Aug 15, 2026',
  },
  {
    id: 'sub_06',
    name: 'Islamiyat Lazmi',
    code: 'FAIT-ISL-11',
    teacherName: 'Ahmad',
    accentColor: '#14B866',
    totalModules: 8,
    completedModules: 3,
    nextClassTime: 'Friday at 10:45 AM',
    scheduleDays: ['Fri'],
    progress: 35,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'اسلامیات لازمی 11 (PECTAA درسی کتاب): عقیدہ توحید، رسالت، ارکان اسلام، زکوٰۃ کا معاشی نظام اور حقوق العباد۔',
    chapterCount: 8,
    assignedStudentCount: 1,
    createdAt: 'Aug 16, 2026',
  },
  {
    id: 'sub_07',
    name: 'Principles of Economics',
    code: 'FAIT-ECO-11',
    teacherName: 'Ahmad',
    accentColor: '#D97706',
    totalModules: 12,
    completedModules: 4,
    nextClassTime: 'Saturday at 10:00 AM',
    scheduleDays: ['Sat'],
    progress: 35,
    category: '1st Year FA-IT',
    course: '1st Year FA-IT (BISE D.G. Khan)',
    academicSession: '2026-2027',
    description: 'اصولِ معاشیات 11 (پروفیسر حبیب اللہ قریشی — علمی کتاب خانہ اردو بازار لاہور): ایڈم سمتھ، مارشل و رابنز کی تعریفات، قانونِ تقلیلِ افادہِ مختتم، قانونِ طلب و رسد، اور توازنِ قیمت۔',
    chapterCount: 12,
    assignedStudentCount: 1,
    createdAt: 'Aug 16, 2026',
  },
];

export const SAMPLE_TODAY_SCHEDULE: StudyScheduleItem[] = [
  {
    id: 'sch_henza_01',
    title: 'ہیلتھ اینڈ فزیکل ایجوکیشن: انسانی ساخت و عضلاتی نظام',
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    subjectCode: 'FAIT-PED-11',
    unitTitle: 'Human Anatomy & Athletics',
    topicTitle: 'ہڈیوں کی اقسام، جوڑوں کی ساخت اور 400m ٹریک قوانین',
    sessionDate: '2026-11-16',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    durationMinutes: 90,
    day: 'Monday',
    type: 'Lecture',
    roomOrLink: 'Physical Edu Hall',
    locationOrLink: 'Physical Edu Hall',
    notes: 'پروفیسر سید بشارت حسین گیلانی: دل کے خانے اور 400m ٹریک کا خاکہ تیار کریں۔',
    status: 'in_progress',
  },
  {
    id: 'sch_henza_02',
    title: 'اُردو لازمی و شرح سرمایہ: سبق اسوہ حسنہ خلاصہ و خطوط',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    unitTitle: 'نثری اسباق و قواعد انشا',
    topicTitle: 'سبق اسوہ حسنہ خلاصہ نویسی و بورڈ پیٹرن خطوط',
    sessionDate: '2026-11-17',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    day: 'Tuesday',
    type: 'Revision',
    roomOrLink: 'Urdu Room',
    locationOrLink: 'Urdu Room',
    notes: 'پروفیسر راؤ خالد محمود شرح سرمایہ: ایک تہائی خلاصہ اور خط کے امتحانی اصول۔',
    status: 'upcoming',
  },
  {
    id: 'sch_henza_03',
    title: 'English & Sunshine Grammar: Button, Button & Master Tenses',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FAIT-ENG-11',
    unitTitle: 'Short Stories & Board Grammar',
    topicTitle: 'Story 1 Button Button Themes & 10 Tense Conversions',
    sessionDate: '2026-11-18',
    startTime: '11:15 AM',
    endTime: '12:45 PM',
    durationMinutes: 90,
    day: 'Wednesday',
    type: 'Practice Lab',
    roomOrLink: 'Language Room',
    locationOrLink: 'Language Room',
    notes: 'Prof. Musarrat Hussain Sunshine English: Direct/Indirect and 15 Pairs of Words.',
    status: 'upcoming',
  },
  {
    id: 'sch_henza_04',
    title: 'کمپیوٹر سائنس 11 (IT Series): نیٹ ورکس، ٹوپولوجیز اور پائتھن پروگرامنگ',
    subjectId: 'sub_04',
    subjectName: 'Computer Science & Entrepreneurship',
    subjectCode: 'FAIT-CSC-11',
    unitTitle: 'Information Technology & Python Basics',
    topicTitle: 'Basics of IT, Bus Architecture, Python syntax, and Network Topologies',
    sessionDate: '2026-11-19',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    durationMinutes: 90,
    day: 'Thursday',
    type: 'Practice Lab',
    roomOrLink: 'IT Computer Lab',
    locationOrLink: 'IT Computer Lab',
    notes: 'طارق محمود و عمران سعید (IT Series): پائتھن پروگرامنگ اور نیٹ ورکس ٹوپولوجیز کا مطالعہ کریں۔',
    status: 'upcoming',
  },
  {
    id: 'sch_henza_05',
    title: 'اسلامیات لازمی و ترجمۃ القرآن: عقائد، نظام زکوٰۃ اور سورۃ البقرہ ترجمہ',
    subjectId: 'sub_05',
    subjectName: 'Tarjuma-tul-Quran & Islamiyat',
    subjectCode: 'FAIT-ISL/TQM-11',
    unitTitle: 'عقائد و سورۃ البقرہ',
    topicTitle: 'عقائد و عبادات اور سورۃ البقرہ رکوع 1 تا 3 با محاورہ ترجمہ',
    sessionDate: '2026-11-20',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    durationMinutes: 90,
    day: 'Friday',
    type: 'Lecture',
    roomOrLink: 'Islamic Studies Desk',
    locationOrLink: 'Islamic Studies Desk',
    notes: 'PECTAA اسلامیات 11 و ہمدرد نوٹس: عقیدہ توحید اور سورۃ البقرہ کے اہم تراجم۔',
    status: 'upcoming',
  },
  {
    id: 'sch_henza_06',
    title: 'اصولِ معاشیات 11: قانونِ تقلیلِ افادہِ مختتم و قانونِ طلب گوشوارہ',
    subjectId: 'sub_07',
    subjectName: 'Principles of Economics',
    subjectCode: 'FAIT-ECO-11',
    unitTitle: 'معاشیات کی نوعیت و قوانین افادہ',
    topicTitle: 'ایڈم سمتھ، مارشل و رابنز کی تعریفات اور قانون تقلیل افادہ مختتم',
    sessionDate: '2026-11-21',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    durationMinutes: 90,
    day: 'Saturday',
    type: 'Revision',
    roomOrLink: 'Economics Room',
    locationOrLink: 'Economics Room',
    notes: 'پروفیسر حبیب اللہ قریشی (علمی کتاب خانہ): افادہ اور طلب کے گوشوارے اور ڈایاگرامز تیار کریں۔',
    status: 'upcoming',
  },
  {
    id: 'sch_henza_07',
    title: 'Sunday Off: Scheduled Rest & Light Revision (Zero Tasks)',
    subjectId: 'sub_off',
    subjectName: 'Mandatory Rest Day',
    subjectCode: 'REST-DAY',
    unitTitle: 'Weekly Rest Policy',
    topicTitle: 'Relaxation & Reviewing Completed Coursework',
    sessionDate: '2026-11-22',
    startTime: 'All Day',
    endTime: 'All Day',
    durationMinutes: 0,
    day: 'Sunday',
    type: 'Self Study',
    roomOrLink: 'Home',
    locationOrLink: 'Home',
    notes: 'Sundays are strictly OFF according to Pakistan Academic Calendar. Zero deadlines.',
    status: 'upcoming',
  },
];

export const SAMPLE_STUDY_PLANS: StudyPlan[] = [
  {
    id: 'plan_01',
    studentId: 'usr_s_01',
    studentName: 'Henza Noor',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
    title: '1st Year Board Exam Preparation Plan (Target Feb 28)',
    weeklyGoal: 'Complete 6-subject daily syllabus reading quotas and pass daily 30-mark tests with 80%+ score.',
    dailyTargetHours: 3.5,
    startDate: '2026-11-09',
    endDate: '2026-11-15',
    status: 'approved',
    teacherNotes: 'Steady consistent pace. Complete your daily reading quota before 8 PM.',
    createdAt: 'Nov 08, 2026',
    totalSessions: 14,
    completedSessions: 10,
  },
];

export const SAMPLE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_01',
    title: 'Physical Education: Circulatory System Diagram & Track Rules',
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    subjectCode: 'FAIT-PED-11',
    unitId: 'syl_01',
    unitTitle: 'Human Anatomy & Athletics',
    topicId: 'top_01',
    topicTitle: 'Heart Anatomy & 400m Track Measurements',
    assignmentType: 'Written Assignment',
    dueDate: 'Nov 24, 2026, 11:59 PM',
    assignedDate: 'Nov 08, 2026',
    totalMarks: 30,
    description: 'Draw a neat diagram of the human circulatory system and write rules for 400m track baton exchange.',
    submissionInstructions: 'Upload hand-written worked proofs as a single clear PDF document or image.',
    allowResubmission: true,
    status: 'pending',
    priority: 'high',
    submissionCount: 1,
    totalStudents: 1,
    fileAttachmentName: 'Physical_Education_Assignment_1.pdf',
    fileAttachmentUrl: 'assignments/ped_assignment_1.pdf',
  },
  {
    id: 'asg_02',
    title: 'Urdu: Lesson Uswa-e-Hasna Summary & Letter Writing',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    assignmentType: 'Practice Exercise',
    dueDate: 'Nov 25, 2026, 05:00 PM',
    assignedDate: 'Nov 10, 2026',
    totalMarks: 30,
    description: 'Write a one-third summary of Uswa-e-Hasna and draft an official-format letter to a friend.',
    submissionInstructions: 'Write neatly on exam sheets and upload as a PDF or image.',
    allowResubmission: true,
    status: 'pending',
    priority: 'medium',
    submissionCount: 0,
    totalStudents: 1,
    fileAttachmentName: 'Urdu_Khulasa_Mashq.pdf',
    fileAttachmentUrl: 'assignments/urdu_khulasa_mashq.pdf',
  },
  {
    id: 'asg_03',
    title: 'English: Button Button Questions & 15 Pair of Words',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FAIT-ENG-11',
    assignmentType: 'Homework',
    dueDate: 'Nov 22, 2026, 11:59 PM',
    assignedDate: 'Nov 05, 2026',
    totalMarks: 30,
    description: 'Answer 5 short questions from Button Button and use Board Pair of Words 1–15 in sentences.',
    submissionInstructions: 'Write concise answers and upload your document.',
    allowResubmission: false,
    status: 'pending',
    priority: 'medium',
    submissionCount: 0,
    totalStudents: 1,
    fileAttachmentName: 'English_Button_Button_Submission.pdf',
    fileAttachmentUrl: 'assignments/english_button_submission.pdf',
  },
  {
    id: 'asg_04',
    title: 'Computer Science: Network Topologies & Architecture',
    subjectId: 'sub_04',
    subjectName: 'Computer Science',
    subjectCode: 'FAIT-CSC-11',
    assignmentType: 'Homework',
    dueDate: 'Nov 18, 2026',
    assignedDate: 'Oct 28, 2026',
    totalMarks: 30,
    description: 'Explain Bus, Star, Ring topologies and OSI 7-layer model with real-world practical examples.',
    submissionInstructions: 'Include network architecture diagrams.',
    allowResubmission: false,
    status: 'pending',
    priority: 'low',
    submissionCount: 0,
    totalStudents: 1,
  },
];

export const SAMPLE_TESTS: TestItem[] = [];

export const SAMPLE_SUBMISSIONS: Submission[] = [];

export const SAMPLE_RESULTS: ResultRecord[] = [];

export const SAMPLE_ACTIVITIES: ActivityItem[] = [];

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'BISE DG Khan: Annual Exam 2027 Schedule Released',
    message: 'Intermediate Part-1 (11th Class FA-IT) Annual Exams commence in May 2027. Full syllabus coverage strictly required by Feb 28.',
    timestamp: '10 minutes ago',
    read: false,
    category: 'board',
    actionUrl: '/board',
    actionLabel: 'View Circular',
    badge: 'BISE DGK',
    urgent: true,
  },
  {
    id: 'notif_02',
    title: 'FA-IT Official Pairing Scheme 2026-2027 Notified',
    message: 'Official paper patterns and MCQs/Short/Long question distribution published for all 6 subjects by BISE DG Khan.',
    timestamp: '25 minutes ago',
    read: false,
    category: 'board',
    actionUrl: '/board',
    actionLabel: 'Check Pairing',
    badge: 'Pairing Scheme',
    urgent: false,
  },
  {
    id: 'notif_07',
    title: 'Sunday Rest Day Policy',
    message: 'Sunday is strictly OFF according to Pakistan Academic Calendar. Zero tests and zero deadlines scheduled on Sundays.',
    timestamp: '1 day ago',
    read: true,
    category: 'schedule',
    actionUrl: '/weekly-tasks',
    actionLabel: 'View Schedule',
    badge: 'Rest Day',
  },
];

export const SAMPLE_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { period: 'Week 1', classAverage: 78, studentScore: 82, targetScore: 85 },
  { period: 'Week 2', classAverage: 80, studentScore: 86, targetScore: 85 },
  { period: 'Week 3', classAverage: 76, studentScore: 84, targetScore: 85 },
  { period: 'Week 4', classAverage: 82, studentScore: 89, targetScore: 88 },
  { period: 'Week 5', classAverage: 81, studentScore: 92, targetScore: 88 },
  { period: 'Week 6', classAverage: 85, studentScore: 91, targetScore: 90 },
  { period: 'Week 7', classAverage: 83, studentScore: 94, targetScore: 90 },
];

// Official Grade 11 Curriculum (Strictly Redacted per PECTAA ALP 2026-27 Notification No. 1239)
export const SAMPLE_SYLLABUS: SyllabusUnit[] = [
  {
    "id": "syl_ped_01",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "unitNumber": 1,
    "title": "باب 1: صحت و جسمانی تعلیم کا تعارف و انسانی ڈھانچہ",
    "description": "انسانی جسمانی ساخت، ہڈیوں کی درجہ بندی اور جوڑوں (Joints) کی اقسام (صفحات 1-28)",
    "progress": 0,
    "topics": [
      {
        "id": "top_ped_01",
        "title": "1.1 جسمانی تعلیم کا مفہوم، اغراض و مقاصد اور اہمیت",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_ped_02",
        "title": "1.2 انسانی ہڈیوں کی اقسام اور ڈھانچے کے افعال",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_ped_03",
        "title": "1.3 جوڑوں کی اقسام (متحرک، غیر متحرک اور نیم متحرک جوڑ)",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_ped_02",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "unitNumber": 2,
    "title": "باب 2: انسانی عضلاتی نظام اور نظامِ دورانِ خون",
    "description": "پٹھوں کی اقسام، ساخت، کھچاؤ؛ دل کی ساخت اور دوران خون (صفحات 29-55)",
    "progress": 0,
    "topics": [
      {
        "id": "top_ped_04",
        "title": "2.1 عضلات کی ساخت، ارادی و غیر ارادی پٹھے",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_ped_05",
        "title": "2.2 دل کی اندرونی ساخت، والوز اور شریانیں و وریدیں",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_ped_03",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "unitNumber": 3,
    "title": "باب 3: اتھلیٹکس اور ٹریک رولز",
    "description": "400 میٹر معیاری ٹریک، ریلے ریس اور بیٹن ایکسچینج زون قوانین (صفحات 81-108)",
    "progress": 0,
    "topics": [
      {
        "id": "top_ped_06",
        "title": "3.1 400 میٹر معیاری ٹریک کی پیمائشیں اور لین مارکنگ",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_ped_07",
        "title": "3.2 4x100m ریلے ریس اور بیٹن ایکسچینج زون قوانین",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_urd_01",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "unitNumber": 1,
    "title": "حصہ اول: نثری اسباق (اسوہ حسنہ ﷺ، اپنی مدد آپ و سرسید)",
    "description": "اسوہ حسنہ ﷺ، اپنی مدد آپ، سرسید کے اخلاق و خصائل اور ادیب کی عزت (صفحات 1-43) [نوٹ: سبق چارپائی ص 44-49 ALP کے تحت خارج ہے]",
    "progress": 0,
    "topics": [
      {
        "id": "top_urd_01",
        "title": "سبق 1: اسوہ حسنہ ﷺ (سید سلیمان ندوی) — خلاصہ و تشریح",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_02",
        "title": "سبق 2: اپنی مدد آپ (سر سید احمد خان) — تشریح و خلاصہ",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_03",
        "title": "سبق 3: سرسید کے اخلاق و خصائل (مولانا حالی) — امتحانی خلاصہ",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_04",
        "title": "سبق 4: ادیب کی عزت (منشی پریم چند) — بورڈ امتحانی سوالات",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_urd_02",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "unitNumber": 2,
    "title": "حصہ دوم: نثری شاہکار (اوور کوٹ، سفارش، چراغ کی لو)",
    "description": "غلام عباس، احمد ندیم قاسمی، ہاجرہ مسرور (صفحات 50-89) [نوٹ: سبق پاکستانی زبانیں ص 90-96 خارج ہے]",
    "progress": 0,
    "topics": [
      {
        "id": "top_urd_05",
        "title": "سبق 5: اوور کوٹ (غلام عباس) — کردار نگاری و سیاق و سباق",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_06",
        "title": "سبق 6: سفارش (احمد ندیم قاسمی) — امتحانی خلاصہ",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_07",
        "title": "سبق 7: چراغ کی لو (ہاجرہ مسرور) — فکری و فنی جائزہ",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_urd_03",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "unitNumber": 3,
    "title": "حصہ سوم: منظومات و نظمیں (حمد، نعت، مستقبل، خطاب)",
    "description": "حمد، نعت، مستقبل اور خطاب بہ جوانانِ اسلام (صفحات 97-120) [نوٹ: نظم کھڑا ڈرن ص 116-119 خارج ہے]",
    "progress": 0,
    "topics": [
      {
        "id": "top_urd_08",
        "title": "نظم 1: حمد (مولانا حالی) — اشعار کی تشریح و مرکزی خیال",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_09",
        "title": "نظم 2: نعت (امیر مینائی) — اشعار تشریح و مفہوم",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_10",
        "title": "نظم 3: مستقبل (اکبر الہ آبادی) — طنزیہ و اصلاحی اشعار",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_11",
        "title": "نظم 4: خطاب بہ جوانانِ اسلام (علامہ اقبال) — تشریح",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_urd_04",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "unitNumber": 4,
    "title": "حصہ چہارم: منتخب غزلیات (میر، آتش، غالب، مومن، داغ)",
    "description": "میر تقی میر، آتش، غالب، مومن اور داغ دہلوی (صفحات 126-152) [نوٹ: غزل پتہ پتہ بوٹا بوٹا ص 121-125 خارج ہے]",
    "progress": 0,
    "topics": [
      {
        "id": "top_urd_12",
        "title": "غزل 1: میر تقی میر (ہستی اپنی حباب کی سی ہے)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_13",
        "title": "غزل 2: خواجہ حیدر علی آتش (رخ و زلف پر جان کھویا کیا)",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_14",
        "title": "غزل 3: مرزا اسد اللہ خان غالب (دلِ ناداں تجھے ہوا کیا ہے)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_urd_05",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "unitNumber": 5,
    "title": "حصہ پنجم: علمِ بیان، شعری اصطلاحات و انشا نگاری",
    "description": "علمِ بیان (تشبیہ، استعارہ، تلمیح)، مطلع، مقطع، قافیہ، ردیف، خطوط، مکالمہ (صفحات 153-156)",
    "progress": 0,
    "topics": [
      {
        "id": "top_urd_15",
        "title": "علمِ بیان: ارکانِ تشبیہ، استعارہ اور تلمیح کی تعریفات و امتحانی مثالیں",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_16",
        "title": "شعری اصطلاحات: مطلع، مقطع، قافیہ اور ردیف کی شناخت کا اصول",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_urd_17",
        "title": "خطوط نویسی و مکالمہ نگاری: 10 نمبری بورڈ فارمیٹ",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eng_01",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "unitNumber": 1,
    "title": "Unit 1: Short Stories (Button Button, Clearing in the Sky, Dark They Were)",
    "description": "Book 1 Stories (Pages 1-41) [Note: Unit 4 Team Moon pp. 42-55 excluded per ALP]",
    "progress": 0,
    "topics": [
      {
        "id": "top_eng_01",
        "title": "Story 1: Button, Button (Richard Matheson) — Theme & Questions",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_02",
        "title": "Story 2: Clearing in the Sky (Jesse Stuart) — Character & Theme",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_03",
        "title": "Story 3: Dark They Were, and Golden-Eyed (Ray Bradbury)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eng_02",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "unitNumber": 2,
    "title": "Unit 2: Short Stories (Piece of String, Reward, Gulistan of Sa'di)",
    "description": "Book 1 Stories (Pages 56-104) [Note: Unit 7 & Unit 9 excluded per ALP]",
    "progress": 0,
    "topics": [
      {
        "id": "top_eng_04",
        "title": "Story 5: The Piece of String (Guy de Maupassant)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_05",
        "title": "Story 6: The Reward (Lord Dunsany)",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_06",
        "title": "Story 8: The Gulistan of Sa'di (Sheikh Sa'di)",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eng_03",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "unitNumber": 3,
    "title": "Unit 3: Grammar, Tenses & Composition Mastery",
    "description": "Tenses, Active/Passive, Direct/Indirect, Pairs of Words & Application Writing",
    "progress": 0,
    "topics": [
      {
        "id": "top_eng_07",
        "title": "Tenses Mastery: Present, Past and Future Correct Usage",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_08",
        "title": "Active and Passive Voice Rules and Drills",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_09",
        "title": "Direct and Indirect Speech Rules",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eng_10",
        "title": "Board Pairs of Words (1-50) & Application Writing",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_csc_01",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "unitNumber": 1,
    "title": "Unit 1: Introduction to Software Development",
    "description": "SDLC Phases, Software Types, System Unit (Pages 1-8, 14-25) [Note: Topic 1.5 pp. 9-13 excluded]",
    "progress": 0,
    "topics": [
      {
        "id": "top_csc_01",
        "title": "1.1 Software Development Life Cycle (SDLC) Phases",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_02",
        "title": "1.2 Types of Software: System vs Application Software",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_03",
        "title": "1.3 Hardware Architecture & System Unit Buses",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_csc_02",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "unitNumber": 2,
    "title": "Unit 2: Python Programming Fundamentals",
    "description": "Python Syntax, Variables, Operators, If/Else, Loops (Pages 26-34) [Note: Topics 2.8-2.10 OOP pp. 35-38 excluded]",
    "progress": 0,
    "topics": [
      {
        "id": "top_csc_04",
        "title": "2.1 Python Syntax, IDLE, Variables and Data Types",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_05",
        "title": "2.2 Conditional Logic: If, If-Else and Elif Statements",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_06",
        "title": "2.3 Loops in Python: While Loops, For Loops and Range()",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_csc_03",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "unitNumber": 3,
    "title": "Unit 3: Algorithms, Problem Solving & Computational Structures",
    "description": "Flowcharts, Pseudocode, Searching, Sorting, Arrays, Stacks, Queues (Pages 41-65) [Note: Topic 3.3.3 Complexity Classes excluded]",
    "progress": 0,
    "topics": [
      {
        "id": "top_csc_07",
        "title": "3.1 Problem Solving Techniques, Flowcharts and Pseudocode",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_08",
        "title": "3.2 Search & Sort Algorithms (Linear, Binary, Bubble, Insertion)",
        "estimatedHours": 4,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_09",
        "title": "3.3 Computational Structures: Arrays, Stacks and Queues",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_csc_04",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "unitNumber": 4,
    "title": "Unit 4: Data Analytics, Emerging Tech & Digital Entrepreneurship",
    "description": "Data Visuals, AI/Cloud/IoT, Cybercrime, Digital Startups & MVP (Pages 80-91, 98-105, 123-144) [Note: Blockchain & Digital Divide excluded]",
    "progress": 0,
    "topics": [
      {
        "id": "top_csc_10",
        "title": "4.1 Data Analytics & Python Visualization with Matplotlib",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_11",
        "title": "4.2 Emerging Technologies: AI, Machine Learning, Cloud & IoT",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_csc_12",
        "title": "4.3 Digital Entrepreneurship: Startups, Business Models & MVP",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_isl_tqm_01",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "unitNumber": 1,
    "title": "حصہ اول: عقائد و عبادات اور سورۃ البقرہ (رکوع 1 تا 8)",
    "description": "عقیدہ توحید، رسالت، نماز، روزہ، زکوٰۃ؛ سورۃ البقرہ آیات 1 تا 65 لفظی و با محاورہ ترجمہ",
    "progress": 0,
    "topics": [
      {
        "id": "top_isl_tqm_01",
        "title": "عقیدہ توحید و رسالت کا انسانی زندگی پر عملی اثر",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_02",
        "title": "ارکان اسلام: نماز اور زکوٰۃ کا معاشی اور معاشرتی نظام",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_03",
        "title": "سورۃ البقرہ: تعارف، متقین اور منافقین کی صفات (آیات 1-29)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_04",
        "title": "سورۃ البقرہ: تخلیقِ آدمؑ اور بنی اسرائیل کا احوال (آیات 30-65)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_isl_tqm_02",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "unitNumber": 2,
    "title": "حصہ دوم: سیرت النبی ﷺ، حقوق العباد اور سورۃ البقرہ احکام",
    "description": "اسوہ حسنہ، حقوق العباد؛ سورۃ البقرہ آیات 66 تا 153 (تحویلِ قبلہ، احکامِ صوم و حج، آیت الکرسی)",
    "progress": 0,
    "topics": [
      {
        "id": "top_isl_tqm_05",
        "title": "سیرت النبی ﷺ بحیثیت اسوہ حسنہ اور معلم اخلاق",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_06",
        "title": "حقوق العباد: والدین، اساتذہ، اولاد اور پڑوسیوں کے حقوق",
        "estimatedHours": 2,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_07",
        "title": "سورۃ البقرہ: احکامِ صوم، تحویلِ قبلہ اور انفاق فی سبیل اللہ",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_isl_tqm_08",
        "title": "سورۃ البقرہ: آیت الکرسی، سود کی ممانعت اور دیانت کے احکام",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eco_01",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "unitNumber": 1,
    "title": "باب اول و دوم: معاشیات کی نوعیت، تعریفات اور صارف کا معاشی رویہ",
    "description": "ایڈم سمتھ، مارشل، رابنز؛ تقلیلِ افادہِ مختتم اور مساوی افادہِ مختتم (صفحات 1-90)",
    "progress": 0,
    "topics": [
      {
        "id": "top_eco_01",
        "title": "1.1 کلاسیکی، نیو کلاسیکی اور جدید معاشی تعریفات کا موازنہ",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_02",
        "title": "1.2 قانونِ تقلیلِ افادہِ مختتم: مفروضات، گوشوارہ اور ڈایاگرام",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_03",
        "title": "1.3 قانونِ مساوی افادہِ مختتم: صارف کے توازن کا سنہری اصول",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eco_02",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "unitNumber": 2,
    "title": "باب سوم و چہارم: قوانینِ طلب، رسد اور مارکیٹ توازنِ قیمت",
    "description": "قانونِ طلب، لچکِ طلب، قانونِ رسد اور مارکیٹ توازنِ قیمت (صفحات 91-170)",
    "progress": 0,
    "topics": [
      {
        "id": "top_eco_04",
        "title": "2.1 قانونِ طلب: مفہوم، گوشوارہ اور خطِ طلب کا منفی جھکاؤ",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_05",
        "title": "2.2 طلب کی لچک: اقسام، پیمائش کے طریقے اور معاشی اہمیت",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_06",
        "title": "2.3 قانونِ رسد اور طلب و رسد کے تقاطع سے توازنِ قیمت",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  },
  {
    "id": "syl_eco_03",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "unitNumber": 3,
    "title": "باب پنجم تا ہشتم: عواملِ پیدائش، قوانینِ حاصل اور قومی آمدنی",
    "description": "زمین، محنت، سرمایہ؛ مصارفِ پیدائش، مارکیٹ کی اقسام، قومی آمدنی و بینکاری (صفحات 171-272)",
    "progress": 0,
    "topics": [
      {
        "id": "top_eco_07",
        "title": "3.1 عواملِ پیدائش اور قوانینِ حاصل (تقلیل و استقرارِ حاصل)",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_08",
        "title": "3.2 مکمل مقابلہ اور اجارہ داری میں توازنِ فرم اور قیمت",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      },
      {
        "id": "top_eco_09",
        "title": "3.3 قومی آمدنی کے تصورات (GDP, GNP) اور زر و بینکاری",
        "estimatedHours": 3,
        "completed": false,
        "notesAvailable": true,
        "progressStatus": "not_started"
      }
    ]
  }
];

// Genuine Scanned Textbooks (Stored locally in public/books/)
export const SAMPLE_BOOKS: BookItem[] = [
  {
    "id": "book_ped_11",
    "title": "صحت و جسمانی تعلیم (گیارہویں جماعت — پنجاب ٹیکسٹ بک بورڈ)",
    "description": "پروفیسر سید بشارت حسین گیلانی۔ انسانی جسمانی ساخت، ہڈیوں کے جوڑ، دوران خون کا نظام، اور 400 میٹر اتھلیٹکس ٹریک رولز۔",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "category": "Textbook",
    "fileName": "physical_education_11_punjab.pdf",
    "fileUrl": "/books/physical_education_11_punjab.pdf",
    "coverUrl": "/covers/cover_physical_edu.jpg",
    "fileSize": "8.1 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 153,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 20,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 60
  },
  {
    "id": "book_urd_11",
    "title": "اُردو 11 لازمی (پنجاب ٹیکسٹ بک بورڈ / PECTAA)",
    "description": "پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور۔ نثری اسباق، نظمیں، غزلیات اور قواعد و انشا۔ مطابق ALP سمارٹ سلیبس۔",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "category": "Textbook",
    "fileName": "urdu_11_punjab.pdf",
    "fileUrl": "/books/urdu_11_punjab.pdf",
    "coverUrl": "/covers/cover_urdu_ptb.jpg",
    "fileSize": "17.0 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 156,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 25,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 75
  },
  {
    "id": "book_eng_11",
    "title": "English 11 Textbook (Punjab Curriculum & Textbook Board)",
    "description": "Official PCTB English 11 Textbook. Stories, Plays, Poems and Grammar Composition. Redacted per ALP 2026-27.",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "category": "Textbook",
    "fileName": "english_11_punjab.pdf",
    "fileUrl": "/books/english_11_punjab.pdf",
    "coverUrl": "/covers/cover_english_ptb.png",
    "fileSize": "17.1 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 168,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 22,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 70
  },
  {
    "id": "book_tqm_11",
    "title": "ترجمۃ القرآن المجید (گیارہویں جماعت — پنجاب بورڈ)",
    "description": "پنجاب ٹیکسٹ بک بورڈ۔ سورۃ البقرہ، سورۃ آل عمران، منتخب قرآنی سورتوں کا لفظی و با محاورہ ترجمہ اور تفہیم۔",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "category": "Textbook",
    "fileName": "tarjuma_tul_quran_11_punjab.pdf",
    "fileUrl": "/books/tarjuma_tul_quran_11_punjab.pdf",
    "coverUrl": "/covers/cover_tarjuma_ptb.jpg",
    "fileSize": "21.0 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 153,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 18,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 55
  },
  {
    "id": "book_isl_11",
    "title": "اسلامیات لازمی گیارہویں جماعت (پنجاب ٹیکسٹ بک بورڈ)",
    "description": "عقائد و عبادات، نماز، روزہ، زکوٰۃ، حج، سیرت النبی ﷺ بحیثیت اسوہ حسنہ اور حقوق العباد۔",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "category": "Textbook",
    "fileName": "islamiat_11_punjab.pdf",
    "fileUrl": "/books/islamiat_11_punjab.pdf",
    "coverUrl": "/covers/cover_islamiat_ptb.jpg",
    "fileSize": "18.3 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 140,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 16,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 50
  },
  {
    "id": "book_csc_11",
    "title": "Computer Science & Entrepreneurship 11 (Punjab Board)",
    "description": "Software Development, Python Programming, Data Analytics, Emerging Tech (AI, IoT), Cyber Law, Digital Entrepreneurship.",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "category": "Textbook",
    "fileName": "computer_science_11_punjab.pdf",
    "fileUrl": "/books/computer_science_11_punjab.pdf",
    "coverUrl": "/covers/cover_computer_itseries.jpg",
    "fileSize": "17.0 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 144,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 25,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 80
  },
  {
    "id": "book_eco_11",
    "title": "اصولِ معاشیات 11 (Principles of Economics — پنجاب بورڈ)",
    "description": "معاشیات کی نوعیت، ایڈم سمتھ، مارشل و رابنز، افادہ کا مفہوم، طلب و رسد، مارکیٹ توازن اور قومی آمدنی۔",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "category": "Textbook",
    "fileName": "principles_of_economics_11_punjab.pdf",
    "fileUrl": "/books/principles_of_economics_11_punjab.pdf",
    "coverUrl": "/covers/cover_economics.jpg",
    "fileSize": "18.9 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 272,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 20,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 60
  },
  {
    "id": "book_redacted_alp",
    "title": "Grade 11 ALP Redacted Smart Syllabus 2026–27 (PECTAA)",
    "description": "Official PECTAA Notification No. PECTAA/C&C Unit/2026/1239 for BISE DG Khan Annual Examination 2027.",
    "subjectId": "sub_02",
    "subjectName": "Academic Scheme",
    "subjectCode": "FAIT-ALP-11",
    "category": "Exam Revision",
    "fileName": "Redacted_11_class_syllabus.pdf",
    "fileUrl": "/books/Redacted_11_class_syllabus.pdf",
    "coverUrl": "/covers/cover_urdu_ptb.jpg",
    "fileSize": "1.6 MB",
    "fileType": "pdf",
    "version": 1,
    "uploadedAt": "Nov 19, 2026",
    "uploadedBy": "Sir Ahmad",
    "totalPages": 6,
    "currentPage": 0,
    "weeklyPagesRead": 0,
    "weeklyTargetPages": 6,
    "monthlyPagesRead": 0,
    "monthlyTargetPages": 6
  }
];
