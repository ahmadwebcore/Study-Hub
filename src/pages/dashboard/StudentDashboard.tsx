import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  Check,
  KeyRound,
  BookOpen,
  MessageSquare,
  Layers,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { taskService, DailyTask } from '../../services/taskService';
import { useRole } from '../../hooks/useRole';
import { Link } from 'react-router-dom';
import { FebruarySprintTracker } from '../../components/planner/FebruarySprintTracker';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { BISEDGKhanBoardWidget } from '../../components/board/BISEDGKhanBoardWidget';
import { BISEDGKhanModal } from '../../components/board/BISEDGKhanModal';
import { DailyTestSeriesGrid } from '../../components/tests/DailyTestSeriesGrid';
import { SAMPLE_TESTS } from '../../data/sampleData';
import { testService } from '../../services/testService';
import { TestItem } from '../../types';

export const StudentDashboard: React.FC = () => {
  const { userProfile, user } = useRole();
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Student Scholar';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'awaiting' | 'verified'>('today');
  const [submittingTask, setSubmittingTask] = useState<DailyTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleConfirmSubmitWork = async () => {
    if (!submittingTask) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    taskService.submitTaskForApproval(
      submittingTask.id,
      submissionNotes,
      'daily_work_notes.pdf'
    );
    setIsSubmitting(false);
    setSubmittingTask(null);
    setSubmissionNotes('');
    loadData();
    setSuccessToast(`Work submitted for "${submittingTask.title}".`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || (!t.isSundayOff && !t.isPakistanHoliday && t.status === 'pending'));
  const awaitingTasks = tasks.filter((t) => t.status === 'submitted_for_approval');
  const verifiedTasks = tasks.filter((t) => t.status === 'approved');

  const currentDisplayTasks =
    activeTab === 'today'
      ? todayTasks
      : activeTab === 'week'
      ? tasks
      : activeTab === 'awaiting'
      ? awaitingTasks
      : verifiedTasks;

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 rounded-lg bg-zinc-900 text-white flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-400 hover:text-white text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Top Level Plain Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Faculty Lead: <strong className="text-zinc-800">Ahmad</strong> (Academic Director)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBoardModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <span className="text-xs">🇵🇰</span>
            BISE DG Khan
          </button>
          <Link
            to="/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            Chat with Ahmad
          </Link>
          <Link
            to="/ai-teacher"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <span className="font-urdu">استاد AI</span> Explainer
          </Link>
          <Link
            to="/grammar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
          >
            Grammar Hub
          </Link>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
            Change Password
          </button>
          <Link
            to="/test-submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Exam Desk
          </Link>
          <Link
            to="/weekly-tasks"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-zinc-500" />
            Schedule
          </Link>
        </div>
      </div>

      {/* 4-Step Daily Routine Banner (Human-made, 15-year old friendly) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-zinc-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Simple Daily Routine
              </span>
              <span className="text-xs font-semibold text-zinc-600">1st Year FA-IT &bull; BISE DG Khan</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 mt-1">
              آج کی پڑھائی کا آسان روڈ میپ (Your 4-Step Daily Routine)
            </h2>
          </div>
          <span className="text-xs text-zinc-500">
            ہدف: ۲۸ فروری تک مکمل نصاب &bull; بورڈ امتحانات مئی ۲۰۲۷
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">1</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">~2.5 صفحات</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">کتاب کا یومیہ کوٹہ</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                آج کے مضمون کے صرف ۲ سے ۳ صفحات غور سے پڑھیں اور نوٹس دیکھیں۔
              </p>
            </div>
            <Link
              to="/weekly-tasks"
              className="mt-3 inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
              <span>کوٹہ دیکھیں</span>
            </Link>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">2</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">30 نمبرز</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">آج کا ۳۰ نمبری ٹیسٹ</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                روزانہ کا شیڈول ٹیسٹ حل کریں تاکہ بورڈ طرز کا خوف ختم ہو (اتوار چھٹی)۔
              </p>
            </div>
            <Link
              to="/test-submit"
              className="mt-3 inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white shadow-2xs transition-colors"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>ٹیسٹ شروع کریں</span>
            </Link>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">3</span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">1-on-1 چیٹ</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">احمد سر سے رہنمائی</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                مشکل سوال یا تھیوری سمجھنے کے لیے احمد سر کو میسج کریں یا استاد AI کھولیں۔
              </p>
            </div>
            <Link
              to="/chat"
              className="mt-3 inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span>احمد سر سے پوچھیں</span>
            </Link>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold flex items-center justify-center">4</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">BISE DGK</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-900">بورڈ پیرنگ سکیم</h3>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                ڈی جی خان بورڈ کے ماڈل پیپرز اور معروضی وانشائیہ نمبرات کی تقسیم دیکھیں۔
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBoardModalOpen(true)}
              className="mt-3 inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>پیرنگ سکیم کھولیں</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Box Daily Scheduled Tests Desk (1 Row of 5 Small Boxes) */}
      <DailyTestSeriesGrid tests={tests} />

      {/* BISE DG Khan Official Board Widget */}
      <BISEDGKhanBoardWidget />

      {/* 3-Month Target Sprint & Daily Book Quota Engine */}
      <FebruarySprintTracker />

      {/* Plain Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Today's Target
          </span>
          <span className="text-3xl font-bold text-zinc-900 mt-1 block tracking-tight">
            {todayTasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Weekly Total
          </span>
          <span className="text-3xl font-bold text-zinc-900 mt-1 block tracking-tight">
            {tasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Awaiting Review
          </span>
          <span className="text-3xl font-bold text-amber-600 mt-1 block tracking-tight">
            {awaitingTasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Verified Complete
          </span>
          <span className="text-3xl font-bold text-emerald-600 mt-1 block tracking-tight">
            {verifiedTasks.length}
          </span>
        </div>
      </div>

      {/* Plain Tasks Table / Desk */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
        {/* Filter Bar */}
        <div className="p-3 border-b border-zinc-200 flex items-center gap-1.5 bg-zinc-50/70 overflow-x-auto">
          {[
            { id: 'today', label: "Today's Target", count: todayTasks.length },
            { id: 'week', label: 'All Tasks', count: tasks.length },
            { id: 'awaiting', label: 'Awaiting Review', count: awaitingTasks.length },
            { id: 'verified', label: 'Verified', count: verifiedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Task Rows List */}
        <div className="divide-y divide-zinc-100">
          {currentDisplayTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No tasks found in this view.
            </div>
          ) : (
            currentDisplayTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition-colors"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-900 truncate">
                      {task.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">
                      {task.subjectName}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                    {task.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs">
                  <span className="text-zinc-500 text-[11px]">
                    {task.dueDate}
                  </span>

                  {task.status === 'pending' && !task.isSundayOff && !task.isPakistanHoliday && (
                    <button
                      onClick={() => setSubmittingTask(task)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 transition-colors shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      Submit for Review
                    </button>
                  )}

                  {task.status === 'submitted_for_approval' && (
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
                      Awaiting Review
                    </span>
                  )}

                  {task.status === 'approved' && (
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                      Verified
                    </span>
                  )}

                  {(task.isSundayOff || task.isPakistanHoliday) && (
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-zinc-600 bg-zinc-100 rounded-lg border border-zinc-200">
                      🇵🇰 Rest Day
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Submit Work */}
      <Modal
        isOpen={!!submittingTask}
        onClose={() => setSubmittingTask(null)}
        title="Submit Task for Faculty Review"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-zinc-600">
            Submit work for: <strong className="text-zinc-900">{submittingTask?.title}</strong>
          </p>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Work Notes (Optional)
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="e.g. Completed questions 1 through 10."
              rows={3}
              className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setSubmittingTask(null)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmSubmitWork}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>

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
