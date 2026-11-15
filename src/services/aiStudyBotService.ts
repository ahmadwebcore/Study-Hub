// StudyHub AI Study Assistant & Computer Science Urdu Explainer Service
// Translates and breaks down complex English CS concepts into crystal-clear Urdu with real-world practical analogies.
// Accommodates Google Gemini and OpenAI API keys, with full offline academic simulation fallback.

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  urduText?: string;
  analogy?: string;
  boardExamTips?: string[];
  codeSnippet?: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'offline';
  apiKey: string;
  model: string;
}

const STORAGE_KEY_AI_CONFIG = 'studyhub_ai_config_v1';
const STORAGE_KEY_CHAT_HISTORY = 'studyhub_ai_chat_history_v1';

// Rich offline academic knowledge base for 1st Year Intermediate Computer Science
const KNOWLEDGE_BASE: { keywords: string[]; title: string; urduConcept: string; analogy: string; boardTips: string[]; codeSnippet?: string }[] = [
  {
    keywords: ['bus', 'bus topology', 'topology'],
    title: 'Bus Topology (بس ٹوپولوجی)',
    urduConcept: `بس ٹوپولوجی کمپیوٹر نیٹ ورک کی سب سے سادہ قسم ہے جس میں تمام کمپیوٹرز ایک ہی مرکزی کیبل کے ساتھ جڑے ہوتے ہیں۔ اس مرکزی کیبل کو "بیک بون (Backbone)" یا "ٹرنک" کہا جاتا ہے۔ کیبل کے دونوں سروں پر ٹرمینیٹر (Terminators) لگائے جاتے ہیں تاکہ سگنل واپس نہ ٹکرائے (Signal bounce کو روکا جا سکے)۔
اگر ایک کمپیوٹر ڈیٹا بھیجتا ہے تو وہ تمام کمپیوٹرز تک جاتا ہے، لیکن صرف وہی کمپیوٹر اسے وصول کرتا ہے جس کا آئی پی ایڈریس اس سے میچ کرتا ہے۔`,
    analogy: `🚌 پریکٹیکل مثال (بس کا سفر):
تصور کریں کہ ایک سیدھی سڑک ہے جس پر صرف ایک لوکل بس چل رہی ہے۔ سڑک کے کنارے مختلف اسٹاپس پر مسافر کھڑے ہیں۔ بس ہر اسٹاپ سے گزرتی ہے۔ جب تک سڑک بلکل ٹھیک ہے، مسافر سفر کر سکتے ہیں۔ لیکن اگر سڑک بیچ میں سے ٹوٹ جائے (Backbone cable break ہو جائے) تو پوری ٹریفک معطل ہو جائے گی اور کوئی بھی مسافر اپنی منزل پر نہیں پہنچ سکے گا۔ بالکل اسی طرح بس ٹوپولوجی میں اگر مین تار ٹوٹ جائے تو پورا نیٹ ورک بند ہو جاتا ہے۔`,
    boardTips: [
      'لاہور اور راولپنڈی بورڈ میں 5 نمبر کا لانگ سوال: "بس ٹوپولوجی کی تعریف کریں اور اس کے فوائد و نقصانات لکھیں۔"',
      'اہم فائدہ: انسٹال کرنا انتہائی سستا اور آسان ہے، کم تاریں استعمال ہوتی ہیں۔',
      'بڑا نقصان: ٹرمینل تار خراب ہونے سے پورا نیٹ ورک بیٹھ جاتا ہے اور فالٹ تلاش کرنا مشکل ہوتا ہے۔',
    ],
    codeSnippet: `[Terminator] === [PC 1] === [PC 2] === [PC 3] === [PC 4] === [Terminator]
                     |           |           |           |
               (Backbone Shared Transmission Line)`,
  },
  {
    keywords: ['star', 'star topology'],
    title: 'Star Topology (اسٹار ٹوپولوجی)',
    urduConcept: `اسٹار ٹوپولوجی میں تمام کمپیوٹرز ایک مرکزی ڈیوائس کے ساتھ جڑے ہوتے ہیں جسے ہب (Hub) یا سوئچ (Switch) کہا جاتا ہے۔ ہر کمپیوٹر کی اپنی الگ کیبل ہب تک جاتی ہے۔ ڈیٹا پہلے ہب میں جاتا ہے اور پھر مطلوبہ کمپیوٹر تک پہنچتا ہے۔
یہ سب سے زیادہ استعمال ہونے والی ٹوپولوجی ہے کیونکہ اگر ایک تار ٹوٹ بھی جائے تو باقی پورا نیٹ ورک بالکل نارمل چلتا رہتا ہے۔`,
    analogy: `🏢 پریکٹیکل مثال (کالج کا پرنسپل آفس):
سوچیں کہ کالج میں ایک پرنسپل کا دفتر (مرکزی Switch) ہے اور باقی تمام کلاس رومز کے ٹیلی فون براہ راست پرنسپل آفس سے جڑے ہیں۔ اگر کلاس 11 کا فون خراب ہو جائے تو کلاس 12 یا 10 کے رابطے پر کوئی فرق نہیں پڑے گا۔ لیکن اگر خود پرنسپل آفس کا مین ایکسچینج خراب ہو جائے تو پورا کالج رابطہ کھو بیٹھے گا۔`,
    boardTips: [
      'شارٹ سوال: "اسٹار ٹوپولوجی بس ٹوپولوجی سے بہتر کیوں ہے؟"',
      'جواب: کیونکہ اس میں ایک کیبل خراب ہونے سے دوسرے کمپیوٹرز متاثر نہیں ہوتے۔',
      'نقصان: ہب یا سوئچ مہنگا ہوتا ہے اور کیبل کا خرچہ زیادہ آتا ہے۔',
    ],
    codeSnippet: `          [PC 1]
             \\
   [PC 4] --- [CENTRAL SWITCH / HUB] --- [PC 2]
             /
          [PC 3]`,
  },
  {
    keywords: ['cpu', 'processor', 'alu', 'cu', 'registers'],
    title: 'CPU Architecture: ALU, Control Unit & Registers',
    urduConcept: `سی پی یو (CPU) کو کمپیوٹر کا دماغ کہا جاتا ہے۔ اس کے بنیادی طور پر تین اہم حصے ہوتے ہیں:
1. ALU (Arithmetic & Logic Unit): یہ تمام حسابی عمل (جمع، تفریق، ضرب، تقسیم) اور منطقی موازنے (جیسے چھوٹا، بڑا، برابر) سرانجام دیتا ہے۔
2. CU (Control Unit): یہ پورے کمپیوٹر کا نگران (سپروائزر) ہے جو ہدایات لاتا ہے (Fetch)، سمجھتا ہے (Decode)، اور دیگر حصوں کو کام کا حکم دیتا ہے۔
3. Registers: یہ سی پی یو کے اندر انتہائی تیز رفتار چھوٹی میموری ہوتی ہے جو عارضی ڈیٹا اور ہدایات کو چند مائیکرو سیکنڈز کے لیے محفوظ کرتی ہے۔`,
    analogy: `👨‍🏫 پریکٹیکل مثال (اسکول کا ہیڈ ماسٹر اور میتھ ٹیچر):
Control Unit اسکول کا 'ہیڈ ماسٹر' ہے جو دیکھتا ہے کہ کون سی کلاس میں کیا کام ہونا ہے۔ ALU اسکول کا 'ریاضی کا استاد' ہے جو بلیک بورڈ پر سوالات حل کرتا ہے۔ اور Registers استاد کی 'جیب میں رکھی ہوئی چھوٹی نوٹ بک' ہے جس میں وہ فوری حساب کتاب نوٹ کرتے ہیں تاکہ بار بار الماری (RAM) تک نہ جانا پڑے۔`,
    boardTips: [
      'بورڈ ایم سی کیو: "کمپیوٹر کا سپروائزر کون سا یونٹ کہلاتا ہے؟" درست جواب: Control Unit۔',
      'اہم رجسٹرز: Program Counter (PC), Instruction Register (IR), Accumulator (AC), Memory Address Register (MAR)۔',
    ],
  },
  {
    keywords: ['ram', 'rom', 'memory'],
    title: 'Difference between RAM & ROM (ریم اور روم میں فرق)',
    urduConcept: `1. RAM (Random Access Memory): یہ عارضی میموری (Volatile) ہے۔ اس میں صرف وہی پروگرام اور ڈیٹا ہوتا ہے جو اس وقت چل رہا ہو۔ جیسے ہی کمپیوٹر بند یا بجلی چلی جائے، اس کا سارا ڈیٹا غائب ہو جاتا ہے۔
2. ROM (Read Only Memory): یہ مستقل میموری (Non-Volatile) ہے۔ اس میں کمپیوٹر کو اسٹارٹ کرنے والے ابتدائی پروگرام (BIOS / UEFI) محفوظ ہوتے ہیں۔ بجلی بند ہونے پر بھی اس کا ڈیٹا محفوظ رہتا ہے۔`,
    analogy: `📖 پریکٹیکل مثال (سٹڈی ٹیبل بمقابلہ لائبریری کی الماری):
RAM آپ کی 'پڑھنے والی میز (Study Desk)' کی طرح ہے۔ جب آپ پڑھ رہے ہوتے ہیں تو کتابیں میز پر پھیلی ہوتی ہیں۔ لائٹ جانے یا کمرہ چھوڑنے پر میز صاف ہو جاتی ہے۔
جبکہ ROM وہ 'لکڑی پر کھدی ہوئی تحریر' ہے جو کبھی مٹ نہیں سکتی، چاہے کتنی ہی لائٹ چلی جائے۔`,
    boardTips: [
      'بورڈ کا پسندیدہ 4 نمبر کا فرق: Volatile vs Non-Volatile، Read/Write vs Read-Only، اور Speed۔',
      'RAM کے اقسام: SRAM (Static RAM - تیز اور مہنگی) اور DRAM (Dynamic RAM - جسے Refresh کرنا پڑتا ہے)۔',
    ],
  },
  {
    keywords: ['operating system', 'os', 'windows', 'linux'],
    title: 'Operating System & Its Primary Functions',
    urduConcept: `آپریٹنگ سسٹم (OS) وہ بنیادی سسٹم سافٹ ویئر ہے جو یوزر (User) اور کمپیوٹر ہارڈ ویئر کے درمیان رابطے کا پل ہے۔ یہ کمپیوٹر کے تمام وسائل مثلاً پروسیسر، ریم، ہارڈ ڈرائیو اور ان پٹ آؤٹ پٹ ڈیوائسز کا انتظام سنبھالتا ہے۔
اہم کام: Process Management, Memory Allocation, File Management, Device Control, and Security.`,
    analogy: `🚦 پریکٹیکل مثال (ٹریفک وارڈن اور ایئرپورٹ مینیجر):
اگر چوراہے پر ٹریفک وارڈن نہ ہو تو ہر گاڑی دوسری سے ٹکرائے گی اور جام لگ جائے گا۔ آپریٹنگ سسٹم کمپیوٹر کا ٹریفک وارڈن ہے جو طے کرتا ہے کہ پہلے کس پروگرام کو پروسیسر ملے گا، کس کو کتنی ریم ملے گی، اور فائلیں کہاں محفوظ ہوں گی۔`,
    boardTips: [
      'بورڈ پیپر سوال: ملٹی ٹاسکنگ اور ملٹی پروگرامنگ میں کیا فرق ہے؟',
      'مثالیں: Microsoft Windows, Linux, macOS, Android.',
    ],
  },
  {
    keywords: ['february', 'target', 'sprint', 'schedule', 'timetable', 'guide as a teacher', 'teacher'],
    title: 'Teacher Guidance: 3-Month Board Exam Strategy (Nov to Feb 28)',
    urduConcept: `بطور استاد میری طرف سے آپ کے لیے فروری ۲۸ تک سلیبس مکمل کرنے کا مکمل گولڈن پلان:
1. روزانہ صرف ایک مخصوص مضمون پر مکمل توجہ دیں (جیسے جمعرات کو صرف کمپیوٹر سائنس)۔
2. کمپیوٹر سائنس کی انگریزی اصطلاحات کو رٹنے کی بجائے ان کا بنیادی تصور (Concept) سمجھیں۔
3. ہر مضمون کا روزانہ ٹارگٹ ۲ سے ۲.۵ صفحات ہیں۔ اگر آپ روزانہ اتنا پڑھ لیں تو ۲۸ فروری تک ۱۰۰ فیصد سلیبس مکمل ہو جائے گا۔
4. اتوار کا دن مکمل آرام اور گزشتہ ہفتے کی دہرائی کے لیے رکھیں۔
5. مارچ اور اپریل کے دو مہینے صرف بورڈ کے گزشتہ ۵ سالہ پیپرز حل کرنے کے لیے بچیں گے۔`,
    analogy: `🎯 استاد کی نصیحت:
"قطرہ قطرہ دریا بنتا ہے۔ روزانہ ۳ سوالات یاد کرنے والا طالب علم امتحان کی رات رات بھر جاگنے والے سے ۳۰ فیصد زیادہ نمبر لیتا ہے۔"`,
    boardTips: [
      'پیپر پریزنٹیشن: 605 مارکر سے بڑی ہیڈنگز اور 604 سے سب ہیڈنگز دیں۔',
      'کمپیوٹر سائنس میں لانگ سوال کے ساتھ ہاتھ سے چھوٹی سی ڈایاگرام ضرور بنائیں۔ اس سے پورے 8 نمبر ملتے ہیں۔',
    ],
  },
];

