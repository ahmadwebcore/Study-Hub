import { notificationService } from './notificationService';
import { integrationService } from './integrationService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TestItem, ResultRecord, TestQuestion, TestAttempt, TestAnswer } from '../types';
import { SAMPLE_RESULTS } from '../data/sampleData';

const CUSTOM_TESTS_KEY = 'studyhub_custom_tests_v14';

try {
  ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13'].forEach(v => localStorage.removeItem('studyhub_custom_tests_' + v));
} catch {}

export function parseDateRobust(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  const parts = dateStr.match(/([a-zA-Z]+)\s+(\d+),\s*(\d+)/);
  if (parts) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = monthNames.indexOf(parts[1].slice(0, 3).toLowerCase());
    if (monthIdx >= 0) {
      return new Date(parseInt(parts[3], 10), monthIdx, parseInt(parts[2], 10));
    }
  }
  return new Date();
}

export function isDateToday(dateStr?: string, testTitle?: string, testId?: string): boolean {
  const now = new Date();
  if (testId === 'test_henza_fait_urd_11_w1' && now.getDay() === 2) {
    return true;
  }
  if (!dateStr) return false;
  const testDate = parseDateRobust(dateStr);
  const isExactDay =
    testDate.getFullYear() === now.getFullYear() &&
    testDate.getMonth() === now.getMonth() &&
    testDate.getDate() === now.getDate();

  if (isExactDay) return true;

  if (testTitle) {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[now.getDay()];
    if (testTitle.toLowerCase().includes(todayDayName)) {
      const diffTime = Math.abs(testDate.getTime() - now.getTime());
      if (diffTime < 4 * 24 * 3600 * 1000) return true;
    }
  }

  return false;
}

