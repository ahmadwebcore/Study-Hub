// StudyHub Platform Notifications Service
// Manages real-time in-app alerts, dynamic daily test notifications,
// daily reading quotas, BISE DG Khan board feeds, and browser/mobile native push notifications.

import { NotificationItem } from '../types';

const STORAGE_KEY = 'studyhub_in_app_notifications_v6';

try {
  ['v1', 'v2', 'v3', 'v4', 'v5'].forEach((v) =>
    localStorage.removeItem('studyhub_in_app_notifications_' + v)
  );
} catch {}

function getDayScheduleAlerts(): NotificationItem[] {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const dayName = days[todayIndex];

  const scheduleMap: Record<
    string,
    {
      testTitle: string;
      testMessage: string;
      quotaTitle: string;
      quotaMessage: string;
      subject: string;
    }
  > = {
    Tuesday: {
      subject: 'Physical Education',
      testTitle: "Today's 30-Mark Test: Physical Education (Human Anatomy & 400m Track)",
      testMessage: 'Chapter 1 Assessment (30 Marks, Passing: 15) is scheduled for today. Complete MCQs and upload handwritten sheet.',
      quotaTitle: 'Daily Book Quota: 2.5 Pages — Health & Physical Education',
      quotaMessage: 'Prof. Syed Basharat Hussain Gilani (pp. 1–3). Complete target reading before 11:59 PM to maintain your Feb 28 pace.',
    },
    Wednesday: {
      subject: 'Urdu & Grammar',
      testTitle: "Today's 30-Mark Test: Urdu Lazmi & Sharh Sarmaya (Uswa-e-Hasna)",
      testMessage: '30-Mark assessment on Uswa-e-Hasna, Tashbeeh, and formal letter writing is live today. Passing mark: 15/30.',
      quotaTitle: 'Daily Book Quota: 2.5 Pages — Sharh Sarmaya-e-Urdu',
      quotaMessage: 'Prof. Rao Khalid Mahmood (pp. 1–3). Study one-third summary and exam letter patterns.',
    },
    Thursday: {
      subject: 'English & Grammar',
      testTitle: "Today's 30-Mark Test: English & Sunshine Grammar (Button Button)",
      testMessage: 'Story 1 Button Button short answers, active/passive voice, and formal letter assessment (30 Marks).',
      quotaTitle: 'Daily Book Quota: 2.5 Pages — Sunshine English Comprehensive',
      quotaMessage: 'Prof. Musarrat Hussain (pp. 1–3). Practice 10 tenses conversions and first 10 word pairs.',
    },
    Friday: {
      subject: 'Tarjuma-tul-Quran',
      testTitle: "Today's 30-Mark Test: Tarjuma-tul-Quran (Surah Al-Baqarah)",
      testMessage: 'Surah Al-Baqarah verses 1–25 word-by-word and contextual translation assessment (30 Marks). Passing: 15/30.',
      quotaTitle: 'Daily Book Quota: 2 Pages — Tarjuma-tul-Quran Hamdard Notes',
      quotaMessage: 'Hamdard Notes Series (pp. 1–2). Review attributes of Muttaqeen and short questions.',
    },
    Saturday: {
      subject: 'Islamiyat Lazmi',
      testTitle: "Today's 30-Mark Test: Islamiyat Lazmi (Tauheed & Zakat System)",
      testMessage: 'Creed, worship, and Islamic economic system 30-mark unit assessment is open today.',
      quotaTitle: 'Daily Book Quota: 2.5 Pages — Islamiyat Lazmi PECTAA',
      quotaMessage: 'PECTAA textbook (pp. 1–3). Prepare core short questions on Tauheed and Risalat.',
    },
    Sunday: {
      subject: 'Rest & Consolidation',
      testTitle: 'Sunday Rest Day Policy: Strictly OFF (Zero Tests)',
      testMessage: 'Sunday is strictly OFF according to Pakistan Academic Calendar. Zero assignments and zero tests scheduled today.',
      quotaTitle: 'Scheduled Mental Relaxation & Consolidation',
      quotaMessage: 'Relax and recharge for the upcoming week. Optional: lightly review completed notes.',
    },
    Monday: {
      subject: 'Weekly Revision Drill',
      testTitle: "Today's 30-Mark Test: BISE DG Khan 5-Year Past Papers Drill",
      testMessage: 'Comprehensive multi-subject past paper questions drill (30 Marks, Passing: 15).',
      quotaTitle: 'Weekly Past Papers Drill: 4 Pages Review',
      quotaMessage: 'Solve Section B & C board model short questions from past 5 years collection.',
    },
  };

  const curr = scheduleMap[dayName] || scheduleMap['Tuesday'];

  const items: NotificationItem[] = [];

  if (dayName !== 'Sunday') {
    items.push({
      id: `dyn_test_${dayName.toLowerCase()}`,
      title: curr.testTitle,
      message: curr.testMessage,
      timestamp: 'Today, 09:00 AM',
      read: false,
      category: 'test',
      actionUrl: '/tests',
      actionLabel: 'Take 30M Test',
      badge: '30 Marks',
      urgent: true,
    });

    items.push({
      id: `dyn_quota_${dayName.toLowerCase()}`,
      title: curr.quotaTitle,
      message: curr.quotaMessage,
      timestamp: 'Today, 07:30 AM',
      read: false,
      category: 'assignment',
      actionUrl: '/library',
      actionLabel: 'Open Book',
      badge: 'Daily Quota',
      urgent: false,
    });
  } else {
    items.push({
      id: 'dyn_sunday_rest',
      title: curr.testTitle,
      message: curr.testMessage,
      timestamp: 'Today, 08:00 AM',
      read: false,
      category: 'schedule',
      actionUrl: '/weekly-tasks',
      actionLabel: 'View Policy',
      badge: 'Sundays OFF',
      urgent: false,
    });
  }

  // Board circulars
  items.push({
    id: 'dyn_board_01',
    title: 'BISE DG Khan: Annual Exam 2027 Schedule Released',
    message: 'Intermediate Part-1 (11th Class FA-IT) Annual Exams commence in May 2027. Full syllabus coverage strictly required by Feb 28.',
    timestamp: '15 minutes ago',
    read: false,
    category: 'board',
    actionUrl: '/board',
    actionLabel: 'View Circular',
    badge: 'BISE DGK',
    urgent: true,
  });

  items.push({
    id: 'dyn_board_02',
    title: 'FA-IT Official Pairing Scheme 2026-2027 Notified',
    message: 'Official paper patterns and MCQs/Short/Long question distribution published for all 6 subjects by BISE DG Khan.',
    timestamp: '1 hour ago',
    read: false,
    category: 'board',
    actionUrl: '/board',
    actionLabel: 'Check Pairing',
    badge: 'Pairing Scheme',
    urgent: false,
  });

  return items;
}

