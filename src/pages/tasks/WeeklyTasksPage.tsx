import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BookOpen,
  Coffee,
  Check,
  PlusCircle,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { taskService, DailyTask } from '../../services/taskService';
import { subjectService } from '../../services/subjectService';
import { Subject } from '../../types';
import { useRole } from '../../hooks/useRole';

export const WeeklyTasksPage: React.FC = () => {
  const { role, user } = useRole();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [submittingTask, setSubmittingTask] = useState<DailyTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [approvingTask, setApprovingTask] = useState<DailyTask | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('Excellent attention to detail and rigorous step working. Certified complete.');
  const [isApproving, setIsApproving] = useState(false);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genSourceTitle, setGenSourceTitle] = useState('Stewart Calculus (9th Edition)');
  const [genSubjectId, setGenSubjectId] = useState('sub_01');
  const [genPagesCount, setGenPagesCount] = useState(120);
  const [isGenerating, setIsGenerating] = useState(false);

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    const list = taskService.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    loadData();
    subjectService.fetchSubjects().then((data) => {
      if (data && data.length > 0) setSubjects(data);
    });
  }, []);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    const matchSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchDay = selectedDay === 'all' || t.dayOfWeek.toLowerCase() === selectedDay.toLowerCase();
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchStatus && matchDay && matchSearch;
  });

  // Status counts
  const pendingCount = tasks.filter((t) => t.status === 'pending' && !t.isSundayOff).length;
  const awaitingApprovalCount = tasks.filter((t) => t.status === 'submitted_for_approval').length;
  const approvedCount = tasks.filter((t) => t.status === 'approved' && !t.isSundayOff).length;
  const overdueCount = tasks.filter((t) => t.status === 'overdue').length;

  // Student Submits Work for Teacher Verification
  const handleConfirmSubmitWork = async () => {
    if (!submittingTask) return;
    setIsSubmittingWork(true);
    await new Promise((r) => setTimeout(r, 400));
    taskService.submitTaskForApproval(
      submittingTask.id,
      submissionNotes,
      submissionFileName || 'exercise_solutions.pdf'
    );
    setIsSubmittingWork(false);
    setSubmittingTask(null);
    setSubmissionNotes('');
    setSubmissionFileName('');
    loadData();
    setSuccessToast(`Work submitted! Now awaiting official teacher approval.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Teacher Approves Work (Gate: Work is ONLY done when teacher approves!)
  const handleConfirmApprove = async () => {
    if (!approvingTask) return;
    setIsApproving(true);
    await new Promise((r) => setTimeout(r, 400));
    taskService.approveTask(approvingTask.id, user?.name || 'Ahmad WebCore', teacherFeedback);
    setIsApproving(false);
    setApprovingTask(null);
    loadData();
    setSuccessToast(`Work approved & certified! Counted toward verified academic progress.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Scan for Late Tasks and Dispatch Automatic Alerts
  const handleScanLateAlerts = () => {
    const { alertedCount } = taskService.checkAndDispatchLateAlerts();
    loadData();
    if (alertedCount > 0) {
      setSuccessToast(`Late scan complete: ${alertedCount} automated overdue alert(s) dispatched to student Gmail!`);
    } else {
      setSuccessToast(`Late scan complete: All tasks are current and on schedule.`);
    }
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Auto-generate weekly schedule from Book / Syllabus
  const handleConfirmGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const selectedSubj = subjects.find((s) => s.id === genSubjectId);
    taskService.generateDailyTasksFromSource({
      sourceType: 'book_pdf',
      sourceTitle: genSourceTitle,
      subjectId: genSubjectId,
      subjectName: selectedSubj?.name || 'Advanced Calculus & Vectors',
      subjectCode: selectedSubj?.code || 'MATH-301',
      totalPagesOrTopics: genPagesCount,
      startPage: 1,
    });
    setIsGenerating(false);
    setIsGenerateModalOpen(false);
    loadData();
    setSuccessToast(`Weekly schedule generated from "${genSourceTitle}" (Monday-Saturday active, Sunday OFF)!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const daysList = [
    { label: 'All Days', value: 'all' },
    { label: 'Mon', value: 'monday' },
    { label: 'Tue', value: 'tuesday' },
    { label: 'Wed', value: 'wednesday' },
    { label: 'Thu', value: 'thursday' },
    { label: 'Fri', value: 'friday' },
    { label: 'Sat', value: 'saturday' },
    { label: 'Sun (Off)', value: 'sunday' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#142D27] flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-[#557067] hover:text-[#142D27]">
            &times;
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Weekly Tasks & Daily Schedule</h1>
            <Badge variant="primary" size="sm" dot>
              {tasks.length} Total Targets
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#557067] mt-1">
            Daily structured tasks derived from syllabus & books. Monday–Saturday active schedule, <strong>Sunday scheduled OFF</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
            onClick={handleScanLateAlerts}
            title="Scan for overdue tasks and trigger automatic email alerts"
          >
            Check Late Alerts
          </Button>

          {role === 'teacher' && (
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-3.5 h-3.5" />}
              onClick={() => setIsGenerateModalOpen(true)}
            >
              Generate from Source
            </Button>
          )}
        </div>
      </div>

      {/* Status Summary Bento Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Awaiting Approval
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-amber-700">{awaitingApprovalCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Teacher Gate
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Verified Complete
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-emerald-700">{approvedCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Approved
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-bold text-[#7d9990] uppercase tracking-wider block">
            Pending Student
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-extrabold text-[#263B35]">{pendingCount}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
              In Progress
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7]">
          <span className="text-[11px] font-bold text-[#7d9990] uppercase tracking-wider block">
            🇵🇰 Off Days Policy
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-[#142D27]">Sunday & Holidays</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Mandatory Off
            </span>
          </div>
        </div>
      </div>

      {/* Overdue Alert Strip */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              {overdueCount} task{overdueCount > 1 ? 's are' : ' is'} overdue past the daily deadline. Automated reminder dispatches are active.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
            Overdue Alert
          </span>
        </div>
      )}

      {/* Filter and Day Ribbon */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search daily tasks, topics, chapter or book..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter tasks by subject"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          aria-label="Filter tasks by status"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">In Progress (Pending)</option>
          <option value="submitted_for_approval">Awaiting Teacher Approval</option>
          <option value="approved">Teacher Approved & Verified</option>
          <option value="overdue">Overdue / Late Alert</option>
        </select>
      </div>

      {/* Days of Week Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {daysList.map((d) => (
          <button
            key={d.value}
            onClick={() => setSelectedDay(d.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === d.value
                ? 'bg-[#142D27] text-white'
                : d.value === 'sunday'
                ? 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e1ede7] p-8">
            <CalendarDays className="w-10 h-10 text-[#7d9990] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[#142D27]">No Tasks Found</h3>
            <p className="text-xs text-[#557067] mt-1">
              There are no tasks matching your selected filters.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            if (task.isSundayOff) {
              return (
                /* Sunday OFF Dedicated Card */
                <div
                  key={task.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50/70 via-emerald-50/40 to-white border border-sky-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
                      <Coffee className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          Sunday Off • Rest Day
                        </span>
                        <span className="text-xs font-semibold text-[#7d9990]">{task.assignedDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#142D27] mt-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#557067] mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-[11px] font-bold text-sky-700 block">
                      Policy Verified
                    </span>
                    <span className="text-[10px] text-[#7d9990]">Zero Deadlines Today</span>
                  </div>
                </div>
              );
            }

            if (task.isPakistanHoliday) {
              return (
                /* Pakistan Gazetted Holiday Card */
                <div
                  key={task.id}
                  className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-[#f0f9f4] to-white border border-emerald-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 text-lg">
                      🇵🇰
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                          🇵🇰 Pakistan Gazetted Holiday
                        </span>
                        {task.urduName && (
                          <span className="text-xs font-bold text-emerald-700">{task.urduName}</span>
                        )}
                        <span className="text-xs font-semibold text-[#7d9990]">{task.assignedDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#142D27] mt-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#557067] mt-0.5 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-[11px] font-bold text-emerald-800 block">
                      Gazetted Off Day
                    </span>
                    <span className="text-[10px] text-[#7d9990]">Zero Homework Due</span>
                  </div>
                </div>
              );
            }

            return (
              /* Regular Weekday Task Card */
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  task.status === 'approved'
                    ? 'border-emerald-200/80'
                    : task.status === 'submitted_for_approval'
                    ? 'border-amber-300 bg-amber-50/20'
                    : task.status === 'overdue'
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-[#e1ede7] hover:border-[#14B866]/40'
                }`}
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      task.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : task.status === 'submitted_for_approval'
                        ? 'bg-amber-100 text-amber-700'
                        : task.status === 'overdue'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-[#E7EFEA] text-[#142D27]'
                    }`}
                  >
                    {task.status === 'approved' ? (
                      <Check className="w-5 h-5 text-emerald-600" />
                    ) : task.status === 'submitted_for_approval' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : task.status === 'overdue' ? (
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-[#14B866]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E7EFEA] text-[#142D27]">
                        {task.subjectCode}
                      </span>
                      <span className="text-[11px] font-bold text-[#557067]">
                        {task.dayOfWeek} • {task.assignedDate}
                      </span>
                      {task.pagesRange && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                          {task.pagesRange}
                        </span>
                      )}
                      <span className="text-[10px] text-[#7d9990]">
                        ({task.estimatedMinutes} mins)
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#142D27] mt-1 truncate">
                      {task.title}
                    </h4>
                    <p className="text-xs text-[#557067] mt-0.5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Source label */}
                    <p className="text-[11px] text-[#7d9990] mt-1">
                      Source: <strong>{task.sourceTitle}</strong>
                    </p>

                    {/* Student notes or teacher feedback excerpt if available */}
                    {task.studentSubmission?.notes && (
                      <div className="mt-2 text-xs bg-[#F7F9F8] p-2 rounded-lg border border-[#e1ede7] text-[#263B35]">
                        <strong>Student Work Log:</strong> "{task.studentSubmission.notes}"
                      </div>
                    )}
                    {task.approval?.feedback && (
                      <div className="mt-1.5 text-xs bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/60 text-emerald-900">
                        <strong>Teacher Verification:</strong> "{task.approval.feedback}" ({task.approval.approvedBy})
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Status Pill & Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#e1ede7]">
                  {/* Status Badge */}
                  <div>
                    {task.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Teacher Approved
                      </span>
                    ) : task.status === 'submitted_for_approval' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Teacher Gate
                      </span>
                    ) : task.status === 'overdue' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Late • Alert Sent
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-[#557067] px-2.5 py-1 rounded-full bg-zinc-100">
                        Pending Student Work
                      </span>
                    )}
                  </div>

                  {/* Actions based on Role and Status */}
                  <div className="flex items-center gap-2">
                    {/* Student Action: Submit Work */}
                    {task.status !== 'approved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSubmittingTask(task);
                          setSubmissionNotes('');
                          setSubmissionFileName('');
                        }}
                      >
                        {task.status === 'submitted_for_approval' ? 'Update Submission' : 'Submit Work'}
                      </Button>
                    )}

                    {/* Teacher Action: Approve Work (Teacher Gate) */}
                    {role === 'teacher' && task.status === 'submitted_for_approval' && (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Check className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setApprovingTask(task);
                          setTeacherFeedback('Excellent attention to detail and rigorous step working. Certified complete.');
                        }}
                      >
                        Approve Work
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Submit Work Modal */}
      <Modal
        isOpen={!!submittingTask}
        onClose={() => setSubmittingTask(null)}
        title="Submit Daily Task for Review"
        description={submittingTask ? `Submitting work for "${submittingTask.title}"` : ''}
      >
        {submittingTask && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
              <p className="text-xs text-[#557067]">Required Target:</p>
              <p className="text-xs font-bold text-[#142D27]">{submittingTask.title}</p>
              <p className="text-[11px] text-[#7d9990] mt-0.5">{submittingTask.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Student Work Summary / Notes:
              </label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="E.g., Read pages 45 to 65 and completed assigned equations 1 through 6..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Attach Document or Solution PDF (Optional):
              </label>
              <input
                type="text"
                value={submissionFileName}
                onChange={(e) => setSubmissionFileName(e.target.value)}
                placeholder="e.g. daily_solutions_stokes_theorem.pdf"
                className="w-full h-10 px-3 rounded-xl border border-[#e1ede7] text-xs"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Teacher Approval Policy:</strong> Your submission will enter the faculty review gate. Your progress will not be marked as complete until your teacher reviews and approves the work.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSubmittingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSubmitWork}
                isLoading={isSubmittingWork}
                loadingText="Submitting..."
              >
                Send for Teacher Approval
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Teacher Approve Modal */}
      <Modal
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        title="Teacher Approval Gate"
        description={approvingTask ? `Review and certify student work for "${approvingTask.title}"` : ''}
      >
        {approvingTask && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
              <p className="text-xs text-[#557067]">Student Submission:</p>
              <p className="text-xs font-bold text-[#142D27] mt-0.5">
                "{approvingTask.studentSubmission?.notes || 'Completed assigned daily reading.'}"
              </p>
              <p className="text-[11px] text-[#7d9990] mt-1">
                Submitted at: {approvingTask.studentSubmission?.submittedAt}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Teacher Verification Remarks:
              </label>
              <textarea
                rows={2}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setApprovingTask(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmApprove}
                isLoading={isApproving}
                loadingText="Approving..."
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Approve & Mark Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Auto-Generate Weekly Schedule Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Auto-Generate Weekly Task Schedule"
        description="Breaks down textbook or syllabus content into daily weekday tasks with Sunday OFF."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Source Material (PDF / Syllabus Title):
            </label>
            <input
              type="text"
              value={genSourceTitle}
              onChange={(e) => setGenSourceTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#e1ede7] text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Target Subject:
              </label>
              <select
                value={genSubjectId}
                onChange={(e) => setGenSubjectId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#e1ede7] text-xs"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Total Pages / Chapters:
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={genPagesCount}
                onChange={(e) => setGenPagesCount(parseInt(e.target.value) || 60)}
                className="w-full h-10 px-3 rounded-xl border border-[#e1ede7] text-xs font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            ✨ <strong>Automated Schedule:</strong> Creates daily weekday assignments (Monday through Saturday). <strong>Sunday is explicitly configured as a scheduled rest day (Sunday OFF)</strong>.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmGenerate}
              isLoading={isGenerating}
              loadingText="Generating Schedule..."
            >
              Generate Weekly Tasks
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
