import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CheckCircle2,
  Circle,
  FileText,
  Clock,
  Download,
  BookOpen,
  PlusCircle,
  Edit3,
  Trash2,
  Paperclip,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SAMPLE_SYLLABUS, SAMPLE_SUBJECTS } from '../../data/sampleData';
import { SyllabusUnit, SyllabusTopic, Subject } from '../../types';
import { useRole } from '../../hooks/useRole';
import { syllabusService } from '../../services/syllabusService';
import { subjectService } from '../../services/subjectService';
import { taskService } from '../../services/taskService';
import { emailService } from '../../services/emailService';

const chapterSchema = z.object({
  title: z.string().min(3, 'Chapter title must be at least 3 characters'),
  unitNumber: z.number().min(1, 'Unit number required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

type ChapterFormData = z.infer<typeof chapterSchema>;

const topicSchema = z.object({
  title: z.string().min(3, 'Topic title must be at least 3 characters'),
  description: z.string().optional(),
  estimatedHours: z.number().min(1, 'Minimum 1 hour').max(40, 'Maximum 40 hours'),
  notesContent: z.string().optional(),
});

type TopicFormData = z.infer<typeof topicSchema>;

export const SyllabusPage: React.FC = () => {
  const { role, user } = useRole();
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_02');
  const [syllabusList, setSyllabusList] = useState<SyllabusUnit[]>(() =>
    SAMPLE_SYLLABUS.filter((u) => u.subjectId === 'sub_02')
  );
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedTopicStatus, setSelectedTopicStatus] = useState<string>('all');
  const [activeNotesTopic, setActiveNotesTopic] = useState<{ topic: SyllabusTopic; unitTitle: string } | null>(null);

  // Modals
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<SyllabusUnit | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<SyllabusUnit | null>(null);

  const [activeUnitForTopic, setActiveUnitForTopic] = useState<SyllabusUnit | null>(null);
  const [editingTopic, setEditingTopic] = useState<{ unitId: string; topic: SyllabusTopic } | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<{ unitId: string; topic: SyllabusTopic } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [isManualTaskModalOpen, setIsManualTaskModalOpen] = useState<boolean>(false);
  const [manualTaskTitle, setManualTaskTitle] = useState<string>('');
  const [manualTaskMinutes, setManualTaskMinutes] = useState<number>(45);
  const [manualTaskDate, setManualTaskDate] = useState<string>(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    let mounted = true;
    subjectService.fetchSubjects().then((data) => {
      if (mounted && data.length > 0) {
        setSubjects(data);
        if (!data.some((s) => s.id === selectedSubjectId)) {
          setSelectedSubjectId(data[0].id);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    syllabusService.fetchHierarchicalSyllabus(selectedSubjectId, user?.id).then((data) => {
      if (mounted) {
        setSyllabusList(data || []);
      }
    });
    return () => {
      mounted = false;
    };
  }, [selectedSubjectId, user?.id]);

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || SAMPLE_SUBJECTS[0];

  // Forms
  const {
    register: registerChapter,
    handleSubmit: handleChapterSubmit,
    reset: resetChapter,
    setValue: setChapterValue,
    formState: { errors: chapterErrors },
  } = useForm<ChapterFormData>({
    resolver: zodResolver(chapterSchema),
    defaultValues: {
      title: '',
      unitNumber: syllabusList.length + 1,
      description: '',
    },
  });

  const {
    register: registerTopic,
    handleSubmit: handleTopicSubmit,
    reset: resetTopic,
    setValue: setTopicValue,
    formState: { errors: topicErrors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: '',
      description: '',
      estimatedHours: 4,
      notesContent: '',
    },
  });

  // Calculate dynamic syllabus progress
  const allTopics = syllabusList.flatMap((u) => u.topics);
  const completedTopics = allTopics.filter((t) => t.completed || t.progressStatus === 'completed');
  const inProgressTopics = allTopics.filter((t) => t.progressStatus === 'in_progress');
  const overallPercentage = allTopics.length > 0 ? Math.round((completedTopics.length / allTopics.length) * 100) : 0;

  // Filtered chapters & topics based on dropdowns
  const displayedSyllabusList = syllabusList
    .filter((unit) => selectedChapterId === 'all' || unit.id === selectedChapterId)
    .map((unit) => {
      if (selectedTopicStatus === 'all') return unit;
      return {
        ...unit,
        topics: unit.topics.filter((t) => {
          const st = t.progressStatus || (t.completed ? 'completed' : 'not_started');
          return st === selectedTopicStatus;
        }),
      };
    })
    .filter((unit) => unit.topics.length > 0 || selectedTopicStatus === 'all');

  // Toggle student topic progress
  const handleToggleTopic = async (unitId: string, topic: SyllabusTopic) => {
    const currentStatus = topic.progressStatus || (topic.completed ? 'completed' : 'not_started');
    let nextStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';

    if (currentStatus === 'not_started') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'not_started';

    setSyllabusList((prev) =>
      prev.map((unit) => {
        if (unit.id !== unitId) return unit;
        const updated = unit.topics.map((t) => {
          if (t.id === topic.id) {
            return {
              ...t,
              completed: nextStatus === 'completed',
              progressStatus: nextStatus,
            };
          }
          return t;
        });
        const completedCount = updated.filter((t) => t.completed).length;
        const prog = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
        return { ...unit, topics: updated, progress: prog };
      })
    );

    if (user?.id) {
      await syllabusService.updateStudentTopicProgress(user.id, topic.id, nextStatus);
    }
  };

  // Chapter Handlers
  const onSaveChapter = async (data: ChapterFormData) => {
    if (editingChapter) {
      await syllabusService.updateChapter(editingChapter.id, {
        title: data.title,
        unitNumber: data.unitNumber,
        description: data.description,
      });

      setSyllabusList((prev) =>
        prev.map((u) =>
          u.id === editingChapter.id
            ? { ...u, title: data.title, unitNumber: data.unitNumber, description: data.description }
            : u
        )
      );
      setEditingChapter(null);
      setSuccessToast(`Chapter "${data.title}" updated.`);
    } else {
      const { chapter } = await syllabusService.createChapter({
        subjectId: selectedSubjectId,
        title: data.title,
        description: data.description,
        unitNumber: data.unitNumber,
      });
      if (chapter) {
        setSyllabusList((prev) => [...prev, chapter]);
      }

      // Auto-generate daily tasks across weekdays with Sunday OFF
      taskService.generateDailyTasksFromSource({
        sourceType: 'syllabus',
        sourceTitle: `${currentSubject.name}: ${data.title}`,
        subjectId: selectedSubjectId,
        subjectName: currentSubject.name,
        subjectCode: currentSubject.code,
        totalPagesOrTopics: 12,
        startPage: 1,
      });

      const studentGmail = emailService.getStudentConfiguredEmail();
      const teacherGmail = emailService.getTeacherConfiguredEmail();
      emailService.sendManualDirectEmail({
        senderEmail: teacherGmail,
        senderName: user?.name || 'Ahmad',
        recipientEmail: studentGmail,
        recipientName: 'Student Scholar',
        subject: `📋 Syllabus Daily Tasks Assigned: ${data.title}`,
        message: `New syllabus chapter "${data.title}" has been scheduled into daily study targets across Monday to Saturday.\n\n• Subject: ${currentSubject.name}\n• Sunday Policy: Mandatory Rest Day (Zero tasks scheduled)\n• Pakistan Holiday Policy: Gazetted public holidays are observed with zero homework.\n\nLog in to your StudyHub student portal to track progress and submit notes.`,
        category: 'system',
      });

      setIsChapterModalOpen(false);
      setSuccessToast(`"${data.title}" added to syllabus & daily study tasks automated (Sunday OFF)!`);
    }
    resetChapter();
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteChapter = async () => {
    if (!deletingChapter) return;
    await syllabusService.deleteChapter(deletingChapter.id);
    setSyllabusList((prev) => prev.filter((u) => u.id !== deletingChapter.id));
    const title = deletingChapter.title;
    setDeletingChapter(null);
    setSuccessToast(`Chapter "${title}" removed.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Topic Handlers
  const onSaveTopic = async (data: TopicFormData) => {
    if (editingTopic) {
      await syllabusService.updateTopic(editingTopic.topic.id, {
        title: data.title,
        description: data.description,
        estimatedHours: data.estimatedHours,
        notesContent: data.notesContent,
      });

      setSyllabusList((prev) =>
        prev.map((unit) => {
          if (unit.id !== editingTopic.unitId) return unit;
          return {
            ...unit,
            topics: unit.topics.map((t) =>
              t.id === editingTopic.topic.id
                ? {
                    ...t,
                    title: data.title,
                    description: data.description,
                    estimatedHours: data.estimatedHours,
                    notesContent: data.notesContent,
                  }
                : t
            ),
          };
        })
      );
      setEditingTopic(null);
      setSuccessToast(`Topic "${data.title}" updated.`);
    } else if (activeUnitForTopic) {
      const { topic } = await syllabusService.createTopic({
        unitId: activeUnitForTopic.id,
        title: data.title,
        description: data.description,
        estimatedHours: data.estimatedHours,
        notesContent: data.notesContent,
      });

      if (topic) {
        setSyllabusList((prev) =>
          prev.map((unit) => {
            if (unit.id !== activeUnitForTopic.id) return unit;
            return { ...unit, topics: [...unit.topics, topic] };
          })
        );
      }
      setActiveUnitForTopic(null);
      setSuccessToast(`Topic "${data.title}" created.`);
    }
    resetTopic();
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleDeleteTopic = async () => {
    if (!deletingTopic) return;
    await syllabusService.deleteTopic(deletingTopic.topic.id);
    setSyllabusList((prev) =>
      prev.map((unit) => {
        if (unit.id !== deletingTopic.unitId) return unit;
        const updated = unit.topics.filter((t) => t.id !== deletingTopic.topic.id);
        const completedCount = updated.filter((t) => t.completed).length;
        const prog = updated.length > 0 ? Math.round((completedCount / updated.length) * 100) : 0;
        return { ...unit, topics: updated, progress: prog };
      })
    );
    const title = deletingTopic.topic.title;
    setDeletingTopic(null);
    setSuccessToast(`Topic "${title}" removed.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskTitle.trim()) return;

    taskService.createCustomTask({
      title: manualTaskTitle.trim(),
      description: `Manual target for ${currentSubject.name}`,
      subjectId: selectedSubjectId,
      subjectName: currentSubject.name,
      dueDate: manualTaskDate,
      estimatedMinutes: manualTaskMinutes,
    });

    setIsManualTaskModalOpen(false);
    setManualTaskTitle('');
    setSuccessToast(`Custom study task "${manualTaskTitle}" added.`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-subtle animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white font-serif">Hierarchical Syllabus &amp; Checkpoints</h1>
            <Badge variant="primary" size="sm" dot>
              {allTopics.length} Total Topics
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Structured course tree (Course &rarr; Subject &rarr; Chapter &rarr; Topic) with student progress calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'teacher' && (
            <Button
              variant="primary"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => {
                setEditingChapter(null);
                setChapterValue('title', '');
                setChapterValue('unitNumber', syllabusList.length + 1);
                setChapterValue('description', '');
                setIsChapterModalOpen(true);
              }}
            >
              Add Chapter
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-[#14B866]" />}
            onClick={() => window.print()}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* 3 Unified Dropdown Filters (Subject, Chapter, Topic Status) */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Subject Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Subject ({subjects.length})
            </label>
            <div className="relative">
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedChapterId('all');
                }}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 2. Chapter Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Chapter Filter
            </label>
            <div className="relative">
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All {syllabusList.length} Chapters</option>
                {syllabusList.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    Chapter {unit.unitNumber}: {unit.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Topic Progress Status */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Topic Status
            </label>
            <div className="relative">
              <select
                value={selectedTopicStatus}
                onChange={(e) => setSelectedTopicStatus(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-zinc-50/80 text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Topics ({allTopics.length})</option>
                <option value="completed">Completed ({completedTopics.length})</option>
                <option value="in_progress">In Progress ({inProgressTopics.length})</option>
                <option value="not_started">Not Started ({allTopics.length - completedTopics.length - inProgressTopics.length})</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Summary & Progress Stat Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-5 bg-gradient-to-r from-white to-[#f0faf5] border-[#14B866]/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14B866] uppercase tracking-wider">
                {currentSubject.course || '1st Year FA-IT (BISE DG Khan)'} Track
              </span>
              <span className="text-xs text-[#7d9990]">&bull;</span>
              <span className="text-xs text-[#557067]">Session: {currentSubject.academicSession || '2026-2027'}</span>
              <span className="text-xs text-[#7d9990]">&bull;</span>
              <span className="text-xs text-[#557067]">Faculty: {currentSubject.teacherName}</span>
            </div>
            <h3 className="text-xl font-bold text-[#142D27]">{currentSubject.name}</h3>
            <p className="text-xs text-[#557067]">
              {syllabusList.length} formal chapters with {allTopics.length} topic checkpoints mapped to examination standards.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e1ede7] flex flex-wrap items-center gap-6">
            <div>
              <span className="text-[11px] text-[#7d9990] uppercase font-bold">Chapters</span>
              <p className="text-base font-extrabold text-[#142D27] mt-0.5">{syllabusList.length}</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7d9990] uppercase font-bold">Completed</span>
              <p className="text-base font-extrabold text-[#14B866] mt-0.5">{completedTopics.length} Topics</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7d9990] uppercase font-bold">In Progress</span>
              <p className="text-base font-extrabold text-amber-600 mt-0.5">{inProgressTopics.length} Topics</p>
            </div>
            <div>
              <span className="text-[11px] text-[#7d9990] uppercase font-bold">Remaining</span>
              <p className="text-base font-extrabold text-zinc-600 mt-0.5">{allTopics.length - completedTopics.length} Topics</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-center items-center text-center bg-white">
          <p className="text-xs font-bold text-[#7d9990] uppercase tracking-wider">
            Calculated Progress
          </p>
          <div className="text-4xl font-extrabold text-[#14B866] mt-2">
            {overallPercentage}%
          </div>
          <p className="text-xs text-[#557067] mt-1">Based on student records</p>
          <div className="w-full bg-[#E7EFEA] rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="h-full bg-[#14B866] rounded-full transition-all duration-500"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Chapters & Topics List */}
      <div className="space-y-5">
        {displayedSyllabusList.length > 0 ? (
          displayedSyllabusList.map((unit) => (
            <Card key={unit.id} className="p-5 sm:p-6">
              {/* Chapter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e1ede7]">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#14B866] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full shrink-0">
                      Chapter {unit.unitNumber}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#142D27] break-words">{unit.title}</h3>
                  </div>
                  {unit.description && (
                    <p className="text-xs text-[#557067] mt-1 leading-relaxed">{unit.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-[#142D27]">{unit.progress}%</span>
                    <span className="text-[10px] text-[#7d9990] block">Chapter Mastery</span>
                  </div>
                  <div className="w-16 bg-[#E7EFEA] rounded-full h-2 overflow-hidden shrink-0">
                    <div
                      className="h-full bg-[#14B866] rounded-full"
                      style={{ width: `${unit.progress}%` }}
                    />
                  </div>

                  {role === 'teacher' && (
                    <div className="flex items-center gap-1 ml-2 border-l border-[#e1ede7] pl-2">
                      <button
                        onClick={() => {
                          setEditingChapter(unit);
                          setChapterValue('title', unit.title);
                          setChapterValue('unitNumber', unit.unitNumber);
                          setChapterValue('description', unit.description);
                          setIsChapterModalOpen(true);
                        }}
                        title="Edit chapter"
                        className="p-1 rounded text-zinc-400 hover:text-[#142D27] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingChapter(unit)}
                        title="Delete chapter"
                        className="p-1 rounded text-zinc-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Topics Checkpoints List */}
              <div className="mt-4 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <p className="text-[11px] font-semibold text-[#7d9990] uppercase tracking-wider">
                    {unit.topics.length} Checkpoints &bull; Click status pill or row to update progress
                  </p>
                  {role === 'teacher' && (
                    <button
                      onClick={() => {
                        setActiveUnitForTopic(unit);
                        setEditingTopic(null);
                        setTopicValue('title', '');
                        setTopicValue('description', '');
                        setTopicValue('estimatedHours', 4);
                        setTopicValue('notesContent', '');
                      }}
                      className="text-xs font-semibold text-[#14B866] hover:underline flex items-center gap-1 self-start sm:self-auto"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Topic
                    </button>
                  )}
                </div>

                {unit.topics.map((topic) => {
                  const status = topic.progressStatus || (topic.completed ? 'completed' : 'not_started');
                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleTopic(unit.id, topic)}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2.5 cursor-pointer select-none ${
                        status === 'completed'
                          ? 'bg-[#e8f8f0]/40 border-[#14B866]/30 text-[#142D27]'
                          : status === 'in_progress'
                          ? 'bg-amber-50/40 border-amber-300 text-[#142D27]'
                          : 'bg-[#F7F9F8] border-[#e1ede7] text-[#557067] hover:bg-white hover:shadow-xs'
                      }`}
                    >
                      {/* Top: Checkmark & Full-Width Topic Title */}
                      <div className="flex items-start gap-3">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#14B866] shrink-0 mt-0.5" />
                        ) : status === 'in_progress' ? (
                          <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-[#7d9990] shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs sm:text-sm font-semibold leading-relaxed break-words ${
                              status === 'completed' ? 'line-through text-[#7d9990]' : 'text-[#142D27]'
                            }`}
                          >
                            {topic.title}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Metadata Info + Badges + Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-200/50 text-[11px] pl-7">
                        <div className="flex items-center gap-2.5 text-zinc-500 text-[11px]">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-zinc-400 shrink-0" />
                            Est. {topic.estimatedHours} Hours
                          </span>
                          {topic.attachmentName && (
                            <span className="text-[#14B866] font-medium flex items-center gap-0.5 truncate max-w-[140px]">
                              <Paperclip className="w-3 h-3 shrink-0" />
                              {topic.attachmentName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Badge */}
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                              status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-zinc-100 text-zinc-600'
                            }`}
                          >
                            {status.replace('_', ' ')}
                          </span>

                          {topic.notesAvailable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveNotesTopic({ topic, unitTitle: unit.title });
                              }}
                              className="flex items-center gap-1 text-[11px] font-semibold text-[#14B866] hover:text-[#109653] bg-white px-2.5 py-0.5 rounded-lg border border-[#e1ede7] shadow-2xs shrink-0"
                            >
                              <FileText className="w-3 h-3" />
                              Notes
                            </button>
                          )}

                          {role === 'teacher' && (
                            <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setEditingTopic({ unitId: unit.id, topic });
                                  setTopicValue('title', topic.title);
                                  setTopicValue('description', topic.description || '');
                                  setTopicValue('estimatedHours', topic.estimatedHours);
                                  setTopicValue('notesContent', topic.notesContent || '');
                                }}
                                className="p-1 rounded text-zinc-400 hover:text-[#142D27]"
                                title="Edit Topic"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingTopic({ unitId: unit.id, topic })}
                                className="p-1 rounded text-zinc-400 hover:text-rose-600"
                                title="Delete Topic"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-[#557067]">
            <BookOpen className="w-8 h-8 text-[#14B866] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#142D27]">No Syllabus Chapters Defined</h4>
            <p className="text-xs text-[#7d9990] mt-1">
              Select another subject course or create the first chapter using the button above.
            </p>
          </Card>
        )}
      </div>

      {/* Chapter Modal */}
      <Modal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        title={editingChapter ? 'Edit Chapter Unit' : 'Create Syllabus Chapter'}
        description={`Configure modular chapter for ${currentSubject.name}.`}
      >
        <form onSubmit={handleChapterSubmit(onSaveChapter)} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Unit #</label>
              <input
                type="number"
                {...registerChapter('unitNumber', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Chapter Title</label>
              <input
                type="text"
                {...registerChapter('title')}
                placeholder="e.g. Multivariable Vector Analysis & Stoke's Proofs"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>
          </div>
          {chapterErrors.title && <p className="text-xs text-rose-600">{chapterErrors.title.message}</p>}

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Pedagogical Description</label>
            <textarea
              rows={2}
              {...registerChapter('description')}
              placeholder="Key theoretical milestones and topics in this module..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsChapterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingChapter ? 'Save Chapter' : 'Add Chapter'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={!!activeUnitForTopic || !!editingTopic}
        onClose={() => {
          setActiveUnitForTopic(null);
          setEditingTopic(null);
        }}
        title={editingTopic ? 'Edit Syllabus Topic' : 'Add Checkpoint Topic'}
        description="Configure topic title, study duration, and conceptual notes."
      >
        <form onSubmit={handleTopicSubmit(onSaveTopic)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Topic Title</label>
            <input
              type="text"
              {...registerTopic('title')}
              placeholder="e.g. Greens Theorem in the Plane: Flux & Circulation"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {topicErrors.title && <p className="text-xs text-rose-600 mt-1">{topicErrors.title.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Estimated Hours</label>
            <input
              type="number"
              {...registerTopic('estimatedHours', { valueAsNumber: true })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Study Guide / Formula Sheet</label>
            <textarea
              rows={3}
              {...registerTopic('notesContent')}
              placeholder="Core formulas, theorems, standard derivations..."
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setActiveUnitForTopic(null);
                setEditingTopic(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Topic
            </Button>
          </div>
        </form>
      </Modal>

      {/* Topic Notes Preview Modal */}
      <Modal
        isOpen={!!activeNotesTopic}
        onClose={() => setActiveNotesTopic(null)}
        title={activeNotesTopic?.topic.title || 'Topic Study Guide'}
        description={`Study notes & essential formulas for ${activeNotesTopic?.unitTitle}.`}
      >
        {activeNotesTopic && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] space-y-2 text-xs text-[#263B35]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#14B866]">
                <BookOpen className="w-4 h-4" />
                <span>Core Theoretical Concept:</span>
              </div>
              <p className="leading-relaxed">
                {activeNotesTopic.topic.notesContent ||
                  'This checkpoint covers fundamental theorems and proofs required for term assessments. Review standard limits, convergence criteria, and differential forms.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#7d9990]">
                Estimated Study: {activeNotesTopic.topic.estimatedHours} Hours
              </span>
              <Button variant="primary" size="sm" onClick={() => setActiveNotesTopic(null)}>
                Done Reading
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Chapter Modal */}
      <Modal
        isOpen={!!deletingChapter}
        onClose={() => setDeletingChapter(null)}
        title="Confirm Chapter Removal"
        description="Are you sure you wish to delete this chapter?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Deleting <strong>"{deletingChapter?.title}"</strong> will remove all underlying topics and student checkpoint progress.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingChapter(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteChapter}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Topic Modal */}
      <Modal
        isOpen={!!deletingTopic}
        onClose={() => setDeletingTopic(null)}
        title="Confirm Topic Removal"
        description="Are you sure you wish to delete this topic?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Deleting <strong>"{deletingTopic?.topic.title}"</strong> will remove this checkpoint from the syllabus tree.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingTopic(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteTopic}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Add Manual Task */}
      <Modal
        isOpen={isManualTaskModalOpen}
        onClose={() => setIsManualTaskModalOpen(false)}
        title="Add Custom Study Target"
      >
        <form onSubmit={handleCreateManualTask} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1">Task Target Title</label>
            <input
              type="text"
              value={manualTaskTitle}
              onChange={(e) => setManualTaskTitle(e.target.value)}
              placeholder="e.g. Chapter 2 Vectors: Review Dot Product Proofs"
              className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min={15}
                max={240}
                value={manualTaskMinutes}
                onChange={(e) => setManualTaskMinutes(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Target Due Date</label>
              <input
                type="date"
                value={manualTaskDate}
                onChange={(e) => setManualTaskDate(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsManualTaskModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="sm">
              Save Target
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
