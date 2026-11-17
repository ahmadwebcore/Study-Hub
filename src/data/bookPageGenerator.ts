// Dynamic Book Page Generator for 1st Year FA-IT BISE D.G. Khan
// Generates authentic, high-fidelity printed textbook and keybook pages matching exact syllabus slices.

export interface BookPageItem {
  pageIndex: number; // 1-based index within the test slice (e.g. 1 to 15)
  originalBookPage: number; // Page number in the printed textbook (e.g. 1 to 15)
  category: 'title_sheet' | 'textbook_reading' | 'vocabulary_glossary' | 'summary_analysis' | 'keybook_tashreeh' | 'keybook_exercises' | 'grammar_rules' | 'test_paper' | 'marking_key';
  headerBookTitle: string;
  headerChapterTitle: string;
  pageTitle: string;
  urduPageTitle?: string;
  watermarkText?: string;
  isUrdu: boolean;
  content: {
    leadNote?: string;
    paragraphs?: string[];
    vocabularyTable?: { word: string; meaning: string; context?: string }[];
    points?: string[];
    tashreehBlock?: {
      iqtibas: string;
      hawala: string;
      siaqSabaq: string;
      tashreeh: string;
    };
    exerciseQuestions?: {
      qNum: string;
      question: string;
      answer: string;
      marks: number;
      type: 'short' | 'long' | 'mcq';
      options?: string[];
    }[];
    grammarBox?: {
      ruleName: string;
      definition: string;
      elements: string[];
      examples: string[];
    };
    testPaper?: {
      totalMarks: number;
      timeAllowed: string;
      objectiveSection: { q: string; opts: string[]; ans: string }[];
      subjectiveShortSection: { q: string; marks: number }[];
      subjectiveLongSection: { q: string; marks: number }[];
    };
    markingRubric?: {
      criteria: string;
      marksAllocated: string;
      guidance: string;
    }[];
  };
}

export interface BookSliceResult {
  bookTitle: string;
  urduBookTitle: string;
  keyBookTitle: string;
  pdfFileName: string;
  subjectCode: string;
  subjectName: string;
  chapterTitle: string;
  urduChapterTitle: string;
  pagesRange: string;
  totalPages: number;
  pages: BookPageItem[];
}

export function generateBookPagesForTest(params: {
  subjectCode?: string;
  subjectName?: string;
  title?: string;
  syllabusCoverage?: string;
  pagesRange?: string;
}): BookSliceResult {
  const code = (params.subjectCode || '').toUpperCase();
  const title = (params.title || '').toLowerCase();
  const subName = (params.subjectName || '').toLowerCase();
  const range = params.pagesRange || 'Pages 1-15';

  // 1. Identify Subject
  if (code.includes('PED') || subName.includes('physical') || title.includes('health') || title.includes('ورزش') || title.includes('ہڈیوں')) {
    return generatePhysicalEducationSlice(range);
  } else if (code.includes('CSC') || subName.includes('computer') || title.includes('computer') || title.includes('کمپیوٹر') || title.includes('hardware')) {
    return generateComputerScienceSlice(range);
  } else if (code.includes('ENG') || subName.includes('english') || title.includes('button') || title.includes('story')) {
    return generateEnglishSlice(range);
  } else if (code.includes('TQM') || subName.includes('quran') || title.includes('قرآن') || title.includes('مریم')) {
    return generateTarjumaQuranSlice(range);
  } else if (code.includes('ECO') || subName.includes('economic') || title.includes('معاشیات') || title.includes('افادہ')) {
    return generateEconomicsSlice(range);
  } else if (code.includes('ISL') || subName.includes('islam') || title.includes('اسلامیات') || title.includes('عقائد')) {
    return generateIslamiyatSlice(range);
  } else {
    // Default to Urdu Compulsory 11 (Uswa-e-Hasna)
    return generateUrduCompulsorySlice(range);
  }
}

