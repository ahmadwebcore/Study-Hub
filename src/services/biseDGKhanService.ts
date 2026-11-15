import { BISEDGKhanUpdate, PairingSchemeItem } from '../types';

export interface BISEDGKhanBoardInfo {
  boardName: string;
  shortName: string;
  officialWebsite: string;
  jurisdiction: string[];
  currentClass: string;
  courseGroup: string;
  annualExamsPeriod: string;
  targetSyllabusCompletion: string;
  helplinePhone: string;
}

export const BISE_DG_KHAN_INFO: BISEDGKhanBoardInfo = {
  boardName: 'Board of Intermediate and Secondary Education, Dera Ghazi Khan',
  shortName: 'BISE D.G. Khan',
  officialWebsite: 'https://www.bisedgkhan.edu.pk',
  jurisdiction: ['Dera Ghazi Khan', 'Muzaffargarh', 'Layyah', 'Rajanpur', 'Kot Addu', 'Taunsa'],
  currentClass: '1st Year (11th Class / Intermediate Part 1)',
  courseGroup: 'FA-IT (Faculty of Arts in Information Technology)',
  annualExamsPeriod: 'May 2027 (Annual Examination 2027)',
  targetSyllabusCompletion: 'February 28, 2027 (Strict Academic Deadline)',
  helplinePhone: '+92 64 9260410',
};

const BISE_DG_KHAN_UPDATES: BISEDGKhanUpdate[] = [
  {
    id: 'upd_dgk_01',
    title: 'BISE DG Khan: 11th Class Annual Examination 2027 Schedule Released',
    category: 'Date Sheet',
    date: 'Nov 14, 2026',
    isNew: true,
    urgent: true,
    summary: 'The Controller of Examinations, BISE Dera Ghazi Khan has notified that Intermediate Part-I (11th Class) Annual Exams will commence in May 2027. All educational institutions must conclude full syllabus coverage by February 28th.',
    targetClass: '1st Year FA-IT / Inter Part 1',
    pdfUrl: 'https://www.bisedgkhan.edu.pk/datesheet_11th_2027.pdf',
  },
  {
    id: 'upd_dgk_02',
    title: 'Official 1st Year FA-IT Pairing Scheme 2026-2027 Notified',
    category: 'Pairing Scheme',
    date: 'Nov 12, 2026',
    isNew: true,
    urgent: false,
    summary: 'Official chapter-wise pairing schemes for FA-IT (Computer Science 75-Marks, Urdu Lazmi 100-Marks, English 100-Marks, Islamiyat 50, Tarjuma-tul-Quran 50, Economics 100, Physical Education 75) released for DG Khan division candidates.',
    targetClass: '1st Year FA-IT',
    pdfUrl: 'https://www.bisedgkhan.edu.pk/pairing_fa_it_2027.pdf',
  },
  {
    id: 'upd_dgk_03',
    title: 'Tarjuma-tul-Quran Majeed Compulsory 50-Marks Paper Pattern',
    category: 'Syllabus Circular',
    date: 'Nov 08, 2026',
    isNew: false,
    urgent: true,
    summary: 'Notification regarding mandatory 50-marks Tarjuma-tul-Quran paper for Class 11. Surat Al-Baqarah (Rukoo 1 to 5), Surat Aal-e-Imran, Surat Al-Anfal, and Surat At-Tawbah are included in the syllabus.',
    targetClass: '11th Class (All Groups)',
  },
  {
    id: 'upd_dgk_04',
    title: 'Computer Science (FA-IT) Model Paper & Practical Mark Distribution',
    category: 'Model Paper',
    date: 'Nov 05, 2026',
    isNew: false,
    urgent: false,
    summary: 'BISE DG Khan specimen model paper for 1st Year Computer Science: 15 Objective MCQs, 36 Short Questions (Section B), and 24 Marks Subjective Long Questions (Section C). 25 Marks practical assessment.',
    targetClass: '1st Year FA-IT / ICS',
  },
  {
    id: 'upd_dgk_05',
    title: 'Online Examination Admission & Candidate Bio-Data Verification',
    category: 'Roll Number',
    date: 'Oct 28, 2026',
    isNew: false,
    urgent: false,
    summary: 'Candidates enrolled under BISE DG Khan for Intermediate Part-1 FA-IT must review their subject codes and spelling before the issuance of computerized roll number slips.',
    targetClass: '11th Class Regular & Private',
  },
];