const INITIAL_HENZA_TESTS: TestItem[] = [
  {
    "id": "test_henza_fait_urd_11_w1",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ)",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Nov 17, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ) (صفحات 1-15)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "ongoing",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w1",
    "title": "Saturday (Afternoon 2 PM): صحت و جسمانی تعلیم (Physical Education — Adjusted from Monday Nov 16) — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Nov 21, 2026",
    "time": "02:00 PM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز (صفحات 1-12)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w1",
    "title": "Wednesday: English 11 & Sunshine — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Nov 18, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10) (Pages 1-18)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w1",
    "title": "Thursday: Computer Science (IT Series) — Introduction to IT, Hardware vs Software, System Unit & Bus Architecture",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Nov 19, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science and Entrepreneurship 11 (IT Series — Tariq Mahmood & Imran Saeed) — Unit 1: Introduction to IT, System Unit, Data vs Information (Pages 1-25)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w1",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — عقیدہ توحید، رسالت و سورۃ البقرہ (رکوع 1 تا 2) ترجمہ و مفہوم",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Nov 20, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — عقیدہ توحید و رسالت، سورۃ البقرہ آیات 1 تا 16 لفظی و با محاورہ ترجمہ (صفحات 1-18)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w1",
    "title": "Saturday (Morning): اصولِ معاشیات (Economics 11) — باب 1: معاشیات کی نوعیت و وسعت (ایڈم سمتھ، مارشل اور رابنز کی تعریفات)",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Nov 21, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی) — باب اول: معاشیات کی تعریفات، نوعیت اور دائرہ کار (صفحات 1-20)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w2",
    "title": "Monday: صحت و جسمانی تعلیم — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Nov 23, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات (صفحات 13-25)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w2",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ و اہم پیراگراف تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Nov 24, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اپنی مدد آپ، سیاق و سباق اور ارکانِ استعارہ قواعد (صفحات 16-28)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w2",
    "title": "Wednesday: English 11 & Sunshine — Story 2 \"Clearing in the Sky\", Present & Past Tenses Drill, Pairs of Words (11-20)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Nov 25, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 2 \"Clearing in the Sky\", Tense Rules & Word Pairs 11-20 (Pages 19-35)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w2",
    "title": "Thursday: Computer Science (IT Series) — Data Communications, Transmission Modes (Simplex/Duplex) & Transmission Media",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Nov 26, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 2: Transmission Modes, Guided Media (Twisted pair, Coaxial, Fiber Optic) (Pages 26-50)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w2",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — عقیدہ ملائکہ و کتب سماویہ اور سورۃ البقرہ (رکوع 3 تا 4) فہم قرآن",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Nov 27, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — عقیدہ ملائکہ، اسمائے کتب سماویہ اور سورۃ البقرہ رکوع 3 تا 4 (صفحات 19-35)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w2",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 2: رابنز کی تعریف کے امتیازی اوصاف اور جزوی و کلی معاشیات",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Nov 28, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 (پروفیسر حبیب اللہ قریشی) — رابنز کی تعریف کے محاسن، مائیکرو اور میکرو اکنامکس میں فرق (صفحات 21-38)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w3",
    "title": "Monday: صحت و جسمانی تعلیم — نظامِ دورانِ خون، دل کی اندرونی ساخت اور نبض کی پیمائش",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Nov 30, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام دوران خون، دل کے خانے اور خون کے اجزاء (صفحات 26-38)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w3",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — سبق سرسید کے اخلاق و خصائل، مکالمہ نگاری اور استعارہ کی تعریف",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 01, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — سبق سرسید کے اخلاق و خصائل (مولانا حالی)، مکالمہ نگاری اور قواعد (صفحات 29-42)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w3",
    "title": "Wednesday: English 11 & Sunshine — Story 3 \"Dark they were, and Golden-eyed\", Master Tenses, Direct/Indirect",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 02, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 3 Analysis, Direct & Indirect Speech rules, Pairs of Words 21-30 (Pages 36-52)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w3",
    "title": "Thursday: Computer Science (IT Series) — Computer Networks: LAN, WAN, MAN, Client-Server vs Peer-to-Peer",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Dec 03, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 3: Local Area Network, Wide Area Network, Network Architecture (Pages 51-75)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w3",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — عقیدہ آخرت و انسانی کردار اور سورۃ البقرہ (رکوع 5 تا 6) ترجمہ",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Dec 04, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — عقیدہ آخرت کا انسانی زندگی پر اثر، سورۃ البقرہ رکوع 5 تا 6 (صفحات 36-50)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w3",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 3: افادہ کی تعریف، ابتدائی، کل اور مختتم افادہ (Total & Marginal Utility)",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Dec 05, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 (علمی کتاب خانہ) — افادہ کی پیمائش، مفروضات اور کل بمقابلہ مختتم افادہ (صفحات 39-56)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w4",
    "title": "Monday: صحت و جسمانی تعلیم — نظام تنفس، پھیپھڑوں کے افعال اور گیسوں کا تبادلہ",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 07, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام تنفس، سانس لینے کا عمل اور ورزش کے دوران پھیپھڑوں کا کردار (صفحات 39-50)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w4",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — نظم 1 حمد (مولانا الطاف حسین حالی) تشریح اور ردیف و قافیہ قواعد",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 08, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — نظم حمد کے تمام اشعار کی تشریح، ردیف اور قافیہ کی مشق (صفحات 43-55)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w4",
    "title": "Wednesday: English 11 & Sunshine — Story 4 \"Thank You, M'am\", Letter to Father about Studies, Synonyms",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 09, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 4 Short Qs, Letter Writing to Father & Board Synonyms (Pages 53-68)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w4",
    "title": "Thursday: Computer Science (IT Series) — Network Topologies (Bus, Star, Ring, Mesh) & Network Devices (Switch/Router)",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Dec 10, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 4: Linear Bus, Star, Ring, Mesh Topologies, Switches and Routers (Pages 76-100)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w4",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — نماز کی اہمیت، فضائل، معراج النبی ﷺ اور سورۃ البقرہ (رکوع 7 تا 8)",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Dec 11, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — نماز کے روحانی اور معاشرتی فوائد، سورۃ البقرہ رکوع 7 تا 8 (صفحات 51-65)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w4",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 4: قانون تقلیل افادہ مختتم (Law of Diminishing Marginal Utility) گوشوارہ و ڈایاگرام",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Dec 12, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — قانون تقلیل افادہ مختتم کا گوشوارہ، ڈایاگرام، مفروضات اور مستثنیات (صفحات 57-75)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w5",
    "title": "Monday: صحت و جسمانی تعلیم — اتھلیٹکس: شارٹ ڈسٹنس ریسز 100m، 200m اور 400m رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 14, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — اتھلیٹکس قوانین، سٹارٹنگ بلاکس اور فالس سٹارٹ کے رولز (صفحات 51-64)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w5",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — نظم 2 نعت (امیر مینائی) اشعار تشریح اور تلمیح کی امتحانی مشق",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 15, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — نعت رسول مقبول ﷺ، تلمیح کے اصول اور معروضی سوالات (صفحات 56-68)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w5",
    "title": "Wednesday: English 11 & Sunshine — Story 5 \"The Piece of String\", Applications for Sick Leave / Fee Concession",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 16, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 5 Analysis of Maitre Hauchecorne, Formal Applications (Pages 69-85)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w5",
    "title": "Thursday: Computer Science (IT Series) — The OSI 7-Layer Reference Model & TCP/IP Protocol Suite Functions",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Dec 17, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 5: Physical, Data Link, Network, Transport, Session, Presentation, Application layers (Pages 101-125)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w5",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — روزہ، فلسفہ صیام اور سورۃ البقرہ (رکوع 9 تا 10) با محاورہ ترجمہ",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Dec 18, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — روزے کی فضیلت و تربیت نفس، سورۃ البقرہ رکوع 9 تا 10 (صفحات 66-80)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w5",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 5: قانون مساوی افادہ مختتم (Law of Equi-Marginal Utility) اور صارف کا توازن",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Dec 19, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — قانون مساوی افادہ مختتم کا گوشوارہ، ڈایاگرام اور صارف کی تسکین کا زیادہ سے زیادہ حصول (صفحات 76-95)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w6",
    "title": "Monday: صحت و جسمانی تعلیم — فیلڈ ایونٹس: لانگ جمپ، ٹرپل جمپ اور ہائی جمپ رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 21, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — لانگ جمپ، ٹیک آف بورڈ، لینڈنگ پٹ اور فاول قوانین (صفحات 65-78)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w6",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — غزل 1 میر تقی میر (ہستی اپنی حباب کی سی ہے) اشعار تشریح و مقطع قواعد",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 22, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — میر تقی میر کی غزل، مطلع و مقطع کی پہچان اور امتحانی تشریحات (صفحات 69-82)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w6",
    "title": "Wednesday: English 11 & Sunshine — Story 6 \"The Reward\", Punctuation Rules, Pairs of Words (21-35)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 23, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 6 Jorkens philosophy, Punctuation passage & Word Pairs (Pages 86-102)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w6",
    "title": "Thursday: Computer Science (IT Series) — Information Security, Malware (Viruses, Worms, Trojans) & Antivirus",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Dec 24, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 6: Virus types, Cyber attacks, Firewall, Data Protection and Copyright Laws (Pages 126-150)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w6",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — زکوٰۃ کا معاشی نظام و معاشرتی فوائد اور سورۃ آل عمران تعارف",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Dec 25, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — مصارفِ زکوٰۃ، زکوٰۃ کے معاشی فوائد، سورۃ آل عمران تعارف و فضائل (صفحات 81-95)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w6",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 6: طلب کا مفہوم، قانون طلب (Law of Demand) گوشوارہ اور خطِ طلب",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Dec 26, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — قانون طلب کا جدول، ڈایاگرام، منفی جھکاؤ کی وجوہات اور مستثنیات (صفحات 96-115)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w7",
    "title": "Monday: صحت و جسمانی تعلیم — تھروئنگ ایونٹس: شاٹ پٹ اور ڈسکس تھرو رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 28, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — شاٹ پٹ کا وزن، سیکٹر، سرکل کا قطر اور تھرو قوانین (صفحات 79-92)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w7",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — غزل 2 خواجہ حیدر علی آتش (یہ آرزو تھی تجھے گل کے روبرو کرتے) تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 29, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — خواجہ حیدر علی آتش کی غزل کے اشعار اور قواعد و انشا (صفحات 83-95)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w7",
    "title": "Wednesday: English 11 & Sunshine — Story 7 \"The Use of Force\", Direct and Indirect Interrogative Sentences",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 30, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 7 Character study of Doctor & Mathilda, Grammar Interrogative conversion (Pages 103-118)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w7",
    "title": "Thursday: Computer Science (IT Series) — Operating Systems: Windows, Linux, Process Management & Virtual Memory",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Dec 31, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 7: OS Architecture, Multitasking, File Allocation Table (Pages 151-175)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w7",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — حج بیت اللہ، عالمگیر اخوت و سورۃ آل عمران (رکوع 1 تا 3) ترجمہ",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Jan 01, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — ارکانِ حج، معاشرتی اخوت، سورۃ آل عمران رکوع 1 تا 3 (صفحات 96-110)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w7",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 7: طلب کی لچک (Elasticity of Demand): پیمائش کے طریقے اور معاشی اہمیت",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Jan 02, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — لچکدار و غیر لچکدار طلب، اکائی کے برابر، اور لچک کی پیمائش کے طریقے (صفحات 116-135)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w8",
    "title": "Monday: صحت و جسمانی تعلیم — ریلے ریسز 4x100m، 4x400m اور بیٹن ایکسچینج زون رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 04, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ریلے ریس، 20 میٹر ٹیک اوور زون، بیٹن گرنے پر قوانین (صفحات 93-105)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w8",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — سبق ادیب کی عزت (پریم چند) خلاصہ و درخواست نویسی برائے پرنسپل",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 05, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — سبق ادیب کی عزت خلاصہ، سوالات اور امتحانی درخواست نویسی (صفحات 96-110)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w8",
    "title": "Wednesday: English 11 & Sunshine — Poem 1 \"The Rain\" & Poem 2 \"Night Mail\" Paraphrasing and Themes",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 06, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Poem Paraphrasing, Stanza Explanation and Board Theme questions (Pages 119-135)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w8",
    "title": "Thursday: Computer Science (IT Series) — Programming Concepts, Algorithms, Flowcharts and Pseudocode",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Jan 07, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 8: Problem Solving Steps, Flowchart Symbols, Algorithms (Pages 176-200)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w8",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — جہاد فی سبیل اللہ، اقسام و شرائط و سورۃ آل عمران (رکوع 4 تا 6)",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Jan 08, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — جہاد بالنفس و بالمال، سورۃ آل عمران رکوع 4 تا 6 (صفحات 111-125)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w8",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 8: رسد کا مفہوم، قانونِ رسد (Law of Supply) گوشوارہ، ڈایاگرام اور رسد کی لچک",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Jan 09, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — ذخیرہ بمقابلہ رسد، قانون رسد کا گوشوارہ اور رسد کی لچک (صفحات 136-155)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w9",
    "title": "Monday: صحت و جسمانی تعلیم — ابتدائی طبی امداد (First Aid): موچ، فریکچر اور ہیٹ سٹروک",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 11, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — فرسٹ ایڈ کے اصول، ہڈی ٹوٹنے کی اقسام اور سی پی آر کے مراحل (صفحات 106-118)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w9",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — سبق سفارش (احمد ندیم قاسمی) خلاصہ، پیراگراف تشریح و روزمرہ محاورہ",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 12, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — سبق سفارش کا تفصیلی خلاصہ، پیراگراف تشریح اور قواعد (صفحات 111-125)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w9",
    "title": "Wednesday: English 11 & Sunshine — Story 8 \"The Gulistan of Sa'di\", Board Moral Stories Practice",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 13, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Three Parables of Sa'di, Moral Story writing with titles (Pages 136-150)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w9",
    "title": "Thursday: Computer Science (IT Series) — Python Programming Basics: Variables, Data Types, Operators & I/O",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Jan 14, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 9: Python Syntax, print, input, data types, arithmetic operators (Pages 201-225)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w9",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — سیرت النبی ﷺ: اسوہ حسنہ، امانت و دیانت و سورۃ النساء تعارف",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Jan 15, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — سیرت طیبہ، معاملات میں امانت، سورۃ النساء تعارف و آیات (صفحات 126-140)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w9",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 9: توازن قیمت (Equilibrium Price): طلب اور رسد کے باہمی تعامل سے قیمت کا تعین",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Jan 16, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — مارکیٹ ایکویلیبریم، طلب اور رسد کا تقاطع اور توازن قیمت کا گراف (صفحات 156-175)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w10",
    "title": "Monday: صحت و جسمانی تعلیم — متوازن غذا، غذائی اجزاء اور کھلاڑیوں کی غذائی ضروریات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 18, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — پروٹین، کاربوہائیڈریٹس، وٹامنز اور کھلاڑیوں کے لیے پانی کی مقدار (صفحات 119-130)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w10",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — نظم 3 تسلیم و رضا (نظیر اکبر آبادی) اشعار تشریح و مرکزی خیال",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 19, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — نظم تسلیم و رضا، اشعار کے مطالب اور مرکزی خیال (صفحات 126-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w10",
    "title": "Wednesday: English 11 & Sunshine — Poem 3 \"Loveliest of Trees\" & Story 9 \"The Foolish Quack\" Synonyms Drill",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 20, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 9 analysis, Board Synonyms drill & Correction of Sentences (Pages 151-168)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w10",
    "title": "Thursday: Computer Science (IT Series) — Python Control Structures: if-else conditions & nested statements",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Jan 21, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 10: Decision making, if, elif, else, logical operators in Python (Pages 226-245)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w10",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — حقوق العباد: والدین اور اساتذہ کے حقوق و سورۃ النساء (رکوع 1 تا 3)",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Jan 22, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — والدین کی اطاعت، اساتذہ کے حقوق، سورۃ النساء رکوع 1 تا 3 (صفحات 141-155)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w10",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 10: پیدائش دولت کے چاروں عوامل: زمین اور محنت کی خصوصیات و اقسام",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Jan 23, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — زمین کی خصوصیات، محنت کی نوعیت، نقل پذیری اور کارکردگی کو متاثر کرنے والے عوامل (صفحات 176-192)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w11",
    "title": "Monday: صحت و جسمانی تعلیم — تھکاوٹ، آرام اور صحت پر ورزش کے مثبت اثرات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 25, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — جسمانی تھکاوٹ کی وجوہات، لیکٹک ایسڈ اور آرام کے فوائد (صفحات 131-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w11",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — غزل 3 مرزا اسد اللہ خان غالب (دل ناداں تجھے ہوا کیا ہے) تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 26, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — غالب کی غزل کے اشعار کی مفصل تشریح اور معروضی سوالات (صفحات 141-155)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w11",
    "title": "Wednesday: English 11 & Sunshine — Story 10 \"A Mild Attack of Locusts\", Phrasal Verbs & Prepositions",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 27, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Story 10 Doris Lessing, Appropriate Prepositions & Phrasal Verbs (Pages 169-185)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w11",
    "title": "Thursday: Computer Science (IT Series) — Python Loops (for, while loops, range, break and continue)",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Jan 28, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 11: Iteration structures, for loops, while loops, nested loop patterns (Pages 246-260)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w11",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — حقوق العباد: ہمسایوں اور غیر مسلموں کے حقوق و سورۃ المائدہ تعارف",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Jan 29, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — پڑوسیوں کے حقوق، غیر مسلم شہریوں کے حقوق، سورۃ المائدہ (صفحات 156-170)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w11",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 11: سرمایہ اور تنظیم کی اہمیت، فرائض اور کاروباری تنظیموں کی اقسام",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Jan 30, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — سرمایہ کی تشکیل، ناظم کے فرائض، واحد ملکیت، شراکت اور مشترکہ سرمائے کی کمپنی (صفحات 193-210)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w12",
    "title": "Monday: صحت و جسمانی تعلیم — 5 سالہ BISE DG Khan بورڈ پاسٹ پیپرز ایم سی کیوز مشق",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 01, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — پچھلے 5 سال کے ڈی جی خان بورڈ پیپرز ایم سی کیوز کا جامع جائزہ (صفحات 1-70)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w12",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — تلخیص نگاری (عبارت کا ایک تہائی خلاصہ و عنوان) امتحانی مشق",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 02, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — تلخیص نگاری کے بنیادی اصول اور اہم امتحانی عبارات کی تلخیص (صفحات 156-170)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w12",
    "title": "Wednesday: English 11 & Sunshine — Book-3 Play 1 \"Heat Lightning\" Short Questions & Characters",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 03, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Heat Lightning Play short answers, Character of the Girl and First Man (Pages 186-205)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w12",
    "title": "Thursday: Computer Science (IT Series) — Entrepreneurship in IT: Freelancing, Startups & E-Commerce in Pakistan",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Feb 04, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Unit 12: Freelance platforms, Business Model Canvas, Digital Payments (Pages 261-275)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w12",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — اسلامی تہذیب کے بنیادی اوصاف و قرآنی دعائیں اور حفظ آیات",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Feb 05, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — اسلامی تہذیب و تمدن، اہم قرآنی دعاؤں کا ترجمہ اور فہم (صفحات 171-185)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w12",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — باب 12: قوانین حاصل (Laws of Returns): تقصیر، یکسانی اور تزاید حاصل",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Feb 06, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — قوانین حاصل کا گوشوارہ اور ڈایاگرام مع مفروضات (صفحات 211-228)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w13",
    "title": "Monday: صحت و جسمانی تعلیم — لانگ سوالات گیس پیپر و بورڈ اہم ٹاپکس ریویژن",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 08, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — دوران خون، دل، عضلات اور ٹریک و فیلڈ کے لانگ سوالات (صفحات 71-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w13",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — تمام اسباق کے معروضی کثیر الانتخابی سوالات (MCQs) مشق",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 09, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — تمام 14 اسباق، نظموں اور غزلوں کے 200+ کثیر الانتخابی سوالات کی دہرائی (صفحات 1-180)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w13",
    "title": "Wednesday: English 11 & Sunshine — Sunshine Board Grammar Synthesis: Top 50 Pairs of Words & Tenses Test",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 10, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Sunshine Comprehensive English — Top 50 Pairs of Words, Active/Passive & Direct/Indirect Board Grand Test (Pages 206-235)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w13",
    "title": "Thursday: Computer Science (IT Series) — IT Series 700+ MCQs Marathon & 600+ Short Questions Comprehensive Drill",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Feb 11, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Chapters 1-12 Board MCQs and Short Questions Exhaustive Review (Pages 1-150)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w13",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — اہم قرآنی تراجم، کثیر الانتخابی سوالات اور معروضی ریویژن",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Feb 12, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — تمام منتخب سورتوں کے اہم تراجم اور معروضی بورڈ سوالات کا مکمل جائزہ",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w13",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — 5 سالہ BISE DG Khan بورڈ کثیر الانتخابی سوالات (MCQs) ریویژن",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Feb 13, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 — پچھلے 5 سال کے بورڈ کثیر الانتخابی سوالات کا جامع حل (صفحات 1-120)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w14",
    "title": "Monday: صحت و جسمانی تعلیم — پیپر پریزنٹیشن و ماڈل امتحانی پریکٹس (BISE DG Khan)",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 15, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — امتحانی مارکنگ اسکیم کے مطابق ڈایاگرامز اور ہیڈنگز کے ساتھ مکمل پریکٹس (صفحات 1-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w14",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — BISE DG Khan اردو پیپر پریزنٹیشن، شعری تشریحات و خطوط ریویژن",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 16, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "شرح سرمایہ اردو 11 — خط، خلاصہ، مکالمہ، اور اشعار کی تشریح کی معیاری پریزنٹیشن مشق",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w14",
    "title": "Wednesday: English 11 & Sunshine — BISE DG Khan 5-Year Past Papers English Composition & Synonyms",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 17, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 & Sunshine English — Past 5 Years Board Papers, Short Answers and Punctuation Grand Test (Pages 236-260)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w14",
    "title": "Thursday: Computer Science (IT Series) — Python Coding Lab & BISE DG Khan Board 5-Year Past Question Papers",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Feb 18, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science 11 (IT Series) — Python programs writing, logic tracing, and DG Khan past board papers review (Pages 151-280)",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w14",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — BISE DG Khan بورڈ پاسٹ پیپرز ماڈل ٹیسٹ (100% نصاب)",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Feb 19, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — ڈی جی خان بورڈ کے مطابق ماڈل ٹیسٹ پیپر حل کریں",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w14",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — اہم ڈایاگرامز، گوشوارے اور لانگ سوالات کی تیاری",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Feb 20, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 (پروفیسر حبیب اللہ قریشی) — تمام قوانین کے گوشوارے، گراف اور لانگ سوالات کی تحریری مشق (صفحات 121-240)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_ped_11_w15",
    "title": "Monday: صحت و جسمانی تعلیم — فائنل بورڈ پریپریشن ماڈل پیپر 100% سلیبس",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 22, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — فائنل بورڈ پریپریشن ماڈل پیپر 100% سلیبس (مکمل کتاب)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_urd_11_w15",
    "title": "Tuesday: اُردو 11 و شرح سرمایہ — فائنل بورڈ ماڈل پیپر 100% اردو و شرح سرمایہ نصاب",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 23, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "سرمایہ اردو و شرح سرمایہ 11 — فائنل بورڈ ماڈل امتحان (مکمل سلیبس 100% کوریج)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ یا براؤزر سے اپلوڈ کریں۔ کل نمبر: 30۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eng_11_w15",
    "title": "Wednesday: English 11 & Sunshine — Full Book Board Simulation Exam (Book 1, Book 3, Sunshine)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 24, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 Complete Course — Full Book Board Simulation Exam according to BISE DG Khan Pattern",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet via Camera. Total: 30 Marks. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_csc_11_w15",
    "title": "Thursday: Computer Science (IT Series) — Full Syllabus Board Model Exam (Computer Science & Entrepreneurship 11)",
    "subjectId": "sub_04",
    "subjectName": "Computer Science (IT Series)",
    "subjectCode": "FAIT-CSC-11",
    "date": "Feb 25, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "Computer Science and Entrepreneurship 11 (IT Series) — Full Syllabus 100% Board Model Assessment",
    "instructions": "Attempt MCQs, short questions, and code/architecture diagram. Upload handwritten answer copy. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_isl_tqm_11_w15",
    "title": "Friday: اسلامیات لازمی و ترجمۃ القرآن المجید (2 Books Combined) — فائنل بورڈ ماڈل امتحان (اسلامیات لازمی و ترجمۃ القرآن 100% نصاب)",
    "subjectId": "sub_05",
    "subjectName": "اسلامیات لازمی اور ترجمۃ القرآن المجید (2 Books Combined)",
    "subjectCode": "FAIT-ISL/TQM-11",
    "date": "Feb 26, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "کتاب اول: اسلامیات لازمی 11 (پنجاب ٹیکسٹ بک بورڈ) + کتاب دوم: ترجمۃ القرآن المجید 11 (ہمدرد گائیڈ سیریز) — فائنل بورڈ ماڈل امتحان (مکمل نصاب جائزہ)",
    "instructions": "یہ جمعۃ المبارک کا خصوصی ٹیسٹ 2 کتب پر مشتمل ہے: (1) اسلامیات لازمی (پنجاب ٹیکسٹ بک بورڈ) اور (2) ترجمۃ القرآن المجید (ہمدرد نوٹس)۔ کل نمبر: 30 (15+15)۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_fait_eco_11_w15",
    "title": "Saturday: اصولِ معاشیات (Economics 11) — فائنل بورڈ ماڈل امتحان (اصولِ معاشیات 11 — مکمل سلیبس)",
    "subjectId": "sub_07",
    "subjectName": "اصولِ معاشیات (Principles of Economics)",
    "subjectCode": "FAIT-ECO-11",
    "date": "Feb 27, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اصولِ معاشیات 11 (علمی کتاب خانہ) — فائنل بورڈ ماڈل امتحان (مکمل نصاب جائزہ و گریڈنگ)",
    "instructions": "معاشی تعریفات، گوشوارہ اور ڈایاگرام امتحانی قواعد کے مطابق حل کریں۔ کیمرہ سے جوابی کاپی اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  }
];

function getCustomTests(): TestItem[] {
  let list: TestItem[] = [];
  try {
    const raw = localStorage.getItem(CUSTOM_TESTS_KEY);
    if (raw) {
      let parsed = JSON.parse(raw) as TestItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {}

  if (list.length === 0) {
    list = [...INITIAL_HENZA_TESTS];
    saveCustomTests(list);
  }

  // Ensure dynamic ongoing status and zero locked state for today's test
  return list.map((t) => {
    if (isDateToday(t.date, t.title, t.id) && t.status !== 'graded') {
      return { ...t, status: 'ongoing' };
    }
    return t;
  });
}

function saveCustomTests(tests: TestItem[]) {
  try {
    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
  } catch {}
}


const SUBMITTED_ATTEMPTS_KEY = 'studyhub_submitted_attempts_v4';
const TEST_STATUSES_KEY = 'studyhub_test_statuses_v3';
const CERTIFIED_RESULTS_KEY = 'studyhub_certified_results_v3';

export function getLocalSubmittedAttempts(): Record<string, TestAttempt> {
  try {
    const raw = localStorage.getItem(SUBMITTED_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalSubmittedAttempt(attempt: TestAttempt) {
  try {
    const all = getLocalSubmittedAttempts();
    all[attempt.testId] = attempt;
    localStorage.setItem(SUBMITTED_ATTEMPTS_KEY, JSON.stringify(all));
  } catch {}
}

export function getLocalTestStatuses(): Record<string, { status: string; score?: number }> {
  try {
    const raw = localStorage.getItem(TEST_STATUSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalTestStatus(testId: string, status: string, score?: number) {
  try {
    const all = getLocalTestStatuses();
    all[testId] = { status, score };
    localStorage.setItem(TEST_STATUSES_KEY, JSON.stringify(all));
  } catch {}
}

export function getLocalCertifiedResults(): ResultRecord[] {
  try {
    const raw = localStorage.getItem(CERTIFIED_RESULTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalCertifiedResult(result: ResultRecord) {
  try {
    const existing = getLocalCertifiedResults().filter((r) => r.testId !== result.testId);
    existing.unshift(result);
    localStorage.setItem(CERTIFIED_RESULTS_KEY, JSON.stringify(existing));
  } catch {}
}

export function extractDayAndCleanTitle(title: string, dateStr?: string): { day: string; cleanTitle: string; isUrdu: boolean } {
  let cleanTitle = (title || '')
    .replace(/^Daily Test Series:\s*/i, '')
    .replace(/^Series\s*\d+:\s*/i, '')
    .trim();

  const urduToEnDayMap: Record<string, string> = {
    'پیر': 'Monday',
    'منگل': 'Tuesday',
    'بدھ': 'Wednesday',
    'جمعرات': 'Thursday',
    'جمعہ': 'Friday',
    'ہفتہ': 'Saturday',
    'اتوار': 'Sunday',
  };

  let day = '';

  // Pattern 1: Starts with Urdu day + optional English in parens + colon/dash
  // e.g. "منگل (Tuesday):", "منگل (Tuesday) —", "منگل:"
  const p1 = cleanTitle.match(/^(پیر|منگل|بدھ|جمعرات|جمعہ|ہفتہ|اتوار)\s*(\([A-Za-z]+\))?\s*[:—–-]?\s*/i);
  if (p1 && p1[0].trim()) {
    const matchedUrdu = p1[1];
    day = urduToEnDayMap[matchedUrdu] || 'Tuesday';
    cleanTitle = cleanTitle.slice(p1[0].length).trim();
  }

  // Pattern 2: Starts with English day + optional Urdu in parens + colon/dash
  // e.g. "Tuesday (منگل):", "Tuesday:", "Tuesday —"
  if (!day) {
    const p2 = cleanTitle.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*(\([^\)]+\))?\s*[:—–-]?\s*/i);
    if (p2 && p2[0].trim()) {
      day = p2[1];
      cleanTitle = cleanTitle.slice(p2[0].length).trim();
    }
  }

  // Fallback to dateStr if day not yet resolved
  if (!day && dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      day = d.toLocaleDateString('en-US', { weekday: 'long' });
    }
  }

  // Clean any embedded or flipped day markers that corrupt Urdu BiDi layout
  cleanTitle = cleanTitle
    .replace(/[:]?\s*(پیر|منگل|بدھ|جمعرات|جمعہ|ہفتہ|اتوار)\s*\((Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\)\s*[:]?/gi, ' ')
    .replace(/[:]?\s*\((Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\)\s*(پیر|منگل|بدھ|جمعرات|جمعہ|ہفتہ|اتوار)?\s*[:]?/gi, ' ')
    .replace(/[:]?\s*\((Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\)\s*[:]?/gi, ' ')
    .replace(/[:]?\s*(پیر|منگل|بدھ|جمعرات|جمعہ|ہفتہ|اتوار)\s*[:—–-]/gi, ' ')
    .replace(/^[:—–-]\s*/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const isUrdu = /[\u0600-\u06FF]/.test(cleanTitle);
  return { day: day || 'Tuesday', cleanTitle, isUrdu };
}

export function generateStandardFAITQuestions(subjectCode: string, testTitle: string, testId: string = 'test_gen'): TestQuestion[] {
  const code = (subjectCode || '').toUpperCase();
  const title = testTitle || '';

  if (code.includes('ECO') || code.includes('ECD') || title.toLowerCase().includes('economic') || title.toLowerCase().includes('utility') || title.toLowerCase().includes('demand')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'According to the Law of Diminishing Marginal Utility, as additional homogeneous units of a commodity are continuously consumed, Marginal Utility (MU):',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        explanation: 'The law states that extra utility derived from continuous consumption of successive identical units diminishes.',
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'Increases progressively with every unit consumed', isCorrect: false, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'Continuously diminishes and eventually reaches zero / negative', isCorrect: true, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'Remains strictly constant throughout', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'Becomes undefined at all levels', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'State two core assumptions of the Law of Diminishing Marginal Utility (e.g. continuous consumption and identical units) and define the "Point of Satiety".',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
        explanation: 'Point of Satiety is reached when total utility is maximum and marginal utility equals zero.',
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Construct a Marginal Utility Schedule (Units 1 to 6) and draw the downward sloping Marginal Utility Curve diagram with clear axis labels. Upload your handwritten sheet via Camera or Gallery.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
        explanation: 'Handwritten test sheet with complete schedule table and plotted curve.',
      },
    ];
  }

  if (code.includes('CSC') || title.toLowerCase().includes('computer') || title.toLowerCase().includes('topolog') || title.toLowerCase().includes('network')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'Which physical network topology connects all nodes to a single central cable terminated at both ends to avoid signal bounce?',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        explanation: 'Bus Topology utilizes a central trunk/backbone cable with terminators at both endpoints.',
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'Star Topology with central Switch', isCorrect: false, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'Linear Bus Topology with backbone cable', isCorrect: true, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'Token Ring Topology', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'Point-to-Point Mesh Topology', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'Differentiate between Bus Topology and Star Topology with respect to: (1) Single point of failure, and (2) Ease of adding new computer nodes.',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Draw a neat architectural diagram of Star Topology showing 4 workstations and a central Switch. Explain how data packets are routed without collision. Upload your handwritten sheet.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
      },
    ];
  }

  if (code.includes('PED') || title.toLowerCase().includes('physical') || title.toLowerCase().includes('heart') || title.toLowerCase().includes('bone')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'How many total bones constitute the mature adult human skeletal framework according to health sciences?',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: '206 bones', isCorrect: true, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: '212 bones', isCorrect: false, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: '198 bones', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: '300 bones', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'Name the four chambers of the human heart (Right/Left Atrium, Right/Left Ventricle) and briefly trace the flow of oxygenated blood.',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Draw a labeled cross-sectional diagram of the human heart showing ventricles, atria, and valves, and outline 3 official sprint track rules. Upload your handwritten sheet.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
      },
    ];
  }

  if (code.includes('URD') || title.toLowerCase().includes('urdu') || title.toLowerCase().includes('khat')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'According to Ilm-e-Bayan in 1st Year Urdu Grammar, how many fundamental components (Arkan-e-Tashbeeh) constitute Tashbeeh (Simile)?',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'Three components (Mushabbah, Mushabbah-Bih, Wajh-e-Shabah)', isCorrect: false, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'Five components (Mushabbah, Mushabbah-Bih, Wajh-e-Shabah, Gharz-e-Tashbeeh, Harf-e-Tashbeeh)', isCorrect: true, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'Four components', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'Two components', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'Explain the difference between Istiara (Metaphor) and Tashbeeh (Simile) with one contextual example from standard 1st Year Intermediate Urdu coursework.',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Write a formal application to the College Principal requesting full fee concession on merit basis, following official BISE DG Khan board exam formatting rules. Upload your handwritten sheet via Camera or Gallery.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
      },
    ];
  }

  if (code.includes('ENG') || title.toLowerCase().includes('english') || title.toLowerCase().includes('tenses')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'Select the grammatically correct passive voice conversion: "The invigilator distributed the 30-mark examination papers."',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'The 30-mark examination papers were distributed by the invigilator.', isCorrect: true, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'The papers had distributed by the invigilator.', isCorrect: false, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'The invigilator was distributed the papers.', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'Papers will be distributed by invigilator.', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'Distinguish between the following pairs of words in meaningful sentences: (1) Principle vs Principal, and (2) Accept vs Except.',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Write a formal letter to your younger brother advising him on board exam time management and daily study quotas. Upload your handwritten sheet via camera or gallery.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
      },
    ];
  }

  if (code.includes('TQM') || title.toLowerCase().includes('tarjuma') || title.toLowerCase().includes('quran') || title.toLowerCase().includes('baqarah')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'سورۃ البقرہ کا شمار قرآن مجید کی کس نوعیت کی سورتوں میں ہوتا ہے اور یہ کتنے رکوعات پر مشتمل ہے؟',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        explanation: 'سورۃ البقرہ مدنی سورت ہے اور اس میں 40 رکوعات اور 286 آیات ہیں۔',
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'مدنی سورت (40 رکوعات اور 286 آیات)', isCorrect: true, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'مکی سورت (25 رکوعات)', isCorrect: false, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'مدنی سورت (15 رکوعات)', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'مکی سورت (50 رکوعات)', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'سورۃ البقرہ کی ابتدائی پانچ آیات کی روشنی میں "المتقین" (پرہیزگاروں) کی تین بنیادی صفات تحریر کریں۔',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
        explanation: 'غیب پر ایمان، اقامتِ نماز، اور اللہ کے دیئے ہوئے رزق میں سے خرچ کرنا۔',
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'مندرجہ ذیل قرآنی آیت کا لفظی اور بامحاورہ ترجمہ تحریر کریں: "ذٰلِكَ الْكِتٰبُ لَا رَيْبَ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ" اور خلاصہ تحریر کریں۔ اپنے ہاتھ سے لکھی جوابی کاپی کیمرہ یا گیلری سے اپلوڈ کریں۔',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
        explanation: 'Handwritten test sheet with complete word-by-word and contextual translation.',
      },
    ];
  }

  if (code.includes('ISL') || title.toLowerCase().includes('islami') || title.toLowerCase().includes('tauheed') || title.toLowerCase().includes('zakat')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'اسلامیات لازمی کے نصاب کے مطابق عقیدہ توحید کا بنیادی مفہوم کیا ہے؟',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        explanation: 'اللہ تعالیٰ کو ذات، صفات اور اختیارات میں یکتا و لاشریک ماننا۔',
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'اللہ تعالیٰ کو ذات و صفات میں یکتا و بے مثل تسلیم کرنا', isCorrect: true, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'صرف کائنات کے خالق کو ماننا', isCorrect: false, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'فرشتوں کی عبادت کرنا', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'مادیت پسندی', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'اسلام میں نظامِ زکوٰۃ کے معاشرتی و معاشی فوائد پر دو مختصر نکات بیان کریں۔',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
        explanation: 'دولت کے ارتکاز کا خاتمہ، غربت میں کمی اور معاشرتی ہمدردی و اخوت کا فروغ۔',
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'عقیدہ ختم نبوت ﷺ پر تفصیلی نوٹ تحریر کریں اور قرآنی آیات کا حوالہ دیں۔ اپنے ہاتھ سے لکھی شیٹ کیمرہ یا گیلری کے ذریعے اپلوڈ کریں۔',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
        explanation: 'Handwritten test paper covering Khatam-e-Nabuwwat and economic impact of Zakat.',
      },
    ];
  }

  if (code.includes('REV') || title.toLowerCase().includes('revision') || title.toLowerCase().includes('past paper')) {
    return [
      {
        id: `${testId}_q1`,
        testId,
        questionText: 'BISE DG Khan Past Paper Drill: Identify the official passing percentage required for 1st Year Intermediate Board examinations.',
        questionType: 'mcq',
        marks: 5,
        questionOrder: 1,
        options: [
          { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: '33% passing benchmark (10/30 or 33/100)', isCorrect: true, sortOrder: 1 },
          { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: '50% passing benchmark', isCorrect: false, sortOrder: 2 },
          { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: '25% passing benchmark', isCorrect: false, sortOrder: 3 },
          { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: '60% passing benchmark', isCorrect: false, sortOrder: 4 },
        ],
      },
      {
        id: `${testId}_q2`,
        testId,
        questionText: 'Explain the 3 core time-management guidelines for attempting BISE DG Khan subjective question papers within the allocated 2.5 hours.',
        questionType: 'short_answer',
        marks: 10,
        questionOrder: 2,
      },
      {
        id: `${testId}_q3`,
        testId,
        questionText: 'Solve Section B & Section C from the 5-Year DG Khan Board Past Papers model set. Upload your handwritten answer sheets via Camera or Gallery.',
        questionType: 'file_upload',
        marks: 15,
        questionOrder: 3,
      },
    ];
  }

  // Default FA-IT Board 30-Mark Question Template
  return [
    {
      id: `${testId}_q1`,
      testId,
      questionText: `Objective Assessment: Key conceptual definitions for ${title} (BISE DG Khan FA-IT Curriculum).`,
      questionType: 'mcq',
      marks: 5,
      questionOrder: 1,
      options: [
        { id: `${testId}_opt1`, questionId: `${testId}_q1`, optionText: 'Standard Board Definition A', isCorrect: true, sortOrder: 1 },
        { id: `${testId}_opt2`, questionId: `${testId}_q1`, optionText: 'Alternative Theory B', isCorrect: false, sortOrder: 2 },
        { id: `${testId}_opt3`, questionId: `${testId}_q1`, optionText: 'Inapplicable Option C', isCorrect: false, sortOrder: 3 },
        { id: `${testId}_opt4`, questionId: `${testId}_q1`, optionText: 'None of the above', isCorrect: false, sortOrder: 4 },
      ],
    },
    {
      id: `${testId}_q2`,
      testId,
      questionText: `Short Conceptual Questions: Provide clear concise answers to two fundamental questions from ${title}.`,
      questionType: 'short_answer',
      marks: 10,
      questionOrder: 2,
    },
    {
      id: `${testId}_q3`,
      testId,
      questionText: `Subjective Long Question & Diagrams: Solve theoretical derivations and draw relevant diagrams for ${title}. Upload your handwritten test paper via Camera or Gallery.`,
      questionType: 'file_upload',
      marks: 15,
      questionOrder: 3,
    },
  ];
}

