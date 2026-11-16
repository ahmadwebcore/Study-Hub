import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Calendar,
  Search,
  Download,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { taskService, DailyTask } from '../../services/taskService';
import { subjectService } from '../../services/subjectService';
import {
  getLocalCertifiedResults,
  extractDayAndCleanTitle,
} from '../../services/testService';
import { Subject, ResultRecord } from '../../types';
import { PDFViewerModal } from '../../components/books/PDFViewerModal';

export const CompletedWorkPage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<DailyTask[]>([]);
  const [certifiedResults, setCertifiedResults] = useState<ResultRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'tests' | 'coursework'>('tests');
  const [pdfViewerTest, setPdfViewerTest] = useState<ResultRecord | null>(null);

  const loadData = () => {
    const list = taskService.getApprovedCompletedTasks();
    setCompletedTasks(list);

    const certList = getLocalCertifiedResults();
    setCertifiedResults(certList);

    subjectService.fetchSubjects().then((data) => {
      if (data) setSubjects(data);
    });
  };

  useEffect(() => {
    loadData();

    const handleSync = () => {
      loadData();
    };

    window.addEventListener('studyhub_certified_results_update', handleSync);
    window.addEventListener('studyhub_submissions_updated', handleSync);
    window.addEventListener('studyhub_tests_updated', handleSync);

    return () => {
      window.removeEventListener('studyhub_certified_results_update', handleSync);
      window.removeEventListener('studyhub_submissions_updated', handleSync);
      window.removeEventListener('studyhub_tests_updated', handleSync);
    };
  }, []);

  // Filter certified tests
  const filteredTests = certifiedResults.filter((r) => {
    const matchSubject =
      selectedSubject === 'all' ||
      r.subjectCode?.toLowerCase().includes(selectedSubject.toLowerCase()) ||
      r.subjectName?.toLowerCase().includes(selectedSubject.toLowerCase());
    const matchSearch =
      r.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.feedback || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchSearch;
  });

  // Filter coursework tasks
  const filteredTasks = completedTasks.filter((t) => {
    const matchSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.approval?.feedback || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchSearch;
  });

  const totalMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const passedTestsCount = certifiedResults.filter((r) => r.passed || r.score >= 15).length;
  const passRate = certifiedResults.length > 0
    ? Math.round((passedTestsCount / certifiedResults.length) * 100)
    : 100;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27] font-serif">Completed Work &amp; Verified Progress</h1>
            <Badge variant="primary" size="sm" dot>
              {certifiedResults.length + completedTasks.length} Verified Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#557067] mt-1">
            Official ledger of certified examinations, 30-mark test grades, and completed coursework approved by <strong>Ahmad (Faculty Lead)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-white border border-[#e1ede7] shadow-2xs">
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'tests'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              Certified Tests ({certifiedResults.length})
            </button>
            <button
              onClick={() => setActiveTab('coursework')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'coursework'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              Coursework Units ({completedTasks.length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting official verified academic transcript as PDF...')}
          >
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Summary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider">
              Certified Tests
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] font-serif mt-2">{certifiedResults.length}</p>
          <p className="text-[11px] text-[#7d9990] mt-0.5">30 Marks BISE DG Khan tests</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider">
              Exam Pass Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-serif mt-2">{passRate}%</p>
          <p className="text-[11px] text-[#7d9990] mt-0.5">{passedTestsCount} of {certifiedResults.length || 1} passed (&ge;15/30)</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider">
              Coursework Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] font-serif mt-2">{completedTasks.length}</p>
          <p className="text-[11px] text-[#7d9990] mt-0.5">{totalHours} Hours syllabus covered</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#557067] uppercase tracking-wider">
              Approval Authority
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-[#142D27] font-serif mt-2 truncate">Ahmad</p>
          <p className="text-[11px] text-emerald-700 mt-0.5 font-semibold">Faculty Lead &bull; Certified</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'tests'
                ? 'Search certified examination tests, marks, or Ahmad Sir comments...'
                : 'Search completed FA-IT coursework units or topics...'
            }
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter records by subject"
          className="h-11 px-3.5 rounded-2xl border border-zinc-200 bg-white text-xs font-medium text-zinc-800 focus:outline-none focus:border-emerald-600 shadow-2xs"
        >
          <option value="all">All 1st Year FA-IT Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* TAB 1: CERTIFIED TEST EXAMINATIONS */}
      {activeTab === 'tests' && (
        <div>
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#e1ede7] p-8 shadow-xs">
              <FileCheck2 className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-60" />
              <h3 className="text-sm font-bold text-[#142D27] font-serif">No Certified Test Records Found</h3>
              <p className="text-xs text-[#557067] mt-1 max-w-md mx-auto">
                Once Ahmad Sir evaluates your handwritten solutions on the Submissions Desk, your official marks, grade, and feedback will appear here in real time.
              </p>
              <Link
                to="/test-submit"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
              >
                Go to Test Submission Desk &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map((record) => {
                const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(record.testTitle, record.date);
                const isPassed = record.passed || record.score >= 15;
                const percentage = record.percentage ?? Math.round((record.score / record.maxScore) * 100);

                return (
                  <div
                    key={record.id}
                    className="p-5 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      {/* Top Header: Day, Code & Date */}
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#e1ede7]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {record.subjectCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7d9990] font-medium">
                          {record.date}
                        </span>
                      </div>

                      {/* Subject Name & Clean Urdu Title */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-[#557067] uppercase tracking-wider block">
                          {record.subjectName}
                        </span>
                        <h4
                          className={`mt-1.5 group-hover:text-emerald-700 transition-colors ${
                            isUrdu
                              ? 'font-urdu text-[15px] font-bold text-[#142D27] text-right dir-rtl leading-loose'
                              : 'text-sm font-bold text-[#142D27]'
                          }`}
                        >
                          <bdi>{cleanTitle}</bdi>
                        </h4>
                      </div>

                      {/* Score & Evaluation Badge */}
                      <div className="mt-3.5 p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#142D27] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            Official Certified Score:
                          </span>
                          <span className="text-sm font-extrabold text-[#142D27]">
                            {record.score} / {record.maxScore} Marks
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#e1ede7] text-xs">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {isPassed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-rose-600" />}
                            {isPassed ? 'PASSED ✅' : 'RETEST REQUIRED ⚠️'}
                          </span>

                          <span className="text-[11px] font-bold text-[#557067]">
                            {percentage}% &bull; Grade {record.grade || (isPassed ? 'A' : 'F')}
                          </span>
                        </div>
                      </div>

                      {/* Ahmad's Feedback */}
                      {record.feedback && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200/60 text-xs">
                          <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">
                            Ahmad Sir&apos;s Faculty Remarks:
                          </span>
                          <p className="text-[11px] text-[#2e473f] italic leading-relaxed">
                            &quot;{record.feedback}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 mt-4 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setPdfViewerTest(record)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#557067] hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>View Book PDF</span>
                      </button>

                      {!isPassed ? (
                        <Link
                          to={`/test-submit?testId=${record.testId}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retake Test</span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Certified Result
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPROVED COURSEWORK UNITS */}
      {activeTab === 'coursework' && (
        <div>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-[#e1ede7] p-8 shadow-xs">
              <Award className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-60" />
              <h3 className="text-sm font-bold text-zinc-900 font-serif">No Verified Records</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Work submitted by students will appear here once reviewed and verified by Ahmad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {filteredTasks.map((task) => {
                const marksMatch = task.approval?.feedback?.match(/Marks:\s*(\d+\/\d+)/i);
                const marksText = marksMatch ? marksMatch[1] : '28/30';

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-3xl bg-white border border-[#e1ede7] text-[#142D27] hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#e1ede7]">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 truncate">
                          {task.subjectCode}
                        </span>
                        <span className="text-[10px] text-[#7d9990] font-medium shrink-0">
                          {task.assignedDate}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-[#557067] uppercase tracking-wider block">
                          {task.subjectName}
                        </span>
                        <h4 className="text-xs font-bold text-[#142D27] font-serif mt-1 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {task.title}
                        </h4>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                          <Award className="w-3 h-3 text-emerald-600 shrink-0" />
                          {marksText}
                        </span>
                        <span className="text-[10px] font-semibold text-[#557067]">
                          {task.estimatedMinutes || 60} Mins
                        </span>
                      </div>

                      {task.approval?.feedback && (
                        <p className="text-[11px] text-[#2e473f] mt-2 line-clamp-2 italic leading-relaxed pl-2 border-l-2 border-emerald-500 bg-emerald-50/50 p-1.5 rounded-r-lg">
                          &quot;{task.approval.feedback.replace(/Marks:\s*\d+\/\d+/i, '').trim()}&quot;
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 mt-3 border-t border-[#e1ede7] flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-emerald-700 truncate">
                        Signed: {task.approval?.approvedBy || 'Ahmad'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      {pdfViewerTest && (
        <PDFViewerModal
          isOpen={!!pdfViewerTest}
          onClose={() => setPdfViewerTest(null)}
          testId={pdfViewerTest.testId}
          testTitle={pdfViewerTest.testTitle}
          subjectCode={pdfViewerTest.subjectCode}
          subjectName={pdfViewerTest.subjectName}
        />
      )}
    </div>
  );
};
