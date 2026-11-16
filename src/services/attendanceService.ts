// StudyHub Attendance & Presence Tracking Service
// Manages daily presentation (attendance) for students and monthly reporting for teachers.
// Automatically syncs every attendance check-in and test score to Google Sheets.

import { integrationService } from './integrationService';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "Monday, Nov 16, 2026"
  studentId: string;
  studentName: string;
  status: 'present' | 'absent' | 'sunday_off' | 'holiday';
  timeMarked?: string; // e.g. "09:15 AM"
  subjectOfDay: string; // e.g. "Physical Education"
  testStatus?: 'submitted' | 'pending' | 'graded';
  testScore?: number;
  testMaxScore?: number;
  testResult?: 'passed' | 'retest';
  syncedToGoogleSheet: boolean;
  syncedAt?: string;
  isAfterDeadline?: boolean;
}

export interface MonthlyAttendanceStats {
  monthName: string;
  year: number;
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  sundaysOff: number;
  attendancePercentage: number;
  onTimeSubmissionPercentage: number;
  daysOnSchedule: number;
  daysLateOrAfter: number;
}

const ATTENDANCE_STORAGE_KEY = 'studyhub_attendance_records_v3';

const DAY_SUBJECT_MAP: Record<number, string> = {
  0: 'Sunday (OFF)',
  1: 'Physical Education 11',
  2: 'Urdu & Grammar 11',
  3: 'English & Grammar 11',
  4: 'Computer Science 11',
  5: 'Tarjuma-tul-Quran & Islamiyat 11',
  6: 'Principles of Economics 11',
};

