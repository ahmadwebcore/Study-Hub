import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  Clock,
  FileText,
  Calendar,
  Award,
  CheckCheck,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationService } from '../../services/notificationService';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';

type FilterCategory = 'all' | 'board' | 'test' | 'task' | 'chat';

export const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    notificationService.getNotifications()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const refresh = () => setNotifications(notificationService.getNotifications());

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
        navigate('/test-submit');
        break;
      case 'assignment':
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
        break;
    }
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'board':
        return <span className="text-xs">🇵🇰</span>;
      case 'assignment':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'test':
        return <Calendar className="w-3.5 h-3.5 text-zinc-900" />;
      case 'grade':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'board') return n.category === 'board';
    if (activeCategory === 'test') return n.category === 'test';
    if (activeCategory === 'task') return n.category === 'assignment' || n.category === 'schedule';
    if (activeCategory === 'chat') return n.category === 'chat' || n.category === 'grade';
    return true;
  });

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors shadow-xs focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Drawer / Dropdown */}
            <div className="fixed inset-x-2.5 top-16 max-h-[82vh] sm:max-h-[600px] sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:absolute sm:w-[420px] rounded-2xl bg-[#0c0d10] border border-zinc-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-zinc-100">
              {/* Header */}
              <div className="p-3.5 border-b border-zinc-800 bg-[#090a0c] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight">
                    Academic Alerts & Board Feed
                  </h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
                    >
                      <Check className="w-3 h-3" />
                      <span className="hidden sm:inline">Mark all read</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    aria-label="Close notification panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 p-2 bg-[#090a0c] border-b border-zinc-800 overflow-x-auto no-scrollbar text-[11px] whitespace-nowrap">
              {[
                { id: 'all', label: 'All', count: notifications.length },
                {
                  id: 'board',
                  label: 'DG Khan Board',
                  count: notifications.filter((n) => n.category === 'board').length,
                },
                {
                  id: 'test',
                  label: '30M Tests',
                  count: notifications.filter((n) => n.category === 'test').length,
                },
                {
                  id: 'task',
                  label: 'Tasks & Quota',
                  count: notifications.filter(
                    (n) => n.category === 'assignment' || n.category === 'schedule'
                  ).length,
                },
                {
                  id: 'chat',
                  label: 'Chat & Marks',
                  count: notifications.filter(
                    (n) => n.category === 'chat' || n.category === 'grade'
                  ).length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as FilterCategory)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 ${
                    activeCategory === tab.id
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="opacity-70 text-[10px]">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Notification items */}
            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/80 bg-[#0c0d10]">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-semibold text-white">No alerts in this category</p>
                  <p className="text-[11px] text-zinc-400">Everything is organized and up-to-date.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer group text-left ${
                      !notif.read
                        ? notif.urgent
                          ? 'bg-amber-950/20 hover:bg-amber-950/30 border-l-2 border-amber-500'
                          : 'bg-emerald-950/20 hover:bg-emerald-950/30 border-l-2 border-emerald-500'
                        : 'bg-[#0c0d10] hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 mt-0.5 shadow-2xs group-hover:border-zinc-700 text-emerald-400">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          {notif.urgent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 text-[9px] font-bold shrink-0">
                              Urgent
                            </span>
                          )}
                          {notif.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[9px] font-semibold shrink-0">
                              {notif.badge}
                            </span>
                          )}
                          <p
                            className={`text-xs font-bold truncate ${
                              !notif.read ? 'text-white' : 'text-zinc-300'
                            }`}
                          >
                            {notif.title}
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Interactive Bottom Row with Direct Action */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Dedicated Mark Read / Unread Button */}
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkItemRead(e, notif.id)}
                            className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Mark read</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t border-zinc-800 bg-[#090a0c] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    notificationService.triggerTestPushAlert();
                  }}
                  className="text-[11px] font-bold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all"
                >
                  <Bell className="w-3 h-3 text-emerald-400 animate-bounce" />
                  <span>Send Test Push Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsBoardModalOpen(true);
                  }}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>🇵🇰 BISE Desk</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-zinc-400 hover:text-white font-medium self-end sm:self-auto cursor-pointer"
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
