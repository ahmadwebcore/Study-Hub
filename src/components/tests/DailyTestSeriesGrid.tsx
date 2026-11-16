import { useRole } from '../../hooks/useRole';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  MessageCircle,
  FileCheck2,
  X,
  Plus,
  Upload,
} from 'lucide-react';
import { TestItem } from '../../types';
import { SAMPLE_SUBJECTS } from '../../data/sampleData';
import { testService, extractDayAndCleanTitle } from '../../services/testService';
import { integrationService } from '../../services/integrationService';
import { PDFViewerModal } from '../books/PDFViewerModal';

interface DailyTestSeriesGridProps {
  tests: TestItem[];
  onTakeTest?: (test: TestItem) => void;
  onGradeTest?: (test: TestItem) => void;
  onRefreshTests?: () => void;
}

export type TestDisplayStatus = 'locked' | 'today' | 'passed' | 'failed_retest' | 'submitted' | 'pending';

export const DailyTestSeriesGrid: React.FC<DailyTestSeriesGridProps> = ({
  tests,
  onTakeTest,
  onGradeTest,
  onRefreshTests,
}) => {
  const { role } = useRole();
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatusFilter] = useState<string>('all');
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

  // Month filtering (zero deletion - archive browsing)
  const filteredTests = tests.filter((t) => {
    // Subject filter
    if (selectedSubjectId !== 'all' && t.subjectId !== selectedSubjectId) return false;

    // Month filter
    if (selectedMonth === 'current') {
      if (!t.date.toLowerCase().includes('nov')) return false;
    } else if (selectedMonth === 'previous') {
      if (!t.date.toLowerCase().includes('oct')) return false;
    } else if (selectedMonth === 'older') {
      if (t.date.toLowerCase().includes('nov') || t.date.toLowerCase().includes('oct')) return false;
    }

    // Status filter
    const statusMeta = getTestStatus(t);
    if (selectedStatusFilter !== 'all') {
      if (selectedStatusFilter === 'today' && !statusMeta.isToday) return false;
      if (selectedStatusFilter === 'locked' && !statusMeta.isLocked) return false;
      if (selectedStatusFilter === 'passed' && statusMeta.status !== 'passed') return false;
      if (selectedStatusFilter === 'pending' && statusMeta.status !== 'pending') return false;
      if (selectedStatusFilter === 'retest' && statusMeta.status !== 'failed_retest') return false;
    }

    // Hide completed toggle
    if (hideCompleted && (statusMeta.status === 'passed' || statusMeta.status === 'submitted')) {
      return false;
    }

    return true;
  });

  const handleGenerateEntireBook = (subjectId: string) => {
    const subj = SAMPLE_SUBJECTS.find((s) => s.id === subjectId) || SAMPLE_SUBJECTS[0];
    testService.scheduleDailyTestsForBook({
      subjectId: subj.id,
      subjectName: subj.name,
      subjectCode: subj.code,
      bookTitle: subj.name,
      totalWeeks: 12,
    });
    if (onRefreshTests) onRefreshTests();
  };

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
      {/* Top Filter and Controls Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight font-serif">
                Daily Test Series (5 Daily Tests Row)
              </h2>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                30 Marks Each &bull; Pass: 15 (50%)
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Scheduled daily tests unlock at 12:00 AM midnight. Click any box (locked or open) to view details in popup.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerateEntireBook(selectedSubjectId === 'all' ? 'sub_04' : selectedSubjectId)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] text-white ring-1 ring-white/15 shadow-sm hover:shadow-md hover:from-[#193e33] hover:via-[#133027] hover:to-[#0c201a] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200"
              title="Schedule all book chapters through Feb 28"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule 12-Week Book Tests</span>
            </button>

            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                hideCompleted
                  ? 'bg-[#142D27] text-white border-[#142D27] shadow-2xs'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              {hideCompleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideCompleted ? 'Hiding Completed' : 'Showing All'}</span>
            </button>
          </div>
        </div>

        {/* Month Archive Selector (Zero Deletion Guarantee) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 text-xs">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
            Month Archive:
          </span>
          {[
            { id: 'all', label: `All History (${tests.length})` },
            { id: 'current', label: 'November 2026 (Current)' },
            { id: 'previous', label: 'October 2026 (1 Month Back)' },
            { id: 'older', label: 'Earlier Sessions' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonth(m.id)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                selectedMonth === m.id
                  ? 'bg-[#142D27] text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedSubjectId === 'all'
                ? 'bg-[#142D27] text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            All 6 Subjects
          </button>
          {SAMPLE_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedSubjectId === s.id
                  ? 'bg-[#142D27] text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Row of 5 Small Boxes (grid-cols-2 sm:grid-cols-3 lg:grid-cols-5) */}
      {tests.length === 0 ? (
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-dashed border-zinc-300 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 font-serif">No 30-Mark Tests Scheduled Yet</h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
            Your 30-mark diagnostic test series will appear here once you upload your textbook PDF. StudyHub will break your book into weekly chapter assessments (Sundays OFF).
          </p>
          <div className="pt-2">
            <Link
              to="/library"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>⚡ Upload Book PDF &amp; Generate Series</span>
            </Link>
          </div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No Tests Found in this Filter</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            All tests are safely archived. Switch to &quot;All History&quot; or toggle showing completed tests to review past scores.
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-5 gap-3 pb-3 pt-1 no-scrollbar snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
            {filteredTests.map((test) => {
              const meta = getTestStatus(test);
              const { day: cardDay, cleanTitle: cardCleanTitle, isUrdu: cardIsUrdu } = extractDayAndCleanTitle(test.title, test.date);

              return (
                <div
                  key={test.id}
                  onClick={() => setActivePopupTest(test)}
                  className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none w-[220px] sm:w-[240px] lg:w-auto shrink-0 snap-start shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                    meta.isToday
                      ? 'bg-white border-2 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 text-[#142D27]'
                      : meta.isLocked
                      ? 'bg-[#fafcfb] border-[#e1ede7] text-zinc-600 hover:border-zinc-300'
                      : meta.status === 'passed'
                      ? 'bg-[#f0fbf5] border border-emerald-300 text-[#142D27]'
                      : meta.status === 'failed_retest'
                      ? 'bg-[#fff5f5] border border-rose-200 text-rose-950'
                      : meta.status === 'pending'
                      ? 'bg-[#fffdf5] border border-amber-200 text-amber-950'
                      : 'bg-white border border-[#e1ede7] hover:border-emerald-300 text-[#142D27]'
                  }`}
                  title="Click to view details popup"
                >
                  {/* Top Badge & Day Row */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      {/* Day Pill */}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact truncate">
                        {cardDay}
                      </span>

                      {/* Status Pill */}
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

                    {/* Subject Name & 30M Badge */}
                    <div className="flex items-center justify-between gap-1 text-[10px] text-[#557067] font-semibold pb-1.5 border-b border-[#e1ede7]">
                      <div className="flex items-center gap-1 truncate">
                        <BookOpen className="w-3 h-3 text-zinc-500 shrink-0" />
                        <span className="truncate">{test.subjectName.split('(')[0]}</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500 shrink-0">
                        30M
                      </span>
                    </div>

                    {/* Test Title (In Urdu for Urdu book / subjects, no 'Series' text, no BiDi flip) */}
                    <h4 className={`mt-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors ${
                      cardIsUrdu ? 'font-urdu text-[13px] font-bold text-[#142D27] text-right dir-rtl leading-loose' : 'text-xs font-bold text-[#142D27]'
                    }`}>
                      <bdi>{cardCleanTitle}</bdi>
                    </h4>
                  </div>

                  {/* Bottom Timing / Unlocks Indicator & Quick PDF Viewer */}
                  <div className="mt-3 pt-2 border-t border-[#e1ede7] flex items-center justify-between text-[10px] gap-1">
                    <span className="text-zinc-400 font-medium truncate flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span>{test.date}</span>
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPdfViewerTest(test);
                        }}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[9px] transition-colors flex items-center gap-0.5 cursor-pointer shadow-2xs"
                        title="View attached chapter and pages in textbook PDF"
                      >
                        <BookOpen className="w-2.5 h-2.5" />
                        <span>PDF</span>
                      </button>

                      <span className="text-[10px] font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Swipe Hint Bar */}
          <div className="lg:hidden flex items-center justify-between px-1 pt-0.5 text-[11px] text-zinc-400 font-medium">
            <span>&larr; Swipe to view all 5 daily tests &rarr;</span>
            <span className="text-emerald-700 font-semibold">{filteredTests.length} tests active</span>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR ALL LOCKED & OPEN TESTS */}
      {activePopupTest && (() => {
        const meta = getTestStatus(activePopupTest);
        const score = activePopupTest.studentScore ?? activePopupTest.myAttempt?.totalScore;
        const { day: modalDay, cleanTitle: modalCleanTitle, isUrdu: modalIsUrdu } = extractDayAndCleanTitle(activePopupTest.title, activePopupTest.date);

        return createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col text-zinc-900">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[#e1ede7] bg-[#F7F9F8] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                        ? 'font-urdu text-xl font-bold leading-loose text-right dir-rtl'
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
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
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

              {/* Modal Actions Footer */}
              <div className="p-3.5 border-t border-[#e1ede7] bg-[#F7F9F8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
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
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPdfViewerTest(activePopupTest)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-zinc-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
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
                      <span className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/40 border border-blue-800/80 text-blue-300 text-xs font-semibold text-center">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
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
