import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  GraduationCap,
  Copy,
  CheckCheck,
  Zap,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import {
  aiStudyBotService,
  AIChatMessage,
  AIChatAction,
} from '../../services/aiStudyBotService';
import { directChatService, DirectChatMessage } from '../../services/directChatService';

export const StudyBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSource, setChatSource] = useState<'ai' | 'teacher'>('ai');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [teacherMessages, setTeacherMessages] = useState<DirectChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAllChatData = () => {
    setMessages(aiStudyBotService.getChatHistory());
    setTeacherMessages(directChatService.getMessages());
  };

  useEffect(() => {
    loadAllChatData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages, teacherMessages, chatSource, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (chatSource === 'teacher') {
      // Direct message with Faculty Lead Ahmad
      const newMsg = directChatService.sendMessage({
        text,
        senderRole: 'student',
      });
      setTeacherMessages((prev) => [...prev, newMsg]);
      setInputQuery('');
      return;
    }

    // Academic Tutor Mode
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
    };
    const updated = [...messages, actionMsg];
    setMessages(updated);
    aiStudyBotService.saveChatHistory(updated);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* WhatsApp-Style Clean Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xl hover:shadow-2xl shadow-emerald-950/30 transition-all duration-200 hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer"
          aria-label="Open Academic Chat"
          title="Chat with Faculty & Academic Tutor"
        >
          {/* WhatsApp-style message bubble icon */}
          <MessageSquare className="w-6 h-6 text-white drop-shadow-xs fill-white/20 transition-transform group-hover:scale-105" />

          {/* Pulse Ripple & Live Dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white shadow-xs">
            1
          </span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-400 animate-ping opacity-75" />
        </button>
      )}

      {/* Slide-over Chat Box (Executive Light-Black Aesthetic) */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[430px] sm:h-[620px] h-[92vh] max-h-[92vh] sm:max-h-[85vh] bg-[#141518] rounded-3xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50 text-zinc-100">
          {/* Header (Clean, No Technical Settings Gear) */}
          <div className="p-3.5 bg-[#18181b] border-b border-zinc-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-zinc-100">
                  Global Science Academy
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Fatehpur &bull; Live
                  </span>
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Academic Support &amp; Evaluation &bull; Henza Noor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: Academic Tutor vs Faculty Lead (Ahmad) */}
          <div className="grid grid-cols-2 p-1.5 bg-[#18181b]/90 border-b border-zinc-800 text-xs gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setChatSource('ai')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'ai'
                  ? 'bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Academic Tutor</span>
            </button>
            <button
              type="button"
              onClick={() => setChatSource('teacher')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'teacher'
                  ? 'bg-zinc-800 text-blue-400 shadow-xs border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Faculty Lead (Ahmad)</span>
            </button>
          </div>

          {/* Teacher Mode Direct Banner */}
          {chatSource === 'teacher' && (
            <div className="p-2.5 bg-blue-950/40 border-b border-blue-800/40 flex items-center gap-2 text-xs shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-blue-300 font-semibold text-[11px]">
                Direct Academic Channel with Ahmad (Faculty Lead Evaluator)
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#101114]">
            {chatSource === 'ai' ? (
              // AI / Academic Tutor Messages
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-[#18181b] text-zinc-100 border border-zinc-700/80 rounded-tl-xs shadow-md'
                    }`}
                  >
                    {/* Action Executed Banner */}
                    {msg.actionExecuted && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{msg.actionExecuted}</span>
                      </div>
                    )}

                    {/* Sender Header */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px]">
                      <span className={msg.sender === 'user' ? 'text-emerald-100 font-bold' : 'text-emerald-400 font-bold'}>
                        {msg.sender === 'user' ? 'You (Henza)' : 'GSA Academic Tutor'}
                      </span>
                      {msg.sender === 'assistant' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[8px] font-bold">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <p className={`whitespace-pre-line text-xs font-normal leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-zinc-100'}`}>
                      {msg.text}
                    </p>

                    {/* Urdu Nastaliq Content if present */}
                    {msg.urduText && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-700/60 space-y-1.5">
                        <p className="font-urdu text-[13px] text-zinc-200 leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                          {msg.urduText}
                        </p>
                      </div>
                    )}

                    {/* Practical Analogy if present */}
                    {msg.analogy && (
                      <div className="mt-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line">
                        {msg.analogy}
                      </div>
                    )}

                    {/* Code snippet if present */}
                    {msg.codeSnippet && (
                      <div className="mt-2 p-2.5 rounded-lg bg-black text-emerald-400 font-mono text-[10px] overflow-x-auto whitespace-pre border border-zinc-800">
                        {msg.codeSnippet}
                      </div>
                    )}

                    {/* Action buttons only if explicitly provided for interactive actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-700/60 flex items-center">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-emerald-400" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-white/10">
                      <span className={msg.sender === 'user' ? 'text-emerald-100' : 'text-zinc-400'}>
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'assistant' ? (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-400" />
                              <span className="text-[9px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[9px]">Copy</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-white font-bold text-[9px]">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Faculty Lead (Ahmad) Direct Messages
              teacherMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.senderRole === 'student' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.senderRole === 'student'
                        ? 'bg-emerald-600 text-white rounded-tr-xs shadow-md'
                        : 'bg-[#18181b] text-zinc-100 border border-zinc-700/80 rounded-tl-xs shadow-md'
                    }`}
                  >
                    {/* Header: Sender & Badge */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold">
                      <span className={msg.senderRole === 'student' ? 'text-emerald-100 font-bold' : 'text-blue-400 font-bold'}>
                        {msg.senderRole === 'teacher' ? 'Ahmad (Faculty Lead)' : 'You (Henza)'}
                      </span>
                      {msg.senderRole === 'teacher' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[8px] font-bold">
                          Faculty Director
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <p className={`whitespace-pre-line text-xs font-normal leading-relaxed ${msg.senderRole === 'student' ? 'text-white' : 'text-zinc-100'}`}>
                      {msg.text}
                    </p>

                    {/* Footer */}
                    <div className="mt-2 flex items-center justify-end text-[9px] gap-1 pt-1.5 border-t border-white/10">
                      <span className={msg.senderRole === 'student' ? 'text-emerald-100' : 'text-zinc-400'}>
                        {msg.timestamp}
                      </span>
                      {msg.senderRole === 'student' && <span className="text-white font-bold">✓✓</span>}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex items-center gap-1.5 bg-[#18181b] border border-zinc-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
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
            className="p-3 bg-[#18181b] border-t border-zinc-800 flex items-center gap-2 shrink-0"
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
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-700 bg-zinc-900 focus:bg-zinc-850 focus:outline-none focus:border-emerald-500 text-zinc-100 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
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
