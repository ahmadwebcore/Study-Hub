import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  Calendar,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
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
    setSuccessToast(`Work submitted for "${submittingTask.title}"! Awaiting faculty review.`);
    setTimeout(() => setSuccessToast(null), 4000);
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
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 text-base">
            &times;
          </button>
        </div>
      )}

      {/* Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <h1 className="text-2xl font-bold text-[#142D27] tracking-tight">
            Welcome back, {studentName}
          </h1>
          <p className="text-xs text-[#557067] mt-0.5">
            Faculty Instructor: <strong className="text-[#142D27]">Prof. Clara Evans</strong> ({configuredTeacherEmail})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/test-submit">
            <Button
              variant="primary"
              size="sm"
              icon={<FileCheck2 className="w-3.5 h-3.5 text-white" />}
            >
              Exam Desk
            </Button>
          </Link>
          <Link to="/weekly-tasks">
            <Button
              variant="outline"
              size="sm"
              icon={<CalendarDays className="w-3.5 h-3.5 text-[#557067]" />}
            >
              Weekly Schedule
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Today's Tasks</span>
          <span className="text-2xl font-bold text-[#142D27] mt-1 block">{todayTasks.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Weekly Total</span>
          <span className="text-2xl font-bold text-[#142D27] mt-1 block">{tasks.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Awaiting Review</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{awaitingTasks.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Verified Complete</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{verifiedTasks.length}</span>
        </div>
      </div>

      {/* Student Tasks List */}
      <div className="bg-white rounded-2xl border border-[#e1ede7] p-5 space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 pb-3 border-b border-[#e1ede7] overflow-x-auto">
          {[
            { id: 'today', label: "Today's Target", count: todayTasks.length },
            { id: 'week', label: 'All Tasks', count: tasks.length },
            { id: 'awaiting', label: 'Awaiting Gate', count: awaitingTasks.length },
            { id: 'verified', label: 'Verified', count: verifiedTasks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#142D27] text-white'
                  : 'text-[#557067] hover:bg-[#F7F9F8]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-[#14B866] text-white' : 'bg-[#E7EFEA] text-[#142D27]'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Task Rows */}
        <div className="space-y-2">
          {currentDisplayTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7d9990]">
              No tasks found in this view.
            </div>
          ) : (
            currentDisplayTasks.map((task) => (
              <div
                key={task.id}
                className="p-3.5 rounded-xl border border-[#e1ede7] hover:border-[#14B866]/40 transition-colors bg-[#F7F9F8]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#142D27] truncate">
                      {task.title}
                    </span>
                    <span className="text-[10px] text-[#557067] px-2 py-0.5 rounded bg-white border border-[#e1ede7]">
                      {task.subjectName}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#557067] line-clamp-1">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#7d9990] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </span>

                  {task.status === 'pending' && !task.isSundayOff && !task.isPakistanHoliday && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => setSubmittingTask(task)}
                    >
                      Submit for Review
                    </Button>
                  )}

                  {task.status === 'submitted_for_approval' && (
                    <Badge variant="warning" size="sm">
                      Awaiting Gate
                    </Badge>
                  )}

                  {task.status === 'approved' && (
                    <Badge variant="primary" size="sm">
                      Verified
                    </Badge>
                  )}

                  {(task.isSundayOff || task.isPakistanHoliday) && (
                    <Badge variant="info" size="sm">
                      🇵🇰 Off Day
                    </Badge>
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
        title="Submit Daily Task for Faculty Review"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Submit work for: <strong className="text-[#142D27]">{submittingTask?.title}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Work Notes / Comments (Optional)
            </label>
            <textarea
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="e.g. Completed Chapter 4 exercises 1 through 15."
              rows={3}
              className="w-full p-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSubmittingTask(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmSubmitWork}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
