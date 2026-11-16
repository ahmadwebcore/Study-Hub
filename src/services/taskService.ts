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

const STORAGE_KEY = 'studyhub_weekly_daily_tasks_v13';

try {
  ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12'].forEach(v => localStorage.removeItem('studyhub_weekly_daily_tasks_' + v));
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
    "id": "tsk_henza_fait_ped_11_w1",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز (صفحات 1-12) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-21",
    "dueDate": "2026-11-21",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w1",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ)",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ) (صفحات 1-15) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-17",
    "dueDate": "2026-11-17",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w1",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10)",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10) (Pages 1-18) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-18",
    "dueDate": "2026-11-18",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w1",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Introduction to IT, Hardware vs Software, System Unit & Bus Architecture",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science and Entrepreneurship 11 (IT Series — Tariq Mahmood & Imran Saeed) — Unit 1: Introduction to IT, System Unit, Data vs Information (Pages 1-25) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-19",
    "dueDate": "2026-11-19",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w1",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — عقیدہ توحید، رسالت و سورۃ البقرہ (رکوع 1 تا 2) ترجمہ و مفہوم",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 (پنجاب ٹیکسٹ بک بورڈ) و ترجمۃ القرآن (ہمدرد نوٹس) — عقیدہ توحید و رسالت، سورۃ البقرہ آیات 1 تا 16 لفظی و با محاورہ ترجمہ (صفحات 1-18) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-20",
    "dueDate": "2026-11-20",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w1",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 1: معاشیات کی نوعیت و وسعت (ایڈم سمتھ، مارشل اور رابنز کی تعریفات)",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی) — باب اول: معاشیات کی تعریفات، نوعیت اور دائرہ کار (صفحات 1-20) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-21",
    "dueDate": "2026-11-21",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w1",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-11-22",
    "dueDate": "2026-11-22",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w2",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات (صفحات 13-25) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-28",
    "dueDate": "2026-11-28",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w2",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ و اہم پیراگراف تشریح",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اپنی مدد آپ، سیاق و سباق اور ارکانِ استعارہ قواعد (صفحات 16-28) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-24",
    "dueDate": "2026-11-24",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w2",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 2 \"Clearing in the Sky\", Present & Past Tenses Drill, Pairs of Words (11-20)",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 2 \"Clearing in the Sky\", Tense Rules & Word Pairs 11-20 (Pages 19-35) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-25",
    "dueDate": "2026-11-25",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w2",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Data Communications, Transmission Modes (Simplex/Duplex) & Transmission Media",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 2: Transmission Modes, Guided Media (Twisted pair, Coaxial, Fiber Optic) (Pages 26-50) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-26",
    "dueDate": "2026-11-26",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w2",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — عقیدہ ملائکہ و کتب سماویہ اور سورۃ البقرہ (رکوع 3 تا 4) فہم قرآن",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — عقیدہ ملائکہ، اسمائے کتب سماویہ اور سورۃ البقرہ رکوع 3 تا 4 (صفحات 19-35) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-27",
    "dueDate": "2026-11-27",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w2",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 2: رابنز کی تعریف کے امتیازی اوصاف اور جزوی و کلی معاشیات",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 (پروفیسر حبیب اللہ قریشی) — رابنز کی تعریف کے محاسن، مائیکرو اور میکرو اکنامکس میں فرق (صفحات 21-38) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-11-28",
    "dueDate": "2026-11-28",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w2",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-11-29",
    "dueDate": "2026-11-29",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w3",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — نظامِ دورانِ خون، دل کی اندرونی ساخت اور نبض کی پیمائش",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام دوران خون، دل کے خانے اور خون کے اجزاء (صفحات 26-38) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-05",
    "dueDate": "2026-12-05",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w3",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — سبق سرسید کے اخلاق و خصائل، مکالمہ نگاری اور استعارہ کی تعریف",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — سبق سرسید کے اخلاق و خصائل (مولانا حالی)، مکالمہ نگاری اور قواعد (صفحات 29-42) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-01",
    "dueDate": "2026-12-01",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w3",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 3 \"Dark they were, and Golden-eyed\", Master Tenses, Direct/Indirect",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 3 Analysis, Direct & Indirect Speech rules, Pairs of Words 21-30 (Pages 36-52) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-02",
    "dueDate": "2026-12-02",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w3",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Computer Networks: LAN, WAN, MAN, Client-Server vs Peer-to-Peer",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 3: Local Area Network, Wide Area Network, Network Architecture (Pages 51-75) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-03",
    "dueDate": "2026-12-03",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w3",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — عقیدہ آخرت و انسانی کردار اور سورۃ البقرہ (رکوع 5 تا 6) ترجمہ",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — عقیدہ آخرت کا انسانی زندگی پر اثر، سورۃ البقرہ رکوع 5 تا 6 (صفحات 36-50) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-04",
    "dueDate": "2026-12-04",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w3",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 3: افادہ کی تعریف، ابتدائی، کل اور مختتم افادہ (Total & Marginal Utility)",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 (علمی کتاب خانہ) — افادہ کی پیمائش، مفروضات اور کل بمقابلہ مختتم افادہ (صفحات 39-56) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-05",
    "dueDate": "2026-12-05",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w3",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-12-06",
    "dueDate": "2026-12-06",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w4",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — نظام تنفس، پھیپھڑوں کے افعال اور گیسوں کا تبادلہ",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام تنفس، سانس لینے کا عمل اور ورزش کے دوران پھیپھڑوں کا کردار (صفحات 39-50) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-12",
    "dueDate": "2026-12-12",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w4",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — نظم 1 حمد (مولانا الطاف حسین حالی) تشریح اور ردیف و قافیہ قواعد",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — نظم حمد کے تمام اشعار کی تشریح، ردیف اور قافیہ کی مشق (صفحات 43-55) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-08",
    "dueDate": "2026-12-08",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w4",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 4 \"Thank You, M'am\", Letter to Father about Studies, Synonyms",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 4 Short Qs, Letter Writing to Father & Board Synonyms (Pages 53-68) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-09",
    "dueDate": "2026-12-09",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w4",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Network Topologies (Bus, Star, Ring, Mesh) & Network Devices (Switch/Router)",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 4: Linear Bus, Star, Ring, Mesh Topologies, Switches and Routers (Pages 76-100) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-10",
    "dueDate": "2026-12-10",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w4",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — نماز کی اہمیت، فضائل، معراج النبی ﷺ اور سورۃ البقرہ (رکوع 7 تا 8)",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 و ترجمۃ القرآن — نماز کے روحانی اور معاشرتی فوائد، سورۃ البقرہ رکوع 7 تا 8 (صفحات 51-65) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-11",
    "dueDate": "2026-12-11",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w4",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 4: قانون تقلیل افادہ مختتم (Law of Diminishing Marginal Utility) گوشوارہ و ڈایاگرام",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — قانون تقلیل افادہ مختتم کا گوشوارہ، ڈایاگرام، مفروضات اور مستثنیات (صفحات 57-75) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-12",
    "dueDate": "2026-12-12",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w4",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-12-13",
    "dueDate": "2026-12-13",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w5",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — اتھلیٹکس: شارٹ ڈسٹنس ریسز 100m، 200m اور 400m رولز",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — اتھلیٹکس قوانین، سٹارٹنگ بلاکس اور فالس سٹارٹ کے رولز (صفحات 51-64) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-19",
    "dueDate": "2026-12-19",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w5",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — نظم 2 نعت (امیر مینائی) اشعار تشریح اور تلمیح کی امتحانی مشق",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — نعت رسول مقبول ﷺ، تلمیح کے اصول اور معروضی سوالات (صفحات 56-68) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-15",
    "dueDate": "2026-12-15",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w5",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 5 \"The Piece of String\", Applications for Sick Leave / Fee Concession",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 5 Analysis of Maitre Hauchecorne, Formal Applications (Pages 69-85) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-16",
    "dueDate": "2026-12-16",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w5",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — The OSI 7-Layer Reference Model & TCP/IP Protocol Suite Functions",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 5: Physical, Data Link, Network, Transport, Session, Presentation, Application layers (Pages 101-125) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-17",
    "dueDate": "2026-12-17",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w5",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — روزہ، فلسفہ صیام اور سورۃ البقرہ (رکوع 9 تا 10) با محاورہ ترجمہ",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — روزے کی فضیلت و تربیت نفس، سورۃ البقرہ رکوع 9 تا 10 (صفحات 66-80) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-18",
    "dueDate": "2026-12-18",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w5",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 5: قانون مساوی افادہ مختتم (Law of Equi-Marginal Utility) اور صارف کا توازن",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — قانون مساوی افادہ مختتم کا گوشوارہ، ڈایاگرام اور صارف کی تسکین کا زیادہ سے زیادہ حصول (صفحات 76-95) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-19",
    "dueDate": "2026-12-19",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w5",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-12-20",
    "dueDate": "2026-12-20",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w6",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — فیلڈ ایونٹس: لانگ جمپ، ٹرپل جمپ اور ہائی جمپ رولز",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — لانگ جمپ، ٹیک آف بورڈ، لینڈنگ پٹ اور فاول قوانین (صفحات 65-78) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-26",
    "dueDate": "2026-12-26",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w6",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — غزل 1 میر تقی میر (ہستی اپنی حباب کی سی ہے) اشعار تشریح و مقطع قواعد",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — میر تقی میر کی غزل، مطلع و مقطع کی پہچان اور امتحانی تشریحات (صفحات 69-82) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-22",
    "dueDate": "2026-12-22",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w6",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 6 \"The Reward\", Punctuation Rules, Pairs of Words (21-35)",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 6 Jorkens philosophy, Punctuation passage & Word Pairs (Pages 86-102) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-23",
    "dueDate": "2026-12-23",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w6",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Information Security, Malware (Viruses, Worms, Trojans) & Antivirus",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 6: Virus types, Cyber attacks, Firewall, Data Protection and Copyright Laws (Pages 126-150) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-24",
    "dueDate": "2026-12-24",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w6",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — زکوٰۃ کا معاشی نظام و معاشرتی فوائد اور سورۃ آل عمران تعارف",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 و ترجمۃ القرآن — مصارفِ زکوٰۃ، زکوٰۃ کے معاشی فوائد، سورۃ آل عمران تعارف و فضائل (صفحات 81-95) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-25",
    "dueDate": "2026-12-25",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w6",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 6: طلب کا مفہوم، قانون طلب (Law of Demand) گوشوارہ اور خطِ طلب",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — قانون طلب کا جدول، ڈایاگرام، منفی جھکاؤ کی وجوہات اور مستثنیات (صفحات 96-115) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-26",
    "dueDate": "2026-12-26",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w6",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2026-12-27",
    "dueDate": "2026-12-27",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w7",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — تھروئنگ ایونٹس: شاٹ پٹ اور ڈسکس تھرو رولز",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — شاٹ پٹ کا وزن، سیکٹر، سرکل کا قطر اور تھرو قوانین (صفحات 79-92) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-02",
    "dueDate": "2027-01-02",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w7",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — غزل 2 خواجہ حیدر علی آتش (یہ آرزو تھی تجھے گل کے روبرو کرتے) تشریح",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — خواجہ حیدر علی آتش کی غزل کے اشعار اور قواعد و انشا (صفحات 83-95) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-29",
    "dueDate": "2026-12-29",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w7",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 7 \"The Use of Force\", Direct and Indirect Interrogative Sentences",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 7 Character study of Doctor & Mathilda, Grammar Interrogative conversion (Pages 103-118) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-30",
    "dueDate": "2026-12-30",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w7",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Operating Systems: Windows, Linux, Process Management & Virtual Memory",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 7: OS Architecture, Multitasking, File Allocation Table (Pages 151-175) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2026-12-31",
    "dueDate": "2026-12-31",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w7",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — حج بیت اللہ، عالمگیر اخوت و سورۃ آل عمران (رکوع 1 تا 3) ترجمہ",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 و ترجمۃ القرآن — ارکانِ حج، معاشرتی اخوت، سورۃ آل عمران رکوع 1 تا 3 (صفحات 96-110) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-01",
    "dueDate": "2027-01-01",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w7",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 7: طلب کی لچک (Elasticity of Demand): پیمائش کے طریقے اور معاشی اہمیت",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — لچکدار و غیر لچکدار طلب، اکائی کے برابر، اور لچک کی پیمائش کے طریقے (صفحات 116-135) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-02",
    "dueDate": "2027-01-02",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w7",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-01-03",
    "dueDate": "2027-01-03",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w8",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — ریلے ریسز 4x100m، 4x400m اور بیٹن ایکسچینج زون رولز",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ریلے ریس، 20 میٹر ٹیک اوور زون، بیٹن گرنے پر قوانین (صفحات 93-105) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-09",
    "dueDate": "2027-01-09",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w8",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — سبق ادیب کی عزت (پریم چند) خلاصہ و درخواست نویسی برائے پرنسپل",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — سبق ادیب کی عزت خلاصہ، سوالات اور امتحانی درخواست نویسی (صفحات 96-110) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-05",
    "dueDate": "2027-01-05",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w8",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Poem 1 \"The Rain\" & Poem 2 \"Night Mail\" Paraphrasing and Themes",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Poem Paraphrasing, Stanza Explanation and Board Theme questions (Pages 119-135) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-06",
    "dueDate": "2027-01-06",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w8",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Programming Concepts, Algorithms, Flowcharts and Pseudocode",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 8: Problem Solving Steps, Flowchart Symbols, Algorithms (Pages 176-200) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-07",
    "dueDate": "2027-01-07",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w8",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — جہاد فی سبیل اللہ، اقسام و شرائط و سورۃ آل عمران (رکوع 4 تا 6)",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — جہاد بالنفس و بالمال، سورۃ آل عمران رکوع 4 تا 6 (صفحات 111-125) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-08",
    "dueDate": "2027-01-08",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w8",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 8: رسد کا مفہوم، قانونِ رسد (Law of Supply) گوشوارہ، ڈایاگرام اور رسد کی لچک",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — ذخیرہ بمقابلہ رسد، قانون رسد کا گوشوارہ اور رسد کی لچک (صفحات 136-155) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-09",
    "dueDate": "2027-01-09",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w8",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-01-10",
    "dueDate": "2027-01-10",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w9",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — ابتدائی طبی امداد (First Aid): موچ، فریکچر اور ہیٹ سٹروک",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — فرسٹ ایڈ کے اصول، ہڈی ٹوٹنے کی اقسام اور سی پی آر کے مراحل (صفحات 106-118) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-16",
    "dueDate": "2027-01-16",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w9",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — سبق سفارش (احمد ندیم قاسمی) خلاصہ، پیراگراف تشریح و روزمرہ محاورہ",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — سبق سفارش کا تفصیلی خلاصہ، پیراگراف تشریح اور قواعد (صفحات 111-125) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-12",
    "dueDate": "2027-01-12",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w9",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 8 \"The Gulistan of Sa'di\", Board Moral Stories Practice",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Three Parables of Sa'di, Moral Story writing with titles (Pages 136-150) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-13",
    "dueDate": "2027-01-13",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w9",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Python Programming Basics: Variables, Data Types, Operators & I/O",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 9: Python Syntax, print, input, data types, arithmetic operators (Pages 201-225) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-14",
    "dueDate": "2027-01-14",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w9",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — سیرت النبی ﷺ: اسوہ حسنہ، امانت و دیانت و سورۃ النساء تعارف",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 و ترجمۃ القرآن — سیرت طیبہ، معاملات میں امانت، سورۃ النساء تعارف و آیات (صفحات 126-140) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-15",
    "dueDate": "2027-01-15",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w9",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 9: توازن قیمت (Equilibrium Price): طلب اور رسد کے باہمی تعامل سے قیمت کا تعین",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — مارکیٹ ایکویلیبریم، طلب اور رسد کا تقاطع اور توازن قیمت کا گراف (صفحات 156-175) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-16",
    "dueDate": "2027-01-16",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w9",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-01-17",
    "dueDate": "2027-01-17",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w10",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — متوازن غذا، غذائی اجزاء اور کھلاڑیوں کی غذائی ضروریات",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — پروٹین، کاربوہائیڈریٹس، وٹامنز اور کھلاڑیوں کے لیے پانی کی مقدار (صفحات 119-130) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-23",
    "dueDate": "2027-01-23",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w10",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — نظم 3 تسلیم و رضا (نظیر اکبر آبادی) اشعار تشریح و مرکزی خیال",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — نظم تسلیم و رضا، اشعار کے مطالب اور مرکزی خیال (صفحات 126-140) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-19",
    "dueDate": "2027-01-19",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w10",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Poem 3 \"Loveliest of Trees\" & Story 9 \"The Foolish Quack\" Synonyms Drill",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 9 analysis, Board Synonyms drill & Correction of Sentences (Pages 151-168) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-20",
    "dueDate": "2027-01-20",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w10",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Python Control Structures: if-else conditions & nested statements",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 10: Decision making, if, elif, else, logical operators in Python (Pages 226-245) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-21",
    "dueDate": "2027-01-21",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w10",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — حقوق العباد: والدین اور اساتذہ کے حقوق و سورۃ النساء (رکوع 1 تا 3)",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — والدین کی اطاعت، اساتذہ کے حقوق، سورۃ النساء رکوع 1 تا 3 (صفحات 141-155) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-22",
    "dueDate": "2027-01-22",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w10",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 10: پیدائش دولت کے چاروں عوامل: زمین اور محنت کی خصوصیات و اقسام",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — زمین کی خصوصیات، محنت کی نوعیت، نقل پذیری اور کارکردگی کو متاثر کرنے والے عوامل (صفحات 176-192) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-23",
    "dueDate": "2027-01-23",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w10",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-01-24",
    "dueDate": "2027-01-24",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w11",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — تھکاوٹ، آرام اور صحت پر ورزش کے مثبت اثرات",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — جسمانی تھکاوٹ کی وجوہات، لیکٹک ایسڈ اور آرام کے فوائد (صفحات 131-140) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-30",
    "dueDate": "2027-01-30",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w11",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — غزل 3 مرزا اسد اللہ خان غالب (دل ناداں تجھے ہوا کیا ہے) تشریح",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — غالب کی غزل کے اشعار کی مفصل تشریح اور معروضی سوالات (صفحات 141-155) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-26",
    "dueDate": "2027-01-26",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w11",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Story 10 \"A Mild Attack of Locusts\", Phrasal Verbs & Prepositions",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Story 10 Doris Lessing, Appropriate Prepositions & Phrasal Verbs (Pages 169-185) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-27",
    "dueDate": "2027-01-27",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w11",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Python Loops (for, while loops, range, break and continue)",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 11: Iteration structures, for loops, while loops, nested loop patterns (Pages 246-260) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-28",
    "dueDate": "2027-01-28",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w11",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — حقوق العباد: ہمسایوں اور غیر مسلموں کے حقوق و سورۃ المائدہ تعارف",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی 11 و ترجمۃ القرآن — پڑوسیوں کے حقوق، غیر مسلم شہریوں کے حقوق، سورۃ المائدہ (صفحات 156-170) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-29",
    "dueDate": "2027-01-29",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w11",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 11: سرمایہ اور تنظیم کی اہمیت، فرائض اور کاروباری تنظیموں کی اقسام",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — سرمایہ کی تشکیل، ناظم کے فرائض، واحد ملکیت، شراکت اور مشترکہ سرمائے کی کمپنی (صفحات 193-210) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-01-30",
    "dueDate": "2027-01-30",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w11",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-01-31",
    "dueDate": "2027-01-31",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w12",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — 5 سالہ BISE DG Khan بورڈ پاسٹ پیپرز ایم سی کیوز مشق",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — پچھلے 5 سال کے ڈی جی خان بورڈ پیپرز ایم سی کیوز کا جامع جائزہ (صفحات 1-70) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-06",
    "dueDate": "2027-02-06",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w12",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — تلخیص نگاری (عبارت کا ایک تہائی خلاصہ و عنوان) امتحانی مشق",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — تلخیص نگاری کے بنیادی اصول اور اہم امتحانی عبارات کی تلخیص (صفحات 156-170) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-02",
    "dueDate": "2027-02-02",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w12",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Book-3 Play 1 \"Heat Lightning\" Short Questions & Characters",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Heat Lightning Play short answers, Character of the Girl and First Man (Pages 186-205) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-03",
    "dueDate": "2027-02-03",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w12",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Entrepreneurship in IT: Freelancing, Startups & E-Commerce in Pakistan",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Unit 12: Freelance platforms, Business Model Canvas, Digital Payments (Pages 261-275) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-04",
    "dueDate": "2027-02-04",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w12",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — اسلامی تہذیب کے بنیادی اوصاف و قرآنی دعائیں اور حفظ آیات",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات 11 و ترجمۃ القرآن — اسلامی تہذیب و تمدن، اہم قرآنی دعاؤں کا ترجمہ اور فہم (صفحات 171-185) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-05",
    "dueDate": "2027-02-05",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w12",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — باب 12: قوانین حاصل (Laws of Returns): تقصیر، یکسانی اور تزاید حاصل",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — قوانین حاصل کا گوشوارہ اور ڈایاگرام مع مفروضات (صفحات 211-228) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-06",
    "dueDate": "2027-02-06",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w12",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-02-07",
    "dueDate": "2027-02-07",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w13",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — لانگ سوالات گیس پیپر و بورڈ اہم ٹاپکس ریویژن",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — دوران خون، دل، عضلات اور ٹریک و فیلڈ کے لانگ سوالات (صفحات 71-140) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-13",
    "dueDate": "2027-02-13",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w13",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — تمام اسباق کے معروضی کثیر الانتخابی سوالات (MCQs) مشق",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — تمام 14 اسباق، نظموں اور غزلوں کے 200+ کثیر الانتخابی سوالات کی دہرائی (صفحات 1-180) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-09",
    "dueDate": "2027-02-09",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w13",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Sunshine Board Grammar Synthesis: Top 50 Pairs of Words & Tenses Test",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: Sunshine Comprehensive English — Top 50 Pairs of Words, Active/Passive & Direct/Indirect Board Grand Test (Pages 206-235) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-10",
    "dueDate": "2027-02-10",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w13",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — IT Series 700+ MCQs Marathon & 600+ Short Questions Comprehensive Drill",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Chapters 1-12 Board MCQs and Short Questions Exhaustive Review (Pages 1-150) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-11",
    "dueDate": "2027-02-11",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w13",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — اہم قرآنی تراجم، کثیر الانتخابی سوالات اور معروضی ریویژن",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات و ترجمۃ القرآن — تمام منتخب سورتوں کے اہم تراجم اور معروضی بورڈ سوالات کا مکمل جائزہ کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-12",
    "dueDate": "2027-02-12",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w13",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — 5 سالہ BISE DG Khan بورڈ کثیر الانتخابی سوالات (MCQs) ریویژن",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 — پچھلے 5 سال کے بورڈ کثیر الانتخابی سوالات کا جامع حل (صفحات 1-120) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-13",
    "dueDate": "2027-02-13",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w13",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-02-14",
    "dueDate": "2027-02-14",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w14",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — پیپر پریزنٹیشن و ماڈل امتحانی پریکٹس (BISE DG Khan)",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — امتحانی مارکنگ اسکیم کے مطابق ڈایاگرامز اور ہیڈنگز کے ساتھ مکمل پریکٹس (صفحات 1-140) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-20",
    "dueDate": "2027-02-20",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w14",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — BISE DG Khan اردو پیپر پریزنٹیشن، شعری تشریحات و خطوط ریویژن",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): شرح سرمایہ اردو 11 — خط، خلاصہ، مکالمہ، اور اشعار کی تشریح کی معیاری پریزنٹیشن مشق کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-16",
    "dueDate": "2027-02-16",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w14",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — BISE DG Khan 5-Year Past Papers English Composition & Synonyms",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 & Sunshine English — Past 5 Years Board Papers, Short Answers and Punctuation Grand Test (Pages 236-260) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-17",
    "dueDate": "2027-02-17",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w14",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Python Coding Lab & BISE DG Khan Board 5-Year Past Question Papers",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science 11 (IT Series) — Python programs writing, logic tracing, and DG Khan past board papers review (Pages 151-280) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-18",
    "dueDate": "2027-02-18",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w14",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — BISE DG Khan بورڈ پاسٹ پیپرز ماڈل ٹیسٹ (100% نصاب)",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی و ترجمۃ القرآن 11 — ڈی جی خان بورڈ کے مطابق ماڈل ٹیسٹ پیپر حل کریں کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-19",
    "dueDate": "2027-02-19",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w14",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — اہم ڈایاگرامز، گوشوارے اور لانگ سوالات کی تیاری",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 (پروفیسر حبیب اللہ قریشی) — تمام قوانین کے گوشوارے، گراف اور لانگ سوالات کی تحریری مشق (صفحات 121-240) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-20",
    "dueDate": "2027-02-20",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w14",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-02-21",
    "dueDate": "2027-02-21",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_ped_11_w15",
    "subjectId": "sub_01",
    "subjectName": "Physical Education",
    "subjectCode": "FAIT-PED-11",
    "sourceType": "book_pdf",
    "sourceTitle": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)",
    "title": "Saturday (Session 2): صحت و جسمانی تعلیم — فائنل بورڈ پریپریشن ماڈل پیپر 100% سلیبس",
    "description": "ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی): ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — فائنل بورڈ پریپریشن ماڈل پیپر 100% سلیبس (مکمل کتاب) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-27",
    "dueDate": "2027-02-27",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_urd_11_w15",
    "subjectId": "sub_02",
    "subjectName": "Urdu & Grammar",
    "subjectCode": "FAIT-URD-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)",
    "title": "اُردو 11 و شرح سرمایہ — فائنل بورڈ ماڈل پیپر 100% اردو و شرح سرمایہ نصاب",
    "description": "اُردو 11 لازمی و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود): سرمایہ اردو و شرح سرمایہ 11 — فائنل بورڈ ماڈل امتحان (مکمل سلیبس 100% کوریج) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-23",
    "dueDate": "2027-02-23",
    "dayOfWeek": "Tuesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eng_11_w15",
    "subjectId": "sub_03",
    "subjectName": "English & Grammar",
    "subjectCode": "FAIT-ENG-11",
    "sourceType": "book_pdf",
    "sourceTitle": "English 11 (PCTB) & Sunshine Comprehensive English",
    "title": "English 11 & Sunshine — Full Book Board Simulation Exam (Book 1, Book 3, Sunshine)",
    "description": "English 11 (PCTB) & Sunshine Comprehensive English: English 11 Complete Course — Full Book Board Simulation Exam according to BISE DG Khan Pattern کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-24",
    "dueDate": "2027-02-24",
    "dayOfWeek": "Wednesday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_csc_11_w15",
    "subjectId": "sub_04",
    "subjectName": "Computer Science & Entrepreneurship",
    "subjectCode": "FAIT-CSC-11",
    "sourceType": "book_pdf",
    "sourceTitle": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید)",
    "title": "Computer Science (IT Series) — Full Syllabus Board Model Exam (Computer Science & Entrepreneurship 11)",
    "description": "کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (IT Series — طارق محمود و عمران سعید): Computer Science and Entrepreneurship 11 (IT Series) — Full Syllabus 100% Board Model Assessment کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-25",
    "dueDate": "2027-02-25",
    "dayOfWeek": "Thursday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_isl_tqm_11_w15",
    "subjectId": "sub_05",
    "subjectName": "Tarjuma-tul-Quran & Islamiyat",
    "subjectCode": "FAIT-ISL/TQM-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز)",
    "title": "اسلامیات و ترجمۃ القرآن — فائنل بورڈ ماڈل امتحان (اسلامیات لازمی و ترجمۃ القرآن 100% نصاب)",
    "description": "اسلامیات لازمی 11 (PECTAA) و ترجمۃ القرآن (ہمدرد کتب خانہ سیریز): اسلامیات لازمی و ترجمۃ القرآن 11 — فائنل بورڈ ماڈل امتحان (مکمل نصاب جائزہ) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-26",
    "dueDate": "2027-02-26",
    "dayOfWeek": "Friday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_fait_eco_11_w15",
    "subjectId": "sub_07",
    "subjectName": "Principles of Economics",
    "subjectCode": "FAIT-ECO-11",
    "sourceType": "book_pdf",
    "sourceTitle": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)",
    "title": "اصولِ معاشیات (Economics 11) — فائنل بورڈ ماڈل امتحان (اصولِ معاشیات 11 — مکمل سلیبس)",
    "description": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی): اصولِ معاشیات 11 (علمی کتاب خانہ) — فائنل بورڈ ماڈل امتحان (مکمل نصاب جائزہ و گریڈنگ) کا تفصیلی مطالعہ کریں، اہم نکات نوٹ کریں اور 30 نمبری روزانہ ٹیسٹ کی تیاری کریں۔",
    "assignedDate": "2027-02-27",
    "dueDate": "2027-02-27",
    "dayOfWeek": "Saturday",
    "isSundayOff": false,
    "estimatedMinutes": 45,
    "status": "pending",
    "pagesRange": "Daily Quota",
    "studentId": "student_henza",
    "studentName": "Henza Noor"
  },
  {
    "id": "tsk_henza_sun_w15",
    "subjectId": "sub_off",
    "subjectName": "Weekly Rest Policy",
    "subjectCode": "REST-DAY",
    "sourceType": "syllabus",
    "sourceTitle": "Pakistan Academic Regulation",
    "title": "Weekly Mandatory Rest Day (Sundays strictly OFF)",
    "description": "Sundays are strictly OFF according to BISE DG Khan academic policy. Zero homework, zero deadlines, rest & relaxation.",
    "assignedDate": "2027-02-28",
    "dueDate": "2027-02-28",
    "dayOfWeek": "Sunday",
    "isSundayOff": true,
    "estimatedMinutes": 0,
    "status": "approved",
    "pagesRange": "None",
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
      recipientEmail: 'dbaddiesvlog@gmail.com',
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
          studentEmail: 'dbaddiesvlog@gmail.com',
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
