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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { taskService, DailyTask } from '../../services/taskService';
import { testService } from '../../services/testService';
import { TestItem } from '../../types';
import { SAMPLE_TESTS } from '../../data/sampleData';
import { DailyTestSeriesGrid } from '../../components/tests/DailyTestSeriesGrid';
import { BISEDGKhanModal } from '../../components/board/BISEDGKhanModal';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';

export const StudentDashboard: React.FC = () => {
  const { userProfile, user } = useRole();
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Henza Noor';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isDailyWelcomeOpen, setIsDailyWelcomeOpen] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  const loadData = () => {
    setTasks(taskService.getTasks());
    testService.fetchTests(user?.id).then((t) => {
      if (t && t.length > 0) setTests(t);
    });
  };

  useEffect(() => {
    loadData();

    // Check if daily welcome modal has already been shown today
    const welcomeKey = `gsa_daily_welcome_${todayStr}`;
    const alreadyShown = localStorage.getItem(welcomeKey);
    if (!alreadyShown) {
      setIsDailyWelcomeOpen(true);
    }
  }, [todayStr]);

  const handleDismissDailyWelcome = () => {
    localStorage.setItem(`gsa_daily_welcome_${todayStr}`, 'true');
    setIsDailyWelcomeOpen(false);
  };

  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || (!t.isSundayOff && !t.isPakistanHoliday && t.status === 'pending')
  );

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

  const formattedToday = new Intl.DateTimeFormat('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-7 font-sans max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-zinc-900 text-white flex items-center justify-between text-xs font-semibold shadow-lg animate-in fade-in duration-150">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-400 hover:text-white text-sm">
            &times;
          </button>
        </div>
      )}

      {/* 1. Header Greeting & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Global Science Academy &bull; Fatehpur &bull; 1st Year FA-IT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-serif">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Faculty Director: <strong className="text-zinc-900">Ahmad</strong> &bull; BISE DG Khan Board &bull; Daily quota &amp; 30-mark diagnostic test.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Daily Welcome Briefing Trigger */}
          <button
            type="button"
            onClick={() => setIsDailyWelcomeOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all shadow-2xs cursor-pointer"
            title="Open Today's Academic Briefing"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Daily Briefing</span>
          </button>

          {/* Student 2FA & Password Settings */}
          <button
            type="button"
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs cursor-pointer"
            title="Set Password and Google Authenticator 2FA"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security &amp; 2FA</span>
          </button>

          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Message Ahmad</span>
          </Link>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-all shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* 2. Today's Core Work (Harmonious Contrast: 1 Crisp White Card + 1 Rich Dark Prestige Card) */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-serif">Today's Focus</h2>
            <p className="text-xs text-zinc-500">Your two core academic priorities for {formattedToday}.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Target: May 2027 Board Exams
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Daily Reading Quota (Crisp White Card) */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 1 &bull; Daily Quota
                </span>
                <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~45 Mins (2.5 Pgs)
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 font-serif">
                Computer Science: Read Pages 96–98
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Chapter 2: Information Networks &bull; Carefully study Network Topologies (Bus, Star, Ring, Mesh) and review diagram annotations.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
              <Link
                to="/syllabus"
                className="flex-1 py-2 px-3 text-center text-xs font-semibold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl transition-colors"
              >
                View Syllabus Notes
              </Link>
              <button
                type="button"
                onClick={() => handleQuickCompleteQuota()}
                className="py-2 px-3.5 inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors shadow-2xs active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
            </div>
          </div>

          {/* Card 2: Today's 30-Mark Test (Rich Dark Prestige Card) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-[#142D27] to-[#0A1A16] text-white border border-emerald-500/20 shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  Step 2 &bull; 30-Mark Test
                </span>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Pass: 15/30 Marks
                </span>
              </div>
              <h3 className="text-base font-bold text-white font-serif">
                Chapter 2 Network Topologies Assessment
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Official 30-mark diagnostic test with 10 MCQs and 4 short-response questions mapped to BISE DG Khan board scheme.
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <Link
                to="/test-submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-100 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Start Today's 30-Mark Test</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. This Week's 5-Box Scheduled Tests Grid */}
      <div className="space-y-2">
        <DailyTestSeriesGrid tests={tests} />
      </div>

      {/* 4. Support & Board Hub (2 Equal Matched Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Tutor Card */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 font-serif">
              Academic Tutor (Global Science Academy)
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Have doubts on Bus Topology, CPU registers, or Urdu grammar? Ask in English, Urdu, or Roman Urdu for clear analogies.
            </p>
          </div>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors"
          >
            <span>Ask: "Explain Bus Topology with real analogy"</span>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </Link>
        </div>

        {/* BISE DG Khan Pairing Scheme Card */}
        <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              🇵🇰
            </div>
            <h3 className="text-sm font-bold text-zinc-900 font-serif">
              BISE DG Khan Board Updates &amp; Pairing
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Review question distributions for 1st Year FA-IT: MCQs, Short Questions, Long Questions, and 2026–2027 annual timetable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(true)}
            className="inline-flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors cursor-pointer"
          >
            <span>View 1st Year FA-IT Pairing Scheme</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* 5. Recent Verified Marks & Certified History */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 font-serif">
              Recent Certified Marks &amp; Records
            </h3>
            <p className="text-[11px] text-zinc-500">
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

        <div className="divide-y divide-zinc-100 text-xs">
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-zinc-900 block">Chapter 1: Basics of IT &amp; Hardware</span>
              <span className="text-[11px] text-zinc-500">Computer Science &bull; Evaluated by Ahmad</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                27 / 30 (Grade A)
              </span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">Certified Passed</span>
            </div>
          </div>

          <div className="py-2.5 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-zinc-900 block">Urdu Prose: Uswa-e-Hasna Short Questions</span>
              <span className="text-[11px] text-zinc-500">Urdu &amp; Grammar &bull; Evaluated by Ahmad</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                28 / 30 (Grade A*)
              </span>
              <span className="block text-[10px] text-zinc-400 mt-0.5">Certified Passed</span>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC DAILY WELCOME POPUP MODAL (Portaled to body) */}
      {isDailyWelcomeOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-zinc-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative text-zinc-900">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismissDailyWelcome}
                className="absolute top-5 right-5 p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                aria-label="Dismiss Briefing"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Institution Header Badge */}
              <div className="space-y-1.5">
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

              {/* Daily Checklist Cards */}
              <div className="space-y-3 pt-1">
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

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#142D27] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
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

              {/* Primary Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDismissDailyWelcome}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] ring-1 ring-white/15 hover:from-[#193e33] hover:to-[#0c201a] transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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
    </div>
  );
};
