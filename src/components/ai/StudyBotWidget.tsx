import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  X,
  Send,
  GraduationCap,
  Settings,
  Key,
  RefreshCw,
  Copy,
  CheckCheck,
  Calendar,
  Award,
  Zap,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import {
  aiStudyBotService,
  AIChatMessage,
  AIChatAction,
  AIProviderConfig,
} from '../../services/aiStudyBotService';
import { directChatService, DirectChatMessage } from '../../services/directChatService';
import { Button } from '../ui/Button';

export const StudyBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSource, setChatSource] = useState<'ai' | 'teacher'>('ai');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [teacherMessages, setTeacherMessages] = useState<DirectChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<AIProviderConfig>(aiStudyBotService.loadConfig());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(aiStudyBotService.getChatHistory());
    setTeacherMessages(directChatService.getMessages());
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, teacherMessages, chatSource, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (chatSource === 'teacher') {
      // Direct talk with Faculty Lead Ahmad
      const newMsg = directChatService.sendMessage({
        text,
        senderRole: 'student',
      });
      setTeacherMessages((prev) => [...prev, newMsg]);
      setInputQuery('');
      return;
    }

    // AI Study Assistant Mode
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
        text: 'Temporary network disconnect. Here is the offline academic assistant response.',
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

  const PROMPT_CHIPS = [
    { label: 'Explain Bus Topology with real-world analogy', icon: BookOpen },
    { label: 'Reschedule my upcoming test series', icon: Calendar },
    { label: 'Check my certified marks & test scores', icon: Award },
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
            className="sm:hidden flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#142D27] to-[#14B866] text-white shadow-xl active:scale-90 transition-all border border-emerald-400/40 relative"
            aria-label="Open Academic Study Assistant"
          >
            <GraduationCap className="w-5 h-5 text-emerald-100" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27]" />
          </button>

          {/* Desktop Full Pill */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0c0d10] via-[#142D27] to-[#14B866] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-500/30"
            aria-label="Open Academic Study Assistant"
          >
            <div className="relative">
              <GraduationCap className="w-5 h-5 text-emerald-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold tracking-tight">StudyHub Copilot</span>
              <span className="block text-[10px] text-emerald-200 font-medium">AI &amp; Teacher (Ahmad)</span>
            </div>
          </button>
        </>
      )}

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] sm:h-[600px] h-[92vh] max-h-[92vh] sm:max-h-[85vh] bg-[#0c0d10] rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50 text-white">
          {/* Header */}
          <div className="p-3.5 bg-[#090a0c] border-b border-zinc-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-white">
                  StudyHub Assistant
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400">
                  English, Urdu &amp; Roman Urdu Supported
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="AI Provider Settings (OpenAI / Gemini)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: AI Copilot vs Direct with Ahmad (Teacher) */}
          <div className="grid grid-cols-2 p-1.5 bg-[#07080a] border-b border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setChatSource('ai')}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                chatSource === 'ai'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Copilot</span>
            </button>
            <button
              type="button"
              onClick={() => setChatSource('teacher')}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                chatSource === 'teacher'
                  ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct with Ahmad</span>
            </button>
          </div>

          {/* Settings Sub-modal */}
          {showSettings && (
            <div className="p-3 bg-[#111216] border-b border-zinc-800 text-xs space-y-2.5 animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  AI Provider Settings
                </span>
                <span className="text-[10px] text-zinc-500">Config</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                You can insert your Google Gemini or OpenAI key anytime. The system works out-of-the-box with built-in intelligence.
              </p>
              <form onSubmit={handleSaveSettings} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={config.provider}
                    onChange={(e) =>
                      setConfig({ ...config, provider: e.target.value as any })
                    }
                    className="px-2 py-1.5 rounded-lg border border-zinc-700 text-xs bg-zinc-900 text-zinc-200 focus:outline-none"
                  >
                    <option value="openai">OpenAI (GPT-5 Mini / GPT-5)</option>
                    <option value="gemini">Google Gemini (Gemini 1.5)</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="offline">Offline Academic Model</option>
                  </select>

                  {config.provider === 'openai' && (
                    <select
                      value={config.model || 'gpt-5-mini'}
                      onChange={(e) => setConfig({ ...config, model: e.target.value })}
                      className="px-2 py-1.5 rounded-lg border border-zinc-700 text-xs bg-zinc-900 text-zinc-200 focus:outline-none"
                    >
                      <option value="gpt-5-mini">gpt-5-mini (Fast)</option>
                      <option value="gpt-5">gpt-5 (Deep)</option>
                    </select>
                  )}

                  <input
                    type="password"
                    placeholder="API Key (sk-...)"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-xs bg-zinc-900 text-zinc-200 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    OpenAI Key Live
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSettings(false)}
                      className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <Button type="submit" variant="primary" size="sm">
                      Save Key
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Quick Prompt Chips (only for AI mode) */}
          {chatSource === 'ai' && (
            <div className="px-3 py-2 bg-[#090a0c] border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip.label)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-colors flex items-center gap-1"
                >
                  <chip.icon className="w-3 h-3 text-emerald-400" />
                  <span className="truncate max-w-[200px]">{chip.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Teacher Mode Banner */}
          {chatSource === 'teacher' && (
            <div className="p-2.5 bg-blue-950/20 border-b border-blue-900/30 flex items-center gap-2 text-xs shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 font-semibold">
                Direct Academic Channel with Ahmad (Faculty Lead Evaluator)
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-[#0c0d10]">
            {chatSource === 'ai' ? (
              // AI Messages
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#142D27] text-white rounded-br-none border border-emerald-600/30 shadow-sm'
                        : 'bg-[#14161a] text-zinc-100 border border-zinc-800 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {/* Action Executed Banner */}
                    {msg.actionExecuted && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{msg.actionExecuted}</span>
                      </div>
                    )}

                    {/* Message Text - Bold & Direct */}
                    <p className="font-bold text-zinc-100 whitespace-pre-line text-[12px] leading-relaxed">
                      {msg.text}
                    </p>

                    {/* Urdu Explanation */}
                    {msg.urduText && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-2">
                        <p className="font-urdu text-[13px] text-zinc-200 leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                          {msg.urduText}
                        </p>
                      </div>
                    )}

                    {/* Practical Analogy Box */}
                    {msg.analogy && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200 leading-relaxed whitespace-pre-line">
                        {msg.analogy}
                      </div>
                    )}

                    {/* Code snippet or Diagram */}
                    {msg.codeSnippet && (
                      <div className="mt-2 p-2 rounded-lg bg-black text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre border border-zinc-800">
                        {msg.codeSnippet}
                      </div>
                    )}

                    {/* Single Suggestion Pill at Bottom */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center">
                        {msg.actions.slice(0, 1).map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-800/40">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
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
              ))
            ) : (
              // Teacher Direct Messages
              teacherMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.senderRole === 'student' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.senderRole === 'student'
                        ? 'bg-[#142D27] text-white rounded-br-none border border-emerald-600/30'
                        : 'bg-[#151922] text-zinc-100 border border-blue-900/40 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-400 font-semibold">
                      <span>{msg.senderRole === 'teacher' ? 'Ahmad (Faculty Lead)' : 'You (Student)'}</span>
                      {msg.senderRole === 'teacher' && (
                        <span className="px-1 rounded bg-blue-500/20 text-blue-300 text-[8px]">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-zinc-100 whitespace-pre-line text-xs">{msg.text}</p>
                    <span className="block mt-1 text-[9px] text-zinc-500 text-right">{msg.timestamp}</span>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900 p-2.5 rounded-2xl border border-zinc-800 max-w-[70%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Formulating response...</span>
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
            className="p-2.5 bg-[#090a0c] border-t border-zinc-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={
                chatSource === 'ai'
                  ? "Ask in English, Urdu, or Roman Urdu..."
                  : "Message Faculty Lead Ahmad directly..."
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-700 bg-zinc-900 focus:outline-none focus:border-emerald-500 text-white placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-xs active:scale-95 shrink-0"
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
