import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Copy,
  CheckCheck,
  Layers,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  aiStudyBotService,
  AIChatMessage,
} from '../../services/aiStudyBotService';

export const AITeacherPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>(aiStudyBotService.getChatHistory());
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#142D27] via-[#1A3831] to-[#0D1F1A] rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#14B866]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14B866]/20 border border-[#14B866]/30 text-[#14B866] text-xs font-semibold">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Study Assistant &bull; 24/7 Academic Copilot & Teacher Guide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Computer Science Concepts &bull; Clear Explanations with Practical Analogies
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Have questions on your textbook, practicals, or exam preparation? Type any concept in English, Urdu, or Roman Urdu. The AI Assistant explains complex computing topics with real-world analogies, code architecture, and board scoring tips.
          </p>
        </div>
      </div>

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

                  {/* Action Bar */}
                  <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-200/50">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, `${msg.urduText || ''}\n\n${msg.analogy || ''}`)}
                        className="text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-semibold"
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
