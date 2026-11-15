// 1st Year Intermediate (11th Class) Board Examination Grammar Master Hub
// Covers complete Punjab & Federal Board curriculum for Urdu Qawaid-o-Insha & English Grammar

export interface GrammarItem {
  id: string;
  category: 'urdu_letters' | 'urdu_dialogues' | 'urdu_applications' | 'urdu_rhetoric' | 'urdu_idioms' | 'eng_tenses' | 'eng_voices' | 'eng_narration' | 'eng_pairs' | 'eng_idioms' | 'eng_letters' | 'eng_translation';
  title: string;
  urduTitle?: string;
  subtitle?: string;
  content: string;
  examples?: string[];
  rules?: string[];
  boardExamMarks?: number;
  tags?: string[];
}

export const URDU_GRAMMAR_ITEMS: GrammarItem[] = [
  {
    id: 'ug_01',
    category: 'urdu_letters',
    title: 'دوست کے نام تعزیت اور تسلی کا خط',
    urduTitle: 'خط نمبر ۱: دوست کی والدہ / والد کی وفات پر تعزیت',
    subtitle: 'لاہور و راولپنڈی بورڈ میں بار بار پوچھا جانے والا خط',
    boardExamMarks: 10,
    content: `امتحانی مرکز
۱۵ نومبر ۲۰۲۶ء

پیارے دوست علی!
السلام علیکم ورحمۃ اللہ وبرکاتہ!

آج صبح ہی ڈاک کے ذریعے تمہارے برادرِ بزرگ کا خط ملا جس سے تمہاری والدہ محترمہ کے ناگہانی سانحۂ ارتحال کی اندوہناک خبر معلوم ہوئی۔ اس خبر نے میرے دل کو ہلا کر رکھ دیا۔ مجھے یقین نہیں آرہا تھا کہ وہ شفیق اور دعا گو ہستی اب ہم میں نہیں رہی۔

پیارے دوست! موت ایک اٹل حقیقت ہے اور ہر ذی روح کو موت کا ذائقہ چکھنا ہے۔ اللہ تعالیٰ کا فرمان ہے: "کُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ"۔ مجھے معلوم ہے کہ ماں کا نعم البدل دنیا میں کوئی نہیں، لیکن اس وقت صبر اور ضبط سے کام لینا ہی بندگی کا تقاضا ہے۔

میری دعا ہے کہ باری تعالیٰ مرحومہ کو اپنے جوارِ رحمت میں اعلیٰ علیین میں جگہ عطا فرمائے، ان کی لغزشوں کو معاف کرے اور آپ سب اہل خانہ کو صبرِ جمیل کی توفیق بخشے۔ (آمین)۔

والسلام
آپ کا مخلص دوست
الف۔ ب۔ ج`,
    rules: [
      'پیشانی (امتحانی مرکز اور تاریخ) کے ۲ نمبر ہیں۔',
      'القاب و آداب کے ۱+۱ = ۲ نمبر ہیں۔',
      'نفسِ مضمون (خط کا اصل مواد) کے ۵ نمبر ہیں۔',
      'اختتامیہ (والسلام اور نام/الف ب ج) کا ۱ نمبر ہے۔',
    ],
    tags: ['خطوط نویسی', 'بورڈ پیپر', '10 نمبر'],
  },
  {
    id: 'ug_02',
    category: 'urdu_letters',
    title: 'والد کے نام تعلیمی کارکردگی کی اطلاع کا خط',
    urduTitle: 'خط نمبر ۲: والد محترم کو دسمبر ٹیسٹ کے نتائج سے آگاہ کرنا',
    boardExamMarks: 10,
    content: `امتحانی مرکز
۲۰ نومبر ۲۰۲۶ء

محترم ابا جان!
السلام علیکم ورحمۃ اللہ وبرکاتہ!

امید ہے آپ سب خیریت سے ہوں گے۔ آپ کا نوازش نامہ موصول ہوا۔ آپ نے میرے تعلیمی جائزے اور کالج کے حالیہ دسمبر ٹیسٹ کے متعلق دریافت فرمایا تھا۔

ابا جان! مجھے آپ کو یہ نوید سناتے ہوئے دلی مسرت ہو رہی ہے کہ کالج کے دسمبر تشخیصی امتحانات میں الحمدللہ میں نے اپنی کلاس میں پہلی پوزیشن حاصل کی ہے۔ کمپیوٹر سائنس میں ۵۰ میں سے ۴۸، انگریزی میں ۴۵ اور اردو میں ۴۶ نمبر حاصل کیے ہیں۔ اساتذہ کرام نے میری محنت کو بہت سراہا ہے۔

میں آپ کو یقین دلاتا ہوں کہ آئندہ سالانہ بورڈ امتحانات میں بھی اسی محنت اور لگن سے پڑھائی جاری رکھوں گا تاکہ آپ کا سر فخر سے بلند کر سکوں۔ امی جان کی خدمت میں سلام اور چھوٹے بھائی کو پیار۔

والسلام
آپ کا تابعدار بیٹا
الف۔ ب۔ ج`,
    rules: ['القاب و آداب میں احترام کا خاص خیال رکھیں، خط تین پیراگراف پر مشتمل ہونا چاہیے۔'],
    tags: ['والد کے نام خط', 'تعلیمی رپورٹ'],
  },
  {
    id: 'ug_03',
    category: 'urdu_dialogues',
    title: 'دو دوستوں کے درمیان وقت کی پابندی پر مکالمہ',
    urduTitle: 'مکالمہ ۱: وقت کی قدر و قیمت اور امتحانی تیاری',
    boardExamMarks: 7,
    content: `(منظر: کالج کے گراؤنڈ میں دو دوست عثمان اور حامد بیٹھے ہیں)

عثمان: السلام علیکم حامد! تم اتنے پریشان کیوں بیٹھے ہو؟
حامد: وعلیکم السلام عثمان! سچ پوچھو تو امتحانات سر پر ہیں اور میرا سلیبس ابھی تک ادھورا ہے۔
عثمان: لیکن حامد! ابھی تو تین ماہ باقی ہیں۔ اگر اب بھی وقت کی قدر کرو تو کامیابی یقینی ہے۔
حامد: یار عثمان! وقت اتنی تیزی سے گزر جاتا ہے کہ سمجھ ہی نہیں آتی۔
عثمان: دوست! انگریزی کا مقولہ ہے کہ "Time and tide wait for none"۔ گزرا ہوا وقت کبھی واپس نہیں آتا۔ جو قومیں اور طلبہ وقت کی قدر نہیں کرتے، وہ پچھتاتے ہیں۔
حامد: تمہاری بات بالکل سچ ہے۔ تم نے اپنا شیڈول کیسے بنایا ہے؟
عثمان: میں نے ہر مضمون کے لیے روزانہ وقت مقرر کیا ہے۔ اتوار کو مکمل آرام اور ہلکی دہرائی کرتا ہوں۔ تم بھی آج ہی سے پڑھائی شروع کرو۔
حامد: شکریہ عثمان! تمہاری نصیحت نے میری آنکھیں کھول دیں۔ اب میں وقت کا ایک ایک لمحہ غنیمت جانوں گا۔
عثمان: ماشاء اللہ! چلو لائبریری چلتے ہیں اور مل کر تیاری کرتے ہیں۔`,
    rules: [
      'مکالمے کی زبان روزمرہ بول چال کے مطابق اور فطری ہونی چاہیے۔',
      'مکالمے کے آغاز میں مختصر پس منظر بریکٹ میں ضرور لکھیں۔',
      'رموزِ اوقاف (سوالیہ، فجائیہ، رابطہ) کا خاص خیال رکھیں۔',
    ],
    tags: ['مکالمہ نگاری', '7 نمبر'],
  },
  {
    id: 'ug_04',
    category: 'urdu_applications',
    title: 'پرنسپل صاحب کے نام فیس معافی کی درخواست',
    urduTitle: 'درخواست ۱: مالی مجبوری کے باعث فیس معافی',
    boardExamMarks: 10,
    content: `بخدمت جناب پرنسپل صاحب
گورنمنٹ ڈگری کالج، لاہور۔

عنوان: درخواست برائے فیس معافی

جنابِ عالی!
نہایت ادب سے گزارش ہے کہ نیازمند آپ کے زیرِ سایہ کالج میں فرسٹ ایئر (گیارہویں جماعت) کا باقاعدہ طالب علم ہے۔ نیازمند کے والد صاحب ایک نجی کارخانے میں معمولی ملازم ہیں اور ان کی ماہانہ آمدنی قلیل ہے۔ گھر میں ہم چار بہن بھائی زیرِ تعلیم ہیں اور موجودہ مہنگائی کے دور میں گھریلو اخراجات ہی بمشکل پورے ہوتے ہیں۔

نیازمند کو تعلیم حاصل کرنے کا بے پناہ شوق ہے۔ میٹرک کے امتحانات میں ۹۲ فیصد نمبر لے کر کامیابی حاصل کی تھی اور کالج کے ماہانہ ٹیسٹ میں بھی نمایاں پوزیشن پر رہا ہوں۔ غربت کے باعث میرے لیے کالج کی فیس ادا کرنا ناممکن ہے۔

امید ہے کہ آپ میری پسماندگی اور تعلیمی لگن کو مدنظر رکھتے ہوئے میری فیس مکمل معاف فرمائیں گے تاکہ میں اپنی تعلیم کا سلسلہ جاری رکھ سکوں۔

العارض
نیازمند: الف۔ ب۔ ج
رول نمبر: ۱۰۵
کلاس: سال اول (کمپیوٹر سائنس)
تاریخ: ۱۵ نومبر ۲۰۲۶ء`,
    rules: [
      'پہلی سطر میں "بخدمت جناب پرنسپل صاحب" کے بعد سکتہ یا ڈیش نہیں آتا۔',
      'عنوان کی سطر نمایاں اور مارکر سے لکھی جائے۔',
      'تاریخ درخواست کے بائیں جانب یا نیچے درج کی جاتی ہے۔',
    ],
    tags: ['درخواست نویسی', 'فیس معافی'],
  },
  {
    id: 'ug_05',
    category: 'urdu_rhetoric',
    title: 'علم بیان و شعری اصطلاحات (تشبیہ، استعارہ، تلمیح)',
    urduTitle: 'شعری و ادبی اصطلاحات کی مکمل تفصیل مع امتحانی مثالیں',
    boardExamMarks: 5,
    content: `۱۔ تشبیہ (Simile):
کسی ایک چیز کو کسی مشترک صفت کی بنا پر دوسری چیز کی مانند قرار دینا۔
ارکانِ تشبیہ: ۵ ارکان (مشبہ، مشبہ بہ، حرفِ تشبیہ، وجہِ شبہ، غرضِ تشبیہ)۔
مثال: "نازکی اُس کے لب کی کیا کہیے ... پنکھڑی اک گلاب کی سی ہے"
(لب = مشبہ، گلاب کی پنکھڑی = مشبہ بہ، کی سی = حرفِ تشبیہ، نزاکت = وجہِ شبہ)۔

۲۔ استعارہ (Metaphor):
لفظ کو اس کے حقیقی معنوں کی بجائے مجازی معنوں میں اس طرح استعمال کرنا کہ دونوں میں تشبیہ کا تعلق ہو۔
ارکانِ استعارہ: ۳ ارکان (مستعار لہ، مستعار منہ، وجہِ جامع)۔
مثال: "ماں نے کہا: میرا چاند سو رہا ہے" (یہاں بچے کو چاند کی مانند نہیں بلکہ براہِ راست چاند کہا گیا ہے)۔

۳۔ مطلع اور مقطع:
• مطلع: غزل یا قصیدے کے پہلے شعر کو کہتے ہیں جس کے دونوں مصرعے ہم قافیہ و ہم ردیف ہوں۔
• مقطع: غزل کا آخری شعر جس میں شاعر اپنا تخلص استعمال کرے۔`,
    tags: ['علم بیان', 'تشبیہ', 'استعارہ'],
  },
];

