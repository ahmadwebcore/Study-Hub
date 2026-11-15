import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle,
  Plus,
  Mail,
  Check,
  Search,
  UserPlus,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { useRole } from '../../hooks/useRole';
import { testService } from '../../services/testService';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import { FebruarySprintTracker } from '../../components/planner/FebruarySprintTracker';
import { BISEDGKhanBoardWidget } from '../../components/board/BISEDGKhanBoardWidget';

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
  const [isInviteStudentOpen, setIsInviteStudentOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('Student Scholar');
  const [newStudentEmail, setNewStudentEmail] = useState('student@studyhub.edu');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [approvingTask, setApprovingTask] = useState<DailyTask | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('Work verified and approved.');
  const [taskMarks, setTaskMarks] = useState<number>(27);
  const [taskMaxMarks, setTaskMaxMarks] = useState<number>(30);

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
      title: 'Physical Education Unit 1 Assessment',
      subject: 'Physical Education',
      date: '2026-11-20',
      durationMinutes: 45,
    },
  });

  const onScheduleTest = async (data: TestFormData) => {
    await testService.scheduleTest({
      title: data.title,
      subjectId: 'sub_01',
      subjectName: data.subject,
      subjectCode: 'FSC-PED-11',
      date: data.date,
      time: '09:00',
      durationMinutes: data.durationMinutes,
      totalMarks: 30,
      syllabusCoverage: 'Full Diagnostic',
    });

    setIsScheduleTestOpen(false);
    reset();
    setSuccessToast(`Test "${data.title}" scheduled.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSendInvite = async () => {
    if (!newStudentEmail || !newStudentEmail.includes('@')) return;

    const token = `INV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await studentService.createInvitation(
      newStudentEmail,
      user.id || 'usr_t_01',
      'Grade 11',
      '1st Year Intermediate',
      'Punjab & Federal Board',
      '2026-2027'
    );

    emailService.sendInvitationEmail({
      studentEmail: newStudentEmail,
      studentName: newStudentName,
      teacherName: 'Ahmad',
      inviteToken: token,
      course: '1st Year Intermediate',
      board: 'Punjab & Federal Board',
    });

    notificationService.addNotification({
      title: `✉️ Student Invitation Dispatched`,
      message: `Invitation token ${token} sent to ${newStudentEmail}. Direct link issued.`,
      category: 'system',
    });

    emailService.setStudentConfiguredEmail(newStudentEmail);
    setIsInviteStudentOpen(false);
    setSuccessToast(`Invitation sent to ${newStudentEmail} with token ${token}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmApproval = () => {
    if (!approvingTask) return;

    const taskPercentage = taskMaxMarks > 0 ? Math.round((taskMarks / taskMaxMarks) * 100) : 100;
    const finalNote = `${approvalFeedback} [Marks Awarded: ${taskMarks}/${taskMaxMarks} (${taskPercentage}%)]`;
    taskService.approveTask(approvingTask.id, 'Ahmad', finalNote);
    loadTasks();
    setApprovingTask(null);
    setSuccessToast(`Task "${approvingTask.title}" approved with ${taskMarks}/${taskMaxMarks} Marks (${taskPercentage}%).`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

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
    <div className="space-y-6 font-sans max-w-6xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3 rounded-lg bg-zinc-900 text-white flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
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
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Academic Direction &bull; 1st Year FA-IT Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight font-serif">
            Faculty Overview
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Faculty Director: <strong className="text-zinc-900">Ahmad</strong> &bull; Manage student milestones, verify 30-mark assessments, and dispatch curriculum targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/weekly-tasks"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            Upload Syllabus &amp; Break Tasks
          </Link>
          <button
            onClick={() => setIsInviteStudentOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-gradient-to-b from-[#143229] via-[#0f2720] to-[#0a1b16] ring-1 ring-white/15 hover:from-[#193e33] hover:to-[#0c201a] rounded-xl transition-all shadow-xs active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Student
          </button>
          <button
            onClick={() => setIsScheduleTestOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-500" />
            Schedule 30M Test
          </button>
          <button
            onClick={() => setIsComposeEmailOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-500" />
            Email Student
          </button>
        </div>
      </div>

      {/* 3-Month Target Sprint & Daily Book Quota Engine */}
      <FebruarySprintTracker />

      {/* BISE DG Khan Official Board Widget */}
      <BISEDGKhanBoardWidget />

      {/* Plain Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Total Tasks
          </span>
          <span className="text-3xl font-bold text-zinc-900 mt-1 block tracking-tight">
            {tasks.length}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Due Today
          </span>
          <span className="text-3xl font-bold text-zinc-900 mt-1 block tracking-tight">
            {todayCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Awaiting Review
          </span>
          <span className="text-3xl font-bold text-amber-600 mt-1 block tracking-tight">
            {awaitingCount}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-zinc-200">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
            Verified Complete
          </span>
          <span className="text-3xl font-bold text-emerald-600 mt-1 block tracking-tight">
            {approvedCount}
          </span>
        </div>
      </div>

      {/* Plain Tasks Table / Desk */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-xs">
        {/* Filter Bar */}
        <div className="p-3.5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'all', label: 'All', count: tasks.length },
              { id: 'today', label: 'Due Today', count: todayCount },
              { id: 'awaiting', label: 'Awaiting Review', count: awaitingCount },
              { id: 'approved', label: 'Verified', count: approvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTaskFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  taskFilter === tab.id
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 text-xs bg-white border border-zinc-200 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Task Rows List */}
        <div className="divide-y divide-zinc-100">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No tasks found under this filter.
            </div>
          ) : (
            filteredTasks.map((task) => (
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

                  {task.status === 'submitted_for_approval' && (
                    <button
                      onClick={() => setApprovingTask(task)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      Approve Work
                    </button>
                  )}

                  {task.status === 'approved' && (
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                      Verified
                    </span>
                  )}

                  {task.status === 'pending' && !task.isSundayOff && !task.isPakistanHoliday && (
                    <span className="px-2.5 py-1 text-[11px] font-semibold text-zinc-600 bg-zinc-100 rounded-lg border border-zinc-200">
                      Pending
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

      {/* Modal: Invite Student by Email */}
      <Modal
        isOpen={isInviteStudentOpen}
        onClose={() => setIsInviteStudentOpen(false)}
        title="Invite Student via Email"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-zinc-600">
            Invite a student to your StudyHub academic portal. They will receive an invitation token to redeem.
          </p>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Student Full Name</label>
            <input
              type="text"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Student Name"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Student Email Address</label>
            <input
              type="email"
              value={newStudentEmail}
              onChange={(e) => setNewStudentEmail(e.target.value)}
              placeholder="e.g. student@studyhub.edu"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsInviteStudentOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendInvite}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800"
            >
              Send Invitation Token
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Schedule Test */}
      <Modal
        isOpen={isScheduleTestOpen}
        onClose={() => setIsScheduleTestOpen(false)}
        title="Schedule Assessment"
      >
        <form onSubmit={handleSubmit(onScheduleTest)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Title</label>
            <input
              type="text"
              {...register('title')}
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Subject</label>
              <input
                type="text"
                {...register('subject')}
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
              />
              {errors.subject && <p className="text-xs text-rose-600 mt-1">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
              />
              {errors.date && <p className="text-xs text-rose-600 mt-1">{errors.date.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Duration (Minutes)</label>
            <input
              type="number"
              {...register('durationMinutes', { valueAsNumber: true })}
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleTestOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Check Work & Award Marks */}
      <Modal
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        title="Check & Grade Student Submission"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Task Assignment</span>
            <p className="text-xs font-bold text-zinc-900 mt-0.5">{approvingTask?.title}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{approvingTask?.subjectName} &bull; Due: {approvingTask?.dueDate}</p>
          </div>

          {/* Solution Sheet Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                📄 Student Solution Sheet
              </span>
              <span className="text-[10px] text-zinc-400">PDF / Image Preview</span>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700/80 font-mono text-[11px] text-zinc-300 space-y-1">
              <p className="text-emerald-300 font-bold">&bull; Worked Solution Problem Set (FSc):</p>
              <p className="text-zinc-400 italic">"Step 1: Formula substituted correctly. Vector components resolved along X and Y axes. Boundary conditions satisfied."</p>
              <div className="pt-1 text-[10px] text-zinc-500">File: {approvingTask?.studentSubmission?.attachmentName || 'student_solution_notes.pdf'}</div>
            </div>
          </div>

          {/* Marks Input & Cool Progress Bar */}
          <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900">Total Marks Awarded</label>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {taskMarks} / {taskMaxMarks}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Obtained Marks</span>
                <input
                  type="number"
                  min={0}
                  max={taskMaxMarks}
                  value={taskMarks}
                  onChange={(e) => setTaskMarks(Math.min(taskMaxMarks, Math.max(0, Number(e.target.value))))}
                  className="w-full h-9 px-3 text-xs font-bold rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">Total Max Marks</span>
                <input
                  type="number"
                  min={1}
                  value={taskMaxMarks}
                  onChange={(e) => setTaskMaxMarks(Math.max(1, Number(e.target.value)))}
                  className="w-full h-9 px-3 text-xs font-bold rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            {/* Cool Mini Progress Bar Underneath */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">Score Percentage</span>
                <span className="font-bold text-zinc-900">
                  {taskMaxMarks > 0 ? Math.round((taskMarks / taskMaxMarks) * 100) : 100}%
                  <span className="ml-1 text-emerald-600 font-semibold">
                    ({(taskMarks / taskMaxMarks) >= 0.5 ? 'Passed' : 'Needs Work'})
                  </span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${taskMaxMarks > 0 ? Math.min(100, Math.round((taskMarks / taskMaxMarks) * 100)) : 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Teacher Remarks / Notes</label>
            <textarea
              value={approvalFeedback}
              onChange={(e) => setApprovalFeedback(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setApprovingTask(null)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmApproval}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-xs"
            >
              Save Marks & Sign Off
            </button>
          </div>
        </div>
      </Modal>

      {/* Direct Email Composer Modal */}
      <ComposeEmailModal
        isOpen={isComposeEmailOpen}
        onClose={() => setIsComposeEmailOpen(false)}
        defaultRecipientEmail={configuredStudent}
        defaultRecipientName="Student Scholar"
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => {
          setSuccessToast('Account password updated successfully.');
          setTimeout(() => setSuccessToast(null), 3500);
        }}
      />
    </div>
  );
};
