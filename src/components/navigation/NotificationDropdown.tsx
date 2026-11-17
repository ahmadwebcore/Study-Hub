import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Award,
  MessageSquare,
  ChevronRight,
  X,
  Smartphone,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';

type FilterCategory = 'all' | 'test' | 'quota' | 'board' | 'faculty';

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

  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = () => {
    setNotifications(notificationService.getNotifications());
    setPushStatus(notificationService.getPushPermissionStatus());
  };

  useEffect(() => {
    window.addEventListener('studyhub_notification_update', refresh);
    return () => window.removeEventListener('studyhub_notification_update', refresh);
  }, []);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        modalRef.current &&
        !modalRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Lock body scroll on mobile when drawer is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original || 'unset';
      };
    }
  }, [isOpen]);

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
        navigate('/tests');
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
      setPushToast('Mobile push notifications active!');
      setTimeout(() => setPushToast(null), 3000);
    } else {
      setPushToast('Notifications permission not enabled in browser.');
      setTimeout(() => setPushToast(null), 3500);
    }
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'board':
        return <span className="text-xs">🇵🇰</span>;
      case 'assignment':
        return <BookOpen className="w-3.5 h-3.5 text-amber-600" />;
      case 'test':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'grade':
        return <Award className="w-3.5 h-3.5 text-sky-600" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'test') return n.category === 'test';
    if (activeCategory === 'quota') return n.category === 'assignment' || n.category === 'schedule';
    if (activeCategory === 'board') return n.category === 'board';
    if (activeCategory === 'faculty') return n.category === 'chat' || n.category === 'grade';
    return true;
  });

  const categories: { id: FilterCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'test', label: '30M Tests', count: notifications.filter((n) => n.category === 'test').length },
    {
      id: 'quota',
      label: 'Daily Quota',
      count: notifications.filter((n) => n.category === 'assignment' || n.category === 'schedule').length,
    },
    { id: 'board', label: 'DG Khan Board', count: notifications.filter((n) => n.category === 'board').length },
    {
      id: 'faculty',
      label: 'Faculty Lead',
      count: notifications.filter((n) => n.category === 'chat' || n.category === 'grade').length,
    },
  ];

  return (
    <>
      {/* Navbar Bell Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none cursor-pointer ${
          isOpen
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
            : 'border-white/10 bg-[#2e3533] text-zinc-200 hover:text-white hover:bg-white/10 shadow-2xs'
        }`}
        aria-label="View notifications"
        title="Academic Alerts & Feed"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-[#262c2a] shadow-xs animate-in zoom-in duration-150">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Render Portal directly to body for 100% viewport safety across mobile & desktop */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-start pointer-events-auto">
            {/* Backdrop: frosted on mobile, clear dismiss listener on desktop */}
            <div
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Container: Bottom sheet on mobile (<640px) | Smart Anchored Popover on Desktop (>=640px) */}
            <div
              ref={modalRef}
              className={`
                relative z-[101] flex flex-col bg-white text-zinc-900 overflow-hidden shadow-2xl border border-zinc-200
                /* Mobile: Bottom Sheet */
                w-full max-h-[85dvh] rounded-t-[28px] border-t border-zinc-200/90 animate-in slide-in-from-bottom duration-200
                /* Desktop/Tablet: Anchored top right with strict dynamic max-height */
                sm:fixed sm:top-16 sm:right-4 sm:bottom-auto sm:w-[420px] sm:max-w-[calc(100vw-2rem)]
                sm:max-h-[min(560px,calc(100dvh-5rem))] sm:rounded-2xl sm:border sm:border-zinc-200/90 sm:animate-in sm:fade-in-50 sm:zoom-in-95
              `}
            >
              {/* Mobile Drag Handle Bar */}
              <div className="sm:hidden pt-3 pb-1 flex justify-center bg-zinc-50 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
              </div>

              {/* Toast Notification Alert */}
              {pushToast && (
                <div className="absolute top-3 inset-x-4 z-30 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold text-center shadow-lg border border-emerald-400/30 animate-in fade-in duration-150">
                  {pushToast}
                </div>
              )}

              {/* Header */}
              <div className="px-4 py-3 sm:py-3.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 shrink-0">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-900 tracking-tight font-serif truncate">
                        Academic Alerts &amp; Feed
                      </h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">
                      Real-time tests, daily quotas &amp; DG Khan board feed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer active:scale-95"
                      title="Mark all notifications as read"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                    aria-label="Close notification panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Chips Bar (Smooth Horizontal Scroll, Zero Cut-offs) */}
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white border-b border-zinc-100 overflow-x-auto text-xs no-scrollbar shrink-0">
                {categories.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1 shrink-0 cursor-pointer ${
                      activeCategory === tab.id
                        ? 'bg-emerald-700 text-white shadow-xs font-bold'
                        : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/70'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] ${activeCategory === tab.id ? 'text-emerald-200' : 'text-zinc-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Notifications List (Smooth Native Scroll, Zero Overflow Glitches) */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 overscroll-contain bg-zinc-50/50">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                      <CheckCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-zinc-800 font-serif">All caught up!</p>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                      Zero pending alerts in this category. You are fully on track with your syllabus and tests.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative p-3 rounded-2xl transition-all duration-150 border cursor-pointer ${
                        !notif.read
                          ? notif.urgent
                            ? 'bg-rose-50/50 border-rose-200/90 hover:border-rose-300 shadow-2xs'
                            : 'bg-emerald-50/40 border-emerald-200/90 hover:border-emerald-300 shadow-2xs'
                          : 'bg-white border-zinc-200/80 hover:border-zinc-300 text-zinc-600'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Icon */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border mt-0.5 shadow-2xs ${
                            notif.category === 'test'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : notif.category === 'assignment'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : notif.category === 'board'
                              ? 'bg-sky-50 border-sky-200 text-sky-700'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {getCategoryIcon(notif.category)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Badges + Timestamp */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {notif.urgent && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[9px] font-bold uppercase tracking-wider shrink-0">
                                  Urgent
                                </span>
                              )}
                              {notif.badge && (
                                <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 text-[9px] font-semibold shrink-0">
                                  {notif.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                              {notif.timestamp}
                            </span>
                          </div>

                          {/* Title */}
                          <h5
                            className={`text-xs font-bold leading-snug line-clamp-2 ${
                              !notif.read ? 'text-zinc-900 group-hover:text-emerald-800' : 'text-zinc-700'
                            }`}
                          >
                            {notif.title}
                          </h5>

                          {/* Message */}
                          <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>

                          {/* Action Footer */}
                          <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-zinc-100">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                              <span>{notif.actionLabel || 'View Details'}</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </span>

                            {!notif.read && (
                              <button
                                type="button"
                                onClick={(e) => handleMarkItemRead(e, notif.id)}
                                className="px-2 py-0.5 rounded-md hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                title="Mark read"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Mark read</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread Indicator Dot */}
                      {!notif.read && (
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white shadow-2xs" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Minimalist 2026 Single-Row Footer (Zero Wrapping, Zero Overlap, Strictly Pinned) */}
              <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs shrink-0">
                <button
                  type="button"
                  onClick={handleEnablePush}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    pushStatus === 'granted'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                  }`}
                  title={pushStatus === 'granted' ? 'Native push active' : 'Enable push notifications'}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{pushStatus === 'granted' ? 'Mobile Push Active' : 'Enable Mobile Push'}</span>
                  {pushStatus === 'granted' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* BISE DG Khan Board Modal */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </>
  );
};
