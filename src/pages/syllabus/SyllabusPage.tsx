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
  Sparkles,
  PlusCircle,
  Edit3,
  Trash2,
  Paperclip,
  CheckCircle,
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
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_01');
  const [syllabusList, setSyllabusList] = useState<SyllabusUnit[]>(SAMPLE_SYLLABUS);
  const [activeNotesTopic, setActiveNotesTopic] = useState<{ topic: SyllabusTopic; unitTitle: string } | null>(null);

  // Modals
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<SyllabusUnit | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<SyllabusUnit | null>(null);

  const [activeUnitForTopic, setActiveUnitForTopic] = useState<SyllabusUnit | null>(null);
  const [editingTopic, setEditingTopic] = useState<{ unitId: string; topic: SyllabusTopic } | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<{ unitId: string; topic: SyllabusTopic } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
      if (mounted && data && data.length > 0) {
        setSyllabusList(data);
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
        senderName: user?.name || 'Prof. Clara Evans',
        recipientEmail: studentGmail,
        recipientName: 'Bilal Ahmad (Student)',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142D27]">Hierarchical Syllabus & Checkpoints</h1>
            <Badge variant="primary" size="sm" dot>
              {allTopics.length} Total Topics
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
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

      {/* Subject Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
              selectedSubjectId === sub.id
                ? 'bg-[#142D27] text-white shadow-sm'
                : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8] hover:text-[#142D27]'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.accentColor }} />
            {sub.name}
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
              {sub.code}
            </span>
          </button>
        ))}
      </div>

      {/* Course Summary & Progress Stat Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-5 bg-gradient-to-r from-white to-[#f0faf5] border-[#14B866]/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#14B866] uppercase tracking-wider">
                {currentSubject.course || 'Advanced STEM'} Track
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
        {syllabusList.length > 0 ? (
          syllabusList.map((unit) => (
            <Card key={unit.id} className="p-5 sm:p-6">
              {/* Chapter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e1ede7]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#14B866] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full">
                      Chapter {unit.unitNumber}
                    </span>
                    <h3 className="text-base font-bold text-[#142D27]">{unit.title}</h3>
                  </div>
                  {unit.description && (
                    <p className="text-xs text-[#557067] mt-1">{unit.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#142D27]">{unit.progress}%</span>
                    <span className="text-[10px] text-[#7d9990] block">Chapter Mastery</span>
                  </div>
                  <div className="w-16 bg-[#E7EFEA] rounded-full h-2 overflow-hidden">
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
                <div className="flex items-center justify-between">
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
                      className="text-xs font-semibold text-[#14B866] hover:underline flex items-center gap-1"
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
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                        status === 'completed'
                          ? 'bg-[#e8f8f0]/40 border-[#14B866]/30 text-[#142D27]'
                          : status === 'in_progress'
                          ? 'bg-amber-50/40 border-amber-300 text-[#142D27]'
                          : 'bg-[#F7F9F8] border-[#e1ede7] text-[#557067] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-[#14B866] shrink-0" />
                        ) : status === 'in_progress' ? (
                          <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#7d9990] shrink-0" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              status === 'completed' ? 'line-through text-[#7d9990]' : 'text-[#142D27]'
                            }`}
                          >
                            {topic.title}
                          </p>
                          <span className="text-[10px] text-[#7d9990] flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Est. {topic.estimatedHours} Hours
                            {topic.attachmentName && (
                              <span className="text-[#14B866] font-medium ml-2 flex items-center gap-0.5">
                                <Paperclip className="w-3 h-3" />
                                {topic.attachmentName}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
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
                            className="flex items-center gap-1 text-[11px] font-semibold text-[#14B866] hover:text-[#109653] bg-white px-2.5 py-1 rounded-lg border border-[#e1ede7] shadow-subtle shrink-0"
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
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingTopic({ unitId: unit.id, topic })}
                              className="p-1 rounded text-zinc-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
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
                <Sparkles className="w-4 h-4" />
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
    </div>
  );
};