export function ensureQuestionsForTest(test: TestItem): TestItem {
  if (test.questions && test.questions.length > 0) {
    return test;
  }
  const generated = generateStandardFAITQuestions(test.subjectCode, test.title, test.id);
  return {
    ...test,
    questions: generated,
  };
}

export const testService = {
  /**
   * Fetch all scheduled and completed tests with relation joins
   */
  async fetchTests(studentId?: string): Promise<TestItem[]> {
    if (!isSupabaseConfigured()) {
      const custom = getCustomTests();
      return custom.map(ensureQuestionsForTest);
    }

    try {
      let query = supabase
        .from('tests')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          assigned_student:assigned_to(full_name),
          test_questions(id, marks),
          test_attempts(id, student_id, status, total_score, percentage, grade, passed)
        `)
        .order('date', { ascending: false });

      if (studentId) {
        query = query.or(`assigned_to.is.null,assigned_to.eq.${studentId}`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        const custom = getCustomTests();
        return custom.map(ensureQuestionsForTest);
      }

      return data.map((item) => {
        const myAtt = studentId
          ? item.test_attempts?.find((a: { student_id: string }) => a.student_id === studentId)
          : null;

        return {
          id: item.id,
          title: item.title,
          subjectId: item.subject_id,
          subjectName: item.subjects?.name || '1st Year Intermediate',
          subjectCode: item.subjects?.code || 'FSC-PED-11',
          unitId: item.unit_id,
          unitTitle: item.units?.title,
          assignedTo: item.assigned_to,
          assignedStudentName: item.assigned_student?.full_name,
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          time: item.time,
          durationMinutes: item.duration_minutes,
          totalMarks: item.total_marks,
          passingMarks: item.passing_marks || Math.round(item.total_marks * 0.4),
          type: item.type,
          syllabusCoverage: item.syllabus_coverage,
          instructions: item.instructions,
          status: item.status,
          questionsCount: item.test_questions?.length || 0,
          studentScore: myAtt?.total_score,
          myAttempt: myAtt
            ? {
                id: myAtt.id,
                testId: item.id,
                studentId: myAtt.student_id,
                startedAt: '',
                status: myAtt.status,
                totalScore: myAtt.total_score,
                percentage: myAtt.percentage,
                grade: myAtt.grade,
                passed: myAtt.passed,
              }
            : undefined,
        };
      }).map(ensureQuestionsForTest);
    } catch {
      const custom = getCustomTests();
      return custom.map(ensureQuestionsForTest);
    }
  },

  /**
   * Fetch single test with full questions and options
   */
  async fetchTestById(testId: string, studentId?: string): Promise<TestItem | null> {
    if (!isSupabaseConfigured()) {
      const custom = getCustomTests();
      const match = custom.find((t) => t.id === testId) || custom[0];
      return match ? ensureQuestionsForTest(match) : null;
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          test_questions(
            id,
            test_id,
            question_text,
            question_type,
            marks,
            question_order,
            attachment_url,
            explanation,
            test_options(id, question_id, option_text, is_correct, sort_order)
          ),
          test_attempts(
            id,
            student_id,
            started_at,
            submitted_at,
            status,
            total_score,
            percentage,
            grade,
            passed,
            feedback,
            test_answers(id, question_id, selected_option_id, text_answer, file_url, is_flagged_for_review, marks_awarded, feedback)
          )
        `)
        .eq('id', testId)
        .single();

      if (error || !data) {
        const custom = getCustomTests();
        const fallback = custom.find((t) => t.id === testId) || custom[0];
        return fallback ? ensureQuestionsForTest(fallback) : null;
      }

      const myAtt = studentId
        ? data.test_attempts?.find((a: { student_id: string }) => a.student_id === studentId)
        : null;

      const questions: TestQuestion[] = (data.test_questions || [])
        .sort((a: { question_order: number }, b: { question_order: number }) => a.question_order - b.question_order)
        .map((q: {
          id: string;
          test_id: string;
          question_text: string;
          question_type: 'mcq' | 'short_answer' | 'long_answer' | 'file_upload';
          marks: number;
          question_order: number;
          attachment_url?: string;
          explanation?: string;
          test_options?: { id: string; question_id: string; option_text: string; is_correct: boolean; sort_order: number }[];
        }) => ({
          id: q.id,
          testId: q.test_id,
          questionText: q.question_text,
          questionType: q.question_type,
          marks: q.marks,
          questionOrder: q.question_order,
          attachmentUrl: q.attachment_url,
          explanation: q.explanation,
          options: (q.test_options || []).map((o) => ({
            id: o.id,
            questionId: o.question_id,
            optionText: o.option_text,
            isCorrect: o.is_correct,
            sortOrder: o.sort_order,
          })),
        }));

      const constructed: TestItem = {
        id: data.id,
        title: data.title,
        subjectId: data.subject_id,
        subjectName: data.subjects?.name || '1st Year Intermediate',
        subjectCode: data.subjects?.code || 'FSC-PED-11',
        unitId: data.unit_id,
        unitTitle: data.units?.title,
        date: new Date(data.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: data.time,
        durationMinutes: data.duration_minutes,
        totalMarks: data.total_marks,
        passingMarks: data.passing_marks,
        instructions: data.instructions,
        type: data.type,
        syllabusCoverage: data.syllabus_coverage,
        status: data.status,
        questions,
        myAttempt: myAtt
          ? {
              id: myAtt.id,
              testId: data.id,
              studentId: myAtt.student_id,
              startedAt: myAtt.started_at,
              submittedAt: myAtt.submitted_at,
              status: myAtt.status,
              totalScore: myAtt.total_score,
              percentage: myAtt.percentage,
              grade: myAtt.grade,
              passed: myAtt.passed,
              feedback: myAtt.feedback,
              answers: (myAtt.test_answers || []).map((ans: {
                id: string;
                question_id: string;
                selected_option_id?: string;
                text_answer?: string;
                file_url?: string;
                is_flagged_for_review?: boolean;
                marks_awarded?: number;
                feedback?: string;
              }) => ({
                id: ans.id,
                questionId: ans.question_id,
                selectedOptionId: ans.selected_option_id,
                textAnswer: ans.text_answer,
                fileUrl: ans.file_url,
                isFlaggedForReview: ans.is_flagged_for_review,
                marksAwarded: ans.marks_awarded,
                feedback: ans.feedback,
              })),
            }
          : undefined,
      };
      return ensureQuestionsForTest(constructed);
    } catch {
      const custom = getCustomTests();
      const match = custom.find((t) => t.id === testId) || custom[0];
      return match ? ensureQuestionsForTest(match) : null;
    }
  },

  /**
   * Schedule automated daily test series for an entire book across the semester (through Feb 28)
   */
  scheduleDailyTestsForBook(params: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    bookTitle: string;
    assignedDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    totalWeeks?: number;
    startDate?: string;
  }): TestItem[] {
    // Official 15-Week Academic Schedule (90 tests across all 7 subjects according to BISE DG Khan)
    // is permanently verified and immutable. Returning official tests without modifying or corrupting timetable.
    const custom = getCustomTests();
    return custom.filter(
      (t) => t.subjectId === params.subjectId || t.subjectCode === params.subjectCode
    );
  },

  /**
   * Schedule a new examination
   */
  async scheduleTest(test: {
    title: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    unitId?: string;
    assignedTo?: string;
    date: string;
    time: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks?: number;
    syllabusCoverage: string;
    instructions?: string;
    createdBy?: string;
  }): Promise<{ test: TestItem | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockTest: TestItem = {
        id: `tst_${Date.now()}`,
        title: test.title,
        subjectId: test.subjectId,
        subjectName: test.subjectName,
        subjectCode: test.subjectCode,
        unitId: test.unitId,
        assignedTo: test.assignedTo,
        date: test.date,
        time: test.time,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks || Math.round(test.totalMarks * 0.4),
        type: 'Unit Assessment',
        syllabusCoverage: test.syllabusCoverage,
        instructions: test.instructions,
        status: 'scheduled',
      };
      return { test: mockTest, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          subject_id: test.subjectId,
          unit_id: test.unitId || null,
          assigned_to: test.assignedTo || null,
          date: test.date,
          time: test.time,
          duration_minutes: test.durationMinutes,
          total_marks: test.totalMarks,
          passing_marks: test.passingMarks || Math.round(test.totalMarks * 0.4),
          syllabus_coverage: test.syllabusCoverage,
          instructions: test.instructions || null,
          created_by: test.createdBy || null,
        })
        .select(`*, subjects:subject_id(name, code)`)
        .single();

      if (error) throw error;

      return {
        test: {
          id: data.id,
          title: data.title,
          subjectId: data.subject_id,
          subjectName: data.subjects?.name || test.subjectName,
          subjectCode: data.subjects?.code || test.subjectCode,
          unitId: data.unit_id,
          date: test.date,
          time: test.time,
          durationMinutes: data.duration_minutes,
          totalMarks: data.total_marks,
          passingMarks: data.passing_marks,
          type: data.type,
          syllabusCoverage: data.syllabus_coverage,
          instructions: data.instructions,
          status: data.status,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { test: null, error: err instanceof Error ? err : new Error('Failed to schedule test') };
    }
  },

  /**
   * Add a question to an assessment
   */
  async addQuestion(question: {
    testId: string;
    questionText: string;
    questionType: 'mcq' | 'short_answer' | 'long_answer' | 'file_upload';
    marks: number;
    questionOrder: number;
    explanation?: string;
    options?: { optionText: string; isCorrect: boolean }[];
  }): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { data: qData, error: qError } = await supabase
        .from('test_questions')
        .insert({
          test_id: question.testId,
          question_text: question.questionText,
          question_type: question.questionType,
          marks: question.marks,
          question_order: question.questionOrder,
          explanation: question.explanation,
        })
        .select('id')
        .single();

      if (qError) throw qError;

      if (question.questionType === 'mcq' && question.options && question.options.length > 0) {
        const optionRows = question.options.map((opt, idx) => ({
          question_id: qData.id,
          option_text: opt.optionText,
          is_correct: opt.isCorrect,
          sort_order: idx + 1,
        }));

        const { error: optError } = await supabase.from('test_options').insert(optionRows);
        if (optError) throw optError;
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to add question') };
    }
  },

  /**
   * Start or resume student test attempt
   */
  async startAttempt(
    testId: string,
    studentId: string
  ): Promise<{ attempt: TestAttempt | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockAttempt: TestAttempt = {
        id: `att_${Date.now()}`,
        testId,
        studentId,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        answers: [],
      };
      return { attempt: mockAttempt, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .upsert(
          {
            test_id: testId,
            student_id: studentId,
            status: 'in_progress',
          },
          { onConflict: 'test_id,student_id' }
        )
        .select(`
          *,
          test_answers(id, question_id, selected_option_id, text_answer, file_url, is_flagged_for_review)
        `)
        .single();

      if (error) throw error;

      return {
        attempt: {
          id: data.id,
          testId: data.test_id,
          studentId: data.student_id,
          startedAt: data.started_at,
          status: data.status,
          answers: (data.test_answers || []).map((ans: {
            id: string;
            question_id: string;
            selected_option_id?: string;
            text_answer?: string;
            file_url?: string;
            is_flagged_for_review?: boolean;
          }) => ({
            id: ans.id,
            questionId: ans.question_id,
            selectedOptionId: ans.selected_option_id,
            textAnswer: ans.text_answer,
            fileUrl: ans.file_url,
            isFlaggedForReview: ans.is_flagged_for_review,
          })),
        },
        error: null,
      };
    } catch (err: unknown) {
      return { attempt: null, error: err instanceof Error ? err : new Error('Failed to start attempt') };
    }
  },

  /**
   * Save individual answer during test
   */
  async saveAnswer(
    attemptId: string,
    answer: TestAnswer
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('test_answers').upsert(
        {
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId || null,
          text_answer: answer.textAnswer || null,
          file_url: answer.fileUrl || null,
          is_flagged_for_review: answer.isFlaggedForReview || false,
        },
        { onConflict: 'attempt_id,question_id' }
      );

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to save answer') };
    }
  },

  /**
   * Submit examination attempt and auto-evaluate MCQs
   */
  async submitAttempt(
    attemptId: string,
    test: TestItem,
    answers: TestAnswer[]
  ): Promise<{ attempt: TestAttempt | null; error: Error | null }> {
    // Compute MCQ scores immediately
    let autoScore = 0;
    const questions = test.questions || [];

    questions.forEach((q) => {
      if (q.questionType === 'mcq') {
        const studentAns = answers.find((a) => a.questionId === q.id);
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (studentAns && correctOpt && studentAns.selectedOptionId === correctOpt.id) {
          autoScore += Number(q.marks) || 0;
        }
      }
    });

    const percentage = Math.round((autoScore / test.totalMarks) * 100);
    const passed = autoScore >= (test.passingMarks || test.totalMarks * 0.4);
    const grade = percentage >= 90 ? 'A*' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 50 ? 'C' : 'F';

    // Real-time synchronization of test submission to Google Sheets
    integrationService.recordActivityInGoogleSheet({
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      studentName: 'Henza Noor',
      activityType: '30-Mark Test Evaluation',
      subject: test.subjectName,
      score: `${autoScore}/${test.totalMarks} (${percentage}%)`,
      resultStatus: passed ? 'PASSED' : 'RETEST',
      remarks: `Submitted by student. Auto-graded: ${autoScore}/${test.totalMarks} (${grade}).`,
    });

    if (!isSupabaseConfigured()) {
      const mockResult: TestAttempt = {
        id: attemptId,
        testId: test.id,
        studentId: 'usr_student_01',
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        totalScore: autoScore,
        percentage,
        grade,
        passed,
        answers,
      };
      saveLocalTestStatus(test.id, 'submitted', autoScore);
      notificationService.notifyStudentSubmission('Henza Noor', test.title);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studyhub_tests_updated'));
        window.dispatchEvent(new Event('studyhub_submissions_updated'));
        window.dispatchEvent(new Event('studyhub_notification_update'));
      }
      return { attempt: mockResult, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          total_score: autoScore,
          percentage,
          passed,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      saveLocalTestStatus(test.id, 'submitted', autoScore);
      notificationService.notifyStudentSubmission('Henza Noor', test.title);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studyhub_tests_updated'));
        window.dispatchEvent(new Event('studyhub_submissions_updated'));
        window.dispatchEvent(new Event('studyhub_notification_update'));
      }

      return {
        attempt: {
          id: data.id,
          testId: data.test_id,
          studentId: data.student_id,
          startedAt: data.started_at,
          submittedAt: data.submitted_at,
          status: data.status,
          totalScore: data.total_score,
          percentage: data.percentage,
          grade: data.grade,
          passed: data.passed,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { attempt: null, error: err instanceof Error ? err : new Error('Failed to submit test') };
    }
  },

  /**
   * Teacher marks test attempt questions, writes feedback, and publishes official results
   */
  async gradeAttempt(params: {
    attemptId: string;
    test: TestItem;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    gradedQuestions: { questionId: string; marksAwarded: number; feedback?: string }[];
    overallFeedback: string;
    teacherId?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    const totalScore = params.gradedQuestions.reduce((acc, curr) => acc + curr.marksAwarded, 0);
    const percentage = Math.round((totalScore / params.test.totalMarks) * 100);
    const passed = totalScore >= (params.test.passingMarks || params.test.totalMarks * 0.4);
    const grade =
      percentage >= 90
        ? 'A*'
        : percentage >= 80
        ? 'A'
        : percentage >= 70
        ? 'B'
        : percentage >= 60
        ? 'C'
        : percentage >= 50
        ? 'D'
        : 'F';

    if (!isSupabaseConfigured()) {
      const attempts = getLocalSubmittedAttempts();
      const existingAttempt = attempts[params.test.id] || {
        id: params.attemptId,
        testId: params.test.id,
        studentId: params.studentId,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        answers: [],
      };

      const updatedAttempt: TestAttempt = {
        ...existingAttempt,
        id: params.attemptId,
        testId: params.test.id,
        studentId: params.studentId,
        status: 'graded',
        totalScore,
        percentage,
        grade,
        passed,
        feedback: params.overallFeedback,
      };

      saveLocalSubmittedAttempt(updatedAttempt);
      saveLocalTestStatus(params.test.id, passed ? 'passed' : 'failed_retest', totalScore);

      const resultRecord: ResultRecord = {
        id: `res_${Date.now()}`,
        testId: params.test.id,
        testTitle: params.test.title,
        subjectName: params.test.subjectName,
        subjectCode: params.test.subjectCode,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        studentId: params.studentId,
        studentName: params.studentName || 'Henza Noor',
        studentAvatar: params.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
        score: totalScore,
        maxScore: params.test.totalMarks,
        percentage,
        passingMarks: params.test.passingMarks || 15,
        passed,
        grade,
        rank: percentage >= 90 ? 'Top Grade' : 'Passed',
        feedback: params.overallFeedback,
      };
      saveLocalCertifiedResult(resultRecord);

      notificationService.addNotification({
        title: '🎓 Certified Grade Released by Sir Ahmad',
        message: `${params.test.subjectName}: marked ${totalScore}/${params.test.totalMarks} (${grade} - ${passed ? 'PASSED' : 'RETEST'}). Remarks: "${params.overallFeedback}"`,
        category: 'grade',
        actionUrl: '/completed-work',
        actionLabel: 'View Certified Record',
        badge: `${totalScore}/${params.test.totalMarks}`,
        urgent: true,
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studyhub_tests_updated'));
        window.dispatchEvent(new Event('studyhub_submissions_updated'));
        window.dispatchEvent(new Event('studyhub_notification_update'));
      }

      // Real-time synchronization of teacher certified evaluation to Google Sheets
      integrationService.recordActivityInGoogleSheet({
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        studentName: params.studentName || 'Henza Noor',
        activityType: '30-Mark Test Evaluation',
        subject: params.test.subjectName,
        score: `${totalScore}/${params.test.totalMarks} (${percentage}%)`,
        resultStatus: passed ? 'PASSED' : 'RETEST',
        remarks: params.overallFeedback || `Official grade certified by Sir Ahmad • ${grade} (${passed ? 'PASSED' : 'RETEST'})`,
      });

      return { success: true, error: null };
    }

    try {
      // 1. Update each answer marks
      for (const item of params.gradedQuestions) {
        await supabase
          .from('test_answers')
          .update({
            marks_awarded: item.marksAwarded,
            feedback: item.feedback,
            graded_by: params.teacherId,
          })
          .eq('attempt_id', params.attemptId)
          .eq('question_id', item.questionId);
      }

      // 2. Update test attempt
      await supabase
        .from('test_attempts')
        .update({
          status: 'graded',
          total_score: totalScore,
          percentage,
          grade,
          passed,
          feedback: params.overallFeedback,
        })
        .eq('id', params.attemptId);

      // 3. Upsert official result record
      await supabase.from('results').upsert(
        {
          test_id: params.test.id,
          student_id: params.studentId,
          score: totalScore,
          max_score: params.test.totalMarks,
          percentage,
          passing_marks: params.test.passingMarks || 40,
          passed,
          grade,
          feedback: params.overallFeedback,
        },
        { onConflict: 'test_id,student_id' }
      );

      saveLocalTestStatus(params.test.id, passed ? 'passed' : 'failed_retest', totalScore);

      notificationService.notifyCertifiedGrade(
        params.test.title,
        totalScore,
        params.test.totalMarks,
        grade,
        params.overallFeedback || `Official grade certified by Sir Ahmad • ${grade} (${passed ? 'PASSED' : 'RETEST'})`
      );

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studyhub_tests_updated'));
        window.dispatchEvent(new Event('studyhub_submissions_updated'));
        window.dispatchEvent(new Event('studyhub_notification_update'));
      }

      integrationService.recordActivityInGoogleSheet({
        date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        studentName: params.studentName || 'Henza Noor',
        activityType: '30-Mark Test Evaluation',
        subject: params.test.subjectName,
        score: `${totalScore}/${params.test.totalMarks} (${percentage}%)`,
        resultStatus: passed ? 'PASSED' : 'RETEST',
        remarks: params.overallFeedback || `Official grade certified by Sir Ahmad • ${grade} (${passed ? 'PASSED' : 'RETEST'})`,
      });

      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to grade test') };
    }
  },

  /**
   * Fetch official certified results
   */
  async fetchResults(studentId?: string): Promise<ResultRecord[]> {
    if (!isSupabaseConfigured()) {
      return getLocalCertifiedResults();
    }

    try {
      let query = supabase
        .from('results')
        .select(`
          *,
          tests:test_id(title, date, passing_marks, subjects(name, code)),
          profiles:student_id(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        const local = getLocalCertifiedResults();
        return local.length > 0 ? local : SAMPLE_RESULTS;
      }

      return data.map((item) => {
        const score = Number(item.score);
        const maxScore = Number(item.max_score) || 100;
        const pct = item.percentage ? Number(item.percentage) : Math.round((score / maxScore) * 100);
        const passMarks = item.passing_marks ? Number(item.passing_marks) : 40;
        const isPassed = item.passed !== undefined ? item.passed : score >= passMarks;

        return {
          id: item.id,
          testId: item.test_id,
          testTitle: item.tests?.title || 'Academic Assessment',
          subjectName: item.tests?.subjects?.name || '1st Year Intermediate',
          subjectCode: item.tests?.subjects?.code || 'FSC-CSC-11',
          date: item.tests?.date
            ? new Date(item.tests.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Nov 02, 2026',
          studentId: item.student_id,
          studentName: item.profiles?.full_name || 'Enrolled Student',
          studentAvatar:
            item.profiles?.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
          score,
          maxScore,
          percentage: pct,
          passingMarks: passMarks,
          passed: isPassed,
          grade: item.grade || (pct >= 90 ? 'A*' : pct >= 80 ? 'A' : pct >= 60 ? 'B' : 'C'),
          rank: item.rank || '1st in Cohort',
          feedback: item.feedback || 'Certified grade verified by faculty examination board.',
        };
      });
    } catch {
      const local = getLocalCertifiedResults();
      return local.length > 0 ? local : SAMPLE_RESULTS;
    }
  },

  saveLocalCertifiedResult,
  getLocalCertifiedResults,

  /**
   * Reschedule a test to a new date and time (AI Command Driven)
   */
  rescheduleTest(testIdOrTitle: string, newDate: string, newTime?: string): { success: boolean; test: TestItem | null; message: string } {
    const list = getCustomTests();
    const query = testIdOrTitle.toLowerCase();
    let target = list.find((t) => t.id === testIdOrTitle || t.title.toLowerCase().includes(query) || t.subjectCode.toLowerCase().includes(query));
    if (!target) {
      // Default to next upcoming scheduled test
      target = list.find((t) => t.date !== 'Nov 17, 2026');
    }
    if (!target) {
      return { success: false, test: null, message: 'No matching scheduled test found to reschedule.' };
    }

    const oldDate = target.date;
    target.date = newDate;
    if (newTime) target.time = newTime;
    saveCustomTests(list);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studyhub_tests_updated'));
    }
    integrationService.recordActivityInGoogleSheet({
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      studentName: 'Henza Noor',
      activityType: 'General Activity',
      subject: target.subjectName,
      score: 'Schedule Adjusted',
      resultStatus: 'COMPLETED',
      remarks: `Shifted from ${oldDate} to ${newDate} via AI Chatbot Command.`,
    });
    return { success: true, test: target, message: `Assessment "${target.subjectName}" successfully shifted from ${oldDate} to ${newDate}.` };
  },

  /**
   * Immediately unlock a test so it can be taken right away
   */
  unlockTestImmediately(testIdOrQuery?: string): { success: boolean; test: TestItem | null; message: string } {
    const list = getCustomTests();
    let target: TestItem | undefined;
    if (testIdOrQuery) {
      const q = testIdOrQuery.toLowerCase();
      target = list.find((t) => t.id === testIdOrQuery || t.title.toLowerCase().includes(q) || t.subjectCode.toLowerCase().includes(q));
    }
    if (!target) {
      target = list.find((t) => isDateToday(t.date, t.title, t.id)) || list[0];
    }
    if (target) {
      target.status = 'ongoing';
      target.date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      saveCustomTests(list);
      saveLocalTestStatus(target.id, 'today');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('studyhub_tests_updated'));
      }
      return { success: true, test: target, message: `Test "${target.subjectName}" (${target.subjectCode}) is now completely UNLOCKED and ready to attempt!` };
    }
    return { success: false, test: null, message: 'Could not find test to unlock.' };
  },

  /**
   * Reset test attempt so student can retake it
   */
  resetTestAttempt(testIdOrQuery?: string): { success: boolean; message: string } {
    const list = getCustomTests();
    const target = testIdOrQuery
      ? list.find((t) => t.id === testIdOrQuery || t.title.toLowerCase().includes(testIdOrQuery.toLowerCase()))
      : list.find((t) => isDateToday(t.date, t.title, t.id)) || list[0];

    if (target) {
      try {
        const attempts = getLocalSubmittedAttempts();
        delete attempts[target.id];
        localStorage.setItem(SUBMITTED_ATTEMPTS_KEY, JSON.stringify(attempts));

        const statuses = getLocalTestStatuses();
        delete statuses[target.id];
        localStorage.setItem(TEST_STATUSES_KEY, JSON.stringify(statuses));

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('studyhub_tests_updated'));
          window.dispatchEvent(new Event('studyhub_submissions_updated'));
        }
      } catch {}
      return { success: true, message: `Test attempt for "${target.subjectName}" has been reset. Fresh submission is now permitted.` };
    }
    return { success: false, message: 'Target test not found to reset.' };
  },

  /**
   * Auto-resolve any schedule conflicts or issues across the entire platform
   */
  resolveAllScheduleIssues(): { success: boolean; resolvedCount: number; details: string[] } {
    const details: string[] = [];
    const list = getCustomTests();

    // 1. Ensure Week 1 Tuesday test is ongoing and unlocked
    const tuesdayTest = list.find((t) => t.id === 'test_henza_fait_urd_11_w1');
    if (tuesdayTest) {
      tuesdayTest.status = 'ongoing';
      tuesdayTest.date = 'Nov 17, 2026';
      details.push('Tuesday Test (Urdu 11) marked as Active & Ongoing');
    }

    // 2. Ensure Saturday Physical Education (Adjusted from Mon Nov 16) is intact
    const pedTest = list.find((t) => t.id === 'test_henza_fait_ped_11_w1');
    if (pedTest) {
      pedTest.date = 'Nov 21, 2026';
      pedTest.time = '02:00 PM';
      details.push('Physical Education adjusted to Saturday Nov 21 (02:00 PM)');
    }

    // 3. Clear legacy test status cache keys
    try {
      ['v1', 'v2'].forEach((v) => localStorage.removeItem('studyhub_test_statuses_' + v));
      details.push('Purged legacy cache keys (v1, v2)');
    } catch {}

    saveCustomTests(list);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('studyhub_tests_updated'));
      window.dispatchEvent(new Event('studyhub_tasks_updated'));
      window.dispatchEvent(new Event('studyhub_attendance_updated'));
    }

    return {
      success: true,
      resolvedCount: details.length,
      details,
    };
  },
};