class NotificationService {
  private notifications: NotificationItem[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notifications = parsed;
          return;
        }
      }
      this.notifications = getDayScheduleAlerts();
      this.save();
    } catch {
      this.notifications = getDayScheduleAlerts();
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

  public getUnreadCount(): number {
    this.load();
    return this.notifications.filter((n) => !n.read).length;
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

    // Trigger instant native mobile push banner and browser push notification
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('studyhub_native_push_alert', { detail: newNotif })
      );
      this.dispatchNativeNotification(newNotif.title, newNotif.message, newNotif.actionUrl);
    }

    return newNotif;
  }

  public getPushPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  public async requestPushPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.dispatchNativeNotification(
          '🔔 StudyHub Push Notifications Active',
          'You will now receive real-time 30-mark test alerts and daily book reading quotas directly on your device!'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public dispatchNativeNotification(title: string, body: string, actionUrl?: string): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'studyhub-live-alert',
      });
      notif.onclick = () => {
        window.focus();
        if (actionUrl) {
          window.location.href = actionUrl;
        }
        notif.close();
      };
    } catch {
      // Fallback for environments where Notification constructor requires service worker
    }
  }

  public triggerTestPushAlert(): NotificationItem {
    const samples = [
      {
        title: '📋 30-Mark Daily Test: Physical Education Anatomy Assessment',
        message: 'Your Tuesday 30-mark assessment is live. Attempt 5 MCQs, short questions, and upload handwritten sheet.',
        category: 'test' as const,
        actionUrl: '/tests',
        actionLabel: 'Take Test Now',
        badge: '30 Marks',
        urgent: true,
      },
      {
        title: '📖 Daily Book Quota: 2.5 Pages Target',
        message: 'Sharh Sarmaya-e-Urdu (pp. 1–3). Complete today\'s quota to stay on track for the Feb 28 deadline.',
        category: 'assignment' as const,
        actionUrl: '/library',
        actionLabel: 'Open Library',
        badge: 'Daily Quota',
        urgent: false,
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
        message: 'Urdu & Grammar Uswa-e-Hasna assessment marked: 28/30 (93% Grade A*).',
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

  public notifyStudentSubmission(studentName: string, testTitle: string): NotificationItem {
    return this.addNotification({
      title: `📄 New Test Submission: ${studentName}`,
      message: `${studentName} has submitted "${testTitle}" for verification. Ready for grading and marks entry.`,
      category: 'assignment',
      actionUrl: '/submissions',
      actionLabel: 'Review Submission',
      badge: 'Submission',
      urgent: true,
    });
  }

  public notifyCertifiedGrade(
    testTitle: string,
    score: number,
    totalMarks: number,
    grade: string,
    feedback?: string
  ): NotificationItem {
    const isPassed = score >= Math.ceil(totalMarks * 0.5);
    return this.addNotification({
      title: `🎓 Certified Grade: ${score}/${totalMarks} (${grade}) by Sir Ahmad`,
      message: feedback
        ? `Faculty Lead Ahmad certified your submission: "${feedback}"`
        : `Assessment "${testTitle}" graded: ${score}/${totalMarks} (${isPassed ? 'Passed' : 'Retest Required'}).`,
      category: 'grade',
      actionUrl: '/results',
      actionLabel: 'View Certified Result',
      badge: `${score}/${totalMarks} (${grade})`,
      urgent: !isPassed,
    });
  }

  public notifyTestUnlocked(testTitle: string, subjectName: string): NotificationItem {
    return this.addNotification({
      title: `🟢 Today's 30-Mark Test Unlocked: ${subjectName}`,
      message: `"${testTitle}" is now active. Please solve questions and upload handwritten sheets before 11:59 PM.`,
      category: 'test',
      actionUrl: '/tests',
      actionLabel: 'Attempt Test',
      badge: '30 Marks',
      urgent: true,
    });
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
