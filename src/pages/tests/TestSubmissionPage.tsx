import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Camera,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  BookOpen,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Award,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  Maximize2,
  Printer,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  testService,
  extractDayAndCleanTitle,
  getLocalCertifiedResults,
  getLocalTestStatuses,
} from '../../services/testService';
import { submissionService } from '../../services/submissionService';
import { notificationService } from '../../services/notificationService';
import { TestItem, ResultRecord } from '../../types';
import { SAMPLE_TESTS, SAMPLE_SUBJECTS } from '../../data/sampleData';
import { ACADEMIC_WEEKS } from '../../components/tests/DailyTestSeriesGrid';
import { useRole } from '../../hooks/useRole';
import { getTextbookDetailsForTest } from '../../data/textbookContent';
import { PDFViewerModal } from '../../components/books/PDFViewerModal';

interface UploadedPage {
  id: string;
  name: string;
  size: string;
  previewUrl: string;
  file?: File;
  pageNumber: number;
}

export const TestSubmissionPage: React.FC = () => {
  const { user } = useRole();
  const [searchParams] = useSearchParams();
  const queryTestId = searchParams.get('testId');

  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [activeTest, setActiveTest] = useState<TestItem | null>(null);
  const [isRetakeMode, setIsRetakeMode] = useState<boolean>(false);

  // Multi-page camera / file uploads
  const [uploadedPages, setUploadedPages] = useState<UploadedPage[]>([]);
  const [studentComment, setStudentComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [zoomPage, setZoomPage] = useState<UploadedPage | null>(null);
  const [pdfViewerTest, setPdfViewerTest] = useState<TestItem | null>(null);

  // Filter and search for all tests timeline
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'passed' | 'retest' | 'under_review'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Certified marks and submission status maps
  const [certifiedResults, setCertifiedResults] = useState<ResultRecord[]>([]);
  const [testStatuses, setTestStatuses] = useState<Record<string, { status: string; score?: number }>>({});

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topTerminalRef = useRef<HTMLDivElement>(null);

  // Load all tests, statuses, and certified grades
  const loadData = () => {
    testService.fetchTests(user?.id).then((data) => {
      if (data && data.length > 0) {
        setTests(data);

        // Select active test: from URL query, or default to today's active test (Nov 17, 2026), or first
        if (queryTestId) {
          const matched = data.find((t) => t.id === queryTestId);
          if (matched) setActiveTest(matched);
          else setActiveTest(data[0]);
        } else if (!activeTest) {
          const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
          const todayMatch = data.find((t) => t.date === todayFormatted || t.date.includes('Nov 16') || t.id.includes('ped_w1')) || data[0];
          setActiveTest(todayMatch);
        }
      }
    });

    const localCert = getLocalCertifiedResults();
    setCertifiedResults(localCert);

    const statuses = getLocalTestStatuses();
    setTestStatuses(statuses);
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('studyhub_tests_updated', handleSync);
    window.addEventListener('studyhub_submissions_updated', handleSync);
    window.addEventListener('studyhub_certified_results_update', handleSync);

    return () => {
      window.removeEventListener('studyhub_tests_updated', handleSync);
      window.removeEventListener('studyhub_submissions_updated', handleSync);
      window.removeEventListener('studyhub_certified_results_update', handleSync);
    };
  }, [user, queryTestId]);

  // When active test changes, clear uploaded pages or set retake mode
  const handleSelectTest = (test: TestItem, forceRetake: boolean = false) => {
    setActiveTest(test);
    setIsRetakeMode(forceRetake);
    setUploadedPages([]);
    setStudentComment('');
    if (topTerminalRef.current) {
      topTerminalRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle camera capture or file browse
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPages: UploadedPage[] = Array.from(files).map((file, idx) => ({
      id: `page_${Date.now()}_${idx}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      previewUrl: URL.createObjectURL(file),
      file,
      pageNumber: uploadedPages.length + idx + 1,
    }));

    setUploadedPages((prev) => [...prev, ...newPages]);
    e.target.value = '';
  };

  const handleRemovePage = (id: string) => {
    setUploadedPages((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p, idx) => ({ ...p, pageNumber: idx + 1 }))
    );
  };

  // Submit test solutions to Ahmad Sir
  const handleSubmitTestSolution = async () => {
    if (!activeTest || uploadedPages.length === 0) return;
    setIsSubmitting(true);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const fileNameSummary =
        uploadedPages.length === 1
          ? uploadedPages[0].name
          : `${activeTest.subjectCode}_solution_${uploadedPages.length}_pages.pdf`;

      await submissionService.createSubmission({
        assignmentId: activeTest.id,
        assignmentTitle: activeTest.title,
        subjectName: activeTest.subjectName,
        studentId: user?.id || 'usr_henza_noor',
        studentName: user?.name || 'Henza Noor',
        maxScore: activeTest.totalMarks || 30,
        comment: studentComment || (isRetakeMode ? 'Retake Attempt Solution Paper' : 'Daily Test Solution Paper'),
        fileName: fileNameSummary,
        fileSize: `${(uploadedPages.length * 1.4).toFixed(1)} MB`,
        pageCount: uploadedPages.length,
        pageThumbnails: uploadedPages.map((p) => p.previewUrl),
        isRetest: isRetakeMode,
      });

      notificationService.notifyStudentSubmission(
        user?.name || 'Henza Noor',
        activeTest.title
      );

      setIsSubmitting(false);
      setUploadedPages([]);
      setStudentComment('');
      setIsRetakeMode(false);
      setSuccessToast(
        `🎉 30-Marks Answer Sheet for "${activeTest.subjectName}" submitted successfully! Ahmad Sir has been notified to evaluate and award certified marks.`
      );

      // Refresh local test status
      loadData();
    } catch {
      setIsSubmitting(false);
      setSuccessToast('Submission completed and saved to examination ledger.');
    }
  };

  // Certified result for the active test
  const activeCertified = activeTest
    ? certifiedResults.find((r) => r.testId === activeTest.id)
    : undefined;
  const activeLocalStatus = activeTest ? testStatuses[activeTest.id] : undefined;
  const isPreviouslyFailed =
    (activeCertified && activeCertified.score < 15) || activeLocalStatus?.status === 'failed_retest';

  // Details for current test textbook & questions
  const bookDetails = activeTest ? getTextbookDetailsForTest(activeTest) : null;
  const activeDayAndTitle = activeTest
    ? extractDayAndCleanTitle(activeTest.title, activeTest.date)
    : { day: 'Tuesday', cleanTitle: '', isUrdu: false };

  // Sort tests: Newest / Today's test at the VERY TOP, followed by scheduled tests
  const sortedTests = [...tests].sort((a, b) => {
    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const isTodayA = a.date === todayFormatted || a.date.includes('Nov 16');
    const isTodayB = b.date === todayFormatted || b.date.includes('Nov 16');
    if (isTodayA && !isTodayB) return -1;
    if (!isTodayA && isTodayB) return 1;
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    return timeA - timeB;
  });

  // Filtered list for the series cards timeline
  const filteredTests = sortedTests.filter((test) => {
    // Week filter (w1 ... w15)
    if (selectedWeek !== 'all') {
      const matchId = test.id.includes(`_${selectedWeek}`) || test.id.endsWith(`_${selectedWeek}`);
      if (!matchId) {
        const base = new Date(2026, 10, 16);
        const testDate = new Date(test.date);
        if (!isNaN(testDate.getTime())) {
          const diffWeeks = Math.floor((testDate.getTime() - base.getTime()) / (7 * 24 * 3600 * 1000)) + 1;
          if (`w${diffWeeks}` !== selectedWeek) return false;
        } else {
          return false;
        }
      }
    }

    // Subject filter
    if (selectedSubjectId !== 'all' && test.subjectId !== selectedSubjectId) return false;

    const cert = certifiedResults.find((r) => r.testId === test.id);
    const stat = testStatuses[test.id]?.status;

    if (filterTab === 'today') {
      const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      return test.date === todayFormatted || test.date.includes('Nov 16') || test.id.includes('ped_w1');
    }
    if (filterTab === 'passed') {
      return (cert && cert.passed) || stat === 'passed' || (cert && cert.score >= 15);
    }
    if (filterTab === 'retest') {
      return (cert && cert.score < 15) || stat === 'failed_retest';
    }
    if (filterTab === 'under_review') {
      return stat === 'submitted' && !cert;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        test.title.toLowerCase().includes(q) ||
        test.subjectName.toLowerCase().includes(q) ||
        test.subjectCode.toLowerCase().includes(q) ||
        test.date.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-7 pb-16">
      {/* Hidden camera & file pickers */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelection}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleFileSelection}
        className="hidden"
      />

      {/* Floating Success Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#142D27] flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in duration-200">
          <span className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-[#557067] hover:text-[#142D27] text-base font-bold ml-3"
          >
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white font-serif">Daily Test Submission Terminal</h1>
            <Badge variant="primary" size="sm" dot>
              30 Marks BISE DG Khan Pattern
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Official testing desk: review questions on the left, capture multiple answer pages via camera on the right, and submit for teacher evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTest && (
            <button
              onClick={() => setPdfViewerTest(activeTest)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2e3533] border border-white/10 text-xs font-bold text-zinc-200 hover:bg-white/10 hover:text-white transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>View Textbook in PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* HERO SPLIT WORKSPACE: Left Question Paper, Right Camera Submission */}
      {activeTest && (
        <div
          ref={topTerminalRef}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 rounded-3xl bg-white border border-[#e1ede7] p-4 sm:p-6 shadow-sm"
        >
          {/* LEFT COLUMN: Testing Paper & Examination Questions (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 pr-0 lg:pr-3 border-b lg:border-b-0 lg:border-r border-[#e1ede7] pb-5 lg:pb-0">
            <div>
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#e1ede7]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 font-urdu-compact">
                    {activeDayAndTitle.day}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-bold border border-zinc-200">
                    {activeTest.subjectCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    30 Marks Total
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#557067]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {activeTest.durationMinutes || 45} Mins
                  </span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-bold">Passing: 15 / 30 (50%)</span>
                </div>
              </div>

              {/* Title in Authentic Urdu Font without BiDi flip */}
              <div className="mt-3.5">
                <h2 className="font-urdu text-xl font-bold leading-loose text-[#142D27] text-right dir-rtl">
                  <bdi>{activeDayAndTitle.cleanTitle}</bdi>
                </h2>
                <p className="text-xs text-[#557067] font-medium mt-1">
                  {activeTest.subjectName} &bull; BISE DG Khan FA-IT Examination Standard
                </p>
              </div>

              {/* Retake Notice if active */}
              {(isRetakeMode || isPreviouslyFailed) && (
                <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                  <RotateCcw className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold block text-rose-800">
                      🔄 Retest &amp; Re-upload Mode Active
                    </span>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      Your previous score was{' '}
                      <strong>{activeCertified?.score ?? activeLocalStatus?.score ?? 11}/30</strong>. Submit fresh, corrected answer sheets to clear the 15-mark passing threshold.
                    </p>
                  </div>
                </div>
              )}

              {/* Certified Grade Banner if already graded */}
              {activeCertified && !isRetakeMode && (
                <div className={`mt-3 p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  activeCertified.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <Award className={`w-4 h-4 mt-0.5 shrink-0 ${activeCertified.passed ? 'text-emerald-600' : 'text-rose-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        {activeCertified.passed ? 'Certified Grade: ' : 'Retest Required: '}
                        {activeCertified.score} / {activeCertified.maxScore} Marks ({activeCertified.grade})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        activeCertified.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {activeCertified.passed ? 'PASSED ✅' : 'RETEST ⚠️'}
                      </span>
                    </div>
                    {activeCertified.feedback && (
                      <p className="text-[11px] mt-1 italic opacity-90">
                        &quot;{activeCertified.feedback}&quot; — Ahmad (Faculty Lead)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Syllabus & Instructions Boxes */}
              <div className="mt-3.5 space-y-2">
                <div className="p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
                  <span className="font-bold text-[#142D27] block mb-1">📖 Syllabus Covered (Textbook Pages):</span>
                  <p className="font-urdu text-[13px] text-right dir-rtl leading-loose text-[#142D27]">
                    {activeTest.syllabusCoverage}
                  </p>
                </div>

                {activeTest.instructions && (
                  <div className="p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
                    <span className="font-bold text-[#142D27] block mb-1">✍️ Ahmad&apos;s Teacher Instructions:</span>
                    <p className="font-urdu text-[13px] text-right dir-rtl leading-loose text-[#142D27]">
                      {activeTest.instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* CURATED QUESTION PAPER BREAKDOWN (30 Marks BISE DG Khan) */}
              <div className="mt-4 pt-3 border-t border-[#e1ede7] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#557067] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Formal Test Paper (30 Marks)
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-700">Section A, B &amp; C</span>
                </div>

                {/* Section A: MCQs (10 Marks) */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#e1ede7]">
                    <span className="text-xs font-bold text-[#142D27]">حreader حصہ اوّل — کثیر الانتخابی سوالات (Section A: MCQs)</span>
                    <span className="text-[11px] font-bold text-emerald-700">10 Marks</span>
                  </div>
                  {bookDetails?.chapter?.boardQuestions?.filter((q) => q.type === 'mcq').length ? (
                    <div className="space-y-2">
                      {bookDetails.chapter.boardQuestions
                        .filter((q) => q.type === 'mcq')
                        .map((q, idx) => (
                          <div key={idx} className="text-xs text-right dir-rtl">
                            <p className="font-urdu text-[13px] font-bold text-[#142D27] leading-loose">
                              سوال {idx + 1}: {q.question}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-urdu text-[13px] text-right dir-rtl leading-loose text-[#142D27]">
                        1. درسی کتاب کے سبق اور خلاصہ سے 10 اہم معروضی کثیر الانتخابی سوالات حل کریں۔
                      </p>
                      <p className="font-urdu text-[13px] text-right dir-rtl leading-loose text-[#557067]">
                        (الف) درست جواب کا انتخاب کریں اور اپنی جوابی کاپی پر نمبر شمار کے ساتھ واضح تحریر کریں)
                      </p>
                    </div>
                  )}
                </div>

                {/* Section B: Short Questions (10 Marks) */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#e1ede7]">
                    <span className="text-xs font-bold text-[#142D27]">حصہ دوم — مختصر سوالات (Section B: Short Questions)</span>
                    <span className="text-[11px] font-bold text-emerald-700">10 Marks (5 &times; 2M)</span>
                  </div>
                  <div className="space-y-2">
                    {bookDetails?.chapter?.boardQuestions
                      ?.filter((q) => q.type === 'short')
                      .slice(0, 3)
                      .map((q, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-right dir-rtl">
                          <p className="font-urdu text-[13px] font-bold text-[#142D27] leading-loose">
                            س {idx + 1}: {q.question}
                          </p>
                        </div>
                      ))}
                    <div className="p-2 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-right dir-rtl">
                      <p className="font-urdu text-[13px] font-bold text-[#142D27] leading-loose">
                        س 4: بورڈ پیٹرن کے مطابق باب کی بنیادی اصطلاحات اور اہم نکات کی مختصر تعریف کریں۔
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section C: Long Question / Diagram / Practical (10 Marks) */}
                <div className="p-3.5 rounded-2xl bg-white border border-[#e1ede7] space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#e1ede7]">
                    <span className="text-xs font-bold text-[#142D27]">حصہ سوم — تفصیلی سوال و خاکہ (Section C: Long / Essay)</span>
                    <span className="text-[11px] font-bold text-emerald-700">10 Marks</span>
                  </div>
                  {bookDetails?.chapter?.boardQuestions?.find((q) => q.type === 'long') ? (
                    <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-right dir-rtl">
                      <p className="font-urdu text-[13px] font-bold text-[#142D27] leading-loose">
                        {bookDetails.chapter.boardQuestions.find((q) => q.type === 'long')?.question}
                      </p>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-right dir-rtl">
                      <p className="font-urdu text-[13px] font-bold text-[#142D27] leading-loose">
                        سوال: عنوان کا مکمل جامع خلاصہ، متعلقہ خاکہ (Diagram) یا تشریح خوشخط تحریر کریں۔
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions for Question Paper */}
            <div className="pt-4 border-t border-[#e1ede7] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPdfViewerTest(activeTest)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Read Topic in PDF Textbook</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-200 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-500" />
                <span>Print Paper</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Multi-Page Camera & File Submission Terminal (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4 pl-0 lg:pl-3">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#e1ede7]">
                <div>
                  <h3 className="text-sm font-bold text-[#142D27] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    Answer Sheet Submission Desk
                  </h3>
                  <p className="text-[11px] text-[#557067]">
                    Capture handwritten pages using camera or select files.
                  </p>
                </div>

                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {uploadedPages.length} {uploadedPages.length === 1 ? 'Page' : 'Pages'} Added
                </span>
              </div>

              {/* Dual Action Buttons: Camera & File Browser */}
              <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow active:scale-98 cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                  <span>📷 Take Photo (Camera)</span>
                  <span className="text-[10px] text-emerald-100 font-normal">Snap page by page</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-white hover:bg-zinc-50 text-[#142D27] font-bold text-xs border border-[#e1ede7] flex flex-col items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Upload className="w-5 h-5 text-[#142D27]" />
                  <span>📁 Browse Files / PDF</span>
                  <span className="text-[10px] text-[#7d9990] font-normal">Select multiple files</span>
                </button>
              </div>

              {/* Multi-Page Uploaded Thumbnails Grid */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D27]">
                    Attached Solution Sheets ({uploadedPages.length}):
                  </span>
                  {uploadedPages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setUploadedPages([])}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>

                {uploadedPages.length === 0 ? (
                  <div
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-6 rounded-2xl border-2 border-dashed border-[#ccdcd4] bg-[#fafcfb] hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors cursor-pointer text-center space-y-2"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white border border-[#e1ede7] flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-[#142D27]">No pages captured yet</p>
                    <p className="text-[11px] text-[#7d9990] max-w-xs mx-auto leading-relaxed">
                      Tap <strong>Take Photo</strong> on your phone to capture each handwritten page of your solution. Passing is 15/30 marks.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                    {uploadedPages.map((page) => (
                      <div
                        key={page.id}
                        className="group relative rounded-xl border border-[#e1ede7] bg-white p-1.5 shadow-2xs flex flex-col justify-between overflow-hidden"
                      >
                        <div className="relative aspect-[3/4] bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {page.previewUrl ? (
                            <img
                              src={page.previewUrl}
                              alt={page.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-8 h-8 text-zinc-400" />
                          )}

                          {/* Quick Page Number Pill */}
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-zinc-900/75 backdrop-blur-xs text-white text-[10px] font-bold">
                            Page {page.pageNumber}
                          </span>

                          {/* Zoom & Delete Actions Overlay */}
                          <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setZoomPage(page)}
                              className="p-1.5 rounded-lg bg-white/90 text-zinc-900 hover:bg-white transition-colors"
                              title="Zoom page"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePage(page.id)}
                              className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                              title="Delete page"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[10px] text-[#557067] px-0.5">
                          <span className="truncate max-w-[80px]">{page.name}</span>
                          <span className="font-semibold">{page.size}</span>
                        </div>
                      </div>
                    ))}

                    {/* Add More Button inside grid */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#ccdcd4] bg-[#fafcfb] hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex flex-col items-center justify-center gap-1 text-[#557067] hover:text-emerald-700 cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[10px] font-bold">+ Page {uploadedPages.length + 1}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Student Remarks / Notes */}
              <div className="mt-3.5">
                <label className="text-xs font-bold text-[#142D27] block mb-1">
                  Optional Note for Ahmad Sir:
                </label>
                <textarea
                  rows={2}
                  value={studentComment}
                  onChange={(e) => setStudentComment(e.target.value)}
                  placeholder="e.g. Completed Section A MCQs, Section B short questions, and Section C diagram. Retest attempt..."
                  className="w-full p-2.5 text-xs rounded-xl bg-white border border-[#e1ede7] text-[#142D27] placeholder-[#7d9990] focus:border-emerald-500 focus:outline-none resize-none shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Button CTA */}
            <div className="pt-3 border-t border-[#e1ede7]">
              <Button
                variant="primary"
                size="lg"
                disabled={uploadedPages.length === 0 || isSubmitting}
                onClick={handleSubmitTestSolution}
                className="w-full justify-center text-xs sm:text-sm font-bold py-3 bg-emerald-600 hover:bg-emerald-500"
                icon={<Check className="w-4 h-4" />}
              >
                {isSubmitting
                  ? 'Submitting Answer Sheets...'
                  : `Submit 30-Marks Test (${uploadedPages.length} Pages)`}
              </Button>
              <p className="text-[10px] text-center text-[#7d9990] mt-1.5">
                Once submitted, Ahmad Sir verifies handwritten work &amp; issues official certified marks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TIMELINE OF ALL TESTS (PAST 1 MONTH THROUGH FEB 28) - SERIES BENTO CARDS */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#142D27] font-serif flex items-center gap-2">
              <span>All Examination Series &amp; Test Records</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                {sortedTests.length} Total Tests
              </span>
            </h2>
            <p className="text-xs text-[#557067] mt-0.5">
              Complete archive from past months through Feb 28, 2027. Newest and active tests at the top. Retake any test to improve your score.
            </p>
          </div>

          {/* 3 Unified Filter Dropdowns (Week, Subject, Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] w-full">
            {/* 1. Academic Week Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Academic Week
              </label>
              <div className="relative">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
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

            {/* 2. Subject Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Subject ({SAMPLE_SUBJECTS.length})
              </label>
              <div className="relative">
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All {SAMPLE_SUBJECTS.length} Subjects</option>
                  {SAMPLE_SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Status Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Test Status
              </label>
              <div className="relative">
                <select
                  value={filterTab}
                  onChange={(e) => setFilterTab(e.target.value as any)}
                  className="w-full h-9 px-3 pr-8 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 hover:border-zinc-300 focus:border-emerald-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All Tests ({tests.length})</option>
                  <option value="today">Today's Active</option>
                  <option value="passed">Passed (15-30 Marks)</option>
                  <option value="retest">Retest Needed (&lt;15 Marks)</option>
                  <option value="under_review">Awaiting Check</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d9990]" />
          <input
            type="text"
            placeholder="Search by test title in Urdu, subject name, or course code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#e1ede7] rounded-2xl text-[#142D27] placeholder-[#7d9990] focus:border-emerald-500 focus:outline-none shadow-2xs"
          />
        </div>

        {/* SERIES CARDS BENTO GRID: Responsive 1-col on mobile, 2-col on md, 3-col on lg */}
        {filteredTests.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900">No Tests Found in this Filter</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Switch the week, subject, or status dropdown above to view tests.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTests.map((test) => {
              const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(test.title, test.date);
              const cert = certifiedResults.find((r) => r.testId === test.id);
              const statusInfo = testStatuses[test.id];
              const score = cert?.score ?? statusInfo?.score ?? test.studentScore;
              const isPassed = (cert && cert.passed) || (score !== undefined && score >= 15);
              const isRetest = (cert && !cert.passed) || (score !== undefined && score < 15);
              const isSubmitted = statusInfo?.status === 'submitted' && !cert;
              const isSelected = activeTest?.id === test.id;

              return (
                <div
                  key={test.id}
                  className={`p-4 rounded-2xl bg-white border transition-none flex flex-col justify-between h-[215px] min-h-[215px] shadow-xs select-none ${
                    isSelected
                      ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-zinc-200'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Day, Code, & Marks Pill Row */}
                    <div className="flex items-center justify-between gap-1 pb-2 border-b border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 font-urdu-compact">
                          {day}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[10px] font-bold border border-zinc-200">
                          {test.subjectCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <span>30M</span>
                        <span className="text-zinc-300">&bull;</span>
                        <span className="text-zinc-500 font-semibold">{test.durationMinutes || 45}m</span>
                      </div>
                    </div>

                    {/* Title & Subject */}
                    <div>
                      <span className="text-[11px] font-bold text-zinc-500 block truncate leading-tight">
                        {test.subjectName.split('(')[0]}
                      </span>
                      <h3
                        className={`line-clamp-2 leading-relaxed ${
                          isUrdu
                            ? 'font-urdu text-[14px] font-bold text-zinc-900 text-right dir-rtl leading-relaxed'
                            : 'text-xs font-bold text-zinc-800 leading-snug'
                        }`}
                      >
                        <bdi>{cleanTitle}</bdi>
                      </h3>
                    </div>

                    {/* Dynamic Status / Certified Result Badge */}
                    <div>
                      {isPassed ? (
                        <div className="p-1.5 px-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            Passed: {score}/30 ({cert?.grade || 'A*'})
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-700">Certified</span>
                        </div>
                      ) : isRetest ? (
                        <div className="p-1.5 px-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-rose-800 flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            Score: {score}/30 &bull; Retest
                          </span>
                          <span className="text-[10px] font-bold text-rose-700">&lt;15 Pass</span>
                        </div>
                      ) : isSubmitted ? (
                        <div className="p-1.5 px-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                          <span className="font-bold text-blue-800 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            Under Review
                          </span>
                          <span className="text-[10px] font-semibold text-blue-700">Submitted</span>
                        </div>
                      ) : (
                        <div className="p-1.5 px-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex items-center justify-between text-zinc-600">
                          <span className="flex items-center gap-1 font-medium text-[11px]">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {test.date}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPdfViewerTest(test)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>

                    {isRetest ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSelectTest(test, true)}
                        className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-1 px-3"
                        icon={<RotateCcw className="w-3 h-3" />}
                      >
                        Retake
                      </Button>
                    ) : (
                      <Button
                        variant={isSelected ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleSelectTest(test, false)}
                        className="text-xs font-bold py-1 px-3"
                        icon={<ChevronRight className="w-3 h-3" />}
                      >
                        {isSelected ? 'Active' : 'Submit'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ZOOM MODAL FOR UPLOADED PAGE */}
      {zoomPage && (
        <Modal
          isOpen={!!zoomPage}
          onClose={() => setZoomPage(null)}
          title={`Answer Sheet: Page ${zoomPage.pageNumber}`}
        >
          <div className="p-3 text-center space-y-3">
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-zinc-950 flex items-center justify-center p-2">
              <img
                src={zoomPage.previewUrl}
                alt={`Page ${zoomPage.pageNumber}`}
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[#557067]">
              <span>{zoomPage.name}</span>
              <span>{zoomPage.size}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF VIEWER MODAL FOR TEXTBOOK EXCERPTS & PAGES */}
      {pdfViewerTest && (
        <PDFViewerModal
          isOpen={!!pdfViewerTest}
          onClose={() => setPdfViewerTest(null)}
          testId={pdfViewerTest.id}
          testTitle={pdfViewerTest.title}
          subjectCode={pdfViewerTest.subjectCode}
          subjectName={pdfViewerTest.subjectName}
          syllabusCoverage={pdfViewerTest.syllabusCoverage}
        />
      )}
    </div>
  );
};
