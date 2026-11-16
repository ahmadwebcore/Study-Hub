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

const STORAGE_KEY = 'studyhub_weekly_daily_tasks_v11';

try {
  ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'].forEach(v => localStorage.removeItem('studyhub_weekly_daily_tasks_' + v));
} catch {}

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
const SEED_TASKS: DailyTask[] = [
  {
    "id": "tsk_henza_ped_1",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "ہیلتھ اینڈ فزیکل ایجوکیشن: انسانی ڈھانچہ و ہڈیوں کی اقسام",
    "description": "پروفیسر سید بشارت حسین گیلانی (صفحہ 1 تا 3): انسانی ڈھانچے کی ساخت، ہڈیوں کی اقسام، اور جوڑوں کی درجہ بندی کا مطالعہ کریں۔",
    "assignedDate": "2026-11-16",
    "dueDate": "2026-11-16",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-3",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_1",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 لازمی: سبق اسوہ حسنہ خلاصہ و تشریح",
    "description": "شرح سرمایہ اردو (صفحہ 1 تا 3): حضرت محمد ﷺ کے اخلاقِ مبارکہ اور تشبیہ کے ارکان کی مشق کریں۔",
    "assignedDate": "2026-11-17",
    "dueDate": "2026-11-17",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-3",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_1",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "English & Sunshine: Story 1 \"Button, Button\" & Tenses",
    "description": "Prof. Musarrat Hussain Sunshine English (pp. 1-3): Read Story 1 and practice 10 tense transformations.",
    "assignedDate": "2026-11-18",
    "dueDate": "2026-11-18",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 1-3",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_1",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "ترجمۃ القرآن: سورۃ البقرہ رکوع 1 تا 3 با محاورہ ترجمہ",
    "description": "ہمدرد نوٹس سیریز (صفحہ 1 تا 3): متقین اور منافقین کی صفات کا لفظی اور با محاورہ ترجمہ یاد کریں۔",
    "assignedDate": "2026-11-19",
    "dueDate": "2026-11-19",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-3",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_1",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "اسلامیات لازمی: عقیدہ توحید، رسالت اور ان کے اثرات",
    "description": "اسلامیات 11 (صفحہ 1 تا 3): عقیدہ توحید کے تقاضے اور انسانی کردار پر رسالت کے اثرات۔",
    "assignedDate": "2026-11-20",
    "dueDate": "2026-11-20",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-3",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_1",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-11-21",
    "dueDate": "2026-11-21",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_1",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 1: BISE DG Khan 5 سالہ ماضی ماڈل پیپرز کمپلیشن",
    "description": "BISE DG Khan بورڈ کے تمام 6 مضامین کے معروضی اور اہم مختصر سوالات کی تحریری مشق۔",
    "assignedDate": "2026-11-22",
    "dueDate": "2026-11-22",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "All 6 Subjects",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_2",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "عضلاتی نظام: پٹھوں کی ساخت، اقسام اور حرکات",
    "description": "پروفیسر گیلانی (صفحہ 13 تا 16): غیر ارادی اور ارادی عضلات کی ساخت اور افعال کا تفصیلی جائزہ۔",
    "assignedDate": "2026-11-23",
    "dueDate": "2026-11-23",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 13-16",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_2",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ و مطالعہ",
    "description": "شرح سرمایہ اردو (صفحہ 16 تا 19): سرسید احمد خان کا مضمون اور مکالمہ نگاری کی مشق۔",
    "assignedDate": "2026-11-24",
    "dueDate": "2026-11-24",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 16-19",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_2",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 2 \"Clearing in the Sky\" & Direct/Indirect Speech",
    "description": "Sunshine English (pp. 19-22): Read Story 2 and practice Direct into Indirect speech rules.",
    "assignedDate": "2026-11-25",
    "dueDate": "2026-11-25",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 19-22",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_2",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ البقرہ رکوع 4 تا 6: حضرت آدمؑ اور خلافت کا قصہ",
    "description": "ہمدرد نوٹس سیریز (صفحہ 11 تا 14): سجدہ ملائکہ اور ابلیس کے انکار کے واقعات کا ترجمہ۔",
    "assignedDate": "2026-11-26",
    "dueDate": "2026-11-26",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 11-14",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_2",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "عقیدہ آخرت، ملائکہ اور آسمانی کتب پر ایمان",
    "description": "اسلامیات 11 (صفحہ 10 تا 13): جوابدہی کا احساس اور ملائکہ کے فرائض کا مطالعہ۔",
    "assignedDate": "2026-11-27",
    "dueDate": "2026-11-27",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 10-13",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_2",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-11-28",
    "dueDate": "2026-11-28",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_2",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 2: صحت و جسمانی تعلیم اور اُردو معروضی جائزہ",
    "description": "فزیکل ایجوکیشن اور اُردو 11 کے پہلے دو اسباق کا ٹائمڈ کوئز۔",
    "assignedDate": "2026-11-29",
    "dueDate": "2026-11-29",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "PED & URD",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_3",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "نظام دورانِ خون: دل کی ساخت، خون کا بہاؤ اور پلس ریٹ",
    "description": "پروفیسر گیلانی (صفحہ 25 تا 28): انسانی دل کے خانے، والوز اور دورانِ خون کا چارٹ بنائیں۔",
    "assignedDate": "2026-11-30",
    "dueDate": "2026-11-30",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 25-28",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_3",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق سرسید کے اخلاق و خصائل خلاصہ و اہم نکات",
    "description": "شرح سرمایہ اردو (صفحہ 31 تا 34): مولانا الطاف حسین حالی کا اندازِ تحریر اور کنایہ۔",
    "assignedDate": "2026-12-01",
    "dueDate": "2026-12-01",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 31-34",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_3",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 3 \"Dark they were\" & Formal Letter to Father",
    "description": "Sunshine English (pp. 36-39): Story 3 questions and write letter explaining examination performance.",
    "assignedDate": "2026-12-02",
    "dueDate": "2026-12-02",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 36-39",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_3",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ البقرہ رکوع 7 تا 9: بنی اسرائیل پر انعامات",
    "description": "ہمدرد نوٹس سیریز (صفحہ 21 تا 24): بقرہ کے واقعات اور احکام الٰہیہ کا مطالعہ۔",
    "assignedDate": "2026-12-03",
    "dueDate": "2026-12-03",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 21-24",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_3",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "نماز اور روزہ کے روحانی اور معاشرتی فوائد",
    "description": "اسلامیات 11 (صفحہ 19 تا 22): اقامتِ صلوٰۃ اور ضبطِ نفس کی تربیت۔",
    "assignedDate": "2026-12-04",
    "dueDate": "2026-12-04",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 19-22",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_3",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-12-05",
    "dueDate": "2026-12-05",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_3",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 3: انگریزی اور ترجمۃ القرآن ہفتہ وار سپیڈ ٹیسٹ",
    "description": "انگلش شارٹ اسٹوریز اور سورۃ البقرہ ترجمہ کی تحریری دہرائی۔",
    "assignedDate": "2026-12-06",
    "dueDate": "2026-12-06",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "ENG & TQM",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_4",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "نظام تنفس: پھیپھڑوں کے افعال اور گیسوں کا تبادلہ",
    "description": "پروفیسر گیلانی (صفحہ 37 تا 40): سانس لینے اور خارج کرنے کا عمل اور پھیپھڑوں کی گنجائش۔",
    "assignedDate": "2026-12-07",
    "dueDate": "2026-12-07",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 37-40",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_4",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق ادیب کی عزت (پریم چند) خلاصہ و کہانی نویسی",
    "description": "شرح سرمایہ اردو (صفحہ 46 تا 49): ادیب کی عزت کا خلاصہ اور مجازِ مرسل کی تعریف۔",
    "assignedDate": "2026-12-08",
    "dueDate": "2026-12-08",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 46-49",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_4",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 4 \"Thank You, M'am\" & Board Punctuation Drill",
    "description": "Sunshine English (pp. 53-56): Punctuate 5 board textbook paragraphs accurately.",
    "assignedDate": "2026-12-09",
    "dueDate": "2026-12-09",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 53-56",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_4",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ البقرہ رکوع 10 تا 12: تحویلِ قبلہ اور صبر و نماز",
    "description": "ہمدرد نوٹس سیریز (صفحہ 31 تا 34): تحویلِ قبلہ کا حکم اور استعانت بالصبر والصلوٰۃ۔",
    "assignedDate": "2026-12-10",
    "dueDate": "2026-12-10",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 31-34",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_4",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "زکوٰۃ کا نظام، معاشرتی عدل اور حج کی اہمیت",
    "description": "اسلامیات 11 (صفحہ 28 تا 31): زکوٰۃ کے مصارف اور حج کا عالمی اجتماع۔",
    "assignedDate": "2026-12-11",
    "dueDate": "2026-12-11",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 28-31",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_4",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-12-12",
    "dueDate": "2026-12-12",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_4",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 4: اسلامیات لازمی اور تمام 6 مضامین کا جامع کوئز",
    "description": "عقائد و عبادات اور تمام مضامین کی ہفتہ وار پیش رفت کا جائزہ۔",
    "assignedDate": "2026-12-13",
    "dueDate": "2026-12-13",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "ISL & All",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_5",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "متوازن غذا: کاربوہائیڈریٹس، پروٹینز اور وٹامنز",
    "description": "پروفیسر گیلانی (صفحہ 49 تا 52): ایتھلیٹس کے لیے روزانہ درکار کیلوریز کا چارٹ تیار کریں۔",
    "assignedDate": "2026-12-14",
    "dueDate": "2026-12-14",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 49-52",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_5",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق اوور کوٹ (غلام عباس) خلاصہ و خط بنام اخبار",
    "description": "شرح سرمایہ اردو (صفحہ 61 تا 64): افسانہ اوور کوٹ کا خلاصہ اور تلخیص نگاری کی مشق۔",
    "assignedDate": "2026-12-15",
    "dueDate": "2026-12-15",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 61-64",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_5",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 5 \"The Piece of String\" & Correct Form of Verbs",
    "description": "Sunshine English (pp. 71-74): Complete 15 board sentences with correct verb forms.",
    "assignedDate": "2026-12-16",
    "dueDate": "2026-12-16",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 71-74",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_5",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ البقرہ رکوع 13 تا 15: احکام روزہ، حج اور انفاق",
    "description": "ہمدرد نوٹس سیریز (صفحہ 41 تا 44): رمضان المبارک اور صدقات کے احکام کا با محاورہ ترجمہ۔",
    "assignedDate": "2026-12-17",
    "dueDate": "2026-12-17",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 41-44",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_5",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "سیرت النبی ﷺ: اسوہ حسنہ اور رحمت اللعالمین",
    "description": "اسلامیات 11 (صفحہ 37 تا 40): نبی اکرم ﷺ کا طرزِ زندگی اور تمام جہانوں کے لیے رحمت۔",
    "assignedDate": "2026-12-18",
    "dueDate": "2026-12-18",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 37-40",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_5",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-12-19",
    "dueDate": "2026-12-19",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_5",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 5: ماہانہ بورڈ اسسمنٹ فیز 1 کمپلیشن",
    "description": "پہلے 4 ہفتوں کے تمام مضامین کے اسباق کا بورڈ طرز پر مفصل جائزہ۔",
    "assignedDate": "2026-12-20",
    "dueDate": "2026-12-20",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Full Phase 1",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_6",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "ابتدائی طبی امداد (First Aid): موچ اور ہڈی ٹوٹنا",
    "description": "پروفیسر گیلانی (صفحہ 61 تا 64): کھیل کے دوران لگنے والی چوٹوں کا فوری گھریلو اور طبی علاج۔",
    "assignedDate": "2026-12-21",
    "dueDate": "2026-12-21",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 61-64",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_6",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق سفارش (احمد ندیم قاسمی) خلاصہ و مکالمہ",
    "description": "شرح سرمایہ اردو (صفحہ 76 تا 79): افسانہ سفارش کے کردار اور مکالمہ نگاری۔",
    "assignedDate": "2026-12-22",
    "dueDate": "2026-12-22",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 76-79",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_6",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 6 \"The Reward\" & Essential Prepositions",
    "description": "Sunshine English (pp. 89-92): Learn and practice 20 essential prepositions with sentences.",
    "assignedDate": "2026-12-23",
    "dueDate": "2026-12-23",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 89-92",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_6",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ آلِ عمران رکوع 1 تا 3: محکم و متشابہ آیات",
    "description": "ہمدرد نوٹس سیریز (صفحہ 51 تا 54): قرآنی دعائیں اور اہلِ ایمان کا طرزِ عمل۔",
    "assignedDate": "2026-12-24",
    "dueDate": "2026-12-24",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 51-54",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_6",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "سیرت النبی ﷺ: اخوت، ایثار اور عفو و درگزر",
    "description": "اسلامیات 11 (صفحہ 46 تا 49): مواخاتِ مدینہ اور فتح مکہ کے موقع پر عام معافی۔",
    "assignedDate": "2026-12-25",
    "dueDate": "2026-12-25",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 46-49",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_6",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2026-12-26",
    "dueDate": "2026-12-26",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_6",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 6: شارٹ سوالات حل کرنے کی رفتار اور ہینڈ رائٹنگ",
    "description": "خوشخطی، ہیڈنگز اور مارجن لائنز کے ساتھ 30 منٹ ٹیسٹ حل کرنے کی مشق۔",
    "assignedDate": "2026-12-27",
    "dueDate": "2026-12-27",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Presentation",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_7",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "والی بال: کورٹ کی پیمائش اور سروس قوانین",
    "description": "پروفیسر گیلانی (صفحہ 73 تا 76): 18x9 میٹر کورٹ کی مارکنگ اور روٹیشن کے اصول ذہن نشین کریں۔",
    "assignedDate": "2026-12-28",
    "dueDate": "2026-12-28",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 73-76",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_7",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "سبق چراغ کی لو خلاصہ و ادبی اصطلاحات",
    "description": "شرح سرمایہ اردو (صفحہ 91 تا 94): قافیہ، ردیف، مطلع اور مقطع کی پہچان۔",
    "assignedDate": "2026-12-29",
    "dueDate": "2026-12-29",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 91-94",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_7",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 7 \"The Use of Force\" & Phrasal Verbs",
    "description": "Sunshine English (pp. 106-109): Memorize 15 phrasal verbs frequently tested by BISE DG Khan.",
    "assignedDate": "2026-12-30",
    "dueDate": "2026-12-30",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 106-109",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_7",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ آلِ عمران رکوع 4 تا 6: حضرت مریمؑ اور حضرت عیسیٰؑ",
    "description": "ہمدرد نوٹس سیریز (صفحہ 61 تا 64): ولادتِ عیسیٰؑ اور معجزات کا قرآنی بیان۔",
    "assignedDate": "2026-12-31",
    "dueDate": "2026-12-31",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 61-64",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_7",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "سیرت النبی ﷺ: عدل و انصاف اور انسانی مساوات",
    "description": "اسلامیات 11 (صفحہ 55 تا 58): خطبہ حجتہ الوداع کے تاریخی اصول۔",
    "assignedDate": "2027-01-01",
    "dueDate": "2027-01-01",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 55-58",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_7",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-01-02",
    "dueDate": "2027-01-02",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_7",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 7: BISE DG Khan نصف نصاب (Mid-Term) جائزے",
    "description": "تمام کتب کے نصف نصاب (50% سلیبس) کا پری بورڈ جائزہ۔",
    "assignedDate": "2027-01-03",
    "dueDate": "2027-01-03",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Midterm 50%",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_8",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "باسکٹ بال: کورٹ، بیک بورڈ اور فاولز کے قوانین",
    "description": "پروفیسر گیلانی (صفحہ 85 تا 88): 28x15 میٹر کورٹ، ٹائم لمٹ اور ڈس کوالیفکیشن فاولز کا مطالعہ۔",
    "assignedDate": "2027-01-04",
    "dueDate": "2027-01-04",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 85-88",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_8",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "نظم حمد و نعت: منتخب اشعار کی تشریح و مفہوم",
    "description": "شرح سرمایہ اردو (صفحہ 106 تا 109): امیر مینائی اور حفیظ تائب کے اشعار کی مفصل تشریح۔",
    "assignedDate": "2027-01-05",
    "dueDate": "2027-01-05",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 106-109",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_8",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Story 8 \"The Gulistan of Sa'di\" & Moral Story Writing",
    "description": "Sunshine English (pp. 123-126): Moral story \"Honesty is the Best Policy\" with outline.",
    "assignedDate": "2027-01-06",
    "dueDate": "2027-01-06",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 123-126",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_8",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ آلِ عمران رکوع 7 تا 9: غزوہ بدر و احد کے اسباق",
    "description": "ہمدرد نوٹس سیریز (صفحہ 71 تا 74): نصرتِ الٰہی اور اطاعتِ رسول ﷺ کے تقاضے۔",
    "assignedDate": "2027-01-07",
    "dueDate": "2027-01-07",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 71-74",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_8",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "حقوق العباد: والدین، اساتذہ اور اولاد کے حقوق",
    "description": "اسلامیات 11 (صفحہ 64 تا 67): والدین کی خدمت اور اساتذہ کا ادب و احترام۔",
    "assignedDate": "2027-01-08",
    "dueDate": "2027-01-08",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 64-67",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_8",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-01-09",
    "dueDate": "2027-01-09",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_8",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 8: اُردو و انگریزی گرائمر اور کمپوزیشن ٹیسٹ",
    "description": "خطوط، درخواستیں، مکالمات اور پیئرز آف ورڈز کی خصوصی جانچ۔",
    "assignedDate": "2027-01-10",
    "dueDate": "2027-01-10",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Grammar",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_9",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "بیڈمنٹن: کورٹ مارکنگ، نیٹ ہائٹ اور سروس فالٹس",
    "description": "پروفیسر گیلانی (صفحہ 97 تا 100): سنگلز اور ڈبلز کے لیے کورٹ مارکنگ اور پوائنٹس سسٹم۔",
    "assignedDate": "2027-01-11",
    "dueDate": "2027-01-11",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 97-100",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_9",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "نظم میدانِ کربلا میں صبح کا منظر: بند 1 تا 4 تشریح",
    "description": "شرح سرمایہ اردو (صفحہ 121 تا 124): میر انیس کی مرثیہ نگاری اور منظر کشی۔",
    "assignedDate": "2027-01-12",
    "dueDate": "2027-01-12",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 121-124",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_9",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Poem 1 \"The Rain\" & Poem 2 \"Night Mail\" Paraphrasing",
    "description": "Sunshine English (pp. 141-144): Write stanzas paraphrase and poetic devices.",
    "assignedDate": "2027-01-13",
    "dueDate": "2027-01-13",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 141-144",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_9",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ النساء رکوع 1 تا 3: حقوق الیتامیٰ اور احکام وراثت",
    "description": "ہمدرد نوٹس سیریز (صفحہ 81 تا 84): یتیموں کے مال کی حفاظت اور وراثت کی تقسیم۔",
    "assignedDate": "2027-01-14",
    "dueDate": "2027-01-14",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 81-84",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_9",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "حقوق العباد: پڑوسیوں اور غیر مسلم اقلیتوں کے حقوق",
    "description": "اسلامیات 11 (صفحہ 73 تا 76): میثاقِ مدینہ کی روشنی میں اقلیتوں کا تحفظ۔",
    "assignedDate": "2027-01-15",
    "dueDate": "2027-01-15",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 73-76",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_9",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-01-16",
    "dueDate": "2027-01-16",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_9",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 9: ترجمۃ القرآن اور اسلامیات لازمی فل چیپٹر ڈرل",
    "description": "قرآنی آیات اور احادیثِ نبویہ کا با محاورہ ترجمہ چیکنگ۔",
    "assignedDate": "2027-01-17",
    "dueDate": "2027-01-17",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Quran & Hadith",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_10",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "ٹیبل ٹینس: ٹیبل کی پیمائش اور سروس کے رولز",
    "description": "پروفیسر گیلانی (صفحہ 109 تا 112): سروس کے رولز، لیٹ بال اور گیم پوائنٹس کا جائزہ۔",
    "assignedDate": "2027-01-18",
    "dueDate": "2027-01-18",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 109-112",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_10",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "غزل میر تقی میر: اشعار کی تشریح و محاسن",
    "description": "شرح سرمایہ اردو (صفحہ 136 تا 139): ہستی اپنی حباب کی سی ہے — تشریح و معانی۔",
    "assignedDate": "2027-01-19",
    "dueDate": "2027-01-19",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 136-139",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_10",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Play 1 \"Heat Lightning\" Short Questions & Answers",
    "description": "Sunshine English (pp. 161-164): Character study of Girl and Man; solve 5 questions.",
    "assignedDate": "2027-01-20",
    "dueDate": "2027-01-20",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 161-164",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_10",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ النساء رکوع 4 تا 6: عائلی نظام اور صلح رحمی",
    "description": "ہمدرد نوٹس سیریز (صفحہ 91 تا 94): خاندانی استحکام اور رشتہ داروں سے حسنِ سلوک۔",
    "assignedDate": "2027-01-21",
    "dueDate": "2027-01-21",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 91-94",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_10",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "علم کی اہمیت، فرضیت اور اسلامی ترغیب",
    "description": "اسلامیات 11 (صفحہ 82 تا 85): طلب العلم فریضۃ اور سائنسی علوم میں مسلمانوں کا کردار۔",
    "assignedDate": "2027-01-22",
    "dueDate": "2027-01-22",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 82-85",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_10",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-01-23",
    "dueDate": "2027-01-23",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_10",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 10: فزیکل ایجوکیشن گرائونڈ رولز و ڈایاگرامز",
    "description": "والی بال، باسکٹ بال کورٹ پیمائش اور ٹریک ڈایاگرامز بنانا۔",
    "assignedDate": "2027-01-24",
    "dueDate": "2027-01-24",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Athletics & Games",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_11",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "ایتھلیٹکس: شاٹ پٹ اور ڈسکس تھرو سیکٹر رولز",
    "description": "پروفیسر گیلانی (صفحہ 119 تا 122): تھروئنگ سرکل کی پیمائش اور فاول تھرو کی پہچان۔",
    "assignedDate": "2027-01-25",
    "dueDate": "2027-01-25",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 119-122",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_11",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "غزل خواجہ حیدر علی آتش: اشعار کی تشریح",
    "description": "شرح سرمایہ اردو (صفحہ 151 تا 154): یہ آرزو تھی تجھے گل کے روبرو کرتے — تشریح۔",
    "assignedDate": "2027-01-26",
    "dueDate": "2027-01-26",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 151-154",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_11",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Play 2 \"A Visit to a Small Planet\" Kreton Character Sketch",
    "description": "Sunshine English (pp. 181-184): Kreton's extraordinary powers and satirical dialogue.",
    "assignedDate": "2027-01-27",
    "dueDate": "2027-01-27",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 181-184",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_11",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ المائدہ رکوع 1 تا 3: حلال و حرام کے احکام",
    "description": "ہمدرد نوٹس سیریز (صفحہ 101 تا 104): طیبات کی اجازت اور خبیثات کی حرمت کا بیان۔",
    "assignedDate": "2027-01-28",
    "dueDate": "2027-01-28",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 101-104",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_11",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "کسبِ حلال اور محنت کی عظمت اسلامی تناظر میں",
    "description": "اسلامیات 11 (صفحہ 90 تا 93): الکاسب حبیب اللہ کا مفہوم اور خود کفالت۔",
    "assignedDate": "2027-01-29",
    "dueDate": "2027-01-29",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 90-93",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_11",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-01-30",
    "dueDate": "2027-01-30",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_11",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 11: 5 سالہ ماضی معروضی سوالات (MCQs Bank)",
    "description": "100 کثیر الانتخابی سوالات کی او ایم آر شیٹ پر حل کرنے کی پریکٹس۔",
    "assignedDate": "2027-01-31",
    "dueDate": "2027-01-31",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "MCQs Drill",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_12",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "ایتھلیٹکس: لانگ جمپ اور ہائی جمپ رولز",
    "description": "پروفیسر گیلانی (صفحہ 127 تا 130): ٹیک آف بورڈ، لینڈنگ پٹ اور فوسبری فلاپ تکنیک۔",
    "assignedDate": "2027-02-01",
    "dueDate": "2027-02-01",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 127-130",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_12",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "غزل مرزا اسد اللہ خان غالب: اشعار تشریح",
    "description": "شرح سرمایہ اردو (صفحہ 166 تا 169): دل ناداں تجھے ہوا کیا ہے — تشریح و روزمرہ۔",
    "assignedDate": "2027-02-02",
    "dueDate": "2027-02-02",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 166-169",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_12",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Play 3 \"The Oyster and the Pearl\" Theme & Questions",
    "description": "Sunshine English (pp. 201-204): Theme of hope and Harry Van Dusen's barber shop.",
    "assignedDate": "2027-02-03",
    "dueDate": "2027-02-03",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 201-204",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_12",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ الانعام رکوع 1 تا 3: دلائلِ توحید و ربوبیت",
    "description": "ہمدرد نوٹس سیریز (صفحہ 111 تا 114): کائنات کے مظاہر اور اللہ تعالیٰ کی وحدانیت۔",
    "assignedDate": "2027-02-04",
    "dueDate": "2027-02-04",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 111-114",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_12",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "منتخب احادیث نبویہ (1 تا 5) مع ترجمہ و تشریح",
    "description": "اسلامیات 11 (صفحہ 98 تا 100): نیت، اخلاص اور باہمی حسنِ سلوک کی احادیث۔",
    "assignedDate": "2027-02-05",
    "dueDate": "2027-02-05",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 98-100",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_12",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-02-06",
    "dueDate": "2027-02-06",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_12",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 12: فیز 2 ماڈل پیپرز — ٹائم مینجمنٹ و اینالیٹکس",
    "description": "امتحانی ماحول میں وقت کی پابندی کے ساتھ پیپر حل کرنا۔",
    "assignedDate": "2027-02-07",
    "dueDate": "2027-02-07",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Phase 2 Exam",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_13",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "جسمانی صحت و تندرستی کے بنیادی اجزاء کی پیمائش",
    "description": "پروفیسر گیلانی (صفحہ 135 تا 138): کارڈیو ریسپیریٹری فٹنس اور لچک جانچنے کے معیاری ٹیسٹ۔",
    "assignedDate": "2027-02-08",
    "dueDate": "2027-02-08",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 135-138",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_13",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "غزل علامہ اقبال: نہ آتے ہمیں اس میں تکرار کیا تھی",
    "description": "شرح سرمایہ اردو (صفحہ 181 تا 184): کلام اقبال کے مفاہیم اور فکری پہلو۔",
    "assignedDate": "2027-02-09",
    "dueDate": "2027-02-09",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 181-184",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_13",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Urdu to English Translation: 10 Model Board Paragraphs",
    "description": "Sunshine English (pp. 221-224): Translate unseen Urdu narrative passages into English.",
    "assignedDate": "2027-02-10",
    "dueDate": "2027-02-10",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 221-224",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_13",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "سورۃ الاعراف رکوع 1 تا 3: قصص الانبیاء اور عبرت",
    "description": "ہمدرد نوٹس سیریز (صفحہ 119 تا 122): سابقہ اقوام کے احوال اور دعوتِ حق۔",
    "assignedDate": "2027-02-11",
    "dueDate": "2027-02-11",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 119-122",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_13",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "منتخب احادیث نبویہ (6 تا 10) مع ترجمہ و تشریح",
    "description": "اسلامیات 11 (صفحہ 103 تا 105): امانت، سچائی اور رشتہ داری جوڑنے کے احکام۔",
    "assignedDate": "2027-02-12",
    "dueDate": "2027-02-12",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 103-105",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_13",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-02-13",
    "dueDate": "2027-02-13",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_13",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 13: تمام 6 مضامین کا پری بورڈ فل ماک ایگزام 1",
    "description": "بورڈ پیٹرن پر مکمل سلیبس کا پہلا گرینڈ ماک ٹیسٹ۔",
    "assignedDate": "2027-02-14",
    "dueDate": "2027-02-14",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Full Mock 1",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_14",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "نشہ آور ادویات اور کھلاڑیوں کے لیے قانونی پابندیاں",
    "description": "پروفیسر گیلانی (صفحہ 139 تا 140): اینٹی ڈوپنگ رولز اور اخلاقی سپورٹس مین شپ۔",
    "assignedDate": "2027-02-15",
    "dueDate": "2027-02-15",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 139-140",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_14",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "جامع گرامر: تذکیر و تانیث اور جملوں کی درستی",
    "description": "شرح سرمایہ اردو (صفحہ 196 تا 200): بورڈ میں بار بار آنے والے غلط فقرات کی اصلاح۔",
    "assignedDate": "2027-02-16",
    "dueDate": "2027-02-16",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 196-200",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_14",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Comprehensive Pairs of Words (1-50) Drill & Composition",
    "description": "Sunshine English (pp. 241-244): Master tricky homophones with illustrative sentences.",
    "assignedDate": "2027-02-17",
    "dueDate": "2027-02-17",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 241-244",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_14",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "منتخب قرآنی کلمات اور ذخیرہ الفاظ کی جامع دہرائی",
    "description": "ہمدرد نوٹس سیریز (صفحہ 125 تا 128): بورڈ ماڈل پیپرز کے کثیر الاستعمال قرآنی الفاظ۔",
    "assignedDate": "2027-02-18",
    "dueDate": "2027-02-18",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 125-128",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_14",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "اسلامی تہذیب کے امتیازی اوصاف اور تمدنی اقدار",
    "description": "اسلامیات 11 (صفحہ 107 تا 110): توحید، اخوت، عدل اور شائستگی۔",
    "assignedDate": "2027-02-19",
    "dueDate": "2027-02-19",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 107-110",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_14",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-02-20",
    "dueDate": "2027-02-20",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_rev_14",
    "subjectId": "sub_01",
    "subjectName": "Weekly Revision Drill",
    "subjectCode": "FAIT-REV-11",
    "sourceType": "syllabus",
    "sourceTitle": "BISE DG Khan Past Papers Collection",
    "title": "ہفتہ وار جائزہ 14: فائنل پری بورڈ فل ماک ایگزام 2 (28 فروری ٹارگٹ)",
    "description": "28 فروری ڈیڈ لائن سے قبل 100% سلیبس کمپلیشن سرٹیفیکیشن۔",
    "assignedDate": "2027-02-21",
    "dueDate": "2027-02-21",
    "dayOfWeek": "Monday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Final Mock 2",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_ped_15",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "فائنل بورڈ جائزہ: فزیکل ایجوکیشن مکمل نوٹس ریویژن",
    "description": "پروفیسر گیلانی مکمل درسی کتاب: تمام 14 ابواب کے اہم مختصر سوالات کی فائنل دہرائی۔",
    "assignedDate": "2027-02-22",
    "dueDate": "2027-02-22",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-140",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_urd_15",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "فائنل بورڈ جائزہ: شرح سرمایہ اردو معروضی و انشائیہ",
    "description": "شرح سرمایہ اردو: 5 سالہ ماضی معروضی پیپرز اور خطوط کا فائنل جائزہ۔",
    "assignedDate": "2027-02-23",
    "dueDate": "2027-02-23",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-220",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_eng_15",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 Textbook & Sunshine English (Prof. Musarrat Hussain)",
    "title": "Final Board English Synthesis: Full 100-Mark Model Paper",
    "description": "Complete review of Book-1, Book-3, and Sunshine English Grammar.",
    "assignedDate": "2027-02-24",
    "dueDate": "2027-02-24",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "pp. 1-260",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_tqm_15",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran",
    "subjectCode": "FAIT-TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ترجمۃ القرآن المجید (ہمدرد کتب خانہ سیریز)",
    "title": "فائنل بورڈ جائزہ: ترجمۃ القرآن المجید مکمل سلیبس",
    "description": "ہمدرد نوٹس سیریز: 5 سالہ ماضی معروضی اور با محاورہ ترجمہ کے پرچہ جات۔",
    "assignedDate": "2027-02-25",
    "dueDate": "2027-02-25",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-130",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_isl_15",
    "subjectId": "sub_06",
    "subjectName": "Islamiyat Lazmi",
    "subjectCode": "FAIT-ISL-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA درسی کتاب)",
    "title": "فائنل بورڈ جائزہ: اسلامیات لازمی 100% سلیبس ماڈل پیپر",
    "description": "اسلامیات 11: 5 سالہ ماضی معروضی و انشائیہ پرچہ جات کی مکمل تیاری۔",
    "assignedDate": "2027-02-26",
    "dueDate": "2027-02-26",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Pages 1-110",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_15",
    "subjectId": "sub_off",
    "subjectName": "Mandatory Rest Day",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "StudyHub Academic Policy",
    "title": "اتوار چھٹی: ہفتہ وار لازمی آرام (Mandatory Rest Day)",
    "description": "اتوار کو کسی قسم کا ٹیسٹ یا ہوم ورک شیڈول نہیں ہے۔ مکمل آرام اور ذہنی تازگی حاصل کریں۔",
    "assignedDate": "2027-02-27",
    "dueDate": "2027-02-27",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "Rest & Recovery",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  }
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
      'sub_01': 'Tuesday',
      'sub_02': 'Wednesday',
      'sub_03': 'Thursday',
      'sub_05': 'Friday',
      'sub_06': 'Saturday',
      'sub_04': 'Tuesday',
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
            title: params.subjectCode?.includes('URD') || params.subjectName?.toLowerCase().includes('urdu')
              ? `سبق ${chapterNum}: اُردو 11 لازمی و شرح سرمایہ (صفحات ${chStartPage} تا ${chEndPage})`
              : `Week ${w + 1} Deep Study: Chapter ${chapterNum} (Pages ${chStartPage}–${chEndPage})`,
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
            title: params.subjectCode?.includes('URD') || params.subjectName?.toLowerCase().includes('urdu')
              ? `روزانہ مطالعہ قسط: اُردو 11 و شرح سرمایہ (ہدف: ~2.5 صفحات)`
              : `Daily Reading Quota: ${params.subjectName} (Target: ~2.5 Pages)`,
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
