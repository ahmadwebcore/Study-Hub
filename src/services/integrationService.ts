// StudyHub Integrations Service
// Handles Google Sheets sync/export and direct WhatsApp click-to-chat (non-API)

export interface WhatsAppConfig {
  phoneNumber: string; // e.g. "923001234567"
  recipientName: string; // "Student Scholar" or "Parent"
  includeAhmadRemarks: boolean;
  defaultLanguage: 'urdu' | 'english' | 'both';
}

export interface GoogleSheetsConfig {
  sheetUrl?: string;
  webhookUrl?: string;
  autoSyncEnabled: boolean;
  lastSyncedAt?: string;
}

const WA_CONFIG_KEY = 'studyhub_whatsapp_config_v1';
const GSHEETS_CONFIG_KEY = 'studyhub_gsheets_config_v1';

class IntegrationService {
  private waConfig: WhatsAppConfig = {
    phoneNumber: '923001234567',
    recipientName: 'Student Scholar / Parent',
    includeAhmadRemarks: true,
    defaultLanguage: 'both',
  };

  private gsheetsConfig: GoogleSheetsConfig = {
    sheetUrl: 'https://docs.google.com/spreadsheets/d/1studyhub-fait-2027-records',
    webhookUrl: '',
    autoSyncEnabled: true,
    lastSyncedAt: 'Today at 09:30 AM',
  };

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const storedWa = localStorage.getItem(WA_CONFIG_KEY);
      if (storedWa) this.waConfig = JSON.parse(storedWa);

      const storedGs = localStorage.getItem(GSHEETS_CONFIG_KEY);
      if (storedGs) this.gsheetsConfig = JSON.parse(storedGs);
    } catch {}
  }

  public getWhatsAppConfig(): WhatsAppConfig {
    return { ...this.waConfig };
  }

  public saveWhatsAppConfig(config: WhatsAppConfig): void {
    this.waConfig = { ...config };
    try {
      localStorage.setItem(WA_CONFIG_KEY, JSON.stringify(this.waConfig));
    } catch {}
  }

  public getGoogleSheetsConfig(): GoogleSheetsConfig {
    return { ...this.gsheetsConfig };
  }

  public saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
    this.gsheetsConfig = { ...config };
    try {
      localStorage.setItem(GSHEETS_CONFIG_KEY, JSON.stringify(this.gsheetsConfig));
    } catch {}
  }

  /**
   * Generate Direct WhatsApp URL (NO API KEY REQUIRED)
   */
  public generateWhatsAppUrl(messageText: string, customPhone?: string): string {
    const rawPhone = (customPhone || this.waConfig.phoneNumber).replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(messageText);
    return `https://wa.me/${rawPhone}?text=${encoded}`;
  }

  /**
   * Format a clean, official test result report for WhatsApp
   */
  public formatTestResultForWhatsApp(params: {
    studentName: string;
    subjectName: string;
    testTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    grade: string;
    passed: boolean;
    date: string;
    feedback?: string;
  }): string {
    const statusEmoji = params.passed ? '✅ PASSED' : '⚠️ RETEST REQUIRED';

    return `🇵🇰 *StudyHub — BISE DG Khan FA-IT Academic Report*
━━━━━━━━━━━━━━━━━━━━━━
👤 *Student:* ${params.studentName}
📚 *Class:* 1st Year FA-IT (Intermediate Part-1)
🏛️ *Board:* BISE D.G. Khan
📘 *Subject:* ${params.subjectName}
📝 *Test:* ${params.testTitle}
📅 *Date:* ${params.date}
━━━━━━━━━━━━━━━━━━━━━━
🎯 *Marks Awarded:* ${params.score}/${params.maxScore} (${params.percentage}%)
🏆 *Grade:* ${params.grade} (${statusEmoji})
📌 *Passing Benchmark:* 15/30 Marks (50%)
${params.feedback ? `\n👨‍🏫 *Ahmad (Faculty Lead) Remarks:*\n"${params.feedback}"\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━
🎯 *Academic Goal:* Complete all 6 Books by Feb 28, 2027
🌴 *Sunday Policy:* Strictly OFF (Rest & Revision)
🔗 *Portal:* StudyHub Private Learning Desk`;
  }

  /**
   * Format Daily Routine & Book Quota for WhatsApp
   */
  public formatDailyQuotaForWhatsApp(params: {
    studentName: string;
    day: string;
    subject: string;
    quotaPages: string;
    testTitle?: string;
  }): string {
    return `🇵🇰 *StudyHub Daily Study Routine (${params.day})*
━━━━━━━━━━━━━━━━━━━━━━
👨‍🎓 *Student:* ${params.studentName}
📚 *Group:* 1st Year FA-IT (BISE DG Khan)
━━━━━━━━━━━━━━━━━━━━━━
1️⃣ *Daily Book Quota:*
📖 *Subject:* ${params.subject}
📄 *Pages to Read:* ${params.quotaPages} (~2.5 pages)

2️⃣ *Today's 30-Mark Test:*
📝 *Test:* ${params.testTitle || 'Scheduled Daily Unit Assessment (30 Marks)'}
⏱️ *Passing Benchmark:* 15/30 Marks (50%)

3️⃣ *Faculty Guidance:*
💬 Direct messaging with Ahmad or AI Study Assistant in portal.

4️⃣ *Board Target:*
🎯 Complete entire syllabus by February 28, 2027
━━━━━━━━━━━━━━━━━━━━━━
_Sent via StudyHub Learning Portal_`;
  }

  /**
   * Export all test records to CSV format for Google Sheets
   */
  public generateCSVForGoogleSheets(
    records: Array<{
      id: string;
      testTitle: string;
      subjectName: string;
      date: string;
      studentName: string;
      score: number;
      maxScore: number;
      percentage: number;
      grade: string;
      status: string;
      feedback?: string;
    }>
  ): string {
    const headers = [
      'Record ID',
      'Test Title',
      'Subject',
      'Date',
      'Student Name',
      'Score (Marks)',
      'Max Score',
      'Percentage (%)',
      'Board Grade',
      'Result Status',
      'Faculty Remarks (Ahmad)',
    ];

    const rows = records.map((r) => [
      `"${r.id}"`,
      `"${r.testTitle.replace(/"/g, '""')}"`,
      `"${r.subjectName.replace(/"/g, '""')}"`,
      `"${r.date}"`,
      `"${r.studentName}"`,
      r.score,
      r.maxScore,
      `${r.percentage}%`,
      `"${r.grade}"`,
      `"${r.status}"`,
      `"${(r.feedback || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  /**
   * Trigger direct CSV file download
   */
  public downloadCSV(csvContent: string, fileName = 'StudyHub_FAIT_Marks_Record.csv'): void {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const integrationService = new IntegrationService();
