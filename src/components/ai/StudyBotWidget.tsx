import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  Copy,
  CheckCheck,
  Zap,
  UserCheck,
  Settings,
  RotateCcw,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  aiStudyBotService,
  AIChatMessage,
  AIChatAction,
  AIProviderConfig,
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

  // Inline Key & Model Configuration Drawer state
  const [showConfigDrawer, setShowConfigDrawer] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIProviderConfig>(() =>
    aiStudyBotService.loadConfig()
  );
  const [keyInput, setKeyInput] = useState<string>(() => aiConfig.apiKey || '');
  const [showKeyPassword, setShowKeyPassword] = useState(false);
  const [testFeedback, setTestFeedback] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
    latencyMs?: number;
  }>({ status: 'idle', message: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadAllChatData = () => {
    setMessages(aiStudyBotService.getChatHistory(role as 'teacher' | 'student'));
    setDirectMessages(directChatService.getMessages());
    const freshConfig = aiStudyBotService.loadConfig();
    setAiConfig(freshConfig);
    setKeyInput(freshConfig.apiKey || '');
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

  const handleTestAndSaveConfig = async () => {
    setTestFeedback({ status: 'testing', message: 'Testing live connection to API...' });
    const targetConfig: AIProviderConfig = {
      ...aiConfig,
      apiKey: keyInput.trim(),
    };

    const res = await aiStudyBotService.testConnection(targetConfig);
    if (res.success) {
      aiStudyBotService.saveConfig(targetConfig);
      setAiConfig(targetConfig);
      setTestFeedback({
        status: 'success',
        message: `${res.message} (${res.latencyMs}ms)`,
        latencyMs: res.latencyMs,
      });
      setTimeout(() => {
        setShowConfigDrawer(false);
        setTestFeedback({ status: 'idle', message: '' });
      }, 2000);
    } else {
      setTestFeedback({
        status: 'error',
        message: res.message,
      });
    }
  };

  const handleClearChat = () => {
    aiStudyBotService.clearChatHistory(role as 'teacher' | 'student');
    setMessages(aiStudyBotService.getChatHistory(role as 'teacher' | 'student'));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isLoading) return;

    if (chatSource === 'direct') {
      const newMsg = directChatService.sendMessage({
        text,
        senderRole: isTeacher ? 'teacher' : 'student',
      });
      setDirectMessages((prev) => [...prev, newMsg]);
      setInputQuery('');
      return;
    }

    // AI Academic Copilot Mode
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
      const response = await aiStudyBotService.askAI(text, updatedHistory);
      const newHistory = [...updatedHistory, response];
      setMessages(newHistory);
      aiStudyBotService.saveChatHistory(newHistory, role as 'teacher' | 'student');
    } catch (err: any) {
      const fallbackMsg: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ **Connection Error**: ${err?.message || 'Unable to complete request'}. Please verify your API Key via the Settings (⚙️) button above.`,
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

  // Helper to render markdown-formatted text simply and cleanly
  const renderFormattedText = (content: string) => {
    return (
      <div className="space-y-2 whitespace-pre-line leading-relaxed select-text font-sans">
        {content.split('\n\n').map((block, bIdx) => {
          // Check if block is a bulleted list
          if (block.startsWith('• ') || block.startsWith('- ') || block.startsWith('* ')) {
            const lines = block.split('\n');
            return (
              <ul key={bIdx} className="space-y-1 list-none pl-1">
                {lines.map((line, lIdx) => (
                  <li key={lIdx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{parseBoldSpans(line.replace(/^[•\-*]\s*/, ''))}</span>
                  </li>
                ))}
              </ul>
            );
          }

          // Check if block has bold titles or markdown headers
          return <p key={bIdx}>{parseBoldSpans(block)}</p>;
        })}
      </div>
    );
  };

  // Parse inline bold markdown **text**
  const parseBoldSpans = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-zinc-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* 2026 Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-zinc-950 text-white shadow-2xl hover:shadow-emerald-950/40 border border-white/15 backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-1 ring-white/10"
          aria-label="Open Academic AI Assistant"
          title={isTeacher ? 'Open GSA Faculty AI Copilot & Student Chat' : 'Open GSA Academic AI Copilot'}
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
          </div>

          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>GSA Copilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {aiConfig.apiKey ? 'OpenAI Live' : 'AI Assistant'}
              </span>
            </span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              Instant academic answers &bull; 24/7
            </span>
          </div>
        </button>
      )}

      {/* Modern 2026 Slide-over Chat Box */}
      {isOpen && (
        <div className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[440px] sm:h-[640px] h-[92vh] max-h-[92vh] sm:max-h-[88vh] bg-white rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 z-50 text-zinc-900 font-sans">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-950 text-white border-b border-white/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">
                    Global Science Academy
                  </h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                </div>
                <p className="text-[10px] text-zinc-400 truncate">
                  {isTeacher
                    ? 'Faculty Lead Desk \u2022 Sir Ahmad'
                    : '1st Year FA-IT Desk \u2022 Henza Noor'}
                </p>
              </div>
            </div>

            {/* Header Action Tools */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Active Model / Key Pill */}
              <button
                type="button"
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  aiConfig.apiKey
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Configure OpenAI API Key & Model"
              >
                <Zap className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-[80px]">
                  {aiConfig.provider === 'openai' ? aiConfig.model || 'gpt-4o-mini' : aiConfig.provider}
                </span>
                <Settings className="w-3 h-3 opacity-70" />
              </button>

              {/* Clear Chat Button */}
              {chatSource === 'ai' && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Clear chat history"
                  aria-label="Clear chat history"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inline API Key & Model Configuration Drawer */}
          {showConfigDrawer && (
            <div className="p-3.5 bg-zinc-900 text-white border-b border-white/10 text-xs space-y-3 animate-in slide-in-from-top duration-150 shrink-0">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-zinc-200">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-Time OpenAI / Gemini Key Setup</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfigDrawer(false)}
                  className="p-1 text-zinc-400 hover:text-white rounded-md cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Provider & Model Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                    AI Provider
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={(e) =>
                      setAiConfig({ ...aiConfig, provider: e.target.value as any })
                    }
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="offline">Offline Built-In Engine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                    Model Target
                  </label>
                  {aiConfig.provider === 'openai' ? (
                    <select
                      value={aiConfig.model || 'gpt-4o-mini'}
                      onChange={(e) =>
                        setAiConfig({ ...aiConfig, model: e.target.value })
                      }
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium font-mono"
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Recommended)</option>
                      <option value="gpt-4o">gpt-4o (Flagship)</option>
                      <option value="o3-mini">o3-mini (Reasoning)</option>
                      <option value="gpt-4-turbo">gpt-4-turbo</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      disabled
                      value={aiConfig.provider === 'gemini' ? 'gemini-1.5-flash' : 'offline-kb'}
                      className="w-full bg-zinc-800 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-zinc-400 font-mono"
                    />
                  )}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 mb-1">
                  {aiConfig.provider === 'openai'
                    ? 'OpenAI API Key (sk-...)'
                    : 'Gemini API Key (AIza...)'}
                </label>
                <div className="relative">
                  <input
                    type={showKeyPassword ? 'text' : 'password'}
                    placeholder={
                      aiConfig.provider === 'openai'
                        ? 'sk-proj-...'
                        : 'AIzaSy...'
                    }
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/10 rounded-xl pl-3 pr-9 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyPassword(!showKeyPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showKeyPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Feedback status */}
              {testFeedback.message && (
                <div
                  className={`p-2 rounded-xl text-[11px] font-medium flex items-center gap-1.5 ${
                    testFeedback.status === 'success'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : testFeedback.status === 'error'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-zinc-300 border border-white/10'
                  }`}
                >
                  {testFeedback.status === 'success' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : testFeedback.status === 'error' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  )}
                  <span className="leading-tight">{testFeedback.message}</span>
                </div>
              )}

              {/* Save & Test Button */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfigDrawer(false)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTestAndSaveConfig}
                  disabled={testFeedback.status === 'testing'}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {testFeedback.status === 'testing' ? 'Verifying...' : 'Test & Save Connection'}
                </button>
              </div>
            </div>
          )}

          {/* Mode Switcher: AI Assistant vs Direct Contact */}
          <div className="grid grid-cols-2 p-1.5 bg-zinc-100/90 border-b border-zinc-200 text-xs gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setChatSource('ai')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'ai'
                  ? 'bg-white text-emerald-800 shadow-2xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTeacher ? 'Faculty AI Copilot' : 'Academic AI Copilot'}</span>
            </button>
            <button
              type="button"
              onClick={() => setChatSource('direct')}
              className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                chatSource === 'direct'
                  ? 'bg-white text-blue-800 shadow-2xs border border-zinc-200'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isTeacher ? 'Henza Noor (Student)' : 'Sir Ahmad (Lead)'}</span>
            </button>
          </div>

          {/* Direct Mode Banner */}
          {chatSource === 'direct' && (
            <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 text-xs shrink-0">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-blue-900 font-semibold text-[11px]">
                {isTeacher
                  ? 'Direct Channel: Message Henza Noor (1st Year FA-IT Scholar)'
                  : 'Direct Channel: Message Sir Ahmad (Faculty Lead Evaluator)'}
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAF9]">
            {chatSource === 'ai' ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-xs shadow-2xs'
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
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 text-[10px]">
                      <span className={msg.sender === 'user' ? 'text-emerald-100 font-bold' : 'text-emerald-700 font-bold flex items-center gap-1'}>
                        {msg.sender === 'user' ? (
                          isTeacher ? 'Sir Ahmad' : 'Henza Noor'
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>GSA Copilot</span>
                          </>
                        )}
                      </span>
                      <span className={msg.sender === 'user' ? 'text-emerald-200 text-[9px]' : 'text-zinc-400 text-[9px]'}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Body Content */}
                    <div className={msg.sender === 'user' ? 'text-white' : 'text-zinc-900'}>
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Urdu Nastaliq Content if present */}
                    {msg.urduText && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-100 space-y-1">
                        <p className="font-urdu text-[13px] text-zinc-900 leading-relaxed text-right dir-rtl whitespace-pre-line font-medium">
                          {msg.urduText}
                        </p>
                      </div>
                    )}

                    {/* Action buttons (ONLY rendered if message specifically provides interactive actions) */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-100 flex flex-wrap gap-1.5">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Copy Button */}
                    {msg.sender === 'assistant' && (
                      <div className="mt-2 flex items-center justify-end text-[10px] pt-1.5 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="text-zinc-400 hover:text-zinc-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <CheckCheck className="w-3 h-3 text-emerald-600" />
                              <span className="text-[9px] text-emerald-600 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[9px]">Copy answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
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
                          ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-zinc-900 border border-zinc-200/80 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1 text-[10px]">
                        <span className={isMyMessage ? 'text-blue-100 font-bold' : 'text-blue-800 font-bold'}>
                          {isMyMessage
                            ? 'You'
                            : isTeacher
                            ? 'Henza Noor (Student)'
                            : 'Sir Ahmad (Faculty Lead)'}
                        </span>
                        <span className={isMyMessage ? 'text-blue-200 text-[9px]' : 'text-zinc-400 text-[9px]'}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="whitespace-pre-line text-xs font-normal leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-center gap-2 bg-white border border-zinc-200/80 px-3.5 py-2.5 rounded-2xl rounded-bl-xs shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
                <span className="text-[10px] text-zinc-500 font-medium ml-1">
                  Generating straight answer...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips (Sleek Horizontal Scroll Bar) */}
          <div className="px-3 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              Quick:
            </span>
            {[
              { label: '💡 Bus vs Star Topology', query: 'Explain the difference between Bus Topology and Star Topology in detail.' },
              { label: '⚡ CPU Architecture', query: 'What is the function of ALU, Control Unit, and Registers in the CPU?' },
              { label: '📝 30-Mark Test Pattern', query: 'Explain the BISE DG Khan 30-mark diagnostic test pattern and passing criteria.' },
              { label: '🔓 Unlock Test', query: 'unlock test' },
              { label: '✅ Mark Hazri', query: 'mark attendance' },
              { label: '🔄 Sync Sheet', query: 'sync sheet' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip.query)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-zinc-700 hover:text-emerald-800 border border-zinc-200 hover:border-emerald-300 text-[10px] font-semibold transition-all whitespace-nowrap cursor-pointer shadow-2xs active:scale-95"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Modern Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder={
                chatSource === 'direct'
                  ? isTeacher
                    ? 'Message Henza Noor directly...'
                    : 'Message Sir Ahmad directly...'
                  : 'Ask about Computer Science, Urdu grammar, syllabus, or exam...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-zinc-900 placeholder:text-zinc-400 transition-all"
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
