import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Search,
  Sparkles,
  Printer,
  Copy,
  Check,
  X,
  GraduationCap,
} from 'lucide-react';

export interface BoardNoteItem {
  id: string;
  title: string;
  urduTitle?: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  category: 'chapter_notes' | 'short_questions' | 'past_papers' | 'pairing_scheme';
  categoryLabel: string;
  author: string;
  totalPages: number;
  status: 'available' | 'upcoming';
  releaseTimeline?: string;
  editorialProgress?: number;
  summary: string;
  content: {
    heading: string;
    subheading?: string;
    urduText?: string;
    englishText?: string;
    keyPoints: string[];
    sampleQuestions: {
      question: string;
      answer: string;
      marks: number;
    }[];
  };
}

export const BOARD_NOTES_LIST: BoardNoteItem[] = [
  {
    id: 'note_urd_01',
    title: 'Urdu 11: Lesson 1 "Uswa-e-Hasna" Complete Summary & Tashreeh',
    urduTitle: 'سبق نمبر 1: اسوہ حسنہ ﷺ (سید سلیمان ندوی) — جامع خلاصہ، پیراگراف تشریح و خطوط',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'پروفیسر راؤ خالد محمود (شرح سرمایہ اردو — گورنمنٹ گریجویٹ کالج)',
    totalPages: 12,
    status: 'available',
    summary: 'سید سلیمان ندوی کے سبق اسوہ حسنہ کا ایک تہائی معیاری امتحانی خلاصہ، اہم سیاق و سباق کے پیراگراف، تشبیہ کے ارکان اور بورڈ امتحانی خط کے اصول۔',
    content: {
      heading: 'سبق: اسوہ حسنہ ﷺ — مصنف: سید سلیمان ندوی (خطباتِ مدراس)',
      subheading: 'BISE DG Khan امتحانی پیٹرن: خلاصہ (10 نمبر)، سیاق و سباق تشریح (15 نمبر)',
      urduText: `خلاصہ نویسی کا امتحانی اصول:
سید سلیمان ندوی فرماتے ہیں کہ دنیا کے تمام انسان مختلف شعبہ ہائے زندگی سے تعلق رکھتے ہیں۔ کسی ایک شخص کا طرزِ عمل سب کے لیے مکمل رہنما نہیں بن سکتا، سوائے ذاتِ محمد مصطفیٰ ﷺ کے۔ آپ ﷺ کا وجودِ مبارک ایک آفتابِ عالمتاب کی طرح ہے جس سے ہر گلشن اور ہر پودا بقدرِ صلاحیت فیض حاصل کرتا ہے۔ اگر آپ امیر ہیں تو مکہ کے امانت دار تاجر کی زندگی دیکھیں، اگر غریب ہیں تو شعبِ ابی طالب کے محصور کی سیرت میں تسلی پائیں، اگر فاتح ہیں تو بدر و حنین کے سالار اور فتحِ مکہ کے حلیم فاتح کو دیکھیں۔ غرضیکہ انسانیت کا کوئی گوشہ ایسا نہیں جس کی رہنمائی سیرتِ نبوی میں موجود نہ ہو۔`,
      keyPoints: [
        'مصنف کا تعارف: سید سلیمان ندوی، شاگردِ رشید مولانا شبلی نعمانی۔',
        'مذہب کی عمارت دو ستونوں پر قائم ہے: عقیدہ اور عمل۔ عمل کے لیے زندہ عملی نمونہ ناگزیر ہے۔',
        'آفتاب کی مثال: سیرتِ نبوی ہر طبقے کے لیے روشن چراغ ہے۔',
        'علمِ بیان (تشبیہ): بچہ چاند کی طرح خوبصورت ہے۔ مشبہ: بچہ، مشبہ بہ: چاند، حرف تشبیہ: کی طرح، وجہ شبہ: خوبصورتی۔',
      ],
      sampleQuestions: [
        {
          question: 'سید سلیمان ندوی نے انسانوں کی عملی رہنمائی کے لیے کس چیز کو ناگزیر قرار دیا ہے؟',
          answer: 'انہوں نے واضح کیا کہ انسان صرف زبانی نصیحتوں اور تحریری قوانین سے راہِ راست پر نہیں آ سکتے، بلکہ ان کی رہنمائی کے لیے ایک کامل اور زندہ عملی نمونے (اسوہ حسنہ) کی ضرورت ہے۔',
          marks: 2,
        },
        {
          question: 'تشبیہ کے پانچ ارکان کون سے ہیں؟',
          answer: '1. مشبہ (جس کو تشبیہ دی جائے) 2. مشبہ بہ (جس سے تشبیہ دی جائے) 3. وجہ شبہ (مشترک صفت) 4. غرض تشبیہ (تشبیہ دینے کا مقصد) 5. حرفِ تشبیہ (مانند، طرح، جیسا)۔',
          marks: 2,
        },
      ],
    },
  },
  {
    id: 'note_csc_01',
    title: 'Computer Science 11: Information Networks, Topologies & Architecture',
    urduTitle: 'کمپیوٹر سائنس 11: انفارمیشن نیٹ ورکس، ٹوپولوجیز (Bus, Star, Ring) اور OSI ماڈل نوٹس',
    subjectId: 'sub_04',
    subjectName: 'Computer Science & Entrepreneurship',
    subjectCode: 'FAIT-CSC-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'Tariq Mahmood & Imran Saeed (IT Series Publications, Lahore)',
    totalPages: 16,
    status: 'available',
    summary: 'Comprehensive Chapter 2 notes: LAN/MAN/WAN architectures, Bus vs Star vs Ring vs Mesh topologies with full circuit diagrams, and OSI 7-layer communication breakdown.',
    content: {
      heading: 'Chapter 2: Information Networks & Modern Topologies (IT Series)',
      subheading: 'BISE DG Khan Assessment Weightage: 18 Marks (2 MCQs + 3 Short Questions + 1 Long Question)',
      englishText: `Network Fundamentals & Topology Analysis:
A computer network is an interconnection of two or more autonomous computers designed to share data, hardware peripherals (such as high-speed laser printers), and software services.

1. Star Topology:
All nodes are linked directly to a central hub or switch via Unshielded Twisted Pair (UTP) cables.
• Advantage: Easy to expand; failure of a single cable node does not disturb the rest of the network.
• Disadvantage: Centralized dependency—if the central hub fails, the entire network shuts down.

2. Bus Topology:
All network devices share a single common transmission wire (Backbone Cable) with Terminators attached at both ends.
• Advantage: Cost-effective for small labs, minimal cabling required.
• Disadvantage: Cable break breaks the whole system; difficult packet collision troubleshooting.`,
      keyPoints: [
        'OSI 7 Layers (Bottom-to-Top): Physical -> Data Link -> Network -> Transport -> Session -> Presentation -> Application.',
        'Routers operate on Network Layer (Layer 3) using IP addressing.',
        'Switches operate on Data Link Layer (Layer 2) using MAC physical addresses.',
        'Mesh topology provides dedicated point-to-point links between all nodes, offering the highest reliability.',
      ],
      sampleQuestions: [
        {
          question: 'Differentiate between Star Topology and Ring Topology.',
          answer: 'In Star Topology, all devices connect to a central hub/switch; one cable fault only isolates that device. In Ring Topology, data travels in a unidirectional loop through each node; a break anywhere can interrupt the entire token-ring loop.',
          marks: 4,
        },
        {
          question: 'What is the role of Terminators in Bus Topology?',
          answer: 'Terminators are attached at both ends of the main backbone cable to absorb incoming electrical signals, preventing signal bounce/reflection that causes data packet corruption.',
          marks: 2,
        },
      ],
    },
  },
  {
    id: 'note_eng_01',
    title: 'English 11: Story 1 "Button, Button" Analysis & 12 Master Tenses Drill',
    urduTitle: 'انگریزی 11: کہانی "بٹن، بٹن" مع کردار، اہم معروضی و سن شائن گرائمر نوٹس',
    subjectId: 'sub_03',
    subjectName: 'English & Grammar',
    subjectCode: 'FAIT-ENG-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'Prof. Musarrat Hussain (Sunshine English Comprehensive Guide)',
    totalPages: 14,
    status: 'available',
    summary: 'Complete characterization of Norma and Arthur Lewis, moral dilemma of $50,000 offer by Mr. Steward, 20 high-frequency board synonyms, and active-to-passive transformation drills.',
    content: {
      heading: 'Book 1: Short Stories — Story 1 "Button, Button" by Richard Matheson',
      subheading: 'Sunshine English Guide: Grammar, Tenses, Board Pair of Words',
      englishText: `Critical Synopsis:
"Button, Button" explores the corrosive impact of materialistic greed on human morality. Mr. Steward presents Norma and Arthur Lewis with an enigmatic button unit: pushing the button yields $50,000 cash, but causes the death of an unknown person.

Arthur immediately dismisses the proposition as criminal and immoral. Conversely, Norma rationalizes it, arguing that an unknown victim might be an old Chinese peasant or an ailing invalid. Her moral decay culminates in pushing the button. Shortly thereafter, she receives news that Arthur died in a subway accident, triggering a $25,000 double-indemnity life insurance payout ($50,000 total). Steward chillingly asks: "Did you really think you knew your husband?"`,
      keyPoints: [
        'Theme: Selfish choices carry devastating unforeseen consequences.',
        'Norma Lewis: Symbol of consumerist greed, ethical compromise, and self-delusion.',
        'Arthur Lewis: Symbol of steadfast ethical conscience and respect for human life.',
        'Board Pairs of Words (1-10): Accept/Except, Advice/Advise, Affect/Effect, Bail/Bale, Berth/Birth.',
      ],
      sampleQuestions: [
        {
          question: 'What was the moral dilemma presented to Norma and Arthur?',
          answer: 'The dilemma was whether to prioritize personal wealth ($50,000) over the sanctity of human life, forcing them to choose between selfish luxury and fundamental moral duty.',
          marks: 2,
        },
        {
          question: 'Explain the significance of Mr. Steward’s final question to Norma.',
          answer: 'Steward asked: "Did you really think you knew your husband?" This reveals that Norma never truly understood Arthur’s moral principles and, in pursuing selfish desires, she unknowingly sacrificed her own husband.',
          marks: 4,
        },
      ],
    },
  },
  {
    id: 'note_tqm_01',
    title: 'Tarjuma-tul-Quran 11: Surah Al-Baqarah (Rukoo 1 to 3) Notes',
    urduTitle: 'ترجمۃ القرآن 11: سورۃ البقرہ (رکوع 1 تا 3) لفظی و با محاورہ ترجمہ و مشقی سوالات',
    subjectId: 'sub_05',
    subjectName: 'Tarjuma-tul-Quran',
    subjectCode: 'FAIT-TQM-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'ہمدرد کتب خانہ نوٹس سیریز (ماڈل پیپر 50 مارکس)',
    totalPages: 10,
    status: 'available',
    summary: 'سورۃ البقرہ کا تعارف، ابتدائی 3 رکوعات کا لفظی اور با محاورہ ترجمہ، متقین کی 5 صفات، منافقین کی دو تمثیلات، اور 5 سالہ بورڈ سوالات۔',
    content: {
      heading: 'ترجمۃ القرآن المجید: سورۃ البقرہ (مدنی سورت، 286 آیات)',
      subheading: 'لازمی پرچہ 50 نمبر: قرآنی ترجمہ و مفہوم',
      urduText: `سورۃ البقرہ کا پس منظر و فضائل:
سورۃ البقرہ قرآن مجید کی دوسری اور طویل ترین سورت ہے جو مدینہ منورہ میں نازل ہوئی۔ اس سورت کے آغاز میں قرآن کے کتابِ برحق ہونے اور پرہیزگاروں کے لیے ذریعہ ہدایت ہونے کا اعلان کیا گیا ہے۔

متقین کے 5 بنیادی اوصاف:
1. الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ — جو غیب کی باتوں پر کامل ایمان رکھتے ہیں۔
2. وَيُقِيمُونَ الصَّلَاةَ — اور پابندی و خشوع کے ساتھ نماز قائم کرتے ہیں۔
3. وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ — اور جو رزق ہم نے انہیں دیا ہے اس میں سے اللہ کی راہ میں خرچ کرتے ہیں۔
4. وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ — اور جو آپ پر نازل ہوا اور جو آپ سے پہلے نازل ہوا سب پر ایمان رکھتے ہیں۔
5. وَبِالْآخِرَةِ هُمْ يُوقِنُونَ — اور آخرت پر پختہ یقین رکھتے ہیں۔`,
      keyPoints: [
        'الم: حروف مقطعات ہیں جن کا قطعی مفہوم صرف اللہ تعالیٰ کو معلوم ہے۔',
        'کفار کی حالت: ان کے دلوں اور کانوں پر کفر کی وجہ سے مہر لگ چکی ہے۔',
        'منافقین کی مثال: وہ اندھیروں میں آگ جلانے والے شخص کی طرح ہیں جن کی روشنی اللہ نے سلب کر لی۔',
      ],
      sampleQuestions: [
        {
          question: 'سورۃ البقرہ کے آغاز میں متقین کی کون سی صفات بیان ہوئی ہیں؟',
          answer: 'متقین غیب پر ایمان لاتے ہیں، نماز قائم کرتے ہیں، اللہ کی راہ میں خرچ کرتے ہیں، تمام آسمانی کتب پر ایمان رکھتے ہیں اور آخرت پر یقین رکھتے ہیں۔',
          marks: 2,
        },
        {
          question: 'منافقین کے بارے میں "فِي قُلُوبِهِم مَّرَضٌ" کا کیا مفہوم ہے؟',
          answer: 'ان کے دلوں میں شک، بغض اور منافقت کی بیماری ہے، اس لیے اللہ نے ان کے فریب اور نافرمانی کی وجہ سے اس بیماری کو اور بڑھا دیا۔',
          marks: 3,
        },
      ],
    },
  },
  {
    id: 'note_eco_01',
    title: 'Economics 11: Law of Diminishing Marginal Utility & Definitions',
    urduTitle: 'اصولِ معاشیات 11: قانونِ تقلیلِ افادہِ مختتم، گوشوارہ اور مارشل و رابنز کی تعریفات',
    subjectId: 'sub_07',
    subjectName: 'Principles of Economics',
    subjectCode: 'FAIT-ECO-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'پروفیسر حبیب اللہ قریشی (علمی کتاب خانہ اردو بازار لاہور)',
    totalPages: 18,
    status: 'available',
    summary: 'معاشیات کی تین کلاسیکی تعریفات (سمتھ، مارشل، رابنز)، افادہ اور مختتم افادہ کا تعلق، نقطہ سیری، اور قانون تقلیل افادہ مختتم کا مکمل گوشوارہ و ڈایاگرام۔',
    content: {
      heading: 'باب اول و دوم: معاشیات کی نوعیت اور نظریہ افادہ',
      subheading: 'BISE DG Khan پرچہ 100 نمبر: حصہ معروضی 20 نمبر + حصہ انشائی 80 نمبر',
      urduText: `قانونِ تقلیلِ افادہِ مختتم (Law of Diminishing Marginal Utility):
پروفیسر الفریڈ مارشل کے مطابق:
"اگر دیگر حالات بدستور رہیں تو جب کسی شخص کے پاس کسی شے کے ذخیرے میں اضافہ ہوتا چلا جاتا ہے، تو ہر اضافی اکائی سے حاصل ہونے والا افادہ بتدریج کم ہوتا چلا جاتا ہے۔"

گوشوارہ:
• پہلی روٹی کا افادہ: 10 اکائیاں (کل افادہ = 10)
• دوسری روٹی کا افادہ: 8 اکائیاں (کل افادہ = 18)
• تیسری روٹی کا افادہ: 6 اکائیاں (کل افادہ = 24)
• چوتھی روٹی کا افادہ: 4 اکائیاں (کل افادہ = 28)
• پانچویں روٹی کا افادہ: 2 اکائیاں (کل افادہ = 30)
• چھٹی روٹی کا افادہ: 0 اکائیاں (نقطہ سیری - کل افادہ زیادہ سے زیادہ 30)
• ساتویں روٹی کا افادہ: -2 اکائیاں (منفی افادہ - کل افادہ گھٹ کر 28)`,
      keyPoints: [
        'جب مختتم افادہ (MU) صفر ہوتا ہے تو کل افادہ (TU) زیادہ سے زیادہ (Maximum) ہوتا ہے۔',
        'مفروضات: شے کی نوعیت یکساں ہو، مقدار مناسب ہو، اور استعمال مسلسل ہو۔',
        'مارشل کی تعریف مادی فلاح پر مبنی ہے جبکہ رابنز کی تعریف سائنسی و نایاب وسائل پر مبنی ہے۔',
      ],
      sampleQuestions: [
        {
          question: 'نقطہ سیری (Point of Satiety) کی تعریف کریں۔',
          answer: 'وہ نقطہ جہاں صارف کا مختتم افادہ صفر ہو جائے اور کل افادہ زیادہ سے زیادہ ہو، نقطہ سیری کہلاتا ہے۔ اس کے بعد مزید استعمال نقصان دہ ہوتا ہے۔',
          marks: 2,
        },
        {
          question: 'الفریڈ مارشل اور لیونل رابنز کی تعریفات میں بنیادی فرق کیا ہے؟',
          answer: 'مارشل نے معاشیات کو انسان کی مادی خوشحالی کا علم قرار دیا، جبکہ رابنز نے اسے انسان کے لامحدود مقاصد اور محدود و متبادل وسائل کے درمیان تعلق کا سائنسی مطالعہ قرار دیا۔',
          marks: 4,
        },
      ],
    },
  },
  {
    id: 'note_ped_01',
    title: 'Physical Education 11: Human Skeletal System & 400m Track',
    urduTitle: 'فزیکل ایجوکیشن 11: انسانی ہڈیوں کا ڈھانچہ (206 ہڈیاں) اور 400m معیاری ٹریک قوانین',
    subjectId: 'sub_01',
    subjectName: 'Physical Education',
    subjectCode: 'FAIT-PED-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'پروفیسر سید بشارت حسین گیلانی (گولڈ میڈلسٹ)',
    totalPages: 12,
    status: 'available',
    summary: 'انسانی جسم کی 206 ہڈیوں کی درجہ بندی (محوری 80 اور ضمیمائی 126)، حرکت پذیر جوڑ، اور 400 میٹر معیاری ایتھلیٹکس ٹریک کی لینز کی پیمائشیں۔',
    content: {
      heading: 'باب اول: انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور ٹریک رولز',
      subheading: 'BISE DG Khan پرچہ 75 نمبر + 25 نمبر پریکٹیکل',
      urduText: `انسانی ڈھانچہ اور جوڑ:
بالغ انسان کے جسم میں کل 206 ہڈیاں ہوتی ہیں۔
1. محوری ڈھانچہ (Axial Skeleton - 80 ہڈیاں): کھوپڑی، ریڑھ کی ہڈی، پسلیاں اور سینے کی ہڈی۔
2. ضمیمائی ڈھانچہ (Appendicular Skeleton - 126 ہڈیاں): بازو، ٹانگیں، شانے اور کولہے کی ہڈیاں۔

400 میٹر ٹریک کی پیمائشیں:
معیاری ٹریک میں 8 لینز ہوتی ہیں۔ ہر لین کی چوڑائی 1.22 میٹر (4 فٹ) ہوتی ہے۔ دو سیدھے حصے (Straights) 84.39 میٹر کے اور دو موڑ (Curves) ہوتے ہیں۔`,
      keyPoints: [
        'ہڈیوں کے افعال: حفاظت، سہارا، حرکت، معدنیات کا ذخیرہ اور خون کے خلیات بنانا۔',
        'گیند پیالہ جوڑ (Ball and Socket Joint) کندھے اور کولہے میں پایا جاتا ہے۔',
        'ریلے ریس میں بیٹن کا تبادلہ 20 میٹر کے مقررہ ایکسچینج زون میں ہونا ضروری ہے۔',
      ],
      sampleQuestions: [
        {
          question: 'انسانی جسم میں کل کتنی ہڈیاں ہوتی ہیں اور ان کے دو بڑے حصے کون سے ہیں؟',
          answer: 'کل 206 ہڈیاں ہوتی ہیں۔ 1. محوری ڈھانچہ (80 ہڈیاں) 2. ضمیمائی ڈھانچہ (126 ہڈیاں)۔',
          marks: 2,
        },
        {
          question: 'معیاری ایتھلیٹکس ٹریک کی ایک لین کی چوڑائی کتنی ہوتی ہے؟',
          answer: 'معیاری ٹریک کی ہر لین کی چوڑائی 1.22 میٹر (4 فٹ) ہوتی ہے۔',
          marks: 2,
        },
      ],
    },
  },
  // Upcoming Authentic Notes with Clear Realistic Timeline (No Fake Filler)
  {
    id: 'note_upc_01',
    title: 'Computer Science: Python Programming Solved Practical Programs',
    urduTitle: 'کمپیوٹر سائنس 11: پائتھن پروگرامنگ حل شدہ پریکٹیکل کوڈز و الگورتھمز',
    subjectId: 'sub_04',
    subjectName: 'Computer Science & Entrepreneurship',
    subjectCode: 'FAIT-CSC-11',
    category: 'chapter_notes',
    categoryLabel: 'Programming Lab',
    author: 'Faculty Lead Ahmad & IT Series Editorial Team',
    totalPages: 24,
    status: 'upcoming',
    releaseTimeline: 'Releasing Nov 24, 2026',
    editorialProgress: 85,
    summary: '25 high-yield Python programs for BISE DG Khan practicals: Factorial, Fibonacci series, Prime numbers, Palindrome check, and Matrix operations with step-by-step logic.',
    content: {
      heading: 'Upcoming: Python Practical Workbook',
      keyPoints: ['Comprehensive code listings', 'Dry run traces', 'Viva-voce questions'],
      sampleQuestions: [],
    },
  },
  {
    id: 'note_upc_02',
    title: 'Urdu 11: Lesson 2 "Apni Madad Aap" & Board Khatoot Collection',
    urduTitle: 'اُردو 11: سبق "اپنی مدد آپ" (سر سید احمد خان) خلاصہ و خطوط مجموعہ',
    subjectId: 'sub_02',
    subjectName: 'Urdu & Grammar',
    subjectCode: 'FAIT-URD-11',
    category: 'chapter_notes',
    categoryLabel: 'Chapter Notes',
    author: 'پروفیسر راؤ خالد محمود (شرح سرمایہ اردو)',
    totalPages: 16,
    status: 'upcoming',
    releaseTimeline: 'Releasing Nov 28, 2026',
    editorialProgress: 75,
    summary: 'سر سید احمد خان کے سبق کا خلاصہ، استعارہ کے ارکان (مستعار لہ، مستعار منہ، وجہ جامع) اور 10 بورڈ فیورٹ خطوط۔',
    content: {
      heading: 'Upcoming: Lesson 2 Apni Madad Aap Notes',
      keyPoints: ['Complete Tashreeh', 'Summary', 'Letters'],
      sampleQuestions: [],
    },
  },
  {
    id: 'note_upc_03',
    title: 'BISE DG Khan 5-Year Past Papers Solved (All 6 Subjects)',
    urduTitle: 'بورڈ آف انٹرمیڈیٹ ڈی جی خان 5 سالہ حل شدہ سابقہ امتحانی پرچہ جات (2021 تا 2025)',
    subjectId: 'all',
    subjectName: 'All 6 Subjects',
    subjectCode: 'FAIT-ALL-11',
    category: 'past_papers',
    categoryLabel: 'Past Papers',
    author: 'Global Science Academy Academic Committee',
    totalPages: 60,
    status: 'upcoming',
    releaseTimeline: 'Releasing Dec 05, 2026',
    editorialProgress: 60,
    summary: 'Compiled past 5 years authentic board questions for DG Khan division, categorized by chapter with official answer keys for intermediate Part-1.',
    content: {
      heading: 'Upcoming: 5-Year Solved Board Papers Bank',
      keyPoints: ['Past 5 years solved MCQs', 'Section B short questions', 'Section C long questions'],
      sampleQuestions: [],
    },
  },
];

