import { notificationService } from './notificationService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TestItem, ResultRecord, TestQuestion, TestAttempt, TestAnswer } from '../types';
import { SAMPLE_TESTS, SAMPLE_RESULTS } from '../data/sampleData';

const CUSTOM_TESTS_KEY = 'studyhub_custom_tests_v7';

try {
  ['v1', 'v2', 'v3', 'v4', 'v5'].forEach(v => localStorage.removeItem('studyhub_custom_tests_' + v));
} catch {}

const INITIAL_HENZA_TESTS: TestItem[] = [
  {
    "id": "test_henza_ped_1",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Nov 17, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز (صفحات 1-12)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_1",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ)",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Nov 18, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ) (صفحات 1-15)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_1",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Nov 19, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 1 \"Button, Button\", Active/Passive Voice & Sunshine Pairs of Words (1-10) (Pages 1-18)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_1",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ (رکوع 1 تا 3) — متقین، کافرین اور منافقین کا تعارف و ترجمہ",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Nov 20, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ البقرہ (رکوع 1 تا 3) — متقین، کافرین اور منافقین کا تعارف و ترجمہ (صفحات 1-10)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_1",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب اول: عقیدہ توحید، عقیدہ رسالت اور انسانی زندگی پر عقائد کے اثرات",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Nov 21, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب اول: عقیدہ توحید، عقیدہ رسالت اور انسانی زندگی پر عقائد کے اثرات (صفحات 1-9)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_1",
    "title": "پیر (Monday): ہفتہ وار جائزہ 1: BISE DG Khan 5 سالہ ماضی ماڈل پیپرز کمپلیشن مشق",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Nov 23, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 1: BISE DG Khan 5 سالہ ماضی ماڈل پیپرز کمپلیشن مشق",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_2",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Nov 24, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — انسانی عضلاتی نظام، اقسام، پٹھوں کی ساخت اور حرکات (صفحات 13-24)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_2",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ، مکالمہ اور استعارہ",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Nov 25, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ، مکالمہ اور استعارہ (صفحات 16-30)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_2",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 2 \"Clearing in the Sky\", Direct/Indirect Speech & Pairs of Words (11-20)",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Nov 26, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 2 \"Clearing in the Sky\", Direct/Indirect Speech & Pairs of Words (11-20) (Pages 19-35)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_2",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ (رکوع 4 تا 6) — قصہ حضرت آدمؑ، ابلیس اور خلافتِ ارضی ترجمہ",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Nov 27, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ البقرہ (رکوع 4 تا 6) — قصہ حضرت آدمؑ، ابلیس اور خلافتِ ارضی ترجمہ (صفحات 11-20)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_2",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب اول: عقیدہ آخرت، ملائکہ اور آسمانی کتب پر ایمان کے تقاضے",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Nov 28, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب اول: عقیدہ آخرت، ملائکہ اور آسمانی کتب پر ایمان کے تقاضے (صفحات 10-18)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_2",
    "title": "پیر (Monday): ہفتہ وار جائزہ 2: صحت و جسمانی تعلیم اور اُردو 11 ماڈل معروضی سوالات",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Nov 30, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 2: صحت و جسمانی تعلیم اور اُردو 11 ماڈل معروضی سوالات",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_3",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — نظام دورانِ خون، دل کی ساخت، افعال اور بلڈ پریشر رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 1, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام دورانِ خون، دل کی ساخت، افعال اور بلڈ پریشر رولز (صفحات 25-36)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_3",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق سرسید کے اخلاق و خصائل خلاصہ، درخواست نویسی اور کنایہ",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 2, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق سرسید کے اخلاق و خصائل خلاصہ، درخواست نویسی اور کنایہ (صفحات 31-45)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_3",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 3 \"Dark they were, and Golden-eyed\", Master Tenses & Letter Writing",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 3, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 3 \"Dark they were, and Golden-eyed\", Master Tenses & Letter Writing (Pages 36-52)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_3",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ (رکوع 7 تا 9) — بنی اسرائیل کے واقعات اور انعاماتِ الٰہیہ",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Dec 4, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ البقرہ (رکوع 7 تا 9) — بنی اسرائیل کے واقعات اور انعاماتِ الٰہیہ (صفحات 21-30)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_3",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب دوم: نماز اور روزہ کے انفرادی، روحانی اور معاشرتی فوائد",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Dec 5, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب دوم: نماز اور روزہ کے انفرادی، روحانی اور معاشرتی فوائد (صفحات 19-27)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_3",
    "title": "پیر (Monday): ہفتہ وار جائزہ 3: انگریزی سن شائن اور ترجمۃ القرآن ہفتہ وار سپیڈ ٹیسٹ",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Dec 7, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 3: انگریزی سن شائن اور ترجمۃ القرآن ہفتہ وار سپیڈ ٹیسٹ",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_4",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — نظام تنفس، پھیپھڑوں کی ساخت اور آکسیجن گیسوں کا تبادلہ",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 8, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نظام تنفس، پھیپھڑوں کی ساخت اور آکسیجن گیسوں کا تبادلہ (صفحات 37-48)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_4",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق ادیب کی عزت خلاصہ، روزنامچہ / کہانی اور مجازِ مرسل",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 9, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق ادیب کی عزت خلاصہ، روزنامچہ / کہانی اور مجازِ مرسل (صفحات 46-60)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_4",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 4 \"Thank You, M'am\", Board Punctuation Rules & Fee Concession Application",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 10, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 4 \"Thank You, M'am\", Board Punctuation Rules & Fee Concession Application (Pages 53-70)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_4",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ (رکوع 10 تا 12) — تحویلِ قبلہ، صبر، نماز اور شعائر اللہ کے احکام",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Dec 11, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ البقرہ (رکوع 10 تا 12) — تحویلِ قبلہ، صبر، نماز اور شعائر اللہ کے احکام (صفحات 31-40)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_4",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب دوم: زکوٰۃ کا نظام، معاشرتی عدل اور حج کی فرضیت و اہمیت",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Dec 12, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب دوم: زکوٰۃ کا نظام، معاشرتی عدل اور حج کی فرضیت و اہمیت (صفحات 28-36)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_4",
    "title": "پیر (Monday): ہفتہ وار جائزہ 4: اسلامیات لازمی اور تمام 6 مضامین کا جامع کوئز",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Dec 14, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 4: اسلامیات لازمی اور تمام 6 مضامین کا جامع کوئز",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_5",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — متوازن غذا، غذائی اجزاء اور کھلاڑیوں کی توانائی کی ضروریات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 15, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — متوازن غذا، غذائی اجزاء اور کھلاڑیوں کی توانائی کی ضروریات (صفحات 49-60)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_5",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق اوور کوٹ (غلام عباس) خلاصہ، خط بنام مدیر اور تلخیص نگاری",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 16, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق اوور کوٹ (غلام عباس) خلاصہ، خط بنام مدیر اور تلخیص نگاری (صفحات 61-75)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_5",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 5 \"The Piece of String\", Correct Form of Verbs & Friendly Letter",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 17, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 5 \"The Piece of String\", Correct Form of Verbs & Friendly Letter (Pages 71-88)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_5",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ (رکوع 13 تا 15) — احکام صوم (روزہ)، حج اور انفاق فی سبیل اللہ",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Dec 18, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ البقرہ (رکوع 13 تا 15) — احکام صوم (روزہ)، حج اور انفاق فی سبیل اللہ (صفحات 41-50)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_5",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب سوم: سیرت النبی ﷺ — اسوہ حسنہ اور رحمت اللعالمین کی جامعیت",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Dec 19, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب سوم: سیرت النبی ﷺ — اسوہ حسنہ اور رحمت اللعالمین کی جامعیت (صفحات 37-45)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_5",
    "title": "پیر (Monday): ہفتہ وار جائزہ 5: ماہانہ بورڈ اسسمنٹ فیز 1 — پہلے 4 اسباق کا خلاصہ",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Dec 21, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 5: ماہانہ بورڈ اسسمنٹ فیز 1 — پہلے 4 اسباق کا خلاصہ",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_6",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — ابتدائی طبی امداد (First Aid)، موچ، فریکچر اور گرمی کا اثر",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 22, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ابتدائی طبی امداد (First Aid)، موچ، فریکچر اور گرمی کا اثر (صفحات 61-72)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_6",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق سفارش (احمد ندیم قاسمی) خلاصہ، مکالمہ اور قواعد مشق",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 23, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق سفارش (احمد ندیم قاسمی) خلاصہ، مکالمہ اور قواعد مشق (صفحات 76-90)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_6",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 6 \"The Reward\", Prepositions Exercise & Application for Sick Leave",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 24, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 6 \"The Reward\", Prepositions Exercise & Application for Sick Leave (Pages 89-105)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_6",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ آلِ عمران (رکوع 1 تا 3) — محکم و متشابہ آیات اور قبولیت کی دعائیں",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Dec 25, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ آلِ عمران (رکوع 1 تا 3) — محکم و متشابہ آیات اور قبولیت کی دعائیں (صفحات 51-60)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_6",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب سوم: سیرت النبی ﷺ — اخوت، ایثار، سخاوت اور عفو و درگزر",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Dec 26, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب سوم: سیرت النبی ﷺ — اخوت، ایثار، سخاوت اور عفو و درگزر (صفحات 46-54)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_6",
    "title": "پیر (Monday): ہفتہ وار جائزہ 6: شارٹ سوالات حل کرنے کی رفتار اور پیپر پریزنٹیشن",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Dec 28, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 6: شارٹ سوالات حل کرنے کی رفتار اور پیپر پریزنٹیشن",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_7",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — والی بال کھیل: تاریخ، کورٹ کی پیمائش، نیٹ ہائٹ اور سروس رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Dec 29, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — والی بال کھیل: تاریخ، کورٹ کی پیمائش، نیٹ ہائٹ اور سروس رولز (صفحات 73-84)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_7",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق چراغ کی لو خلاصہ اور ادبی اصطلاحات (قافیہ، ردیف، مطلع)",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Dec 30, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — سبق چراغ کی لو خلاصہ اور ادبی اصطلاحات (قافیہ، ردیف، مطلع) (صفحات 91-105)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_7",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 7 \"The Use of Force\", Phrasal Verbs & Book Order Letter",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Dec 31, 2026",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 7 \"The Use of Force\", Phrasal Verbs & Book Order Letter (Pages 106-122)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_7",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ آلِ عمران (رکوع 4 تا 6) — قصہ حضرت مریمؑ، حضرت عیسیٰؑ اور معجزات",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Jan 1, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ آلِ عمران (رکوع 4 تا 6) — قصہ حضرت مریمؑ، حضرت عیسیٰؑ اور معجزات (صفحات 61-70)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_7",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب سوم: سیرت النبی ﷺ — عدل و انصاف، رواداری اور حقوق کا تحفظ",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Jan 2, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب سوم: سیرت النبی ﷺ — عدل و انصاف، رواداری اور حقوق کا تحفظ (صفحات 55-63)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_7",
    "title": "پیر (Monday): ہفتہ وار جائزہ 7: BISE DG Khan نصف نصاب (Mid-Term) ٹیسٹ سیریز",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Jan 4, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 7: BISE DG Khan نصف نصاب (Mid-Term) ٹیسٹ سیریز",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_8",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — باسکٹ بال: کورٹ سائز، گیند کا وزن، فاولز اور ٹیکنیکل رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 5, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — باسکٹ بال: کورٹ سائز، گیند کا وزن، فاولز اور ٹیکنیکل رولز (صفحات 85-96)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_8",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — نظم حمد (امیر مینائی) و نعت (حفیظ تائب) تشریح و معروضی سوالات",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 6, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — نظم حمد (امیر مینائی) و نعت (حفیظ تائب) تشریح و معروضی سوالات (صفحات 106-120)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_8",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Story 8 \"The Gulistan of Sa'di\", Moral Story Writing (\"Honesty is Best\")",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 7, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Story 8 \"The Gulistan of Sa'di\", Moral Story Writing (\"Honesty is Best\") (Pages 123-140)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_8",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ آلِ عمران (رکوع 7 تا 9) — غزوۂ بدر اور غزوۂ احد کے عبرت آموز اسباق",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Jan 8, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ آلِ عمران (رکوع 7 تا 9) — غزوۂ بدر اور غزوۂ احد کے عبرت آموز اسباق (صفحات 71-80)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_8",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب چہارم: والدین، اولاد، اساتذہ اور اعزاء و اقرباء کے حقوق",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Jan 9, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب چہارم: والدین، اولاد، اساتذہ اور اعزاء و اقرباء کے حقوق (صفحات 64-72)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_8",
    "title": "پیر (Monday): ہفتہ وار جائزہ 8: اُردو و انگریزی گرائمر اور کمپوزیشن خصوصی چیکنگ",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Jan 11, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 8: اُردو و انگریزی گرائمر اور کمپوزیشن خصوصی چیکنگ",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_9",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — بیڈمنٹن: کورٹ مارکنگ، سنگلز و ڈبلز رولز اور ریکٹ کی پیمائش",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 12, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — بیڈمنٹن: کورٹ مارکنگ، سنگلز و ڈبلز رولز اور ریکٹ کی پیمائش (صفحات 97-108)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_9",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — نظم میدانِ کربلا میں صبح کا منظر (میر انیس) تشریح و محاسن",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 13, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — نظم میدانِ کربلا میں صبح کا منظر (میر انیس) تشریح و محاسن (صفحات 121-135)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_9",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Poem 1 \"The Rain\" & Poem 2 \"Night Mail\" Paraphrasing & Stanza Analysis",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 14, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Poem 1 \"The Rain\" & Poem 2 \"Night Mail\" Paraphrasing & Stanza Analysis (Pages 141-160)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_9",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ النساء (رکوع 1 تا 3) — یتامیٰ کے حقوق، مہر اور وراثت کے بنیادی احکام",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Jan 15, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ النساء (رکوع 1 تا 3) — یتامیٰ کے حقوق، مہر اور وراثت کے بنیادی احکام (صفحات 81-90)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_9",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب چہارم: پڑوسیوں، غیر مسلموں اور ملازمین کے حقوقِ معاشرت",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Jan 16, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب چہارم: پڑوسیوں، غیر مسلموں اور ملازمین کے حقوقِ معاشرت (صفحات 73-81)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_9",
    "title": "پیر (Monday): ہفتہ وار جائزہ 9: ترجمۃ القرآن اور اسلامیات لازمی فل چیپٹر ڈرل",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Jan 18, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 9: ترجمۃ القرآن اور اسلامیات لازمی فل چیپٹر ڈرل",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_10",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — ٹیبل ٹینس: ٹیبل کی پیمائش، بال ویٹ اور سروس قوانین",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 19, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ٹیبل ٹینس: ٹیبل کی پیمائش، بال ویٹ اور سروس قوانین (صفحات 109-118)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_10",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — غزل میر تقی میر (ہستی اپنی حباب کی سی ہے) تشریح و فنی محاسن",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 20, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — غزل میر تقی میر (ہستی اپنی حباب کی سی ہے) تشریح و فنی محاسن (صفحات 136-150)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_10",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Poem 3 \"Loveliest of Trees\" & Play 1 \"Heat Lightning\" Short Q/A Drill",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 21, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Poem 3 \"Loveliest of Trees\" & Play 1 \"Heat Lightning\" Short Q/A Drill (Pages 161-180)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_10",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ النساء (رکوع 4 تا 6) — عائلی زندگی، حقوق الزوجین اور صلح رحمی",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Jan 22, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ النساء (رکوع 4 تا 6) — عائلی زندگی، حقوق الزوجین اور صلح رحمی (صفحات 91-100)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_10",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب پنجم: علم کی اہمیت، فرضیت اور جدید سائنسی علوم کی اسلامی ترغیب",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Jan 23, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب پنجم: علم کی اہمیت، فرضیت اور جدید سائنسی علوم کی اسلامی ترغیب (صفحات 82-89)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_10",
    "title": "پیر (Monday): ہفتہ وار جائزہ 10: فزیکل ایجوکیشن گرائونڈ رولز و ڈایاگرامز ٹیسٹ",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Jan 25, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 10: فزیکل ایجوکیشن گرائونڈ رولز و ڈایاگرامز ٹیسٹ",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_11",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — ایتھلیٹکس تھروئنگ ایونٹس: شاٹ پٹ اور ڈسکس تھرو سیکٹر رولز",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Jan 26, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ایتھلیٹکس تھروئنگ ایونٹس: شاٹ پٹ اور ڈسکس تھرو سیکٹر رولز (صفحات 119-126)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_11",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — غزل حیدر علی آتش (یہ آرزو تھی تجھے گل کے روبرو کرتے) تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Jan 27, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — غزل حیدر علی آتش (یہ آرزو تھی تجھے گل کے روبرو کرتے) تشریح (صفحات 151-165)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_11",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Play 2 \"A Visit to a Small Planet\" Summary, Character Sketch & Dialogue",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Jan 28, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Play 2 \"A Visit to a Small Planet\" Summary, Character Sketch & Dialogue (Pages 181-200)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_11",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ المائدہ (رکوع 1 تا 3) — حلال و حرام جانور اور عقود کی پابندی کے احکام",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Jan 29, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ المائدہ (رکوع 1 تا 3) — حلال و حرام جانور اور عقود کی پابندی کے احکام (صفحات 101-110)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_11",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — باب پنجم: کسبِ حلال، دیانتداری اور محنت کی عظمت اسلامی تناظر میں",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Jan 30, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — باب پنجم: کسبِ حلال، دیانتداری اور محنت کی عظمت اسلامی تناظر میں (صفحات 90-97)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_11",
    "title": "پیر (Monday): ہفتہ وار جائزہ 11: 5 سالہ ماضی معروضی سوالات (MCQs Bank Drill)",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Feb 1, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 11: 5 سالہ ماضی معروضی سوالات (MCQs Bank Drill)",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_12",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — ایتھلیٹکس جمپنگ ایونٹس: لانگ جمپ اور ہائی جمپ کے امتحانی قوانین",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 2, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — ایتھلیٹکس جمپنگ ایونٹس: لانگ جمپ اور ہائی جمپ کے امتحانی قوانین (صفحات 127-134)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_12",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — غزل مرزا اسد اللہ خان غالب (دل ناداں تجھے ہوا کیا ہے) تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 3, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — غزل مرزا اسد اللہ خان غالب (دل ناداں تجھے ہوا کیا ہے) تشریح (صفحات 166-180)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_12",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Play 3 \"The Oyster and the Pearl\" Critical Analysis & Punctuation Practice",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 4, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Play 3 \"The Oyster and the Pearl\" Critical Analysis & Punctuation Practice (Pages 201-220)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_12",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ الانعام (رکوع 1 تا 3) — دلائلِ توحید، ردِ شرک اور مشرکین کے اعتراضات",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Feb 5, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ الانعام (رکوع 1 تا 3) — دلائلِ توحید، ردِ شرک اور مشرکین کے اعتراضات (صفحات 111-118)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_12",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — منتخب احادیث نبویہ (حدیث 1 تا 5): عربی متن، ترجمہ، تشریح و اسباق",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Feb 6, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — منتخب احادیث نبویہ (حدیث 1 تا 5): عربی متن، ترجمہ، تشریح و اسباق (صفحات 98-102)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_12",
    "title": "پیر (Monday): ہفتہ وار جائزہ 12: فیز 2 ماڈل پیپرز — ٹائم مینجمنٹ و اینالیٹکس",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Feb 8, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 12: فیز 2 ماڈل پیپرز — ٹائم مینجمنٹ و اینالیٹکس",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_13",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — جسمانی صحت و تندرستی کے اجزاء، طاقت، لچک اور رفتار کی پیمائش",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 9, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — جسمانی صحت و تندرستی کے اجزاء، طاقت، لچک اور رفتار کی پیمائش (صفحات 135-138)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_13",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — غزل علامہ محمد اقبال (نہ آتے ہمیں اس میں تکرار کیا تھی) تشریح",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 10, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — غزل علامہ محمد اقبال (نہ آتے ہمیں اس میں تکرار کیا تھی) تشریح (صفحات 181-195)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_13",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Urdu to English Translation Mastery: 20 Essential Board Passages Drill",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 11, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Urdu to English Translation Mastery: 20 Essential Board Passages Drill (Pages 221-240)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_13",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ الاعراف (رکوع 1 تا 3) — انبیاء کرام کے قصص، قوم عاد و ثمود اور قیامت",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Feb 12, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — سورۃ الاعراف (رکوع 1 تا 3) — انبیاء کرام کے قصص، قوم عاد و ثمود اور قیامت (صفحات 119-124)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_13",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — منتخب احادیث نبویہ (حدیث 6 تا 10): عربی متن، ترجمہ، تشریح و اسباق",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Feb 13, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — منتخب احادیث نبویہ (حدیث 6 تا 10): عربی متن، ترجمہ، تشریح و اسباق (صفحات 103-106)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_13",
    "title": "پیر (Monday): ہفتہ وار جائزہ 13: تمام 6 مضامین کا پری بورڈ فل ماک ایگزام 1",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Feb 15, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 13: تمام 6 مضامین کا پری بورڈ فل ماک ایگزام 1",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_14",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — نشہ آور ادویات، ڈوپنگ کے نقصانات اور ایتھلیٹکس اخلاقیات",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 16, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — نشہ آور ادویات، ڈوپنگ کے نقصانات اور ایتھلیٹکس اخلاقیات (صفحات 139-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_14",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — جامع قواعد: تذکیر و تانیث، جملوں کی درستی اور روزمرہ و محاورہ",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 17, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — جامع قواعد: تذکیر و تانیث، جملوں کی درستی اور روزمرہ و محاورہ (صفحات 196-210)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_14",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Complete Composition Drill: Letter, Application, Moral Story & Grammar MCQs",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 18, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Complete Composition Drill: Letter, Application, Moral Story & Grammar MCQs (Pages 241-255)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_14",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — منتخب قرآنی آیات کا ذخیرہ الفاظ اور با محاورہ ترجمہ جامع دہرائی",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Feb 19, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — منتخب قرآنی آیات کا ذخیرہ الفاظ اور با محاورہ ترجمہ جامع دہرائی (صفحات 125-130)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_14",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — اسلامی تہذیب کے امتیازی اوصاف، ثقافتی اقدار اور عالمی اثرات",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Feb 20, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — اسلامی تہذیب کے امتیازی اوصاف، ثقافتی اقدار اور عالمی اثرات (صفحات 107-110)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_rev_14",
    "title": "پیر (Monday): ہفتہ وار جائزہ 14: فائنل پری بورڈ فل ماک ایگزام 2 (28 فروری ٹارگٹ کمپلیشن)",
    "subjectId": "sub_01",
    "subjectName": "ہفتہ وار جائزہ (Board Review Drill)",
    "subjectCode": "FAIT-REV-11",
    "date": "Feb 22, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "BISE DG Khan FA-IT تمام 6 مضامین کے بورڈ ماڈل پیپرز — ہفتہ وار جائزہ 14: فائنل پری بورڈ فل ماک ایگزام 2 (28 فروری ٹارگٹ کمپلیشن)",
    "instructions": "Attempt 30-mark past papers synthesis. Passing benchmark: 15/30. Evaluated by Ahmad.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_ped_15",
    "title": "منگل (Tuesday): صحت و جسمانی تعلیم — فائنل بورڈ جائزہ: ہیلتھ اینڈ فزیکل ایجوکیشن مکمل ماڈل پیپر مشق",
    "subjectId": "sub_01",
    "subjectName": "صحت و جسمانی تعلیم (Physical Education)",
    "subjectCode": "FAIT-PED-11",
    "date": "Feb 23, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ہیلتھ اینڈ فزیکل ایجوکیشن 11 (گیلانی) — فائنل بورڈ جائزہ: ہیلتھ اینڈ فزیکل ایجوکیشن مکمل ماڈل پیپر مشق (صفحات 1-140)",
    "instructions": "10 کثیر الانتخابی سوالات اور 5 مختصر سوالات حل کریں۔ جوابی کاپی کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_urd_15",
    "title": "بدھ (Wednesday): اُردو 11 و شرح سرمایہ — فائنل بورڈ جائزہ: شرح سرمایہ اردو مکمل انشائی و معروضی پیپرز مشق",
    "subjectId": "sub_02",
    "subjectName": "اُردو 11 لازمی (Urdu & Grammar)",
    "subjectCode": "FAIT-URD-11",
    "date": "Feb 24, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اُردو 11 درسی کتاب و شرح سرمایہ اردو (پروفیسر راؤ خالد محمود) — فائنل بورڈ جائزہ: شرح سرمایہ اردو مکمل انشائی و معروضی پیپرز مشق (صفحات 1-220)",
    "instructions": "سبق کا خلاصہ، معروضی سوالات اور انشائیہ حل کریں۔ کیمرہ یا گیلری سے اپلوڈ کریں۔ کل نمبر: 30، پاسنگ: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_eng_15",
    "title": "جمعرات (Thursday): English 11 & Sunshine — Final Board Synthesis: Full 100-Mark English Paper BISE DG Khan Pattern",
    "subjectId": "sub_03",
    "subjectName": "English & Sunshine Grammar",
    "subjectCode": "FAIT-ENG-11",
    "date": "Feb 25, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "English 11 (PCTB) & Sunshine Comprehensive English (Prof. Musarrat Hussain) — Final Board Synthesis: Full 100-Mark English Paper BISE DG Khan Pattern (Pages 1-260)",
    "instructions": "Attempt 5 MCQs, 3 short questions, and grammar composition. Upload scanned sheet. Passing: 15/30.",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_tqm_15",
    "title": "جمعہ (Friday): ترجمۃ القرآن المجید — فائنل بورڈ جائزہ: ترجمۃ القرآن المجید BISE DG Khan 5 سالہ ماڈل پیپرز",
    "subjectId": "sub_05",
    "subjectName": "ترجمۃ القرآن المجید (Quran)",
    "subjectCode": "FAIT-TQM-11",
    "date": "Feb 26, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ سیریز) — فائنل بورڈ جائزہ: ترجمۃ القرآن المجید BISE DG Khan 5 سالہ ماڈل پیپرز (صفحات 1-130)",
    "instructions": "منتخب آیات کا با محاورہ ترجمہ اور مفہوم لکھیں۔ کل نمبر: 30۔ پاسنگ مارکس: 15۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  },
  {
    "id": "test_henza_isl_15",
    "title": "ہفتہ (Saturday): اسلامیات لازمی — فائنل بورڈ جائزہ: اسلامیات لازمی 100% سلیبس ماڈل پیپر مشق",
    "subjectId": "sub_06",
    "subjectName": "اسلامیات لازمی (Islamiyat)",
    "subjectCode": "FAIT-ISL-11",
    "date": "Feb 27, 2027",
    "time": "10:00 AM",
    "durationMinutes": 45,
    "totalMarks": 30,
    "passingMarks": 15,
    "type": "Unit Assessment",
    "syllabusCoverage": "اسلامیات 11 درسی کتاب (پنجاب ٹیکسٹ بک بورڈ) — فائنل بورڈ جائزہ: اسلامیات لازمی 100% سلیبس ماڈل پیپر مشق (صفحات 1-110)",
    "instructions": "عقائد و اخلاقیات پر سوالات کے جامع جوابات تحریر کریں۔ کیمرہ سے اپلوڈ کریں۔ پاسنگ: 15/30۔",
    "status": "scheduled",
    "assignedStudentName": "Henza Noor"
  }
];

