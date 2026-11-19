import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Upload,
  Edit3,
  Trash2,
  CalendarCheck,
  ChevronDown,
} from 'lucide-react';
import { ACADEMIC_WEEKS } from '../../components/tests/DailyTestSeriesGrid';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { taskService, DailyTask } from '../../services/taskService';
import { extractDayAndCleanTitle } from '../../services/testService';
import { subjectService } from '../../services/subjectService';
import { mediaService } from '../../services/mediaService';
import { Subject } from '../../types';
import { PDFViewerModal } from '../../components/books/PDFViewerModal';
import { useRole } from '../../hooks/useRole';

export const WeeklyTasksPage: React.FC = () => {
  const { role, user } = useRole();
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pdfTaskTarget, setPdfTaskTarget] = useState<DailyTask | null>(null);

  // Modals state
  const [submittingTask, setSubmittingTask] = useState<DailyTask | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [approvingTask, setApprovingTask] = useState<DailyTask | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState('Excellent attention to detail and rigorous step working. Certified complete.');
  const [isApproving, setIsApproving] = useState(false);

  // PDF Upload & Auto-Schedule Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState('');
  const [genScopeMode, setGenScopeMode] = useState<'entire_book' | 'custom_weeks'>('entire_book');
  const [genSourceTitle, setGenSourceTitle] = useState('Intermediate Computer Science Textbook');
  const [genSubjectId, setGenSubjectId] = useState('sub_01');
  const [genWeeksScope, setGenWeeksScope] = useState<number>(4); // 1, 2, 4, 8
  const [genDailyMinutes, setGenDailyMinutes] = useState<number>(45);
  const [genTasksPerDay, setGenTasksPerDay] = useState<number>(1);
  const [genStartDate, setGenStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [genEnforceSundayOff, setGenEnforceSundayOff] = useState<boolean>(true);
  const [genEnforceHolidays, setGenEnforceHolidays] = useState<boolean>(true);
  const [genCustomTopicsText, setGenCustomTopicsText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Task Creation Modal State
  const [isManualTaskModalOpen, setIsManualTaskModalOpen] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubjectId, setManualSubjectId] = useState('');
  const [manualDueDate, setManualDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [manualMinutes, setManualMinutes] = useState(45);
  const [manualPriority, setManualPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [manualDescription, setManualDescription] = useState('');

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<DailyTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMinutes, setEditMinutes] = useState(45);
  const [editDescription, setEditDescription] = useState('');

  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadData = () => {
    const list = taskService.getTasks();
    setTasks(list);
  };

  useEffect(() => {
    loadData();
    subjectService.fetchSubjects().then((data) => {
      if (data && data.length > 0) {
        setSubjects(data);
        setGenSubjectId(data[0].id);
        setManualSubjectId(data[0].id);
      }
    });
  }, []);

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    // Academic Week Filter
    if (selectedWeek !== 'all') {
      const base = new Date(2026, 10, 17);
      base.setHours(0, 0, 0, 0);
      const taskDate = new Date(t.dueDate);
      taskDate.setHours(0, 0, 0, 0);
      if (!isNaN(taskDate.getTime())) {
        const diffDays = Math.floor((taskDate.getTime() - base.getTime()) / (24 * 3600 * 1000));
        const diffWeeks = Math.floor(diffDays / 7) + 1;
        if (`w${diffWeeks}` !== selectedWeek) return false;
      }
    }
    const matchSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchDay = selectedDay === 'all' || t.dayOfWeek.toLowerCase() === selectedDay.toLowerCase();
    const matchSearch =
      !searchTerm.trim() ||
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

  // Teacher Approves Work
  const handleConfirmApprove = async () => {
    if (!approvingTask) return;
    setIsApproving(true);
    await new Promise((r) => setTimeout(r, 400));
    taskService.approveTask(approvingTask.id, user?.name || 'Ahmad', teacherFeedback);
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

  // File Upload Handler for Modal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedPdfFile(file);
    setUploadedPdfName(file.name);
    setGenSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  // Auto-generate weekly / monthly schedule from PDF or Syllabus with Full Manual Controls
  const handleConfirmGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 500));
    const selectedSubj = subjects.find((s) => s.id === genSubjectId);

    // Save to Media Center if a real file was uploaded
    if (uploadedPdfFile) {
      const ext = uploadedPdfFile.name.split('.').pop()?.toLowerCase();
      const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '');
      const isDoc = ['doc', 'docx'].includes(ext || '');

      mediaService.addMediaItem({
        name: uploadedPdfFile.name,
        originalName: uploadedPdfFile.name,
        category: isImg ? 'image' : 'syllabus',
        fileType: isImg ? 'image' : isDoc ? 'docx' : 'pdf',
        fileSizeBytes: uploadedPdfFile.size,
        uploadedBy: user?.name || (role === 'teacher' ? 'Ahmad' : 'Student Scholar'),
        uploadedByRole: role,
        subjectId: genSubjectId,
        subjectName: selectedSubj?.name || 'Academic Subject',
        subjectCode: selectedSubj?.code || 'SUBJ',
        description: `Uploaded PDF / Syllabus generating ${genWeeksScope}-week daily schedule.`,
        tasksGenerated: true,
      });
    }

    if (genScopeMode === 'entire_book') {
      const res = taskService.generateEntireBookTasksAndDailyTests({
        subjectId: genSubjectId,
        subjectName: selectedSubj?.name || 'Academic Subject',
        subjectCode: selectedSubj?.code || 'SUBJ',
        bookTitle: uploadedPdfName || genSourceTitle || `${selectedSubj?.name} Book`,
        sourceType: uploadedPdfName?.match(/\.(png|jpg|jpeg|webp)$/i) ? 'screenshot' : 'book_pdf',
        totalPages: 240,
        totalChapters: 12,
        studentName: role === 'student' ? (user?.name || 'Student Scholar') : 'Student Scholar',
        startDate: genStartDate || undefined,
      });

      setIsGenerating(false);
      setIsGenerateModalOpen(false);
      setUploadedPdfFile(null);
      setUploadedPdfName('');
      setGenCustomTopicsText('');
      loadData();
      setSuccessToast(
        `🎉 Entire Book daily study tasks (${res.tasks.length} tasks) & Daily Test Series (${res.testsCount} assessments) scheduled through February 28th! Check your schedule & tests desk.`
      );
      setTimeout(() => setSuccessToast(null), 6000);
      return;
    }

    const customTopics = genCustomTopicsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    taskService.generateMonthlyTasksFromSource({
      sourceType: uploadedPdfName?.match(/\.(png|jpg|jpeg|webp)$/i) ? 'screenshot' : 'book_pdf',
      sourceTitle: uploadedPdfName || genSourceTitle,
      subjectId: genSubjectId,
      subjectName: selectedSubj?.name || '1st Year Subject',
      subjectCode: selectedSubj?.code || 'FSC-PED-11',
      studentName: role === 'student' ? (user?.name || 'Student Scholar') : 'Student Scholar',
      totalWeeks: genWeeksScope,
      dailyMinutes: genDailyMinutes,
      tasksPerDay: genTasksPerDay,
      startDate: genStartDate || undefined,
      enforceSundayOff: genEnforceSundayOff,
      enforcePakistanHolidays: genEnforceHolidays,
      customTopics: customTopics.length > 0 ? customTopics : undefined,
    });

    setIsGenerating(false);
    setIsGenerateModalOpen(false);
    setUploadedPdfFile(null);
    setUploadedPdfName('');
    setGenCustomTopicsText('');
    loadData();
    setSuccessToast(
      `Automated ${genWeeksScope}-Week daily study schedule created from "${uploadedPdfName || genSourceTitle}" with Sundays strictly OFF!`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Create Manual Task
  const handleConfirmCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const selectedSubj = subjects.find((s) => s.id === manualSubjectId) || subjects[0];
    taskService.createCustomTask({
      title: manualTitle.trim(),
      description: manualDescription.trim() || `Manual daily task for ${selectedSubj?.name || 'Subject'}`,
      subjectId: selectedSubj?.id || 'sub_01',
      subjectName: selectedSubj?.name || 'Subject',
      dueDate: manualDueDate,
      estimatedMinutes: manualMinutes,
      studentName: role === 'student' ? (user?.name || 'Student Scholar') : 'Student Scholar',
    });

    setIsManualTaskModalOpen(false);
    setManualTitle('');
    setManualDescription('');
    loadData();
    setSuccessToast(`Manual task "${manualTitle}" scheduled successfully.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Edit Task
  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    taskService.updateTask(editingTask.id, {
      title: editTitle.trim(),
      dueDate: editDueDate,
      estimatedMinutes: editMinutes,
      description: editDescription.trim(),
    });

    setEditingTask(null);
    loadData();
    setSuccessToast(`Task updated successfully.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Delete Task
  const handleDeleteTask = (task: DailyTask) => {
    if (window.confirm(`Are you sure you want to remove "${task.title}"?`)) {
      taskService.deleteTask(task.id);
      loadData();
      setSuccessToast(`Task "${task.title}" deleted.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const daysList = [
    { label: 'All Days', value: 'all' },
    { label: 'Monday', value: 'monday' },
    { label: 'Tuesday', value: 'tuesday' },
    { label: 'Wednesday', value: 'wednesday' },
    { label: 'Thursday', value: 'thursday' },
    { label: 'Friday', value: 'friday' },
    { label: 'Saturday', value: 'saturday' },
    { label: 'Sunday (Rest Day OFF)', value: 'sunday' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white font-serif">Weekly Tasks &amp; Daily Schedule</h1>
            <Badge variant="primary" size="sm" dot>
              {tasks.length} Total Targets
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Daily structured tasks derived from syllabus &amp; books. Monday–Saturday active schedule, <strong className="text-zinc-200">Sunday scheduled OFF</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
            onClick={handleScanLateAlerts}
            title="Scan for overdue tasks and trigger automatic email alerts"
          >
            Late Scan
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5 text-zinc-600" />}
            onClick={() => {
              setManualTitle('');
              setManualSubjectId(subjects[0]?.id || 'sub_01');
              setManualDueDate(new Date().toISOString().slice(0, 10));
              setManualMinutes(45);
              setManualDescription('');
              setIsManualTaskModalOpen(true);
            }}
          >
            + Add Task Manually
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setIsGenerateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-200 mr-1" />
            Upload PDF & Auto-Schedule
          </Button>
        </div>
      </div>

      {/* 4 Unified Dropdown Filters (Academic Week, Day of Week, Subject, Status + Quick Search) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Academic Week Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Academic Week
            </label>
            <div className="relative">
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {ACADEMIC_WEEKS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Day of Week Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Day of Week
            </label>
            <div className="relative">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {daysList.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Subject Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Subject ({subjects.length})
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All {subjects.length} Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. Task Status Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Task Status
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Statuses ({tasks.length})</option>
                <option value="pending">In Progress ({pendingCount})</option>
                <option value="submitted_for_approval">Awaiting Teacher Gate ({awaitingApprovalCount})</option>
                <option value="approved">Verified Complete ({approvedCount})</option>
                <option value="overdue">Overdue ({overdueCount})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Bottom Search & Showing Info */}
        <div className="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search targets or topics..."
              className="w-full pl-8 pr-3 h-8 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 text-zinc-800 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="text-[11px] font-semibold text-zinc-500 shrink-0">
            Showing <strong className="text-zinc-900">{filteredTasks.length}</strong> of {tasks.length} targets
          </span>
        </div>
      </div>

      {/* Task Cards Bento Grid: 1-col on mobile, 2-col on sm, 3-col on lg, Latest on top */}
      <div>
        {tasks.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-dashed border-zinc-300 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 font-serif">No Daily Tasks Scheduled Yet</h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Upload your 1st Year FA-IT textbook PDF in the Book Library to break it down into daily reading targets (Sundays strictly OFF).
            </p>
            <div className="pt-2">
              <Link
                to="/library"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>⚡ Upload Book PDF in Library</span>
              </Link>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e1ede7] p-6">
            <CalendarDays className="w-10 h-10 text-[#7d9990] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[#142D27]">No Tasks Found</h3>
            <p className="text-xs text-[#557067] mt-1">
              There are no tasks matching your selected filters. Click &quot;Upload PDF &amp; Auto-Schedule&quot; or &quot;+ Add Task Manually&quot; to create some.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks
              .slice()
              .sort((a, b) => {
                const todayStr = new Date().toISOString().slice(0, 10);
                if (a.dueDate === todayStr && b.dueDate !== todayStr) return -1;
                if (b.dueDate === todayStr && a.dueDate !== todayStr) return 1;
                return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
              })
              .map((task) => {
                const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(task.title);

                if (task.isSundayOff) {
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 select-none min-h-[215px] transition-none flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-sky-100">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                            Sunday Off &bull; Rest Day
                          </span>
                          <span className="text-[10px] text-[#7d9990] font-medium">{task.assignedDate}</span>
                        </div>

                        <div className="mt-3 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                            <Coffee className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#142D27]">
                              {task.title}
                            </h4>
                            <p className="text-xs text-[#557067] mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3.5 border-t border-sky-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-sky-700">Policy Verified</span>
                        <span className="text-[10px] text-[#7d9990]">Zero Deadlines Today</span>
                      </div>
                    </div>
                  );
                }

                if (task.isPakistanHoliday) {
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300 select-none min-h-[215px] transition-none flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-emerald-100">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            🇵🇰 Gazetted Holiday
                          </span>
                          <span className="text-[10px] text-[#7d9990] font-medium">{task.assignedDate}</span>
                        </div>

                        <div className="mt-3 flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 text-base">
                            🇵🇰
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#142D27]">
                              {task.title}
                            </h4>
                            <p className="text-xs text-[#557067] mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3.5 border-t border-emerald-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] font-bold text-emerald-800">Gazetted Off</span>
                        <span className="text-[10px] text-[#7d9990]">Zero Homework Due</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl bg-white border transition-none flex flex-col justify-between shadow-xs select-none min-h-[215px] ${
                      task.status === 'approved'
                        ? 'border-emerald-300'
                        : task.status === 'submitted_for_approval'
                        ? 'border-amber-300'
                        : task.status === 'overdue'
                        ? 'border-rose-300'
                        : 'border-zinc-200'
                    }`}
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
                          {task.assignedDate}
                        </span>
                      </div>

                      {/* Subject Name & Title in Authentic Urdu */}
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

                      {/* Description & Pages Range Snippet */}
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs space-y-1">
                        <p className="text-[#557067] line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-[#e1ede7] text-[10px] text-[#7d9990]">
                          <span>{task.pagesRange ? `Coverage: ${task.pagesRange}` : 'Daily Quota'}</span>
                          <span>{task.estimatedMinutes || 45} mins</span>
                        </div>
                      </div>

                      {/* Student submission notes or teacher feedback excerpt */}
                      {task.approval?.feedback && (
                        <div className="mt-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 text-[11px] text-emerald-900 italic">
                          <strong>Verification:</strong> &quot;{task.approval.feedback}&quot;
                        </div>
                      )}
                    </div>

                    {/* Bottom Actions & Status Footer */}
                    <div className="pt-3.5 mt-3.5 border-t border-[#e1ede7] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        {task.status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Approved
                          </span>
                        ) : task.status === 'submitted_for_approval' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Awaiting Review
                          </span>
                        ) : task.status === 'overdue' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Late
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#557067] px-2 py-0.5 rounded-full bg-zinc-100">
                            Pending Work
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setPdfTaskTarget(task)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View in PDF</span>
                        </button>
                      </div>

                      {/* Main Action CTAs */}
                      <div className="flex items-center gap-2 pt-1">
                        {task.status !== 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 justify-center text-xs"
                            onClick={() => {
                              setSubmittingTask(task);
                              setSubmissionNotes('');
                              setSubmissionFileName('');
                            }}
                          >
                            {task.status === 'submitted_for_approval' ? 'Update Work' : 'Submit Work'}
                          </Button>
                        )}

                        {role === 'teacher' && task.status === 'submitted_for_approval' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1 justify-center text-xs font-bold"
                            icon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => {
                              setApprovingTask(task);
                              setTeacherFeedback('Excellent attention to detail. Certified complete.');
                            }}
                          >
                            Approve
                          </Button>
                        )}

                        {/* Edit & Delete Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTask(task);
                              setEditTitle(task.title);
                              setEditDueDate(task.dueDate);
                              setEditMinutes(task.estimatedMinutes);
                              setEditDescription(task.description);
                            }}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            title="Edit Task"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(task)}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
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
                Attached Exercise Solutions Sheet / PDF:
              </label>
              <input
                type="text"
                value={submissionFileName}
                onChange={(e) => setSubmissionFileName(e.target.value)}
                placeholder="stewart_calculus_ch4_solutions.pdf"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
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
                Submit for Teacher Approval
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Teacher Approve Work Modal */}
      <Modal
        isOpen={!!approvingTask}
        onClose={() => setApprovingTask(null)}
        title="Teacher Verification Gate"
        description={approvingTask ? `Reviewing submission for "${approvingTask.title}"` : ''}
      >
        {approvingTask && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                Student Submission Received:
              </span>
              <p className="text-xs text-[#263B35] font-semibold mt-1">
                "{approvingTask.studentSubmission?.notes || 'Student marked exercises completed.'}"
              </p>
              {approvingTask.studentSubmission?.attachmentName && (
                <p className="text-[11px] text-amber-900 mt-1">
                  📎 File: <strong>{approvingTask.studentSubmission.attachmentName}</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Teacher Feedback & Evaluation Remarks:
              </label>
              <textarea
                rows={3}
                value={teacherFeedback}
                onChange={(e) => setTeacherFeedback(e.target.value)}
                placeholder="Enter evaluation notes..."
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
                loadingText="Certifying..."
              >
                Approve & Certify Complete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* ADVANCED MODAL: Upload PDF & Auto-Schedule (Manual Controls) */}
      {/* ======================================================== */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Upload PDF & Auto-Schedule Daily Tasks"
        description="Upload your textbook PDF, syllabus document, or photo. Configure manual controls to automate structured daily study tasks."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Step 1: File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              1. Select Syllabus / Textbook PDF or Photo
            </label>
            <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 hover:bg-emerald-50/20 hover:border-emerald-500 cursor-pointer transition-colors text-center">
              <Upload className="w-7 h-7 text-zinc-400 mb-1.5" />
              <span className="text-xs font-bold text-zinc-800">
                {uploadedPdfName || 'Click to select or drag & drop PDF / Doc / Image'}
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Supports .pdf, .docx, .doc, .png, .jpg, .jpeg, .webp (up to 25MB)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Fallback title input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Source Name / Course Reference:
            </label>
            <input
              type="text"
              value={genSourceTitle}
              onChange={(e) => setGenSourceTitle(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Physics 1st Year Punjab Board Syllabus"
            />
          </div>

          {/* Strategy Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              2. Choose Auto-Scheduling Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setGenScopeMode('entire_book')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  genScopeMode === 'entire_book'
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5 text-zinc-900">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Entire Book + Daily Test Series
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white uppercase">
                    Feb 28 Sprint
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                  Automates all chapters through Feb 28th + creates 50-mark Daily Tests on the subject's designated timetable day.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setGenScopeMode('custom_weeks')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  genScopeMode === 'custom_weeks'
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500/20 text-emerald-950 shadow-xs'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-zinc-900">
                    ⏱️ Custom Weeks (1 to 8 Weeks)
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700">
                    Sprint
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                  Customize the duration, number of tasks per day, and specify manual custom topics override.
                </p>
              </button>
            </div>
          </div>

          {/* Subject & Time Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Target Subject:
              </label>
              <select
                value={genSubjectId}
                onChange={(e) => setGenSubjectId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {genScopeMode === 'custom_weeks' ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Schedule Time Scope:
                </label>
                <select
                  value={genWeeksScope}
                  onChange={(e) => setGenWeeksScope(parseInt(e.target.value) || 4)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={1}>1 Week (7 Days Sprint)</option>
                  <option value={2}>2 Weeks (14 Days Intensive)</option>
                  <option value={4}>4 Weeks / 1 Month (28 Days - Standard)</option>
                  <option value={8}>8 Weeks (Full Semester Blueprint)</option>
                </select>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs flex flex-col justify-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide">
                  Timetable Active
                </span>
                <span className="font-semibold text-emerald-950 mt-0.5">
                  14 Weeks &bull; Nov 2026 to Feb 28, 2027
                </span>
              </div>
            )}
          </div>

          {/* Duration & Tasks per day */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Daily Duration:
              </label>
              <select
                value={genDailyMinutes}
                onChange={(e) => setGenDailyMinutes(parseInt(e.target.value) || 45)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value={30}>30 Mins (Quick Review)</option>
                <option value={45}>45 Mins (Standard)</option>
                <option value={60}>60 Mins (Deep Study)</option>
                <option value={90}>90 Mins (Intensive Prep)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Tasks Per Study Day:
              </label>
              <select
                value={genTasksPerDay}
                onChange={(e) => setGenTasksPerDay(parseInt(e.target.value) || 1)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>1 Task (Theory Reading)</option>
                <option value={2}>2 Tasks (Theory + Exercises)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Schedule Start Date:
              </label>
              <input
                type="date"
                value={genStartDate}
                onChange={(e) => setGenStartDate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Manual Control Checkboxes */}
          <div className="space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={genEnforceSundayOff}
                onChange={(e) => setGenEnforceSundayOff(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
              />
              <span className="font-semibold text-zinc-900">
                Sundays Strictly OFF (Mandatory Rest & Notes Revision)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={genEnforceHolidays}
                onChange={(e) => setGenEnforceHolidays(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
              />
              <span className="font-semibold text-zinc-900">
                🇵🇰 Observe Pakistan Gazetted Public Holidays (Zero Homework)
              </span>
            </label>
          </div>

          {/* Optional Topic Breakdown Override */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700">
                Custom Topic Breakdown (Optional Manual Override):
              </label>
              <span className="text-[10px] text-zinc-400">One topic per line</span>
            </div>
            <textarea
              rows={3}
              value={genCustomTopicsText}
              onChange={(e) => setGenCustomTopicsText(e.target.value)}
              placeholder="Module 1: Vectors & Equilibrium&#10;Module 2: Newton's Laws & Friction&#10;Module 3: Work, Energy & Power Theorem&#10;Module 4: Circular Dynamics & Centripetal Acceleration"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="ghost" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmGenerate}
              isLoading={isGenerating}
              loadingText="Automating Schedule..."
            >
              Generate Daily Tasks (Sundays OFF)
            </Button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: + Add Custom Task Manually */}
      {/* ======================================================== */}
      <Modal
        isOpen={isManualTaskModalOpen}
        onClose={() => setIsManualTaskModalOpen(false)}
        title="Add Custom Daily Task Manually"
        description="Schedule a specific target for any subject with custom due date and study duration."
      >
        <form onSubmit={handleConfirmCreateManualTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Title:
            </label>
            <input
              type="text"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g., Solve Integration by Parts practice problems 1 to 10"
              className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Subject:
              </label>
              <select
                value={manualSubjectId}
                onChange={(e) => setManualSubjectId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Due Date:
              </label>
              <input
                type="date"
                value={manualDueDate}
                onChange={(e) => setManualDueDate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Estimated Duration (Mins):
              </label>
              <input
                type="number"
                min="15"
                max="240"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(parseInt(e.target.value) || 45)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Priority:
              </label>
              <select
                value={manualPriority}
                onChange={(e) => setManualPriority(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority (Exam Milestone)</option>
                <option value="low">Low Priority (Optional Revision)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Task Instructions / Notes:
            </label>
            <textarea
              rows={2}
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Add specific instructions for this study session..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsManualTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL: Edit Task Manually */}
      {/* ======================================================== */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Daily Task"
        description="Update target title, scheduled date, or required duration."
      >
        {editingTask && (
          <form onSubmit={handleSaveEditTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Task Title:
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Scheduled Date:
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Duration (Mins):
                </label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(parseInt(e.target.value) || 45)}
                  className="w-full h-9 px-3 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Description / Target Notes:
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        )}
            </Modal>

      {/* PDF Textbook Reader Modal with Attached Pages */}
      {pdfTaskTarget && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setPdfTaskTarget(null)}
          testTitle={pdfTaskTarget.title}
          subjectCode={pdfTaskTarget.subjectCode}
          subjectName={pdfTaskTarget.subjectName}
          pagesRange={pdfTaskTarget.pagesRange}
          syllabusCoverage={pdfTaskTarget.description}
        />
      )}
    </div>
  );
};
