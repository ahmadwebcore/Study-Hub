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
import { useAuth } from '../../contexts/AuthContext';
import {
  aiStudyBotService,
  AIChatMessage,
  AIChatAction,
} from '../../services/aiStudyBotService';
import { directChatService, DirectChatMessage } from '../../services/directChatService';

export const StudyBotWidget: React.FC = () => {
  const { role } = useAuth();
  const isTeacher = role === 'teacher';

  const [isOpen, setIsOpen] = useState(false);
  const [chatSource, setChatSource] = useState<'ai' | 'direct'>('ai');
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAllChatData = () => {
    setMessages(aiStudyBotService.getChatHistory(role as 'teacher' | 'student'));
    setDirectMessages(directChatService.getMessages());
  };

  useEffect(() => {
    loadAllChatData();
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  }, [messages, directMessages, chatSource, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (chatSource === 'direct') {
      // Direct messaging between Teacher Ahmad & Student Henza Noor
      const newMsg = directChatService.sendMessage({
        text,
        senderRole: isTeacher ? 'teacher' : 'student',
      });
      setDirectMessages((prev) => [...prev, newMsg]);
      setInputQuery('');
      return;
    }

    // AI Academic / Faculty Assistant Mode
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
      aiStudyBotService.saveChatHistory(newHistory, role as 'teacher' | 'student');
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
    aiStudyBotService.saveChatHistory(updated, role as 'teacher' | 'student');
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
          title={isTeacher ? 'Chat with Faculty Assistant & Henza Noor' : 'Chat with Faculty & Academic Tutor'}
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

      {/* Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[430px] sm:h-[620px] h-[92vh] max-h-[92vh] sm:max-h-[85vh] bg-white rounded-3xl border border-[#e1ede7] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50 text-[#142D27]">
          {/* Header */}
          <div className="p-3.5 bg-white border-b border-[#e1ede7] text-[#142D27] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <h4 className="text-xs font-bold flex items-center gap-1.5 text-[#142D27]">
                  Global Science Academy
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    Fatehpur &bull; Live
                  </span>
                </h4>
                <p className="text-[10px] text-[#557067]">
                  {isTeacher
                    ? 'Faculty Lead & Evaluator Desk \u2022 Sir Ahmad'
                    : '1st Year Scholar Desk \u2022 Henza Noor'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#7d9990] hover:text-[#142D27] hover:bg-[#E7EFEA] transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mode Switcher: AI Assistant vs Direct Contact */}
          <div className="grid grid-cols-2 p-1.5 bg-[#F7F9F8] border-b border-[#e1ede7] text-xs gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setChatSource('ai')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'ai'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27] hover:bg-white/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTeacher ? 'Faculty AI Assistant' : 'Academic Tutor'}</span>
            </button>
            <button
              type="button"
              onClick={() => setChatSource('direct')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'direct'
                  ? 'bg-white text-blue-800 shadow-2xs border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27] hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTeacher ? 'Student (Henza Noor)' : 'Faculty Lead (Sir Ahmad)'}</span>
            </button>
          </div>

          {/* Direct Mode Banner */}
          {chatSource === 'direct' && (
            <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-900 font-semibold text-[11px]">
                {isTeacher
                  ? 'Direct Academic Channel with Henza Noor (1st Year FA-IT Scholar)'
                  : 'Direct Academic Channel with Sir Ahmad (Faculty Lead Evaluator)'}
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F7F9F8]">
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
                        ? 'bg-[#dcf8c6] text-[#142D27] border border-[#c4f4be] rounded-tr-xs shadow-xs'
                        : 'bg-white text-[#142D27] border border-[#e1ede7] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {/* Action Executed Banner */}
                    {msg.actionExecuted && (
                      <div className="mb-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{msg.actionExecuted}</span>
                      </div>
                    )}

                    {/* Sender Header */}
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px]">
                      <span className={msg.sender === 'user' ? 'text-emerald-800 font-bold' : 'text-emerald-700 font-bold'}>
                        {msg.sender === 'user'
                          ? (isTeacher ? 'You (Sir Ahmad)' : 'You (Henza Noor)')
                          : (isTeacher ? 'GSA Faculty Assistant' : 'GSA Academic Tutor')}
                      </span>
                      {msg.sender === 'assistant' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-bold">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Message Body */}
                    <p className="whitespace-pre-line text-xs font-normal leading-relaxed text-[#142D27]">
                      {msg.text}
                    </p>

                    {/* Urdu Nastaliq Content if present */}
                    {msg.urduText && (
                      <div className="mt-2.5 pt-2 border-t border-[#e1ede7] space-y-1.5">
                        <p className="font-urdu text-[13px] text-[#142D27] leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                          {msg.urduText}
                        </p>
                      </div>
                    )}

                    {/* Practical Analogy if present */}
                    {msg.analogy && (
                      <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-[#2e473f] leading-relaxed whitespace-pre-line">
                        {msg.analogy}
                      </div>
                    )}

                    {/* Code snippet if present */}
                    {msg.codeSnippet && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#F7F9F8] text-emerald-900 font-mono text-[10px] overflow-x-auto whitespace-pre border border-[#e1ede7]">
                        {msg.codeSnippet}
                      </div>
                    )}

                    {/* Action buttons only if explicitly provided for interactive actions */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#e1ede7] flex items-center">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-100">
                      <span className={msg.sender === 'user' ? 'text-emerald-800/80' : 'text-[#7d9990]'}>
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'assistant' ? (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-[#7d9990] hover:text-[#142D27] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
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
                        <span className="text-emerald-700 font-bold text-[9px]">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Direct Messages between Teacher and Student
              directMessages.map((msg) => {
                const isMyMessage = isTeacher
                  ? msg.senderRole === 'teacher'
                  : msg.senderRole === 'student';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        isMyMessage
                          ? 'bg-[#dcf8c6] text-[#142D27] border border-[#c4f4be] rounded-tr-xs shadow-xs'
                          : 'bg-white text-[#142D27] border border-blue-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {/* Header: Sender & Badge */}
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold">
                        <span className={isMyMessage ? 'text-emerald-800 font-bold' : 'text-blue-700 font-bold'}>
                          {msg.senderRole === 'teacher'
                            ? (isTeacher ? 'You (Sir Ahmad)' : 'Sir Ahmad (Faculty Lead)')
                            : (isTeacher ? 'Henza Noor (Student)' : 'You (Henza Noor)')}
                        </span>
                        {msg.senderRole === 'teacher' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-[8px] font-bold">
                            Faculty Director
                          </span>
                        )}
                        {msg.senderRole === 'student' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-bold">
                            1st Year Scholar
                          </span>
                        )}
                      </div>

                      {/* Message Body */}
                      <p className="whitespace-pre-line text-xs font-normal leading-relaxed text-[#142D27]">
                        {msg.text}
                      </p>

                      {/* Footer */}
                      <div className="mt-2 flex items-center justify-end text-[9px] gap-1 pt-1.5 border-t border-zinc-100">
                        <span className={isMyMessage ? 'text-emerald-800/80' : 'text-[#7d9990]'}>
                          {msg.timestamp}
                        </span>
                        {isMyMessage && <span className="text-emerald-700 font-bold">✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-center gap-1.5 bg-white border border-[#e1ede7] px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
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
            className="p-3 bg-white border-t border-[#e1ede7] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={
                chatSource === 'direct'
                  ? (isTeacher ? 'Message Henza Noor directly...' : 'Message Sir Ahmad directly...')
                  : (isTeacher ? 'Ask Faculty AI about curriculum, grading rubrics, student pacing...' : 'Ask about Computer Science, Urdu grammar, daily test...')
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#e1ede7] bg-[#F7F9F8] focus:bg-white focus:outline-none focus:border-emerald-600 text-[#142D27] placeholder:text-[#7d9990]"
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