function getCustomTests(): TestItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TESTS_KEY);
    if (raw) {
      let parsed = JSON.parse(raw) as TestItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        let modified = false;
        parsed = parsed.map((t) => {
          if (t.title?.includes('Daily Test Series') || t.title?.includes('Urdu Lazmi & Sharh')) {
            modified = true;
            if (t.subjectCode?.includes('URD') || t.subjectName?.toLowerCase().includes('urdu')) {
              t.title = 'بدھ (Wednesday): اُردو 11 و شرح سرمایہ — سبق اسوہ حسنہ خلاصہ و علم بیان';
            } else if (t.subjectCode?.includes('PED')) {
              t.title = 'منگل (Tuesday): ہیلتھ اینڈ فزیکل ایجوکیشن — انسانی ڈھانچہ و 400 میٹر ٹریک رولز';
            } else if (t.subjectCode?.includes('ENG')) {
              t.title = 'جمعرات (Thursday): English 11 & Sunshine — Story 1 "Button, Button" & Master Tenses';
            } else if (t.subjectCode?.includes('TQM')) {
              t.title = 'جمعہ (Friday): ترجمۃ القرآن المجید — سورۃ البقرہ رکوع 1 تا 2 با محاورہ ترجمہ';
            } else if (t.subjectCode?.includes('ISL')) {
              t.title = 'ہفتہ (Saturday): اسلامیات لازمی — عقیدہ توحید، رسالت اور نظام زکوٰۃ';
            } else if (t.subjectCode?.includes('REV')) {
              t.title = 'پیر (Monday): ہفتہ وار بورڈ جائزہ — BISE DG Khan 5 سالہ ماضی پیپرز مشق';
            }
          }
          return t;
        });
        if (modified) {
          saveCustomTests(parsed);
        }
        return parsed;
      }
    }
  } catch {}
  return [...INITIAL_HENZA_TESTS];
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
      return [...custom, ...SAMPLE_TESTS].map(ensureQuestionsForTest);
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
        return SAMPLE_TESTS.map(ensureQuestionsForTest);
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
      return SAMPLE_TESTS.map(ensureQuestionsForTest);
    }
  },

  /**
   * Fetch single test with full questions and options
   */
  async fetchTestById(testId: string, studentId?: string): Promise<TestItem | null> {
    if (!isSupabaseConfigured()) {
      const custom = getCustomTests();
      const match = [...custom, ...SAMPLE_TESTS].find((t) => t.id === testId) || SAMPLE_TESTS[0];
      return ensureQuestionsForTest(match);
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
        const fallback = SAMPLE_TESTS.find((t) => t.id === testId) || null;
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
      const match = SAMPLE_TESTS.find((t) => t.id === testId) || SAMPLE_TESTS[0];
      return ensureQuestionsForTest(match);
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
    const existing = getCustomTests();
    const created: TestItem[] = [];
    const weeks = params.totalWeeks || 14;

    const subjectDayMap: Record<string, 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = {
      'sub_01': 'Tuesday',
      'sub_02': 'Wednesday',
      'sub_03': 'Thursday',
      'sub_05': 'Friday',
      'sub_06': 'Saturday',
      'sub_04': 'Tuesday',
    };
    const targetDay = params.assignedDay || subjectDayMap[params.subjectId] || 'Thursday';

    const dayOffsets: Record<string, number> = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
    };
    const targetDayNum = dayOffsets[targetDay] || 4;

    const baseDate = params.startDate ? new Date(params.startDate) : new Date();
    const currentDay = baseDate.getDay();
    let daysUntilTarget = (targetDayNum - currentDay + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7;

    for (let w = 0; w < Math.min(weeks, 12); w++) {
      const testDate = new Date(baseDate);
      testDate.setDate(baseDate.getDate() + daysUntilTarget + (w * 7));
      const dateStr = testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newTest: TestItem = {
        id: `test_daily_${params.subjectId}_${w + 1}_${Date.now()}`,
        title: (() => {
          const isUrduLang = params.subjectCode?.includes('URD') || params.subjectName?.toLowerCase().includes('urdu') || params.bookTitle?.includes('اُردو') || params.bookTitle?.includes('سرمایہ');
          const isIslamic = params.subjectCode?.includes('TQM') || params.subjectCode?.includes('ISL') || params.subjectName?.includes('Quran') || params.subjectName?.includes('Islam');
          const isPed = params.subjectCode?.includes('PED') || params.subjectName?.toLowerCase().includes('physical');
          const dayNamesUrdu: Record<string, string> = {
            Monday: 'پیر',
            Tuesday: 'منگل',
            Wednesday: 'بدھ',
            Thursday: 'جمعرات',
            Friday: 'جمعہ',
            Saturday: 'ہفتہ',
          };
          const urduDayName = dayNamesUrdu[targetDay] || targetDay;

          if (isUrduLang) {
            return `${urduDayName} (${targetDay}): اُردو 11 و شرح سرمایہ — سبق ${w + 1} خلاصہ و امتحانی مشق`;
          } else if (isIslamic) {
            if (params.subjectCode?.includes('TQM')) {
              return `${urduDayName} (${targetDay}): ترجمۃ القرآن المجید — رکوع ${w + 1} با محاورہ ترجمہ`;
            }
            return `${urduDayName} (${targetDay}): اسلامیات لازمی — سبق ${w + 1} خلاصہ و اہم سوالات`;
          } else if (isPed) {
            return `${urduDayName} (${targetDay}): صحت و جسمانی تعلیم — باب ${w + 1} جسمانی ساخت و قواعد`;
          }
          return `${targetDay} (${urduDayName}): ${params.subjectName} — Chapter ${w + 1} Assessment`;
        })(),
        subjectId: params.subjectId,
        subjectName: params.subjectName,
        subjectCode: params.subjectCode,
        date: dateStr,
        time: '02:00 PM',
        durationMinutes: 45,
        totalMarks: 30,
        passingMarks: 15,
        type: 'Unit Assessment',
        syllabusCoverage: `${params.bookTitle} — Chapter ${w + 1} Board Short Questions & Theory Problems`,
        instructions: 'Attempt all objective and subjective sections within 45 minutes. Total Marks: 30. Passing benchmark: 15/30 (50%).',
        status: w === 0 ? 'ongoing' : 'scheduled',
        assignedStudentName: 'Henza Noor',
      };
      created.push(newTest);
    }

    const merged = [...created, ...existing];
    saveCustomTests(merged);
    return created;
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
        grade: percentage >= 90 ? 'A*' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 50 ? 'C' : 'F',
        passed,
        answers,
      };
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
        return SAMPLE_RESULTS;
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
      return SAMPLE_RESULTS;
    }
  },

  saveLocalCertifiedResult,
  getLocalCertifiedResults,
};
