import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Circle,
  Trash2,
  Edit3,
  CheckCircle,
  FileText,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  StudySession,
  StudyPlan,
  Subject,
  SyllabusUnit,
  Student,
  StudySessionStatus,
} from '../../types';
import { useRole } from '../../hooks/useRole';
import { plannerService } from '../../services/plannerService';
import { subjectService } from '../../services/subjectService';
import { syllabusService } from '../../services/syllabusService';
import { studentService } from '../../services/studentService';
import { SAMPLE_TODAY_SCHEDULE, SAMPLE_STUDY_PLANS, SAMPLE_SUBJECTS, SAMPLE_STUDENTS_LIST } from '../../data/sampleData';
import { FebruarySprintTracker } from '../../components/planner/FebruarySprintTracker';

// Form Schemas
const sessionSchema = z.object({
  title: z.string().min(3, 'Session title must be at least 3 characters'),
  subjectId: z.string().min(1, 'Please select a subject'),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  sessionDate: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  durationMinutes: z.number().min(15, 'Min 15 minutes').max(360, 'Max 360 minutes'),
  type: z.enum(['Lecture', 'Practice Lab', 'Revision', 'Self Study', 'Reading', 'Problem Solving']),
  locationOrLink: z.string().min(1, 'Location or link is required'),
  notes: z.string().optional(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const planSchema = z.object({
  studentId: z.string().min(1, 'Select a student'),
  title: z.string().min(3, 'Plan title must be at least 3 characters'),
  weeklyGoal: z.string().min(5, 'Weekly goal is required'),
  dailyTargetHours: z.number().min(0.5, 'Min 0.5 hours').max(12, 'Max 12 hours'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  teacherNotes: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

export const StudyPlannerPage: React.FC = () => {
  const { role, user } = useRole();
  const [activeTab, setActiveTab] = useState<'calendar' | 'plans'>('calendar');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-12');
  const [sessions, setSessions] = useState<StudySession[]>(SAMPLE_TODAY_SCHEDULE);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(SAMPLE_STUDY_PLANS);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [units, setUnits] = useState<SyllabusUnit[]>([]);
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);

  // Modals state
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [deletingSession, setDeletingSession] = useState<StudySession | null>(null);
  const [notesModalSession, setNotesModalSession] = useState<StudySession | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [selectedSubjectIdForUnits, setSelectedSubjectIdForUnits] = useState<string>('');

  // Initial Data Load
  useEffect(() => {
    let mounted = true;
    Promise.all([
      plannerService.fetchSessions({ studentId: role === 'student' ? user.id : undefined }),
      plannerService.fetchStudyPlans(role === 'student' ? user.id : undefined),
      subjectService.fetchSubjects(),
      studentService.fetchStudents(),
    ]).then(([sessData, plansData, subjData, studData]) => {
      if (mounted) {
        if (sessData && sessData.length > 0) setSessions(sessData);
        if (plansData && plansData.length > 0) setStudyPlans(plansData);
        if (subjData && subjData.length > 0) setSubjects(subjData);
        if (studData && studData.length > 0) setStudents(studData);
      }
    });

    return () => {
      mounted = false;
    };
  }, [role, user.id]);

  // Load syllabus units when subject changes in session modal
  useEffect(() => {
    if (selectedSubjectIdForUnits) {
      syllabusService.fetchHierarchicalSyllabus(selectedSubjectIdForUnits).then((data) => {
        setUnits(data);
      });
    } else {
      setUnits([]);
    }
  }, [selectedSubjectIdForUnits]);

  // Session Form
  const {
    register: registerSession,
    handleSubmit: handleSessionSubmit,
    reset: resetSession,
    setValue: setSessionValue,
    watch: watchSession,
    formState: { errors: sessionErrors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      subjectId: subjects[0]?.id || '',
      sessionDate: selectedDate,
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      durationMinutes: 90,
      type: 'Self Study',
      locationOrLink: 'Library Quiet Pod A',
      notes: '',
    },
  });

  // Watch subjectId in form to populate units
  const watchedSubjectId = watchSession('subjectId');
  useEffect(() => {
    if (watchedSubjectId) {
      setSelectedSubjectIdForUnits(watchedSubjectId);
    }
  }, [watchedSubjectId]);

  // Plan Form
  const {
    register: registerPlan,
    handleSubmit: handlePlanSubmit,
    reset: resetPlan,
    formState: { errors: planErrors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      studentId: students[0]?.id || '',
      title: 'Target Revision & Practice Block',
      weeklyGoal: 'Consolidate core calculus formulas and quantum optics derivations.',
      dailyTargetHours: 3.5,
      startDate: '2026-11-09',
      endDate: '2026-11-15',
      teacherNotes: 'Prioritize questions with vector parameterization.',
    },
  });

  // Open Add Session Modal
  const handleOpenAddSession = () => {
    setEditingSession(null);
    resetSession({
      title: '',
      subjectId: subjects[0]?.id || '',
      sessionDate: selectedDate,
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      durationMinutes: 90,
      type: 'Self Study',
      locationOrLink: 'Library Quiet Pod A',
      notes: '',
    });
    setIsSessionModalOpen(true);
  };

  // Open Edit Session Modal
  const handleOpenEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionValue('title', session.title);
    setSessionValue('subjectId', session.subjectId || subjects[0]?.id || '');
    setSessionValue('unitId', session.unitId || '');
    setSessionValue('topicId', session.topicId || '');
    setSessionValue('sessionDate', session.sessionDate);
    setSessionValue('startTime', session.startTime);
    setSessionValue('endTime', session.endTime);
    setSessionValue('durationMinutes', session.durationMinutes);
    setSessionValue('type', session.type);
    setSessionValue('locationOrLink', session.locationOrLink || session.roomOrLink || '');
    setSessionValue('notes', session.notes || '');
    setIsSessionModalOpen(true);
  };

  // Submit Session Form (Create or Edit)
  const onSaveSession = async (data: SessionFormData) => {
    const selectedSubj = subjects.find((s) => s.id === data.subjectId);

    if (editingSession) {
      await plannerService.updateSession(editingSession.id, {
        title: data.title,
        subjectId: data.subjectId,
        subjectName: selectedSubj?.name,
        subjectCode: selectedSubj?.code,
        unitId: data.unitId,
        topicId: data.topicId,
        sessionDate: data.sessionDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        type: data.type,
        locationOrLink: data.locationOrLink,
        notes: data.notes,
      });

      setSessions((prev) =>
        prev.map((s) =>
          s.id === editingSession.id
            ? {
                ...s,
                title: data.title,
                subjectId: data.subjectId,
                subjectName: selectedSubj?.name || s.subjectName,
                subjectCode: selectedSubj?.code || s.subjectCode,
                sessionDate: data.sessionDate,
                startTime: data.startTime,
                endTime: data.endTime,
                durationMinutes: data.durationMinutes,
                type: data.type,
                locationOrLink: data.locationOrLink,
                roomOrLink: data.locationOrLink,
                notes: data.notes,
              }
            : s
        )
      );
      setSuccessToast(`Session "${data.title}" updated successfully!`);
    } else {
      const { session } = await plannerService.createSession({
        studentId: role === 'student' ? user.id : undefined,
        subjectId: data.subjectId,
        subjectName: selectedSubj?.name,
        subjectCode: selectedSubj?.code,
        unitId: data.unitId,
        topicId: data.topicId,
        title: data.title,
        sessionDate: data.sessionDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
        type: data.type,
        locationOrLink: data.locationOrLink,
        notes: data.notes,
        createdBy: user.id,
      });

      if (session) {
        setSessions((prev) => [session, ...prev]);
      }
      setSuccessToast(`New study session "${data.title}" added to planner!`);
    }

    setIsSessionModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Delete Session
  const handleDeleteSessionConfirm = async () => {
    if (!deletingSession) return;
    await plannerService.deleteSession(deletingSession.id);
    setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
    setSuccessToast(`Session "${deletingSession.title}" removed.`);
    setDeletingSession(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Toggle Session Completion Status
  const handleToggleStatus = async (session: StudySession) => {
    const nextStatus: StudySessionStatus =
      session.status === 'completed' ? 'upcoming' : 'completed';

    await plannerService.toggleSessionStatus(session.id, nextStatus);

    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, status: nextStatus } : s))
    );

    setSuccessToast(
      nextStatus === 'completed'
        ? `Session "${session.title}" marked completed!`
        : `Session "${session.title}" reset to scheduled.`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Create Study Plan
  const onCreatePlan = async (data: PlanFormData) => {
    const targetStudent = students.find((s) => s.id === data.studentId);
    const { plan } = await plannerService.createStudyPlan({
      studentId: data.studentId,
      studentName: targetStudent?.name,
      teacherId: user.id,
      title: data.title,
      weeklyGoal: data.weeklyGoal,
      dailyTargetHours: data.dailyTargetHours,
      startDate: data.startDate,
      endDate: data.endDate,
      teacherNotes: data.teacherNotes,
    });

    if (plan) {
      setStudyPlans((prev) => [plan, ...prev]);
    }
    setIsPlanModalOpen(false);
    resetPlan();
    setSuccessToast(`Study plan dispatched to ${targetStudent?.name || 'student'}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Approve / Reject Plan
  const handlePlanStatusChange = async (planId: string, status: 'approved' | 'rejected') => {
    await plannerService.updatePlanStatus(planId, status);
    setStudyPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, status } : p))
    );
    setSuccessToast(`Plan ${status === 'approved' ? 'approved' : 'rejected'}.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Compute Daily Progress
  const daySessions = sessions.filter((s) => s.sessionDate === selectedDate);
  const completedMinutes = daySessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, curr) => acc + (curr.durationMinutes || 90), 0);
  const targetMinutes = 210; // 3.5 hrs
  const progressPercent = Math.min(100, Math.round((completedMinutes / targetMinutes) * 100));

  // Week Days (Nov 09 to Nov 15, 2026)
  const weekDays = [
    { label: 'Mon', date: '2026-11-09' },
    { label: 'Tue', date: '2026-11-10' },
    { label: 'Wed', date: '2026-11-11' },
    { label: 'Thu', date: '2026-11-12' },
    { label: 'Fri', date: '2026-11-13' },
    { label: 'Sat', date: '2026-11-14' },
    { label: 'Sun', date: '2026-11-15' },
  ];

  // Month Days (Nov 2026: 30 days)
  const monthDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-11-${dayNum.toString().padStart(2, '0')}`;
    const daySessionsList = sessions.filter((s) => s.sessionDate === dateStr);
    return {
      day: dayNum,
      date: dateStr,
      sessions: daySessionsList,
    };
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#142D27] flex items-center justify-between text-xs font-semibold shadow-sm animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#14B866]" />
            {successToast}
          </span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-zinc-400 hover:text-zinc-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Daily Study Planner & Timetable</h1>
            <Badge variant="primary" size="sm" dot>
              {role === 'teacher' ? 'Faculty Planner' : 'Student Calendar'}
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Structured timetable for interactive lectures, laboratory experiments, syllabus revision, and target milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'teacher' && (
            <Button
              variant="outline"
              icon={<Target className="w-4 h-4 text-[#14B866]" />}
              onClick={() => setIsPlanModalOpen(true)}
            >
              Assign Study Plan
            </Button>
          )}

          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={handleOpenAddSession}
          >
            Schedule Session
          </Button>
        </div>
      </div>

      {/* 3-Month Target Sprint & Daily Book Quota Engine */}
      <FebruarySprintTracker />

      {/* Navigation Tabs: Calendar vs Study Plans */}
      <div className="flex items-center justify-between gap-4 border-b border-[#e1ede7] pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'bg-[#142D27] text-white shadow-sm'
                : 'text-[#557067] hover:bg-[#E7EFEA]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Calendar & Timetable
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-[#142D27] text-white shadow-sm'
                : 'text-[#557067] hover:bg-[#E7EFEA]'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            {role === 'teacher' ? 'Cohort Study Plans' : 'My Weekly Targets'}
            <Badge variant="neutral" size="sm">
              {studyPlans.length}
            </Badge>
          </button>
        </div>

        {activeTab === 'calendar' && (
          <div className="flex items-center bg-[#F7F9F8] p-1 rounded-xl border border-[#e1ede7]">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day' ? 'bg-white text-[#142D27] shadow-sm' : 'text-[#7d9990]'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white text-[#142D27] shadow-sm' : 'text-[#7d9990]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'month' ? 'bg-white text-[#142D27] shadow-sm' : 'text-[#7d9990]'
              }`}
            >
              Monthly
            </button>
          </div>
        )}
      </div>

      {/* VIEW: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          {/* Progress Tracker Widget */}
          <Card className="p-4 bg-gradient-to-r from-white via-white to-[#F7F9F8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E7EFEA] flex items-center justify-center text-[#14B866]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#142D27]">
                      Study Velocity for {selectedDate}
                    </h3>
                    <Badge variant="primary" size="sm">
                      {progressPercent}% Met
                    </Badge>
                  </div>
                  <p className="text-xs text-[#557067] mt-0.5">
                    {(completedMinutes / 60).toFixed(1)} hrs completed of {(targetMinutes / 60).toFixed(1)} hrs daily target &bull; {daySessions.filter((s) => s.status === 'completed').length} / {daySessions.length} sessions finished
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-60">
                <div className="w-full h-2.5 rounded-full bg-[#E7EFEA] overflow-hidden">
                  <div
                    className="h-full bg-[#14B866] transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* VIEW MODE 1: DAY TIMELINE */}
          {viewMode === 'day' && (
            <div className="space-y-4">
              {/* Day Selector Ribbon */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#e1ede7]">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#14B866]" />
                  <span className="text-xs font-bold text-[#142D27]">Select Day:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {weekDays.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => setSelectedDate(d.date)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                        selectedDate === d.date
                          ? 'bg-[#142D27] text-white shadow-sm'
                          : 'bg-[#F7F9F8] text-[#557067] hover:bg-[#E7EFEA]'
                      }`}
                    >
                      {d.label} &bull; {d.date.split('-')[2]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sessions List */}
              {daySessions.length > 0 ? (
                <div className="space-y-3">
                  {daySessions.map((item) => (
                    <Card
                      key={item.id}
                      hoverable
                      className="p-5 border-l-4 transition-all"
                      style={{
                        borderLeftColor:
                          item.type === 'Lecture'
                            ? '#14B866'
                            : item.type === 'Practice Lab'
                            ? '#0EA5E9'
                            : item.type === 'Revision'
                            ? '#F59E0B'
                            : '#8B5CF6',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            title="Toggle Session Status"
                            className="mt-1 sm:mt-0 text-zinc-300 hover:text-[#14B866] transition-colors"
                          >
                            {item.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-[#14B866]" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-300" />
                            )}
                          </button>

                          <div className="text-center shrink-0 w-24">
                            <span className="text-xs font-extrabold text-[#142D27] block">
                              {item.startTime}
                            </span>
                            <span className="text-[11px] text-[#7d9990] block">{item.endTime}</span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {item.durationMinutes} mins
                            </span>
                          </div>

                          <div className="h-10 w-[1px] bg-[#e1ede7] hidden sm:block" />

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E7EFEA] text-[#142D27] uppercase tracking-wider">
                                {item.subjectCode}
                              </span>
                              <Badge
                                variant={
                                  item.type === 'Lecture'
                                    ? 'primary'
                                    : item.type === 'Practice Lab'
                                    ? 'info'
                                    : item.type === 'Revision'
                                    ? 'warning'
                                    : 'neutral'
                                }
                                size="sm"
                              >
                                {item.type}
                              </Badge>
                              {item.unitTitle && (
                                <span className="text-[11px] text-[#7d9990] italic">
                                  &bull; {item.unitTitle}
                                </span>
                              )}
                            </div>

                            <h3
                              className={`text-sm sm:text-base font-bold mt-1 ${
                                item.status === 'completed'
                                  ? 'text-zinc-400 line-through'
                                  : 'text-[#142D27]'
                              }`}
                            >
                              {item.title}
                            </h3>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#557067] mt-1">
                              <span>{item.subjectName}</span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-[#7d9990]">
                                <MapPin className="w-3 h-3 text-[#14B866]" />
                                {item.locationOrLink || item.roomOrLink}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.notes && (
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<FileText className="w-3.5 h-3.5 text-zinc-500" />}
                              onClick={() => setNotesModalSession(item)}
                            >
                              Notes
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Edit3 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEditSession(item)}
                          >
                            Edit
                          </Button>

                          <button
                            onClick={() => setDeletingSession(item)}
                            aria-label="Delete session"
                            className="p-1.5 rounded-lg border border-[#e1ede7] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarIcon className="w-8 h-8 text-[#14B866]" />}
                  title={`No Scheduled Sessions for ${selectedDate}`}
                  description="Use the button above to schedule lectures, laboratory periods, or focused self-study."
                  actionLabel="Schedule Time Block"
                  onAction={handleOpenAddSession}
                />
              )}
            </div>
          )}

          {/* VIEW MODE 2: WEEKLY VIEW */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((d) => {
                const dayItems = sessions.filter((s) => s.sessionDate === d.date);
                const isSelected = selectedDate === d.date;

                return (
                  <div
                    key={d.date}
                    onClick={() => {
                      setSelectedDate(d.date);
                      setViewMode('day');
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#14B866] bg-emerald-50/30'
                        : 'border-[#e1ede7] bg-white hover:border-[#14B866]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e1ede7]">
                      <div>
                        <span className="text-xs font-bold text-[#142D27] block">{d.label}</span>
                        <span className="text-[11px] text-[#7d9990]">{d.date.split('-')[2]} Nov</span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {dayItems.length}
                      </Badge>
                    </div>

                    <div className="space-y-2 min-h-[140px]">
                      {dayItems.length > 0 ? (
                        dayItems.map((s) => (
                          <div
                            key={s.id}
                            className={`p-2 rounded-xl text-[11px] border leading-tight ${
                              s.status === 'completed'
                                ? 'bg-[#F7F9F8] border-[#e1ede7] text-zinc-400 line-through'
                                : 'bg-white border-[#e1ede7] text-[#142D27] shadow-xs'
                            }`}
                          >
                            <span className="font-extrabold block text-[#14B866] text-[10px]">
                              {s.startTime}
                            </span>
                            <span className="font-semibold block truncate">{s.title}</span>
                            <span className="text-[10px] text-[#7d9990]">{s.subjectCode}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-zinc-400 italic pt-6 text-center">
                          Free Day
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 3: MONTHLY VIEW */}
          {viewMode === 'month' && (
            <Card className="p-5 bg-white">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e1ede7]">
                <h3 className="text-base font-bold text-[#142D27]">November 2026</h3>
                <span className="text-xs text-[#557067]">
                  {sessions.length} scheduled academic sessions
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((head) => (
                  <div key={head} className="text-center text-xs font-bold text-[#7d9990] py-1">
                    {head}
                  </div>
                ))}

                {monthDays.map((m) => {
                  const isCurrent = selectedDate === m.date;
                  return (
                    <div
                      key={m.date}
                      onClick={() => {
                        setSelectedDate(m.date);
                        setViewMode('day');
                      }}
                      className={`min-h-[70px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#14B866] bg-emerald-50/40 ring-2 ring-[#14B866]/20'
                          : 'border-[#e1ede7] hover:border-[#14B866]/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent ? 'text-[#14B866]' : 'text-[#142D27]'
                          }`}
                        >
                          {m.day}
                        </span>
                        {m.sessions.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#14B866]" />
                        )}
                      </div>

                      {m.sessions.length > 0 && (
                        <div className="mt-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E7EFEA] text-[#142D27] font-semibold block truncate">
                            {m.sessions.length} session{m.sessions.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* VIEW: STUDY PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e1ede7]">
            <div>
              <h3 className="text-sm font-bold text-[#142D27]">
                {role === 'teacher' ? 'Cohort Study Target Plans' : 'Assigned Learning Targets'}
              </h3>
              <p className="text-xs text-[#557067] mt-0.5">
                Weekly goals, recommended daily study hours, and teacher signoff progress.
              </p>
            </div>

            {role === 'teacher' && (
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => setIsPlanModalOpen(true)}
              >
                Create Target Plan
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyPlans.map((plan) => (
              <Card key={plan.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e1ede7]">
                    <div className="flex items-center gap-2">
                      {plan.studentAvatar && (
                        <img
                          src={plan.studentAvatar}
                          alt={plan.studentName}
                          className="w-7 h-7 rounded-full object-cover border border-[#e1ede7]"
                        />
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-[#142D27]">{plan.studentName}</h4>
                        <span className="text-[10px] text-[#7d9990]">
                          {plan.startDate} &bull; {plan.endDate}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={
                        plan.status === 'approved'
                          ? 'primary'
                          : plan.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {plan.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-[#142D27] mt-3">{plan.title}</h3>
                  <p className="text-xs text-[#557067] mt-1.5 leading-relaxed">
                    <strong className="text-[#142D27]">Weekly Goal:</strong> {plan.weeklyGoal}
                  </p>

                  <div className="mt-4 p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#557067]">
                      <span>Daily Target Hours:</span>
                      <strong className="text-[#142D27]">{plan.dailyTargetHours} hrs / day</strong>
                    </div>
                    {plan.teacherNotes && (
                      <p className="text-[11px] text-[#7d9990] pt-1 border-t border-[#e1ede7]/60">
                        <strong className="text-[#142D27]">Teacher Note:</strong> {plan.teacherNotes}
                      </p>
                    )}
                  </div>
                </div>

                {role === 'teacher' && plan.status === 'pending' && (
                  <div className="mt-4 pt-3 border-t border-[#e1ede7] flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlanStatusChange(plan.id, 'rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePlanStatusChange(plan.id, 'approved')}
                    >
                      Approve
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CREATE / EDIT SESSION MODAL */}
      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title={editingSession ? 'Edit Study Session' : 'Schedule Study Session'}
        description="Allocate dedicated lecture intervals, problem sets, or revision blocks."
      >
        <form onSubmit={handleSessionSubmit(onSaveSession)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Session Title</label>
            <input
              type="text"
              {...registerSession('title')}
              placeholder="e.g. Multivariable Calculus & Vector Proofs"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {sessionErrors.title && (
              <p className="text-xs text-rose-600 mt-1">{sessionErrors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject</label>
              <select
                {...registerSession('subjectId')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Session Type</label>
              <select
                {...registerSession('type')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Self Study">Self Study</option>
                <option value="Lecture">Lecture</option>
                <option value="Practice Lab">Practice Lab</option>
                <option value="Revision">Revision</option>
                <option value="Reading">Reading</option>
                <option value="Problem Solving">Problem Solving</option>
              </select>
            </div>
          </div>

          {units.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Chapter / Unit (Optional)
                </label>
                <select
                  {...registerSession('unitId')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
                >
                  <option value="">General Subject Focus</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}: {u.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Location / Link
                </label>
                <input
                  type="text"
                  {...registerSession('locationOrLink')}
                  placeholder="e.g. Seminar Room 3B / Zoom Desk"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Date</label>
              <input
                type="date"
                {...registerSession('sessionDate')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Start Time</label>
              <input
                type="text"
                {...registerSession('startTime')}
                placeholder="09:00 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">End Time</label>
              <input
                type="text"
                {...registerSession('endTime')}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Study Notes / Preparation Agenda
            </label>
            <textarea
              rows={2}
              {...registerSession('notes')}
              placeholder="Formulas to review, exercise problem indices, or lab equipment requirements..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSessionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingSession ? 'Update Session' : 'Save Session'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE STUDY PLAN MODAL (TEACHER) */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Assign Student Study Plan & Goals"
        description="Establish weekly milestones and daily target study hours for students."
      >
        <form onSubmit={handlePlanSubmit(onCreatePlan)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Target Student</label>
            <select
              {...registerPlan('studentId')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.email}) &bull; {s.academicClass}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Plan Title</label>
            <input
              type="text"
              {...registerPlan('title')}
              placeholder="e.g. Physics Midterm Sprint & Calculus Proofs"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
            />
            {planErrors.title && (
              <p className="text-xs text-rose-600 mt-1">{planErrors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Weekly Goal</label>
            <textarea
              rows={2}
              {...registerPlan('weeklyGoal')}
              placeholder="Key concepts to master, problem sets to complete, or lab reports to write..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
            {planErrors.weeklyGoal && (
              <p className="text-xs text-rose-600 mt-1">{planErrors.weeklyGoal.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Target Hours / Day
              </label>
              <input
                type="number"
                step="0.5"
                {...registerPlan('dailyTargetHours', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Start Date</label>
              <input
                type="date"
                {...registerPlan('startDate')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">End Date</label>
              <input
                type="date"
                {...registerPlan('endDate')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Teacher Advisory Notes
            </label>
            <input
              type="text"
              {...registerPlan('teacherNotes')}
              placeholder="Specific advice or focus recommendations..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Dispatch Study Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* SESSION NOTES MODAL */}
      <Modal
        isOpen={!!notesModalSession}
        onClose={() => setNotesModalSession(null)}
        title={notesModalSession ? `Notes: ${notesModalSession.title}` : 'Session Notes'}
        description="Preparation notes, syllabus points, and study references for this time block."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs text-[#142D27] leading-relaxed whitespace-pre-wrap">
            {notesModalSession?.notes || 'No specific agenda recorded for this block.'}
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNotesModalSession(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        title="Delete Scheduled Session"
        description="Are you sure you want to remove this study block from your timetable?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Session: <strong className="text-[#142D27]">{deletingSession?.title}</strong> on{' '}
            {deletingSession?.sessionDate} ({deletingSession?.startTime} – {deletingSession?.endTime}).
          </p>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingSession(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSessionConfirm}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
