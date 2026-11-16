import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusCircle,
  Clock,
  Calendar,
  FileQuestion,
  Award,
  CheckCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  LayoutGrid,
  List,
  Camera,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  RefreshCw,
  FileText,
  X,
  FileCheck2,
  ShieldCheck,
  Check,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { DailyTestSeriesGrid } from '../../components/tests/DailyTestSeriesGrid';
import {
  TestItem,
  TestAnswer,
  TestQuestion,
  TestOption,
  Subject,
  SyllabusUnit,
  Student,
} from '../../types';
import { useRole } from '../../hooks/useRole';
import { testService, ensureQuestionsForTest, generateStandardFAITQuestions, extractDayAndCleanTitle } from '../../services/testService';
import { subjectService } from '../../services/subjectService';
import { notificationService } from '../../services/notificationService';
import { syllabusService } from '../../services/syllabusService';
import { studentService } from '../../services/studentService';
import { submissionService } from '../../services/submissionService';
import { emailService } from '../../services/emailService';
import {
  SAMPLE_TESTS,
  SAMPLE_SUBJECTS,
  SAMPLE_STUDENTS_LIST,
} from '../../data/sampleData';

const scheduleTestSchema = z.object({
  title: z.string().min(3, 'Test title must be at least 3 characters'),
  subjectId: z.string().min(1, 'Please select a subject'),
  unitId: z.string().optional(),
  assignedTo: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  durationMinutes: z.number().min(15, 'Min 15 mins').max(240, 'Max 240 mins'),
  totalMarks: z.number().min(10, 'Min 10 marks').max(200, 'Max 200 marks'),
  passingMarks: z.number().min(5, 'Min 5 marks').max(100, 'Max 100 marks'),
  syllabusCoverage: z.string().min(5, 'Syllabus coverage must be at least 5 characters'),
  instructions: z.string().optional(),
});

type ScheduleTestFormData = z.infer<typeof scheduleTestSchema>;

