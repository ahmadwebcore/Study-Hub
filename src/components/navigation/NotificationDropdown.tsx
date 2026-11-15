import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Clock,
  Award,
  CheckCheck,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  X,
  Smartphone,
  BookOpen,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';

type FilterCategory = 'all' | 'board' | 'test' | 'quota' | 'faculty';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    notificationService.getNotifications()
  );
  const [pushStatus, setPushStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(
    notificationService.getPushPermissionStatus()
  );
  const [pushToast, setPushToast] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = () => {
    setNotifications(notificationService.getNotifications());
    setPushStatus(notificationService.getPushPermissionStatus());
  };

  useEffect(() => {
    window.addEventListener('studyhub_notification_update', refresh);
    return () => window.removeEventListener('studyhub_notification_update', refresh);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkItemRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) {
      notificationService.markAsRead(notif.id);
    }
    setIsOpen(false);

    if (notif.category === 'board' || notif.actionUrl === '/board') {
      setIsBoardModalOpen(true);
      return;
    }

    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      return;
    }

    switch (notif.category) {
      case 'test':
        navigate('/tests');
        break;
      case 'assignment':
        navigate('/library');
        break;
      case 'schedule':
        navigate('/weekly-tasks');
        break;
      case 'chat':
        navigate('/chat');
        break;
      case 'grade':
        navigate('/results');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  const handleEnablePush = async () => {
    const granted = await notificationService.requestPushPermission();
    setPushStatus(granted ? 'granted' : 'denied');
    if (granted) {
      setPushToast('📱 Mobile Push Notifications enabled!');
      setTimeout(() => setPushToast(null), 3000);
    } else {
      setPushToast('Permission denied. Please allow notifications in browser settings.');
      setTimeout(() => setPushToast(null), 3500);
    }
  };

  const handleSendTestAlert = () => {
    const added = notificationService.triggerTestPushAlert();
    setPushToast(`🔔 Alert sent: ${added.title.slice(0, 25)}...`);
    setTimeout(() => setPushToast(null), 3000);
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'board':
        return <span className="text-sm">🇵🇰</span>;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'test':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      case 'grade':
        return <Award className="w-4 h-4 text-sky-400" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'board') return n.category === 'board';
    if (activeCategory === 'test') return n.category === 'test';
    if (activeCategory === 'quota') return n.category === 'assignment' || n.category === 'schedule';
    if (activeCategory === 'faculty') return n.category === 'chat' || n.category === 'grade';
    return true;
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Navbar Bell Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 shadow-xs focus:outline-none cursor-pointer ${
            isOpen
              ? 'bg-[#142D27] text-emerald-400 border-[#14B866]'
              : 'border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50'
          }`}
          aria-label="View notifications"
          title="Academic Alerts & Board Feed"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white shadow-xs animate-in zoom-in duration-150">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Redesigned 2026 Dark Glassmorphic Notification Drawer */}
            <div className="fixed inset-x-2.5 top-16 max-h-[85vh] sm:max-h-[640px] sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute sm:w-[460px] rounded-3xl bg-[#09090b]/95 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 flex flex-col overflow-hidden text-white animate-in fade-in zoom-in-95 duration-200">
              {/* Top Mesh Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Toast Feedback Overlay */}
              {pushToast && (
                <div className="absolute top-2 inset-x-4 z-20 p-2.5 rounded-xl bg-emerald-500/90 text-white text-xs font-semibold text-center shadow-lg border border-white/20 animate-in fade-in slide-in-from-top-2 duration-150">
                  {pushToast}
                </div>
              )}

              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-zinc-950/40 relative z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#09090b] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-zinc-100 font-serif tracking-tight flex items-center gap-2">
                      <span>Academic Alerts &amp; Board Feed</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {unreadCount} new
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-sans">
                      Real-time tests, daily book quotas &amp; BISE DG Khan notices
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3 h-3" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Close notification panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Category Tabs (Sleek Dark Bento Chips) */}
              <div className="flex items-center gap-1.5 p-2.5 bg-zinc-950/60 border-b border-white/5 overflow-x-auto text-[11px] no-scrollbar shrink-0">
                {[
                  { id: 'all', label: 'All', count: notifications.length },
                  {
                    id: 'test',
                    label: '30M Tests',
                    count: notifications.filter((n) => n.category === 'test').length,
                  },
                  {
                    id: 'quota',
                    label: 'Daily Quota',
                    count: notifications.filter(
                      (n) => n.category === 'assignment' || n.category === 'schedule'
                    ).length,
                  },
                  {
                    id: 'board',
                    label: 'DG Khan Board',
                    count: notifications.filter((n) => n.category === 'board').length,
                  },
                  {
                    id: 'faculty',
                    label: 'Faculty Lead',
                    count: notifications.filter(
                      (n) => n.category === 'chat' || n.category === 'grade'
                    ).length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as FilterCategory)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1 shrink-0 cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs font-bold ring-1 ring-emerald-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 bg-white/5 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="opacity-70 text-[10px]">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Notification Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-zinc-950/50 relative z-10 divide-none">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400 shadow-sm">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-zinc-200 font-serif">All caught up!</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                      Zero pending alerts in this category. You are on track with your study quota.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative p-3.5 rounded-2xl transition-all duration-200 border cursor-pointer ${
                        !notif.read
                          ? notif.urgent
                            ? 'bg-zinc-900/95 border-amber-500/30 hover:border-amber-400/60 shadow-lg shadow-black/20'
                            : 'bg-zinc-900/90 border-emerald-500/30 hover:border-emerald-400/60 shadow-lg shadow-black/20'
                          : 'bg-zinc-900/40 border-white/5 hover:border-white/15 hover:bg-zinc-900/70 text-zinc-400'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category Avatar */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border mt-0.5 shadow-2xs ${
                            notif.category === 'test'
                              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400'
                              : notif.category === 'assignment'
                              ? 'bg-amber-950/70 border-amber-500/30 text-amber-400'
                              : notif.category === 'board'
                              ? 'bg-sky-950/70 border-sky-500/30 text-sky-300'
                              : 'bg-zinc-800 border-white/10 text-zinc-300'
                          }`}
                        >
                          {getCategoryIcon(notif.category)}
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {notif.urgent && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                  Urgent
                                </span>
                              )}
                              {notif.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10 text-[9px] font-semibold shrink-0">
                                  {notif.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>

                          <h5
                            className={`text-xs font-bold mt-1 line-clamp-1 group-hover:text-emerald-300 transition-colors ${
                              !notif.read ? 'text-zinc-100' : 'text-zinc-300'
                            }`}
                          >
                            {notif.title}
                          </h5>

                          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed font-sans">
                            {notif.message}
                          </p>

                          {/* Card Footer Actions */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notif);
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-2xs group-hover:translate-x-0.5 cursor-pointer"
                            >
                              <span>{notif.actionLabel || 'View Details'}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                            </button>

                            {!notif.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkItemRead(e, notif.id)}
                                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/5 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Mark read</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread Glowing Dot */}
                      {!notif.read && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#09090b] shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Redesigned Footer (Mobile Native Push Controls & Shortcuts) */}
              <div className="p-3 border-t border-white/10 bg-zinc-950/80 relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Native Mobile Push Button */}
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                      pushStatus === 'granted'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                    }`}
                    title={
                      pushStatus === 'granted'
                        ? 'Native device push notifications active'
                        : 'Enable real OS push notifications'
                    }
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {pushStatus === 'granted' ? '✓ Mobile Push Active' : 'Enable Mobile Push'}
                    </span>
                  </button>

                  {/* Send Test Push Alert */}
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Send an instant simulated push alert"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send Instant Alert</span>
                  </button>

                  {/* BISE Desk Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsBoardModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-sky-300 hover:text-sky-200 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>🇵🇰 BISE Desk</span>
                    <ExternalLink className="w-3 h-3 text-sky-400" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-zinc-400 hover:text-white font-medium self-end sm:self-auto cursor-pointer px-2 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* BISE DG Khan Board Modal */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </>
  );
};