export const ENGLISH_GRAMMAR_ITEMS: GrammarItem[] = [
  {
    id: 'eg_01',
    category: 'eng_tenses',
    title: 'Master Tenses Formula & Conjugation Matrix',
    urduTitle: 'انگریزی کے ۱۲ زمانوں کے مکمل کلیے مع اردو پہچان اور مثالیں',
    boardExamMarks: 10,
    content: `1. Present Indefinite Tense:
• اردو پہچان: تا ہے، تی ہے، تے ہیں، تا ہوں۔
• Formula: Subject + V1 (s/es with He/She/It/Singular) + Object.
• Negative: Subject + do/does + not + V1 + Object.
• Interrogative: Do/Does + Subject + V1 + Object?
• Example: "He operates the network server daily." / "وہ روزانہ نیٹ ورک سرور چلاتا ہے۔"

2. Present Continuous Tense:
• اردو پہچان: رہا ہے، رہی ہے، رہے ہیں۔
• Formula: Subject + is/am/are + V1-ing + Object.
• Example: "The teacher is explaining Bus Topology in Urdu."

3. Present Perfect Tense:
• اردو پہچان: چکا ہے، چکی ہے، چکے ہیں، لیا ہے، دیا ہے۔
• Formula: Subject + has/have + V3 (Past Participle) + Object.
• Example: "We have completed the 1st Year Computer Science syllabus."

4. Past Indefinite Tense (Board Favorite):
• اردو پہچان: یا، ی، ے، تا تھا، تی تھی۔
• Formula: Subject + V2 (Second Form) + Object.
• Negative: Subject + did not + V1 + Object (NOTE: V1 is used after did!).
• Example: "Norma pushed the button on the wooden box."

5. Future Indefinite Tense:
• اردو پہچان: گا، گی، گے۔
• Formula: Subject + will/shall + V1 + Object.
• Example: "The board examinations will commence in May."`,
    rules: [
      'Always remember: "Did not" takes the 1st form of the verb, never the 2nd form.',
      'He/She/It with singular nouns takes "has" and "does"; I/We/They/You takes "have" and "do".',
    ],
    tags: ['Tenses', 'Board Grammar', '12 Tenses'],
  },
  {
    id: 'eg_02',
    category: 'eng_voices',
    title: 'Active and Passive Voice Transformation Rules',
    urduTitle: 'معروف اور مجہول (Active & Passive Voice) کے اصول مع امتحانی مشق',
    boardExamMarks: 5,
    content: `Golden Rules of Passive Voice:
1. Object of the active sentence becomes the Subject of the passive sentence.
2. Always use the 3rd Form of the Verb (V3 / Past Participle) in ALL passive tenses.
3. Use the preposition "by" before the agent/doer.
4. Pronoun shift: I -> me, We -> us, He -> him, She -> her, They -> them, Who -> By whom.

Conjugation Cheat-Sheet:
• Present Indefinite (writes) -> is/am/are + written
• Present Continuous (is writing) -> is/am/are + being + written
• Present Perfect (has written) -> has/have + been + written
• Past Indefinite (wrote) -> was/were + written
• Past Continuous (was writing) -> was/were + being + written
• Past Perfect (had written) -> had + been + written
• Future Indefinite (will write) -> will + be + written
• Modal Verbs (can/may/must write) -> can/may/must + be + written

Board Exam Drill Examples:
1. Active: "He teaches Computer Science."
   Passive: "Computer Science is taught by him."
2. Active: "Norma did not accept the offer."
   Passive: "The offer was not accepted by Norma."
3. Active: "Who invented the analytical engine?"
   Passive: "By whom was the analytical engine invented?"`,
    tags: ['Active Voice', 'Passive Voice'],
  },
  {
    id: 'eg_03',
    category: 'eng_narration',
    title: 'Direct and Indirect Speech (Narration Rules)',
    urduTitle: 'بلا واسطہ و بالواسطہ گفتگو (Direct & Indirect) کے مکمل اصول',
    boardExamMarks: 5,
    content: `Key Terminology:
• Reporting Verb: "He said, ..."
• Reported Speech: "... 'I am reading a book.'"

Four Core Rules:
1. Inverted commas ("...") are removed and replaced by "that" in assertive sentences.
2. Reporting verb: "said to" changes to "told", "asked" (questions), or "ordered/requested" (imperatives).
3. Pronoun Changes (SON Rule):
   • 1st Person (I, We) changes according to the Subject of the reporting verb.
   • 2nd Person (You) changes according to the Object of the reporting verb.
   • 3rd Person (He, She, It, They) undergoes NO change.
4. Tense Back-shifting (Only when reporting verb is in the Past tense):
   • Present Indefinite -> Past Indefinite
   • Present Continuous -> Past Continuous
   • Present Perfect -> Past Perfect
   • Past Indefinite -> Past Perfect
   • Will/Shall -> Would

Board Test Examples:
1. Direct: He said, "I like computer programming."
   Indirect: He said that he liked computer programming.
2. Direct: The teacher said to the student, "Why are you late?"
   Indirect: The teacher asked the student why he was late.
3. Direct: Father said to me, "Do not waste your time."
   Indirect: Father advised me not to waste my time.`,
    tags: ['Direct Indirect', 'Narration'],
  },
  {
    id: 'eg_04',
    category: 'eng_pairs',
    title: 'Top 50 Board Examination Pairs of Words',
    urduTitle: 'انٹر بورڈ کے ۵۰ اہم ترین اور بار بار دہرائے جانے والے الفاظ کے جوڑے',
    boardExamMarks: 5,
    content: `1. Affect / Effect:
• Affect (اثر انداز ہونا - Verb): Hard work will positively affect your board marks.
• Effect (اثر / نتیجہ - Noun): The new educational policy had a remarkable effect.

2. Access / Excess:
• Access (رسائی): Every student has access to the digital library.
• Excess (زیادتی): Excess of everything is bad.

3. Adapt / Adopt:
• Adapt (ڈھالنا): You must adapt to the college environment.
• Adopt (اختیار کرنا / گود لینا): They decided to adopt new study methods.

4. Device / Devise:
• Device (آلہ / پرزہ - Noun): The microprocessor is an electronic computing device.
• Devise (منصوبہ بنانا - Verb): We must devise an effective 3-month study schedule.

5. Principal / Principle:
• Principal (سربراہ ادارہ): The college principal addressed the morning assembly.
• Principle (اصول): He is a man of strict moral principles.

6. Stationary / Stationery:
• Stationary (ساکن): The bus collided with a stationary truck.
• Stationery (کاغذ، قلم، کاپیاں): I bought pens and note registers from the stationery shop.

7. Cite / Sight / Site:
• Cite (حوالہ دینا): He cited an authentic Hadith in his essay.
• Sight (منظر / بصارت): The snow-covered northern peaks were a splendid sight.
• Site (جگہ / مقام): This is the designated construction site for the new computer lab.`,
    tags: ['Pair of Words', '50 Pairs'],
  },
  {
    id: 'eg_05',
    category: 'eng_idioms',
    title: 'Essential Board Examination Idioms & Phrasal Verbs',
    urduTitle: 'انٹر امتحان کے ۵۰ اہم محاورات مع اردو معانی اور امتحانی جملے',
    boardExamMarks: 10,
    content: `1. At the eleventh hour (آخری وقت پر):
Sentence: He submitted his online admission form at the eleventh hour.

2. Burn the midnight oil (رات گئے تک سخت محنت کرنا):
Sentence: Dedicated scholars burn the midnight oil to secure board top positions.

3. In black and white (تحریری صورت میں):
Sentence: The principal demanded the agreement in black and white.

4. Face the music (نتائج کا سامنا کرنا):
Sentence: If you neglect your study quota, you will have to face the music in May exams.

5. Nip in the bud (شروع ہی میں ختم کر دینا):
Sentence: Bad study habits must be nipped in the bud.

6. Through thick and thin (ہر اچھے برے حالات میں):
Sentence: A true friend supports you through thick and thin.

7. A wild goose chase (فضول اور لاحاصل کوشش):
Sentence: Searching for his lost USB in the large stadium was a wild goose chase.`,
    tags: ['Idioms', 'Phrasal Verbs'],
  },
];
