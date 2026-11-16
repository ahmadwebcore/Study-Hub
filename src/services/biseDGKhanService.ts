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
    subjectName: 'Computer Science and Entrepreneurship (IT Series — Tariq Mahmood & Imran Saeed)',
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
    subjectName: 'Urdu Lazmi & Grammar (100 Marks)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'Prose Lessons & Authors', mcqsCount: 5 },
      { chapter: 'Literary Devices (Tashbeeh, Istiara, Talmeeh)', mcqsCount: 5 },
      { chapter: 'Poetic Rules (Matla, Maqta, Radif, Qafia)', mcqsCount: 5 },
      { chapter: 'Board Grammar & Gender Agreements', mcqsCount: 5 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Stanza Explanation)', attempt: 1, total: 1, chapters: 'Part A: Nazm Stanzas (8 Marks + 2 Marks Poet/Poem Name = 10 Marks) / Part B: Ghazal Stanzas (9 Marks + 1 Mark Poet Name = 10 Marks)' },
      { questionNum: 'Q.3 (Reference & Context)', attempt: 1, total: 2, chapters: 'Prose Paragraph Explanation with Context (15 Marks: 3 Context, 2 Author/Lesson, 10 Explanation)' },
      { questionNum: 'Q.4 (Prose Summary)', attempt: 1, total: 2, chapters: 'One-third Lesson Summary of chosen lesson (9 Marks Summary + 1 Mark Author = 10 Marks)' },
      { questionNum: 'Q.5 (Poem Central Idea)', attempt: 1, total: 1, chapters: 'Central Theme or Summary of selected textbook poem (5 Marks)' },
    ],
    longQuestions: [
      { questionNum: 'Q.6 (Dialogue or Event Report)', attempt: 1, total: 2, chapters: 'Dialogue between characters OR Formal Event Report (10 Marks)' },
      { questionNum: 'Q.7 (Formal Application)', attempt: 1, total: 1, chapters: 'Formal Application to Principal or Board Official following exam structure (10 Marks)' },
      { questionNum: 'Q.8 (Précis Writing)', attempt: 1, total: 1, chapters: 'One-third Condensation of given paragraph with suitable Title (8 Marks Précis + 2 Marks Title = 10 Marks)' },
    ],
    notes: 'BISE DG Khan Urdu Lazmi Paper: 20 Objective + 80 Subjective = 100 Marks. Passing marks: 33/100.',
  },
  {
    subjectId: 'sub_03',
    subjectName: 'English Compulsory & Grammar (100 Marks)',
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
    subjectName: 'Islamiyat & Tarjuma-tul-Quran (100 Marks)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'Islamiyat Compulsory: Beliefs, Worship & Ethics', mcqsCount: 10 },
      { chapter: 'Tarjuma-tul-Quran: Surahs, Verses & Vocabulary', mcqsCount: 10 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Islamiyat Compulsory)', attempt: 6, total: 9, chapters: 'Tauheed, Prophethood, Angels, Prayer, Fasting, Zakat, Hajj (12 Marks)' },
      { questionNum: 'Q.3 (Islamiyat Compulsory)', attempt: 6, total: 9, chapters: 'Uswah-e-Hasana, Human Rights, Social Brotherhood (12 Marks)' },
      { questionNum: 'Q.4 (Tarjuma-tul-Quran)', attempt: 6, total: 9, chapters: 'Surah Al-Baqarah, Aal-e-Imran, Al-Anfal Themes and Introductions (12 Marks)' },
      { questionNum: 'Q.5 (Quranic Vocabulary)', attempt: 6, total: 8, chapters: 'Key Quranic Vocabulary & Idiomatic Meanings from selected Surahs (12 Marks)' },
    ],
    longQuestions: [
      { questionNum: 'Q.6 (Quranic Verses Translation)', attempt: 2, total: 3, chapters: 'Translation of Quranic verses from Surah Al-Baqarah and Al-Anfal (16 Marks)' },
      { questionNum: 'Q.7 (Thematic Detailed Question)', attempt: 1, total: 2, chapters: 'Tauheed impacts on human life, Prayer social benefits, or Uswah-e-Hasana (16 Marks)' },
    ],
    notes: 'BISE DG Khan Pattern: Islamiyat Compulsory (50 Marks) + Tarjuma-tul-Quran (50 Marks) = 100 Marks Total.',
  },
  {
    subjectId: 'sub_06',
    subjectName: 'Principles of Economics (100 Marks)',
    totalMarks: 100,
    mcqsBreakdown: [
      { chapter: 'Definitions of Economics (Adam Smith, Marshall, Robbins)', mcqsCount: 4 },
      { chapter: 'Utility Theory & Consumer Equilibrium', mcqsCount: 4 },
      { chapter: 'Laws of Demand, Supply & Elasticity', mcqsCount: 4 },
      { chapter: 'Market Equilibrium & Factors of Production', mcqsCount: 4 },
      { chapter: 'National Income, Money & Banking', mcqsCount: 4 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Short Questions)', attempt: 8, total: 12, chapters: 'Nature of Economics, Marginal Utility, Indifference Curves (16 Marks)' },
      { questionNum: 'Q.3 (Short Questions)', attempt: 8, total: 12, chapters: 'Law of Demand, Elasticity Measurement, Law of Supply (16 Marks)' },
      { questionNum: 'Q.4 (Short Questions)', attempt: 9, total: 13, chapters: 'Market Equilibrium, Rent, Wages, Interest, and Profit Principles (18 Marks)' },
    ],
    longQuestions: [
      { questionNum: 'Q.5 to Q.9 (Subjective Long Questions)', attempt: 3, total: 5, chapters: '1. Law of Diminishing Marginal Utility / 2. Law of Demand with Schedule & Diagram / 3. Methods of Elasticity / 4. National Income Measurement / 5. Commercial Bank Functions (30 Marks)' },
    ],
    notes: 'BISE DG Khan Economics: 20 MCQs + 50 Short Questions + 30 Subjective = 100 Marks. Passing marks: 33/100.',
  },
  {
    subjectId: 'sub_01',
    subjectName: 'Physical Education & Health (75 Theory + 25 Practical)',
    totalMarks: 75,
    mcqsBreakdown: [
      { chapter: 'Principles & Definitions of Physical Education', mcqsCount: 3 },
      { chapter: 'Human Skeleton & Joint Classifications', mcqsCount: 3 },
      { chapter: 'Circulatory System & Heart Anatomy', mcqsCount: 3 },
      { chapter: 'Respiratory System & Gas Exchange', mcqsCount: 3 },
      { chapter: 'Athletics & Track & Field Rules', mcqsCount: 3 },
    ],
    shortQuestions: [
      { questionNum: 'Q.2 (Short Questions)', attempt: 6, total: 9, chapters: 'Physical Education Objectives, Balanced Diet, and First Aid (12 Marks)' },
      { questionNum: 'Q.3 (Short Questions)', attempt: 6, total: 9, chapters: 'Human Anatomy, Heart Circulation, Pulmonary Cycle, Bone Types (12 Marks)' },
      { questionNum: 'Q.4 (Short Questions)', attempt: 6, total: 9, chapters: '400m Track Measurements, Baton Exchange, Volleyball Rules (12 Marks)' },
    ],
    longQuestions: [
      { questionNum: 'Q.5 to Q.7 (Long Questions)', attempt: 2, total: 3, chapters: '1. Human Heart Structure with clean diagram / 2. 400m Standard Track Specifications / 3. Sports Injuries and First Aid (24 Marks)' },
    ],
    notes: 'BISE DG Khan Physical Education: 15 MCQs + 36 Short Questions + 24 Long Questions = 75 Theory + 25 Practical = 100 Marks.',
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
