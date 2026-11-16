import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  CheckCheck,
  User,
  Shield,
  GraduationCap,
  FileText,
  X,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { directChatService, DirectChatMessage } from '../../services/directChatService';
import { BISE_DG_KHAN_INFO } from '../../services/biseDGKhanService';

export const DirectChatPage: React.FC = () => {
  const { role } = useAuth();
  const isTeacher = role === 'teacher';

  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [isTypingCounterpart, setIsTypingCounterpart] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'direct' | 'ai' | 'board'>('direct');
  const [searchContact, setSearchContact] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const counterpartName = isTeacher ? 'Student Scholar' : 'Ahmad';
  const counterpartRoleTitle = isTeacher
    ? 'Enrolled Scholar (1st Year FA-IT, BISE DG Khan)'
    : 'Faculty Lead & Academic Director (Ahmad)';

  const loadMessages = () => {
    const list = directChatService.getMessages();
    setMessages(list);
    directChatService.markAllAsRead(role as 'teacher' | 'student');
  };

  useEffect(() => {
    loadMessages();
  }, [role]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingCounterpart]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const textToSend = inputText.trim() || (attachedFile ? `Attached file: ${attachedFile}` : '');
    const newMsg = directChatService.sendMessage({
      senderRole: role as 'teacher' | 'student',
      text: textToSend,
      attachmentName: attachedFile || undefined,
      attachmentUrl: attachedFile ? `/attachments/${attachedFile}` : undefined,
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setAttachedFile(null);

    // Realistic faculty / student response simulation after 2 seconds if user sends a question
    if (textToSend.includes('?') || textToSend.toLowerCase().includes('sir') || textToSend.toLowerCase().includes('test')) {
      setIsTypingCounterpart(true);
      setTimeout(() => {
        setIsTypingCounterpart(false);
        const replyText = isTeacher
          ? 'Thank you Sir Ahmad for the guidance. I am preparing today\'s 30-mark assessment according to your notes.'
          : 'Noted. Keep your revision consistent and focus on the 30-mark passing benchmark (15/30). Good work!';
        const replyMsg = directChatService.sendMessage({
          senderRole: isTeacher ? 'student' : 'teacher',
          text: replyText,
        });
        setMessages((prev) => [...prev, replyMsg]);
      }, 2000);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setAttachedFile(files[0].name);
    }
  };

  const quickPrompts = isTeacher
    ? [
        'Please review your daily test submission for today.',
        'Great work on yesterday’s paper (28/30). Keep it up!',
        'Make sure to finish the daily reading quota before 8 PM.',
        'Tomorrow’s 30-mark test is scheduled on time.',
      ]
    : [
        'Sir Ahmad, I have completed today’s reading quota.',
        'What chapters are included in tomorrow’s 30-mark test?',
        'I submitted my handwritten test answer sheet.',
        'Could you please clarify Question 2 from the pairing scheme?',
      ];

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden font-sans">
      {/* Left Sidebar: Recent Chats & Channels (Persistent) */}
      <div className="w-full md:w-80 border-r border-zinc-200 bg-zinc-50/70 flex flex-col shrink-0">
        {/* Search & Channel Header */}
        <div className="p-3.5 border-b border-zinc-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Recent Conversations ({messages.length} msgs)
            </h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Search chat history..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-white rounded-lg border border-zinc-200 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Conversation Channels List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-2 space-y-1">
          {/* Channel 1: 1-on-1 Direct Chat with Ahmad / Student */}
          <div
            onClick={() => setActiveChannel('direct')}
            className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-2.5 ${
              activeChannel === 'direct'
                ? 'bg-white border border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                : 'hover:bg-zinc-100 border border-transparent'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                {isTeacher ? <User className="w-4 h-4 text-emerald-700" /> : <Shield className="w-4 h-4 text-emerald-700" />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-900 truncate">
                  {counterpartName}
                </span>
                <span className="text-[10px] text-zinc-400 shrink-0">
                  {lastMessage?.timestamp.split(' at ')[0] || 'Active'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                {lastMessage?.text || 'Private 1-on-1 Academic Channel'}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold">
                  1st Year FA-IT
                </span>
                <span className="text-[10px] text-zinc-400">Live Mentorship</span>
              </div>
            </div>
          </div>

          {/* Channel 2: AI Study Assistant Shortcut */}
          <Link
            to="/ai-teacher"
            className="p-3 rounded-xl hover:bg-zinc-100 border border-transparent transition-all flex items-start gap-2.5 block"
          >
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-200">
              <GraduationCap className="w-4 h-4 text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-900 truncate">
                  AI Study Assistant (24/7 Explainer)
                </span>
                <span className="text-[10px] text-purple-600 font-bold shrink-0">AI Hub</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                Computer Science theory, problem breakdown & exam revision
              </p>
            </div>
          </Link>

          {/* Channel 3: BISE DG Khan Broadcast Alerts */}
          <div className="p-3 rounded-xl bg-white border border-[#e1ede7] flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center text-xs font-bold shrink-0">
              🇵🇰
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-zinc-900 truncate">
                  {BISE_DG_KHAN_INFO.shortName}
                </span>
                <span className="text-[10px] text-zinc-400">May 2027</span>
              </div>
              <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                Syllabus target Feb 28 &bull; 6 Subjects Official Scheme
              </p>
            </div>
          </div>
        </div>

        {/* Footer Retention Guarantee */}
        <div className="p-2.5 border-t border-zinc-200 bg-white text-center">
          <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Zero Deletion &bull; All Messages Retained
          </span>
        </div>
      </div>

      {/* Right Column: Active 1-on-1 Chat Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Chat Top Header */}
        <div className="px-4 py-3.5 border-b border-zinc-200 bg-[#FBFDFB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm">
                {isTeacher ? <User className="w-4 h-4 text-emerald-700" /> : <Shield className="w-4 h-4 text-emerald-700" />}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 leading-tight">
                  {counterpartName}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Now
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">
                {counterpartRoleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/ai-teacher"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-medium text-xs transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">AI Assistant</span>
            </Link>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-zinc-50/40">
          <div className="text-center my-1">
            <span className="text-[10px] font-medium text-zinc-500 bg-white px-3 py-1 rounded-full border border-zinc-200 shadow-2xs">
              Private 1-on-1 Academic Mentorship Channel between Ahmad & Student Scholar
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderRole === role;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%] ${
                  isMe ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold text-zinc-500">
                    {msg.senderName}
                  </span>
                  <span className="text-[10px] text-zinc-400">&bull;</span>
                  <span className="text-[10px] text-zinc-400">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-tr-xs'
                      : 'bg-white text-zinc-900 border border-zinc-200/90 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.attachmentName && (
                    <div
                      className={`mt-2 flex items-center gap-2 p-2 rounded-xl text-xs font-medium ${
                        isMe ? 'bg-emerald-700/50 text-white' : 'bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[200px]">{msg.attachmentName}</span>
                    </div>
                  )}

                  <div className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${isMe ? 'text-emerald-100' : 'text-zinc-400'}`}>
                    {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}

          {isTypingCounterpart && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white border border-zinc-200 px-3 py-2 rounded-xl max-w-[170px] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] font-medium ml-1">{counterpartName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2 border-t border-zinc-100 bg-white overflow-x-auto flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
            Quick:
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleQuickPrompt(p)}
              className="text-[11px] text-zinc-600 bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-zinc-200/80 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Attached file banner */}
        {attachedFile && (
          <div className="px-4 py-1.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-1.5 truncate">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              Ready to send: <strong>{attachedFile}</strong>
            </span>
            <button
              onClick={() => setAttachedFile(null)}
              className="p-1 text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-zinc-200 bg-white flex items-center gap-2 shrink-0"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
            title="Attach worksheet or PDF"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message ${counterpartName}...`}
            className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-[#14B866] focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !attachedFile}
            className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 text-xs font-semibold text-white bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] ring-1 ring-white/15 hover:from-[#193e33] hover:to-[#0c201a] rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
