import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Clock,
  CheckCircle,
  PlusCircle,
  Mail,
  Send,
  Check,
  Search,
  UserPlus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { SAMPLE_STUDENTS_LIST } from '../../data/sampleData';
import { useRole } from '../../hooks/useRole';
import { testService } from '../../services/testService';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { studentService } from '../../services/studentService';
import { getUpcomingPakistanHolidays } from '../../data/pakistanHolidays';
import { Link } from 'react-router-dom';

const testSchema = z.object({
  title: z.string().min(3, 'Test title must be at least 3 characters'),
  subject: z.string().min(1, 'Please select a subject'),
  date: z.string().min(1, 'Date is required'),
  durationMinutes: z.number().min(15, 'Minimum 15 minutes').max(180, 'Maximum 180 minutes'),
});

type TestFormData = z.infer<typeof testSchema>;

const addStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid Gmail address'),
  academicClass: z.string().min(1, 'Please select grade'),
  course: z.string().min(2, 'Course is required'),
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

export const TeacherDashboard: React.FC = () => {
  const { user } = useRole();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'today' | 'awaiting' | 'holidays' | 'approved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickActionModal, setQuickActionModal] = useState<'schedule-test' | 'add-student' | null>(null);
  const [isComposeEmailOpen, setIsComposeEmailOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [approvingTask, setApprovingTask] = useState<DailyTask | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('Excellent work. Approved and verified.');

  const upcomingHolidays = getUpcomingPakistanHolidays(4);
  const configuredSender = emailService.getTeacherConfiguredEmail();
  const configuredStudent = emailService.getStudentConfiguredEmail();

  const loadTasks = () => {
    const list = taskService.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const {
    register: registerTest,
    handleSubmit: handleTestSubmit,
    reset: resetTest,
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      title: 'Calculus Unit 3 Comprehensive Diagnostic',
      subject: 'Advanced Calculus (MATH-301)',
      date: '2026-11-25',
      durationMinutes: 90,
    },
  });

  const {
    register: registerStudent,
    handleSubmit: handleStudentSubmit,
    reset: resetStudent,
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: '',
      email: '',
      academicClass: 'Grade 11',
      course: 'Advanced STEM',
    },
  });

  const onScheduleTest = async (data: TestFormData) => {
    await testService.scheduleTest({
      title: data.title,
      subjectId: 'sub_01',
      subjectName: data.subject,
      subjectCode: 'GEN-101',
      date: data.date,
      time: '10:00 AM',
      durationMinutes: data.durationMinutes,
      totalMarks: 100,
      syllabusCoverage: 'Standard curriculum module test',
      createdBy: user?.id,
    });

    // Auto-dispatch notification email
    emailService.sendNewTestAlert({
      studentEmail: configuredStudent,
      studentName: 'Bilal Ahmad',
      teacherName: user?.name || 'Prof. Clara Evans',
      testTitle: data.title,
      subjectName: data.subject,
      date: data.date,
      time: '10:00 AM',
      durationMinutes: data.durationMinutes,
      totalMarks: 100,
      passingMarks: 50,
      syllabusCoverage: 'Standard curriculum module test',
    });

    setSuccessToast(`Assessment "${data.title}" scheduled & Gmail notification sent to ${configuredStudent}!`);
    resetTest();
    setQuickActionModal(null);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const onAddStudent = async (data: AddStudentFormData) => {
    const newStudent = {
      id: `usr_s_${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
      grade: data.academicClass,
      enrolledSubjects: ['Advanced Calculus & Vectors', 'Quantum Physics & Mechanics'],
      assignedSubjectIds: ['sub_01', 'sub_02'],
      overallPerformance: 90.0,
      attendanceRate: 100,
      pendingAssignmentsCount: 0,
      upcomingTestsCount: 1,
      lastActive: 'Invited just now',
      status: 'active' as const,
      rollNumber: `SH-2026-00${SAMPLE_STUDENTS_LIST.length + 1}`,
      enrolledAt: 'Today',
      academicClass: data.academicClass,
      course: data.course,
      board: 'Cambridge (CIE)',
      academicSession: '2026-2027',
    };

    await studentService.saveStudent(newStudent);

    // Send invitation email
    emailService.sendInvitationEmail({
      studentEmail: data.email,
      studentName: data.name,
      teacherName: user?.name || 'Prof. Clara Evans',
      inviteToken: `tok_${Date.now()}`,
      course: data.course,
      board: 'Cambridge (CIE)',
    });

    setSuccessToast(`Student "${data.name}" enrolled! Official invitation sent to ${data.email}.`);
    resetStudent();
    setQuickActionModal(null);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleConfirmApprove = (task: DailyTask) => {
    taskService.approveTask(task.id, user?.name || 'Prof. Clara Evans', approvalFeedback);
    setApprovingTask(null);
    loadTasks();
    setSuccessToast(`Task "${task.title}" verified & approved! Added to Completed Work ledger.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Filter tasks by status
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (taskFilter === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      return t.dueDate === todayStr || t.assignedDate === todayStr;
    }
    if (taskFilter === 'awaiting') {
      return t.status === 'submitted_for_approval';
    }
    if (taskFilter === 'holidays') {
      return t.isPakistanHoliday || t.isSundayOff;
    }
    if (taskFilter === 'approved') {
      return t.status === 'approved' && !t.isSundayOff && !t.isPakistanHoliday;
    }
    return true;
  });

  const awaitingCount = tasks.filter((t) => t.status === 'submitted_for_approval').length;
  const approvedCount = tasks.filter((t) => t.status === 'approved' && !t.isSundayOff && !t.isPakistanHoliday).length;
  const holidayCount = tasks.filter((t) => t.isPakistanHoliday || t.isSundayOff).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-subtle animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 text-base">
            &times;
          </button>
        </div>
      )}

      {/* Faculty Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142D27] tracking-tight">
              Faculty Dashboard & Daily Tasks
            </h1>
            <Badge variant="primary" size="sm" dot pulseDot>
              Academic Lead
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#557067] mt-1">
            Daily syllabus targets, student submission approvals, Pakistan Gazetted calendar, and Gmail notifications.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Mail className="w-3.5 h-3.5 text-[#14B866]" />}
            onClick={() => setIsComposeEmailOpen(true)}
          >
            Compose Gmail
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<UserPlus className="w-3.5 h-3.5 text-[#14B866]" />}
            onClick={() => setQuickActionModal('add-student')}
          >
            Add Student
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5 text-white" />}
            onClick={() => setQuickActionModal('schedule-test')}
          >
            Schedule Test
          </Button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Awaiting Approval (Gate)
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-amber-700">{awaitingCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Needs Sign-off
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Verified Completed
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-emerald-700">{approvedCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Faculty Signed
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            🇵🇰 Pakistan & Sunday Offs
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-[#142D27]">{holidayCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              Rest Days
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Configured Gmail
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-bold text-[#142D27] truncate max-w-[140px]" title={configuredSender}>
              {configuredSender}
            </span>
            <Link to="/settings" className="text-[10px] font-bold text-[#14B866] hover:underline">
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Pakistan Calendar Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#f0f9f4] to-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🇵🇰</span>
          <div>
            <span className="font-bold text-emerald-950 block">
              Pakistan Gazetted Academic Calendar Active
            </span>
            <span className="text-[11px] text-emerald-800">
              All official gazetted holidays (Kashmir Day, Pakistan Day, Eid, Independence Day, Iqbal Day, Quaid-e-Azam Day) and Sundays are mandatory rest days with zero exam pressure.
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 shrink-0 border border-emerald-300">
          Strict Policy
        </span>
      </div>

      {/* 2-Column Task & Schedule Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column (Task View) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Task Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e1ede7]">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Tasks', count: tasks.length },
                { id: 'today', label: 'Due Today', count: tasks.filter((t) => t.dueDate === new Date().toISOString().slice(0, 10)).length },
                { id: 'awaiting', label: 'Awaiting Gate', count: awaitingCount, badgeColor: 'bg-amber-100 text-amber-800' },
                { id: 'holidays', label: '🇵🇰 Holidays & Sunday', count: holidayCount },
                { id: 'approved', label: 'Verified Complete', count: approvedCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTaskFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    taskFilter === tab.id
                      ? 'bg-[#142D27] text-white shadow-sm'
                      : 'text-[#557067] hover:bg-[#E7EFEA]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${taskFilter === tab.id ? 'bg-[#14B866] text-white' : 'bg-[#E7EFEA] text-[#142D27]'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7d9990]" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] placeholder-[#7d9990] focus:border-[#14B866] focus:outline-none"
              />
            </div>
          </div>

          {/* Interactive Task List */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#e1ede7]">
                <Clock className="w-8 h-8 text-[#7d9990] mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#142D27]">No tasks found under this filter.</p>
                <p className="text-[11px] text-[#557067] mt-0.5">Switch view tabs or generate new daily tasks from Book Library.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'submitted_for_approval'
                      ? 'border-amber-300 bg-amber-50/20 shadow-sm'
                      : task.isSundayOff || task.isPakistanHoliday
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-[#e1ede7] hover:border-[#14B866]/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status Circle */}
                    <div className="mt-0.5 shrink-0">
                      {task.status === 'approved' ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : task.status === 'submitted_for_approval' ? (
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                          !
                        </div>
                      ) : task.isSundayOff || task.isPakistanHoliday ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs">
                          🇵🇰
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-zinc-300 text-transparent flex items-center justify-center">
                          &bull;
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.2 rounded bg-[#E7EFEA] text-[#142D27]">
                          {task.subjectCode}
                        </span>
                        <span className="text-xs font-bold text-[#142D27] truncate">
                          {task.title}
                        </span>
                        {task.isPakistanHoliday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {task.urduName || 'سرکاری چھٹی'}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#557067] mt-0.5 line-clamp-1">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[#7d9990]">
                        <span>Due: {task.dayOfWeek}, {task.dueDate}</span>
                        {task.pagesRange && <span>&bull; {task.pagesRange}</span>}
                        <span>&bull; Student: {task.studentName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {task.status === 'submitted_for_approval' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setApprovingTask(task)}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve Work
                      </Button>
                    )}

                    {task.status === 'approved' && !task.isSundayOff && !task.isPakistanHoliday && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Verified
                      </span>
                    )}

                    {(task.isSundayOff || task.isPakistanHoliday) && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                        Scheduled Off
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Communications & Pakistan Gazetted Holidays */}
        <div className="space-y-4">
          {/* Configured Gmail Notification Widget */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#14B866]" />
                Gmail Dispatch Station
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#7d9990] uppercase block">Faculty Sender:</span>
                <span className="text-xs font-semibold text-[#142D27]">{configuredSender}</span>
              </div>
              <div className="pt-1 border-t border-[#e1ede7]">
                <span className="text-[10px] font-bold text-[#7d9990] uppercase block">Student Target:</span>
                <span className="text-xs font-semibold text-[#142D27]">{configuredStudent}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsComposeEmailOpen(true)}
                icon={<Send className="w-3.5 h-3.5 text-[#14B866]" />}
              >
                Send Direct Mail
              </Button>
              <Link to="/settings" className="w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Change Gmail
                </Button>
              </Link>
            </div>
          </div>

          {/* Pakistan Public Holidays mini-calendar */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                <span>🇵🇰</span>
                Upcoming Pakistan Holidays
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Gazetted Off
              </span>
            </div>

            <div className="space-y-2">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-[#142D27] block truncate">{holiday.name}</span>
                    <span className="text-[10px] text-[#14B866] font-semibold">{holiday.urduName}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono font-bold text-[#263B35] block">{holiday.date}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                      Off Day
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students Quick Roster */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider">
                Cohort Students
              </span>
              <Link to="/students" className="text-xs font-bold text-[#14B866] hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {SAMPLE_STUDENTS_LIST.slice(0, 3).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 rounded-xl bg-[#F7F9F8]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#142D27] block truncate">{student.name}</span>
                      <span className="text-[10px] text-[#7d9990]">{student.rollNumber}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Mail className="w-3 h-3 text-[#14B866]" />}
                    onClick={() => setIsComposeEmailOpen(true)}
                  >
                    Mail
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Approval Modal */}
      {approvingTask && (
        <Modal
          isOpen={!!approvingTask}
          onClose={() => setApprovingTask(null)}
          title="Verify & Certify Student Work"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              <span className="font-bold block">Student Submission:</span>
              <p className="mt-1">"{approvingTask.studentSubmission?.notes || 'Completed assigned exercises.'}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142D27] mb-1">
                Teacher Verification Signature & Feedback:
              </label>
              <textarea
                rows={3}
                value={approvalFeedback}
                onChange={(e) => setApprovalFeedback(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e1ede7]">
              <Button variant="ghost" size="sm" onClick={() => setApprovingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Check className="w-3.5 h-3.5" />}
                onClick={() => handleConfirmApprove(approvingTask)}
              >
                Sign & Approve Work
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Test Modal */}
      {quickActionModal === 'schedule-test' && (
        <Modal
          isOpen={true}
          onClose={() => setQuickActionModal(null)}
          title="Schedule Official Assessment"
          maxWidth="md"
        >
          <form onSubmit={handleTestSubmit(onScheduleTest)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Test Title</label>
              <input
                type="text"
                {...registerTest('title')}
                className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject</label>
                <select
                  {...registerTest('subject')}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                >
                  <option value="Advanced Calculus (MATH-301)">Advanced Calculus (MATH-301)</option>
                  <option value="Quantum Physics & Mechanics">Quantum Physics & Mechanics</option>
                  <option value="Organic Chemistry">Organic Chemistry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Date</label>
                <input
                  type="date"
                  {...registerTest('date')}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e1ede7]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Schedule & Alert Gmail
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Student Modal */}
      {quickActionModal === 'add-student' && (
        <Modal
          isOpen={true}
          onClose={() => setQuickActionModal(null)}
          title="Add / Enroll New Student"
          maxWidth="md"
        >
          <form onSubmit={handleStudentSubmit(onAddStudent)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Ayesha Khan"
                {...registerStudent('name')}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Student Gmail Address</label>
              <input
                type="email"
                placeholder="ayesha.student@gmail.com"
                {...registerStudent('email')}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Grade</label>
                <select
                  {...registerStudent('academicClass')}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                >
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Course Track</label>
                <input
                  type="text"
                  placeholder="Advanced Pre-Engineering"
                  {...registerStudent('course')}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e1ede7]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setQuickActionModal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Enroll & Send Invite
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Compose Direct Email Modal */}
      <ComposeEmailModal
        isOpen={isComposeEmailOpen}
        onClose={() => setIsComposeEmailOpen(false)}
        defaultRecipientEmail={configuredStudent}
        defaultRecipientName="Bilal Ahmad"
        onSuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
