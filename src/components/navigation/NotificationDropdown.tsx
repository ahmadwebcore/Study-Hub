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
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-100'
              : 'border-[#e1ede7] bg-white text-[#557067] hover:text-[#142D27] hover:bg-[#F7F9F8]'
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

            {/* Redesigned 2026 Crisp White Glassmorphic Notification Drawer */}
            <div className="fixed inset-x-2.5 top-16 max-h-[85vh] sm:max-h-[640px] sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute sm:w-[460px] rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#e1ede7] shadow-2xl z-50 flex flex-col overflow-hidden text-[#142D27] animate-in fade-in zoom-in-95 duration-200">
              {/* Top Subtle Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Toast Feedback Overlay */}
              {pushToast && (
                <div className="absolute top-2 inset-x-4 z-20 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold text-center shadow-lg border border-emerald-400/30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {pushToast}
                </div>
              )}

              {/* Header */}
              <div className="p-4 border-b border-[#e1ede7] bg-[#F7F9F8] relative z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Bell className="w-3.5 h-3.5" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#142D27] font-serif tracking-tight flex items-center gap-2">
                      <span>Academic Alerts &amp; Board Feed</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {unreadCount} new
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-[#557067] font-sans">
                      Real-time tests, daily book quotas &amp; BISE DG Khan notices
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 cursor-pointer active:scale-95"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-xl text-[#7d9990] hover:text-[#142D27] hover:bg-[#E7EFEA] transition-colors cursor-pointer"
                    aria-label="Close notification panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Category Tabs (Crisp Bento Chips) */}
              <div className="flex items-center gap-1.5 p-2.5 bg-white border-b border-[#e1ede7] overflow-x-auto text-[11px] no-scrollbar shrink-0">
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
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-bold ring-1 ring-emerald-300'
                        : 'text-[#557067] hover:text-[#142D27] bg-[#F7F9F8] border border-[#e1ede7] hover:bg-[#E7EFEA]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="opacity-70 text-[10px]">({tab.count})</span>
                  </button>
                ))}
              </div>

              {/* Notification Cards List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#F7F9F8]/50 relative z-10 divide-none">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                      <CheckCheck className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-[#142D27] font-serif">All caught up!</p>
                    <p className="text-[11px] text-[#557067] max-w-xs mx-auto">
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
                            ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 hover:shadow-sm'
                            : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 hover:shadow-sm'
                          : 'bg-white border-[#e1ede7] hover:border-emerald-200 hover:bg-[#F7F9F8] text-[#557067]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Category Avatar */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border mt-0.5 shadow-2xs ${
                            notif.category === 'test'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : notif.category === 'assignment'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : notif.category === 'board'
                              ? 'bg-sky-50 border-sky-200 text-sky-700'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {getCategoryIcon(notif.category)}
                        </div>

                        {/* Card Body */}
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {notif.urgent && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                  Urgent
                                </span>
                              )}
                              {notif.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-[9px] font-semibold shrink-0">
                                  {notif.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#7d9990] font-mono shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>

                          <h5
                            className={`text-xs font-bold mt-1 line-clamp-1 group-hover:text-emerald-700 transition-colors ${
                              !notif.read ? 'text-[#142D27]' : 'text-[#263B35]'
                            }`}
                          >
                            {notif.title}
                          </h5>

                          <p className="text-xs text-[#557067] mt-1 line-clamp-2 leading-relaxed font-sans">
                            {notif.message}
                          </p>

                          {/* Card Footer Actions */}
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#e1ede7]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotificationClick(notif);
                              }}
                              className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 hover:border-emerald-300 transition-all shadow-2xs group-hover:translate-x-0.5 cursor-pointer"
                            >
                              <span>{notif.actionLabel || 'View Details'}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                            </button>

                            {!notif.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkItemRead(e, notif.id)}
                                className="px-2 py-0.5 rounded-lg bg-white hover:bg-zinc-100 text-[#557067] hover:text-[#142D27] border border-[#e1ede7] text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Mark read</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread Glowing Dot */}
                      {!notif.read && (
                        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Redesigned Clean Footer (Mobile Native Push Controls & Shortcuts) */}
              <div className="p-3 border-t border-[#e1ede7] bg-[#F7F9F8] relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Native Mobile Push Button */}
                  <button
                    type="button"
                    onClick={handleEnablePush}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 ${
                      pushStatus === 'granted'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-white hover:bg-emerald-50 border-[#e1ede7] text-[#142D27]'
                    }`}
                    title={
                      pushStatus === 'granted'
                        ? 'Native device push notifications active'
                        : 'Enable real OS push notifications'
                    }
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      {pushStatus === 'granted' ? '✓ Mobile Push Active' : 'Enable Mobile Push'}
                    </span>
                  </button>

                  {/* Send Test Push Alert */}
                  <button
                    type="button"
                    onClick={handleSendTestAlert}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-[#e1ede7] text-[11px] font-semibold text-[#142D27] hover:text-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Send an instant simulated push alert"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Send Instant Alert</span>
                  </button>

                  {/* BISE Desk Link */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setIsBoardModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 border border-[#e1ede7] text-[11px] font-semibold text-sky-800 hover:text-sky-900 flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span>🇵🇰 BISE Desk</span>
                    <ExternalLink className="w-3 h-3 text-sky-600" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-[#557067] hover:text-[#142D27] font-medium self-end sm:self-auto cursor-pointer px-2 py-1"
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