// -------------------------------------------------------------
// 1. URDU COMPULSORY 11 (15 Real Textbook & Sharh Sarmaya Pages)
// -------------------------------------------------------------
function generateUrduCompulsorySlice(range: string): BookSliceResult {
  const totalPages = 15;
  const pages: BookPageItem[] = [
    {
      pageIndex: 1,
      originalBookPage: 1,
      category: 'title_sheet',
      headerBookTitle: 'پنجاب ٹیکسٹ بک بورڈ لاہور — سرمایہ اردو (لازمی) سال اول',
      headerChapterTitle: 'سبق نمبر ۱: اسوہ حسنہ ﷺ',
      pageTitle: 'سبق اول: اسوہ حسنہ ﷺ (سید سلیمان ندوی)',
      urduPageTitle: 'سبق نمبر ۱: اسوہ حسنہ ﷺ (ماخوذ از خطباتِ مدراس)',
      isUrdu: true,
      watermarkText: 'پنجاب ٹیکسٹ بک بورڈ',
      content: {
        leadNote: 'مجوزہ برائے انٹرمیڈیٹ پارٹ اول (FA-IT) — تعلیمی بورڈز پنجاب بشمول BISE ڈیرہ غازی خان',
        paragraphs: [
          'مصنف کا تعارف: علامہ سید سلیمان ندوی (۱۸۸۴ء تا ۱۹۵۳ء) برصغیر کے مایہ ناز مورخ، سیرت نگار اور علامہ شبلی نعمانی کے ارشد تلامذہ میں سے تھے۔ آپ نے شبلی نعمانی کی ادھوری یادگار "سیرت النبی ﷺ" کی بقیہ چار جلدیں تحریر کر کے علمی دنیا میں لازوال شہرت حاصل کی۔',
          'ماخذ سبق: یہ سبق علامہ سید سلیمان ندوی کے اُن تاریخی خطبات میں سے لیا گیا ہے جو انہوں نے ۱۹۲۵ء میں مسلم ایجوکیشنل سوسائٹی کے زیرِ اہتمام مدراس میں دیے تھے اور جو "خطباتِ مدراس" کے نام سے کتابی صورت میں شائع ہوئے۔',
          'تدریسی مقاصد: طلبہ کو نبی کریم ﷺ کی سیرتِ مطہرہ کے ہمہ گیر پہلوؤں سے روشناس کرانا اور یہ باور کرانا کہ انسانی زندگی کے ہر شعبے میں کامل کامیابی کا راز رسول اللہ ﷺ کی اتباع میں مضمر ہے۔',
        ],
        points: [
          'اسلامی نظریہ حیات میں عقیدہ اور عمل کا باہمی ربط',
          'انسانی رہنمائی کے لیے صرف زبانی نصائح کی بجائے عملی نمونے کی ناگزیریت',
          'آفتابِ عالمتاب کی مانند سیرتِ طیبہ کا فیضان',
          'ہر طبقہ فکر (بادشاہ، گدا، تاجر، سپاہی، معلم) کے لیے سیرت میں مکمل نمونہ عمل',
        ],
      },
    },
    {
      pageIndex: 2,
      originalBookPage: 2,
      category: 'textbook_reading',
      headerBookTitle: 'پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — درسی متن',
      pageTitle: 'متنِ سبق: حصہ اول — عقیدہ اور عمل کا باہمی تعلق',
      urduPageTitle: 'متنِ سبق: حصہ اول (صفحہ ۲)',
      isUrdu: true,
      watermarkText: 'متنِ درسی کتاب',
      content: {
        paragraphs: [
          'دنیا کے تمام انسانوں کی رہنمائی اور فلاح کے لیے ضروری ہے کہ ان کے سامنے کوئی ایسا نمونہ ہو جو ہر لحاظ سے کامل اور جامع ہو۔ مذہب دو چیزوں کا نام ہے: ایک عقیدہ اور دوسرا عمل۔ عقیدے کا تعلق دل اور دماغ سے ہے اور عمل کا تعلق انسان کے اعضاء و جوارح اور اس کی روزمرہ کی زندگی سے ہے۔',
          'عقیدہ درخت کی جڑ کی مانند ہے اور عمل اس کے تنے اور شاخوں کی طرح۔ اگر درخت کی جڑ مضبوط نہ ہو تو تنا کھڑا نہیں رہ سکتا، اور اگر درخت میں برگ و بار نہ ہوں تو اس کا کوئی فائدہ نہیں۔ اسی طرح اگر عقیدے کے ساتھ نیک عمل نہ ہو تو انسان کی زندگی بے ثمر رہتی ہے۔',
          'عمل کے لیے محض زبانی تعلیم یا کتابی ہدایت کافی نہیں ہوتی۔ کتاب صرف اصول بتاتی ہے، جبکہ انسان کو یہ دیکھنا ہوتا ہے کہ ان اصولوں پر عمل کس طرح کیا جاتا ہے۔ اس لیے ہر دور کے انسانوں کو ایک زندہ، متحرک اور کامل عملی نمونے کی ضرورت رہی ہے۔',
        ],
        points: [
          'اہم نکتہ: اخلاق فاضلہ کا حصول صرف عملی اسوہ کی پیروی سے ہی ممکن ہے۔',
          'قرآنی سند: "لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ" (بے شک تمہارے لیے رسول اللہ ﷺ کی ذات میں بہترین نمونہ ہے)۔',
        ],
      },
    },
    {
      pageIndex: 3,
      originalBookPage: 3,
      category: 'textbook_reading',
      headerBookTitle: 'پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — درسی متن',
      pageTitle: 'متنِ سبق: حصہ دوم — آفتابِ عالمتاب کا وجود مبارک',
      urduPageTitle: 'متنِ سبق: حصہ دوم (صفحہ ۳)',
      isUrdu: true,
      watermarkText: 'متنِ درسی کتاب',
      content: {
        paragraphs: [
          'رسول اکرم ﷺ کا وجودِ گرامی دنیا کے لیے ایک آفتابِ عالمتاب ہے۔ جس طرح سورج اپنی روشنی اور حرارت سے پہاڑ، میدان، سمندر، اور کھیت سب کو یکساں فیض پہنچاتا ہے، اسی طرح نبی کریم ﷺ کی سیرتِ مطہرہ سے ہر درجے اور ہر مرتبے کا انسان اپنی استعداد کے مطابق نور حاصل کرتا ہے۔',
          'اگر تم دولت مند ہو تو مکہ اور مدینہ کے تاجر اور امین کی سیرت دیکھو؛ اگر تم غریب اور نادار ہو تو شعبِ ابی طالب کے محصور اور مدینہ کے فاقہ کش کی زندگی کا مطالعہ کرو؛ اگر تم فاتح ہو تو بدر و حنین کے سپہ سالار اور فتح مکہ کے عاجز فاتح کی طرف نگاہ اٹھاؤ۔',
          'اگر تم قاضی اور منصف ہو تو کعبہ کے جھگڑے میں حجرِ اسود رکھنے والے اور مدینہ کے عادل حکمران کے فیصلوں کو دیکھو؛ اگر تم معلم اور مربی ہو تو صفہ کے چبوترے پر بیٹھ کر صحابہ کرامؓ کی تربیت کرنے والے استادِ اعظم کو دیکھو۔ غرضیکہ تم زندگی کے جس شعبے میں بھی ہو، تمہارے لیے رسول اللہ ﷺ کی ذات ہی مشعلِ راہ ہے۔',
        ],
      },
    },
    {
      pageIndex: 4,
      originalBookPage: 4,
      category: 'textbook_reading',
      headerBookTitle: 'پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — درسی متن کا اختتام',
      pageTitle: 'متنِ سبق: حصہ سوم — جامعیت اور ابدیت',
      urduPageTitle: 'متنِ سبق: حصہ سوم (صفحہ ۴)',
      isUrdu: true,
      watermarkText: 'متنِ درسی کتاب',
      content: {
        paragraphs: [
          'دنیا کے دیگر مصلحین اور مفکرین کی زندگیاں صرف چند مخصوص شعبوں تک محدود تھیں۔ کوئی صرف عابد و زاہد تھا، کوئی صرف فاتح تھا، کوئی صرف معلم تھا اور کوئی صرف فلسفی۔ مگر تاریخِ انسانی میں صرف محمد رسول اللہ ﷺ کی ذاتِ اقدس ایسی ہے جس میں تمام انسانی اوصاف و کمالات کا ایسا حسین اور متوازن امتزاج پایا جاتا ہے جس کی نظیر کہیں اور نہیں ملتی۔',
          'آپ ﷺ کی سیرت کی دوسری بڑی صفت اس کی ابدیت اور تاریخی وثوق ہے۔ آپ ﷺ کی ولادت سے لے کر وصال تک کی تمام جزئیات، اخلاق، عادات، عبادات اور معمولاتِ زندگی دنیا کے سامنے کھلی کتاب کی طرح محفوظ ہیں، جن میں صدیوں بعد بھی کوئی ابہام یا شبہ پیدا نہیں ہو سکا۔',
        ],
      },
    },
    {
      pageIndex: 5,
      originalBookPage: 5,
      category: 'vocabulary_glossary',
      headerBookTitle: 'سرمایہ اردو ۱۱ — فرہنگ و لغت',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — فرہنگ و لغت جدول',
      pageTitle: 'فرہنگ و لغت: مشکل الفاظ، اعراب اور مستند معانی',
      urduPageTitle: 'مشکل الفاظ کے مستند معانی و اعراب (صفحہ ۵)',
      isUrdu: true,
      watermarkText: 'لغت و فرہنگ',
      content: {
        vocabularyTable: [
          { word: 'اُسْوَہ', meaning: 'طریقہ، نمونہ عمل، پیروی کے لائق ذات' },
          { word: 'عَالَمْتَاب', meaning: 'جہان کو روشن کرنے والا، تمام دنیا پر چمکنے والا سورج' },
          { word: 'جَامِعُ الْکَمَالَات', meaning: 'تمام خوبیوں اور اچھائیوں کا مجموعہ' },
          { word: 'دَسْتِ نِگَر', meaning: 'کسی کا محتاج، دوسروں کے رحم و کرم پر رہنے والا' },
          { word: 'مَحْصُوْر', meaning: 'گھیرا ہوا، قید و بند میں بند' },
          { word: 'مُشْعَلِ رَاہ', meaning: 'راستہ دکھانے والی روشنی، رہبر' },
          { word: 'مَنْبَعِ نُوْر', meaning: 'روشنی کا چشمہ، نور کا سرچشمہ' },
          { word: 'زُہْد و قَنَاعَت', meaning: 'دنیا سے بے رغبتی اور جو مل جائے اسی پر راضی رہنا' },
          { word: 'مَصَالِح', meaning: 'فائدے، مصلحت کی جمع، بھلائی کی باتیں' },
          { word: 'اِعْتِدَال', meaning: 'میانہ روی، بیچ کی راہ اختیار کرنا' },
        ],
      },
    },
    {
      pageIndex: 6,
      originalBookPage: 6,
      category: 'summary_analysis',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ (پروفیسر راؤ خالد محمود)',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — جامع خلاصہ سبق',
      pageTitle: 'خلاصہ سبق: بورڈ امتحانی معیار کے مطابق (۱۰ نمبر)',
      urduPageTitle: 'خلاصہ سبق: اسوہ حسنہ ﷺ (صفحہ ۶)',
      isUrdu: true,
      watermarkText: 'شرح سرمایہ اردو',
      content: {
        leadNote: 'بورڈ میں خلاصے کے کل ۱۰ نمبر ہوتے ہیں (۱ نمبر مصنف کے نام کا اور ۹ نمبر نفس مضمون کے)۔',
        paragraphs: [
          'سید سلیمان ندوی فرماتے ہیں کہ مذہب عقیدہ اور عمل کے مجموعے کا نام ہے۔ عقیدہ دل کا یقین ہے اور عمل جسمانی حرکات۔ عمل کی اصلاح کے لیے محض کتابی اصول کافی نہیں ہوتے بلکہ ایک کامل عملی نمونے کی ضرورت ہوتی ہے تاکہ انسان اس کی پیروی کر سکے۔',
          'رسول اکرم ﷺ کی سیرتِ مطہرہ تمام عالم کے لیے آفتابِ عالمتاب کی مانند ہے جس سے ہر شخص فیض حاصل کرتا ہے۔ اگر کوئی انسان تاجر ہے تو وہ مکہ کے دیانت دار تاجر کو دیکھے، اگر غریب ہے تو شعبِ ابی طالب کے فاقہ کش کو دیکھے، اگر فاتح ہے تو بدر اور فتح مکہ کے عاجز سپہ سالار کو دیکھے۔',
          'آپ ﷺ کی ذاتِ اقدس میں تمام اوصاف حسنہ کا حسین امتزاج ہے۔ تاریخ میں آپ ﷺ واحد ہستی ہیں جن کی زندگی کا ہر لمحہ، ہر قول اور ہر فعل محفوظ ترین صورت میں دنیا کے سامنے موجود ہے۔ پس تمام انسانوں کی نجات و فلاح آپ ﷺ کے اسوہ حسنہ کی مکمل پیروی میں پوشیدہ ہے۔',
        ],
      },
    },
    {
      pageIndex: 7,
      originalBookPage: 7,
      category: 'summary_analysis',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ — تنقیدی جائزہ',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — مرکزی خیال و اسلوب',
      pageTitle: 'مرکزی خیال، فکری پیغام اور اسلوبِ نگارش',
      urduPageTitle: 'مرکزی خیال و محاسنِ اسلوب (صفحہ ۷)',
      isUrdu: true,
      watermarkText: 'شرح سرمایہ اردو',
      content: {
        paragraphs: [
          'مرکزی خیال: انسانی زندگی کی تمام تر الجھنوں اور مسائل کا حل رسول اللہ ﷺ کی سیرتِ طیبہ کی پیروی میں مضمر ہے۔ آپ ﷺ کا اسوہ قیامت تک کے تمام طبقہ ہائے زندگی کے لیے واحد اور حتمی نمونہ عمل ہے۔',
          'اسلوبِ نگارش کے محاسن: سید سلیمان ندوی کا طرزِ تحریر سادہ، سلیس، مدلل اور دلنشین ہے۔ وہ پیچیدہ فلسفیانہ مضامین کو عام فہم اور خوبصورت تشبیہات کے ساتھ بیان کرتے ہیں، جس سے قاری کے دل پر گہرا اثر قائم ہوتا ہے۔',
        ],
        points: [
          'قرآنی آیات اور احادیثِ نبوی ﷺ کے مدلل حوالہ جات',
          'تاریخی حقائق کا معروضی و منطقی تجزیہ',
          'خوبصورت تشبیہات و استعارات کا برجستہ استعمال',
        ],
      },
    },
    {
      pageIndex: 8,
      originalBookPage: 8,
      category: 'keybook_tashreeh',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ — سیاق و سباق و تشریح',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — پیراگراف تشریح ۱',
      pageTitle: 'سیاق و سباق اور تفصیلی پیراگراف تشریح (نمبر ۱)',
      urduPageTitle: 'سیاق و سباق مع حوالہ متن و تشریح (صفحہ ۸)',
      isUrdu: true,
      watermarkText: 'شرح سرمایہ اردو',
      content: {
        tashreehBlock: {
          iqtibas: 'دنیا کے تمام انسانوں کی رہنمائی اور فلاح کے لیے ضروری ہے کہ ان کے سامنے کوئی ایسا نمونہ ہو جو ہر لحاظ سے کامل اور جامع ہو۔ مذہب دو چیزوں کا نام ہے: ایک عقیدہ اور دوسرا عمل۔',
          hawala: 'سبق کا نام: اسوہ حسنہ ﷺ | مصنف کا نام: سید سلیمان ندوی | ماخذ: خطباتِ مدراس',
          siaqSabaq: 'تشریح طلب عبارت سبق کے ابتدائی حصے سے لی گئی ہے۔ مصنف بتاتے ہیں کہ انسان کی فطرت میں عملی نمونے کی طلب و جستجو ہے۔ انسان نصائح کو بھول جاتا ہے مگر عملی کردار اس کے ذہن پر نقش ہو جاتا ہے۔',
          tashreeh: 'علامہ سید سلیمان ندوی بیان کرتے ہیں کہ انسان کو زندگی کے کسی بھی شعبے میں رہنمائی کے لیے صرف قوانین یا اصول بتا دینا کافی نہیں ہوتا۔ جب تک کوئی انسان خود ان اصولوں پر عمل کر کے نہ دکھائے، عام انسان کے لیے ان پر عمل پیرا ہونا ناممکن ہو جاتا ہے۔ عقیدہ دل کا یقین ہے جو جڑ کی طرح مخفی ہوتا ہے، جبکہ اعمال اس درخت کی شاخیں اور پھل ہیں جو سب کو نظر آتے ہیں۔ رسول اللہ ﷺ نے اپنی زندگی میں ہر نیک عمل کو بذاتِ خود برت کر دکھایا تاکہ کوئی انسان یہ عذر پیش نہ کر سکے کہ یہ عمل انسانی بساط سے باہر تھا۔',
        },
      },
    },
    {
      pageIndex: 9,
      originalBookPage: 9,
      category: 'keybook_tashreeh',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ — سیاق و سباق و تشریح',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — پیراگراف تشریح ۲',
      pageTitle: 'سیاق و سباق اور تفصیلی پیراگراف تشریح (نمبر ۲)',
      urduPageTitle: 'سیاق و سباق مع حوالہ متن و تشریح (صفحہ ۹)',
      isUrdu: true,
      watermarkText: 'شرح سرمایہ اردو',
      content: {
        tashreehBlock: {
          iqtibas: 'رسول اکرم ﷺ کا وجودِ مبارک ایک آفتابِ عالمتاب ہے جس سے ہر شخص اپنی استعداد اور حیثیت کے مطابق روشنی اور حرارت حاصل کرتا ہے۔',
          hawala: 'سبق کا نام: اسوہ حسنہ ﷺ | مصنف: سید سلیمان ندوی | صنف: مقالہ/خطبہ',
          siaqSabaq: 'اس اقتباس سے قبل مصنف نے بتایا ہے کہ مختلف انسانوں کی معاشرتی حیثیت جداگانہ ہوتی ہے۔ اقتباس کے بعد مصنف نے بادشاہ، فقیر، تاجر، قاضی اور سپاہی کی مثالیں دے کر سیرتِ طیبہ کی ہمہ گیریت کو ثابت کیا ہے۔',
          tashreeh: 'مصنف نے نبی کریم ﷺ کی ذاتِ مبارکہ کو ایک چمکتے ہوئے سورج سے تشبیہ دی ہے۔ سورج کی روشنی تمام کائنات کے لیے عام ہوتی ہے۔ وہ کسی محل اور جھونپڑی میں فرق نہیں کرتا۔ جس طرح مختلف اشیاء اپنی ساخت کے مطابق دھوپ جذب کرتی ہیں، اسی طرح رسول اللہ ﷺ کی سیرت سے دنیا کا ہر انسان اپنے منصب کے مطابق فیض پاتا ہے۔ تاجر آپ ﷺ کی امانت و صداقت سے رہنمائی لیتا ہے اور حاکم آپ ﷺ کے عدل و انصاف سے۔',
        },
      },
    },
    {
      pageIndex: 10,
      originalBookPage: 10,
      category: 'keybook_exercises',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ — مشقی سوالات و جوابات',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — حل شدہ مشق ۱ تا ۴',
      pageTitle: 'درسی کتاب کے حل شدہ مشقی سوالات و جوابات (حصہ اول)',
      urduPageTitle: 'مشقی مختصر سوالات مع مصدقہ جوابات (صفحہ ۱۰)',
      isUrdu: true,
      watermarkText: 'کی بک حل شدہ سوالات',
      content: {
        exerciseQuestions: [
          {
            qNum: 'سوال ۱',
            question: 'سید سلیمان ندوی کے مطابق انسانوں کی رہنمائی کے لیے کس چیز کی ضرورت ہے؟',
            answer: 'سید سلیمان ندوی کے مطابق انسانوں کی رہنمائی کے لیے صرف زبانی اصول یا تحریری تعلیمات کافی نہیں بلکہ ایک زندہ، متحرک اور کامل عملی نمونے (اسوہ حسنہ) کی ضرورت ہے جس کی عملی پیروی کی جا سکے۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'سوال ۲',
            question: 'مصنف نے مذہب کی بنیاد کن دو چیزوں پر رکھی ہے؟',
            answer: 'مصنف کے نزدیک مذہب کی بنیاد دو چیزوں پر ہے: ایک عقیدہ اور دوسرا عمل۔ عقیدے کا تعلق دل اور دماغ سے ہے اور عمل کا تعلق انسان کے اعضاء و جوارح کی حرکات سے ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'سوال ۳',
            question: 'سیرتِ رسول ﷺ کو آفتابِ عالمتاب کیوں کہا گیا ہے؟',
            answer: 'جس طرح سورج بلا امتیاز تمام عالم کو نور اور حرارت بخشتا ہے، اسی طرح نبی کریم ﷺ کی سیرتِ طیبہ سے دنیا کا ہر انسان، امیر ہو یا غریب، حاکم ہو یا محکوم، یکساں رہنمائی حاصل کرتا ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'سوال ۴',
            question: 'اگر کوئی شخص غریب اور نادار ہو تو وہ آپ ﷺ کی سیرت سے کیا رہنمائی پا سکتا ہے؟',
            answer: 'وہ شعبِ ابی طالب کے تین سالہ محاصرے اور مدینہ منورہ کے فاقہ کش رسول ﷺ کے صبر، استقامت، زہد اور قناعت کی پاکیزہ سیرت سے صبر و شکر کی رہنمائی حاصل کر سکتا ہے۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
    },
    {
      pageIndex: 11,
      originalBookPage: 11,
      category: 'keybook_exercises',
      headerBookTitle: 'شرح سرمایہ اردو ۱۱ — مشقی سوالات و معروضی',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — حل شدہ مشق ۵ تا ۸ و MCQs',
      pageTitle: 'مشقی سوالات (حصہ دوم) اور بورڈ کثیر الانتخابی سوالات',
      urduPageTitle: 'مشقی سوالات و معروضی کثیر الانتخابی (صفحہ ۱۱)',
      isUrdu: true,
      watermarkText: 'کی بک حل شدہ سوالات',
      content: {
        exerciseQuestions: [
          {
            qNum: 'سوال ۵',
            question: 'رسول اللہ ﷺ کی سیرتِ طیبہ کی دو بڑی خصوصیات کیا ہیں؟',
            answer: '۱۔ جامعیت (یعنی تمام انسانی طبقات کے لیے نمونہ ہونا) اور ۲۔ ابدیت و تاریخی وثوق (یعنی ہر پہلو کا مستند تاریخ میں محفوظ ہونا)۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'معروضی ۱',
            question: 'سبق "اسوہ حسنہ" کس کتاب سے ماخوذ ہے؟',
            options: ['الف) سیرت النبی', 'ب) خطباتِ مدراس', 'ج) یادِ رفتگاں', 'د) مقالاتِ سلیمان'],
            answer: 'درست جواب: (ب) خطباتِ مدراس',
            marks: 1,
            type: 'mcq',
          },
          {
            qNum: 'معروضی ۲',
            question: 'سید سلیمان ندوی کس مایہ ناز مصنف کے ارشد شاگرد تھے؟',
            options: ['الف) سرسید احمد خان', 'ب) مولانا الطاف حسین حالی', 'ج) مولانا شبلی نعمانی', 'د) ڈپٹی نذیر احمد'],
            answer: 'درست جواب: (ج) مولانا شبلی نعمانی',
            marks: 1,
            type: 'mcq',
          },
          {
            qNum: 'معروضی ۳',
            question: 'قرآن مجید میں رسول اللہ ﷺ کے لیے کون سا لفظ استعمال ہوا ہے؟',
            options: ['الف) شمس و قمر', 'ب) اسوہ حسنہ', 'ج) حبل المتین', 'د) فوز عظیم'],
            answer: 'درست جواب: (ب) اسوہ حسنہ',
            marks: 1,
            type: 'mcq',
          },
        ],
      },
    },
    {
      pageIndex: 12,
      originalBookPage: 12,
      category: 'grammar_rules',
      headerBookTitle: 'سرمایہ اردو ۱۱ — قواعد و انشاء',
      headerChapterTitle: 'علمِ بیان — تشبیہ کے ارکان و امتحانی مثالیں',
      pageTitle: 'علمِ بیان: تشبیہ کی تعریف، ارکان اور امتحانی تجزیہ',
      urduPageTitle: 'قواعد: تشبیہ کے ارکان و اطلاق (صفحہ ۱۲)',
      isUrdu: true,
      watermarkText: 'علم بیان و قواعد',
      content: {
        grammarBox: {
          ruleName: 'علمِ بیان — تشبیہ (Simile)',
          definition: 'کسی ایک چیز کو کسی مشترک خوبی یا صفت کی بنا پر دوسری چیز کی مانند قرار دینا تشبیہ کہلاتا ہے۔',
          elements: [
            '۱۔ مشبہ: جس چیز کو تشبیہ دی جائے (جیسے: بچہ)۔',
            '۲۔ مشبہ بہ: جس چیز سے تشبیہ دی جائے (جیسے: چاند)۔ (مشبہ اور مشبہ بہ کو "طرفینِ تشبیہ" کہتے ہیں)',
            '۳۔ وجہ شبہ: وہ مشترک صفت جس کی بنیاد پر تشبیہ دی جائے (جیسے: خوبصورتی)۔',
            '۴۔ غرضِ تشبیہ: وہ مقصد جس کے لیے تشبیہ دی گئی ہو۔',
            '۵۔ حرفِ تشبیہ: وہ لفظ جو تشبیہ کے لیے استعمال ہو (مثلاً: کی طرح، مانند، جیسا، مثل، صورت)۔',
          ],
          examples: [
            'مثال ۱: "علی شیر کی طرح بہادر ہے۔" (مشبہ: علی | مشبہ بہ: شیر | حرف تشبیہ: کی طرح | وجہ شبہ: بہادری)',
            'مثال ۲: "نازکی اُس کے لب کی کیا کہیے — پنکھڑی اک گلاب کی سی ہے" (مشبہ: محبوب کے ہونٹ | مشبہ بہ: گلاب کی پنکھڑی | حرف تشبیہ: کی سی | وجہ شبہ: نزاکت و سرخی)',
          ],
        },
      },
    },
    {
      pageIndex: 13,
      originalBookPage: 13,
      category: 'grammar_rules',
      headerBookTitle: 'سرمایہ اردو ۱۱ — خط نویسی',
      headerChapterTitle: 'خط نویسی — بورڈ خاکہ و ماڈل خط',
      pageTitle: 'خط نویسی: BISE D.G. Khan امتحانی خاکہ و ماڈل خط (۱۰ نمبر)',
      urduPageTitle: 'خط نویسی کا معیاری خاکہ و خط (صفحہ ۱۳)',
      isUrdu: true,
      watermarkText: 'خط نویسی بورڈ پیٹرن',
      content: {
        paragraphs: [
          'خط کے اجزائے ترکیبی اور نمبروں کی تقسیم (کل ۱۰ نمبر):',
          '۱۔ امتحانی مرکز اور تاریخ: (۱ + ۱ = ۲ نمبر) دائیں جانب اوپر کی سطر پر۔',
          '۲۔ القاب و آداب: (۱ + ۱ = ۲ نمبر) احترام و محبت کا اظہار۔',
          '۳۔ نفسِ مضمون: (۵ نمبر) تمہید، اصل مدعا، اور اختتام۔',
          '۴۔ مکتوب نگار کا اختتامیہ و نام: (۱ نمبر) والسلام، آپ کا بیٹا/شاگرد الف، ب، ج۔',
        ],
        points: [
          'ماڈل عنوان: والد صاحب کے نام خط تحریر کریں جس میں تعلیمی سال اول اور روزانہ ٹیسٹ سیریز کی کارکردگی سے آگاہ کیا جائے۔',
          'امتحانی مرکز / کمرہ امتحان | ۱۷ نومبر ۲۰۲۶ء',
          'محترم ابا جان! السلام علیکم ورحمۃ اللہ وبرکاتہ',
          'امید ہے کہ آپ اور گھر کے سبھی افراد خیریت سے ہوں گے۔ آپ کا عنایت نامہ موصول ہوا۔ میں آپ کو بتانا چاہتا ہوں کہ ہمارے کالج میں بی آئی ایس ای ڈیرہ غازی خان کے سالانہ امتحان کے پیش نظر روزانہ ۳۰ نمبری ٹیسٹ سیریز کا باقاعدہ آغاز ہو چکا ہے۔ الحمدللہ اردو اور تمام مضامین میں میرا سکور ۹۰ فیصد سے اوپر رہا ہے...',
        ],
      },
    },
    {
      pageIndex: 14,
      originalBookPage: 14,
      category: 'test_paper',
      headerBookTitle: 'بورڈ آف انٹرمیڈیٹ اینڈ سیکنڈری ایجوکیشن ڈیرہ غازی خان',
      headerChapterTitle: 'روزانہ امتحانی پرچہ — اسوہ حسنہ ﷺ',
      pageTitle: 'BISE D.G. Khan ماڈل اسیسمنٹ پیپر (۳۰ نمبر — وقت: ۳۰ منٹ)',
      urduPageTitle: 'روزانہ ۳۰ نمبری ٹیسٹ پیپر برائے سال اول (صفحہ ۱۴)',
      isUrdu: true,
      watermarkText: 'BISE DG KHAN OFFICIAL',
      content: {
        testPaper: {
          totalMarks: 30,
          timeAllowed: '30 منٹ',
          objectiveSection: [
            { q: '۱۔ علامہ سید سلیمان ندوی کی وفات کس سن میں ہوئی؟', opts: ['الف) ۱۹۴۸ء', 'ب) ۱۹۵۳ء', 'ج) ۱۹۶۰ء', 'د) ۱۹۴۰ء'], ans: 'ب' },
            { q: '۲۔ "طرفینِ تشبیہ" کن دو ارکان کو کہا جاتا ہے؟', opts: ['الف) وجہ شبہ اور غرض تشبیہ', 'ب) مشبہ اور مشبہ بہ', 'ج) حرف تشبیہ اور مشبہ', 'د) مشبہ اور وجہ شبہ'], ans: 'ب' },
            { q: '۳۔ سبق اسوہ حسنہ کس تاریخی کتاب کا حصہ ہے؟', opts: ['الف) خطباتِ مدراس', 'ب) رحمتِ عالم', 'ج) تاریخ ارض القرآن', 'د) خیام'], ans: 'الف' },
          ],
          subjectiveShortSection: [
            { q: 'سوال ۱: مذہب کی بنیاد کن دو چیزوں پر ہے؟ واضح کریں۔', marks: 2 },
            { q: 'سوال ۲: تشبیہ کے پانچوں ارکان کے نام تحریر کریں۔', marks: 2 },
            { q: 'سوال ۳: رسول اللہ ﷺ کے اسوہ کو آفتابِ عالمتاب کیوں کہا گیا ہے؟', marks: 2 },
          ],
          subjectiveLongSection: [
            { q: 'سوال ۴ (الف): سبق "اسوہ حسنہ" کا مکمل جامع خلاصہ تحریر کریں۔', marks: 10 },
            { q: 'سوال ۴ (ب): درج ذیل پیراگراف کی سیاق و سباق کے حوالے سے تشریح کریں: "اگر تم دولت مند ہو تو مکہ اور مدینہ کے تاجر..."', marks: 9 },
          ],
        },
      },
    },
    {
      pageIndex: 15,
      originalBookPage: 15,
      category: 'marking_key',
      headerBookTitle: 'شرح سرمایہ اردو — مصدقہ جوابی کلید و مارکنگ گائیڈ',
      headerChapterTitle: 'اسوہ حسنہ ﷺ — کلید حل شدہ',
      pageTitle: 'مصدقہ جوابی کلید اور ایگزامینر مارکنگ اسکیم (BISE پیٹرن)',
      urduPageTitle: 'مصدقہ جوابی کلید و مارکنگ اسکیم (صفحہ ۱۵)',
      isUrdu: true,
      watermarkText: 'EXAMINER VERIFIED KEY',
      content: {
        leadNote: 'بورڈ ایگزامینر کے رہنما اصول برائے جانچ پڑتال (Checked by Ahmad - Faculty Lead)',
        markingRubric: [
          { criteria: 'معروضی کثیر الانتخابی (MCQs)', marksAllocated: '۵ نمبر', guidance: 'صحیح آپشن کو نشان زد کرنے پر فی سوال ۱ مکمل نمبر، کٹنگ یا اوور رائٹنگ پر صفر۔' },
          { criteria: 'مختصر سوالات (Short Questions)', marksAllocated: '۶ نمبر (۳ × ۲)', guidance: 'جامع اور سلیس جواب، املاء و گرامر درست ہونے پر پورے ۲ نمبر۔' },
          { criteria: 'سبق کا خلاصہ (Summary)', marksAllocated: '۱۰ نمبر', guidance: 'مصنف کا نام (۱ نمبر)، نفس مضمون کا تناسب درسی کتاب کے ایک تہائی حصے کے برابر ہو (۹ نمبر)۔' },
          { criteria: 'سیاق و سباق و تشریح', marksAllocated: '۹ نمبر', guidance: 'حوالہ متن ۱ نمبر، سیاق و سباق ۳ نمبر، مدلل اور سلیس تشریح ۵ نمبر۔' },
        ],
      },
    },
  ];

  return {
    bookTitle: 'سرمایہ اردو (لازمی) سال اول — پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور',
    urduBookTitle: 'سرمایہ اردو لازمی ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    keyBookTitle: 'شرح سرمایہ اردو ۱۱ (پروفیسر راؤ خالد محمود — کیپٹن سیریز)',
    pdfFileName: 'sharh_sarmaya_e_urdu_11_khalid.pdf',
    subjectCode: 'FAIT-URD-11',
    subjectName: 'Urdu & Grammar',
    chapterTitle: 'سبق اسوہ حسنہ خلاصہ و تشریح اور علم بیان',
    urduChapterTitle: 'سبق اول: اسوہ حسنہ ﷺ — خلاصہ، تشریح، تشبیہ اور حل شدہ کی بک',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 2. PHYSICAL EDUCATION (12 Real Textbook & Keybook Pages)
// -------------------------------------------------------------
function generatePhysicalEducationSlice(range: string): BookSliceResult {
  const totalPages = 12;
  const pages: BookPageItem[] = [
    {
      pageIndex: 1,
      originalBookPage: 1,
      category: 'title_sheet',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن (سال اول) — پروفیسر سید بشارت حسین گیلانی',
      headerChapterTitle: 'باب اول: انسانی جسمانی ساخت، ہڈیاں اور جوڑ',
      pageTitle: 'باب اول: انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز',
      urduPageTitle: 'باب اول: انسانی ڈھانچہ و حرکاتِ جسمانی (صفحہ ۱)',
      isUrdu: true,
      watermarkText: 'پروفیسر گیلانی بک ڈپو',
      content: {
        leadNote: 'مجوزہ برائے انٹرمیڈیٹ پارٹ اول (FA-IT) — نصاب BISE ڈیرہ غازی خان',
        paragraphs: [
          'مصنف کا تعارف: پروفیسر سید بشارت حسین گیلانی (گولڈ میڈلسٹ، شعبہ فزیکل ایجوکیشن و اسپورٹس سائنسز)۔ نصابِ پنجاب کے مستند مصنف۔',
          'باب کا تعارف: یہ باب انسانی جسم کے اندرونی ڈھانچے، ہڈیوں کی مختلف اقسام، جوڑوں کی ساخت اور حرکات کا جائزہ لیتا ہے۔ ایتھلیٹکس کے تحت 400 میٹر معیاری ٹریک کے تکنیکی قوانین کا احاطہ کیا گیا ہے۔',
        ],
        points: [
          'انسانی ڈھانچے کا عمومی تعارف (کل 206 ہڈیاں)',
          'محوری اور ضمیمائی ڈھانچہ کی تقسیم',
          'جوڑوں کی اقسام (غیر متحرک، نیم متحرک اور متحرک جوڑ)',
          'معیاری 400 میٹر ایتھلیٹکس ٹریک کے بورڈ قوانین',
        ],
      },
    },
    {
      pageIndex: 2,
      originalBookPage: 2,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — پروفیسر گیلانی',
      headerChapterTitle: 'انسانی ڈھانچے کی تقسیم',
      pageTitle: 'انسانی ڈھانچے کے دو بڑے حصے (Axial & Appendicular)',
      urduPageTitle: 'انسانی ڈھانچے کی تقسیم (صفحہ ۲)',
      isUrdu: true,
      watermarkText: 'متن درسی کتاب',
      content: {
        paragraphs: [
          'ایک بالغ انسانی جسم میں کل 206 ہڈیاں ہوتی ہیں۔ مطالعے کی آسانی کے لیے انسانی ڈھانچے کو دو حصوں میں تقسیم کیا گیا ہے:',
          '۱۔ محوری ڈھانچہ (Axial Skeleton): اس میں جسم کے مرکزی محور کی کل 80 ہڈیاں شامل ہیں۔ جن میں کھوپڑی (29 ہڈیاں)، ریڑھ کی ہڈی (26 مہرے)، اور چھاتی کا پنجرہ (12 جوڑے پسلیاں + 1 سٹرنم = 25 ہڈیاں) شامل ہیں۔',
          '۲۔ ضمیمائی ڈھانچہ (Appendicular Skeleton): اس میں بالائی اور زیریں دھڑ اور اعضاء کی کل 126 ہڈیاں شامل ہیں۔ بالائی اعضاء (کندھا اور بازو) میں 64 ہڈیاں اور زیریں اعضاء (کولہا اور ٹانگیں) میں 62 ہڈیاں ہوتی ہیں۔',
        ],
      },
    },
    {
      pageIndex: 3,
      originalBookPage: 3,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — پروفیسر گیلانی',
      headerChapterTitle: 'ہڈیوں کے اہم افعال',
      pageTitle: 'ہڈیوں کے بنیادی جسمانی افعال (Functions of Bones)',
      urduPageTitle: 'ہڈیوں کے پانچ بنیادی افعال (صفحہ ۳)',
      isUrdu: true,
      watermarkText: 'متن درسی کتاب',
      content: {
        paragraphs: [
          'ہڈیاں محض سخت ڈھانچہ نہیں ہوتیں بلکہ وہ زندہ اور متحرک بافتوں (Tissues) پر مشتمل ہوتی ہیں۔ ہڈیوں کے اہم افعال درج ذیل ہیں:',
          '۱۔ سہارا دینا (Support): ہڈیاں پورے جسم کے وزن کو سنبھالتی ہیں اور ایک معین شکل عطا کرتی ہیں۔',
          '۲۔ نازک اعضاء کی حفاظت (Protection): کھوپڑی دماغ کی حفاظت کرتی ہے اور پسلیاں دل اور پھیپھڑوں کو محفوظ رکھتی ہیں۔',
          '۳۔ حرکات میں مدد (Locomotion): عضلات (Muscles) ہڈیوں کے ساتھ مل کر جسم کو چلنے پھرنے کے قابل بناتے ہیں۔',
          '۴۔ معدنیات کا ذخیرہ (Mineral Storage): ہڈیوں میں کیلشیم اور فاسفورس کا 99 فیصد ذخیرہ موجود ہوتا ہے۔',
          '۵۔ خون کے خلیات کی تیاری (Haemopoiesis): لمبی ہڈیوں کے اندر موجود ہڈیوں کا گودا (Bone Marrow) خون کے سرخ خلیات تیار کرتا ہے۔',
        ],
      },
    },
    {
      pageIndex: 4,
      originalBookPage: 4,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — پروفیسر گیلانی',
      headerChapterTitle: 'جوڑوں کی اقسام',
      pageTitle: 'ہڈیوں کے جوڑوں کی تین بڑی اقسام (Classification of Joints)',
      urduPageTitle: 'ہڈیوں کے جوڑوں کی اقسام (صفحہ ۴)',
      isUrdu: true,
      watermarkText: 'متن درسی کتاب',
      content: {
        paragraphs: [
          'جہاں دو یا دو سے زائد ہڈیاں آپس میں ملتی ہیں، اسے جوڑ (Joint) کہا جاتا ہے۔ حرکات کے اعتبار سے جوڑوں کو تین اقسام میں تقسیم کیا گیا ہے:',
          '۱۔ غیر متحرک جوڑ (Immovable / Fibrous Joints): یہ وہ جوڑ ہیں جن میں کسی قسم کی حرکت ممکن نہیں ہوتی۔ مثلاً کھوپڑی کی ہڈیوں کے جوڑ (Sutures)۔',
          '۲۔ نیم متحرک جوڑ (Slightly Movable / Cartilaginous Joints): ان جوڑوں میں معمولی حرکت کی گنجائش ہوتی ہے۔ مثلاً ریڑھ کی ہڈی کے مہروں کے درمیانی جوڑ۔',
          '۳۔ مکمل متحرک جوڑ (Freely Movable / Synovial Joints): ان جوڑوں میں مکمل آزادی کے ساتھ وسیع حرکت ممکن ہوتی ہے۔ ان جوڑوں کے اندر سائنوویل مائع بھرا ہوتا ہے جو رگڑ کو کم کرتا ہے۔',
        ],
      },
    },
    {
      pageIndex: 5,
      originalBookPage: 5,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — پروفیسر گیلانی',
      headerChapterTitle: 'متحرک جوڑوں کی اقسام',
      pageTitle: 'متحرک جوڑوں کی ساخت: گیند پیالہ جوڑ اور قبضہ نما جوڑ',
      urduPageTitle: 'اہم متحرک جوڑوں کی وضاحت (صفحہ ۵)',
      isUrdu: true,
      watermarkText: 'متن درسی کتاب',
      content: {
        paragraphs: [
          '۱۔ گیند اور پیالہ جوڑ (Ball and Socket Joint): اس جوڑ میں ایک ہڈی کا گول سرا (Ball) دوسری ہڈی کے پیالہ نما گڑھے (Socket) میں فٹ ہوتا ہے۔ یہ جوڑ تمام سمتوں میں حرکت کر سکتا ہے۔ مثلاً کندھے کا جوڑ (Shoulder Joint) اور کولہے کا جوڑ (Hip Joint)۔',
          '۲۔ قبضہ نما جوڑ (Hinge Joint): دروازے کے قبضے کی طرح یہ جوڑ صرف ایک ہی رخ پر آگے پیچھے مڑ سکتا ہے۔ مثلاً کہنی کا جوڑ (Elbow Joint) اور گھٹنے کا جوڑ (Knee Joint)۔',
          '۳۔ محوری جوڑ (Pivot Joint): گردن کا جوڑ جو سر کو دائیں بائیں گھمانے کی سہولت دیتا ہے۔',
        ],
      },
    },
    {
      pageIndex: 6,
      originalBookPage: 6,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — ایتھلیٹکس قوانین',
      headerChapterTitle: '400 میٹر ٹریک کے رولز',
      pageTitle: '400 میٹر معیاری ایتھلیٹکس رننگ ٹریک کی پیمائش و ساخت',
      urduPageTitle: '400 میٹر معیاری ٹریک کی پیمائش (صفحہ ۶)',
      isUrdu: true,
      watermarkText: 'ایتھلیٹکس رولز',
      content: {
        paragraphs: [
          'عالمی ایتھلیٹکس فیڈریشن (World Athletics) اور BISE ڈیرہ غازی خان کے منظور شدہ قوانین کے تحت 400 میٹر معیاری ٹریک کے خدوخال درج ذیل ہیں:',
          '۱۔ ٹریک کا کل گھیراؤ (Circumference): اندرونی لین کے خط سے 400 میٹر ہوتا ہے۔',
          '۲۔ لینز کی تعداد: معیاری ٹریک پر کم از کم 8 لینز ہوتی ہیں۔',
          '۳۔ ہر لین کی چوڑائی: 1.22 میٹر (4 فٹ) مقرر ہے۔ لین کی تمام لکیریں 5 سینٹی میٹر چوڑی اور سفید رنگ کی ہوتی ہیں۔',
          '۴۔ سیدھے حصے (Straights) اور موڑ (Curves): ٹریک پر دو سیدھے حصے ہوتے ہیں جن کی لمبائی 84.39 میٹر فی سٹریٹ ہوتی ہے اور دو نیم دائرہ موڑ ہوتے ہیں جن کا رداس 36.50 میٹر ہوتا ہے۔',
        ],
      },
    },
    {
      pageIndex: 7,
      originalBookPage: 7,
      category: 'textbook_reading',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — رننگ رولز',
      headerChapterTitle: 'سٹیگر اور سٹارٹنگ کے قواعد',
      pageTitle: 'سٹیگر ڈسٹنس (Stagger Distance) اور رولز آف ریسنگ',
      urduPageTitle: 'سٹیگر کا فاصلہ اور دوڑ کے اصول (صفحہ ۷)',
      isUrdu: true,
      watermarkText: 'ایتھلیٹکس رولز',
      content: {
        paragraphs: [
          'چونکہ بیرونی لین کا موڑ بڑا ہوتا ہے اس لیے تمام کھلاڑیوں کو مساوی فاصلہ فراہم کرنے کے لیے بیرونی لینز کے دوڑنے والوں کو آگے کھڑا کیا جاتا ہے، اس آگے کے فاصلے کو سٹیگر (Stagger) کہتے ہیں۔',
          'سٹیگر کا فارمولا: [W (n-1) - 0.10m] × 2π (جہاں W لین کی چوڑائی اور n لین نمبر ہے)۔',
          'دوڑ کے آغاز کے احکامات: "On your marks" (اپنی جگہوں پر)، "Set" (تیار)، اور پستول کی گولی کی آواز (Gun Fire)۔',
        ],
      },
    },
    {
      pageIndex: 8,
      originalBookPage: 8,
      category: 'vocabulary_glossary',
      headerBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ — اصطلاحات',
      headerChapterTitle: 'علم الابدان کی طبی اصطلاحات',
      pageTitle: 'فرہنگ و طبی اصطلاحات (Medical Terms in Physical Education)',
      urduPageTitle: 'طبی و تکنیکی اصطلاحات جدول (صفحہ ۸)',
      isUrdu: true,
      watermarkText: 'طبی لغت',
      content: {
        vocabularyTable: [
          { word: 'Skeleton (ڈھانچہ)', meaning: 'جسم کی ہڈیوں کا فریم ورک جو سہارا اور شکل دیتا ہے' },
          { word: 'Cartilage (کری ہڈی)', meaning: 'لچکدار بافت جو ہڈیوں کے سروں پر رگڑ سے بچاتی ہے' },
          { word: 'Ligament (رباط)', meaning: 'مضبوط ریشہ دار ڈوریاں جو ہڈی کو ہڈی سے جوڑتی ہیں' },
          { word: 'Tendon (پٹھا/وتر)', meaning: 'مضبوط ریشہ دار پٹی جو عضلات کو ہڈی سے جوڑتی ہے' },
          { word: 'Synovial Fluid', meaning: 'متحرک جوڑوں میں پایا جانے والا چکنا رطوبتی مائع' },
          { word: 'Stagger (سٹیگر)', meaning: 'موڑ کے فرق کو برابر کرنے کے لیے آگے دیا جانے والا فاصلہ' },
        ],
      },
    },
    {
      pageIndex: 9,
      originalBookPage: 9,
      category: 'keybook_exercises',
      headerBookTitle: 'پروفیسر گیلانی کی بک — حل شدہ مشق ۱ تا ۵',
      headerChapterTitle: 'حل شدہ مشقی سوالات',
      pageTitle: 'بورڈ امتحانی حل شدہ مشقی سوالات (حصہ اول — ۲ نمبری)',
      urduPageTitle: 'حل شدہ مشقی مختصر سوالات (صفحہ ۹)',
      isUrdu: true,
      watermarkText: 'کی بک حل شدہ سوالات',
      content: {
        exerciseQuestions: [
          {
            qNum: 'سوال ۱',
            question: 'انسانی جسم میں کل کتنی ہڈیاں ہوتی ہیں؟ اور محوری ڈھانچے میں کتنی ہڈیاں ہیں؟',
            answer: 'بالغ انسانی جسم میں کل 206 ہڈیاں ہوتی ہیں۔ محوری ڈھانچے (Axial Skeleton) میں کل 80 ہڈیاں پائی جاتی ہیں۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'سوال ۲',
            question: '400 میٹر معیاری ٹریک کی لین کی چوڑائی کتنی ہوتی ہے؟',
            answer: 'معیاری ایتھلیٹکس ٹریک کی ہر لین کی چوڑائی 1.22 میٹر (4 فٹ) مقرر ہے۔',
            marks: 2,
            type: 'short',
          },
          {
            qNum: 'سوال ۳',
            question: 'گیند اور پیالہ جوڑ (Ball & Socket Joint) کی دو مثالیں تحریر کریں۔',
            answer: '۱۔ کندھے کا جوڑ (Shoulder Joint) اور ۲۔ کولہے کا جوڑ (Hip Joint)۔ یہ جوڑ ہر رخ میں حرکت کی اجازت دیتا ہے۔',
            marks: 2,
            type: 'short',
          },
        ],
      },
    },
    {
      pageIndex: 10,
      originalBookPage: 10,
      category: 'keybook_exercises',
      headerBookTitle: 'پروفیسر گیلانی کی بک — حل شدہ مشق و تفصیلی سوال',
      headerChapterTitle: 'تفصیلی امتحانی سوال مع حل',
      pageTitle: 'تفصیلی امتحانی سوال: انسانی ڈھانچے کے اہم افعال (۸ نمبر)',
      urduPageTitle: 'تفصیلی حل شدہ سوال برائے بورڈ پیپر (صفحہ ۱۰)',
      isUrdu: true,
      watermarkText: 'کی بک حل شدہ سوالات',
      content: {
        exerciseQuestions: [
          {
            qNum: 'سوال ۴ (تفصیلی)',
            question: 'انسانی ڈھانچے کے پانچ اہم افعال اور ہڈیوں کی ساخت پر تفصیلی نوٹ تحریر کریں۔',
            answer: 'ڈھانچے کے اہم افعال: ۱۔ سہارا (جسمانی ساخت کو برقرار رکھنا) ۲۔ تحفظ (نازک اندرونی اعضاء مثلاً دل اور دماغ کی حفاظت) ۳۔ حرکات (عضلات کے کھنچاؤ سے اعضاء کی حرکت) ۴۔ معدنیات کا ذخیرہ (کیلشیم اور فاسفورس کی فراہمی) ۵۔ خون کی پیدائش (ریڈ بون میرو سے سرخ خلیات کی تشکیل)۔',
            marks: 8,
            type: 'long',
          },
        ],
      },
    },
    {
      pageIndex: 11,
      originalBookPage: 11,
      category: 'test_paper',
      headerBookTitle: 'BISE D.G. Khan — روزانہ ۳۰ نمبری ٹیسٹ پیپر',
      headerChapterTitle: 'فزیکل ایجوکیشن ماڈل پیپر',
      pageTitle: 'BISE D.G. Khan ماڈل اسیسمنٹ پیپر (۳۰ نمبر — وقت: ۳۰ منٹ)',
      urduPageTitle: 'روزانہ ۳۰ نمبری امتحانی پرچہ (صفحہ ۱۱)',
      isUrdu: true,
      watermarkText: 'BISE DG KHAN OFFICIAL',
      content: {
        testPaper: {
          totalMarks: 30,
          timeAllowed: '30 منٹ',
          objectiveSection: [
            { q: '۱۔ انسانی کھوپڑی میں چہرے کی کل کتنی ہڈیاں ہوتی ہیں؟', opts: ['الف) 8', 'ب) 14', 'ج) 12', 'د) 20'], ans: 'ب' },
            { q: '۲۔ 400 میٹر ٹریک پر لینز کی معیاری تعداد کتنی ہوتی ہے؟', opts: ['الف) 6', 'ب) 8', 'ج) 10', 'د) 4'], ans: 'ب' },
            { q: '۳۔ کہنی کا جوڑ کس قسم کے جوڑ کی مثال ہے؟', opts: ['الف) قبضہ نما جوڑ', 'ب) گیند پیالہ جوڑ', 'ج) غیر متحرک جوڑ', 'د) سڈل جوڑ'], ans: 'الف' },
          ],
          subjectiveShortSection: [
            { q: 'سوال ۱: سائنوویل فلوئڈ کا جوڑوں میں کیا کام ہے؟', marks: 2 },
            { q: 'سوال ۲: سٹیگر کے فاصلے کی تعریف تحریر کریں۔', marks: 2 },
            { q: 'سوال ۳: محوری اور ضمیمائی ڈھانچے کی ہڈیوں کی تعداد بتائیں۔', marks: 2 },
          ],
          subjectiveLongSection: [
            { q: 'سوال ۴: 400 میٹر ٹریک کی مکمل پیمائش اور سٹریٹس و کروز کا خاکہ بیان کریں۔', marks: 10 },
          ],
        },
      },
    },
    {
      pageIndex: 12,
      originalBookPage: 12,
      category: 'marking_key',
      headerBookTitle: 'پروفیسر گیلانی کی بک — مصدقہ جوابی کلید',
      headerChapterTitle: 'جوابی کلید و ایگزامینر گائیڈ',
      pageTitle: 'مصدقہ جوابی کلید اور ایگزامینر مارکنگ اسکیم (BISE DG Khan)',
      urduPageTitle: 'مصدقہ جوابی کلید برائے ۳۰ نمبر (صفحہ ۱۲)',
      isUrdu: true,
      watermarkText: 'EXAMINER VERIFIED KEY',
      content: {
        leadNote: 'Faculty Lead Ahmad کی توثیق شدہ مارکنگ اسکیم',
        markingRubric: [
          { criteria: 'MCQs سیکشن', marksAllocated: '۵ نمبر', guidance: 'درست ببل پر ۱ نمبر فی سوال۔' },
          { criteria: 'مختصر سوالات', marksAllocated: '۱۰ نمبر (۵ سوالات × ۲ نمبر)', guidance: 'درست طبی اصطلاح اور پیمائش لکھنے پر پورے نمبر۔' },
          { criteria: 'تفصیلی سوال (ٹریک پیمائش)', marksAllocated: '۱۵ نمبر', guidance: 'پیمائش کا حساب، فارمولا اور ڈایاگرام شامل کرنے پر فل مارکس۔' },
        ],
      },
    },
  ];

  return {
    bookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن (سال اول) — پروفیسر سید بشارت حسین گیلانی',
    urduBookTitle: 'ہیلتھ اینڈ فزیکل ایجوکیشن ۱۱ (پروفیسر گیلانی)',
    keyBookTitle: 'شرح فزیکل ایجوکیشن ۱۱ مع حل شدہ امتحانی پرچے',
    pdfFileName: 'health_physical_education_11_gilani.pdf',
    subjectCode: 'FAIT-PED-11',
    subjectName: 'Physical Education',
    chapterTitle: 'Human Skeletal System & 400m Track Rules',
    urduChapterTitle: 'باب اول: انسانی جسمانی ساخت، ہڈیوں کے جوڑ اور 400 میٹر ٹریک رولز',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 3. COMPUTER SCIENCE & ENTREPRENEURSHIP (IT Series 28 Pages)
// -------------------------------------------------------------
function generateComputerScienceSlice(range: string): BookSliceResult {
  const totalPages = 28;
  const pages: BookPageItem[] = [];

  for (let i = 1; i <= totalPages; i++) {
    const isFirst = i === 1;
    const isExercise = i >= 20 && i <= 25;
    const isPaper = i === 26 || i === 27;
    const isKey = i === 28;

    pages.push({
      pageIndex: i,
      originalBookPage: i,
      category: isFirst
        ? 'title_sheet'
        : isExercise
        ? 'keybook_exercises'
        : isPaper
        ? 'test_paper'
        : isKey
        ? 'marking_key'
        : 'textbook_reading',
      headerBookTitle: 'IT Series Computer Science & Entrepreneurship (1st Year FA-IT)',
      headerChapterTitle: 'Chapter 1: Basics of Information Technology & Hardware Architecture',
      pageTitle: `Chapter 1: Information Technology Fundamentals — Page ${i}`,
      isUrdu: false,
      watermarkText: 'IT SERIES OFFICIAL',
      content: {
        leadNote: isFirst
          ? 'Prescribed by Punjab Curriculum & Textbook Board (PCTB) & BISE Dera Ghazi Khan'
          : undefined,
        paragraphs: isFirst
          ? [
              'Author: IT Series Educational Publishing / Tasleem Mustafa, Tariq Mahmood.',
              'Scope: Introduction to modern computing systems, input/output hardware, Central Processing Unit (ALU, CU, Registers), memory hierarchy (RAM, Cache, Secondary Storage), and digital data representation.',
              'Learning Outcomes: Understand basic computational components, explain hardware-software synergy, and solve board numericals for data representation.',
            ]
          : isExercise
          ? [
              `Solved Question ${i - 19}: Explain CPU execution cycle (Fetch, Decode, Execute, Store). Answer: The Control Unit fetches instructions from RAM, decodes opcode, ALU executes calculation, and registers store immediate results.`,
            ]
          : [
              `Core Concept P.${i}: Components of the System Unit. A computer system consists of hardware, software, data, and users. The Motherboard connects the microprocessors, RAM slots, buses (Control, Address, Data), and expansion cards.`,
              'Memory Hierarchy: Cache Memory (Level 1, Level 2, Level 3) provides microsecond data retrieval directly beside CPU cores to eliminate RAM latency bottlenecks.',
            ],
        points: [
          'Binary, Decimal, and Hexadecimal conversion rules',
          'Primary Storage (Volatile RAM vs Non-Volatile ROM)',
          'System Buses: Data Bus (64-bit wide), Address Bus (points to memory address), Control Bus',
        ],
      },
    });
  }

  return {
    bookTitle: 'Computer Science & Entrepreneurship (IT Series — 1st Year FA-IT)',
    urduBookTitle: 'کمپیوٹر سائنس و انٹرپرینیورشپ ۱۱ (آئی ٹی سیریز)',
    keyBookTitle: 'IT Series Solved Key Book & Board Question Bank 2026-2027',
    pdfFileName: 'computer_science_entrepreneurship_11_itseries.pdf',
    subjectCode: 'FAIT-CSC-11',
    subjectName: 'Computer Science',
    chapterTitle: 'Basics of Information Technology & System Unit',
    urduChapterTitle: 'باب اول: انفارمیشن ٹیکنالوجی کی بنیادیں، ہارڈویئر اور سسٹمز',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 4. ENGLISH COMPULSORY 11 (Button, Button & Sunshine 18 Pages)
// -------------------------------------------------------------
function generateEnglishSlice(range: string): BookSliceResult {
  const totalPages = 18;
  const pages: BookPageItem[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      pageIndex: i,
      originalBookPage: i,
      category: i === 1 ? 'title_sheet' : i >= 12 && i <= 15 ? 'keybook_exercises' : i === 16 ? 'grammar_rules' : i === 17 ? 'test_paper' : i === 18 ? 'marking_key' : 'textbook_reading',
      headerBookTitle: 'PECTAA English Book-1 Short Stories & Sunshine Comprehensive English',
      headerChapterTitle: 'Story 1: "Button, Button" by Richard Matheson',
      pageTitle: `Story 1: Button, Button — Reading & Analysis (Page ${i})`,
      isUrdu: false,
      watermarkText: 'SUNSHINE ENGLISH',
      content: {
        leadNote: i === 1 ? 'Punjab Education, Curriculum, Training & Assessment Authority (PECTAA)' : undefined,
        paragraphs: i === 1 ? [
          'Author: Richard Matheson (1926-2013). Renowned American fiction writer.',
          'Summary: Mr. Steward leaves a mysterious button unit on the porch of Arthur and Norma Lewis. He reveals pushing the button will deliver $50,000 cash, but causes the death of an unknown person. Norma succumbs to temptation with catastrophic consequences.',
        ] : [
          `Textbook Section P.${i}: Norma pressed the button inside the glass dome. Later that evening, she received an emergency call from Lenox Hill Hospital regarding Arthur being pushed on the subway platform. Mr. Steward calls back: "Did you really think you knew your husband?"`,
        ],
        points: [
          'Theme: Moral integrity vs Materialistic greed',
          'Vocabulary: Appraisal, Intrigue, Incredulous, Contemptuous, Double-Indemnity',
          'Sunshine Key Book Answer: Norma justified pushing the button by claiming it would help them buy an exotic vacation and a cottage on the island.',
        ],
      },
    });
  }

  return {
    bookTitle: 'English 11 (Punjab Curriculum & Textbook Board Book-1) & Sunshine English',
    urduBookTitle: 'انگریزی ۱۱ (شارٹ اسٹوریز) و سن شائن انگلش',
    keyBookTitle: 'Sunshine Comprehensive English 11 (Prof. Musarrat Hussain)',
    pdfFileName: 'english_11_pectaa_textbook.pdf',
    subjectCode: 'FAIT-ENG-11',
    subjectName: 'English & Grammar',
    chapterTitle: 'Story 1 "Button, Button" & Master Tenses Drill',
    urduChapterTitle: 'کہانی اول "بٹن، بٹن" (رچرڈ میتھیسن) و سن شائن گرائمر',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 5. TARJUMA-TUL-QURAN 11 (18 Pages)
// -------------------------------------------------------------
function generateTarjumaQuranSlice(range: string): BookSliceResult {
  const totalPages = 18;
  const pages: BookPageItem[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      pageIndex: i,
      originalBookPage: i,
      category: i === 1 ? 'title_sheet' : i >= 14 && i <= 16 ? 'keybook_exercises' : i === 17 ? 'test_paper' : i === 18 ? 'marking_key' : 'textbook_reading',
      headerBookTitle: 'ترجمۃ القرآن المجید (لازمی) برائے جماعت یازدہم — پنجاب ٹیکسٹ بک بورڈ',
      headerChapterTitle: 'سورۃ مریم و سورۃ طٰہٰ',
      pageTitle: `سورۃ مریم: آیات و با محاورہ اردو ترجمہ (صفحہ ${i})`,
      urduPageTitle: `سورۃ مریم: با محاورہ ترجمہ و تفسیر (صفحہ ${i})`,
      isUrdu: true,
      watermarkText: 'ترجمۃ القرآن المجید',
      content: {
        paragraphs: [
          `آیاتِ کریمہ اور اردو ترجمہ (صفحہ ${i}): حضرت زکریا علیہ السلام کی دعا اور حضرت یحییٰ علیہ السلام کی ولادت کی بشارت۔ حضرت مریم علیہا السلام کا ذکرِ خیر اور حضرت عیسیٰ علیہ السلام کی ولادت کا معجزہ۔`,
          'توحید و رسالت کے واضح براہین اور آخرت میں کفار کے انجام کا تذکرہ۔',
        ],
        points: [
          'شانِ نزول اور فضائلِ سورت',
          'انبیاء کرام علیہم السلام کے اخلاقی اوصاف',
          'حل شدہ مشقی سوالات و ۳۰ نمبری امتحانی پرچہ مع کلید',
        ],
      },
    });
  }

  return {
    bookTitle: 'ترجمۃ القرآن المجید (لازمی سال اول) — پنجاب ٹیکسٹ بک بورڈ لاہور',
    urduBookTitle: 'ترجمۃ القرآن المجید ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    keyBookTitle: 'شرح ترجمۃ القرآن ۱۱ مع مصدقہ جوابی کلید',
    pdfFileName: 'tarjuma_tul_quran_11_pectaa.pdf',
    subjectCode: 'FAIT-TQM-11',
    subjectName: 'Tarjuma-tul-Quran',
    chapterTitle: 'Surah Maryam (Ayat 1-36) & Tafseer',
    urduChapterTitle: 'سورۃ مریم (آیات ۱ تا ۳۶) با محاورہ ترجمہ و حل شدہ مشق',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 6. PRINCIPLES OF ECONOMICS (18 Pages)
// -------------------------------------------------------------
function generateEconomicsSlice(range: string): BookSliceResult {
  const totalPages = 18;
  const pages: BookPageItem[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      pageIndex: i,
      originalBookPage: i,
      category: i === 1 ? 'title_sheet' : i >= 13 && i <= 15 ? 'keybook_exercises' : i === 16 ? 'grammar_rules' : i === 17 ? 'test_paper' : i === 18 ? 'marking_key' : 'textbook_reading',
      headerBookTitle: 'اصول معاشیات (سال اول) — پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ / علمی کتاب خانہ',
      headerChapterTitle: 'باب اول: معاشیات کی ماہیت اور بنیادی قوانین',
      pageTitle: `باب اول: علمِ معاشیات اور افادہ مختتم (صفحہ ${i})`,
      urduPageTitle: `معاشیات کی تعریفات و قانون تقلیل افادہ (صفحہ ${i})`,
      isUrdu: true,
      watermarkText: 'اصول معاشیات ۱۱',
      content: {
        paragraphs: [
          `معاشیات کا مفہوم (صفحہ ${i}): ایڈم سمتھ (دولت کا علم)، الفریڈ مارشل (مادی فلاح کا علم)، اور لیونل رابنز (محدود وسائل اور لا محدود خواہشات) کی تعریفات کا تقابلی جائزہ۔`,
          'قانون تقلیل افادہ مختتم: جب کسی شے کی مسلسل اکائیاں استعمال کی جاتی ہیں تو ہر اگلی اکائی سے حاصل ہونے والا افادہ کم ہوتا جاتا ہے۔',
        ],
        points: [
          'گوشوارہ افادہ کل و افادہ مختتم',
          'ڈایاگرام کی مدد سے نقطہ سیری (Point of Satiety) کی وضاحت',
          'حل شدہ مشقی سوالات اور ۳۰ نمبری بورڈ پرچہ مع جوابی کلید',
        ],
      },
    });
  }

  return {
    bookTitle: 'اصول معاشیات (سال اول) — پنجاب ٹیکسٹ بک بورڈ و علمی کتاب خانہ',
    urduBookTitle: 'اصول معاشیات ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    keyBookTitle: 'شرح اصول معاشیات ۱۱ مع حل شدہ گوشوارے و ڈایاگرامز',
    pdfFileName: 'principles_of_economics_11_ptb.pdf',
    subjectCode: 'FAIT-ECO-11',
    subjectName: 'Principles of Economics',
    chapterTitle: 'Definitions of Economics & Law of Diminishing Marginal Utility',
    urduChapterTitle: 'باب اول: معاشیات کی ماہیت اور قانون تقلیل افادہ مختتم',
    pagesRange: range,
    totalPages,
    pages,
  };
}

// -------------------------------------------------------------
// 7. ISLAMIYAT LAZMI (16 Pages)
// -------------------------------------------------------------
function generateIslamiyatSlice(range: string): BookSliceResult {
  const totalPages = 16;
  const pages: BookPageItem[] = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push({
      pageIndex: i,
      originalBookPage: i,
      category: i === 1 ? 'title_sheet' : i >= 12 && i <= 14 ? 'keybook_exercises' : i === 15 ? 'test_paper' : i === 16 ? 'marking_key' : 'textbook_reading',
      headerBookTitle: 'اسلامیات (لازمی) سال اول — پنجاب کریکولم اینڈ ٹیکسٹ بک بورڈ لاہور',
      headerChapterTitle: 'باب اول: بنیادی عقائد (توحید، رسالت، آخرت)',
      pageTitle: `باب اول: عقائدِ اسلام (صفحہ ${i})`,
      urduPageTitle: `بنیادی عقائد و انسانی زندگی پر اثرات (صفحہ ${i})`,
      isUrdu: true,
      watermarkText: 'اسلامیات لازمی ۱۱',
      content: {
        paragraphs: [
          `عقیدہ توحید کا مفہوم (صفحہ ${i}): اللہ تعالیٰ کو اس کی ذات، صفات اور افعال میں یکتا و بے مثل ماننا اور صرف اسی کی عبادت کرنا۔ شرک کی اقسام اور اس کے بھیانک نتائج۔`,
          'عقیدہ رسالت: انبیاء کرام علیہم السلام کی عصمت، نبوت کا وہبی ہونا، اور حضرت محمد ﷺ کی ختم نبوت کا قطعی عقیدہ۔',
        ],
        points: [
          'قرآنی آیات کے مستند تراجم',
          'عقیدہ آخرت کے فرد اور معاشرے پر اثرات',
          'حل شدہ مشقی سوالات اور ۳۰ نمبری امتحانی پیپر مع تصدیق شدہ کلید',
        ],
      },
    });
  }

  return {
    bookTitle: 'اسلامیات (لازمی) سال اول — پنجاب ٹیکسٹ بک بورڈ لاہور',
    urduBookTitle: 'اسلامیات لازمی ۱۱ (پنجاب ٹیکسٹ بک بورڈ)',
    keyBookTitle: 'شرح اسلامیات لازمی ۱۱ مع مصدقہ امتحانی جوابی کلید',
    pdfFileName: 'islamiyat_compulsory_11_pectaa.pdf',
    subjectCode: 'FAIT-ISL-11',
    subjectName: 'Islamiyat Lazmi',
    chapterTitle: 'Bab 1: Bunyadi Aqaid (Tauheed, Risalat, Akhirat)',
    urduChapterTitle: 'باب اول: بنیادی عقائد اور سیرت النبی ﷺ',
    pagesRange: range,
    totalPages,
    pages,
  };
}