const PAIRING_SCHEMES: PairingSchemeItem[] = [
  {
    subjectId: 'sub_04',
    subjectName: 'Computer Science (کمپیوٹر سائنس - FA IT)',
    totalMarks: 75,
    mcqsBreakdown: [
      { chapter: 'Chapter 1: Basics of Information Technology', mcqsCount: 2 },
      { chapter: 'Chapter 2: Information Networks & Topologies', mcqsCount: 2 },
      { chapter: 'Chapter 3: Data Communications', mcqsCount: 2 },
      { chapter: 'Chapter 4: Applications & IT Uses', mcqsCount: 1 },
      { chapter: 'Chapter 5: Computer Architecture & ALU Cycle', mcqsCount: 2 },
      { chapter: 'Chapter 6: Security, Copyright & Viruses', mcqsCount: 2 },
      { chapter: 'Chapter 7: Windows Operating System', mcqsCount: 1 },
      { chapter: 'Chapter 8: Word Processing (MS Word)', mcqsCount: 1 },
      { chapter: 'Chapter 9: Spreadsheets (MS Excel)', mcqsCount: 1 },
      { chapter: 'Chapter 10: Internet & Email Fundamentals', mcqsCount: 1 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Section B)', attempt: 6, total: 9, chapters: 'Chapters 1, 2, and 3 (3 questions from each chapter)' },
      { questionNum: 'Q.3 (Section B)', attempt: 6, total: 9, chapters: 'Chapters 4 (2 Qs), Chapter 5 (4 Qs), Chapter 6 (3 Qs)' },
      { questionNum: 'Q.4 (Section B)', attempt: 6, total: 9, chapters: 'Chapters 7 (2 Qs), Chapter 8 (2 Qs), Chapter 9 (3 Qs), Chapter 10 (2 Qs)' },
    ],
    longQuestions: [
      { questionNum: 'Q.5', attempt: 3, total: 5, chapters: 'Chapter 1: Network Components / LAN vs WAN (8 Marks)' },
      { questionNum: 'Q.6', attempt: 3, total: 5, chapters: 'Chapter 2: Bus, Star, Ring, Mesh Topologies (8 Marks)' },
      { questionNum: 'Q.7', attempt: 3, total: 5, chapters: 'Chapter 3: Data Transmission Modes / Guided Media (8 Marks)' },
      { questionNum: 'Q.8', attempt: 3, total: 5, chapters: 'Chapter 5: CPU Registers, System Buses, Fetch Cycle (8 Marks)' },
      { questionNum: 'Q.9', attempt: 3, total: 5, chapters: 'Chapter 6: Computer Viruses & Data Security Measures (8 Marks)' },
    ],
    notes: 'BISE DG Khan official pairing pattern: 15 Marks MCQs + 36 Marks Short Questions + 24 Marks Long Questions = 75 Marks Theory. Practical = 25 Marks. Passing marks = 33%.',
  },
  {
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar (اردو لازمی و قواعد)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'حصہ نثر (درسی اسباق)', mcqsCount: 5 },
      { chapter: 'ادبی اصطلاحات (تشبیہ، استعارہ، تلمیح)', mcqsCount: 5 },
      { chapter: 'شعری اصطلاحات (مطلع، مقطع، قافیہ، ردیف)', mcqsCount: 5 },
      { chapter: 'قواعد و تذکیر و تانیث', mcqsCount: 5 },
    ],
    shortQuestions: [
      { questionNum: 'سوال ۲ (اشعار کی تشریح)', attempt: 1, total: 1, chapters: 'الف: حصہ نظم (۲ اشعار، ۸ نمبر + ۱ نمبر نظم + ۱ نمبر شاعر کا نام = ۱۰ نمبر) / ب: حصہ غزل (۳ اشعار، ۹ نمبر + ۱ نمبر شاعر کا نام = ۱۰ نمبر)' },
      { questionNum: 'سوال ۳ (سیاق و سباق)', attempt: 1, total: 2, chapters: 'نثری اقتباس کی تشریح مع سیاق و سباق (۱۵ نمبر: ۳ سیاق و سباق، ۲ مصنف و سبق، ۱۰ تشریح)' },
      { questionNum: 'سوال ۴ (سبق کا خلاصہ)', attempt: 1, total: 2, chapters: 'دو میں سے کسی ایک درسی سبق کا ایک تہائی خلاصہ (۹ نمبر خلاصہ + ۱ نمبر مصنف = ۱۰ نمبر)' },
      { questionNum: 'سوال ۵ (نظم کا خلاصہ)', attempt: 1, total: 1, chapters: 'کسی ایک درسی نظم کا مرکزی خیال یا خلاصہ (۵ نمبر)' },
    ],
    longQuestions: [
      { questionNum: 'سوال ۶ (مکالمہ نگاری یا روداد)', attempt: 1, total: 2, chapters: 'دو اہم کرداروں کے مابین مکالمہ یا کسی تقریب کی روداد (۱۰ نمبر)' },
      { questionNum: 'سوال ۷ (درخواست نویسی)', attempt: 1, total: 1, chapters: 'پرنسپل یا افسر کے نام امتحانی اصولوں کے مطابق درخواست (۱۰ نمبر)' },
      { questionNum: 'سوال ۸ (تلخیص نگاری)', attempt: 1, total: 1, chapters: 'دیے گئے نثری پیراگراف کی ایک تہائی تلخیص مع مناسب عنوان (۸ نمبر تلخیص + ۲ نمبر عنوان = ۱۰ نمبر)' },
    ],
    notes: 'پنجاب و ڈی جی خان بورڈ کے تحت کل ۱۰۰ نمبرات ہیں۔ خلاصے اور خطوط کے امتحانی طریقہ کار کی مکمل پابندی لازمی ہے۔',
  },
  {
    subjectId: 'sub_03',
    subjectName: 'English & Grammar (انگریزی لازمی)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'Book 1: Short Stories (Synonyms)', mcqsCount: 5 },
      { chapter: 'Book 3: Plays & Poems (Synonyms)', mcqsCount: 5 },
      { chapter: 'Correct Form of Verbs (Tenses Drill)', mcqsCount: 5 },
      { chapter: 'Prepositions & Correct Usage', mcqsCount: 5 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Book 1 Short Stories)', attempt: 6, total: 9, chapters: 'Short questions from Button Button, Clearing in the Sky, Dark They Were, etc. (12 Marks)' },
      { questionNum: 'Q.3 (Book 3 One-Act Plays)', attempt: 5, total: 8, chapters: 'Heat Lightning, A Visit to a Small Planet, The Oyster and the Pearl (10 Marks)' },
      { questionNum: 'Q.4 (Book 3 Poems)', attempt: 4, total: 6, chapters: 'The Rain, Night Mail, Loveliest of Trees, O Where are you Going (8 Marks)' },
    ],
    longQuestions: [
      { questionNum: 'Q.5 (Letter or Application)', attempt: 1, total: 2, chapters: 'Official Board Letter to friend/father OR Formal Application to Principal (10 Marks)' },
      { questionNum: 'Q.6 (Moral Story)', attempt: 1, total: 2, chapters: 'Thirsty Crow, Hasty Judgement, Union is Strength, Honesty is the Best Policy (10 Marks)' },
      { questionNum: 'Q.7 (Stanza Explanation & Punctuation)', attempt: 1, total: 1, chapters: 'Part A: Reference to Context (5 Marks), Part B: Punctuation from Book 1 (5 Marks), Part C: 5 Pairs of Words (5 Marks)' },
      { questionNum: 'Q.8 (Urdu Translation)', attempt: 1, total: 1, chapters: 'Translation of unseen/Book 1 paragraph into Urdu (15 Marks)' },
    ],
    notes: 'BISE DG Khan English Part 1 paper pattern: 20 Objective + 80 Subjective = 100 Marks. Passing marks: 33/100.',
  },
  {
    subjectId: 'sub_05',
    subjectName: 'Islamiyat & Tarjuma-tul-Quran (اسلامیات و ترجمۃ القرآن)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'اسلامیات لازمی: عقائد، عبادات، اسوہ حسنہ', mcqsCount: 10 },
      { chapter: 'ترجمۃ القرآن مجید: آیات، الفاظ کے معانی، سورتیں', mcqsCount: 10 },
    ],
    shortQuestions: [
      { questionNum: 'سوال ۲ (اسلامیات لازمی)', attempt: 6, total: 9, chapters: 'عقیدہ توحید، رسالت، ملائکہ، نماز، روزہ، زکوٰۃ، حج (۱۲ نمبر)' },
      { questionNum: 'سوال ۳ (اسلامیات لازمی)', attempt: 6, total: 9, chapters: 'اسوہ حسنہؐ، حقوق العباد، تبلیغ و اخوت (۱۲ نمبر)' },
      { questionNum: 'سوال ۴ (ترجمۃ القرآن مجید)', attempt: 6, total: 9, chapters: 'سورۃ البقرہ، سورۃ آل عمران، الانعام، الانفال کے مضامین اور سورتوں کا تعارف (۱۲ نمبر)' },
      { questionNum: 'سوال ۵ (قرآنی الفاظ کے معانی)', attempt: 6, total: 8, chapters: 'منتخب سورتوں کے قرآنی الفاظ و تراکیب کے بامحاورہ معانی (۱۲ نمبر)' },
    ],
    longQuestions: [
      { questionNum: 'سوال ۶ (قرآنی آیات کا ترجمہ)', attempt: 2, total: 3, chapters: 'سورۃ البقرہ و الانفال کی قرآنی آیات کا سلیس با محاورہ اردو ترجمہ (۱۶ نمبر)' },
      { questionNum: 'سوال ۷ (اسلامیات تفصیلی نوٹ)', attempt: 1, total: 2, chapters: 'عقیدہ توحید کے اثرات، نماز کا معاشرتی نظام، یا اسوہ حسنہؐ پر تفصیلی نوٹ (۱۶ نمبر)' },
    ],
    notes: 'پنجاب حکومت و ڈی جی خان بورڈ کے تحت اسلامیات لازمی ۵۰ نمبر اور ترجمۃ القرآن ۵۰ نمبر (کل ۱۰۰ نمبرات) کا سرکاری امتحان ہوگا۔',
  },
  {
    subjectId: 'sub_06',
    subjectName: 'Economics (اصول معاشیات - FA IT)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'معاشیات کی تعریفات (ایڈم اسمتھ، مارشل، رابنز)', mcqsCount: 4 },
      { chapter: 'نظریہ افادہ و صارف کا توازن', mcqsCount: 4 },
      { chapter: 'قوانین طلب و رسد اور لچک', mcqsCount: 4 },
      { chapter: 'منڈی کا توازن اور عاملین پیدائش', mcqsCount: 4 },
      { chapter: 'قومی آمدنی، زر، اور بینک کاری', mcqsCount: 4 },
    ],
    shortQuestions: [
      { questionNum: 'سوال ۲ (مختصر سوالات)', attempt: 8, total: 12, chapters: 'معاشیات کی نوعیت، افادہ مختتم، خط استغنا (۱۶ نمبر)' },
      { questionNum: 'سوال ۳ (مختصر سوالات)', attempt: 8, total: 12, chapters: 'قانون طلب، لچک طلب کی پیمائش، قانون رسد (۱۶ نمبر)' },
      { questionNum: 'سوال ۴ (مختصر سوالات)', attempt: 9, total: 13, chapters: 'توازن منڈی، اجرت، لگان، سود، اور منافع کے اصول (۱۸ نمبر)' },
    ],
    longQuestions: [
      { questionNum: 'سوال ۵ تا ۹ (تفصیلی سوالات)', attempt: 3, total: 5, chapters: '۱. قانون تقلیل افادہ مختتم / ۲. قانون طلب مع گوشوارہ و ڈایاگرام / ۳. لچک طلب کے طریقے / ۴. قومی آمدنی کی پیمائش / ۵. تجارتی بینک کے فرائض (۳۰ نمبر)' },
    ],
    notes: 'ڈی جی خان بورڈ اصول معاشیات: ۲۰ ایم سی کیوز + ۵۰ مختصر سوالات + ۳۰ انشائیہ = کل ۱۰۰ نمبرات۔ پاسنگ مارکس ۳۳ ہیں۔',
  },
  {
    subjectId: 'sub_01',
    subjectName: 'Physical Education (صحت و جسمانی تعلیم - FA IT)',
    totalMarks: 75,
    mcqsBreakdown: [
      { chapter: 'صحت و جسمانی تعلیم کے اصول و تعریفات', mcqsCount: 3 },
      { chapter: 'انسانی ڈھانچہ اور جوڑوں کی اقسام', mcqsCount: 3 },
      { chapter: 'نظام دوران خون اور دل کی ساخت', mcqsCount: 3 },
      { chapter: 'نظام تنفس اور گیسوں کا تبادلہ', mcqsCount: 3 },
      { chapter: 'ایتھلیٹکس اور ٹریک اینڈ فیلڈ قوانین', mcqsCount: 3 },
    ],
    shortQuestions: [
      { questionNum: 'سوال ۲ (مختصر سوالات)', attempt: 6, total: 9, chapters: 'جسمانی تعلیم کی اہمیت، مقاصد، متوازن غذا، اور ابتدائی طبی امداد (۱۲ نمبر)' },
      { questionNum: 'سوال ۳ (مختصر سوالات)', attempt: 6, total: 9, chapters: 'انسانی اناٹومی، دل کی گردش، پلمونری سرکولیشن، اور ہڈیوں کی اقسام (۱۲ نمبر)' },
      { questionNum: 'سوال ۴ (مختصر سوالات)', attempt: 6, total: 9, chapters: '۴۰۰ میٹر ٹریک کی پیمائش، بیٹن کا تبادلہ، اور والی بال کے قوانین (۱۲ نمبر)' },
    ],
    longQuestions: [
      { questionNum: 'سوال ۵ تا ۷ (تفصیلی سوالات)', attempt: 2, total: 3, chapters: '۱. انسانی دل کی ساخت مع صاف ڈایاگرام / ۲. ۴۰۰ میٹر اسٹینڈرڈ ٹریک کے اصول / ۳. کھیلوں کی چوٹیں اور فرسٹ ایڈ (۲۴ نمبر)' },
    ],
    notes: 'ڈی جی خان بورڈ صحت و جسمانی تعلیم: ۱۵ ایم سی کیوز + ۳۶ مختصر سوالات + ۲۴ انشائیہ = ۷۵ نمبرات تھیوری + ۲۵ نمبر پریکٹیکل۔',
  },
];

class BISEDGKhanService {
  public getBoardInfo(): BISEDGKhanBoardInfo {
    return BISE_DG_KHAN_INFO;
  }

  public getUpdates(): BISEDGKhanUpdate[] {
    return [...BISE_DG_KHAN_UPDATES];
  }

  public getPairingSchemes(): PairingSchemeItem[] {
    return [...PAIRING_SCHEMES];
  }

  public getPairingSchemeBySubject(subjectId: string): PairingSchemeItem | undefined {
    return PAIRING_SCHEMES.find((p) => p.subjectId === subjectId);
  }

  public getDaysUntilFebruaryTarget(): number {
    const targetDate = new Date('2027-02-28T23:59:59');
    const today = new Date();
    const diff = targetDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  public getDaysUntilAnnualExams(): number {
    const examDate = new Date('2027-05-10T09:00:00');
    const today = new Date();
    const diff = examDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

export const biseDGKhanService = new BISEDGKhanService();
