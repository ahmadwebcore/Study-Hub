import React, { useState } from 'react';
import {
  Send,
  Copy,
  CheckCheck,
  Layers,
  Key,
  Settings,
  X,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  Code2,
  BookOpen,
  Zap,
  RotateCcw,
  Cpu,
  Network,
  Radio,
  LockKeyhole,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  aiStudyBotService,
  AIChatMessage,
  AIProviderConfig,
} from '../../services/aiStudyBotService';

interface ChapterPreset {
  ch: string;
  unitNum: number;
  title: string;
  category: 'cs' | 'grammar' | 'tests';
  boardWeight: string;
  accentColor: string; // Tailored 2026 distinct card hues
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  cardBg: string;
  icon: any;
  topics: {
    title: string;
    tag: string;
    tagColor: string;
    prompt: string;
  }[];
}

export const AITeacherPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>(aiStudyBotService.getChatHistory());
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() => aiStudyBotService.loadConfig());
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'cs' | 'grammar' | 'tests'>('all');

  const CHAPTER_PRESETS: ChapterPreset[] = [
    {
      ch: 'Chapter 1',
      unitNum: 1,
      title: 'Basics of Information Technology',
      category: 'cs',
      boardWeight: '10 Marks',
      accentColor: '#0ea5e9',
      badgeBg: 'bg-sky-50',
      badgeText: 'text-sky-800',
      borderColor: 'border-sky-200/80 hover:border-sky-400',
      cardBg: 'bg-gradient-to-br from-white via-sky-50/20 to-white',
      icon: Cpu,
      topics: [
        {
          title: 'Hardware vs Software Components',
          tag: 'Core Concept',
          tagColor: 'bg-sky-100 text-sky-800',
          prompt: 'Explain Hardware vs Software with practical examples and analogies for 1st Year FA-IT.',
        },
        {
          title: 'System Software vs Application Software',
          tag: 'Board Long Q',
          tagColor: 'bg-indigo-100 text-indigo-800',
          prompt: 'Compare System Software vs Application Software with real-world examples in simple Urdu.',
        },
        {
          title: 'Information Processing Cycle (IPOS)',
          tag: 'Exam Classic',
          tagColor: 'bg-emerald-100 text-emerald-800',
          prompt: 'Explain the 4 stages of the Information Processing Cycle with a clean diagram and board tips.',
        },
      ],
    },
    {
      ch: 'Chapter 2',
      unitNum: 2,
      title: 'Information Networks & Topologies',
      category: 'cs',
      boardWeight: '14 Marks',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      borderColor: 'border-emerald-200/80 hover:border-emerald-400',
      cardBg: 'bg-gradient-to-br from-white via-emerald-50/20 to-white',
      icon: Network,
      topics: [
        {
          title: 'Bus, Star, Ring & Mesh Topologies',
          tag: '100% Expected',
          tagColor: 'bg-rose-100 text-rose-800 font-bold',
          prompt: 'Explain Bus, Star, Ring, and Mesh Topologies with diagrams, advantages, and board questions.',
        },
        {
          title: 'LAN, MAN & WAN Network Scales',
          tag: 'Pakistani Networks',
          tagColor: 'bg-emerald-100 text-emerald-800',
          prompt: 'Contrast LAN, MAN, and WAN with Pakistani real-world examples (PTCL, NTC, Campus Wi-Fi).',
        },
        {
          title: 'OSI 7 Layers & Data Encapsulation',
          tag: 'High Yield',
          tagColor: 'bg-violet-100 text-violet-800',
          prompt: 'Break down all 7 Layers of the OSI model with a simple memory mnemonic for exams.',
        },
      ],
    },
    {
      ch: 'Chapter 3',
      unitNum: 3,
      title: 'Data Communications & Transmission Media',
      category: 'cs',
      boardWeight: '12 Marks',
      accentColor: '#8b5cf6',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      borderColor: 'border-purple-200/80 hover:border-purple-400',
      cardBg: 'bg-gradient-to-br from-white via-purple-50/20 to-white',
      icon: Radio,
      topics: [
        {
          title: 'Simplex, Half-Duplex & Full-Duplex',
          tag: 'Distinction Q',
          tagColor: 'bg-purple-100 text-purple-800',
          prompt: 'Explain Simplex, Half-Duplex, and Full-Duplex transmission with real-world walkie-talkie analogies.',
        },
        {
          title: 'Guided Media: Fiber Optics vs Coaxial',
          tag: 'Technical Q',
          tagColor: 'bg-blue-100 text-blue-800',
          prompt: 'Compare Twisted Pair, Coaxial Cable, and Fiber Optics regarding bandwidth, attenuation, and cost.',
        },
        {
          title: 'Unguided Media: Microwave & Satellite',
          tag: 'Short Q',
          tagColor: 'bg-amber-100 text-amber-800',
          prompt: 'Explain Microwave and Satellite communications in Pakistan with diagrams and exam answers.',
        },
      ],
    },
    {
      ch: 'Chapter 5',
      unitNum: 5,
      title: 'Computer Architecture & CPU Operations',
      category: 'cs',
      boardWeight: '16 Marks',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      borderColor: 'border-amber-200/80 hover:border-amber-400',
      cardBg: 'bg-gradient-to-br from-white via-amber-50/20 to-white',
      icon: Cpu,
      topics: [
        {
          title: 'ALU, Control Unit & System Buses',
          tag: 'Highest Weight',
          tagColor: 'bg-amber-100 text-amber-800 font-bold',
          prompt: 'Explain the internal architecture of CPU: ALU, Control Unit, and System Bus in simple Urdu.',
        },
        {
          title: 'CPU Registers (PC, MAR, MBR, IR, AC)',
          tag: 'MCQ Heavy',
          tagColor: 'bg-orange-100 text-orange-800',
          prompt: 'Explain the 5 essential CPU registers and their roles during program execution.',
        },
        {
          title: 'Difference between RAM and ROM',
          tag: 'Board Favorite',
          tagColor: 'bg-emerald-100 text-emerald-800',
          prompt: 'Tabulate the exact 4-point distinction between RAM and ROM for maximum board marks.',
        },
      ],
    },
    {
      ch: 'Chapter 6',
      unitNum: 6,
      title: 'Security, Copyright & Cyber Laws',
      category: 'cs',
      boardWeight: '8 Marks',
      accentColor: '#f43f5e',
      badgeBg: 'bg-rose-50',
      badgeText: 'text-rose-800',
      borderColor: 'border-rose-200/80 hover:border-rose-400',
      cardBg: 'bg-gradient-to-br from-white via-rose-50/20 to-white',
      icon: LockKeyhole,
      topics: [
        {
          title: 'Viruses, Worms & Trojan Horses',
          tag: 'Distinction Q',
          tagColor: 'bg-rose-100 text-rose-800',
          prompt: 'Differentiate between Virus, Worm, and Trojan Horse with detection and prevention techniques.',
        },
        {
          title: 'Software Piracy & Intellectual Property',
          tag: 'Ethics & Law',
          tagColor: 'bg-zinc-100 text-zinc-800',
          prompt: 'Explain Software Piracy, Copyright laws, and legal consequences under Pakistani cyber law.',
        },
      ],
    },
  ];

  const handleTestKeyConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    try {
      const res = await aiStudyBotService.testConnection(aiConfig);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message, latencyMs: 0 });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleExecuteAction = (actionType: any) => {
    const res = aiStudyBotService.executeAction(actionType);
    const systemNotice: AIChatMessage = {
      id: `msg_act_${Date.now()}`,
      sender: 'assistant',
      text: res.messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const next = [...messages, systemNotice];
    setMessages(next);
    aiStudyBotService.saveChatHistory(next);
    setSaveToast(`Executed: ${res.actionExecuted}`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleAsk = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await aiStudyBotService.askAI(text);
      const withResp = [...next, response];
      setMessages(withResp);
      aiStudyBotService.saveChatHistory(withResp);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    aiStudyBotService.saveChatHistory([]);
    setMessages(aiStudyBotService.getChatHistory());
    setSaveToast('Chat session refreshed.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleQuickSwitchModel = (provider: AIProviderConfig['provider'], modelName: string) => {
    const updated: AIProviderConfig = {
      ...aiConfig,
      provider,
      model: modelName,
    };
    setAiConfig(updated);
    aiStudyBotService.saveConfig(updated);
    setSaveToast(`Active model switched to ${modelName} (${provider.toUpperCase()})`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    aiStudyBotService.saveConfig(aiConfig);
    setShowConfigModal(false);
    setSaveToast(`AI key saved for ${aiConfig.provider.toUpperCase()} (${aiConfig.model || 'default'}).`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const filteredChapters = CHAPTER_PRESETS.filter((ch) => {
    if (activeCategoryFilter === 'all') return true;
    return ch.category === activeCategoryFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {saveToast && (
        <div className="p-3.5 rounded-2xl bg-white text-zinc-900 border border-emerald-300 flex items-center justify-between text-xs font-semibold shadow-md animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveToast}
          </span>
          <button onClick={() => setSaveToast(null)} className="text-zinc-400 hover:text-zinc-700">
            &times;
          </button>
        </div>
      )}

      {/* Top Level Bento Hero Banner (Clean Test Series Mini-Card Aesthetic) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bento Card 1: Active AI Mentor Terminal (Spans 2) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-white border-2 border-emerald-500/80 p-5 sm:p-7 text-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="relative z-10 space-y-3">
            {/* Top Indicator Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {aiConfig.provider === 'openai'
                    ? `OpenAI ${aiConfig.model || 'GPT-5 Mini'} • Live Engine Active`
                    : aiConfig.provider === 'gemini'
                    ? 'Google Gemini 1.5 Flash • Free Tier Active'
                    : aiConfig.provider === 'anthropic'
                    ? 'Anthropic Claude 3.5 Sonnet • Active'
                    : 'Offline Punjab Board Knowledge Base'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Configure Key</span>
                  <Settings className="w-3 h-3 text-zinc-400 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Display Title */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight text-zinc-900 font-serif">
                24/7 AI Academic Mentor &amp; Exam Copilot
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 leading-relaxed max-w-2xl">
                Master 1st Year FA-IT textbooks through real-world analogies, native Urdu breakdowns, and BISE DG Khan board exam scoring rubrics.
              </p>
            </div>
          </div>

          {/* Quick Model Selector Pills in Banner */}
          <div className="relative z-10 pt-4 mt-2 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500 mr-1">Quick Model Switch:</span>
            {[
              { provider: 'openai' as const, model: 'gpt-5-mini', label: 'GPT-5 Mini (Fastest)' },
              { provider: 'openai' as const, model: 'gpt-5', label: 'GPT-5 (Reasoning)' },
              { provider: 'openai' as const, model: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              { provider: 'gemini' as const, model: 'gemini-1.5-flash', label: 'Gemini 1.5' },
              { provider: 'anthropic' as const, model: 'claude-3-5-sonnet', label: 'Claude 3.5' },
            ].map((btn) => {
              const isSelected = aiConfig.provider === btn.provider && aiConfig.model === btn.model;
              return (
                <button
                  key={btn.model}
                  type="button"
                  onClick={() => handleQuickSwitchModel(btn.provider, btn.model)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bento Card 2: Academic Sprint & Board Stats (Spans 1) */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-zinc-200 p-5 sm:p-6 text-zinc-900 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                BISE DG Khan Target
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                May 2027
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between shadow-2xs">
                <span className="text-xs text-zinc-600">Daily Test Standard</span>
                <span className="text-xs font-bold text-amber-700">30 Marks (Pass: 15)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between shadow-2xs">
                <span className="text-xs text-zinc-600">Syllabus Completion</span>
                <span className="text-xs font-bold text-emerald-700">Feb 28 Sprint</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between shadow-2xs">
                <span className="text-xs text-zinc-600">Faculty Director</span>
                <span className="text-xs font-bold text-zinc-900">Ahmad</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 text-center">
            <p className="text-[11px] text-zinc-500 font-medium">
              ⚡ Multilingual: Native Urdu, Roman Urdu &amp; English
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asymmetric Chapter & Topic Bento Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              1st Year Textbook Chapters
            </h3>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PTB Syllabus
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: 'all', label: 'All Units' },
                { id: 'cs', label: 'Computer Science' },
                { id: 'grammar', label: 'Grammar & Urdu' },
                { id: 'tests', label: '30M Tests' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveCategoryFilter(filter.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategoryFilter === filter.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Chapter Bento Cards with Distinct Accent Colors */}
          <div className="space-y-3">
            {filteredChapters.map((chap) => {
              const IconComp = chap.icon;
              return (
                <div
                  key={chap.unitNum}
                  className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-md ${chap.cardBg} ${chap.borderColor}`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold shadow-2xs"
                        style={{ backgroundColor: `${chap.accentColor}20`, color: chap.accentColor }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-zinc-900 block leading-tight">
                          {chap.ch}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">11th Class</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-zinc-200 text-zinc-700 shadow-2xs">
                      {chap.boardWeight}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-zinc-800 mt-2 mb-2.5 leading-snug">
                    {chap.title}
                  </p>

                  {/* Interactive Topics List */}
                  <div className="space-y-1.5">
                    {chap.topics.map((t, tIdx) => (
                      <button
                        key={tIdx}
                        type="button"
                        onClick={() => handleAsk(t.prompt)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 text-xs text-zinc-800 transition-all flex items-start justify-between gap-2 shadow-2xs cursor-pointer group active:scale-[0.99]"
                      >
                        <div className="flex items-start gap-1.5 min-w-0">
                          <BookOpen
                            className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                            style={{ color: chap.accentColor }}
                          />
                          <span className="leading-snug line-clamp-2 font-medium">{t.title}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${t.tagColor}`}>
                          {t.tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Conversational AI Canvas (ChatGPT / Linear 2026 Style) */}
        <div className="lg:col-span-2 space-y-3 flex flex-col h-[820px]">
          {/* Canvas Top Bar */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-3 sm:px-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#142D27] to-[#14B866] text-white flex items-center justify-center font-bold shadow-xs">
                <GraduationCap className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 leading-tight flex items-center gap-1.5">
                  Academic Chat Canvas
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Assistant
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-500">
                  {aiConfig.provider.toUpperCase()} &bull; {aiConfig.model || 'gpt-5-mini'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearChat}
                className="px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear chat messages"
              >
                <RotateCcw className="w-3 h-3 text-zinc-500" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <Settings className="w-3 h-3 text-emerald-600" />
                <span>AI Settings</span>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-4 sm:p-6 overflow-y-auto space-y-5 shadow-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Assistant Label */}
                {msg.sender === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-zinc-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>GSA Academic Tutor</span>
                    <span className="text-[10px] text-zinc-400 font-normal">&bull; {msg.timestamp}</span>
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="font-semibold whitespace-pre-wrap leading-relaxed">{msg.text}</p>

                  {/* 1. Urdu Explanation Card (Soft Mint/Emerald Background) */}
                  {msg.urduText && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5 text-[11px] font-bold text-emerald-900">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          <span>اردو وضاحتی نوٹ (Board Standard)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Urdu Script
                        </span>
                      </div>
                      <p className="font-urdu text-[15px] sm:text-[16px] text-zinc-950 leading-loose text-right dir-rtl whitespace-pre-line font-medium pt-1">
                        {msg.urduText}
                      </p>
                    </div>
                  )}

                  {/* 2. Real-World Analogy Card (Warm Sunset Amber/Orange Gradient) */}
                  {msg.analogy && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50 border border-amber-200/90 text-amber-950 space-y-1.5 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-900 border-b border-amber-200/60 pb-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Practical Real-World Analogy:</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-amber-950 font-medium leading-relaxed font-urdu text-right dir-rtl">
                        {msg.analogy}
                      </p>
                    </div>
                  )}

                  {/* 3. Obsidian Code or Network Architecture Console */}
                  {msg.codeSnippet && (
                    <div className="mt-3.5 rounded-2xl overflow-hidden border border-zinc-800 bg-[#090d0b] text-emerald-400 font-mono text-[11px] sm:text-xs shadow-md">
                      <div className="p-2 px-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-[10px]">
                        <span className="flex items-center gap-1 font-bold text-emerald-400">
                          <Code2 className="w-3 h-3" />
                          Network / Architecture Diagram
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`snippet_${msg.id}`, msg.codeSnippet || '')}
                          className="hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Diagram</span>
                        </button>
                      </div>
                      <div className="p-3.5 overflow-x-auto whitespace-pre leading-relaxed">
                        {msg.codeSnippet}
                      </div>
                    </div>
                  )}

                  {/* 4. BISE DG Khan Board Scoring Guidance (Royal Indigo / Blue Card) */}
                  {msg.boardExamTips && msg.boardExamTips.length > 0 && (
                    <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-indigo-50/80 border border-indigo-200/80 text-indigo-950 space-y-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-900 border-b border-indigo-200/60 pb-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                        <span>BISE DG Khan Exam Guidance &amp; Scoring Secrets:</span>
                      </div>
                      <div className="space-y-1.5 pt-0.5">
                        {msg.boardExamTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs sm:text-[12px] text-zinc-800">
                            <span className="text-indigo-600 font-bold">&bull;</span>
                            <span className="leading-snug">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Interactive Action Buttons (Multi-colored) */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-zinc-200/80 flex flex-wrap items-center gap-1.5">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleExecuteAction(act.actionType)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-zinc-900 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-zinc-200 hover:border-emerald-300 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Bar Footer */}
                  <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/50">
                    <span className="text-[10px]">{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            msg.id,
                            `${msg.text}\n\n${msg.urduText || ''}\n\n${msg.analogy || ''}`
                          )
                        }
                        className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied to Clipboard</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Notes</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-zinc-700 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs w-fit animate-in fade-in duration-150">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold">
                  Academic Tutor is formulating your solution with board scoring tips...
                </span>
              </div>
            )}
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
            {[
              { label: 'Explain Bus Topology in Urdu', q: 'Explain Bus Topology in simple Urdu with practical analogy and board exam questions.' },
              { label: 'Star vs Ring Topology', q: 'Compare Star Topology vs Ring Topology with advantages and board exam tips.' },
              { label: 'CPU ALU vs Control Unit', q: 'Explain CPU Architecture: ALU, Control Unit, and Registers with real-world analogies.' },
              { label: 'Difference between RAM & ROM', q: 'What is the distinction between RAM and ROM in 1st Year CS?' },
              { label: 'Board 30-Mark Test Tips', q: 'How to prepare and score 30/30 in BISE DG Khan FA-IT computer science paper?' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(chip.q)}
                className="shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 hover:border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
              >
                <BookOpen className="w-3 h-3 text-emerald-600" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="bg-white p-2.5 sm:p-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask any question in English, Urdu, or Roman Urdu (e.g. Explain Bus Topology or reschedule test)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-medium"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || isLoading}
              className="shrink-0 flex items-center gap-1.5 px-4 shadow-xs"
            >
              <span>Ask Mentor</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* AI Key Configuration Modal with Live Ping Connection Tester */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">AI Model &amp; API Key Configuration</h3>
                  <p className="text-[11px] text-zinc-500">Configure OpenAI, Google Gemini, or Anthropic</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Select AI Provider
                </label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => setAiConfig({ ...aiConfig, provider: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:border-emerald-600"
                >
                  <option value="openai">OpenAI (Active Key • GPT-5 Mini / GPT-5)</option>
                  <option value="gemini">Google Gemini 1.5 Flash (Free Tier via AI Studio)</option>
                  <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet)</option>
                  <option value="offline">Offline Academic Model (Built-in Punjab Board Knowledge)</option>
                </select>
              </div>

              {aiConfig.provider === 'openai' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    OpenAI Model Target
                  </label>
                  <select
                    value={aiConfig.model || 'gpt-5-mini'}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="gpt-5-mini">gpt-5-mini (Fastest, High Accuracy &amp; Urdu Support — Recommended)</option>
                    <option value="gpt-5">gpt-5 (Deep Reasoning &amp; Research Grade)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Instant Response)</option>
                    <option value="gpt-4o">gpt-4o (Standard Flagship)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  placeholder="Paste your API key here (sk-... / AIza...)"
                  value={aiConfig.apiKey}
                  onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600 font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Stored securely and privately in browser storage.
                </p>
              </div>

              {/* Test Connection Row */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-700">Test API Connection:</span>
                  <button
                    type="button"
                    onClick={handleTestKeyConnection}
                    disabled={isTestingKey}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {isTestingKey ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                        <span>Testing Ping...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Test Connection Now</span>
                      </>
                    )}
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-2 rounded-lg text-[11px] leading-relaxed flex items-start gap-1.5 ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                        testResult.success ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    />
                    <div>
                      <p className="font-semibold">{testResult.message}</p>
                      {testResult.latencyMs > 0 && (
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Response time: {testResult.latencyMs}ms
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" size="sm">
                  Save Key &amp; Apply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
