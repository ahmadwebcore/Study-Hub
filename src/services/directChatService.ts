import { notificationService } from './notificationService';

export interface DirectChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  text: string;
  timestamp: string;
  isoTime: string;
  attachmentName?: string;
  attachmentUrl?: string;
  read: boolean;
}

const STORAGE_KEY = 'studyhub_direct_chat_v1';

const INITIAL_MESSAGES: DirectChatMessage[] = [
  {
    id: 'msg_01',
    senderId: 'usr_t_01',
    senderName: 'Ahmad',
    senderRole: 'teacher',
    text: 'Assalam-o-Alaikum! Welcome to your private 1-on-1 StudyHub portal. We have a target to complete all 6 books before February 28th. How is your revision going?',
    timestamp: 'Yesterday at 04:30 PM',
    isoTime: new Date(Date.now() - 86400000).toISOString(),
    read: true,
  },
  {
    id: 'msg_02',
    senderId: 'usr_s_01',
    senderName: 'Henza Noor',
    senderRole: 'student',
    text: 'Walaikum Assalam Sir Ahmad! I have started the Computer Science and Urdu chapters. The daily reading quotas are very clear.',
    timestamp: 'Yesterday at 05:15 PM',
    isoTime: new Date(Date.now() - 82800000).toISOString(),
    read: true,
  },
  {
    id: 'msg_03',
    senderId: 'usr_t_01',
    senderName: 'Ahmad',
    senderRole: 'teacher',
    text: 'Excellent. Remember each daily test has 30 marks (passing is 15). Keep your handwriting clean and always attempt every short question. You can ask me any questions directly here.',
    timestamp: 'Yesterday at 05:30 PM',
    isoTime: new Date(Date.now() - 82000000).toISOString(),
    read: true,
  },
  {
    id: 'msg_04',
    senderId: 'usr_s_01',
    senderName: 'Henza Noor',
    senderRole: 'student',
    text: 'Understood Sir! I am preparing for tomorrow’s Physical Education test on human anatomy.',
    timestamp: 'Today at 09:10 AM',
    isoTime: new Date(Date.now() - 14400000).toISOString(),
    read: true,
  },
  {
    id: 'msg_05',
    senderId: 'usr_t_01',
    senderName: 'Ahmad',
    senderRole: 'teacher',
    text: 'Good luck! Be sure to draw the 400m track baton exchange zones clearly with a pencil.',
    timestamp: 'Today at 09:25 AM',
    isoTime: new Date(Date.now() - 13500000).toISOString(),
    read: true,
  },
];

class DirectChatService {
  private messages: DirectChatMessage[] = [];

  constructor() {
    this.loadMessages();
  }

  private loadMessages(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.messages = JSON.parse(stored);
      } else {
        this.messages = [...INITIAL_MESSAGES];
        this.saveMessages();
      }
    } catch {
      this.messages = [...INITIAL_MESSAGES];
    }
  }

  private saveMessages(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages));
    } catch {}
  }

  public getMessages(): DirectChatMessage[] {
    this.loadMessages();
    return [...this.messages];
  }

  public sendMessage(params: {
    senderRole: 'teacher' | 'student';
    text: string;
    attachmentName?: string;
    attachmentUrl?: string;
  }): DirectChatMessage {
    this.loadMessages();

    const isTeacher = params.senderRole === 'teacher';
    const senderName = isTeacher ? 'Ahmad' : 'Henza Noor';
    const senderId = isTeacher ? 'usr_t_01' : 'usr_s_01';

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newMessage: DirectChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      senderRole: params.senderRole,
      text: params.text.trim(),
      timestamp: `Today at ${timeStr}`,
      isoTime: now.toISOString(),
      attachmentName: params.attachmentName,
      attachmentUrl: params.attachmentUrl,
      read: false,
    };

    this.messages.push(newMessage);
    this.saveMessages();

    // Trigger platform notifications for the recipient
    if (isTeacher) {
      notificationService.addNotification({
        title: `💬 New Message from Ahmad`,
        message: params.text.length > 60 ? `${params.text.substring(0, 60)}...` : params.text,
        category: 'system',
      });
    } else {
      notificationService.addNotification({
        title: `💬 Student Message: Henza Noor`,
        message: params.text.length > 60 ? `${params.text.substring(0, 60)}...` : params.text,
        category: 'system',
      });
    }

    return newMessage;
  }

  public markAllAsRead(viewerRole: 'teacher' | 'student'): void {
    this.loadMessages();
    let updated = false;

    this.messages = this.messages.map((m) => {
      // Mark as read if sent by the other party
      if (m.senderRole !== viewerRole && !m.read) {
        updated = true;
        return { ...m, read: true };
      }
      return m;
    });

    if (updated) {
      this.saveMessages();
    }
  }

  public getUnreadCount(viewerRole: 'teacher' | 'student'): number {
    this.loadMessages();
    return this.messages.filter((m) => m.senderRole !== viewerRole && !m.read).length;
  }
}

export const directChatService = new DirectChatService();
