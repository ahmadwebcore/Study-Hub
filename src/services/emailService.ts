// StudyHub Email & Gmail Notification Service
// Handles automated email dispatch for exam grading (passing/failing marks),
// scheduled tests, 24-hour deadline reminders, and faculty student invitations.

export interface EmailMessage {
  id: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  previewText: string;
  category: 'invitation' | 'new_test' | 'deadline_reminder' | 'grade_result' | 'system' | 'manual_notice' | 'holiday_alert';
  htmlBody: string;
  meta?: {
    testId?: string;
    testTitle?: string;
    subjectName?: string;
    score?: number;
    maxScore?: number;
    passingMarks?: number;
    isPassed?: boolean;
    dueDate?: string;
    inviteToken?: string;
    teacherName?: string;
  };
  sentAt: string;
  read: boolean;
}

const STORAGE_KEY = 'studyhub_dispatched_emails_v3';

// Initial pre-loaded realistic Gmail notifications
const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: 'em_001',
    recipientEmail: 'dbaddiesvlog@gmail.com',
    recipientName: 'Henza Noor',
    senderName: 'Ahmad',
    senderEmail: 'ahmadwebcore@gmail.com',
    subject: '🎓 Exam Graded: Computer Science Networks - PASSED (28/30)',
    previewText: 'Congratulations! Your submission has been certified with 93% and Grade A+.',
    category: 'grade_result',
    sentAt: 'Today at 02:30 PM',
    read: false,
    meta: {
      testTitle: 'Computer Science Architecture & Networks Assessment',
      subjectName: 'Computer Science (FSC-CSC-11)',
      score: 28,
      maxScore: 30,
      passingMarks: 15,
      isPassed: true,
      teacherName: 'Ahmad',
    },
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        <div style="background: #142D27; padding: 28px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Study<span style="color: #14B866;">Hub</span> Faculty Assessment</h1>
          <p style="color: #a3c4b9; margin: 6px 0 0 0; font-size: 13px;">Official Academic Grade Certification</p>
        </div>
        <div style="padding: 28px;">
          <div style="display: inline-block; background: #e8f8f0; color: #14B866; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(20,184,102,0.3); margin-bottom: 16px;">
            Certified Passing Grade
          </div>
          <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">Exam Results Certified: Computer Science Architecture & Networks</h2>
          <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Dear <strong>Henza Noor</strong>,<br/>
            Your faculty evaluator <strong>Ahmad</strong> has completed reviewing your examination. Your submission has satisfied and exceeded all certified passing benchmarks.
          </p>
          <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #557067; font-size: 13px;">Course Subject:</td>
                <td style="padding: 8px 0; color: #142D27; font-size: 13px; font-weight: 700; text-align: right;">Computer Science (FSC-CSC-11)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #557067; font-size: 13px;">Score Achieved:</td>
                <td style="padding: 8px 0; color: #14B866; font-size: 16px; font-weight: 800; text-align: right;">28 / 30 Marks (93%)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #557067; font-size: 13px;">Passing Threshold:</td>
                <td style="padding: 8px 0; color: #142D27; font-size: 13px; font-weight: 600; text-align: right;">15 Marks (50%)</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #557067; font-size: 13px;">Academic Grade:</td>
                <td style="padding: 8px 0; color: #142D27; font-size: 14px; font-weight: 800; text-align: right;">Grade A+ (Distinction)</td>
              </tr>
            </table>
          </div>
          <div style="background: #ffffff; border-left: 4px solid #14B866; padding: 14px 16px; margin-bottom: 24px; background-color: #fafcfb;">
            <p style="margin: 0; color: #142D27; font-size: 13px; font-style: italic;">
              "Exceptional mathematical rigor. The step-by-step vector integration across the surface boundary was mathematically flawless." — Ahmad
            </p>
          </div>
          <div style="text-align: center;">
            <a href="/results" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(20,184,102,0.25);">
              View Official Transcript in Portal
            </a>
          </div>
        </div>
        <div style="background: #F7F9F8; padding: 16px; text-align: center; border-top: 1px solid #e1ede7;">
          <p style="color: #7d9990; font-size: 11px; margin: 0;">
            StudyHub LMS • Automated Notification Engine • Sent to dbaddiesvlog@gmail.com
          </p>
        </div>
      </div>
    `,
  },
  {
    id: 'em_002',
    recipientEmail: 'dbaddiesvlog@gmail.com',
    recipientName: 'Henza Noor',
    senderName: 'StudyHub Academic Scheduler',
    senderEmail: 'ahmadwebcore@gmail.com',
    subject: '⏰ Urgent Reminder: Quantum Mechanics Assessment Due in 24 Hours',
    previewText: 'Assessment window closes tomorrow at 04:00 PM. Please ensure your submission is finalized.',
    category: 'deadline_reminder',
    sentAt: 'Yesterday at 09:15 AM',
    read: false,
    meta: {
      testTitle: 'Quantum Mechanics Mid-Term Examination',
      subjectName: 'Physics (PHY-201)',
      dueDate: 'Tomorrow at 04:00 PM',
      teacherName: 'Ahmad',
    },
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
        <div style="background: #142D27; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> Assessment Reminder</h1>
        </div>
        <div style="padding: 28px;">
          <div style="display: inline-block; background: #fff1f2; color: #e11d48; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(225,29,72,0.3); margin-bottom: 16px;">
            ⚠️ 24-Hour Countdown
          </div>
          <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">Upcoming Submission Deadline</h2>
          <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
            Hello <strong>Henza Noor</strong>,<br/>
            This is an automated countdown reminder that your scheduled assessment <strong>Quantum Mechanics Mid-Term Examination</strong> is scheduled for tomorrow.
          </p>
          <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
            <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Subject:</strong> Quantum Physics (PHY-201)</p>
            <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Deadline / Start:</strong> Tomorrow at 04:00 PM</p>
            <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Duration:</strong> 90 Minutes (Auto-timer enabled)</p>
            <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Total Marks:</strong> 60 Marks</p>
          </div>
          <div style="text-align: center;">
            <a href="/tests" style="display: inline-block; background: #142D27; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 12px; text-decoration: none;">
              Open Test Center in StudyHub
            </a>
          </div>
        </div>
        <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
          <p style="color: #7d9990; font-size: 11px; margin: 0;">Sent to dbaddiesvlog@gmail.com • StudyHub Notification Scheduler</p>
        </div>
      </div>
    `,
  },
  {
    id: 'em_003',
    recipientEmail: 'dbaddiesvlog@gmail.com',
    recipientName: 'Henza Noor',
    senderName: 'Ahmad',
    senderEmail: 'ahmadwebcore@gmail.com',
    subject: '✉️ Faculty Invitation: Join Advanced STEM Cohort on StudyHub',
    previewText: 'Ahmad has invited you to join StudyHub LMS as a verified student.',
    category: 'invitation',
    sentAt: 'Nov 10, 2026',
    read: true,
    meta: {
      inviteToken: 'sh_inv_984392_alpha',
      teacherName: 'Ahmad',
    },
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden;">
        <div style="background: #142D27; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> LMS Invitation</h1>
        </div>
        <div style="padding: 28px;">
          <h2 style="color: #142D27; margin: 0 0 12px 0;">Official Faculty Student Invitation</h2>
          <p style="color: #557067; font-size: 14px; line-height: 1.6;">
            <strong>Ahmad</strong> has enrolled you into the <strong>Advanced STEM (2026-2027)</strong> cohort under Cambridge International board.
          </p>
          <div style="background: #e8f8f0; border: 1px solid rgba(20,184,102,0.3); border-radius: 12px; padding: 16px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #142D27; font-weight: 600;">YOUR SECURE INVITATION TOKEN</p>
            <span style="font-family: monospace; font-size: 20px; font-weight: 800; color: #14B866; letter-spacing: 2px;">sh_inv_984392_alpha</span>
          </div>
          <div style="text-align: center;">
            <a href="/accept-invite?token=sh_inv_984392_alpha" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
              Activate Student Account
            </a>
          </div>
        </div>
      </div>
    `,
  },
];

class EmailService {
  private emails: EmailMessage[] = [];

  constructor() {
    this.loadEmails();
  }

  private loadEmails() {
    try {
      // Clear legacy storage keys
      localStorage.removeItem('studyhub_dispatched_emails');
      localStorage.removeItem('studyhub_dispatched_emails_v1');
      localStorage.removeItem('studyhub_dispatched_emails_v2');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as EmailMessage[];
        this.emails = parsed.map((e) => {
          const sanitized = { ...e };
          if (sanitized.recipientEmail && sanitized.recipientEmail.includes('bilal')) {
            sanitized.recipientEmail = 'dbaddiesvlog@gmail.com';
            sanitized.recipientName = 'Henza Noor';
          }
          if (sanitized.senderName && (sanitized.senderName.includes('Clara') || sanitized.senderName.includes('clara'))) {
            sanitized.senderName = 'Ahmad';
            sanitized.senderEmail = 'ahmadwebcore@gmail.com';
          }
          if (sanitized.senderEmail && sanitized.senderEmail.includes('clara')) {
            sanitized.senderEmail = 'ahmadwebcore@gmail.com';
          }
          return sanitized;
        });
      } else {
        this.emails = [...INITIAL_EMAILS];
        this.saveEmails();
      }
    } catch {
      this.emails = [...INITIAL_EMAILS];
    }
  }

  private saveEmails() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.emails));
    } catch {
      // storage unavailable
    }
  }

  public getEmails(recipientEmail?: string): EmailMessage[] {
    this.loadEmails();
    if (!recipientEmail || recipientEmail === 'all') {
      return [...this.emails];
    }
    const cleanFilter = recipientEmail.toLowerCase().trim();
    return this.emails.filter(
      (e) => e.recipientEmail.toLowerCase() === cleanFilter || e.recipientEmail === 'all'
    );
  }

  public getEmailById(id: string): EmailMessage | undefined {
    this.loadEmails();
    return this.emails.find((e) => e.id === id);
  }

  public markEmailAsRead(id: string) {
    this.emails = this.emails.map((e) => (e.id === id ? { ...e, read: true } : e));
    this.saveEmails();
  }

  public deleteEmail(id: string) {
    this.emails = this.emails.filter((e) => e.id !== id);
    this.saveEmails();
  }

  public clearAllEmails() {
    this.emails = [];
    this.saveEmails();
  }

  // 1. Send Faculty Student Invitation to student's Gmail
  public sendInvitationEmail(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    inviteToken: string;
    course: string;
    board: string;
  }): EmailMessage {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${params.inviteToken}`;
    const newEmail: EmailMessage = {
      id: `em_inv_${Date.now()}`,
      recipientEmail: params.studentEmail,
      recipientName: params.studentName,
      senderName: params.teacherName || 'Faculty Department',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: `✉️ Faculty Invitation: ${params.teacherName} invited you to StudyHub LMS`,
      previewText: `Join ${params.course} (${params.board}). Accept your invite to access books, syllabus, and assessments.`,
      category: 'invitation',
      sentAt: 'Just now',
      read: false,
      meta: {
        inviteToken: params.inviteToken,
        teacherName: params.teacherName,
      },
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> Academic Portal</h1>
            <p style="color: #a3c4b9; margin: 6px 0 0 0; font-size: 13px;">Official Faculty Mentorship Invitation</p>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #e8f8f0; color: #14B866; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(20,184,102,0.3); margin-bottom: 16px;">
              Direct Faculty Invitation
            </div>
            <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">You Have Been Invited to Connect</h2>
            <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${params.studentName}</strong>,<br/>
              <strong>${params.teacherName}</strong> has created an authorized student account for you under the <strong>${params.course}</strong> (${params.board}) academic curriculum.
            </p>
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #7d9990; font-weight: 700; text-transform: uppercase;">One-Time Invitation Token</p>
              <div style="font-family: monospace; font-size: 22px; font-weight: 800; color: #14B866; letter-spacing: 3px; background: #ffffff; padding: 10px 16px; border-radius: 8px; border: 1px dashed #14B866; display: inline-block;">
                ${params.inviteToken}
              </div>
            </div>
            <div style="text-align: center; margin-bottom: 20px;">
              <a href="${inviteUrl}" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(20,184,102,0.25);">
                Accept Invitation & Set Password
              </a>
            </div>
            <p style="color: #7d9990; font-size: 12px; text-align: center; margin: 0;">
              Students cannot invite others. Only your authorized teacher can enroll and monitor your syllabus and exams.
            </p>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Sent directly to ${params.studentEmail} • StudyHub LMS</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // 2. Send New Test Scheduled Notification to student's Gmail
  public sendNewTestAlert(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    testTitle: string;
    subjectName: string;
    date: string;
    time: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    syllabusCoverage: string;
    instructions?: string;
  }): EmailMessage {
    const newEmail: EmailMessage = {
      id: `em_test_${Date.now()}`,
      recipientEmail: params.studentEmail,
      recipientName: params.studentName,
      senderName: params.teacherName || 'Faculty Examination Board',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: `📅 New Test Scheduled: ${params.testTitle} (${params.subjectName})`,
      previewText: `Scheduled for ${params.date} at ${params.time}. Duration: ${params.durationMinutes} mins. Total Marks: ${params.totalMarks}.`,
      category: 'new_test',
      sentAt: 'Just now',
      read: false,
      meta: {
        testTitle: params.testTitle,
        subjectName: params.subjectName,
        dueDate: `${params.date} at ${params.time}`,
        teacherName: params.teacherName,
      },
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> Examination Notice</h1>
            <p style="color: #a3c4b9; margin: 6px 0 0 0; font-size: 13px;">Official Academic Assessment Schedule</p>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(2,132,199,0.3); margin-bottom: 16px;">
              New Exam Scheduled
            </div>
            <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">${params.testTitle}</h2>
            <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${params.studentName}</strong>,<br/>
              Your teacher <strong>${params.teacherName}</strong> has scheduled an examination in <strong>${params.subjectName}</strong>. Please review the syllabus topics and prepare accordingly.
            </p>
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #557067; font-size: 13px;">Exam Date & Time:</td>
                  <td style="padding: 6px 0; color: #142D27; font-size: 13px; font-weight: 700; text-align: right;">${params.date} at ${params.time}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #557067; font-size: 13px;">Duration:</td>
                  <td style="padding: 6px 0; color: #142D27; font-size: 13px; font-weight: 700; text-align: right;">${params.durationMinutes} Minutes</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #557067; font-size: 13px;">Total Marks:</td>
                  <td style="padding: 6px 0; color: #142D27; font-size: 13px; font-weight: 700; text-align: right;">${params.totalMarks} Marks</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #557067; font-size: 13px;">Passing Marks Required:</td>
                  <td style="padding: 6px 0; color: #14B866; font-size: 13px; font-weight: 800; text-align: right;">${params.passingMarks} Marks</td>
                </tr>
              </table>
              <div style="border-top: 1px solid #e1ede7; margin-top: 12px; padding-top: 12px;">
                <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #7d9990; text-transform: uppercase;">Syllabus Coverage:</p>
                <p style="margin: 0; font-size: 13px; color: #263B35;">${params.syllabusCoverage}</p>
              </div>
            </div>
            ${
              params.instructions
                ? `<div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 12px; color: #92400e;"><strong>Faculty Instructions:</strong> ${params.instructions}</p>
                   </div>`
                : ''
            }
            <div style="text-align: center;">
              <a href="/tests" style="display: inline-block; background: #142D27; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
                View Scheduled Exam in Portal
              </a>
            </div>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Sent directly to ${params.studentEmail} • StudyHub LMS</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // 3. Send 24h Deadline / Exam Reminder to student's Gmail
  public sendDeadlineReminder(params: {
    studentEmail: string;
    studentName: string;
    itemTitle: string;
    itemType: 'test' | 'assignment';
    subjectName: string;
    dueDate: string;
    instructions?: string;
  }): EmailMessage {
    const isTest = params.itemType === 'test';
    const newEmail: EmailMessage = {
      id: `em_rem_${Date.now()}`,
      recipientEmail: params.studentEmail,
      recipientName: params.studentName,
      senderName: 'StudyHub Deadline Bot',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: `⏰ Urgent Reminder: "${params.itemTitle}" Due in 24 Hours!`,
      previewText: `Final reminder: Your ${params.itemType} in ${params.subjectName} is scheduled for ${params.dueDate}.`,
      category: 'deadline_reminder',
      sentAt: 'Just now',
      read: false,
      meta: {
        testTitle: params.itemTitle,
        subjectName: params.subjectName,
        dueDate: params.dueDate,
      },
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 26px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> 24h Countdown</h1>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #fff1f2; color: #e11d48; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(225,29,72,0.3); margin-bottom: 16px;">
              ⏰ 24 Hours Remaining
            </div>
            <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">${params.itemTitle}</h2>
            <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Hello <strong>${params.studentName}</strong>,<br/>
              This is a high-priority reminder that your <strong>${isTest ? 'scheduled examination' : 'coursework assignment'}</strong> is due within the next 24 hours.
            </p>
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Subject:</strong> ${params.subjectName}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Submission Deadline:</strong> ${params.dueDate}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Status:</strong> Awaiting Final Student Submission</p>
            </div>
            ${
              params.instructions
                ? `<p style="font-size: 12px; color: #557067; margin-bottom: 20px;">Note: ${params.instructions}</p>`
                : ''
            }
            <div style="text-align: center;">
              <a href="${isTest ? '/tests' : '/assignments'}" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none;">
                Submit Coursework Now
              </a>
            </div>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Sent directly to ${params.studentEmail} • StudyHub LMS</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // 4. Send Grade & Passing Marks Notification to student's Gmail
  public sendGradeResultEmail(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    testTitle: string;
    subjectName: string;
    score: number;
    maxScore: number;
    passingMarks: number;
    feedback?: string;
  }): EmailMessage {
    const isPassed = params.score >= params.passingMarks;
    const percentage = Math.round((params.score / params.maxScore) * 100);

    const newEmail: EmailMessage = {
      id: `em_grade_${Date.now()}`,
      recipientEmail: params.studentEmail,
      recipientName: params.studentName,
      senderName: params.teacherName || 'Faculty Evaluator',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: `🎓 Exam Graded: ${params.testTitle} - ${isPassed ? 'PASSED ✅' : 'NEEDS RETAKE ⚠️'} (${params.score}/${params.maxScore})`,
      previewText: `Your exam has been checked. Score: ${params.score}/${params.maxScore} (${percentage}%). ${isPassed ? 'Congratulations on passing!' : 'Please review teacher feedback.'}`,
      category: 'grade_result',
      sentAt: 'Just now',
      read: false,
      meta: {
        testTitle: params.testTitle,
        subjectName: params.subjectName,
        score: params.score,
        maxScore: params.maxScore,
        passingMarks: params.passingMarks,
        isPassed,
        teacherName: params.teacherName,
      },
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> Evaluation Report</h1>
            <p style="color: #a3c4b9; margin: 6px 0 0 0; font-size: 13px;">Official Faculty Marking Console</p>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: ${isPassed ? '#e8f8f0' : '#fff1f2'}; color: ${isPassed ? '#14B866' : '#e11d48'}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid ${isPassed ? 'rgba(20,184,102,0.3)' : 'rgba(225,29,72,0.3)'}; margin-bottom: 16px;">
              ${isPassed ? 'Certified Passing Marks Awarded' : 'Action Required: Re-attempt Allowed'}
            </div>
            <h2 style="color: #142D27; margin: 0 0 8px 0; font-size: 18px;">${params.testTitle}</h2>
            <p style="color: #557067; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear <strong>${params.studentName}</strong>,<br/>
              Your teacher <strong>${params.teacherName}</strong> has completed evaluating your assessment in <strong>${params.subjectName}</strong>.
            </p>
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #557067; font-size: 13px;">Final Marks:</td>
                  <td style="padding: 8px 0; color: ${isPassed ? '#14B866' : '#e11d48'}; font-size: 18px; font-weight: 800; text-align: right;">${params.score} / ${params.maxScore} (${percentage}%)</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #557067; font-size: 13px;">Passing Benchmark:</td>
                  <td style="padding: 8px 0; color: #142D27; font-size: 13px; font-weight: 600; text-align: right;">${params.passingMarks} Marks</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #557067; font-size: 13px;">Evaluation Status:</td>
                  <td style="padding: 8px 0; color: ${isPassed ? '#14B866' : '#e11d48'}; font-size: 13px; font-weight: 700; text-align: right;">${isPassed ? 'PASSED (Certificate Awarded)' : 'BELOW PASSING BENCHMARK'}</td>
                </tr>
              </table>
            </div>
            ${
              params.feedback
                ? `<div style="background: #ffffff; border-left: 4px solid #14B866; padding: 14px 16px; margin-bottom: 24px; background-color: #fafcfb; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #7d9990; text-transform: uppercase;">Teacher's Remarks:</p>
                    <p style="margin: 0; color: #142D27; font-size: 13px; font-style: italic;">"${params.feedback}"</p>
                   </div>`
                : ''
            }
            <div style="text-align: center;">
              <a href="/results" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(20,184,102,0.25);">
                Inspect Graded Paper in StudyHub
              </a>
            </div>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Sent directly to ${params.studentEmail} • StudyHub LMS</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // Teacher & Student Configured Gmail Getters & Setters
  public getTeacherConfiguredEmail(): string {
    try {
      const stored = localStorage.getItem('studyhub_teacher_configured_gmail');
      if (stored && !stored.includes('clara')) return stored;
    } catch {}
    return 'ahmadwebcore@gmail.com';
  }

  public setTeacherConfiguredEmail(email: string): void {
    try {
      localStorage.setItem('studyhub_teacher_configured_gmail', email);
    } catch {}
  }

  public getStudentConfiguredEmail(): string {
    try {
      const stored = localStorage.getItem('studyhub_student_configured_gmail');
      if (stored && !stored.includes('bilal')) return stored;
    } catch {}
    return 'dbaddiesvlog@gmail.com';
  }

  public setStudentConfiguredEmail(email: string): void {
    try {
      localStorage.setItem('studyhub_student_configured_gmail', email);
    } catch {}
  }

  // 5. Send Manual Direct Email from Teacher to Student
  public sendManualDirectEmail(params: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    message: string;
    senderName?: string;
    senderEmail?: string;
    category?: 'manual_notice' | 'system';
  }): EmailMessage {
    const sender = params.senderEmail || this.getTeacherConfiguredEmail();
    const senderTitle = params.senderName || 'Faculty Instructor';

    const newEmail: EmailMessage = {
      id: `em_man_${Date.now()}`,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      senderName: senderTitle,
      senderEmail: sender,
      subject: params.subject,
      previewText: params.message.slice(0, 100) + '...',
      category: params.category || 'manual_notice',
      sentAt: 'Just now',
      read: false,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 26px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">Study<span style="color: #14B866;">Hub</span> Direct Faculty Dispatch</h1>
            <p style="color: #a3c4b9; margin: 4px 0 0 0; font-size: 12px;">Official Notice from ${senderTitle}</p>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #e8f8f0; color: #14B866; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(20,184,102,0.3); margin-bottom: 16px;">
              Teacher Direct Message
            </div>
            <h2 style="color: #142D27; margin: 0 0 14px 0; font-size: 18px;">${params.subject}</h2>
            <p style="color: #557067; font-size: 14px; margin: 0 0 16px 0;">
              Dear <strong>${params.recipientName}</strong>,
            </p>
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 18px; margin-bottom: 24px; color: #263B35; font-size: 14px; line-height: 1.7; white-space: pre-line;">
              ${params.message}
            </div>
            <p style="color: #7d9990; font-size: 12px; margin: 0 0 20px 0;">
              Sent by: <strong>${senderTitle}</strong> (${sender})
            </p>
            <div style="text-align: center;">
              <a href="/weekly-tasks" style="display: inline-block; background: #14B866; color: #ffffff; font-weight: 700; font-size: 13px; padding: 12px 26px; border-radius: 12px; text-decoration: none;">
                Open StudyHub Portal
              </a>
            </div>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Dispatched to ${params.recipientEmail} via StudyHub Academic Engine</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // 6. Send Official Pakistan Gazetted Holiday & Sunday Off Alert
  public sendHolidayNoticeEmail(params: {
    recipientEmail: string;
    recipientName: string;
    holidayName: string;
    urduName?: string;
    date: string;
    description: string;
  }): EmailMessage {
    const sender = this.getTeacherConfiguredEmail();

    const newEmail: EmailMessage = {
      id: `em_hol_${Date.now()}`,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      senderName: 'StudyHub Academic Calendar',
      senderEmail: sender,
      subject: `🇵🇰 Public Holiday Notice: ${params.holidayName} (Off Day)`,
      previewText: `Official Gazetted Holiday observed across Pakistan on ${params.date}. No academic tasks or tests scheduled.`,
      category: 'holiday_alert',
      sentAt: 'Just now',
      read: false,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <div style="background: #142D27; padding: 26px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">🇵🇰 Pakistan Academic Calendar</h1>
            <p style="color: #14B866; margin: 4px 0 0 0; font-size: 13px; font-weight: 600;">Official Gazetted Holiday Announcement</p>
          </div>
          <div style="padding: 28px;">
            <div style="display: inline-block; background: #e8f8f0; color: #14B866; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(20,184,102,0.3); margin-bottom: 16px;">
              Mandatory Rest & Observance
            </div>
            <h2 style="color: #142D27; margin: 0 0 6px 0; font-size: 20px;">${params.holidayName}</h2>
            ${params.urduName ? `<p style="color: #14B866; font-size: 16px; margin: 0 0 14px 0; font-weight: 700;">${params.urduName}</p>` : ''}
            <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
              <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Date Observed:</strong> ${params.date}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #263B35;"><strong>Academic Status:</strong> Complete Off Day (Zero Homework / No Tests)</p>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #557067; line-height: 1.6;">${params.description}</p>
            </div>
            <p style="color: #557067; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">
              Dear <strong>${params.recipientName}</strong>,<br/>
              In accordance with Pakistan Federal Gazetted notification, all classes, daily tasks, and exam submissions are suspended. Take this time to rest, spend time with family, and reflect.
            </p>
            <div style="text-align: center;">
              <a href="/weekly-tasks" style="display: inline-block; background: #142D27; color: #ffffff; font-weight: 700; font-size: 13px; padding: 12px 26px; border-radius: 12px; text-decoration: none;">
                Review Updated Weekly Schedule
              </a>
            </div>
          </div>
          <div style="background: #F7F9F8; padding: 14px; text-align: center; border-top: 1px solid #e1ede7;">
            <p style="color: #7d9990; font-size: 11px; margin: 0;">Dispatched to ${params.recipientEmail} • Pakistan Academic Schedule Engine</p>
          </div>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }

  // 8. Send Login Verification OTP to Gmail
  public sendLoginVerificationCode(params: {
    email: string;
    code: string;
    recipientName?: string;
  }): EmailMessage {
    const newEmail: EmailMessage = {
      id: `em_otp_${Date.now()}`,
      recipientEmail: params.email,
      recipientName: params.recipientName || 'StudyHub User',
      senderName: 'StudyHub Security Gate',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: `🔐 Your StudyHub Login Verification Code: ${params.code}`,
      previewText: `Use verification code ${params.code} to complete your secure academic portal login.`,
      category: 'system',
      sentAt: 'Just now',
      read: false,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; overflow: hidden; padding: 24px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #142D27; margin: 0 0 6px 0; font-size: 20px;">StudyHub Security Verification</h2>
            <p style="color: #557067; font-size: 13px; margin: 0;">Enter this code to complete your login verification</p>
          </div>
          <div style="background: #F7F9F8; border: 1px solid #e1ede7; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #142D27; display: block;">
              ${params.code}
            </span>
          </div>
          <p style="color: #7d9990; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
            This single-use code is valid for 10 minutes. If you did not request this login code, please secure your account immediately.
          </p>
        </div>
      `,
    };

    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }
  // 9. Dispatch Manual / Automated Notification to Gmail
  public dispatchManualNotification(params: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    message: string;
  }): EmailMessage {
    const newEmail: EmailMessage = {
      id: `em_notice_${Date.now()}`,
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      senderName: 'Ahmad',
      senderEmail: 'ahmadwebcore@gmail.com',
      subject: params.subject,
      previewText: params.message.slice(0, 100),
      category: 'manual_notice',
      sentAt: 'Just now',
      read: false,
      htmlBody: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e1ede7; padding: 24px;">
          <h2 style="color: #142D27; margin: 0 0 12px 0;">${params.subject}</h2>
          <p style="color: #557067; font-size: 14px; line-height: 1.6;">${params.message}</p>
        </div>
      `,
    };
    this.emails.unshift(newEmail);
    this.saveEmails();
    return newEmail;
  }
}

export const emailService = new EmailService();
