import { useRole } from '../../hooks/useRole';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  BookOpen,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  FileCheck2,
  X,
} from 'lucide-react';
import { TestItem } from '../../types';
import { SAMPLE_SUBJECTS } from '../../data/sampleData';
import { extractDayAndCleanTitle } from '../../services/testService';
import { integrationService } from '../../services/integrationService';
import { PDFViewerModal } from '../books/PDFViewerModal';

interface DailyTestSeriesGridProps {
  tests: TestItem[];
  onTakeTest?: (test: TestItem) => void;
  onGradeTest?: (test: TestItem) => void;
  onRefreshTests?: () => void;
}

export type TestDisplayStatus = 'locked' | 'today' | 'passed' | 'failed_retest' | 'submitted' | 'pending';

export const ACADEMIC_WEEKS = [
  { id: 'all', label: 'All Weeks (1 to 15)' },
  { id: 'w1', label: 'Week 1 (Nov 16 - Nov 21) • Current' },
  { id: 'w2', label: 'Week 2 (Nov 23 - Nov 28)' },
  { id: 'w3', label: 'Week 3 (Nov 30 - Dec 05)' },
  { id: 'w4', label: 'Week 4 (Dec 07 - Dec 12)' },
  { id: 'w5', label: 'Week 5 (Dec 14 - Dec 19)' },
  { id: 'w6', label: 'Week 6 (Dec 21 - Dec 26)' },
  { id: 'w7', label: 'Week 7 (Dec 28 - Jan 02)' },
  { id: 'w8', label: 'Week 8 (Jan 04 - Jan 09)' },
  { id: 'w9', label: 'Week 9 (Jan 11 - Jan 16)' },
  { id: 'w10', label: 'Week 10 (Jan 18 - Jan 23)' },
  { id: 'w11', label: 'Week 11 (Jan 25 - Jan 30)' },
  { id: 'w12', label: 'Week 12 (Feb 01 - Feb 06)' },
  { id: 'w13', label: 'Week 13 (Feb 08 - Feb 13)' },
  { id: 'w14', label: 'Week 14 (Feb 15 - Feb 20)' },
  { id: 'w15', label: 'Week 15 (Feb 22 - Feb 28 - Final Mocks)' },
];

