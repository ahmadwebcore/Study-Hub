import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  Mail,
  Upload,
  Flame,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { taskService, DailyTask } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { getUpcomingPakistanHolidays } from '../../data/pakistanHolidays';
import { useRole } from '../../hooks/useRole';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { userProfile, user } = useRole();
  const studentName = userProfile?.fullName || userProfile?.name || user?.name || 'Bilal Ahmad';
  const studentFirstName = studentName.split(' ')[0];

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'holidays' | 'verified'>('today');
  const [submittingTask, setSubmittingTask] = useState<DailyTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const upcomingHolidays = getUpcomingPakistanHolidays(4);
  const configuredStudentEmail = emailService.getStudentConfiguredEmail();
  const configuredTeacherEmail = emailService.getTeacherConfiguredEmail();

  const loadData = () => {
    const list = taskService.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmSubmitWork = async () => {
    if (!submittingTask) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    taskService.submitTaskForApproval(
      submittingTask.id,
      submissionNotes,
      'daily_work_notes.pdf'
    );
    setIsSubmitting(false);
    setSubmittingTask(null);
    setSubmissionNotes('');
    loadData();
    setSuccessToast(`Work submitted for "${submittingTask.title}"! Now awaiting teacher verification.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Filter tasks based on activeTab
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || t.assignedDate === todayStr || (!t.isSundayOff && !t.isPakistanHoliday && t.status === 'pending'));
  const holidayTasks = tasks.filter((t) => t.isSundayOff || t.isPakistanHoliday);
  const verifiedTasks = tasks.filter((t) => t.status === 'approved' && !t.isSundayOff && !t.isPakistanHoliday);

  const currentDisplayTasks =
    activeTab === 'today'
      ? todayTasks
      : activeTab === 'week'
      ? tasks
      : activeTab === 'holidays'
      ? holidayTasks
      : verifiedTasks;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-subtle animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900 text-base">
            &times;
          </button>
        </div>
      )}

      {/* 1. Student Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#142D27] via-[#1a3831] to-[#142D27] p-6 sm:p-7 text-white shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" dot pulseDot>
                Active Student Session
              </Badge>
              <span className="text-xs text-[#E7EFEA]/80 font-medium flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                14-Day Streak
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                🇵🇰 Pakistan Calendar Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {studentFirstName}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#E7EFEA]/80 max-w-xl leading-relaxed">
              Your daily textbook targets are ready. Complete and submit them for faculty sign-off. Remember: Sundays & Pakistan Gazetted Holidays are complete rest days!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link to="/test-submit">
              <Button variant="secondary" size="sm" icon={<FileCheck2 className="w-4 h-4 text-[#14B866]" />}>
                Exam Submission Desk
              </Button>
            </Link>
            <Link to="/weekly-tasks">
              <Button variant="primary" size="sm" icon={<CalendarDays className="w-4 h-4 text-white" />}>
                Weekly Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Stats Overview Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Today's Daily Tasks
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-[#142D27]">{todayTasks.length}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Teacher Verified Work
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-emerald-700">{verifiedTasks.length}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Approved
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            🇵🇰 Pakistan & Sunday Offs
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-2xl font-extrabold text-[#142D27]">{holidayTasks.length}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              Rest Days
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider block">
            My Registered Gmail
          </span>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-bold text-[#142D27] truncate max-w-[140px]" title={configuredStudentEmail}>
              {configuredStudentEmail}
            </span>
            <Link to="/settings" className="text-[10px] font-bold text-[#14B866] hover:underline">
              Change
            </Link>
          </div>
        </div>
      </div>

      {/* 2-Column Student Task Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Interactive Student Task Stream */}
        <div className="lg:col-span-2 space-y-4">
          {/* View Filter Ribbon */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#e1ede7] overflow-x-auto">
            {[
              { id: 'today', label: "Today's Target", count: todayTasks.length },
              { id: 'week', label: 'All Weekly Tasks', count: tasks.length },
              { id: 'holidays', label: '🇵🇰 Pakistan Holidays & Sunday Off', count: holidayTasks.length },
              { id: 'verified', label: 'Teacher Approved Work', count: verifiedTasks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-[#142D27] text-white shadow-sm'
                    : 'text-[#557067] hover:bg-[#E7EFEA]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-[#14B866] text-white' : 'bg-[#E7EFEA] text-[#142D27]'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-2.5">
            {currentDisplayTasks.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#e1ede7]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-[#142D27]">All caught up for this view!</p>
                <p className="text-[11px] text-[#557067] mt-0.5">Check out your Book Library or review Completed Work.</p>
              </div>
            ) : (
              currentDisplayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'submitted_for_approval'
                      ? 'border-amber-300 bg-amber-50/20'
                      : task.isSundayOff || task.isPakistanHoliday
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : 'border-[#e1ede7] hover:border-[#14B866]/40'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
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
                        <button
                          onClick={() => setSubmittingTask(task)}
                          className="w-6 h-6 rounded-full border-2 border-zinc-300 hover:border-[#14B866] text-transparent flex items-center justify-center transition-colors"
                          title="Submit work for teacher review"
                        >
                          &bull;
                        </button>
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
                            {task.urduName}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#557067] mt-0.5 line-clamp-1">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[#7d9990]">
                        <span>Due: {task.dayOfWeek}, {task.dueDate}</span>
                        {task.pagesRange && <span>&bull; {task.pagesRange}</span>}
                        <span>&bull; Target: {task.estimatedMinutes} mins</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {task.status === 'pending' && !task.isSundayOff && !task.isPakistanHoliday && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSubmittingTask(task)}
                        icon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Submit Work
                      </Button>
                    )}

                    {task.status === 'submitted_for_approval' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Awaiting Teacher Sign-off
                      </span>
                    )}

                    {task.status === 'approved' && !task.isSundayOff && !task.isPakistanHoliday && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Verified & Approved
                      </span>
                    )}

                    {(task.isSundayOff || task.isPakistanHoliday) && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                        Scheduled Rest Day
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Pakistan Holidays & Gmail Station */}
        <div className="space-y-4">
          {/* Pakistan Holidays Mini Calendar */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                <span>🇵🇰</span>
                Upcoming Pakistan Holidays
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Off Days
              </span>
            </div>
            <p className="text-[11px] text-[#557067]">
              Gazetted public holidays are strictly off. Zero homework or exams are scheduled.
            </p>

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
                      Holiday Off
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configured Gmail Notification Status */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-[#14B866]" />
                My Gmail Notification Desk
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] space-y-1.5 text-xs">
              <div>
                <span className="text-[10px] font-bold text-[#7d9990] uppercase block">Receiving Alerts At:</span>
                <span className="text-xs font-semibold text-[#142D27]">{configuredStudentEmail}</span>
              </div>
              <div className="pt-1 border-t border-[#e1ede7]">
                <span className="text-[10px] font-bold text-[#7d9990] uppercase block">Teacher Dispatcher:</span>
                <span className="text-xs font-semibold text-[#142D27]">{configuredTeacherEmail}</span>
              </div>
            </div>

            <Link to="/settings" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Update Registered Gmail
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Submit Work Modal */}
      {submittingTask && (
        <Modal
          isOpen={!!submittingTask}
          onClose={() => setSubmittingTask(null)}
          title="Submit Daily Task for Faculty Approval"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950">
              <span className="font-bold block">{submittingTask.title}</span>
              <span className="text-[11px] text-[#557067]">{submittingTask.subjectName} &bull; {submittingTask.pagesRange}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#142D27] mb-1">
                Your Completion Notes & Solution Summary:
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Read pages 340-355 and completed vector field boundary questions 1 through 5."
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>

            <div className="p-3 rounded-xl border border-dashed border-[#e1ede7] text-center text-xs text-[#557067]">
              <Upload className="w-4 h-4 text-[#7d9990] mx-auto mb-1" />
              <span>Attach notes or solution photos (optional, PDF or image)</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#e1ede7]">
              <Button variant="ghost" size="sm" onClick={() => setSubmittingTask(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                isLoading={isSubmitting}
                loadingText="Submitting..."
                onClick={handleConfirmSubmitWork}
              >
                Submit for Teacher Gate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