export const BoardNotesPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReadingNote, setActiveReadingNote] = useState<BoardNoteItem | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Filter notes
  const filteredNotes = BOARD_NOTES_LIST.filter((item) => {
    if (selectedSubject !== 'all' && item.subjectId !== selectedSubject) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        (item.urduTitle || '').toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleCopyNote = (note: BoardNoteItem) => {
    const text = `${note.title}\n\n${note.summary}\n\n${note.content.urduText || note.content.englishText || ''}\n\nKey Concepts:\n${note.content.keyPoints.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2500);
  };

  return (
    <div className="space-y-6 font-sans w-full pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>BISE D.G. Khan &bull; 1st Year FA-IT Academic Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
            Board Notes &amp; Solved Resources
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Official chapter summaries, verified key book answers, and high-yield board question collections for 1st Year FA-IT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-2 rounded-2xl bg-[#2e3533] border border-white/10 text-xs text-zinc-300 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Lead: <strong className="text-white">Ahmad</strong> (Fatehpur)</span>
          </div>
        </div>
      </div>

      {/* 2. Search & Dropdown Filters Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search notes, chapters, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 placeholder-zinc-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All 6 Subjects</option>
              <option value="sub_02">Urdu &amp; Grammar (شرح سرمایہ)</option>
              <option value="sub_04">Computer Science (IT Series)</option>
              <option value="sub_03">English &amp; Grammar (Sunshine)</option>
              <option value="sub_05">Tarjuma-tul-Quran (ہمدرد نوٹس)</option>
              <option value="sub_07">Principles of Economics (علمی کتاب خانہ)</option>
              <option value="sub_01">Health &amp; Physical Education</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="chapter_notes">Chapter Notes &amp; Summaries</option>
              <option value="short_questions">Solved Short Questions</option>
              <option value="past_papers">5-Year Past Papers Solved</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Notes Grid (Asymmetric Clean Cards with Zero Harsh Shadows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => {
          const isAvailable = note.status === 'available';

          return (
            <div
              key={note.id}
              className="p-5 rounded-3xl bg-white border border-[#e1ede7] shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 text-[#142D27]"
            >
              <div className="space-y-2.5">
                {/* Header Pills */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                    {note.subjectCode} &bull; {note.categoryLabel}
                  </span>
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {note.releaseTimeline}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-sm font-bold text-[#142D27] font-serif leading-snug">
                    {note.title}
                  </h3>
                  {note.urduTitle && (
                    <p className="font-urdu text-[13px] text-emerald-900 mt-1 leading-relaxed text-right dir-rtl">
                      {note.urduTitle}
                    </p>
                  )}
                </div>

                {/* Summary */}
                <p className="text-xs text-[#557067] leading-relaxed line-clamp-3">
                  {note.summary}
                </p>

                {/* Editorial Progress for Upcoming Items */}
                {!isAvailable && (
                  <div className="space-y-1 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900">
                      <span>Faculty Preparation</span>
                      <span>{note.editorialProgress}% Prepared</span>
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full transition-all"
                        style={{ width: `${note.editorialProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-amber-800 block mt-0.5">
                      Under review by Sir Ahmad &bull; Global Science Academy
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#e1ede7] flex items-center justify-between gap-2 text-xs">
                <span className="text-[11px] text-zinc-500 font-medium">
                  {note.totalPages} Pages &bull; {note.author.split('(')[0].trim()}
                </span>

                <div className="flex items-center gap-1.5">
                  {isAvailable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopyNote(note)}
                        className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors border border-zinc-200 cursor-pointer shadow-2xs"
                        title="Copy note summary"
                      >
                        {copiedNoteId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReadingNote(note)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read Online</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold text-zinc-500 italic">
                      Timeline: {note.releaseTimeline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. In-App Interactive Note Reading Modal */}
      {activeReadingNote &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-2.5 sm:p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
            onClick={() => setActiveReadingNote(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-zinc-200 max-w-3xl w-full max-h-[92dvh] sm:max-h-[88vh] shadow-2xl flex flex-col overflow-hidden text-zinc-900 my-auto animate-in zoom-in-95 duration-150"
            >
              {/* Modal Top Bar */}
              <div className="p-4 sm:p-5 border-b border-zinc-200 bg-[#F7F9F8] flex items-start justify-between gap-3 shrink-0">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider">
                      {activeReadingNote.subjectName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                      {activeReadingNote.totalPages} Pages Mapped
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-serif leading-snug">
                    {activeReadingNote.title}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
                    title="Print Notes"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveReadingNote(null)}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-200 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white font-sans">
                {/* Heading Banner */}
                <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-[#142D27] font-serif">
                    {activeReadingNote.content.heading}
                  </h3>
                  {activeReadingNote.content.subheading && (
                    <p className="text-xs text-[#557067]">
                      {activeReadingNote.content.subheading}
                    </p>
                  )}
                </div>

                {/* Text Content (Urdu Nastaliq or English) */}
                {activeReadingNote.content.urduText && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 font-urdu text-[15px] sm:text-base leading-loose text-zinc-900 text-right dir-rtl whitespace-pre-line">
                    {activeReadingNote.content.urduText}
                  </div>
                )}

                {activeReadingNote.content.englishText && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm leading-relaxed text-zinc-800 whitespace-pre-line font-sans">
                    {activeReadingNote.content.englishText}
                  </div>
                )}

                {/* Key Points */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      اہم امتحانی نکات (Key Takeaways)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {activeReadingNote.content.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-start gap-2.5 text-xs text-zinc-800 leading-relaxed shadow-2xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Solved Questions */}
                {activeReadingNote.content.sampleQuestions && activeReadingNote.content.sampleQuestions.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>حل شدہ امتحانی سوالات (Solved Examination Questions)</span>
                    </h4>

                    <div className="space-y-3">
                      {activeReadingNote.content.sampleQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2 text-xs sm:text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-zinc-900">
                              Q{idx + 1}: {q.question}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 shrink-0">
                              {q.marks} Marks
                            </span>
                          </div>
                          <div className="pl-4 pt-1 text-xs text-zinc-700 leading-relaxed border-t border-zinc-200/60 mt-1">
                            <strong className="text-emerald-700 block mb-0.5">جواب (Answer):</strong>
                            {q.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-zinc-200 bg-[#F7F9F8] flex items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-zinc-500 font-medium">
                  Verified by Sir Ahmad &bull; Global Science Academy, Fatehpur
                </span>
                <button
                  type="button"
                  onClick={() => setActiveReadingNote(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
