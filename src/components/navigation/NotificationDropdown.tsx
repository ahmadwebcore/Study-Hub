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
          <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] rounded-2xl bg-white border border-zinc-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-zinc-900 tracking-tight">
                  Academic Alerts & Board Feed
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-50"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1 p-2 bg-zinc-100/60 border-b border-zinc-200 overflow-x-auto text-[11px]">
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
                  className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === tab.id
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="opacity-70 text-[10px]">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Notification items */}
            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-800">No alerts in this category</p>
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
                          ? 'bg-amber-50/40 hover:bg-amber-50/70'
                          : 'bg-emerald-50/20 hover:bg-emerald-50/40'
                        : 'bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-zinc-200 mt-0.5 shadow-2xs group-hover:border-zinc-300">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          {notif.urgent && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white text-[9px] font-bold shrink-0">
                              Urgent
                            </span>
                          )}
                          {notif.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 text-[9px] font-semibold shrink-0">
                              {notif.badge}
                            </span>
                          )}
                          <p
                            className={`text-xs font-bold truncate ${
                              !notif.read ? 'text-zinc-900' : 'text-zinc-700'
                            }`}
                          >
                            {notif.title}
                          </p>
                        </div>
                        <span className="text-[10px] text-zinc-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
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
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors"
                        >
                          <span>{notif.actionLabel || 'View Details'}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Dedicated Mark Read / Unread Button */}
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkItemRead(e, notif.id)}
                            className="px-2 py-0.5 rounded-md bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 border border-zinc-200 text-[10px] font-semibold flex items-center gap-1 transition-all shadow-2xs"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
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
            <div className="p-2.5 border-t border-zinc-200 bg-zinc-50/70 flex items-center justify-between px-3.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsBoardModalOpen(true);
                }}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>🇵🇰 Open BISE DG Khan Desk</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
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
