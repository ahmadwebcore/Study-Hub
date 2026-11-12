import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { useRole } from '../../hooks/useRole';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { userProfile, user } = useRole();
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Bilal Ahmad';

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'awaiting' | 'verified'>('today');
  const [submittingTask, setSubmittingTask] = useState<DailyTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const configuredTeacherEmail = emailService.getTeacherConfiguredEmail();

  const loadData = () => {
    setTasks(taskService.getTasks());
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
            Instructor: <strong className="text-zinc-800">Prof. Clara Evans</strong> &bull; {configuredTeacherEmail}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Plain Metrics Row (Linear / Stripe Minimal Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Today's Tasks
          </span>
          <span className="text-2xl font-semibold text-zinc-900 mt-1 block tracking-tight">
            {todayTasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Weekly Total
          </span>
          <span className="text-2xl font-semibold text-zinc-900 mt-1 block tracking-tight">
            {tasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Awaiting Review
          </span>
          <span className="text-2xl font-semibold text-zinc-900 mt-1 block tracking-tight">
            {awaitingTasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider block">
            Verified Complete
          </span>
          <span className="text-2xl font-semibold text-zinc-900 mt-1 block tracking-tight">
            {verifiedTasks.length}
          </span>
        </div>
      </div>

      {/* Plain Tasks Table / Desk */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-3 border-b border-zinc-200 flex items-center gap-1 bg-zinc-50/50 overflow-x-auto">
          {[
            { id: 'today', label: "Today's Target", count: todayTasks.length },
            { id: 'week', label: 'All Tasks', count: tasks.length },
            { id: 'awaiting', label: 'Awaiting Gate', count: awaitingTasks.length },
            { id: 'verified', label: 'Verified', count: verifiedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {tab.label} <span className="opacity-70 text-[10px]">({tab.count})</span>
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
                    <span className="px-2 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 rounded border border-amber-200/80">
                      Awaiting Gate
                    </span>
                  )}

                  {task.status === 'approved' && (
                    <span className="px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 rounded border border-emerald-200/80">
                      Verified
                    </span>
                  )}

                  {(task.isSundayOff || task.isPakistanHoliday) && (
                    <span className="px-2 py-0.5 text-[10px] font-medium text-zinc-600 bg-zinc-100 rounded border border-zinc-200">
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
    </div>
  );
};
