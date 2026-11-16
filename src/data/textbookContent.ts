// Textbook authentic excerpts, chapters, and page content for the 7 books of 1st Year FA-IT (BISE DG Khan)

export interface ChapterContent {
  chapterNum: number;
  title: string;
  urduTitle?: string;
  pagesRange: string;
  pageStart: number;
  pageEnd: number;
  summary: string;
  keyPoints: string[];
  boardQuestions: {
    question: string;
    answer: string;
    marks: number;
    type: 'mcq' | 'short' | 'long';
  }[];
  grammarOrPracticalRules?: string[];
}

export interface BookContentData {
  bookId: string;
  bookTitle: string;
  urduBookTitle: string;
  author: string;
  totalPages: number;
  coverUrl: string;
  pdfFileName: string;
  subjectCode: string;
  chapters: ChapterContent[];
}

export const TEXTBOOK_KNOWLEDGE_BASE: Record<string, BookContentData> = {
  // 1. Physical Education
  'FAIT-PED-11': {
    bookId: 'book_henza_01',
    bookTitle: 'Health & Physical Education (Part-1)',
    urduBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن (پروفیسر سید بشارت حسین گیلانی)',
    author: 'پروفیسر سید بشارت حسین گیلانی (گولڈ میڈلسٹ)',
    totalPages: 140,
    coverUrl: '/covers/cover_physical_edu.jpg',
    pdfFileName: 'health_physical_education_11_gilani.pdf',
    subjectCode: 'FAIT-PED-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'Human Skeletal System & 400m Track Rules',
        urduTitle: 'باب اول: انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز',
        pagesRange: 'Pages 1-12',
        pageStart: 1,
        pageEnd: 12,
        summary: 'انسانی جسم میں کل 206 ہڈیاں ہوتی ہیں۔ ہڈیوں کے جوڑ تین اقسام پر مشتمل ہیں: غیر متحرک (Immovable)، نیم متحرک (Slightly Movable)، اور مکمل متحرک (Freely Movable)۔ معیاری 400 میٹر ایتھلیٹکس ٹریک میں 8 لینز ہوتی ہیں، ہر لین کی چوڑائی 1.22 میٹر ہوتی ہے۔',
        keyPoints: [
          'انسانی ڈھانچے کے دو بڑے حصے: محوری ڈھانچہ (Axial Skeleton - 80 ہڈیاں) اور ضمیمائی ڈھانچہ (Appendicular Skeleton - 126 ہڈیاں)۔',
          'ہڈیوں کے اہم افعال: جسم کو سہارا دینا، اندرونی نازک اعضاء کی حفاظت، اور خون کے سرخ خلیات (RBCs) بنانا۔',
          'گیند اور پیالہ جوڑ (Ball and Socket Joint) کندھے اور کولہے میں پایا جاتا ہے جو ہر سمت حرکت کی اجازت دیتا ہے۔',
          '400 میٹر ٹریک کے سیدھے حصے (Straights) اور موڑ (Curves) کی باقاعدہ پیمائش BISE DG Khan بورڈ کے لیے لازمی ہے۔',
        ],
        boardQuestions: [
          {
            question: 'انسانی جسم میں کل کتنی ہڈیاں ہوتی ہیں؟',
            answer: 'انسانی جسم کے بالغ ڈھانچے میں کل 206 ہڈیاں ہوتی ہیں۔',
            marks: 2,
            type: 'short',
          },
          {
            question: '400 میٹر ایتھلیٹکس ٹریک کی لین کی چوڑائی کتنی ہوتی ہے؟',
            answer: 'معیاری ٹریک کی ہر لین کی چوڑائی 1.22 میٹر (4 فٹ) ہوتی ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'انسانی ڈھانچے کے اہم افعال اور جوڑوں کی اقسام پر تفصیلی نوٹ تحریر کریں۔',
            answer: 'ڈھانچے کے پانچ بنیادی افعال: 1. سہارا 2. حفاظت 3. حرکات میں مدد 4. معدنیات کا ذخیرہ 5. خون کی پیدائش۔ جوڑوں کی اقسام: فکسڈ جوڑ، قبضہ نما جوڑ (Hinge Joint)، گیند پیالہ جوڑ (Ball & Socket)۔',
            marks: 8,
            type: 'long',
          },
        ],
      },
      {
        chapterNum: 2,
        title: 'Muscular System & Muscle Fiber Contraction',
        urduTitle: 'باب دوم: انسانی عضلاتی نظام، پٹھوں کی ساخت اور حرکات',
        pagesRange: 'Pages 13-24',
        pageStart: 13,
        pageEnd: 24,
        summary: 'انسانی جسم میں 600 سے زائد عضلات (Muscles) پائے جاتے ہیں جو جسمانی وزن کا تقریباً 40 سے 50 فیصد بناتے ہیں۔ عضلات کی تین بڑی اقسام ہیں: ارادی عضلات (Skeletal/Voluntary)، غیر ارادی عضلات (Smooth/Involuntary)، اور قلبی عضلات (Cardiac Muscles)۔',
        keyPoints: [
          'ارادی عضلات ہڈیوں سے جڑے ہوتے ہیں اور انسان کی مرضی کے تابع ہوتے ہیں۔',
          'دل کے عضلات ساخت میں دھاری دار لیکن کام میں غیر ارادی ہوتے ہیں جو بغیر تھکے مسلسل دھڑکتے ہیں۔',
          'عضلاتی ایندھن: گلائیکوجن اور اے ٹی پی (ATP) عضلات کو سکڑنے اور پھیلنے کی توانائی فراہم کرتے ہیں۔',
        ],
        boardQuestions: [
          {
            question: 'عضلات کی تین اقسام کے نام تحریر کریں۔',
            answer: '1. ارادی عضلات (Skeletal) 2. غیر ارادی عضلات (Smooth) 3. قلبی عضلات (Cardiac)۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
    ],
  },

  // 2. Urdu & Sharh Sarmaya
  'FAIT-URD-11': {
    bookId: 'book_henza_03',
    bookTitle: 'Sharh Sarmaya-e-Urdu 11 (Capt. Series)',
    urduBookTitle: 'شرح سرمایہ اردو (پروفیسر راؤ خالد محمود)',
    author: 'پروفیسر راؤ خالد محمود (گورنمنٹ گریجویٹ کالج خان پور)',
    totalPages: 220,
    coverUrl: '/covers/cover_urdu_sharh.jpg',
    pdfFileName: 'sharh_sarmaya_e_urdu_11_khalid.pdf',
    subjectCode: 'FAIT-URD-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'سبق اسوہ حسنہ خلاصہ و تشریح اور علم بیان',
        urduTitle: 'سبق اسوہ حسنہ خلاصہ و تشریح، خط نویسی اور علم بیان (تشبیہ)',
        pagesRange: 'Pages 1-15',
        pageStart: 1,
        pageEnd: 15,
        summary: 'سید سلیمان ندوی کا تحریر کردہ یہ سبق سیرت النبی ﷺ کے عالمگیر اور ہمہ گیر پہلوؤں کو اجاگر کرتا ہے۔ رسول اکرم ﷺ کا اسوہ ہر طبقہ فکر، بادشاہ، فقیر، سپاہی، تاجر اور معلم کے لیے کامل رہنمائی فراہم کرتا ہے۔ قواعد میں تشبیہ کے پانچ ارکان (مشبہ، مشبہ بہ، وجہ شبہ، غرض تشبیہ، اور حرف تشبیہ) شامل ہیں۔',
        keyPoints: [
          'مصنف: سید سلیمان ندوی (شاگردِ رشید شبلی نعمانی)۔ ماخوذ از: خطباتِ مدراس۔',
          'مذہب کی بنیاد دو چیزوں پر ہے: عقیدہ اور عمل۔ عمل کے لیے ایک زندہ کامل عملی نمونے کی ضرورت ہوتی ہے۔',
          'آفتاب عالمتاب کی مثال: نبی کریم ﷺ کا وجودِ مبارک ایک آفتاب کی مانند ہے جس سے ہر شخص اپنی ضرورت کے مطابق روشنی اور حرارت پاتا ہے۔',
          'علم بیان: تشبیہ کی تعریف — کسی ایک چیز کو کسی مشترک صفت کی بنا پر دوسری چیز کی مانند قرار دینا۔',
        ],
        boardQuestions: [
          {
            question: 'سید سلیمان ندوی کے مطابق انسانوں کی رہنمائی کے لیے کس چیز کی ضرورت ہے؟',
            answer: 'انسانوں کی رہنمائی کے لیے صرف زبانی تعلیمات کافی نہیں بلکہ ایک زندہ اور کامل عملی نمونے (اسوہ حسنہ) کی ضرورت ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'تشبیہ کے ارکان کتنے ہیں؟ نام تحریر کریں۔',
            answer: 'تشبیہ کے پانچ ارکان ہیں: 1. مشبہ 2. مشبہ بہ 3. وجہ شبہ 4. غرض تشبیہ 5. حرفِ تشبیہ۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'سبق "اسوہ حسنہ" کا مکمل خلاصہ اپنے الفاظ میں تحریر کریں۔ (10 نمبر)',
            answer: 'سید سلیمان ندوی فرماتے ہیں کہ دنیا کے تمام شعبہ ہائے زندگی کے لیے کامل رہنمائی صرف اور صرف حضرت محمد ﷺ کی سیرتِ طیبہ میں موجود ہے۔ اگر آپ دولت مند ہیں تو مکہ کے تاجر کی سیرت دیکھیں، اگر غریب ہیں تو شعبِ ابی طالب کے محصور کو دیکھیں، اگر فاتح ہیں تو بدر و فتح مکہ کے سپہ سالار کو دیکھیں...',
            marks: 10,
            type: 'long',
          },
        ],
        grammarOrPracticalRules: [
          'تشبیہ کی مثال: "بچہ چاند کی طرح خوبصورت ہے۔" مشبہ: بچہ، مشبہ بہ: چاند، حرف تشبیہ: کی طرح، وجہ شبہ: خوبصورتی۔',
          'خط کا خاکہ: کمرہ امتحان، تاریخ، القاب، آداب، نفسِ مضمون، اور اختتام۔',
        ],
      },
      {
        chapterNum: 2,
        title: 'سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ و استعارہ',
        urduTitle: 'سبق اپنی مدد آپ (سر سید احمد خان) خلاصہ، مکالمہ اور استعارہ',
        pagesRange: 'Pages 16-30',
        pageStart: 16,
        pageEnd: 30,
        summary: 'سر سید احمد خان کا مشہور مقالہ جو خود انحصاری، محنت اور ذاتی جوش کی اہمیت واضح کرتا ہے۔ قومیں قانون سے نہیں بلکہ افراد کی محنت اور اخلاقی بلندی سے ترقی پاتی ہیں۔ استعارہ میں لفظ اپنے حقیقی معنوں کی بجائے مجازی معنوں میں استعمال ہوتا ہے۔',
        keyPoints: [
          'مصنف: سر سید احمد خان۔ ماخوذ از: مقالاتِ سرسید۔',
          'خدا ان کی مدد کرتا ہے جو اپنی مدد آپ کرتے ہیں (God helps those who help themselves)۔',
          'قوم درحقیقت افراد کے مجموعے کا نام ہے۔ جیسی رعایا ہوگی ویسی ہی حکومت ہوگی۔',
          'استعارہ کے تین ارکان ہیں: مستعار لہ، مستعار منہ، اور وجہ جامع۔',
        ],
        boardQuestions: [
          {
            question: 'سر سید کے نزدیک اصلی غلام کون ہے؟',
            answer: 'جو شخص جہالت، بد اخلاقی اور سستی کا شکار ہو وہ درحقیقت اصلی غلام ہے، چاہے وہ آزاد ہی کیوں نہ ہو۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
    ],
  },

  // 3. English 11 & Sunshine
  'FAIT-ENG-11': {
    bookId: 'book_henza_04',
    bookTitle: 'English 11 & Sunshine Comprehensive English',
    urduBookTitle: 'انگریزی 11 درسی کتاب و سن شائن انگلش (پروفیسر مسرت حسین)',
    author: 'Punjab Curriculum & Textbook Board / Prof. Musarrat Hussain',
    totalPages: 260,
    coverUrl: '/covers/cover_english_ptb.png',
    pdfFileName: 'english_11_pectaa_textbook.pdf',
    subjectCode: 'FAIT-ENG-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'Story 1 "Button, Button" & Master Tenses Drill',
        urduTitle: 'کہانی 1 "بٹن، بٹن" (رچرڈ میتھیسن) و سن شائن گرائمر',
        pagesRange: 'Pages 1-18',
        pageStart: 1,
        pageEnd: 18,
        summary: 'Story 1 "Button, Button" written by Richard Matheson portrays moral dilemma and human greed. Mr. Steward offers Norma and Arthur Lewis $50,000 if they push the button, which will cause the death of someone they do not know. Norma succumbs to greed, pushes the button, and suffers tragic consequences when Arthur dies in a train accident, claiming his $25,000 double-indemnity life insurance policy. Steward reminds her: "Did you really think you knew your husband?"',
        keyPoints: [
          'Characters: Norma Lewis (materialistic, greedy), Arthur Lewis (principled, moral), Mr. Steward (agent of temptation).',
          'The central conflict is between moral integrity and tempting wealth.',
          'Grammar Focus: Present Indefinite vs Past Indefinite transformations.',
          'Board Pairs of Words (1-10): Accept/Except, Advice/Advise, Affect/Effect, Bail/Bale, Bare/Bear, Berth/Birth.',
        ],
        boardQuestions: [
          {
            question: 'Why did Arthur disagree with the proposition of Mr. Steward?',
            answer: 'Arthur considered pushing the button equivalent to murder. He believed killing an unknown person for money was completely immoral and unacceptable.',
            marks: 2,
            type: 'short',
          },
          {
            question: 'What message does Richard Matheson convey in "Button, Button"?',
            answer: 'The author conveys that greed leads to destruction and that selfish actions inevitably have severe moral and personal consequences.',
            marks: 2,
            type: 'short',
          },
          {
            question: 'Write a character sketch of Norma Lewis emphasizing her motivations.',
            answer: 'Norma Lewis represents human frailty tempted by superficial desires. She rationalized that pushing the button was not murder because they would never know the victim. Her obsession with luxuries (trips to Europe, a cottage) blinded her to moral duty, ultimately leading to her husband’s demise.',
            marks: 5,
            type: 'long',
          },
        ],
        grammarOrPracticalRules: [
          'Active to Passive: "He pushed the button." -> "The button was pushed by him."',
          'Tense Rule: Use V2 (Past Simple) for historical narrations and completed events.',
        ],
      },
      {
        chapterNum: 2,
        title: 'Story 2 "Clearing in the Sky" & Direct/Indirect Speech',
        urduTitle: 'کہانی 2 "آسمان پر صاف قطعہ" (جیسے اسٹورٹ) و ان ڈائریکٹ اسپیچ',
        pagesRange: 'Pages 19-35',
        pageStart: 19,
        pageEnd: 35,
        summary: 'Jesse Stuart depicts the indomitable willpower of an aging farmer father who defied doctors’ warnings to clear a small patch on the highest mountain top to plant corn and tomatoes.',
        keyPoints: [
          'Theme: Physical resilience, love for nature, and triumph of spirit over physical affliction.',
          'Doctors warned the father to sit still, but he built a clearing to feel young and vital.',
        ],
        boardQuestions: [
          {
            question: 'Why did the old man plant his secret garden on the mountain top?',
            answer: 'The old man believed vegetables tasted better grown on virgin mountain soil, and the physical struggle revived his youth and vitality.',
            marks: 2,
            type: 'short',
          },
        ],
      },
    ],
  },

  // 4. Tarjuma-tul-Quran
  'FAIT-TQM-11': {
    bookId: 'book_henza_06',
    bookTitle: 'Tarjuma-tul-Quran Al-Majeed (Hamdard Series)',
    urduBookTitle: 'ترجمۃ القرآن المجید مختصر (ہمدرد کتب خانہ لاہور)',
    author: 'ہمدرد نوٹس سیریز / وفاق المدارس و پنجاب ٹیکسٹ بک بورڈ',
    totalPages: 130,
    coverUrl: '/covers/cover_tarjuma_ptb.jpg',
    pdfFileName: 'tarjuma_tul_quran_hamdard_11.pdf',
    subjectCode: 'FAIT-TQM-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'سورۃ البقرہ (رکوع 1 تا 3) با محاورہ ترجمہ',
        urduTitle: 'سورۃ البقرہ (رکوع 1 تا 3) — متقین، کافرین اور منافقین کا تعارف و ترجمہ',
        pagesRange: 'Pages 1-10',
        pageStart: 1,
        pageEnd: 10,
        summary: 'سورۃ البقرہ قرآن مجید کی سب سے طویل مدنی سورت ہے۔ ابتدائی تین رکوع میں انسانیت کے تین بنیادی گروہوں کا تذکرہ ہے: 1. متقین (اہلِ تقویٰ جو غیب پر ایمان رکھتے ہیں، نماز قائم کرتے ہیں اور انفاق کرتے ہیں) 2. کفار (جن کے دلوں اور کانوں پر مہر لگ چکی ہے) 3. منافقین (جو زبان سے ایمان کا دعویٰ کرتے ہیں لیکن دل میں فریب رکھتے ہیں)۔',
        keyPoints: [
          'الم ۚ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ — اس کتاب میں کوئی شک نہیں، یہ پرہیزگاروں کے لیے ہدایت ہے۔',
          'متقین کے 5 بنیادی اوصاف: ایمان بالغیب، اقامتِ صلوٰۃ، انفاق فی سبیل اللہ، آسمانی کتب پر ایمان، اور آخرت پر پختہ یقین۔',
          'منافقین کی مثال: ایک شخص نے آگ جلائی، جب روشنی ہوئی تو اللہ نے نور چھین لیا اور وہ اندھیروں میں بھٹکتے رہ گئے۔',
          'مچھر اور حقیر چیزوں کی مثال بیان کرنے پر کافروں کے اعتراضات کا دندان شکن جواب۔',
        ],
        boardQuestions: [
          {
            question: 'سورۃ البقرہ کے آغاز میں متقین کی کون سی صفات بیان کی گئی ہیں؟',
            answer: 'متقین غیب پر ایمان رکھتے ہیں، پابندی سے نماز ادا کرتے ہیں، اللہ کے دیے ہوئے رزق سے خرچ کرتے ہیں، اور تمام آسمانی کتب اور آخرت پر یقین رکھتے ہیں۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'آیت "فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا" کا با محاورہ ترجمہ لکھیں۔',
            answer: 'ترجمہ: "ان کے دلوں میں بیماری ہے، پس اللہ نے ان کی بیماری کو اور زیادہ بڑھا دیا۔"',
            marks: 3,
            type: 'short',
          },
          {
            question: 'سورۃ البقرہ کے پہلے رکوع کی ابتدائی 5 آیات کا مکمل لفظی اور با محاورہ ترجمہ تحریر کریں۔',
            answer: '1. الم (یہ حروف مقطعات ہیں جن کا علم اللہ کو ہے)۔ 2. یہ وہ کتاب ہے جس میں کسی شک کی گنجائش نہیں، متقین کے لیے ہدایت ہے۔ 3. جو غیب پر ایمان لاتے ہیں اور نماز قائم کرتے ہیں اور جو ہم نے دیا اس میں سے خرچ کرتے ہیں...',
            marks: 8,
            type: 'long',
          },
        ],
      },
    ],
  },

  // 5. Islamiyat Lazmi
  'FAIT-ISL-11': {
    bookId: 'book_henza_07',
    bookTitle: 'Islamiyat Lazmi 11 (PCTAA Punjab)',
    urduBookTitle: 'اسلامیات لازمی گیارہویں جماعت (پنجاب کریکولم)',
    author: 'Punjab Curriculum & Textbook Board (PECTAA)',
    totalPages: 110,
    coverUrl: '/covers/cover_islamiat_ptb.jpg',
    pdfFileName: 'islamiyat_lazmi_11_pectaa.pdf',
    subjectCode: 'FAIT-ISL-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'عقیدہ توحید، عقیدہ رسالت اور انسانی زندگی پر اثرات',
        urduTitle: 'باب اول: عقیدہ توحید، عقیدہ رسالت اور انسانی زندگی پر عقائد کے اثرات',
        pagesRange: 'Pages 1-9',
        pageStart: 1,
        pageEnd: 9,
        summary: 'اسلامی عقائد کی بنیاد کلمہ طیبہ "لا الہ الا اللہ محمد رسول اللہ" پر ہے۔ عقیدہ توحید انسان میں عزتِ نفس، شجاعت، توکل، اور وسعتِ نظر پیدا کرتا ہے۔ عقیدہ رسالت نبی کریم ﷺ کو آخری نبی ماننے اور آپ ﷺ کی کامل اطاعت کو لازم قرار دیتا ہے۔',
        keyPoints: [
          'توحید کے تین پہلو: توحید فی الذات، توحید فی الصفات، اور توحید فی العبادات۔',
          'شرک سب سے بڑا ظلم ہے: "إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ"۔',
          'عقیدہ ختم نبوت اسلام کا بنیادی اور قطعی عقیدہ ہے: "مَّا كَانَ مُحَمَّدٌ أَبَا أَحَدٍ مِّن رِّجَالِكُمْ وَلَٰكِن رَّسُولَ اللَّهِ وَخَاتَمَ النَّبِيِّينَ"۔',
        ],
        boardQuestions: [
          {
            question: 'عقیدہ توحید کے انسانی زندگی پر دو اہم اثرات تحریر کریں۔',
            answer: '1. خودداری اور عزتِ نفس: انسان غیر اللہ کے آگے جھکنے سے آزاد ہو جاتا ہے۔ 2. بہادری و شجاعت: موت اور زندگی صرف اللہ کے ہاتھ میں جان کر خوف ختم ہو جاتا ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'عقیدہ ختم نبوت پر قرآنی آیت اور حدیث کی روشنی میں نوٹ لکھیں۔',
            answer: 'قرآن مجید میں واضح فرمایا گیا کہ محمد ﷺ اللہ کے رسول اور خاتم النبیین ہیں۔ حدیث مبارکہ ہے: "أَنَا خَاتَمُ النَّبِيِّينَ لَا نَبِيَّ بَعْدِي" (میں آخری نبی ہوں، میرے بعد کوئی نبی نہیں آئے گا)۔',
            marks: 5,
            type: 'long',
          },
        ],
      },
    ],
  },

  // 6. Computer Science & Entrepreneurship (IT Series by Tariq Mahmood & Imran Saeed)
  'FAIT-CSC-11': {
    bookId: 'book_henza_08',
    bookTitle: 'Computer Science and Entrepreneurship 11 (IT Series)',
    urduBookTitle: 'کمپیوٹر سائنس اینڈ انٹرپرینیورشپ 11 (آئی ٹی سیریز — طارق محمود، عمران سعید)',
    author: 'Tariq Mahmood, Imran Saeed (Reviewed by Tasleem Mustafa) — IT Series / PECTAA',
    totalPages: 280,
    coverUrl: '/covers/cover_computer_itseries.jpg',
    pdfFileName: 'computer_science_entrepreneurship_11_itseries.pdf',
    subjectCode: 'FAIT-CSC-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'Basics of Information Technology & Computer Systems',
        urduTitle: 'باب اول: انفارمیشن ٹیکنالوجی کی بنیادی باتیں، کمپیوٹر سسٹم اور ہارڈویئر آرکیٹیکچر',
        pagesRange: 'Pages 1-28',
        pageStart: 1,
        pageEnd: 28,
        summary: 'کمپیوٹر ایک الیکٹرانک مشین ہے جو خام ڈیٹا کو بطور ان پٹ لے کر ہدایات کے مطابق پراسیس کرتی ہے اور بامقصد نتائج (انفارمیشن) فراہم کرتی ہے۔ کمپیوٹر سسٹم کے دو اہم پہلو ہیں: ہارڈویئر (فزیکل اجزاء) اور سافٹ ویئر (پروگرامز اور ہدایات)۔',
        keyPoints: [
          'ڈیٹا (Data) خام حقائق و اعداد و شمار کو کہتے ہیں، جبکہ انفارمیشن (Information) پراسیس شدہ بامعنی شکل ہے۔',
          'سنٹرل پراسیسنگ یونٹ (CPU) کمپیوٹر کا دماغ کہلاتا ہے اور اس کے اہم حصے ALU, CU اور رجسٹرز ہیں۔',
          'پرائمری میموری (RAM/ROM) تیز ترین داخلی اسٹوریج فراہم کرتی ہے۔ RAM عارضی (Volatile) ہے جبکہ ROM مستقل (Non-volatile) ہے۔',
          'ان پٹ اور آؤٹ پٹ ڈیوائسز صارف اور کمپیوٹر کے درمیان رابطے کا ذریعہ بنتی ہیں۔',
        ],
        boardQuestions: [
          {
            question: 'ڈیٹا اور انفارمیشن کے درمیان فرق واضح کریں۔ (Differentiate between Data and Information)',
            answer: 'ڈیٹا غیر منظم خام حقائق (Unprocessed facts) ہیں جیسے امتحانی نمبرات۔ انفارمیشن پراسیس شدہ ڈیٹا ہے جیسے طلبہ کا حتمی گریڈ یا رزلٹ کارڈ۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'ریم (RAM) اور روم (ROM) میں کیا بنیادی فرق ہے؟',
            answer: 'RAM ایک عارضی اور وولٹائل میموری ہے جس میں بجلی بند ہونے پر ڈیٹا مٹ جاتا ہے۔ ROM ایک غیر وولٹائل مستقل میموری ہے جس میں کمپیوٹر کے بنیادی بوٹ اسٹریپ پروگرامز محفوظ ہوتے ہیں۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'سنٹرل پراسیسنگ یونٹ (CPU) کے افعال اور اس کے بنیادی اجزاء (ALU, CU, Registers) پر تفصیلی نوٹ لکھیں۔',
            answer: 'CPU کے افعال: 1. ہدایات حاصل کرنا (Fetch) 2. ڈی کوڈ کرنا 3. عمل درآمد (Execute)۔ ALU تمام حسابی و منطقی عمل کرتا ہے، CU کنٹرول سگنلز بھیجتا ہے، اور Registers تیز ترین ڈیٹا اسٹوریج دیتے ہیں۔',
            marks: 8,
            type: 'long',
          },
        ],
      },
      {
        chapterNum: 2,
        title: 'Information Networks & Topologies',
        urduTitle: 'باب دوم: انفارمیشن نیٹ ورکس، ٹوپولوجیز اور OSI ماڈل',
        pagesRange: 'Pages 29-60',
        pageStart: 29,
        pageEnd: 60,
        summary: 'کمپیوٹر نیٹ ورک دو یا زیادہ کمپیوٹرز کا باہمی ربط ہے جو وسائل، پرنٹرز اور انٹرنیٹ شیئر کرنے کے کام آتا ہے۔ LAN, MAN اور WAN نیٹ ورک کی وسعت کی بنیادی اقسام ہیں۔ نیٹ ورک ٹوپولوجیز کمپیوٹرز کی باہمی فزیکل لے آؤٹ کو ظاہر کرتی ہیں۔',
        keyPoints: [
          'سٹار ٹوپولوجی (Star Topology) میں تمام نوڈز مرکزی سوئچ یا ہب سے جڑی ہوتی ہیں، یہ سب سے زیادہ استعمال ہونے والی ٹوپولوجی ہے۔',
          'بس ٹوپولوجی (Bus Topology) میں ایک سنگل کیبل بیک بون کے طور پر کام کرتی ہے اور سروں پر ٹرمینیٹرز لگے ہوتے ہیں۔',
          'او ایس آئی ماڈل (OSI 7-Layers): فزیکل، ڈیٹا لنک، نیٹ ورک، ٹرانسپورٹ، سیشن، پریزنٹیشن اور ایپلیکیشن لیئر۔',
        ],
        boardQuestions: [
          {
            question: 'سٹار اور بس ٹوپولوجی کا موازنہ کریں۔ (Compare Star vs Bus Topology)',
            answer: 'سٹار ٹوپولوجی زیادہ قابل اعتماد ہے کیونکہ ایک کیبل ٹوٹنے پر بقیہ نیٹ ورک چلتا رہتا ہے۔ بس ٹوپولوجی میں بیک بون کیبل خراب ہونے سے پورا نیٹ ورک معطل ہو جاتا ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'او ایس آئی (OSI) ماڈل کی تمام 7 پرتوں کے نام ترتیب سے لکھیں۔',
            answer: '1. Physical 2. Data Link 3. Network 4. Transport 5. Session 6. Presentation 7. Application Layer.',
            marks: 2,
            type: 'short',
          },
        ],
      },
      {
        chapterNum: 4,
        title: 'Problem Solving & Python Programming',
        urduTitle: 'باب چہارم: مسئلہ حل کرنے کے مراحل اور پائتھن پروگرامنگ (Python)',
        pagesRange: 'Pages 95-145',
        pageStart: 95,
        pageEnd: 145,
        summary: 'پروگرامنگ کمپیوٹر سے مسائل حل کروانے کا عمل ہے۔ پائتھن (Python) جدید ترین ہائی لیول پروگرامنگ زبان ہے جس کا سینٹیکس پڑھنے میں آسان اور سیدھا ہے۔ اس میں ویری ایبلز، کنڈیشنل اسٹیٹمنٹس (if-elif-else) اور لوپس (for, while) پروگرام کے فلو کو کنٹرول کرتے ہیں۔',
        keyPoints: [
          'الگورتھم کسی مسئلے کو حل کرنے کی مرحلہ وار تحریری ترکیب ہے۔',
          'فلو چارٹ الگورتھم کی تصویری اور ہندسی اشکال کے ذریعے نمائندگی ہے۔',
          'پائتھن ایک انٹرپریٹڈ زبان ہے جس میں متغیر کی قسم خودکار طور پر متعین ہوتی ہے۔',
          'انٹرپرینیورشپ میں پروگرامنگ اور سافٹ ویئر ڈویلپمنٹ جدید فری لانسنگ اور آئی ٹی اسٹارٹ اپس کی بنیاد ہے۔',
        ],
        boardQuestions: [
          {
            question: 'الگورتھم اور فلو چارٹ میں کیا فرق ہے؟',
            answer: 'الگورتھم مرحلہ وار متن پر مبنی ہدایات ہیں، جبکہ فلو چارٹ اسی مسئلے کی تصویری اور سمبولک نمائندگی ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            question: 'پائتھن میں print() اور input() کے افعال بیان کریں۔',
            answer: 'print() نتائج اسکرین پر ظاہر کرنے کے لیے استعمال ہوتا ہے، جبکہ input() کی بورڈ سے صارف کا ڈیٹا حاصل کرتا ہے۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
    ],
  },
  'FAIT-ECO-11': {
    bookId: 'book_henza_09',
    bookTitle: 'Principles of Economics (Part-1)',
    urduBookTitle: 'اصولِ معاشیات 11 (علمی کتاب خانہ — پروفیسر حبیب اللہ قریشی)',
    author: 'پروفیسر حبیب اللہ قریشی (سابق صدر شعبہ معاشیات، گورنمنٹ ایم اے او کالج لاہور)',
    totalPages: 240,
    coverUrl: '/covers/cover_economics.jpg',
    pdfFileName: 'principles_of_economics_11_qureshi.pdf',
    subjectCode: 'FAIT-ECO-11',
    chapters: [
      {
        chapterNum: 1,
        title: 'Nature and Scope of Economics',
        urduTitle: 'باب اول: معاشیات کی نوعیت، وسعت اور تعریفات',
        pagesRange: 'Pages 1-35',
        pageStart: 1,
        pageEnd: 35,
        summary: 'معاشیات انسان کی معاشی سرگرمیوں، پیدائش دولت اور لامحدود خواہشات کے محدود ذرائع سے تسکین کا نام ہے۔ ایڈم سمتھ نے معاشیات کو علم دولت، الفریڈ مارشل نے مادی فلاح و بہبود، اور لیونل رابنز نے نایاب ذرائع اور متبادل استعمال کا علم قرار دیا۔',
        keyPoints: [
          'ایڈم سمتھ (1776): معاشیات دولت کی پیدائش، تقسیم، تبادلہ اور صرف کا علم ہے۔',
          'الفریڈ مارشل (1890): معاشیات روزمرہ زندگی کے ان معاملات کا جائزہ ہے جو انسان کی مادی خوشحالی سے متعلق ہیں۔',
          'لیونل رابنز (1932): انسانی مقاصد اور لامحدود خواہشات بمقابلہ محدود و متبادل ذرائع کا معاشی تجزیہ۔',
          'مائیکرو اکنامکس انفرادی اکائیوں جبکہ میکرو اکنامکس قومی معیشت کا مطالعہ کرتی ہے۔',
        ],
        boardQuestions: [
          {
            question: 'الفریڈ مارشل اور رابنز کی تعریفات کا تقابلی جائزہ پیش کریں۔',
            answer: 'مارشل کی تعریف مادی فلاح پر مبنی ہے جبکہ رابنز کی تعریف سائنسی، غیر جانبدار اور محدود وسائل کے انتخاب پر مشتمل ہے۔',
            marks: 4,
            type: 'short',
          },
          {
            question: 'جزوی معاشیات (Microeconomics) اور کلی معاشیات (Macroeconomics) میں فرق بیان کریں۔',
            answer: 'جزوی معاشیات انفرادی صارف یا فرم کا جائزہ لیتی ہے جبکہ کلی معاشیات قومی آمدنی، کل روزگار اور مجموعی قیمتوں کی سطح کا احاطہ کرتی ہے۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
      {
        chapterNum: 2,
        title: 'Consumer Behavior & Theory of Utility',
        urduTitle: 'باب دوم: صارف کا معاشی رویہ اور نظریہ افادہ',
        pagesRange: 'Pages 36-75',
        pageStart: 36,
        pageEnd: 75,
        summary: 'افادہ کسی شے کی وہ خاصیت ہے جو انسانی ضرورت کو تسکین دیتی ہے۔ قانونِ تقلیلِ افادہِ مختتم کے مطابق کسی شے کی لگاتار اکائیاں استعمال کرنے سے ہر اضافی اکائی سے حاصل ہونے والا مختتم افادہ گھٹتا چلا جاتا ہے تاوقتیکہ وہ صفر (نقطہ سیری) ہو جائے۔',
        keyPoints: [
          'ابتدائی افادہ، کل افادہ (Total Utility) اور مختتم افادہ (Marginal Utility) کا تعلق۔',
          'جب مختتم افادہ صفر ہوتا ہے تو کل افادہ زیادہ سے زیادہ (Maximum) ہوتا ہے۔',
          'قانون تقلیل افادہ مختتم کے مفروضات: شے کی نوعیت یکساں ہو، مقدار مناسب ہو، اور استعمال مسلسل ہو۔',
          'قانون مساوی افادہ مختتم صارف کے توازن اور تسکین کو زیادہ سے زیادہ بنانے کا سنہری اصول ہے۔',
        ],
        boardQuestions: [
          {
            question: 'قانون تقلیل افادہ مختتم کا گوشوارہ اور ڈایاگرام کے ذریعے وضاحت کریں۔',
            answer: 'گوشوارے میں اکائیوں کے اضافے کے ساتھ مختتم افادہ 10 سے گھٹ کر 0 اور منفی کی طرف جائے گا، جس کا خط نیچے کی طرف جھکتا ہے۔',
            marks: 8,
            type: 'long',
          },
          {
            question: 'نقطہ سیری (Point of Satiety) سے کیا مراد ہے؟',
            answer: 'وہ مقام جہاں کل افادہ بلند ترین سطح پر پہنچ جاتا ہے اور مختتم افادہ صفر ہو جاتا ہے، نقطہ سیری کہلاتا ہے۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
      {
        chapterNum: 3,
        title: 'Laws of Demand and Supply',
        urduTitle: 'باب سوم: قوانین طلب، رسد اور مارکیٹ توازن',
        pagesRange: 'Pages 76-125',
        pageStart: 76,
        pageEnd: 125,
        summary: 'قانون طلب کے مطابق اگر دیگر حالات بدستور رہیں تو شے کی قیمت بڑھنے سے طلب گھٹ جاتی ہے اور قیمت کم ہونے سے طلب بڑھ جاتی ہے۔ طلب اور رسد کے باہمی تعامل سے جس قیمت پر طلب اور رسد برابر ہو جائیں، وہ توازن قیمت (Equilibrium Price) کہلاتی ہے۔',
        keyPoints: [
          'قانون طلب کا خط بائیں سے دائیں نیچے کی جانب جھکتا ہے۔',
          'طلب کی لچک (Elasticity of Demand): اکائی کے برابر، اکائی سے زیادہ اور اکائی سے کم۔',
          'رسد کا مفہوم: شے کی وہ مقدار جو بیچنے والے دی گئی قیمت پر فروخت کے لیے پیش کرتے ہیں۔',
          'توازن قیمت: مارکیٹ کا وہ نقطہ جہاں طلب اور رسد کی لکیریں ایک دوسرے کو قطع کرتی ہیں۔',
        ],
        boardQuestions: [
          {
            question: 'قانون طلب کے منفی جھکاؤ کی چار بنیادی وجوہات بیان کریں۔',
            answer: '1. قانون تقلیل افادہ مختتم 2. آمدنی کا اثر 3. متبادل اشیاء کا اثر 4. نئے صارفین کا داخلہ۔',
            marks: 4,
            type: 'short',
          },
          {
            question: 'توازن قیمت کا تعین ڈایاگرام کے ذریعے واضح کریں۔',
            answer: 'جہاں خط طلب (DD) اور خط رسد (SS) ایک دوسرے کو نقطہ E پر قطع کرتے ہیں، وہاں توازن قیمت P اور توازن مقدار Q قائم ہوتی ہے۔',
            marks: 8,
            type: 'long',
          },
        ],
      },
    ],
  },
};

// Helper function to resolve textbook info from a test or task item
export function getTextbookDetailsForTest(params: {
  subjectCode?: string;
  subjectName?: string;
  title?: string;
  syllabusCoverage?: string;
}) {
  const code = params.subjectCode || '';
  const sName = (params.subjectName || '').toLowerCase();
  const title = params.title || '';

  let matchedKey = 'FAIT-URD-11';
  if (code.includes('PED') || sName.includes('physical')) {
    matchedKey = 'FAIT-PED-11';
  } else if (code.includes('ECO') || sName.includes('economic') || title.includes('Economics') || title.includes('معاشیات')) {
    matchedKey = 'FAIT-ECO-11';
  } else if (code.includes('CSC') || sName.includes('computer') || title.includes('Computer') || title.includes('کمپیوٹر') || title.includes('Python')) {
    matchedKey = 'FAIT-CSC-11';
  } else if (code.includes('URD') || sName.includes('urdu') || title.includes('اُردو') || title.includes('سرمایہ')) {
    matchedKey = 'FAIT-URD-11';
  } else if (code.includes('ENG') || sName.includes('english') || title.includes('English') || title.includes('Sunshine')) {
    matchedKey = 'FAIT-ENG-11';
  } else if (code.includes('TQM') || sName.includes('quran') || title.includes('ترجمۃ القرآن')) {
    matchedKey = 'FAIT-TQM-11';
  } else if (code.includes('ISL') || sName.includes('islam') || title.includes('اسلامیات')) {
    matchedKey = 'FAIT-ISL-11';
  } else if (code.includes('REV') || sName.includes('revision') || title.includes('جائزہ')) {
    matchedKey = 'FAIT-URD-11'; // defaults to primary language
  }

  const bookData = TEXTBOOK_KNOWLEDGE_BASE[matchedKey] || TEXTBOOK_KNOWLEDGE_BASE['FAIT-CSC-11'];
  const chapter = bookData.chapters[0];

  return {
    bookData,
    chapter,
    matchedKey,
  };
}
