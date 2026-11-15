// StudyHub Platform Notifications Service
// Manages in-app alerts, student invitation alerts, and daily schedule notifications.

import { SAMPLE_NOTIFICATIONS } from '../data/sampleData';
import { NotificationItem } from '../types';

const STORAGE_KEY = 'studyhub_in_app_notifications_v5';

class NotificationService {
  private notifications: NotificationItem[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        this.notifications = [...SAMPLE_NOTIFICATIONS];
        this.save();
      }
    } catch {
      this.notifications = [...SAMPLE_NOTIFICATIONS];
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      window.dispatchEvent(new Event('studyhub_notification_update'));
    } catch {}
  }

  public getNotifications(): NotificationItem[] {
    this.load();
    return [...this.notifications];
  }

  public addNotification(item: {
    title: string;
    message: string;
    category?: NotificationItem['category'];
    actionUrl?: string;
    actionLabel?: string;
    badge?: string;
    urgent?: boolean;
  }): NotificationItem {
    this.load();
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: item.title,
      message: item.message,
      timestamp: 'Just now',
      read: false,
      category: item.category || 'system',
      actionUrl: item.actionUrl,
      actionLabel: item.actionLabel,
      badge: item.badge,
      urgent: item.urgent,
    };
    this.notifications.unshift(newNotif);
    this.save();

    // Trigger instant native mobile push banner
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('studyhub_native_push_alert', { detail: newNotif })
      );
    }

    return newNotif;
  }

  public triggerTestPushAlert(): NotificationItem {
    const samples = [
      {
        title: '📋 30-Mark Daily Test: Chapter 2 Network Topologies',
        message: 'Your Thursday assessment is live. Passing benchmark is 15/30 marks.',
        category: 'test' as const,
        actionUrl: '/test-submit',
        actionLabel: 'Start Test Now',
        badge: '30 Marks',
        urgent: true,
      },
      {
        title: '🇵🇰 BISE DG Khan: Annual Board Schedule Released',
        message: '1st Year FA-IT Annual Exams commence May 2027. Full syllabus coverage strictly required by Feb 28.',
        category: 'board' as const,
        actionUrl: '/board',
        actionLabel: 'View Circular',
        badge: 'DG Khan Board',
        urgent: true,
      },
      {
        title: '🎓 Certified Grade Released by Sir Ahmad',
        message: 'Computer Science: Network Topologies assessment marked: 28/30 (93% Grade A*).',
        category: 'grade' as const,
        actionUrl: '/results',
        actionLabel: 'View Certificate',
        badge: 'Passed A*',
        urgent: false,
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    return this.addNotification(pick);
  }

  public markAsRead(id: string): void {
    this.load();
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.save();
  }

  public markAllAsRead(): void {
    this.load();
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.save();
  }
}

export const notificationService = new NotificationService();