class AttendanceService {
  private records: Map<string, AttendanceRecord> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
      if (stored) {
        const list: AttendanceRecord[] = JSON.parse(stored);
        list.forEach((r) => this.records.set(r.date, r));
      } else {
        this.generateDefaultHistory();
      }
    } catch {
      this.generateDefaultHistory();
    }
  }

  private save() {
    try {
      const list = Array.from(this.records.values());
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('studyhub_attendance_updated'));
    } catch {}
  }

  private generateDefaultHistory() {
    // Generate realistic historical attendance records for current and past 2 months
    const today = new Date();
    const studentName = 'Henza Noor';

    // Generate for current month (Nov 2026) and previous months (Oct 2026, Sep 2026)
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        if (monthOffset === 0 && d > today) continue; // Future days not generated

        const dateStr = d.toISOString().slice(0, 10);
        const dayOfWeek = d.getDay();
        const isSunday = dayOfWeek === 0;

        let status: 'present' | 'absent' | 'sunday_off' | 'holiday' = 'present';
        if (isSunday) {
          status = 'sunday_off';
        } else if (day === 8 && monthOffset === 1) {
          status = 'absent'; // 1 realistic absence in past month
        }

        const subject = DAY_SUBJECT_MAP[dayOfWeek] || 'General Subject';
        const formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        const record: AttendanceRecord = {
          id: `att_${dateStr}`,
          date: dateStr,
          formattedDate,
          studentId: 'usr_s_01',
          studentName,
          status,
          timeMarked: isSunday ? undefined : '09:12 AM',
          subjectOfDay: subject,
          testStatus: isSunday ? undefined : 'graded',
          testScore: isSunday ? undefined : Math.floor(25 + Math.random() * 5),
          testMaxScore: isSunday ? undefined : 30,
          testResult: isSunday ? undefined : 'passed',
          syncedToGoogleSheet: true,
          syncedAt: isSunday ? undefined : `${dateStr} 09:15:00`,
          isAfterDeadline: false,
        };

        this.records.set(dateStr, record);
      }
    }

    this.save();
  }

  public getTodayString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  public isTodayMarked(): boolean {
    const todayStr = this.getTodayString();
    const rec = this.records.get(todayStr);
    return rec?.status === 'present';
  }

  public getTodayRecord(): AttendanceRecord | undefined {
    const todayStr = this.getTodayString();
    return this.records.get(todayStr);
  }

  public markPresentToday(studentName = 'Henza Noor'): { success: boolean; record: AttendanceRecord } {
    const d = new Date();
    const todayStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isSunday = dayOfWeek === 0;

    const timeMarked = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formattedDate = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const subject = DAY_SUBJECT_MAP[dayOfWeek] || 'Daily Assessment';

    const record: AttendanceRecord = {
      id: `att_${todayStr}`,
      date: todayStr,
      formattedDate,
      studentId: 'usr_s_01',
      studentName,
      status: isSunday ? 'sunday_off' : 'present',
      timeMarked,
      subjectOfDay: subject,
      testStatus: isSunday ? undefined : 'pending',
      testScore: undefined,
      testMaxScore: 30,
      testResult: undefined,
      syncedToGoogleSheet: true,
      syncedAt: `${todayStr} ${timeMarked}`,
      isAfterDeadline: false,
    };

    this.records.set(todayStr, record);
    this.save();

    // Automatically sync to Google Sheets
    integrationService.recordActivityInGoogleSheet({
      date: formattedDate,
      studentName,
      activityType: 'Daily Attendance (Present)',
      subject: subject,
      score: 'Present (On-Time)',
      resultStatus: 'PRESENT',
      remarks: `Marked daily presence at ${timeMarked}`,
    });

    return { success: true, record };
  }

  public updateTestSubmission(dateStr: string, score: number, maxScore: number, subject: string, studentName = 'Henza Noor') {
    let rec = this.records.get(dateStr);
    const percentage = Math.round((score / maxScore) * 100);
    const isPass = percentage >= 50;

    if (!rec) {
      const d = new Date(dateStr);
      rec = {
        id: `att_${dateStr}`,
        date: dateStr,
        formattedDate: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        studentId: 'usr_s_01',
        studentName,
        status: 'present',
        timeMarked: '09:00 AM',
        subjectOfDay: subject,
        syncedToGoogleSheet: true,
      };
    }

    rec.testStatus = 'graded';
    rec.testScore = score;
    rec.testMaxScore = maxScore;
    rec.testResult = isPass ? 'passed' : 'retest';
    rec.syncedToGoogleSheet = true;
    rec.syncedAt = new Date().toISOString();

    this.records.set(dateStr, rec);
    this.save();

    // Automatically sync test result to Google Sheets
    integrationService.recordActivityInGoogleSheet({
      date: rec.formattedDate,
      studentName,
      activityType: '30-Mark Test Evaluation',
      subject: subject,
      score: `${score}/${maxScore} (${percentage}%)`,
      resultStatus: isPass ? 'PASSED' : 'RETEST',
      remarks: `Certified by Ahmad • ${percentage}% Score`,
    });
  }

  public getMonthRecords(year: number, monthIndex: number): AttendanceRecord[] {
    const list: AttendanceRecord[] = [];
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex, day);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOfWeek = d.getDay();
      const isSunday = dayOfWeek === 0;

      const existing = this.records.get(dateStr);
      if (existing) {
        list.push(existing);
      } else {
        const formattedDate = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const subject = DAY_SUBJECT_MAP[dayOfWeek] || 'General Subject';

        list.push({
          id: `att_placeholder_${dateStr}`,
          date: dateStr,
          formattedDate,
          studentId: 'usr_s_01',
          studentName: 'Student Scholar',
          status: isSunday ? 'sunday_off' : 'absent',
          subjectOfDay: subject,
          syncedToGoogleSheet: false,
        });
      }
    }

    return list;
  }

  public getMonthlyStats(year: number, monthIndex: number): MonthlyAttendanceStats {
    const records = this.getMonthRecords(year, monthIndex);
    const monthName = new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long' });

    let workingDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let sundaysOff = 0;
    let onTimeCount = 0;

    records.forEach((r) => {
      if (r.status === 'sunday_off') {
        sundaysOff++;
      } else {
        workingDays++;
        if (r.status === 'present') {
          presentDays++;
          if (!r.isAfterDeadline) onTimeCount++;
        } else {
          absentDays++;
        }
      }
    });

    const attendancePercentage = workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 100;
    const onTimeSubmissionPercentage = presentDays > 0 ? Math.round((onTimeCount / presentDays) * 100) : 100;

    return {
      monthName,
      year,
      totalDays: records.length,
      workingDays,
      presentDays,
      absentDays,
      sundaysOff,
      attendancePercentage,
      onTimeSubmissionPercentage,
      daysOnSchedule: onTimeCount,
      daysLateOrAfter: presentDays - onTimeCount,
    };
  }
}

export const attendanceService = new AttendanceService();
