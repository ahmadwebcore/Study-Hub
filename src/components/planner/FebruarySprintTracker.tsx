import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  Plus,
  Compass,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import {
  targetPlannerService,
  TargetPlannerStats,
  SubjectTargetQuota,
} from '../../services/targetPlannerService';

interface FebruarySprintTrackerProps {
  compact?: boolean;
}

export const FebruarySprintTracker: React.FC<FebruarySprintTrackerProps> = ({ compact = false }) => {
  const [stats, setStats] = useState<TargetPlannerStats>(targetPlannerService.getPlannerStats());
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [quickUpdateSuccess, setQuickUpdateSuccess] = useState<string | null>(null);
  const [windowRemaining, setWindowRemaining] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setWindowRemaining(`${hours}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refresh = () => setStats(targetPlannerService.getPlannerStats());
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const handleIncrementPage = (subjectId: string, subjectName: string) => {
    const updated = targetPlannerService.recordStudySession(subjectId, 1);
    setStats(updated);
    setQuickUpdateSuccess(`+1 page recorded for ${subjectName}!`);
    setTimeout(() => setQuickUpdateSuccess(null), 2500);
  };

  const handleIncrementChapter = (subjectId: string, subjectName: string) => {
    const current = stats.subjectsQuota.find((s) => s.subjectId === subjectId);
    if (!current) return;
    const pagesToAdd = Math.max(1, Math.round(current.totalPages / current.totalChapters));
    const updated = targetPlannerService.updateSubjectProgress(subjectId, pagesToAdd);
    setStats(updated);
    setQuickUpdateSuccess(`Chapter completed in ${subjectName}!`);
    setTimeout(() => setQuickUpdateSuccess(null), 2500);
  };

  const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
      {/* Target Header Banner - Clean Test Series Mini-Card Aesthetic */}
      <div className="bg-white text-zinc-900 p-5 sm:p-6 border-b border-zinc-200 relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>3-Month Target Sprint &bull; Deadline: 28 Feb 2027</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Today's 24H Window: {windowRemaining || 'Counting...'}</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 font-serif flex items-center gap-2">
              Syllabus Completion &amp; Daily Quota Engine
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Annual Board Examinations commence in <strong className="text-zinc-900">May 2027</strong>. Complete 100% of the syllabus across all 6 subjects by <strong className="text-emerald-700 font-bold">February 28th</strong> with daily page targets.
            </p>
          </div>

          {/* Key Metric Badges (Test Series Mini Card Style) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-center min-w-[95px] shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Days to Feb 28</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
                {stats.daysToTarget}d
              </span>
              <span className="block text-[9px] text-zinc-500">({stats.activeStudyDaysToTarget} study days)</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-center min-w-[95px] shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">May Exams</span>
              <span className="text-xl sm:text-2xl font-extrabold text-amber-700 font-mono">
                {stats.daysToExams}d
              </span>
              <span className="block text-[9px] text-zinc-500">Board Exam</span>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-center min-w-[95px] shadow-2xs">
              <span className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Total Progress</span>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-mono">
                {stats.overallCompletionPercentage}%
              </span>
              <span className="block text-[9px] text-zinc-500">{stats.totalCompletedPages}/{stats.totalBookPages} pgs</span>
            </div>
          </div>
        </div>

        {/* Live Overall Progress Bar */}
        <div className="mt-5 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-zinc-700 flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              1st Year FA-IT Syllabus Completion:
            </span>
            <span className="font-mono font-bold text-emerald-800">
              {stats.overallCompletionPercentage}% Completed &bull; {stats.totalBookPages - stats.totalCompletedPages} Pages Remaining
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-100 p-0.5 border border-zinc-200 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500 shadow-2xs"
              style={{ width: `${stats.overallCompletionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick feedback banner */}
      {quickUpdateSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-4 py-2 border-b border-emerald-200 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{quickUpdateSuccess}</span>
        </div>
      )}

      {/* Weekly Schedule Strip (Mon-Sat, Sunday OFF) */}
      <div className="p-4 sm:p-5 border-b border-[#e1ede7] bg-[#F7F9F8]/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#14B866]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
              Weekly Timetable & Single Subject Focus
            </h3>
          </div>
          <span className="text-xs text-zinc-500">
            Today is <strong className="text-zinc-900">{todayName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          {[
            { day: 'Monday', subject: 'Physical Education', focus: 'Anatomy & Athletics', color: '#10B981', code: 'FAIT-PED' },
            { day: 'Tuesday', subject: 'Urdu & Grammar', focus: 'Prose & Grammar', color: '#8B5CF6', code: 'FAIT-URD' },
            { day: 'Wednesday', subject: 'English & Grammar', focus: 'Stories & Composition', color: '#3B82F6', code: 'FAIT-ENG' },
            { day: 'Thursday', subject: 'Computer Science', focus: 'Computing & Networks', color: '#0EA5E9', code: 'FAIT-CS' },
            { day: 'Friday', subject: 'Islamiyat & Tarjuma', focus: 'Quranic Translation', color: '#059669', code: 'FAIT-ISL' },
            { day: 'Saturday', subject: 'Economics', focus: 'Microeconomics & Graphs', color: '#F59E0B', code: 'FAIT-ECO' },
            { day: 'Sunday', subject: 'Rest & Revision', focus: 'Mandatory Weekly Rest', color: '#EF4444', isOff: true },
          ].map((item) => {
            const isToday = todayName.toLowerCase() === item.day.toLowerCase();
            return (
              <div
                key={item.day}
                className={`p-2.5 rounded-xl border transition-all ${
                  isToday
                    ? 'bg-emerald-50/80 border-[#14B866] shadow-sm ring-1 ring-[#14B866]/30'
                    : item.isOff
                    ? 'bg-zinc-100/70 border-zinc-200 opacity-80'
                    : 'bg-white border-[#e1ede7] hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold ${isToday ? 'text-emerald-700' : 'text-zinc-500'}`}>
                    {item.day.slice(0, 3)}
                  </span>
                  {isToday && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#14B866] text-white font-bold">
                      Today
                    </span>
                  )}
                  {item.isOff && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-zinc-200 text-zinc-600 font-semibold">
                      OFF
                    </span>
                  )}
                </div>
                <p className="font-bold text-xs text-zinc-900 mt-1 line-clamp-1">{item.subject}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{item.focus}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Book Quota Cards (All 6 Subjects) */}
      {!compact && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#14B866]" />
                Daily Book Quotas to Finish by February 28
              </h3>
              <p className="text-xs text-zinc-500">
                Calculated based on {stats.activeStudyDaysToTarget} active study days remaining until February 28, 2027.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {stats.subjectsQuota.map((quota: SubjectTargetQuota) => {
              const progressPct = Math.round((quota.completedPages / quota.totalPages) * 100);
              const remainingPages = quota.totalPages - quota.completedPages;
              const isExpanded = expandedSubject === quota.subjectId;

              return (
                <div
                  key={quota.subjectId}
                  className="rounded-xl border border-[#e1ede7] bg-white p-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: quota.accentColor }}
                          />
                          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                            {quota.assignedDay}
                          </span>
                        </div>
                        <h4 className="font-bold text-zinc-900 text-sm mt-0.5">{quota.subjectName}</h4>
                        <p className="text-xs text-zinc-500 font-mono">{quota.code} &bull; 11th Class</p>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                        {progressPct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span>{quota.completedPages} / {quota.totalPages} pgs ({remainingPages} left)</span>
                        <span>{quota.completedChapters}/{quota.totalChapters} chs</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progressPct}%`,
                            backgroundColor: quota.accentColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Daily Quota Target Pill */}
                    <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-emerald-900">
                        <span>Daily Target:</span>
                        <span className="font-mono text-emerald-700 font-bold">{quota.dailyPageTarget} Pages / Day</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        &bull; {quota.dailyTopicsTarget}
                      </p>
                    </div>

                    {/* Teacher Guidance Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedSubject(isExpanded ? null : quota.subjectId)}
                        className="w-full flex items-center justify-between text-xs text-zinc-600 hover:text-zinc-900 py-1 font-semibold"
                      >
                        <span className="flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-zinc-500" />
                          Guide as a Teacher
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-2 animate-in fade-in duration-150">
                          <p className="text-zinc-700 leading-relaxed font-medium">
                            <strong className="text-zinc-900">Teacher Note:</strong> {quota.teacherGuideNote}
                          </p>
                          <div className="space-y-1 pt-1 border-t border-zinc-200">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Board Exam Tips:</span>
                            {quota.keyExamTips.map((tip, idx) => (
                              <p key={idx} className="text-[11px] text-zinc-600 pl-2 border-l-2 border-emerald-400">
                                &bull; {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Update Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleIncrementPage(quota.subjectId, quota.subjectName)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      +1 Page
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIncrementChapter(quota.subjectId, quota.subjectName)}
                      className="py-1.5 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Mark entire chapter completed"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      +1 Ch
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