export const DailyTestSeriesGrid: React.FC<DailyTestSeriesGridProps> = ({
  tests,
  onTakeTest,
  onGradeTest,
  onRefreshTests: _onRefreshTests,
}) => {
  const { role } = useRole();
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [activePopupTest, setActivePopupTest] = useState<TestItem | null>(null);
  const [pdfViewerTest, setPdfViewerTest] = useState<TestItem | null>(null);

  // Completed / Graded local map for reactive live status
  const [completedMap, setCompletedMap] = useState<Record<string, { status: TestDisplayStatus; score?: number }>>(() => {
    try {
      const stored = localStorage.getItem('studyhub_test_statuses_v2');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem('studyhub_test_statuses_v2');
        if (stored) setCompletedMap(JSON.parse(stored));
      } catch {}
    };
    window.addEventListener('studyhub_tests_updated', handleSync);
    window.addEventListener('studyhub_submissions_updated', handleSync);
    return () => {
      window.removeEventListener('studyhub_tests_updated', handleSync);
      window.removeEventListener('studyhub_submissions_updated', handleSync);
    };
  }, []);

  // Lock body scroll and listen for Escape key when popup test is open
  useEffect(() => {
    if (activePopupTest) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setActivePopupTest(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [activePopupTest]);

  // Compute test timing, locking, and live evaluation status
  const getTestStatus = (test: TestItem): {
    status: TestDisplayStatus;
    label: string;
    badgeClass: string;
    isLocked: boolean;
    isToday: boolean;
    unlockTimeText: string;
    scoreText?: string;
  } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testDate = new Date(test.date);
    testDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((testDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    const isToday = diffDays === 0 || test.id === 'tst_today';
    const isFuture = diffDays > 0 && test.id !== 'tst_today';
    const isPast = diffDays < 0;

    // Check if test was graded or submitted
    const localOverride = completedMap[test.id];
    const score = localOverride?.score !== undefined ? localOverride.score : test.studentScore ?? test.myAttempt?.totalScore;
    const isGraded = (localOverride?.status === 'passed' || localOverride?.status === 'failed_retest') || test.status === 'graded' || score !== undefined;
    const isSubmitted = localOverride?.status === 'submitted' || test.myAttempt?.status === 'submitted';

    if (isGraded && score !== undefined) {
      const passed = score >= (test.passingMarks || 15);
      if (passed) {
        return {
          status: 'passed',
          label: `${score}/30 Passed`,
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
          isLocked: false,
          isToday: false,
          unlockTimeText: 'Completed',
          scoreText: `${score}/30 (${Math.round((score / 30) * 100)}%)`,
        };
      } else {
        return {
          status: 'failed_retest',
          label: `${score}/30 Retest`,
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
          isLocked: false,
          isToday: false,
          unlockTimeText: 'Retest Required',
          scoreText: `${score}/30 (Below 15)`,
        };
      }
    }

    if (isSubmitted) {
      return {
        status: 'submitted',
        label: 'Submitted / Review',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 font-semibold',
        isLocked: false,
        isToday,
        unlockTimeText: 'Awaiting Grading',
      };
    }

    // Future tests are locked until 12:00 AM on that day
    if (isFuture) {
      return {
        status: 'locked',
        label: 'Locked',
        badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200 font-medium',
        isLocked: true,
        isToday: false,
        unlockTimeText: `Unlocks 12:00 AM (${test.date})`,
      };
    }

    // Today's test is unlocked at 12:00 AM!
    if (isToday) {
      return {
        status: 'today',
        label: "Today's Test",
        badgeClass: 'bg-emerald-600 text-white font-bold shadow-2xs',
        isLocked: false,
        isToday: true,
        unlockTimeText: 'Active Today (Closes 11:59 PM)',
      };
    }

    // Past test that was neither submitted nor graded = Pending
    if (isPast) {
      return {
        status: 'pending',
        label: 'Pending',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 font-semibold',
        isLocked: false,
        isToday: false,
        unlockTimeText: 'Past Due / Pending',
      };
    }

    return {
      status: 'locked',
      label: 'Scheduled',
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      isLocked: true,
      isToday: false,
      unlockTimeText: `Unlocks 12:00 AM`,
    };
  };

  // Week & Subject & Status Filtering
  const filteredTests = tests.filter((t) => {
    // Week filter (Week 1, Week 2, ..., Week 15)
    if (selectedWeek !== 'all') {
      const matchId = t.id.includes(`_${selectedWeek}`) || t.id.endsWith(`_${selectedWeek}`);
      if (!matchId) {
        const base = new Date(2026, 10, 16);
        const testDate = new Date(t.date);
        if (!isNaN(testDate.getTime())) {
          const diffWeeks = Math.floor((testDate.getTime() - base.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
          if (`w${diffWeeks}` !== selectedWeek) return false;
        } else {
          return false;
        }
      }
    }

    // Subject filter
    if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;

    // Status filter
    const statusMeta = getTestStatus(t);
    if (selectedStatusFilter !== 'all') {
      if (selectedStatusFilter === 'today' && !statusMeta.isToday) return false;
      if (selectedStatusFilter === 'locked' && !statusMeta.isLocked) return false;
      if (selectedStatusFilter === 'passed' && statusMeta.status !== 'passed') return false;
      if (selectedStatusFilter === 'pending' && statusMeta.status !== 'pending' && statusMeta.status !== 'submitted') return false;
      if (selectedStatusFilter === 'retest' && statusMeta.status !== 'failed_retest') return false;
    }

    // Hide completed toggle
    if (hideCompleted && (statusMeta.status === 'passed' || statusMeta.status === 'submitted')) {
      return false;
    }

    return true;
  });

  // Priority sorting: Today's active test first, followed by nearest scheduled/pending tests, then past archived
  const displayTests = [...filteredTests].sort((a, b) => {
    const metaA = getTestStatus(a);
    const metaB = getTestStatus(b);
    if (metaA.isToday && !metaB.isToday) return -1;
    if (!metaA.isToday && metaB.isToday) return 1;
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateA - dateB;
  });

  const handleAttemptFromModal = (test: TestItem) => {
    setActivePopupTest(null);
    if (onTakeTest) {
      onTakeTest(test);
    } else {
      window.location.href = '/test-submit';
    }
  };

  const handleShareWhatsAppFromModal = (test: TestItem, score?: number) => {
    const msg = integrationService.formatTestResultForWhatsApp({
      studentName: 'Student Scholar',
      subjectName: test.subjectName,
      testTitle: test.title,
      score: score || test.studentScore || 28,
      maxScore: test.totalMarks || 30,
      percentage: Math.round(((score || test.studentScore || 28) / (test.totalMarks || 30)) * 100),
      grade: 'A*',
      passed: (score || test.studentScore || 28) >= (test.passingMarks || 15),
      date: test.date,
      feedback: test.myAttempt?.feedback || 'Reviewed by Ahmad (Faculty Lead).',
    });
    const url = integrationService.generateWhatsAppUrl(msg);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Top Filter Bar with Sleek Dropdowns (Clutter-Free) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight font-serif">
                Daily Test Series
              </h2>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                30 Marks Each &bull; Pass: 15 (50%)
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Official 15-week timetable (Sundays OFF). Click any card to view questions and instructions in popup.
            </p>
          </div>

          {/* Quick Visibility Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                hideCompleted
                  ? 'bg-[#142D27] text-white border-[#142D27] shadow-2xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {hideCompleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideCompleted ? 'Hiding Completed' : 'Showing All'}</span>
            </button>
          </div>
        </div>

        {/* 3 Unified Filter Dropdowns (Week, Subject, Status) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-100">
          {/* 1. Academic Week Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Academic Week
            </label>
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {ACADEMIC_WEEKS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Subject Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Subject ({SAMPLE_SUBJECTS.length})
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All {SAMPLE_SUBJECTS.length} Subjects</option>
                {SAMPLE_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Status Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Test Status
            </label>
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Statuses ({tests.length} Tests)</option>
                <option value="today">Today's Active Test</option>
                <option value="locked">Locked (Scheduled)</option>
                <option value="passed">Passed (15-30 Marks)</option>
                <option value="retest">Retest Needed (&lt;15 Marks)</option>
                <option value="pending">Submitted / Under Review</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 3-Cards Per Row Universal Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) */}
      {tests.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-dashed border-zinc-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 font-serif">Official 15-Week Test Series</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
            All 90 daily assessments are pre-configured according to BISE DG Khan board scheme.
          </p>
        </div>
      ) : displayTests.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No Tests Found in this Filter</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Switch week or subject filter dropdown above to review tests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {displayTests.map((test) => {
              const meta = getTestStatus(test);
              const { day: cardDay, cleanTitle: cardCleanTitle, isUrdu: cardIsUrdu } = extractDayAndCleanTitle(test.title, test.date);

              return (
                <div
                  key={test.id}
                  onClick={() => setActivePopupTest(test)}
                  className={`relative p-4 rounded-2xl border cursor-pointer flex flex-col justify-between select-none w-full h-[185px] shadow-xs ${
                    meta.isToday
                      ? 'bg-white border-2 border-emerald-500 ring-2 ring-emerald-500/20 text-[#142D27]'
                      : meta.isLocked
                      ? 'bg-white border-zinc-200 text-zinc-700'
                      : meta.status === 'passed'
                      ? 'bg-white border-emerald-300 text-[#142D27]'
                      : meta.status === 'failed_retest'
                      ? 'bg-white border-rose-300 text-rose-950'
                      : meta.status === 'pending'
                      ? 'bg-white border-amber-300 text-amber-950'
                      : 'bg-white border-zinc-200 text-[#142D27]'
                  }`}
                  title="Click to view details popup"
                >
                  {/* Top Badge & Day Row */}
                  <div className="flex items-center justify-between gap-1.5 shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact shrink-0">
                        {cardDay}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200 shrink-0">
                        {test.subjectCode}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border shrink-0 ${meta.badgeClass}`}
                    >
                      {meta.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                      {meta.isLocked && <Lock className="w-2.5 h-2.5 text-zinc-400" />}
                      {!meta.isLocked && meta.status === 'passed' && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      )}
                      {!meta.isLocked && meta.status === 'failed_retest' && (
                        <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
                      )}
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  {/* Subject Name & Title in Middle */}
                  <div className="my-1.5 min-w-0 flex-1 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-zinc-500 block truncate leading-tight mb-1">
                      {test.subjectName.split('(')[0]}
                    </span>
                    <h4
                      className={`line-clamp-2 leading-relaxed ${
                        cardIsUrdu
                          ? 'font-urdu text-[14px] font-bold text-zinc-900 text-right dir-rtl leading-relaxed'
                          : 'text-xs font-bold text-zinc-800'
                      }`}
                    >
                      <bdi>{cardCleanTitle}</bdi>
                    </h4>
                  </div>

                  {/* Bottom Row */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs shrink-0">
                    <span className="text-[11px] font-semibold text-zinc-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span>{test.date}</span>
                      <span className="text-zinc-300">&bull;</span>
                      <span className="font-bold text-emerald-700">30M</span>
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfViewerTest(test);
                        }}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer"
                        title="View attached chapter in PDF"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>PDF</span>
                      </button>

                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile / Tablet Summary Footer */}
          <div className="flex items-center justify-between px-1 pt-1 text-[11px] text-[#7d9990] font-medium">
            <span>{filteredTests.length} diagnostic assessments</span>
            <span className="text-emerald-700 font-semibold sm:hidden">1 Box per Row &bull; Vertical</span>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR ALL LOCKED & OPEN TESTS */}
      {activePopupTest && (() => {
        const meta = getTestStatus(activePopupTest);
        const score = activePopupTest.studentScore ?? activePopupTest.myAttempt?.totalScore;
        const { day: modalDay, cleanTitle: modalCleanTitle, isUrdu: modalIsUrdu } = extractDayAndCleanTitle(activePopupTest.title, activePopupTest.date);

        return createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto overscroll-contain"
            onClick={() => setActivePopupTest(null)}
          >
            <div
              className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col text-zinc-900 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header (Fixed, shrink-0) */}
              <div className="shrink-0 p-4 sm:p-5 border-b border-[#e1ede7] bg-[#F7F9F8] flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 font-urdu-compact">
                      {modalDay}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${meta.badgeClass}`}>
                      {meta.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{meta.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-bold border border-zinc-200">
                      {activePopupTest.subjectCode}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Total: 30 Marks &bull; Passing: 15
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold text-[#142D27] mt-1.5 ${
                      modalIsUrdu
                        ? 'font-urdu text-lg sm:text-xl font-bold leading-loose text-right dir-rtl'
                        : ''
                    }`}
                  >
                    <bdi>{modalCleanTitle}</bdi>
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {activePopupTest.subjectName} &bull; BISE DG Khan FA-IT Pattern
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePopupTest(null)}
                  className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors cursor-pointer shrink-0 ml-1"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable, flex-1) */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
                {/* Lock / Active Status Banner */}
                {meta.isLocked && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-start gap-2.5 text-zinc-700">
                    <Lock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-zinc-900 block">Test Locked</span>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        This test is scheduled for <strong>{activePopupTest.date}</strong>. It will automatically unlock at <strong>12:00 AM midnight</strong> on that date.
                      </p>
                    </div>
                  </div>
                )}

                {meta.isToday && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-2.5 text-emerald-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 animate-pulse shrink-0"></span>
                    <div>
                      <span className="font-bold text-emerald-800 block">🟢 Unlocked &amp; Ready for Today</span>
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        This test is active right now. Please attempt and submit your handwritten sheet or responses before 11:59 PM.
                      </p>
                    </div>
                  </div>
                )}

                {meta.status === 'passed' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1 text-emerald-900">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Result: Passed
                      </span>
                      <span className="text-xs font-bold text-emerald-700">
                        Score: {score}/30 Marks ({Math.round(((score || 0) / 30) * 100)}%)
                      </span>
                    </div>
                    {activePopupTest.myAttempt?.feedback && (
                      <p className="text-[11px] text-emerald-700 italic pt-1">
                        &quot;{activePopupTest.myAttempt.feedback}&quot; — Ahmad (Faculty Lead)
                      </p>
                    )}
                  </div>
                )}

                {meta.status === 'failed_retest' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1 text-rose-900">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Result: Retest Required (Below 15)
                      </span>
                      <span className="text-xs font-bold text-rose-700">
                        Score: {score}/30 Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 pt-1">
                      Passing marks are 15/30 (50%). Please revise the chapter notes and submit a retest attempt.
                    </p>
                  </div>
                )}

                {meta.status === 'pending' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5 text-amber-900">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-800 block">Pending Assessment</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        This test was scheduled on {activePopupTest.date} and has not yet been submitted. You can still complete and submit it to clear your backlog.
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Breakdown */}
                <div className="bg-[#F7F9F8] p-3.5 rounded-2xl border border-[#e1ede7] space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-[#e1ede7]">
                    <span className="text-[#557067] font-medium">Scheduled Date:</span>
                    <span className="font-bold text-[#142D27]">{activePopupTest.date} &bull; {activePopupTest.time}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e1ede7]">
                    <span className="text-[#557067] font-medium">Duration:</span>
                    <span className="font-bold text-[#142D27]">{activePopupTest.durationMinutes || 60} Minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#e1ede7]">
                    <span className="text-[#557067] font-medium">Passing Benchmark:</span>
                    <span className="font-bold text-emerald-700">15 / 30 Marks (50%)</span>
                  </div>
                  <div className="py-1">
                    <span className="text-[#557067] font-medium block mb-1">Syllabus &amp; Topics:</span>
                    <p className={`p-2.5 rounded-xl bg-white border border-[#e1ede7] shadow-2xs ${
                      activePopupTest.syllabusCoverage?.match(/[\u0600-\u06FF]/)
                        ? 'font-urdu text-[13px] text-right dir-rtl leading-loose text-[#142D27]'
                        : 'text-xs text-[#2e473f] leading-relaxed'
                    }`}>
                      {activePopupTest.syllabusCoverage}
                    </p>
                  </div>
                  {activePopupTest.instructions && (
                    <div className="py-1">
                      <span className="text-[#557067] font-medium block mb-1">Ahmad&apos;s Instructions:</span>
                      <p className={`p-2.5 rounded-xl bg-white border border-[#e1ede7] shadow-2xs ${
                        activePopupTest.instructions?.match(/[\u0600-\u06FF]/)
                          ? 'font-urdu text-[13px] text-right dir-rtl leading-loose text-[#142D27]'
                          : 'text-xs text-[#2e473f] leading-relaxed'
                      }`}>
                        {activePopupTest.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer (Fixed at bottom) */}
              <div className="shrink-0 p-3 sm:p-4 border-t border-[#e1ede7] bg-[#F7F9F8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePopupTest(null)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsAppFromModal(activePopupTest, score)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#e8f8f0] hover:bg-[#d4f2e3] text-emerald-800 border border-emerald-300 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfViewerTest(activePopupTest)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#142D27] border border-[#e1ede7] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    <span>View Test in PDF</span>
                  </button>
                </div>

                {!meta.isLocked && (
                  meta.status === 'submitted' ? (
                    role === 'teacher' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setActivePopupTest(null);
                          if (onGradeTest) onGradeTest(activePopupTest);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-98"
                      >
                        <FileCheck2 className="w-3.5 h-3.5" />
                        <span>Check & Grade Submission</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold text-center">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>Awaiting Teacher Evaluation by Ahmad</span>
                      </span>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAttemptFromModal(activePopupTest)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer active:scale-98"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>{meta.status === 'failed_retest' ? 'Retake Test' : meta.status === 'passed' ? 'Review Submission' : 'Attempt Test'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Textbook PDF Viewer Modal */}
      {pdfViewerTest && (
        <PDFViewerModal
          isOpen={!!pdfViewerTest}
          onClose={() => setPdfViewerTest(null)}
          testId={pdfViewerTest.id}
          testTitle={pdfViewerTest.title}
          subjectCode={pdfViewerTest.subjectCode}
          subjectName={pdfViewerTest.subjectName}
          syllabusCoverage={pdfViewerTest.syllabusCoverage}
        />
      )}
    </div>
  );
};
