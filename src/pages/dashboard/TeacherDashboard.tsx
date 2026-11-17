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
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { ChangePasswordModal } from '../../components/auth/ChangePasswordModal';
import { useRole } from '../../hooks/useRole';
import { testService, extractDayAndCleanTitle } from '../../services/testService';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import { FebruarySprintTracker } from '../../components/planner/FebruarySprintTracker';
import { BISEDGKhanBoardWidget } from '../../components/board/BISEDGKhanBoardWidget';
import { MonthlyAttendanceReport } from '../../components/attendance/MonthlyAttendanceReport';
import { DailyTestSeriesGrid } from '../../components/tests/DailyTestSeriesGrid';
import { TestItem } from '../../types';
import { SAMPLE_TESTS } from '../../data/sampleData';

const testSchema = z.object({
  title: z.string().min(3, 'Test title must be at least 3 characters'),
  subject: z.string().min(1, 'Please select a subject'),
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().min(15, 'Minimum 15 minutes').max(180, 'Maximum 180 minutes'),
});

type TestFormData = z.infer<typeof testSchema>;

export const TeacherDashboard: React.FC = () => {
  const { user, switchToStudent, canSwitchRole } = useRole();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'awaiting' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isScheduleTestOpen, setIsScheduleTestOpen] = useState(false);
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false);
  const [isInviteStudentOpen, setIsInviteStudentOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('Student Scholar');
  const [newStudentEmail, setNewStudentEmail] = useState('dbaddiesvlog@gmail.com');
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
    testService.fetchTests().then((t) => setTests(t || []));
    const handleUpdate = () => {
      loadTasks();
      testService.fetchTests().then((t) => setTests(t || []));
    };
    window.addEventListener('studyhub_tests_updated', handleUpdate);
    window.addEventListener('studyhub_tasks_updated', handleUpdate);
    return () => {
      window.removeEventListener('studyhub_tests_updated', handleUpdate);
      window.removeEventListener('studyhub_tasks_updated', handleUpdate);
    };
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
      '1st Year Intermediate',
      '1st Year FA-IT (Intermediate Part 1)',
      'BISE D.G. Khan (Dera Ghazi Khan Board)',
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
    if (newStudentName) {
      localStorage.setItem('studyhub_student_configured_name', newStudentName);
    }
    setIsInviteStudentOpen(false);
    setSuccessToast(`Invitation sent to ${newStudentEmail} with token ${token}.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleConfirmApproval = () => {
    if (!approvingTask) return;

    const taskPercentage = taskMaxMarks > 0 ? Math.round((taskMarks / taskMaxMarks) * 100) : 100;
    const gradeLetter = taskPercentage >= 90 ? 'Grade A*' : taskPercentage >= 80 ? 'Grade A' : taskPercentage >= 50 ? 'Grade B' : 'Grade C';
    const finalNote = `${approvalFeedback || 'Certified by Sir Ahmad'} [Marks Awarded: ${taskMarks}/${taskMaxMarks} (${taskPercentage}%)]`;
    taskService.approveTask(approvingTask.id, 'Ahmad', finalNote);

    // Save dynamic result record
    testService.saveLocalCertifiedResult({
      id: `res_${approvingTask.id}_${Date.now()}`,
      testId: approvingTask.id,
      testTitle: approvingTask.title,
      studentId: approvingTask.studentId || 'student_henza',
      studentName: approvingTask.studentName || 'Henza Noor',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
      subjectName: approvingTask.subjectName,
      subjectCode: approvingTask.subjectCode,
      score: taskMarks,
      maxScore: taskMaxMarks,
      percentage: taskPercentage,
      grade: gradeLetter,
      rank: '1st in Cohort',
      passed: taskMarks >= Math.ceil(taskMaxMarks * 0.5),
      date: new Date().toISOString().slice(0, 10),
      feedback: finalNote,
    });

    // Dispatch real-time student notification
    notificationService.notifyCertifiedGrade(
      approvingTask.title,
      taskMarks,
      taskMaxMarks,
      gradeLetter,
      approvalFeedback || 'Excellent coursework completion.'
    );

    window.dispatchEvent(new Event('studyhub_results_updated'));
    window.dispatchEvent(new Event('studyhub_tests_updated'));

    loadTasks();
    setApprovingTask(null);
    setSuccessToast(`Task "${approvingTask.title}" approved with ${taskMarks}/${taskMaxMarks} Marks (${taskPercentage}%). Student notified instantly.`);
    setTimeout(() => setSuccessToast(null), 3500);
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
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-semibold shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 text-base font-bold">
            &times;
          </button>
        </div>
      )}

      {/* Top Level Plain Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Academic Direction &bull; 1st Year FA-IT Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif">
            Faculty Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Faculty Director: <strong className="text-zinc-200">Ahmad</strong> &bull; Manage student milestones, verify 30-mark assessments, and dispatch curriculum targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/tests"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded-xl hover:bg-emerald-900/60 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            Upload Syllabus &amp; Break Tasks
          </Link>
          <button
            onClick={() => setIsInviteStudentOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Student
          </button>
          <button
            onClick={() => setIsScheduleTestOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-[#2e3533] border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            Schedule 30M Test
          </button>
          <button
            onClick={() => setIsComposeEmailOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-200 bg-[#2e3533] border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors shadow-2xs cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            Email Student
          </button>
        </div>
      </div>

      {/* Faculty Perspective / Quick Student View Preview Switcher */}
      {canSwitchRole && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider bg-emerald-900/80 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Faculty Authority Active
                </span>
                <span className="text-xs text-zinc-300">Signed in as <strong>Sir Ahmad</strong></span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Reviewing complete academic operations. You can switch to Henza Noor's view to see the student experience.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={switchToStudent}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center gap-1.5"
            title="Preview how student sees the dashboard, test series, and quota"
          >
            <span>Preview Student Portal (Henza Noor)</span>
            <ArrowRight className="w-4 h-4 text-emerald-950" />
          </button>
        </div>
      )}

      {/* Scheduled Daily Test Series Grid (15-Week Timetable • 30-Mark Tests) */}
      <div className="space-y-2">
        <DailyTestSeriesGrid tests={tests} />
      </div>

      {/* 3-Month Target Sprint & Daily Book Quota Engine */}
      <FebruarySprintTracker />

      {/* BISE DG Khan Official Board Widget */}
      <BISEDGKhanBoardWidget />

      {/* Metrics Row: 1-col on mobile, 2-col on sm, 4-col on lg */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider block">
            Total Targets
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-[#142D27] font-serif mt-1 block tracking-tight">
            {tasks.length}
          </span>
          <p className="text-[11px] text-[#7d9990] mt-0.5">Syllabus breakdown milestones</p>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider block">
            Due Today
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-serif mt-1 block tracking-tight">
            {todayCount}
          </span>
          <p className="text-[11px] text-[#7d9990] mt-0.5">Active reading targets</p>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider block">
            Awaiting Review
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-serif mt-1 block tracking-tight">
            {awaitingCount}
          </span>
          <p className="text-[11px] text-amber-700 mt-0.5 font-semibold">Requires faculty check</p>
        </div>
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider block">
            Verified Complete
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-serif mt-1 block tracking-tight">
            {approvedCount}
          </span>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">Approved by Ahmad Sir</p>
        </div>
      </div>

      {/* Persistent Monthly Attendance & Student Presence Report */}
      <MonthlyAttendanceReport />

      {/* Task Milestones Series Bento Desk */}
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="p-3.5 rounded-2xl border border-[#e1ede7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All', count: tasks.length },
              { id: 'today', label: 'Due Today', count: todayCount },
              { id: 'awaiting', label: 'Awaiting Review', count: awaitingCount },
              { id: 'approved', label: 'Verified', count: approvedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTaskFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                  taskFilter === tab.id
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-[#557067] hover:text-[#142D27] hover:bg-[#F7F9F8]'
                }`}
              >
                {tab.label} <span className="opacity-70 text-[11px]">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Task Cards Grid: 1-col on mobile, 2-col on sm, 3-col on lg, Latest on top */}
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#557067] bg-white rounded-3xl border border-[#e1ede7]">
            No tasks found under this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks
              .slice()
              .sort((a, b) => {
                if (a.status === 'submitted_for_approval' && b.status !== 'submitted_for_approval') return -1;
                if (b.status === 'submitted_for_approval' && a.status !== 'submitted_for_approval') return 1;
                if (a.dueDate === todayStr && b.dueDate !== todayStr) return -1;
                if (b.dueDate === todayStr && a.dueDate !== todayStr) return 1;
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
              })
              .map((task) => {
                const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(task.title);

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-3xl bg-white border border-[#e1ede7] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      {/* Top Pill Row */}
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#e1ede7]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact">
                            {day || task.dayOfWeek}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {task.subjectCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7d9990] font-medium">
                          {task.dueDate}
                        </span>
                      </div>

                      {/* Subject & Title */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-[#557067] uppercase tracking-wider block">
                          {task.subjectName}
                        </span>
                        <h4
                          className={`mt-1 group-hover:text-emerald-700 transition-colors ${
                            isUrdu
                              ? 'font-urdu text-[15px] font-bold text-[#142D27] text-right dir-rtl leading-loose'
                              : 'text-sm font-bold text-[#142D27]'
                          }`}
                        >
                          <bdi>{cleanTitle}</bdi>
                        </h4>
                      </div>

                      {/* Description Snippet */}
                      {task.description && (
                        <div className="mt-2.5 p-2 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs text-[#557067] line-clamp-2 leading-relaxed">
                          {task.description}
                        </div>
                      )}
                    </div>

                    {/* Bottom Status / Action Footer */}
                    <div className="pt-3 mt-3.5 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#7d9990] font-medium">
                        {task.estimatedMinutes || 45} Mins Quota
                      </span>

                      {task.status === 'submitted_for_approval' ? (
                        <button
                          onClick={() => setApprovingTask(task)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve &amp; Mark</span>
                        </button>
                      ) : task.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : task.isSundayOff || task.isPakistanHoliday ? (
                        <span className="text-[10px] font-semibold text-sky-800 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200">
                          🇵🇰 Rest Day
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-zinc-600 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Modal: Invite Student by Email */}
      <Modal
        isOpen={isInviteStudentOpen}
        onClose={() => setIsInviteStudentOpen(false)}
        title="Invite Student via Email"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-zinc-600">
            Invite a student to the Global Science Academy portal. They will receive an invitation token to redeem.
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
              placeholder="e.g. dbaddiesvlog@gmail.com"
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
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-xs"
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
          <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-bold text-[#7d9990] block">Task Assignment</span>
              {approvingTask && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-urdu-compact">
                  {extractDayAndCleanTitle(approvingTask.title).day}
                </span>
              )}
            </div>
            {(() => {
              const meta = approvingTask ? extractDayAndCleanTitle(approvingTask.title) : null;
              return (
                <p className={`font-bold text-[#142D27] ${meta?.isUrdu ? 'font-urdu text-[15px] leading-loose text-right dir-rtl' : 'text-xs'}`}>
                  <bdi>{meta ? meta.cleanTitle : ''}</bdi>
                </p>
              );
            })()}
            <p className="text-[11px] text-[#557067] mt-1">{approvingTask?.subjectName} &bull; Due: {approvingTask?.dueDate}</p>
          </div>

          {/* Solution Sheet Preview */}
          <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-[#142D27] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                📄 Student Solution Sheet
              </span>
              <span className="text-[10px] text-[#7d9990]">PDF / Image Preview</span>
            </div>
            <div className="p-3 rounded-lg bg-white border border-[#e1ede7] font-mono text-[11px] text-[#2e473f] space-y-1 shadow-2xs">
              <p className="text-emerald-700 font-bold">&bull; Worked Solution Problem Set (FA-IT 1st Year):</p>
              <p className="text-[#557067] italic">&quot;Student handwritten coursework submitted for BISE DG Khan examination standards. Key definitions, diagrams, and exercises completed.&quot;</p>
              <div className="pt-1 text-[10px] text-[#7d9990]">File: {approvingTask?.studentSubmission?.attachmentName || 'student_solution_notes.pdf'}</div>
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
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
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
