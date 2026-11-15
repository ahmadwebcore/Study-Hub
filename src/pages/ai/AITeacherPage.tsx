import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  CheckCheck,
  Layers,
  Key,
  Settings,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  aiStudyBotService,
  AIChatMessage,
  AIProviderConfig,
} from '../../services/aiStudyBotService';

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

  const CHAPTER_PRESETS = [
    {
      ch: 'Chapter 1',
      title: 'Basics of Information Technology',
      topics: [
        'Hardware vs Software Components',
        'System Software vs Application Software',
        'Information Processing Cycle (Input, Process, Output, Storage)',
      ],
    },
    {
      ch: 'Chapter 2',
      title: 'Information Networks & Topologies',
      topics: [
        'Bus, Star, Ring, and Mesh Topologies Comparison',
        'LAN, MAN, and WAN with real-world Pakistani network examples',
        'OSI Model 7 Layers and Data Encapsulation',
      ],
    },
    {
      ch: 'Chapter 3',
      title: 'Data Communications',
      topics: [
        'Simplex, Half-Duplex, and Full-Duplex transmission modes',
        'Guided Media (Twisted Pair, Coaxial, Fiber Optics)',
        'Unguided Media (Microwave, Satellite, Bluetooth, Wi-Fi)',
      ],
    },
    {
      ch: 'Chapter 5',
      title: 'Computer Architecture & CPU',
      topics: [
        'ALU, Control Unit and System Bus (Data, Address, Control)',
        'CPU Registers (PC, MAR, MBR, IR, Accumulator)',
        'Instruction Cycle (Fetch, Decode, Execute)',
      ],
    },
    {
      ch: 'Chapter 6',
      title: 'Security, Copyright & The Law',
      topics: [
        'Computer Viruses, Worms, Trojan Horses and Antivirus',
        'Software Piracy and Intellectual Property Rights',
        'Data Privacy and Cybercrime Laws in Pakistan',
      ],
    },
  ];

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

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    aiStudyBotService.saveConfig(aiConfig);
    setShowConfigModal(false);
    setSaveToast(`AI key saved for ${aiConfig.provider.toUpperCase()}.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {saveToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-xs animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveToast}
          </span>
          <button onClick={() => setSaveToast(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#142D27] via-[#1A3831] to-[#0D1F1A] rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#14B866]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14B866]/20 border border-[#14B866]/30 text-[#14B866] text-[11px] font-semibold max-w-full">
              <Bot className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">AI Study Assistant &bull; 24/7 Academic Copilot</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {aiConfig.provider === 'openai'
                  ? `OpenAI ${aiConfig.model || 'GPT-5 Mini'} (Live Key Connected)`
                  : aiConfig.provider === 'gemini'
                  ? 'Google Gemini 1.5 Flash (Active)'
                  : aiConfig.provider === 'anthropic'
                  ? 'Anthropic Claude 3.5 Sonnet (Active)'
                  : 'Offline Punjab Board Engine'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug break-words">
              Computer Science Concepts &bull; Clear Explanations with Practical Analogies
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Have questions on your textbook, practicals, or exam preparation? Type any concept in English, Urdu, or Roman Urdu. The AI Assistant explains complex computing topics with real-world analogies, code architecture, and board scoring tips.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all backdrop-blur-sm self-start shrink-0"
          >
            <Key className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Key ({aiConfig.provider === 'offline' ? 'Offline' : aiConfig.provider.toUpperCase()})</span>
            <Settings className="w-3.5 h-3.5 text-zinc-300 ml-1" />
          </button>
        </div>
      </div>

      {/* AI Key Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">AI Model & API Key Configuration</h3>
                  <p className="text-[11px] text-zinc-500">Select Google Gemini, OpenAI, or Anthropic</p>
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
                  Select AI Engine
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
                    OpenAI Model
                  </label>
                  <select
                    value={aiConfig.model || 'gpt-5-mini'}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    <option value="gpt-5-mini">gpt-5-mini (Fastest, Urdu Support & Cost Effective)</option>
                    <option value="gpt-5">gpt-5 (Deep Reasoning & Research Grade)</option>
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
                  Your key is securely stored in your browser's private local storage.
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
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {isTestingKey ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                        <span>Testing Ping...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-emerald-600" />
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
                  Save Key & Apply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Preset Chapters & Topics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#14B866]" />
              1st Year Textbook Chapters
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PTB Syllabus
            </span>
          </div>

          <div className="space-y-3">
            {CHAPTER_PRESETS.map((chap, idx) => (
              <Card key={idx} className="p-3.5 space-y-2.5 hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">{chap.ch}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">11th Class</span>
                </div>
                <p className="text-xs font-semibold text-emerald-800">{chap.title}</p>
                <div className="space-y-1.5 pt-1">
                  {chap.topics.map((topic, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => handleAsk(`Explain ${topic} in simple Urdu with a practical real-world analogy and board exam questions.`)}
                      className="w-full text-left p-2 rounded-lg bg-zinc-50 hover:bg-emerald-50 hover:text-emerald-800 border border-zinc-200 text-xs text-zinc-700 transition-colors flex items-start gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{topic}</span>
                    </button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column (2 spans): Conversational Teacher Desk */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-[750px]">
          {/* Chat Messages Log */}
          <div className="flex-1 bg-white rounded-2xl border border-[#e1ede7] p-4 sm:p-6 overflow-y-auto space-y-4 shadow-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#142D27] text-white rounded-br-none shadow-sm'
                      : 'bg-[#F7F9F8] text-zinc-800 border border-[#e1ede7] rounded-bl-none'
                  }`}
                >
                  <p className="font-semibold">{msg.text}</p>

                  {/* Urdu Explanation */}
                  {msg.urduText && (
                    <div className="mt-3 pt-3 border-t border-zinc-200/80 space-y-2">
                      <p className="font-urdu text-[15px] text-zinc-900 leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                        {msg.urduText}
                      </p>
                    </div>
                  )}

                  {/* Analogy Box */}
                  {msg.analogy && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-[13px] text-amber-950 font-urdu leading-relaxed text-right dir-rtl shadow-xs">
                      {msg.analogy}
                    </div>
                  )}

                  {/* Code or Diagram */}
                  {msg.codeSnippet && (
                    <div className="mt-3 p-3 rounded-xl bg-zinc-900 text-emerald-400 font-mono text-[11px] overflow-x-auto whitespace-pre border border-zinc-700">
                      {msg.codeSnippet}
                    </div>
                  )}

                  {/* Board Exam Tips */}
                  {msg.boardExamTips && msg.boardExamTips.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-200 space-y-1.5">
                      <span className="font-bold text-emerald-700 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Board Exam Guidance & Scoring Tips:
                      </span>
                      {msg.boardExamTips.map((tip, i) => (
                        <p key={i} className="text-zinc-700 text-xs pr-2 border-l-2 border-emerald-500">
                          {tip}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-200/80 flex flex-wrap items-center gap-1.5">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleExecuteAction(act.actionType)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/50">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, `${msg.urduText || ''}\n\n${msg.analogy || ''}`)}
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
              <div className="flex items-center gap-2.5 text-xs text-zinc-600 bg-white p-3.5 rounded-2xl border border-zinc-200 w-fit">
                <span className="w-3 h-3 rounded-full bg-[#14B866] animate-ping" />
                <span className="font-medium">AI Study Assistant is formulating your solution and exam tips...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                className="shrink-0 text-[11px] px-3 py-1 rounded-full bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 transition-colors flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="bg-white p-3 rounded-2xl border border-[#e1ede7] shadow-sm flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask any question in English, Urdu, or Roman Urdu (e.g. Explain Bus Topology or reschedule test)..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-[#14B866]"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!inputQuery.trim() || isLoading}
              className="shrink-0 flex items-center gap-1.5"
            >
              <span>Ask Teacher</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
