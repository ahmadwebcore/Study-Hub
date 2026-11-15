import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  GraduationCap,
  Settings,
  Key,
  RefreshCw,
  Copy,
  CheckCheck,
  Zap,
  UserCheck,
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

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <>
          {/* Mobile Compact Circular FAB */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="sm:hidden flex items-center justify-center w-12 h-12 rounded-full bg-[#142D27] text-white shadow-xl active:scale-90 transition-all border border-emerald-400/40 relative"
            aria-label="Open Academic Study Assistant"
          >
            <GraduationCap className="w-5 h-5 text-emerald-300" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#142D27]" />
          </button>

          {/* Desktop Full Pill */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#142D27] hover:bg-[#193a32] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-500/30"
            aria-label="Open Academic Study Assistant"
          >
            <div className="relative">
              <GraduationCap className="w-5 h-5 text-emerald-300" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold tracking-tight">GSA Academic Tutor</span>
              <span className="block text-[10px] text-emerald-200 font-medium">Ahmad &amp; Senior Faculty</span>
            </div>
          </button>
        </>
      )}

      {/* Slide-over Chat Box (Crisp Light-Themed Professional UI) */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[420px] sm:h-[600px] h-[92vh] max-h-[92vh] sm:max-h-[85vh] bg-white rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50 text-zinc-900">
          {/* Header */}
          <div className="p-3.5 bg-[#142D27] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-white">
                  Global Science Academy Tutor
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Live
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-300">
                  Fatehpur &bull; English, Urdu &amp; Roman Urdu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                title="AI Provider Settings (OpenAI / Gemini)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: Academic Tutor vs Direct with Ahmad (Teacher) */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F7F9F8] border-b border-zinc-200 text-xs">
            <button
              type="button"
              onClick={() => setChatSource('ai')}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                chatSource === 'ai'
                  ? 'bg-white text-[#142D27] shadow-xs border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Academic Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => setChatSource('teacher')}
              className={`py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                chatSource === 'teacher'
                  ? 'bg-white text-[#142D27] shadow-xs border border-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Faculty Lead (Ahmad)</span>
            </button>
          </div>

          {/* Settings Sub-modal */}
          {showSettings && (
            <div className="p-3 bg-zinc-50 border-b border-zinc-200 text-xs space-y-2.5 animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  AI Provider Configuration
                </span>
                <span className="text-[10px] text-zinc-500">Settings</span>
              </div>
              <p className="text-[11px] text-zinc-600">
                You can insert your Google Gemini or OpenAI key anytime. The system works out-of-the-box with built-in intelligence.
              </p>
              <form onSubmit={handleSaveSettings} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={config.provider}
                    onChange={(e) =>
                      setConfig({ ...config, provider: e.target.value as any })
                    }
                    className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-800 focus:outline-none focus:border-emerald-600"
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
                      className="px-2 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-800 focus:outline-none"
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
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 text-xs bg-white text-zinc-800 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OpenAI Key Live
                  </span>
                  <div className="flex items-center gap-2">
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
                </div>
              </form>
            </div>
          )}

          {/* Teacher Mode Banner */}
          {chatSource === 'teacher' && (
            <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-900 font-semibold">
                Direct Academic Channel with Ahmad (Faculty Lead Evaluator)
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFCFB]">
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
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-900 border border-zinc-200/90 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {/* Action Executed Banner */}
                    {msg.actionExecuted && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{msg.actionExecuted}</span>
                      </div>
                    )}

                    {/* Message Text - Bold & Direct */}
                    <p className={`whitespace-pre-line text-[12px] leading-relaxed font-semibold ${msg.sender === 'user' ? 'text-white' : 'text-zinc-900'}`}>
                      {msg.text}
                    </p>

                    {/* Urdu Explanation */}
                    {msg.urduText && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-200 space-y-2">
                        <p className="font-urdu text-[13px] text-zinc-800 leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                          {msg.urduText}
                        </p>
                      </div>
                    )}

                    {/* Practical Analogy Box */}
                    {msg.analogy && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed whitespace-pre-line">
                        {msg.analogy}
                      </div>
                    )}

                    {/* Code snippet or Diagram */}
                    {msg.codeSnippet && (
                      <div className="mt-2 p-2.5 rounded-lg bg-zinc-900 text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre border border-zinc-800">
                        {msg.codeSnippet}
                      </div>
                    )}

                    {/* Single Suggestion Pill at Bottom */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-200 flex items-center">
                        {msg.actions.slice(0, 1).map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
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
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-900 border border-zinc-200 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-semibold">
                      <span className={msg.senderRole === 'student' ? 'text-emerald-100' : 'text-zinc-600'}>
                        {msg.senderRole === 'teacher' ? 'Ahmad (Faculty Lead)' : 'You (Henza)'}
                      </span>
                      {msg.senderRole === 'teacher' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[8px] font-bold">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className={`whitespace-pre-line text-xs font-medium leading-relaxed ${msg.senderRole === 'student' ? 'text-white' : 'text-zinc-900'}`}>
                      {msg.text}
                    </p>
                    <span className={`block mt-1 text-[9px] text-right ${msg.senderRole === 'student' ? 'text-emerald-100' : 'text-zinc-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-zinc-600 bg-white p-2.5 rounded-2xl border border-zinc-200 max-w-[70%] shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
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
            className="p-2.5 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
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
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-zinc-900 placeholder-zinc-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-xs active:scale-95 shrink-0"
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
