import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  PlusCircle,
  Mail,
  Check,
  Search,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { useRole } from '../../hooks/useRole';
import { testService } from '../../services/testService';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';

const testSchema = z.object({
  title: z.string().min(3, 'Test title must be at least 3 characters'),
  subject: z.string().min(1, 'Please select a subject'),
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().min(15, 'Minimum 15 minutes').max(180, 'Maximum 180 minutes'),
});

type TestFormData = z.infer<typeof testSchema>;

export const TeacherDashboard: React.FC = () => {
  const { user } = useRole();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'awaiting' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false);
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [approvingTask, setApprovingTask] = useState<DailyTask | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('Work verified and approved.');

  const configuredStudent = emailService.getStudentConfiguredEmail();

  const loadTasks = () => {
    setTasks(taskService.getTasks());
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: 'Chapter 4 Diagnostic Assessment',
      subject: 'Advanced Mathematics',
      date: '2026-11-20',
      durationMinutes: 60,
    },
  });

  const onScheduleTest = async (data: TestFormData) => {
    await testService.scheduleTest({
      title: data.title,
      subjectId: 'sub-math-101',
      subjectName: data.subject,
      subjectCode: 'MATH-101',
      date: data.date,
      time: '09:00',
      durationMinutes: data.durationMinutes,
      totalMarks: 50,
      syllabusCoverage: 'Full Diagnostic',
    });

    setIsScheduleTestOpen(false);
    reset();
    setSuccessToast(`Test "${data.title}" scheduled and notification sent!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmApproval = () => {
    if (!approvingTask) return;

    taskService.approveTask(approvingTask.id, user.name, approvalFeedback);
    loadTasks();
    setApprovingTask(null);
    setSuccessToast(`Task "${approvingTask.title}" has been signed off and approved.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filter tasks
  const todayStr = new Date().toISOString().slice(0, 10);
  const filteredTasks = tasks.filter((t) => {
    if (searchTerm) {
      const match =
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    if (taskFilter === 'today') return t.dueDate === todayStr;
    if (taskFilter === 'awaiting') return t.status === 'submitted_for_approval';
    if (taskFilter === 'approved') return t.status === 'approved';
    return true;
  });

  const awaitingCount = tasks.filter((t) => t.status === 'submitted_for_approval').length;
  const approvedCount = tasks.filter((t) => t.status === 'approved').length;
  const todayCount = tasks.filter((t) => t.dueDate === todayStr).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
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
            Welcome, {user.name}
          </h1>
          <p className="text-xs text-[#557067] mt-0.5">
            Connected Student: <strong className="text-[#142D27]">Bilal Ahmad</strong> ({configuredStudent})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Mail className="w-3.5 h-3.5 text-[#557067]" />}
            onClick={() => setIsComposeEmailOpen(true)}
          >
            Email Student
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => setIsScheduleTestOpen(true)}
          >
            Schedule Test
          </Button>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Total Tasks</span>
          <span className="text-2xl font-bold text-[#142D27] mt-1 block">{tasks.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Due Today</span>
          <span className="text-2xl font-bold text-[#142D27] mt-1 block">{todayCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Awaiting Review</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">{awaitingCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-semibold text-[#7d9990] block">Verified Complete</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{approvedCount}</span>
        </div>
      </div>

      {/* Tasks & Approval Desk */}
      <div className="bg-white rounded-2xl border border-[#e1ede7] p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e1ede7]">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All Tasks', count: tasks.length },
              { id: 'today', label: 'Due Today', count: todayCount },
              { id: 'awaiting', label: 'Awaiting Gate', count: awaitingCount },
              { id: 'approved', label: 'Verified', count: approvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTaskFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  taskFilter === tab.id
                    ? 'bg-[#142D27] text-white'
                    : 'text-[#557067] hover:bg-[#F7F9F8]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${taskFilter === tab.id ? 'bg-[#14B866] text-white' : 'bg-[#E7EFEA] text-[#142D27]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d9990]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F9F8] border border-[#e1ede7] rounded-xl text-[#142D27] focus:outline-none focus:border-[#14B866]"
            />
          </div>
        </div>

        {/* Task Rows */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#7d9990]">
              No tasks found under this filter.
            </div>
          ) : (
            filteredTasks.map((task) => (
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

                  {task.status === 'submitted_for_approval' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check className="w-3.5 h-3.5" />}
                      onClick={() => setApprovingTask(task)}
                    >
                      Approve Work
                    </Button>
                  )}

                  {task.status === 'approved' && (
                    <Badge variant="primary" size="sm">
                      Verified
                    </Badge>
                  )}

                  {task.status === 'pending' && !task.isSundayOff && !task.isPakistanHoliday && (
                    <Badge variant="warning" size="sm">
                      In Progress
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

      {/* Modal: Schedule Test */}
      <Modal
        isOpen={isScheduleTestOpen}
        onClose={() => setIsScheduleTestOpen(false)}
        title="Schedule Assessment / Examination"
      >
        <form onSubmit={handleSubmit(onScheduleTest)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Test Title</label>
            <input
              type="text"
              {...register('title')}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject</label>
              <input
                type="text"
                {...register('subject')}
                className="w-full h-10 px-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {errors.subject && <p className="text-xs text-rose-600 mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full h-10 px-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Duration (Minutes)</label>
            <input
              type="number"
              {...register('durationMinutes', { valueAsNumber: true })}
              className="w-full h-10 px-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsScheduleTestOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Schedule & Notify
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Approve Task */}
      <Modal
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        title="Faculty Sign-off & Verification"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Approve work for: <strong className="text-[#142D27]">{approvingTask?.title}</strong>
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Feedback Note</label>
            <textarea
              value={approvalFeedback}
              onChange={(e) => setApprovalFeedback(e.target.value)}
              rows={3}
              className="w-full p-3 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setApprovingTask(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmApproval}>
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Direct Email Composer Modal */}
      <ComposeEmailModal
        isOpen={isComposeEmailOpen}
        onClose={() => setIsComposeEmailOpen(false)}
        defaultRecipientEmail={configuredStudent}
        defaultRecipientName="Bilal Ahmad"
      />
    </div>
  );
};
