import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileCheck2,
  CheckCircle2,
  Check,
  MessageSquare,
  GraduationCap,
  Compass,
  Layers,
  ArrowRight,
  Clock,
  Award,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X,
  Sparkles,
  BookOpen,
  CalendarCheck,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { taskService, DailyTask } from '../../services/taskService';
import { testService, extractDayAndCleanTitle, isDateToday } from '../../services/testService';
import { TestItem, ResultRecord } from '../../types';
import { SAMPLE_TESTS } from '../../data/sampleData';
import { DailyTestSeriesGrid } from '../../components/tests/DailyTestSeriesGrid';
import { BISEDGKhanModal } from '../../components/board/BISEDGKhanModal';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { PDFViewerModal } from '../../components/books/PDFViewerModal';
import { attendanceService, AttendanceRecord } from '../../services/attendanceService';

export const StudentDashboard: React.FC = () => {
  const { userProfile, user } = useRole();
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Henza Noor';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isDailyWelcomeOpen, setIsDailyWelcomeOpen] = useState(false);
  const [pdfModalData, setPdfModalData] = useState<{ isOpen: boolean; test?: TestItem; task?: DailyTask } | null>(null);
  const [isTodayPresent, setIsTodayPresent] = useState<boolean>(() => attendanceService.isTodayMarked());
  const [todayAttendanceRecord, setTodayAttendanceRecord] = useState<AttendanceRecord | undefined>(() => attendanceService.getTodayRecord());

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadData = () => {
    setTasks(taskService.getTasks());
    testService.fetchTests(user?.id).then((t) => {
      setTests(t || []);
    });
    testService.fetchResults(user?.id).then((r) => {
      setResults(r || []);
    });
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
      setIsTodayPresent(attendanceService.isTodayMarked());
      setTodayAttendanceRecord(attendanceService.getTodayRecord());
    };
    window.addEventListener('studyhub_tests_updated', handleUpdate);
    window.addEventListener('studyhub_tasks_updated', handleUpdate);
    window.addEventListener('studyhub_attendance_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Check if daily welcome modal has already been shown today
    const welcomeKey = `gsa_daily_welcome_${todayStr}`;
    const alreadyShown = localStorage.getItem(welcomeKey);
    if (!alreadyShown) {
      setIsDailyWelcomeOpen(true);
    }

    return () => {
      window.removeEventListener('studyhub_tests_updated', handleUpdate);
      window.removeEventListener('studyhub_tasks_updated', handleUpdate);
      window.removeEventListener('studyhub_attendance_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [todayStr]);

  const handleDismissDailyWelcome = () => {
    localStorage.setItem(`gsa_daily_welcome_${todayStr}`, 'true');
    if (!attendanceService.isTodayMarked()) {
      const res = attendanceService.markPresentToday(studentName);
      if (res.success) {
        setIsTodayPresent(true);
        setTodayAttendanceRecord(res.record);
      }
    }
    setIsDailyWelcomeOpen(false);
  };

  const handleMarkPresentToday = () => {
    const res = attendanceService.markPresentToday(studentName);
    if (res.success) {
      setIsTodayPresent(true);
      setTodayAttendanceRecord(res.record);
      setSuccessToast(`Attendance recorded: Present today at ${res.record.timeMarked}! Synced to Google Sheets.`);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // 15-second live ticker to keep today's active test and timers updated across midnight
  const [, setTick] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (!t.isSundayOff && !t.isPakistanHoliday && t.status === 'pending')
  );
  const activeTodayTask = todayTasks[0];
  const activeTodayTest =
    tests.find((t) => isDateToday(t.date, t.title, t.id) && t.status !== 'graded') ||
    tests.find((t) => t.status === 'ongoing') ||
    tests.find((t) => t.id.includes('urd_11_w1')) ||
    tests[0];

  useEffect(() => {
    if (isDailyWelcomeOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsDailyWelcomeOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = original || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isDailyWelcomeOpen]);

  const handleQuickCompleteQuota = (task?: DailyTask) => {
    const targetTask = task || todayTasks[0];
    if (targetTask) {
      taskService.submitTaskForApproval(targetTask.id, 'Daily textbook quota completed.', 'daily_notes.pdf');
      loadData();
      setSuccessToast(`Reading marked completed for "${targetTask.title}".`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      setSuccessToast("Today's 2.5 pages reading quota recorded as completed.");
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // Attendance & Performance metrics
  const now = new Date();
  const currentMonthStats = attendanceService.getMonthlyStats(now.getFullYear(), now.getMonth());

  // Week 1 tests (or current week tests)
  const currentWeekTests = tests.filter((t) => t.id.endsWith('_w1'));
  const completedWeekTests = currentWeekTests.filter((t) => {
    return t.studentScore !== undefined || t.myAttempt?.status === 'submitted' || t.status === 'graded';
  });
  const weekTotalScore = completedWeekTests.reduce((acc, t) => acc + (t.studentScore ?? t.myAttempt?.totalScore ?? 0), 0);
  const weekMaxScore = completedWeekTests.length * 30;
  const weekPercentage = weekMaxScore > 0 ? Math.round((weekTotalScore / weekMaxScore) * 100) : 0;

  const formattedToday = new Intl.DateTimeFormat('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-7 font-sans w-full pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 text-zinc-900 flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in duration-150">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-400 hover:text-zinc-700 text-sm">
            &times;
          </button>
        </div>
      )}

      {/* 1. Header Greeting & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Global Science Academy &bull; Fatehpur &bull; 1st Year FA-IT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Faculty Director: <strong className="text-zinc-200">Ahmad</strong> &bull; BISE DG Khan Board &bull; Daily quota &amp; 30-mark diagnostic test.
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Daily Presentation: Attendance Status */}
          {isTodayPresent ? (
            <div
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 rounded-xl shadow-2xs"
              title="Daily attendance recorded and synced to Google Sheets"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Present ({todayAttendanceRecord?.timeMarked || 'Marked'})</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMarkPresentToday}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/50 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer ring-1 ring-white/20"
              title="Click to mark today's daily presentation / attendance"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>Mark Present Today</span>
            </button>
          )}

          {/* Daily Welcome Briefing Trigger */}
          <button
            type="button"
            onClick={() => setIsDailyWelcomeOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/60 transition-all shadow-2xs cursor-pointer text-center"
            title="Open Today's Academic Briefing"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Briefing</span>
          </button>

          {/* Student 2FA & Password Settings */}
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-[#2e3533] border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-2xs cursor-pointer text-center"
            title="Set Password and Google Authenticator 2FA"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security &amp; 2FA</span>
          </button>

          <Link
            to="/chat"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-[#2e3533] border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-2xs text-center"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Message Ahmad</span>
          </Link>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-[#2e3533] border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all shadow-2xs text-center"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

{/* Daily Attendance Check-In Alert / Notification Banner (If 24h passed & not marked) */}
      {!isTodayPresent ? (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-emerald-400/30">
              <CalendarCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Daily Attendance Check-In
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                Mark Daily Presentation for {formattedToday}
              </h3>
              <p className="text-xs text-zinc-300">
                Tap to record your official attendance today. Synced live with Faculty Lead Ahmad and Google Sheets ledger.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleMarkPresentToday}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-950" />
            <span>Mark Present Today (1-Click)</span>
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Attendance Recorded:</strong> Present today ({todayAttendanceRecord?.timeMarked || 'Morning'}) &bull; Synchronized with Sir Ahmad
            </span>
          </div>
          <Link
            to="/integrations"
            className="text-[10px] font-semibold text-emerald-300 hover:text-white bg-emerald-900/60 hover:bg-emerald-800/80 px-2.5 py-1 rounded-full border border-emerald-500/30 transition-all flex items-center gap-1.5 w-fit shrink-0 cursor-pointer"
            title="View live Google Sheets sync stream and download ledger"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Sheets Synchronized</span>
            <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
          </Link>
        </div>
      )}

      {/* Simple Weekly & Monthly Performance (2 Balanced Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Academic Performance</h2>
            <p className="text-xs text-zinc-400">Simple weekly progress and monthly attendance overview.</p>
          </div>
          <span className="text-[11px] font-semibold text-zinc-400">
            Session: <strong className="text-zinc-200">1st Year FA-IT</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Weekly Performance (This Week) */}
          <div className="p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Weekly Performance &bull; Week 1
                </span>
                <span className="text-xs font-semibold text-[#557067]">
                  Nov 17 &ndash; Nov 21
                </span>
              </div>
              <h3 className="text-base font-bold text-[#142D27] font-serif pt-1">
                Current Week Targets
              </h3>
              <p className="text-xs text-[#557067]">
                Tests start Tuesday (Urdu), Wednesday (English), Thursday (Computer), Friday (2 Books: اسلامیات لازمی + ترجمۃ القرآن), Saturday (Economics &amp; Physical Education).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e1ede7] text-center">
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Tests Done</span>
                <span className="text-base font-extrabold text-[#142D27] mt-0.5 block">
                  {completedWeekTests.length} / 6
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Pass Rate</span>
                <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                  {completedWeekTests.length > 0 ? `${weekPercentage}%` : 'Starting Tue'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Sunday Rest</span>
                <span className="text-base font-extrabold text-sky-700 mt-0.5 block">
                  Strictly OFF
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Performance (November 2026) */}
          <div className="p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Monthly Overview &bull; {currentMonthStats.monthName} {currentMonthStats.year}
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  Verified Records
                </span>
              </div>
              <h3 className="text-base font-bold text-[#142D27] font-serif pt-1">
                Cumulative Monthly Ledger
              </h3>
              <p className="text-xs text-[#557067]">
                Live attendance presentation and verified examination evaluation recorded by Sir Ahmad.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e1ede7] text-center">
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Attendance</span>
                <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                  {currentMonthStats.attendancePercentage}%
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Board Standing</span>
                <span className="text-base font-extrabold text-[#142D27] mt-0.5 block">
                  A* Grade
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-zinc-200/70">
                <span className="text-[10px] font-bold text-zinc-500 uppercase block">Faculty Lead</span>
                <span className="text-base font-extrabold text-emerald-800 mt-0.5 block">
                  Ahmad
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* 2. Today's Core Work (Harmonious Contrast: 1 Crisp White Card + 1 Rich Dark Prestige Card) */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-lg font-bold text-white font-serif">Today's Focus</h2>
            <p className="text-xs text-zinc-400">Your two core academic priorities for {formattedToday}.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            Target: May 2027 Board Exams
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Daily Reading Quota (Crisp White Card) */}
          <div className="p-5 rounded-3xl bg-white border border-[#e1ede7] shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4 text-[#142D27]">
            {(() => {
              const todayTaskMeta = activeTodayTask ? extractDayAndCleanTitle(activeTodayTask.title) : null;
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                        Step 1 &bull; Daily Quota
                      </span>
                      {todayTaskMeta && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-urdu-compact">
                          {todayTaskMeta.day}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#557067] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {activeTodayTask ? `~${activeTodayTask.estimatedMinutes || 45} Mins` : '~45 Mins (2.5 Pgs)'}
                    </span>
                  </div>
                  {activeTodayTask?.subjectName && (
                    <span className="text-[11px] font-semibold text-emerald-700 block">
                      {activeTodayTask.subjectName}
                    </span>
                  )}
                  <h3 className={`font-serif ${
                    todayTaskMeta?.isUrdu
                      ? 'font-urdu text-[16px] font-bold text-[#142D27] leading-loose text-right dir-rtl'
                      : 'text-base font-bold text-[#142D27]'
                  }`}>
                    <bdi>{todayTaskMeta ? todayTaskMeta.cleanTitle : 'No Daily Reading Task Scheduled'}</bdi>
                  </h3>
                  <p className="text-xs text-[#557067] leading-relaxed">
                    {activeTodayTask
                      ? activeTodayTask.description
                      : 'Upload your 1st Year FA-IT textbook PDF in Book Library to auto-generate daily study targets and page quotas (Sundays OFF).'}
                  </p>
                </div>
              );
            })()}

            <div className="pt-2 border-t border-[#e1ede7] flex flex-wrap items-center gap-2">
              {activeTodayTask ? (
                <>
                  <button
                    type="button"
                    onClick={() => setPdfModalData({ isOpen: true, task: activeTodayTask })}
                    className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                    title="View attached textbook pages in PDF"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View in PDF {activeTodayTask.pagesRange ? `(${activeTodayTask.pagesRange})` : ''}</span>
                  </button>
                  <Link
                    to="/weekly-tasks"
                    className="flex-1 py-2 px-3 text-center text-xs font-semibold text-[#263B35] bg-[#F7F9F8] hover:bg-[#e8f8f0] border border-[#e1ede7] rounded-xl transition-colors"
                  >
                    Weekly Tasks
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleQuickCompleteQuota(activeTodayTask)}
                    className="py-2 px-3.5 inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-2xs active:scale-95 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Done</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/library"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                  <span>Upload Book PDF in Library</span>
                </Link>
              )}
            </div>
          </div>

          {/* Card 2: Today's 30-Mark Test (Crisp White Card with Emerald Accent) */}
          {(() => {
            const todayTestMeta = activeTodayTest ? extractDayAndCleanTitle(activeTodayTest.title, activeTodayTest.date) : null;

            return (
              <div className="p-5 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-md hover:border-emerald-500 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 text-[#142D27]">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                        Step 2 &bull; 30-Mark Test
                      </span>
                      {todayTestMeta && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-urdu-compact">
                          {todayTestMeta.day}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      {activeTodayTest ? `Pass: ${activeTodayTest.passingMarks}/${activeTodayTest.totalMarks} Marks` : 'Pass: 15/30 Marks'}
                    </span>
                  </div>
                  <h3 className={`font-serif ${
                    todayTestMeta?.isUrdu
                      ? 'font-urdu text-[16px] font-bold text-[#142D27] leading-loose text-right dir-rtl'
                      : 'text-base font-bold text-[#142D27]'
                  }`}>
                    <bdi>{todayTestMeta ? todayTestMeta.cleanTitle : 'No 30-Mark Test Scheduled'}</bdi>
                  </h3>
                  <p className="text-xs text-[#557067] leading-relaxed">
                    {activeTodayTest
                      ? activeTodayTest.syllabusCoverage || activeTodayTest.instructions
                      : 'Upload your textbook PDF to break chapters into weekly 30-mark assessments mapped to BISE DG Khan pattern.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e1ede7] flex flex-wrap items-center gap-2">
                  {activeTodayTest ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setPdfModalData({ isOpen: true, test: activeTodayTest })}
                        className="inline-flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                        title="View test chapter & 30-mark past paper questions in PDF"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Test in PDF</span>
                      </button>
                      <Link
                        to={`/test-submit?testId=${activeTodayTest.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <FileCheck2 className="w-3.5 h-3.5 text-white" />
                        <span>Start 30-Mark Test</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                      </Link>
                    </>
                  ) : (
                    <Link
                      to="/library"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all"
                    >
                      <span>📚 Browse Textbook Library &amp; PDFs</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 3. This Week's 5-Box Scheduled Tests Grid */}
      <div className="space-y-2">
        <DailyTestSeriesGrid tests={tests} />
      </div>

      {/* 4. Support & Board Hub (2 Crisp White Matched Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Tutor Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#e1ede7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 text-[#142D27]">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-[#142D27] font-serif">
              Academic Tutor (Global Science Academy)
            </h3>
            <p className="text-xs text-[#557067] leading-relaxed">
              Have doubts on Bus Topology, CPU registers, or Urdu grammar? Ask in English, Urdu, or Roman Urdu for clear analogies.
            </p>
          </div>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center justify-between p-2.5 rounded-xl bg-[#F7F9F8] hover:bg-[#e8f8f0] border border-[#e1ede7] text-xs font-semibold text-[#263B35] transition-colors"
          >
            <span>Ask: "Explain Bus Topology with real analogy"</span>
            <ChevronRight className="w-4 h-4 text-[#7d9990]" />
          </Link>
        </div>

        {/* BISE DG Khan Pairing Scheme Card */}
        <div className="p-5 rounded-3xl bg-white border border-[#e1ede7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 text-[#142D27]">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200/80">
              🇵🇰
            </div>
            <h3 className="text-sm font-bold text-[#142D27] font-serif">
              BISE DG Khan Board Updates &amp; Pairing
            </h3>
            <p className="text-xs text-[#557067] leading-relaxed">
              Review question distributions for 1st Year FA-IT: MCQs, Short Questions, Long Questions, and 2026–2027 annual timetable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(true)}
            className="inline-flex items-center justify-between p-2.5 rounded-xl bg-[#F7F9F8] hover:bg-[#e8f8f0] border border-[#e1ede7] text-xs font-semibold text-[#263B35] transition-colors cursor-pointer"
          >
            <span>View 1st Year FA-IT Pairing Scheme</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* 5. Recent Verified Marks & Certified History (Crisp White Card) */}
      <div className="bg-white rounded-3xl border border-[#e1ede7] p-5 shadow-sm space-y-3 text-[#142D27]">
        <div className="flex items-center justify-between border-b border-[#e1ede7] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#142D27] font-serif">
                Recent Certified Marks &amp; Records
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {results.length} Verified
              </span>
            </div>
            <p className="text-[11px] text-[#557067] mt-0.5">
              Evaluated and certified by faculty director Ahmad. Records are permanently preserved.
            </p>
          </div>
          <Link
            to="/results"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View All Results &rarr;
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-2xl bg-[#F7F9F8] border border-dashed border-[#e1ede7] space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-[#142D27]">No Certified Records Yet</h4>
            <p className="text-[11px] text-[#557067] max-w-sm mx-auto leading-relaxed">
              Assessment checking starts tomorrow. Once faculty director Ahmad grades Henza Noor's daily tests, certified marks and feedback will appear here dynamically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e1ede7] text-xs">
            {results.slice(0, 5).map((r) => (
              <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-[#142D27] block">{r.testTitle || 'Diagnostic Assessment'}</span>
                  <span className="text-[11px] text-[#7d9990]">{r.subjectName || 'FA-IT'} &bull; Evaluated by Ahmad</span>
                </div>
                <div className="text-right">
                  <span className={`font-extrabold px-2 py-0.5 rounded-full ${
                    r.passed ? 'text-emerald-800 bg-emerald-50 border border-emerald-200/80' : 'text-rose-800 bg-rose-50 border border-rose-200/80'
                  }`}>
                    {r.score} / {r.maxScore || 30} ({r.grade || (r.passed ? 'Grade A' : 'Retest')})
                  </span>
                  <span className={`block text-[10px] mt-0.5 ${r.passed ? 'text-[#557067]' : 'text-rose-600'}`}>
                    {r.passed ? 'Certified Passed' : 'Retest Required'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DYNAMIC DAILY WELCOME POPUP MODAL (Portaled to body) */}
      {isDailyWelcomeOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
            onClick={handleDismissDailyWelcome}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border border-zinc-200 max-w-lg w-full max-h-[92dvh] sm:max-h-[88vh] shadow-2xl flex flex-col overflow-hidden text-zinc-900 my-auto animate-in zoom-in-95 duration-200"
            >
              {/* Header (Fixed) */}
              <div className="shrink-0 p-5 sm:p-6 border-b border-zinc-100 bg-[#F7F9F8] flex items-start justify-between gap-3 relative">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Global Science Academy &bull; Fatehpur</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-serif text-zinc-900">
                    Daily Briefing &bull; {studentName}
                  </h2>
                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{formattedToday}</span>
                    <span className="text-zinc-300">&bull;</span>
                    <span>1st Year FA-IT (BISE DG Khan)</span>
                  </p>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleDismissDailyWelcome}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 transition-colors cursor-pointer shrink-0 ml-1"
                  aria-label="Dismiss Briefing"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
                {/* Daily Presentation Attendance Check-in */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/70 border border-emerald-200/90 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Daily Presentation &bull; Attendance
                      </span>
                      <span className="text-xs font-bold text-zinc-900 block">
                        {isTodayPresent
                          ? `Present Today (Marked at ${todayAttendanceRecord?.timeMarked || 'Morning'})`
                          : 'Daily Presence Check-In'}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        {isTodayPresent
                          ? 'Synchronized directly to Faculty Google Sheet ledger.'
                          : 'Click to mark attendance and notify Sir Ahmad.'}
                      </span>
                    </div>
                  </div>
                  {!isTodayPresent ? (
                    <button
                      type="button"
                      onClick={handleMarkPresentToday}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Mark Present
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg shrink-0">
                      ✓ Recorded
                    </span>
                  )}
                </div>

                {/* Daily Checklist Cards */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Reading Quota: 2.5 Pages Target
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900">
                        Computer Science: Read Pages 96–98
                      </h4>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        Chapter 2: Information Networks. Review Network Topologies (Bus, Star, Ring, Mesh).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex items-start gap-3 shadow-2xs">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Today's Assessment: 30 Marks
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900">
                        Chapter 2 Diagnostic Assessment
                      </h4>
                      <p className="text-[11px] text-zinc-600 leading-relaxed">
                        10 MCQs + 4 Short Questions. Passing score is 15 marks. Evaluated by Ahmad.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="shrink-0 p-4 sm:p-5 border-t border-zinc-100 bg-[#F7F9F8]">
                <button
                  type="button"
                  onClick={handleDismissDailyWelcome}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Today's Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Change Password Modal (Supports Manual Password & Google Authenticator 2FA) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => {
          setSuccessToast('Account security updated successfully.');
          setTimeout(() => setSuccessToast(null), 3500);
        }}
      />

      {/* BISE DG Khan Modal */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />

      {/* PDF Textbook Reader Modal with Attached Pages */}
      {pdfModalData?.isOpen && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setPdfModalData(null)}
          testId={pdfModalData.test?.id}
          testTitle={pdfModalData.test?.title || pdfModalData.task?.title}
          subjectCode={pdfModalData.test?.subjectCode || pdfModalData.task?.subjectCode}
          subjectName={pdfModalData.test?.subjectName || pdfModalData.task?.subjectName}
          pagesRange={pdfModalData.task?.pagesRange}
          syllabusCoverage={pdfModalData.test?.syllabusCoverage || pdfModalData.task?.description}
        />
      )}
    </div>
  );
};