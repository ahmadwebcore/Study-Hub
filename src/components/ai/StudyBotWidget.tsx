import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Settings,
  Key,
  Cpu,
  RefreshCw,
  Copy,
  CheckCheck,
  Calendar,
  Award,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import {
  aiStudyBotService,
  AIChatMessage,
  AIChatAction,
  AIProviderConfig,
} from '../../services/aiStudyBotService';
import { Button } from '../ui/Button';

export const StudyBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIProviderConfig>(aiStudyBotService.loadConfig());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(aiStudyBotService.getChatHistory());
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await aiStudyBotService.askAI(text);
      const newHistory = [...updatedHistory, response];
      setMessages(newHistory);
      aiStudyBotService.saveChatHistory(newHistory);
    } catch {
      const fallbackMsg: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Temporary network disconnect. Here is the offline academic assistant response:',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedHistory, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: AIChatAction) => {
    const result = aiStudyBotService.executeAction(action.actionType);
    const actionMsg: AIChatMessage = {
      id: `msg_act_${Date.now()}`,
      sender: 'assistant',
      text: result.messageText,
      actionExecuted: result.actionExecuted,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { id: 'act_check', label: 'View Certified Marks (28/30)', actionType: 'check_marks' },
        { id: 'act_wa', label: 'Share Report on WhatsApp', actionType: 'share_whatsapp' },
      ],
    };
    const updated = [...messages, actionMsg];
    setMessages(updated);
    aiStudyBotService.saveChatHistory(updated);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    aiStudyBotService.saveConfig(config);
    setShowSettings(false);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action / Prompt chips
  const PROMPT_CHIPS = [
    { label: 'Explain Bus Topology with real-world analogy', icon: Cpu },
    { label: 'Reschedule my upcoming test series', icon: Calendar },
    { label: 'Check my certified marks & test scores', icon: Award },
    { label: "Mark today's quota task as completed", icon: CheckCircle2 },
  ];

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <>
          {/* Mobile Compact Circular FAB */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="sm:hidden flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#142D27] to-[#14B866] text-white shadow-xl active:scale-90 transition-all border border-emerald-400/40 relative"
            aria-label="Open AI Study Assistant"
          >
            <Bot className="w-5 h-5 text-emerald-200" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27] animate-ping" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27]" />
          </button>

          {/* Desktop Full Pill */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#142D27] to-[#14B866] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400/30"
            aria-label="Open AI Study Assistant"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-emerald-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold tracking-tight">AI Study Assistant</span>
              <span className="block text-[10px] text-emerald-200">24/7 Academic Copilot</span>
            </div>
          </button>
        </>
      )}

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] sm:h-[580px] h-[92vh] max-h-[92vh] sm:max-h-[85vh] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#142D27] to-[#1A3831] text-white flex items-center justify-between border-b border-emerald-900/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  AI Study Assistant &bull; 24/7 Copilot
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                    Live Actions
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-300">
                  English, Urdu & Roman Urdu with live automations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                title="API Key Settings (OpenAI / Gemini)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-modal */}
          {showSettings && (
            <div className="p-3.5 bg-zinc-50 border-b border-zinc-200 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  AI Provider Settings
                </span>
                <span className="text-[10px] text-zinc-500">Optional key</span>
              </div>
              <p className="text-[11px] text-zinc-600">
                You can insert your Google Gemini or OpenAI key anytime. The system works completely out-of-the-box with built-in academic intelligence.
              </p>
              <form onSubmit={handleSaveSettings} className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={config.provider}
                    onChange={(e) =>
                      setConfig({ ...config, provider: e.target.value as any })
                    }
                    className="px-2 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:outline-none"
                  >
                    <option value="offline">Offline Academic Model</option>
                    <option value="gemini">Google Gemini (Recommended)</option>
                    <option value="openai">OpenAI ChatGPT (GPT-4o)</option>
                    <option value="anthropic">Anthropic Claude (Claude 3.5)</option>
                  </select>

                  <input
                    type="password"
                    placeholder="Paste API Key here (AIza... / sk-...)"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-800 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Key
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-zinc-50 border-b border-zinc-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {PROMPT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.label)}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 border border-zinc-200 transition-colors flex items-center gap-1"
              >
                <chip.icon className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[200px]">{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[#FAFBFB]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#142D27] text-white rounded-br-none shadow-sm'
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  {/* Action Executed Banner */}
                  {msg.actionExecuted && (
                    <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{msg.actionExecuted}</span>
                    </div>
                  )}

                  {/* Message Text */}
                  <p className="font-semibold whitespace-pre-line">{msg.text}</p>

                  {/* Urdu Explanation */}
                  {msg.urduText && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-2">
                      <p className="font-urdu text-[13px] text-zinc-900 leading-relaxed text-right dir-rtl whitespace-pre-line">
                        {msg.urduText}
                      </p>
                    </div>
                  )}

                  {/* Practical Analogy Box */}
                  {msg.analogy && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[12px] text-amber-950 leading-relaxed whitespace-pre-line">
                      {msg.analogy}
                    </div>
                  )}

                  {/* Code snippet or Diagram */}
                  {msg.codeSnippet && (
                    <div className="mt-2.5 p-2 rounded-lg bg-zinc-900 text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre">
                      {msg.codeSnippet}
                    </div>
                  )}

                  {/* Board Exam Tips */}
                  {msg.boardExamTips && msg.boardExamTips.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-1 text-[11px]">
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Board Exam Key Points:
                      </span>
                      {msg.boardExamTips.map((tip, i) => (
                        <p key={i} className="text-zinc-600 pl-2 border-l-2 border-emerald-500">
                          &bull; {tip}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Interactive Action Buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act) => (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all hover:scale-[1.02] flex items-center gap-1 shadow-xs"
                        >
                          <Zap className="w-3 h-3 text-emerald-600" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Footer */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(msg.id, `${msg.text}\n\n${msg.urduText || ''}\n\n${msg.analogy || ''}`)}
                        className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white p-3 rounded-2xl border border-zinc-200 max-w-[70%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#14B866]" />
                <span>AI Study Assistant is formulating solution...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-zinc-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask in English, Urdu, or Roman Urdu (e.g. 'reschedule test', 'my marks')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-300 focus:outline-none focus:border-[#14B866] text-zinc-900"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#14B866] hover:bg-[#109552] disabled:opacity-50 text-white transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