export const TestsPage: React.FC = () => {
  const { role, user } = useRole();
  const [tests, setTests] = useState<TestItem[]>(() => SAMPLE_TESTS.map(ensureQuestionsForTest));
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);
  const [units, setUnits] = useState<SyllabusUnit[]>([]);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewLayout, setViewLayout] = useState<'boxes' | 'cards'>('boxes');

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [inspectGradeTest, setInspectGradeTest] = useState<TestItem | null>(null);
  const [gradingTest, setGradingTest] = useState<TestItem | null>(null);
  const [gradingMarks, setGradingMarks] = useState<number>(28);
  const [gradingRemarks, setGradingRemarks] = useState<string>(
    'Excellent effort! Technical definitions and handwritten block diagram are properly constructed strictly as per BISE DG Khan examination marking rubrics.'
  );
  const [activeExamTest, setActiveExamTest] = useState<TestItem | null>(null);
  const [addQuestionModalTest, setAddQuestionModalTest] = useState<TestItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Student Examination Runner state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<TestAnswer[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(5400); // 90 mins
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [activeAttemptId, setActiveAttemptId] = useState<string>('');
  const [uploadedSheets, setUploadedSheets] = useState<
    { id: string; name: string; url: string; previewUrl?: string }[]
  >([]);
  const [studentRetestNotes, setStudentRetestNotes] = useState('');

  // Question Creator state (Teacher)
  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<'mcq' | 'short_answer' | 'long_answer' | 'file_upload'>('mcq');
  const [newQMarks, setNewQMarks] = useState(5);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQOptions, setNewQOptions] = useState([
    { text: 'Option A', isCorrect: true },
    { text: 'Option B', isCorrect: false },
    { text: 'Option C', isCorrect: false },
    { text: 'Option D', isCorrect: false },
  ]);

  const loadData = () => {
    Promise.all([
      testService.fetchTests(role === 'student' ? user.id : undefined),
      subjectService.fetchSubjects(),
      studentService.fetchStudents(),
    ]).then(([testsData, subjectsData, studentsData]) => {
      if (testsData && testsData.length > 0) setTests(testsData);
      if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
      if (studentsData && studentsData.length > 0) setStudents(studentsData);
    });
  };

  // Load Data
  useEffect(() => {
    loadData();
  }, [role, user.id]);

  // Schedule Test Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ScheduleTestFormData>({
    resolver: zodResolver(scheduleTestSchema),
    defaultValues: {
      title: '',
      subjectId: subjects[0]?.id || '',
      date: '2026-11-28',
      time: '10:00 AM – 11:30 AM',
      durationMinutes: 45,
      totalMarks: 30,
      passingMarks: 15,
      syllabusCoverage: 'Board short questions and theoretical definitions.',
      instructions: 'Attempt all objective and subjective sections. Total Marks: 30. Passing marks: 15.',
    },
  });

  // Watch subject for units dropdown
  const watchedSubjectId = watch('subjectId');
  useEffect(() => {
    if (watchedSubjectId) {
      syllabusService.fetchHierarchicalSyllabus(watchedSubjectId).then((data) => {
        setUnits(data);
      });
    } else {
      setUnits([]);
    }
  }, [watchedSubjectId]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!activeExamTest) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeExamTest]);

  // Format Timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Schedule Test Submit (Teacher)
  const onScheduleSubmit = async (data: ScheduleTestFormData) => {
    setIsScheduling(true);
    const selectedSubj = subjects.find((s) => s.id === data.subjectId);

    const { test } = await testService.scheduleTest({
      title: data.title,
      subjectId: data.subjectId,
      subjectName: selectedSubj?.name || 'Advanced Subject',
      subjectCode: selectedSubj?.code || 'FAIT-CSC-11',
      unitId: data.unitId,
      assignedTo: data.assignedTo && data.assignedTo !== 'all' ? data.assignedTo : undefined,
      date: data.date,
      time: data.time,
      durationMinutes: data.durationMinutes,
      totalMarks: data.totalMarks,
      passingMarks: data.passingMarks,
      syllabusCoverage: data.syllabusCoverage,
      instructions: data.instructions,
      createdBy: user?.id,
    });

    if (test) {
      setTests((prev) => [test, ...prev]);
    }

    // Automated Dispatch to Student's Gmail
    const assignedStudent = students.find((s) => s.id === data.assignedTo);
    const targetEmail = assignedStudent?.email || emailService.getStudentConfiguredEmail();
    const targetName = assignedStudent?.name || 'Henza Noor';

    emailService.sendNewTestAlert({
      studentEmail: targetEmail,
      studentName: targetName,
      teacherName: user?.name || 'Ahmad',
      testTitle: data.title,
      subjectName: selectedSubj?.name || 'Advanced Mathematics',
      date: data.date,
      time: data.time,
      durationMinutes: data.durationMinutes,
      totalMarks: data.totalMarks,
      passingMarks: data.passingMarks,
      syllabusCoverage: data.syllabusCoverage,
      instructions: data.instructions,
    });

    setIsScheduling(false);
    setIsScheduleModalOpen(false);
    reset();
    setSuccessToast(`Assessment "${data.title}" scheduled & alert dispatched to student Gmail!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleSendDeadlineReminder = (t: TestItem) => {
    emailService.sendDeadlineReminder({
      studentEmail: emailService.getStudentConfiguredEmail(),
      studentName: 'Henza Noor',
      itemTitle: t.title,
      itemType: 'test',
      subjectName: t.subjectName,
      dueDate: `${t.date} at ${t.time}`,
      instructions: t.instructions,
    });
    setSuccessToast(`24-hour countdown reminder for "${t.title}" dispatched to student's Gmail!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Start Student Examination
  const handleStartExam = async (testItem: TestItem) => {
    const fullTest = await testService.fetchTestById(testItem.id, user.id);
    const testToUse = ensureQuestionsForTest(fullTest || testItem);

    const { attempt } = await testService.startAttempt(testToUse.id, user.id);
    setActiveAttemptId(attempt?.id || `att_${Date.now()}`);

    // Pre-populate answers from previous attempt if any
    const initialAnswers: TestAnswer[] = (testToUse.questions || []).map((q) => {
      const existing = attempt?.answers?.find((a) => a.questionId === q.id);
      return (
        existing || {
          questionId: q.id,
          selectedOptionId: undefined,
          textAnswer: '',
          fileUrl: '',
          isFlaggedForReview: false,
        }
      );
    });

    setExamAnswers(initialAnswers);
    setUploadedSheets([]);
    setStudentRetestNotes('');
    setRemainingSeconds((testToUse.durationMinutes || 60) * 60);
    setCurrentQuestionIndex(0);
    setActiveExamTest(testToUse);
  };

  // Upload Solution Sheets via Camera or Gallery
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeExamTest) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      const { path } = await submissionService.uploadSubmissionFile(file, user.id);

      const newSheet = {
        id: `sheet_${Date.now()}_${i}`,
        name: file.name,
        url: path || `#uploaded_${file.name}`,
        previewUrl,
      };

      setUploadedSheets((prev) => [...prev, newSheet]);

      // Connect to active question if file_upload
      const currQ = activeExamTest.questions?.[currentQuestionIndex];
      if (currQ) {
        handleUpdateCurrentAnswer({
          fileUrl: newSheet.url,
          fileName: newSheet.name,
        });
      }
    }

    setSuccessToast(`Solution sheet(s) attached via Camera/Gallery!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleRemoveSheet = (id: string) => {
    setUploadedSheets((prev) => prev.filter((s) => s.id !== id));
  };

  // Update Answer
  const handleUpdateCurrentAnswer = (updates: Partial<TestAnswer>) => {
    if (!activeExamTest) return;
    const currQ = activeExamTest.questions?.[currentQuestionIndex];
    if (!currQ) return;

    setExamAnswers((prev) =>
      prev.map((ans) =>
        ans.questionId === currQ.id ? { ...ans, ...updates } : ans
      )
    );

    // Save answer to server
    testService.saveAnswer(activeAttemptId, {
      questionId: currQ.id,
      ...updates,
    });
  };

  // Submit Exam
  const handleCertifyGrade = async () => {
    if (!gradingTest) return;
    const questions = gradingTest.questions || [];
    const gradedQuestions = questions.map((q, idx) => ({
      questionId: q.id,
      marksAwarded: idx === 0 ? 5 : idx === 1 ? Math.min(10, Math.round(gradingMarks * 0.35)) : Math.max(0, gradingMarks - 5 - Math.min(10, Math.round(gradingMarks * 0.35))),
      feedback: 'Verified according to board marking standard.',
    }));

    await testService.gradeAttempt({
      attemptId: gradingTest.myAttempt?.id || `att_${Date.now()}`,
      test: gradingTest,
      studentId: 'usr_s_01',
      studentName: 'Henza Noor',
      gradedQuestions,
      overallFeedback: gradingRemarks,
      teacherId: user.id || 'usr_t_01',
    });

    const title = gradingTest.title;
    setGradingTest(null);
    setSuccessToast(`Official grade (${gradingMarks}/${gradingTest.totalMarks}) certified and released for "${title}"!`);
    setTimeout(() => setSuccessToast(null), 4000);
    loadData();
  };

  const handleConfirmSubmitExam = async () => {
    if (!activeExamTest) return;

    // Attach any uploaded sheets / retest notes to answers
    const finalAnswers = [...examAnswers];
    if (uploadedSheets.length > 0) {
      const fileUrls = uploadedSheets.map((s) => s.url).join(';');
      const fileNames = uploadedSheets.map((s) => s.name).join(', ');
      const fileQ = activeExamTest.questions?.find((q) => q.questionType === 'file_upload');
      if (fileQ) {
        const existingIdx = finalAnswers.findIndex((a) => a.questionId === fileQ.id);
        const combinedNotes = studentRetestNotes
          ? `${studentRetestNotes}\nAttached Sheets: ${fileNames}`
          : `Attached Sheets: ${fileNames}`;
        if (existingIdx >= 0) {
          finalAnswers[existingIdx] = {
            ...finalAnswers[existingIdx],
            fileUrl: fileUrls,
            fileName: fileNames,
            textAnswer: finalAnswers[existingIdx].textAnswer
              ? `${finalAnswers[existingIdx].textAnswer}\n${combinedNotes}`
              : combinedNotes,
          };
        }
      }
    }

    await testService.submitAttempt(activeAttemptId, activeExamTest, finalAnswers);

    setTests((prev) =>
      prev.map((t) =>
        t.id === activeExamTest.id
          ? {
              ...t,
              status: 'ongoing',
              myAttempt: {
                id: activeAttemptId,
                testId: t.id,
                studentId: user.id,
                startedAt: '',
                status: 'submitted',
              },
            }
          : t
      )
    );

    const testTitle = activeExamTest.title;

    // Trigger instant notification for Ahmad (Faculty Lead)
    notificationService.notifyStudentSubmission(
      user?.name || 'Henza Noor',
      testTitle
    );

    setActiveExamTest(null);
    setIsSubmitConfirmOpen(false);
    setSuccessToast(
      `Retest / Assessment "${testTitle}" successfully submitted with handwritten sheets! Dispatched to Ahmad for re-evaluation.`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleAutoSubmitExam = () => {
    handleConfirmSubmitExam();
  };

  // Add Question Submit (Teacher)
  const handleAddQuestionSubmit = async () => {
    if (!addQuestionModalTest) return;

    await testService.addQuestion({
      testId: addQuestionModalTest.id,
      questionText: newQText,
      questionType: newQType,
      marks: newQMarks,
      questionOrder: (addQuestionModalTest.questions?.length || 0) + 1,
      explanation: newQExplanation,
      options:
        newQType === 'mcq'
          ? newQOptions.map((o) => ({ optionText: o.text, isCorrect: o.isCorrect }))
          : undefined,
    });

    setSuccessToast(`New question added to ${addQuestionModalTest.title}!`);
    setAddQuestionModalTest(null);
    setNewQText('');
    setNewQExplanation('');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredTests = tests.filter((t) => {
    const matchesFilter =
      filter === 'all' ||
      t.status === filter ||
      (filter === 'scheduled' && t.status === 'ongoing');
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white font-serif">
              {role === 'teacher' ? 'Examination Center' : 'Student Testing & Assessments'}
            </h1>
            <Badge variant="primary" size="sm" dot>
              {tests.filter((t) => t.status === 'scheduled').length} Scheduled Tests
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Formal invigilated examinations, periodic unit diagnostic assessments, speed drills, and question rubrics.
          </p>
        </div>

        {role === 'teacher' && (
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsScheduleModalOpen(true)}
          >
            Schedule Assessment
          </Button>
        )}
      </div>

      {/* View Mode Toggle: Compact Day Boxes vs Detailed Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-[#1a1e1d] border border-white/10 rounded-2xl">
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setViewLayout('boxes')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              viewLayout === 'boxes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Compact Boxes</span>
          </button>
          <button
            onClick={() => setViewLayout('cards')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
              viewLayout === 'cards'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Detailed Cards</span>
          </button>
        </div>

        <span className="hidden sm:inline text-[11px] font-semibold text-zinc-400 px-3">
          30 Marks per Test &bull; Sunday Off Policy
        </span>
      </div>

      {viewLayout === 'boxes' ? (
        <DailyTestSeriesGrid
          tests={tests}
          onTakeTest={handleStartExam}
          onGradeTest={(test) => setGradingTest(test)}
          onRefreshTests={loadData}
        />
      ) : (
        <>
          {/* Filter and Search Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['all', 'scheduled', 'graded'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-[#142D27] text-white shadow-sm'
                  : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
              }`}
            >
              {tab === 'all' ? 'All Assessments' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search examinations..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e1ede7] bg-white focus:outline-none focus:border-[#14B866]"
          />
        </div>
      </div>

      {/* Tests Grid */}
      {tests.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-dashed border-zinc-300 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 font-serif">No 30-Mark Tests in Series Yet</h3>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
            All demo assessments have been cleared. Upload your 1st Year FA-IT textbook PDF in Book Library to auto-generate the 12-week 30-mark chapter assessment test series!
          </p>
          <div className="pt-2">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-100" />
              <span>⚡ Upload Book PDF &amp; Generate Series</span>
            </Link>
          </div>
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests
            .slice()
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((test) => {
              const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(test.title, test.date);

              return (
                <div
                  key={test.id}
                  className="p-5 rounded-3xl bg-white border border-[#e1ede7] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#e1ede7]">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 font-urdu-compact">
                          {day}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 uppercase tracking-wider">
                          {test.subjectCode}
                        </span>
                      </div>
                      <Badge
                        variant={test.status === 'graded' ? 'primary' : 'info'}
                        size="sm"
                        dot={test.status === 'scheduled'}
                      >
                        {test.status}
                      </Badge>
                    </div>

                    <h3
                      className={`mt-2.5 group-hover:text-emerald-700 transition-colors ${
                        isUrdu
                          ? 'font-urdu text-[15px] font-bold text-[#142D27] leading-loose text-right dir-rtl'
                          : 'text-sm font-bold text-[#142D27] leading-snug'
                      }`}
                    >
                      <bdi>{cleanTitle}</bdi>
                    </h3>
                    <p className="text-xs text-[#557067] mt-0.5">{test.subjectName}</p>

                    {/* Syllabus coverage */}
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
                      <p className="text-[10px] font-bold text-[#142D27] mb-0.5">Syllabus Covered:</p>
                      <p className="text-xs text-[#557067] leading-relaxed line-clamp-2">
                        {test.syllabusCoverage}
                      </p>
                    </div>

                    {/* Schedule Info */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#557067]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#14B866]" />
                        <span>{test.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>{test.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
                        <span>{test.durationMinutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-600" />
                        <span>{test.totalMarks} Marks</span>
                      </div>
                    </div>
                  </div>

              {/* Test Footer Actions */}
              <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                {test.studentScore !== undefined ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#557067]">My Score:</span>
                    <span className="text-sm font-bold text-[#14B866]">
                      {test.studentScore} / {test.totalMarks}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[#7d9990]">
                    Pass Marks: {test.passingMarks || Math.round(test.totalMarks * 0.4)}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  {role === 'teacher' && (
                    <>
                      {test.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          title="Dispatch 24h Countdown Reminder to Student Gmail"
                          icon={<Clock className="w-3.5 h-3.5 text-rose-600" />}
                          onClick={() => handleSendDeadlineReminder(test)}
                        >
                          24h Reminder
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<PlusCircle className="w-3.5 h-3.5 text-[#14B866]" />}
                        onClick={() => setAddQuestionModalTest(test)}
                      >
                        Questions
                      </Button>
                    </>
                  )}

                  {role === 'student' && test.status !== 'graded' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Clock className="w-3.5 h-3.5" />}
                      onClick={() => handleStartExam(test)}
                    >
                      Start Examination
                    </Button>
                  )}

                  {test.status === 'graded' && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setInspectGradeTest(test)}
                      >
                        Inspect Results
                      </Button>
                      {role === 'student' &&
                        (test.myAttempt?.passed === false ||
                          (test.studentScore !== undefined && test.studentScore < (test.passingMarks || 15))) && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<RefreshCw className="w-3.5 h-3.5" />}
                            onClick={() => handleStartExam(test)}
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                          >
                            Retest / Resubmit
                          </Button>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <EmptyState
          icon={<FileQuestion className="w-8 h-8 text-[#14B866]" />}
          title="No Assessments Found"
          description="No formal examinations match your search or selected filter."
          actionLabel="Reset Search"
          onAction={() => {
            setFilter('all');
            setSearchTerm('');
          }}
        />
      )}
        </>
      )}

      {/* STUDENT EXAMINATION RUNNER (LIVE EXAM MODAL VIA PORTAL TO PREVENT ANY CUT-OFF) */}
      {activeExamTest &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 pt-10 sm:pt-6 pb-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900">
              {/* Exam Header */}
              <div className="px-5 py-3.5 bg-[#142D27] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 uppercase tracking-widest text-[#14B866]">
                        {activeExamTest.subjectCode} Assessment
                      </span>
                      {((activeExamTest.studentScore !== undefined &&
                        activeExamTest.studentScore < (activeExamTest.passingMarks || 15)) ||
                        activeExamTest.myAttempt?.passed === false) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <RefreshCw className="w-2.5 h-2.5" />
                          Retest &amp; Re-evaluation
                        </span>
                      )}
                    </div>
                    <h2 className={`text-sm sm:text-base font-bold mt-1 text-white truncate ${
                      activeExamTest.title?.match(/[\u0600-\u06FF]/) ? 'font-urdu text-base sm:text-lg leading-relaxed' : ''
                    }`}>
                      {activeExamTest.title}
                    </h2>
                  </div>
                </div>

                {/* Right controls: Timer & Close */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Countdown Timer */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-extrabold border ${
                      remainingSeconds < 300
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse'
                        : 'bg-white/10 text-white border-white/20'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-[#14B866]" />
                    <span>{formatTime(remainingSeconds)}</span>
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          'Do you want to exit the examination? Unsaved progress will be preserved.'
                        )
                      ) {
                        setActiveExamTest(null);
                      }
                    }}
                    className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Exit examination"
                    title="Exit Examination"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Retest Banner if previous score failed */}
              {((activeExamTest.studentScore !== undefined &&
                activeExamTest.studentScore < (activeExamTest.passingMarks || 15)) ||
                activeExamTest.myAttempt?.passed === false) && (
                <div className="bg-rose-50/90 border-b border-rose-200 px-5 py-3 flex items-start gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-900">
                        Retest Submission &bull; Previous Score:{' '}
                        {activeExamTest.studentScore ?? 12}/{activeExamTest.totalMarks || 30}{' '}
                        (Passing: {activeExamTest.passingMarks || 15})
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800">
                        Evaluated by Ahmad
                      </span>
                    </div>
                    <p className="text-xs text-rose-700 mt-0.5 font-medium leading-relaxed">
                      Faculty Lead Feedback: &ldquo;
                      {activeExamTest.myAttempt?.feedback ||
                        'Diagram curve was incomplete and marginal utility schedule had arithmetic errors. Retest scheduled.'}
                      &rdquo;
                    </p>
                    <p className="text-[11px] text-rose-600 mt-1">
                      &bull; Please take fresh handwritten photos using{' '}
                      <strong>Take Photo (Camera)</strong> or select from{' '}
                      <strong>Upload from Gallery / Files</strong> below.
                    </p>
                  </div>
                </div>
              )}

              {/* Exam Body */}
              {(() => {
                const effectiveQuestions =
                  activeExamTest.questions && activeExamTest.questions.length > 0
                    ? activeExamTest.questions
                    : generateStandardFAITQuestions(
                        activeExamTest.subjectCode,
                        activeExamTest.title,
                        activeExamTest.id
                      );

                return (
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Question Navigator Drawer */}
                    <div className="w-full md:w-56 p-4 border-b md:border-b-0 md:border-r border-[#e1ede7] bg-[#F7F9F8] overflow-y-auto shrink-0 text-zinc-800">
                      <span className="text-xs font-bold text-[#142D27] block mb-3">
                        Question Palette ({effectiveQuestions.length})
                      </span>

                      <div className="grid grid-cols-4 md:grid-cols-3 gap-2">
                        {effectiveQuestions.map((q: TestQuestion, idx: number) => {
                          const ans = examAnswers.find((a) => a.questionId === q.id);
                          const isAnswered =
                            ans &&
                            (ans.selectedOptionId ||
                              (ans.textAnswer && ans.textAnswer.length > 0) ||
                              ans.fileUrl ||
                              uploadedSheets.length > 0);
                          const isCurrent = idx === currentQuestionIndex;
                          const isFlagged = ans?.isFlaggedForReview;

                          return (
                            <button
                              key={q.id}
                              onClick={() => setCurrentQuestionIndex(idx)}
                              className={`h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                                isCurrent
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-sm'
                                  : isFlagged
                                  ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                  : isAnswered
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                  : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                              }`}
                            >
                              {idx + 1}
                              {isFlagged && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#e1ede7] space-y-2 text-[10px] text-[#557067]">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                          <span>Answered / Attached</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" />
                          <span>Flagged for Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-white border border-zinc-200" />
                          <span>Not Attempted</span>
                        </div>
                      </div>
                    </div>

                    {/* Active Question Panel */}
                    <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between">
                      {effectiveQuestions.length > 0 ? (
                        <div>
                          {(() => {
                            const q = effectiveQuestions[currentQuestionIndex] || effectiveQuestions[0];
                            const ans = examAnswers.find((a) => a.questionId === q.id);

                        return (
                          <div className="space-y-4">
                            {/* Top Question Info */}
                            <div className="flex items-center justify-between pb-3 border-b border-[#e1ede7]">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#142D27]">
                                  Question {currentQuestionIndex + 1} of{' '}
                                  {effectiveQuestions.length}
                                </span>
                                <Badge variant="neutral" size="sm">
                                  {q.questionType.replace('_', ' ').toUpperCase()}
                                </Badge>
                                <Badge variant="primary" size="sm">
                                  {q.marks} Marks
                                </Badge>
                              </div>

                              <button
                                onClick={() =>
                                  handleUpdateCurrentAnswer({
                                    isFlaggedForReview: !ans?.isFlaggedForReview,
                                  })
                                }
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                                  ans?.isFlaggedForReview
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'text-zinc-400 hover:text-amber-600 bg-zinc-50'
                                }`}
                              >
                                <Flag className="w-3.5 h-3.5" />
                                {ans?.isFlaggedForReview ? 'Flagged' : 'Flag for review'}
                              </button>
                            </div>

                            {/* Question Text */}
                            <p className="text-sm font-semibold text-[#142D27] leading-relaxed">
                              {q.questionText}
                            </p>

                            {/* Options or Answer Input */}
                            {q.questionType === 'mcq' && q.options && (
                              <div className="space-y-2.5 pt-2">
                                {q.options.map((opt: TestOption) => {
                                  const isSelected = ans?.selectedOptionId === opt.id;
                                  return (
                                    <label
                                      key={opt.id}
                                      onClick={() =>
                                        handleUpdateCurrentAnswer({ selectedOptionId: opt.id })
                                      }
                                      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'border-[#14B866] bg-emerald-50/50 shadow-xs'
                                          : 'border-[#e1ede7] bg-white hover:border-[#14B866]/40'
                                      }`}
                                    >
                                      <div
                                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected
                                            ? 'border-[#14B866] bg-[#14B866] text-white'
                                            : 'border-zinc-300 bg-white'
                                        }`}
                                      >
                                        {isSelected && (
                                          <span className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                      </div>
                                      <span className="text-xs text-[#142D27]">
                                        {opt.optionText}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {(q.questionType === 'short_answer' ||
                              q.questionType === 'long_answer') && (
                              <div className="pt-2">
                                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                                  Enter Your Written Answer:
                                </label>
                                <textarea
                                  rows={q.questionType === 'long_answer' ? 6 : 4}
                                  value={ans?.textAnswer || ''}
                                  onChange={(e) =>
                                    handleUpdateCurrentAnswer({ textAnswer: e.target.value })
                                  }
                                  placeholder="Type theoretical derivations, proof arguments, or code logic here..."
                                  className="w-full p-3.5 text-xs rounded-2xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
                                />
                              </div>
                            )}

                            {/* Solution Upload via Camera or Gallery (Available on File Upload Question OR in Retest mode) */}
                            {(q.questionType === 'file_upload' ||
                              uploadedSheets.length > 0 ||
                              (activeExamTest.studentScore !== undefined &&
                                activeExamTest.studentScore <
                                  (activeExamTest.passingMarks || 15)) ||
                              activeExamTest.myAttempt?.passed === false) && (
                              <div className="pt-2 space-y-3">
                                <div className="flex items-center justify-between">
                                  <label className="block text-xs font-bold text-[#142D27]">
                                    Handwritten Solution Paper Upload:
                                  </label>
                                  <span className="text-[11px] text-zinc-500">
                                    Camera or Gallery supported
                                  </span>
                                </div>

                                {/* Camera & Gallery Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  {/* Camera Capture */}
                                  <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]">
                                    <Camera className="w-4 h-4" />
                                    <span>Take Photo (Camera)</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      capture="environment"
                                      onChange={(e) => handleUploadFiles(e.target.files)}
                                      className="hidden"
                                    />
                                  </label>

                                  {/* Gallery Upload */}
                                  <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#142D27] hover:bg-[#1f4239] text-white font-semibold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]">
                                    <ImageIcon className="w-4 h-4" />
                                    <span>Upload from Gallery / Files</span>
                                    <input
                                      type="file"
                                      accept="image/*,.pdf"
                                      multiple
                                      onChange={(e) => handleUploadFiles(e.target.files)}
                                      className="hidden"
                                    />
                                  </label>
                                </div>

                                {/* Uploaded Sheets Preview List */}
                                {uploadedSheets.length > 0 && (
                                  <div className="space-y-2 mt-3 pt-3 border-t border-zinc-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-[#142D27] flex items-center gap-1.5">
                                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                                        Attached Solution Sheets ({uploadedSheets.length})
                                      </span>
                                      <span className="text-[10px] text-zinc-500">
                                        Ready for teacher review
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                      {uploadedSheets.map((sheet, sIdx) => (
                                        <div
                                          key={sheet.id}
                                          className="relative rounded-xl border border-zinc-200 bg-white p-2 flex flex-col items-center text-center shadow-xs"
                                        >
                                          {sheet.previewUrl ? (
                                            <img
                                              src={sheet.previewUrl}
                                              alt={sheet.name}
                                              className="w-full h-20 object-cover rounded-lg mb-1.5 border border-zinc-100"
                                            />
                                          ) : (
                                            <div className="w-full h-20 rounded-lg bg-zinc-100 flex items-center justify-center mb-1.5 text-zinc-400">
                                              <FileText className="w-6 h-6 text-emerald-600" />
                                            </div>
                                          )}
                                          <span className="text-[11px] font-bold text-zinc-800 truncate w-full">
                                            Page {sIdx + 1}: {sheet.name}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveSheet(sheet.id)}
                                            className="mt-1 text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            Remove
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Notes to Ahmad */}
                                <div className="mt-3">
                                  <label className="block text-xs font-semibold text-[#142D27] mb-1">
                                    Notes to Ahmad (Faculty Lead):
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={studentRetestNotes}
                                    onChange={(e) => setStudentRetestNotes(e.target.value)}
                                    placeholder="e.g. Corrected the schedule table and redrew the downward sloping curve with axes labeled as instructed..."
                                    className="w-full p-2.5 text-xs rounded-xl border border-[#e1ede7] bg-white focus:outline-none focus:border-[#14B866]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-400">No questions loaded for this test.</p>
                  )}

                  {/* Bottom Navigation Ribbon */}
                  <div className="pt-4 mt-4 border-t border-[#e1ede7] flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentQuestionIndex === 0}
                      icon={<ChevronLeft className="w-4 h-4" />}
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {currentQuestionIndex < effectiveQuestions.length - 1 ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setCurrentQuestionIndex((prev) =>
                              Math.min(effectiveQuestions.length - 1, prev + 1)
                            )
                          }
                        >
                          Next Question
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsSubmitConfirmOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Finalize &amp; Submit Test
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                );
              })()}
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION SUBMIT DIALOG */}
      <Modal
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        title="Finalize Test Submission"
        description="Are you sure you want to finish this examination? You cannot modify answers after submission."
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs space-y-1.5">
            <div className="flex justify-between text-[#557067]">
              <span>Total Questions:</span>
              <strong className="text-[#142D27]">
                {activeExamTest?.questions?.length || 0}
              </strong>
            </div>
            <div className="flex justify-between text-[#557067]">
              <span>Answered:</span>
              <strong className="text-emerald-700">
                {
                  examAnswers.filter(
                    (a) =>
                      a.selectedOptionId ||
                      (a.textAnswer && a.textAnswer.length > 0) ||
                      a.fileUrl
                  ).length
                }
              </strong>
            </div>
            <div className="flex justify-between text-[#557067]">
              <span>Flagged for Review:</span>
              <strong className="text-amber-700">
                {examAnswers.filter((a) => a.isFlaggedForReview).length}
              </strong>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSubmitConfirmOpen(false)}
            >
              Return to Exam
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmSubmitExam}
            >
              Submit Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* SCHEDULE ASSESSMENT MODAL (TEACHER) */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Academic Assessment"
        description="Configure unit diagnostic assessments or term examinations."
      >
        <form onSubmit={handleSubmit(onScheduleSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Assessment Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Vectors & 3D Geometry Unit Assessment"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject</label>
              <select
                {...register('subjectId')}
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
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Assignee Target
              </label>
              <select
                {...register('assignedTo')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="all">Entire Enrolled Cohort</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {units.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Syllabus Chapter (Optional)
              </label>
              <select
                {...register('unitId')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="">General Subject Examination</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unitNumber}: {u.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Time Window</label>
              <input
                type="text"
                {...register('time')}
                placeholder="10:00 AM – 11:30 AM"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Duration (mins)
              </label>
              <input
                type="number"
                {...register('durationMinutes', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Total Marks</label>
              <input
                type="number"
                {...register('totalMarks', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Passing Marks
              </label>
              <input
                type="number"
                {...register('passingMarks', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Syllabus Coverage Summary
            </label>
            <input
              type="text"
              {...register('syllabusCoverage')}
              placeholder="e.g. Dot/Cross products, planes in R3, parametric curves"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Special Examination Instructions
            </label>
            <textarea
              rows={2}
              {...register('instructions')}
              placeholder="Scientific calculators permitted; show step-by-step vector derivations..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsScheduleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isScheduling}
              loadingText="Publishing Exam..."
            >
              Publish Assessment
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADD QUESTION MODAL (TEACHER) */}
      <Modal
        isOpen={!!addQuestionModalTest}
        onClose={() => setAddQuestionModalTest(null)}
        title={addQuestionModalTest ? `Add Question: ${addQuestionModalTest.title}` : 'Add Question'}
        description="Attach MCQ, Short Answer, or File Upload questions to this test."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Question Type</label>
            <select
              value={newQType}
              onChange={(e) =>
                setNewQType(
                  e.target.value as 'mcq' | 'short_answer' | 'long_answer' | 'file_upload'
                )
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
            >
              <option value="mcq">Multiple Choice (MCQ)</option>
              <option value="short_answer">Short Written Answer</option>
              <option value="long_answer">Long Written Answer</option>
              <option value="file_upload">Handwritten File Upload</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Question Prompt</label>
            <textarea
              rows={2}
              value={newQText}
              onChange={(e) => setNewQText(e.target.value)}
              placeholder="State the mathematical problem or conceptual question..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          {newQType === 'mcq' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#142D27]">
                Options (Select the correct answer):
              </label>
              {newQOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-option-group"
                    checked={opt.isCorrect}
                    onChange={() =>
                      setNewQOptions((prev) =>
                        prev.map((o, i) => ({ ...o, isCorrect: i === idx }))
                      )
                    }
                    className="accent-[#14B866]"
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewQOptions((prev) =>
                        prev.map((o, i) => (i === idx ? { ...o, text: val } : o))
                      );
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#e1ede7]"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Marks for Question
              </label>
              <input
                type="number"
                value={newQMarks}
                onChange={(e) => setNewQMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Explanation (Hidden from student)
              </label>
              <input
                type="text"
                value={newQExplanation}
                onChange={(e) => setNewQExplanation(e.target.value)}
                placeholder="Full derivation or proof reference..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddQuestionModalTest(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddQuestionSubmit}>
              Save Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* TEACHER GRADE MODAL */}
      <Modal
        isOpen={!!gradingTest}
        onClose={() => setGradingTest(null)}
        title="Check & Grade Student Submission"
        description="Faculty Lead Evaluation Gate & Official Certification"
      >
        {gradingTest && (
          <div className="space-y-4 text-xs">
            {/* Student & Test Banner */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-900 text-sm">{gradingTest.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {gradingTest.subjectCode}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
                <span className="font-semibold text-zinc-700">Student: Henza Noor (1st Year FA-IT)</span>
                <span>&bull;</span>
                <span>Max Marks: {gradingTest.totalMarks} (Passing: 15)</span>
              </div>
            </div>

            {/* Student Solution Sheet & Answers Preview */}
            <div className="p-3.5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] text-[#142D27] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Submitted Solution Sheet (Handwritten Paper)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  BISE DG Khan Pattern
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#e1ede7] text-xs text-[#263B35] space-y-1">
                <p className="text-emerald-700 font-bold">&bull; Question 1 (MCQ Section): Option B Selected (Correct)</p>
                <p className="text-[#557067]">&bull; Question 2 (Short Conceptual): "Differentiated Bus & Star topologies with single point of failure analysis."</p>
                <p className="text-[#557067]">&bull; Question 3 (Handwritten Upload): Scanned answer sheet with neatly drawn topology diagrams and pinouts.</p>
              </div>
            </div>

            {/* Marks Award Input */}
            <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-zinc-900 text-xs">Award Marks</label>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {gradingMarks} / {gradingTest.totalMarks} Marks ({Math.round((gradingMarks / gradingTest.totalMarks) * 100)}%)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={gradingTest.totalMarks}
                  value={gradingMarks}
                  onChange={(e) => setGradingMarks(Number(e.target.value))}
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <input
                  type="number"
                  min={0}
                  max={gradingTest.totalMarks}
                  value={gradingMarks}
                  onChange={(e) => setGradingMarks(Math.min(gradingTest.totalMarks, Math.max(0, Number(e.target.value))))}
                  className="w-16 h-9 px-2 text-center text-sm font-mono font-bold rounded-xl border border-zinc-300 focus:outline-none focus:border-emerald-600 text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-zinc-500">Benchmark: 15/30 to Pass</span>
                <span className={`font-bold ${gradingMarks >= 15 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {gradingMarks >= 15 ? '✓ PASSED (Grade A*)' : '⚠ RETEST REQUIRED (<15)'}
                </span>
              </div>
            </div>

            {/* Teacher Remarks */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1">
                Teacher Remarks &amp; Feedback (Ahmad - Faculty Lead)
              </label>
              <textarea
                rows={3}
                value={gradingRemarks}
                onChange={(e) => setGradingRemarks(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                placeholder="Write specific feedback for Henza Noor..."
              />
            </div>

            {/* Signature & Submit Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Certified Evaluator: <strong>Ahmad</strong></span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setGradingTest(null)}
                  className="flex-1 sm:flex-none text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handleCertifyGrade}
                  className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-xs font-bold"
                >
                  Certify &amp; Release Grade
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* INSPECT RESULTS MODAL */}
      <Modal
        isOpen={!!inspectGradeTest}
        onClose={() => setInspectGradeTest(null)}
        title={inspectGradeTest ? `Results: ${inspectGradeTest.title}` : 'Assessment Results'}
        description={`${inspectGradeTest?.subjectName} (${inspectGradeTest?.subjectCode})`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center justify-between">
            <div>
              <span className="text-xs text-[#557067] block">Certified Score:</span>
              <span className="text-2xl font-black text-[#14B866]">
                {inspectGradeTest?.studentScore || 92} / {inspectGradeTest?.totalMarks}
              </span>
            </div>
            <div className="text-right">
              <Badge variant="primary" size="md">
                Passed &bull; Grade A*
              </Badge>
              <span className="text-[11px] text-[#7d9990] block mt-1">
                Evaluated by Examination Faculty
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInspectGradeTest(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
