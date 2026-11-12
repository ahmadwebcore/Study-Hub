import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, FileText, Calendar, Award } from 'lucide-react';
import { SAMPLE_NOTIFICATIONS } from '../../data/sampleData';
import { NotificationItem } from '../../types';
import { cn } from '../../lib/utils';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setIsOpen(false);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setIsOpen(false);
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'assignment':
        return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
      case 'test':
        return <Calendar className="w-3.5 h-3.5 text-zinc-900" />;
      case 'grade':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
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
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-zinc-200 bg-zinc-50/70">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-xs text-zinc-900">Platform Alerts</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 ? (
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            ) : (
              <span className="text-[11px] text-zinc-400">All caught up</span>
            )}
          </div>

          {/* Notification items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn(
                  'p-3.5 flex items-start gap-3 hover:bg-zinc-50 transition-colors cursor-pointer text-left',
                  !notif.read && 'bg-emerald-50/30'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 border border-zinc-200 mt-0.5">
                  {getCategoryIcon(notif.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-xs font-semibold truncate', !notif.read ? 'text-zinc-900' : 'text-zinc-500')}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-zinc-400 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                {!notif.read && (
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-2.5 text-center border-t border-zinc-200 bg-zinc-50/50 flex items-center justify-between px-4">
            <span className="text-[11px] text-zinc-400 font-medium">
              Academic Notifications
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-600 hover:text-zinc-900 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
