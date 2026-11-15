import React, { useState, useEffect } from 'react';
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
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Student Scholar';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  const loadData = () => {
    setTasks(taskService.getTasks());
    testService.fetchTests(user?.id).then((t) => {
      if (t && t.length > 0) setTests(t);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
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
            <span>1st Year FA-IT &bull; BISE D.G. Khan Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-serif">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Faculty Director: <strong className="text-zinc-900">Ahmad</strong> &bull; Complete today's reading and daily 30-mark test.
          </p>
        </div>

        {/* Quick Teacher Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Message Ahmad</span>
          </Link>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all shadow-2xs"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* 2. Today's Core Work (Simple 2-Card Focus) */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-serif">Today's Focus</h2>
            <p className="text-xs text-zinc-500">Your two main academic goals for today.</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Target: May 2027 Board Exams
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Daily Reading Quota */}
          <div className="p-5 rounded-3xl bg-white border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 1 &bull; Daily Quota
                </span>
                <span className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~45 Mins
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

          {/* Card 2: Today's 30-Mark Test */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/50 via-white to-white border border-emerald-200/90 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Step 2 &bull; 30-Mark Test
                </span>
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Pass: 15/30
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 font-serif">
                Chapter 2 Network Topologies Assessment
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Official 30-mark diagnostic test with 10 MCQs and 4 short-response questions mapped to BISE DG Khan board scheme.
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-100/60 flex items-center gap-2">
              <Link
                to="/test-submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] ring-1 ring-white/15 hover:from-[#193e33] hover:to-[#0c201a] rounded-xl transition-all shadow-sm active:scale-95"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
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
              AI Academic Assistant (24/7 Copilot)
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
              BISE DG Khan Board Updates & Pairing
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Review question distributions for 1st Year FA-IT: MCQs, Short Questions, Long Questions, and 2026–2027 annual timetable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(true)}
            className="inline-flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-semibold text-zinc-800 transition-colors"
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
              Recent Certified Marks & Records
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
              <span className="font-bold text-zinc-900 block">Chapter 1: Basics of IT & Hardware</span>
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
              <span className="text-[11px] text-zinc-500">Urdu & Grammar &bull; Evaluated by Ahmad</span>
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

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => {
          setSuccessToast('Account password updated successfully.');
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
