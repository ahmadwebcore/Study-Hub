import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface PushAlertState {
  notification: NotificationItem;
  id: string;
}

// Synthesize dual-tone pleasant audio chime using browser Web Audio API
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.14, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch {}
}

export const MobileNativePushBanner: React.FC = () => {
  const navigate = useNavigate();
  const [activeAlert, setActiveAlert] = useState<PushAlertState | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Request notification permission smoothly if not asked before
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {}

    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<NotificationItem>;
      if (customEvent.detail) {
        triggerBanner(customEvent.detail);
      }
    };

    window.addEventListener('studyhub_native_push_alert', handlePushEvent);
    return () => {
      window.removeEventListener('studyhub_native_push_alert', handlePushEvent);
    };
  }, []);

  const triggerBanner = (notif: NotificationItem) => {
    // Play pleasant audio chime
    playNotificationChime();

    // Native mobile haptic vibration
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {}

    // Native system/OS notification
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/vite.svg',
        });
      }
    } catch {}

    setIsDismissing(false);
    setActiveAlert({
      notification: notif,
      id: `alert_${Date.now()}`,
    });

    // Auto-dismiss after 6.5 seconds
    const timer = setTimeout(() => {
      dismissAlert();
    }, 6500);

    return () => clearTimeout(timer);
  };

  const dismissAlert = () => {
    setIsDismissing(true);
    setTimeout(() => {
      setActiveAlert(null);
      setIsDismissing(false);
    }, 250);
  };

  const handleAction = () => {
    if (!activeAlert) return;
    const notif = activeAlert.notification;
    dismissAlert();

    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    } else if (notif.category === 'test') {
      navigate('/test-submit');
    } else if (notif.category === 'assignment' || notif.category === 'schedule') {
      navigate('/weekly-tasks');
    } else {
      navigate('/dashboard');
    }
  };

  if (!activeAlert) return null;

  const notif = activeAlert.notification;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-2.5 inset-x-2 sm:inset-x-auto sm:right-4 sm:max-w-md z-50 transition-all duration-250 ease-out ${
        isDismissing
          ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
          : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-4 duration-300'
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950/95 text-white backdrop-blur-2xl border border-white/20 shadow-2xl p-3.5 space-y-2.5 ring-1 ring-white/10">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header: Native App Pill */}
        <div className="relative flex items-center justify-between pb-1 border-b border-white/10 text-[11px]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-extrabold text-[10px] text-zinc-950 shadow-xs">
              GSA
            </div>
            <span className="font-bold tracking-tight text-white/90">Global Science Academy</span>
            <span className="text-white/40">&bull;</span>
            <span className="text-emerald-400 font-medium">Fatehpur</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
              {notif.badge || 'Push Alert'}
            </span>
            <button
              type="button"
              onClick={dismissAlert}
              className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative space-y-1">
          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug line-clamp-1">
            {notif.title}
          </h4>
          <p className="text-[11px] sm:text-xs text-zinc-300 leading-relaxed line-clamp-2">
            {notif.message}
          </p>
        </div>

        {/* Action Row */}
        <div className="relative flex items-center justify-end gap-2 pt-1 border-t border-white/5">
          <button
            type="button"
            onClick={dismissAlert}
            className="px-2.5 py-1 text-[11px] font-medium text-white/60 hover:text-white transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleAction}
            className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-emerald-300 hover:brightness-105 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span>{notif.actionLabel || 'View Details'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Animated Progress Countdown Bar */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 animate-[shrink_6.5s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
};
