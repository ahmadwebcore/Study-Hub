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
    return newNotif;
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
