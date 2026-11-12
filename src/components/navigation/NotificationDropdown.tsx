import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, FileText, Calendar, Award, Mail, ExternalLink, Sparkles } from 'lucide-react';
import { SAMPLE_NOTIFICATIONS } from '../../data/sampleData';
import { NotificationItem } from '../../types';
import { cn } from '../../lib/utils';
import { GmailNotificationModal } from './GmailNotificationModal';
import { emailService } from '../../services/emailService';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const emails = emailService.getEmails();
  const unreadEmailCount = emails.filter((e) => !e.read).length;

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
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'assignment':
        return <FileText className="w-3.5 h-3.5 text-[#14B866]" />;
      case 'test':
        return <Calendar className="w-3.5 h-3.5 text-rose-500" />;
      case 'grade':
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-sky-500" />;
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1ede7] bg-white text-[#557067] hover:text-[#142D27] hover:bg-[#F7F9F8] hover:border-[#14B866]/40 transition-colors shadow-subtle focus:outline-none"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#14B866] text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#e1ede7] shadow-dropdown z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#e1ede7] bg-[#F7F9F8]/60">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[#142D27]">Platform Alerts</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#e8f8f0] text-[#14B866] border border-[#14B866]/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#14B866] hover:text-[#109653] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Gmail Live Notification Quick Banner */}
            <div
              onClick={() => {
                setIsOpen(false);
                setIsGmailModalOpen(true);
              }}
              className="p-3 bg-gradient-to-r from-red-500/10 via-amber-500/5 to-transparent border-b border-[#e1ede7] flex items-center justify-between cursor-pointer hover:bg-red-50/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#142D27] flex items-center gap-1.5">
                    Gmail Alerts & Dispatches
                    {unreadEmailCount > 0 && (
                      <span className="text-[9px] bg-red-500 text-white font-bold px-1.5 rounded-full">
                        {unreadEmailCount}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-[#557067]">
                    Passed tests, 24h reminders & invitations
                  </p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-red-600" />
            </div>

            {/* Notification items */}
            <div className="max-h-72 overflow-y-auto divide-y divide-[#e1ede7]/60">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    'p-3.5 flex items-start gap-3 hover:bg-[#F7F9F8] transition-colors cursor-pointer text-left',
                    !notif.read && 'bg-[#e8f8f0]/30'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#e1ede7] shadow-subtle mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-xs font-semibold truncate', !notif.read ? 'text-[#142D27]' : 'text-[#557067]')}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-[#7d9990] shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-[#557067] mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-[#14B866] shrink-0 mt-1.5" />
                  )}
                </div>
              ))}
            </div>

            <div className="p-2.5 text-center border-t border-[#e1ede7] bg-[#F7F9F8]/40 flex items-center justify-between px-4">
              <span className="text-[11px] text-[#7d9990] font-medium">
                StudyHub Notification Engine
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsGmailModalOpen(true);
                }}
                className="text-xs text-[#14B866] hover:underline font-bold flex items-center gap-1"
              >
                <span>Open Gmail Center</span>
                <Sparkles className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Gmail Modal */}
      <GmailNotificationModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
      />
    </>
  );
};