export class AIStudyBotService {
  private config: AIProviderConfig = {
    provider: 'offline',
    apiKey: '',
    model: 'gemini-1.5-flash',
  };

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): AIProviderConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return this.config;
  }

  public saveConfig(config: AIProviderConfig): void {
    this.config = config;
    try {
      localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }

  public getChatHistory(): AIChatMessage[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHAT_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    // Default initial warm welcome from Ustad AI
    return [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: 'Assalam-o-Alaikum! I am StudyHub AI Teacher (استاد AI). Aap apni Computer Science ki English book ka koi bhi topic yahan paste karein, main aapko aasan Urdu aur practical misaal k sath samjhaon ga.',
        urduText: 'السلام علیکم! میں آپ کا سٹڈی ہب اے آئی استاد ہوں۔ کمپیوٹر سائنس یا گرائمر کا کوئی بھی انگلش ٹاپک لکھیں، میں آپ کو بالکل آسان اردو، روزمرہ زندگی کی مثال اور بورڈ کے اہم سوالات کے ساتھ سمجھاؤں گا۔',
        analogy: '💡 ہمارا مقصد: انگلش کتاب کے مشکل الفاظ کو اپنی مادری زبان میں ایسا سمجھنا کہ بورڈ میں 100% نمبر حاصل ہو سکیں۔',
        boardExamTips: [
          'ہفتہ وار شیڈول کے مطابق جمعرات کو کمپیوٹر سائنس کی مکمل تیاری کریں۔',
          'سلیبس ۲۸ فروری تک ختم کرنے کے لیے روزانہ ۲ سے ۲.۵ صفحات کی قسط مکمل کریں۔',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  }

  public saveChatHistory(history: AIChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHAT_HISTORY, JSON.stringify(history.slice(-30)));
    } catch {
      // ignore
    }
  }

  public async askAI(query: string): Promise<AIChatMessage> {
    // If an external API key is configured and not empty
    if (this.config.apiKey && this.config.apiKey.trim().length > 5) {
      try {
        if (this.config.provider === 'gemini') {
          return await this.callGeminiAPI(query);
        } else if (this.config.provider === 'openai') {
          return await this.callOpenAIAPI(query);
        }
      } catch (err) {
        console.warn('External AI call failed, falling back to local academic engine:', err);
      }
    }

    // Local Academic Simulation Engine
    return this.generateOfflineResponse(query);
  }

  private generateOfflineResponse(query: string): AIChatMessage {
    const qLower = query.toLowerCase();

    // Check knowledge base matching
    const matched = KNOWLEDGE_BASE.find((item) =>
      item.keywords.some((kw) => qLower.includes(kw))
    );

    if (matched) {
      return {
        id: `msg_${Date.now()}`,
        sender: 'assistant',
        text: `Here is the comprehensive Urdu breakdown and practical analogy for "${matched.title}":`,
        urduText: matched.urduConcept,
        analogy: matched.analogy,
        boardExamTips: matched.boardTips,
        codeSnippet: matched.codeSnippet,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    // General academic response in rich Urdu
    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: `Let me explain "${query}" in simple Urdu for 1st Year Intermediate students:`,
      urduText: `آپ نے "${query}" کے بارے میں دریافت کیا ہے۔
کمپیوٹر سائنس اور انٹرمیڈیٹ بورڈ کے لحاظ سے اس تصور کا خلاصہ یہ ہے کہ کمپیوٹر سسٹم میں ہر عمل ڈیٹا کو ان پٹ لے کر، اسے پروسیس کر کے کارآمد انفارمیشن میں تبدیل کرنا ہوتا ہے۔

اس موضوع کے ۳ بنیادی مراحل:
۱. تعریف و بنیادی اصول (Definition & Core Concept)
۲. عملی اطلاق (Real-world Practical Application)
۳. امتحانی خاکہ اور اہم فارمولا (Examination Structure)`,
      analogy: `💡 پریکٹیکل مثال:
تصور کریں کہ ایک بینک یا پوسٹ آفس ہے جہاں ٹوکن سسٹم لگا ہوا ہے۔ ہر کسٹمر باری باری کاؤنٹر پر آتا ہے، اپنا کام کرواتا ہے اور چلا جاتا ہے۔ کمپیوٹر سسٹم بھی اسی طرح قطار (Queue) اور نظم و ضبط کے تحت ہر ہدایات کو سرانجام دیتا ہے۔`,
      boardExamTips: [
        'اس سوال کو پیپر میں ہمیشہ تین حصوں میں لکھیں: Definition، Working Principle، اور Advantages۔',
        'اگر ڈایاگرام ممکن ہو تو مارکر سے واضح بلاک خاکہ بنائیں تاکہ مکمل نمبر ملیں۔',
        'فروری ۲۸ تک سلیبس مکمل کرنے کے لیے آج کے ۲ صفحات نوٹ بک پر تحریر کریں۔',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private async callGeminiAPI(prompt: string): Promise<AIChatMessage> {
    const systemPrompt = `You are StudyHub Ustad AI (استاد AI), a senior Pakistani Intermediate Board Computer Science professor.
The student has English textbooks (Punjab Textbook Board 11th Class).
Your job is to explain the English concept in very clear, respectful Urdu (اردو) with:
1. آسان اردو میں سادہ مفہوم (Plain Urdu explanation)
2. روزمرہ زندگی کی پریکٹیکل مثال (Practical everyday life analogy in Pakistan, e.g., traffic, bazaar, library, cricket)
3. بورڈ امتحانی اہم نکات (Punjab & Federal Board 5-mark short/long exam tips)
4. اگر ممکن ہو تو خاکہ یا کوڈ۔
Respond in friendly tone encouraging the student to finish their syllabus by February 28th.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.config.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nStudent Query: ${prompt}` },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: 'AI Teacher Explanation (Live Gemini Analysis):',
      urduText: candidateText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  private async callOpenAIAPI(prompt: string): Promise<AIChatMessage> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are StudyHub Ustad AI, a senior Pakistani teacher explaining English Computer Science topics in easy Urdu with practical Pakistani real-world analogies and board examination advice.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    return {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text: 'AI Teacher Explanation (Live OpenAI):',
      urduText: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}

export const aiStudyBotService = new AIStudyBotService();
