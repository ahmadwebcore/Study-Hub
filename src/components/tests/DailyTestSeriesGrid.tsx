import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { TestItem } from '../../types';
import { SAMPLE_SUBJECTS } from '../../data/sampleData';
import { testService } from '../../services/testService';
import { integrationService } from '../../services/integrationService';

interface DailyTestSeriesGridProps {
  tests: TestItem[];
  onTakeTest?: (test: TestItem) => void;
  onRefreshTests?: () => void;
}

export type TestDisplayStatus = 'locked' | 'today' | 'passed' | 'failed_retest' | 'submitted' | 'pending';

export const DailyTestSeriesGrid: React.FC<DailyTestSeriesGridProps> = ({
  tests,
  onTakeTest,
  onRefreshTests,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedStatusFilter] = useState<string>('all');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [activePopupTest, setActivePopupTest] = useState<TestItem | null>(null);

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
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
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
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-colors ${
              selectedSubjectId === 'all'
                ? 'bg-zinc-900 text-white'
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
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {s.name.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Row of 5 Small Boxes (grid-cols-2 sm:grid-cols-3 lg:grid-cols-5) */}
      {filteredTests.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900">No Tests Found in this Filter</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            All tests are safely archived. Switch to &quot;All History&quot; or toggle showing completed tests to review past scores.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {filteredTests.map((test) => {
            const meta = getTestStatus(test);

            return (
              <div
                key={test.id}
                onClick={() => setActivePopupTest(test)}
                className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
                  meta.isToday
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 hover:border-emerald-600'
                    : meta.isLocked
                    ? 'bg-zinc-50/80 border-zinc-200/90 hover:bg-zinc-100/90 text-zinc-600'
                    : meta.status === 'passed'
                    ? 'bg-emerald-50/30 border-emerald-200 hover:bg-emerald-50/60'
                    : meta.status === 'failed_retest'
                    ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50/70'
                    : meta.status === 'pending'
                    ? 'bg-amber-50/30 border-amber-200 hover:bg-amber-50/60'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 shadow-2xs'
                }`}
                title="Click to view details popup"
              >
                {/* Top Badge & Lock Status */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                    >
                      {meta.isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      )}
                      {meta.isLocked && <Lock className="w-2.5 h-2.5" />}
                      {!meta.isLocked && meta.status === 'passed' && (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      )}
                      {!meta.isLocked && meta.status === 'failed_retest' && (
                        <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                      )}
                      <span>{meta.label}</span>
                    </span>

                    <span className="text-[9px] font-bold text-zinc-400">
                      30M
                    </span>
                  </div>

                  {/* Subject Name */}
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold truncate">
                    <BookOpen className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{test.subjectName.split('(')[0]}</span>
                  </div>

                  {/* Test Title */}
                  <h4 className="text-xs font-bold text-zinc-900 mt-1 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                    {test.title}
                  </h4>
                </div>

                {/* Bottom Timing / Unlocks Indicator */}
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                  <span className="text-zinc-500 font-medium truncate flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>{test.date}</span>
                  </span>

                  <span className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors shrink-0">
                    View &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL FOR ALL LOCKED & OPEN TESTS */}
      {activePopupTest && (() => {
        const meta = getTestStatus(activePopupTest);
        const score = activePopupTest.studentScore ?? activePopupTest.myAttempt?.totalScore;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="relative w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${meta.badgeClass}`}>
                      {meta.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{meta.label}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 text-zinc-700 text-[10px] font-bold">
                      {activePopupTest.subjectCode}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Total: 30 Marks &bull; Passing: 15
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-zinc-900 mt-1">
                    {activePopupTest.title}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {activePopupTest.subjectName} &bull; BISE DG Khan FA-IT Pattern
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePopupTest(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Lock / Active Status Banner */}
                {meta.isLocked && (
                  <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 text-xs flex items-start gap-2.5 text-zinc-700">
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
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-start gap-2.5 text-emerald-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 animate-pulse shrink-0"></span>
                    <div>
                      <span className="font-bold text-emerald-900 block">🟢 Unlocked & Ready for Today</span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        This test is active right now. Please attempt and submit your handwritten sheet or responses before 11:59 PM.
                      </p>
                    </div>
                  </div>
                )}

                {meta.status === 'passed' && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Result: Passed
                      </span>
                      <span className="text-xs font-bold text-emerald-800">
                        Score: {score}/30 Marks ({Math.round(((score || 0) / 30) * 100)}%)
                      </span>
                    </div>
                    {activePopupTest.myAttempt?.feedback && (
                      <p className="text-[11px] text-emerald-900 italic pt-1">
                        &quot;{activePopupTest.myAttempt.feedback}&quot; — Ahmad (Faculty Lead)
                      </p>
                    )}
                  </div>
                )}

                {meta.status === 'failed_retest' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-950 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        Result: Retest Required (Below 15)
                      </span>
                      <span className="text-xs font-bold text-rose-800">
                        Score: {score}/30 Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-900 pt-1">
                      Passing marks are 15/30 (50%). Please revise the chapter notes and submit a retest attempt.
                    </p>
                  </div>
                )}

                {meta.status === 'pending' && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs flex items-start gap-2.5 text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 block">Pending Assessment</span>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        This test was scheduled on {activePopupTest.date} and has not yet been submitted. You can still complete and submit it to clear your backlog.
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Breakdown */}
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500 font-medium">Scheduled Date:</span>
                    <span className="font-bold text-zinc-900">{activePopupTest.date} &bull; {activePopupTest.time}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500 font-medium">Duration:</span>
                    <span className="font-bold text-zinc-900">{activePopupTest.durationMinutes || 60} Minutes</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-zinc-200">
                    <span className="text-zinc-500 font-medium">Passing Benchmark:</span>
                    <span className="font-bold text-emerald-700">15 / 30 Marks (50%)</span>
                  </div>
                  <div className="py-1">
                    <span className="text-zinc-500 font-medium block mb-1">Syllabus & Topics:</span>
                    <p className="text-[11px] text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200 leading-relaxed">
                      {activePopupTest.syllabusCoverage}
                    </p>
                  </div>
                  {activePopupTest.instructions && (
                    <div className="py-1">
                      <span className="text-zinc-500 font-medium block mb-1">Ahmad's Instructions:</span>
                      <p className="text-[11px] text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200 leading-relaxed">
                        {activePopupTest.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="p-3.5 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePopupTest(null)}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-700"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWhatsAppFromModal(activePopupTest, score)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {!meta.isLocked && (
                  <button
                    type="button"
                    onClick={() => handleAttemptFromModal(activePopupTest)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors shadow-2xs"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>{meta.status === 'failed_retest' ? 'Retake Test' : meta.status === 'passed' ? 'Review Submission' : 'Attempt Test'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
