import React, { useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  Search,
  CheckCircle,
  Download,
  Eye,
  Camera,
  AlertCircle,
  FileCheck2,
  Maximize2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SAMPLE_SUBMISSIONS } from '../../data/sampleData';
import { Submission } from '../../types';
import { useRole } from '../../hooks/useRole';
import { submissionService } from '../../services/submissionService';
import { emailService } from '../../services/emailService';
import { notificationService } from '../../services/notificationService';
import { extractDayAndCleanTitle } from '../../services/testService';

export const SubmissionsPage: React.FC = () => {
  const { role, user } = useRole();
  const [submissions, setSubmissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'under-review' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isGradingSaving, setIsGradingSaving] = useState(false);

  // Load Submissions
  const loadSubmissions = () => {
    submissionService.fetchSubmissions().then((data) => {
      if (data && data.length > 0) {
        setSubmissions(data);
      }
    });
  };

  useEffect(() => {
    loadSubmissions();

    const handleSync = () => loadSubmissions();
    window.addEventListener('studyhub_submissions_updated', handleSync);
    window.addEventListener('studyhub_tests_updated', handleSync);

    return () => {
      window.removeEventListener('studyhub_submissions_updated', handleSync);
      window.removeEventListener('studyhub_tests_updated', handleSync);
    };
  }, []);

  // Filter Submissions
  const filtered = submissions.filter((s) => {
    const matchesFilter = filter === 'all' ? true : s.status === filter;
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.subjectName && s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Sort Submissions: Newest / Latest at the VERY TOP
  const sortedSubmissions = [...filtered].sort((a, b) => {
    const timeA = a.id?.startsWith('sub_') ? parseInt(a.id.replace('sub_', ''), 10) : 0;
    const timeB = b.id?.startsWith('sub_') ? parseInt(b.id.replace('sub_', ''), 10) : 0;
    return timeB - timeA;
  });

  const handleOpenGradeModal = (sub: Submission) => {
    setGradingSubmission(sub);
    setGradeInput(sub.score !== undefined ? sub.score.toString() : '');
    setFeedbackInput(sub.feedback || sub.comment || '');
  };

  const handleDownloadFile = async (sub: Submission) => {
    if (sub.fileUrl) {
      const signedUrl = await submissionService.getSubmissionDownloadUrl(sub.fileUrl);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
        return;
      }
    }
    setSuccessToast(`Downloading submission: ${sub.fileName || 'coursework_solution.pdf'}...`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSaveGrade = async () => {
    if (!gradingSubmission) return;
    setIsGradingSaving(true);

    const maxMarks = gradingSubmission.maxScore || 30;
    const enteredScore = Number(gradeInput);
    const scoreVal = isNaN(enteredScore)
      ? maxMarks
      : Math.min(Math.max(0, enteredScore), maxMarks);

    await submissionService.gradeSubmission(
      gradingSubmission.id,
      scoreVal,
      feedbackInput,
      user?.id
    );

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === gradingSubmission.id
          ? {
              ...s,
              status: 'graded',
              score: scoreVal,
              feedback: feedbackInput,
            }
          : s
      )
    );

    const studentName = gradingSubmission.studentName;
    const passingThreshold = Math.round(maxMarks * 0.5);
    const isPassed = scoreVal >= passingThreshold;

    // Automated Dispatch to Student's Gmail
    emailService.sendGradeResultEmail({
      studentEmail: emailService.getStudentConfiguredEmail(),
      studentName: studentName,
      teacherName: user?.name || 'Ahmad',
      testTitle: gradingSubmission.assignmentTitle,
      subjectName: gradingSubmission.subjectName || 'Academic Assessment',
      score: scoreVal,
      maxScore: maxMarks,
      passingMarks: passingThreshold,
      feedback: feedbackInput,
    });

    // In-app & Mobile Push Notification Dispatch
    notificationService.notifyCertifiedGrade(
      gradingSubmission.assignmentTitle,
      scoreVal,
      maxMarks,
      scoreVal >= 27 ? 'Grade A*' : scoreVal >= 24 ? 'Grade A' : isPassed ? 'Grade B' : 'Grade C',
      feedbackInput || 'Evaluated by faculty director Ahmad.'
    );

    setIsGradingSaving(false);
    setGradingSubmission(null);
    setSuccessToast(
      `Grade (${scoreVal}/${maxMarks} - ${isPassed ? 'PASSED ✅' : 'NEEDS RETAKE ⚠️'}) certified & alert sent to ${studentName}'s Gmail!`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-[#142D27] flex items-center justify-between text-xs font-semibold shadow-md animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {successToast}
          </span>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-zinc-400 hover:text-zinc-700 text-base font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
              Submission Center &amp; Marking Console
            </h1>
            <Badge variant="primary" size="sm" dot>
              {submissions.filter((s) => s.status !== 'graded').length} Pending Marking
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Review handwritten problem sets, preview student scripts in-browser, enter rubric scores, and approve finalized marks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
            {sortedSubmissions.length} Total Submissions
          </span>
        </div>
      </div>

      {/* Search and Filters Ribbon */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, Urdu title, or course..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative min-w-[170px]">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full h-11 px-3.5 pr-8 rounded-2xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-800 focus:outline-none focus:border-emerald-600 shadow-2xs appearance-none cursor-pointer"
          >
            <option value="all">All Submissions</option>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under Review</option>
            <option value="graded">Graded &amp; Certified</option>
          </select>
          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* SUBMISSIONS SERIES CARDS BENTO GRID: 1-col on mobile, 2-col on md, 3-col on lg */}
      {sortedSubmissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSubmissions.map((item) => {
            const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(item.assignmentTitle);
            const maxMarks = item.maxScore || 30;
            const isGraded = item.status === 'graded';
            const isPassed = item.score !== undefined && item.score >= Math.round(maxMarks * 0.5);
            const isRetest = item.score !== undefined && item.score < Math.round(maxMarks * 0.5);

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-zinc-200 transition-none flex flex-col justify-between shadow-xs select-none min-h-[220px]"
              >
                <div>
                  {/* Top Metadata Row: Subject Code, Day & Page Count */}
                  <div className="flex items-center justify-between gap-1 pb-2.5 border-b border-[#e1ede7]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact">
                        {day}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {item.subjectName || 'FAIT-EXAM-11'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      <Camera className="w-3 h-3 text-emerald-600" />
                      {item.pageCount || 1} {item.pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>

                  {/* Student Identity Row */}
                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src={item.studentAvatar}
                      alt={item.studentName}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-300 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-xs font-bold text-[#142D27]">{item.studentName}</h3>
                      <span className="text-[10px] text-[#7d9990] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#14B866]" />
                        {item.submittedAt}
                      </span>
                    </div>
                  </div>

                  {/* Title in Authentic Urdu Font */}
                  <div className="mt-3">
                    <h4
                      className={`group-hover:text-emerald-700 transition-colors ${
                        isUrdu
                          ? 'font-urdu text-[15px] font-bold text-[#142D27] text-right dir-rtl leading-loose'
                          : 'text-sm font-bold text-[#142D27]'
                      }`}
                    >
                      <bdi>{cleanTitle}</bdi>
                    </h4>
                  </div>

                  {/* Uploaded Thumbnails Preview Gallery */}
                  {item.pageThumbnails && item.pageThumbnails.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-bold text-[#557067] block mb-1">
                        Attached Solution Pages:
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                        {item.pageThumbnails.slice(0, 4).map((thumb, idx) => (
                          <div
                            key={idx}
                            onClick={() => setZoomImageUrl(thumb)}
                            className="relative w-14 h-18 rounded-lg overflow-hidden border border-[#e1ede7] bg-zinc-100 shrink-0 cursor-pointer group/thumb shadow-2xs hover:border-emerald-400"
                            title={`Click to zoom Page ${idx + 1}`}
                          >
                            <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-bold text-center py-0.5">
                              P.{idx + 1}
                            </span>
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Student Comment Note */}
                  {item.comment && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs text-[#557067] italic line-clamp-2">
                      &quot;{item.comment}&quot;
                    </div>
                  )}

                  {/* Grade Status Pill */}
                  <div className="mt-3">
                    {isGraded ? (
                      <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                        isPassed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}>
                        <span className="font-bold flex items-center gap-1.5">
                          {isPassed ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
                          Score: {item.score} / {maxMarks} Marks ({Math.round(((item.score || 0) / maxMarks) * 100)}%)
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border">
                          {isPassed ? 'PASSED ✅' : 'RETEST ⚠️'}
                        </span>
                      </div>
                    ) : isRetest ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between text-rose-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          Retake Attempt Awaiting Check
                        </span>
                        <span className="text-[10px] font-bold text-rose-700">&lt;15 Passing</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs flex items-center justify-between text-blue-900">
                        <span className="font-bold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          Pending Teacher Evaluation
                        </span>
                        <span className="text-[10px] font-bold text-blue-700">Max {maxMarks}M</span>
                      </div>
                    )}
                  </div>

                  {/* Teacher Feedback snippet if available */}
                  {item.feedback && isGraded && (
                    <div className="mt-2.5 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-900 italic">
                      <strong>Remarks:</strong> &quot;{item.feedback}&quot;
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3.5 mt-4 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => setPreviewSubmission(item)}
                    className="text-xs"
                  >
                    Preview
                  </Button>

                  {role === 'teacher' && (
                    <Button
                      variant={isGraded ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenGradeModal(item)}
                      icon={<FileCheck2 className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      {isGraded ? 'Edit Marks' : 'Grade Submission'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-[#14B866]" />}
          title="No Submissions Found"
          description="No student coursework matches your search or filter parameter."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearchTerm('');
            setFilter('all');
          }}
        />
      )}

      {/* TEACHER MARKING MODAL */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Grade Student Coursework"
        description={`Evaluating submission by ${gradingSubmission?.studentName} for "${gradingSubmission?.assignmentTitle}".`}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center justify-between text-xs">
            <span className="text-[#557067]">Attached Solution Script:</span>
            <button
              type="button"
              onClick={() => gradingSubmission && handleDownloadFile(gradingSubmission)}
              className="font-bold text-[#142D27] hover:text-[#14B866] flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#14B866]" />
              {gradingSubmission?.fileName || 'solution.pdf'}
              <Download className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>

          {/* Solution Sheet Visual Preview Box */}
          {gradingSubmission?.pageThumbnails && gradingSubmission.pageThumbnails.length > 0 ? (
            <div className="p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-2">
              <span className="text-xs font-bold text-[#142D27] block">
                📸 Attached Handwritten Sheets ({gradingSubmission.pageThumbnails.length} Pages):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {gradingSubmission.pageThumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => setZoomImageUrl(thumb)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#e1ede7] bg-white cursor-pointer hover:border-emerald-400"
                  >
                    <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                      Page {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-[#142D27] space-y-1 text-xs">
              <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                📄 Student Solution Document
              </span>
              <p className="text-[#557067] italic">
                {gradingSubmission?.comment || 'Solution uploaded by student.'}
              </p>
            </div>
          )}

          {/* Marks Awarded & Live Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#142D27]">
                Award Marks (out of {gradingSubmission?.maxScore || 30}):
              </label>
              <span className="text-xs font-bold text-emerald-700">
                {gradeInput ? `${gradeInput} / ${gradingSubmission?.maxScore || 30}` : 'Enter score'}
              </span>
            </div>
            <input
              type="number"
              min={0}
              max={gradingSubmission?.maxScore || 30}
              value={gradeInput}
              onChange={(e) => setGradeInput(e.target.value)}
              placeholder="e.g. 27"
              className="w-full px-3.5 py-2.5 text-sm font-bold rounded-xl border border-zinc-300 focus:outline-none focus:border-emerald-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Teacher Evaluation &amp; Feedback
            </label>
            <textarea
              rows={2}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Good step-by-step working. Verified by Ahmad Sir..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGradingSubmission(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isGradingSaving}
              loadingText="Certifying Grade..."
              onClick={handleSaveGrade}
            >
              Certify &amp; Release Grade
            </Button>
          </div>
        </div>
      </Modal>

      {/* DOCUMENT PREVIEW MODAL */}
      <Modal
        isOpen={!!previewSubmission}
        onClose={() => setPreviewSubmission(null)}
        title={previewSubmission ? `Preview: ${previewSubmission.fileName}` : 'Preview Document'}
        description={`Submitted by ${previewSubmission?.studentName} &bull; ${previewSubmission?.assignmentTitle}`}
      >
        <div className="space-y-4">
          {previewSubmission?.pageThumbnails && previewSubmission.pageThumbnails.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-bold text-[#142D27]">
                Captured Answer Sheets ({previewSubmission.pageThumbnails.length} Pages):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto p-1">
                {previewSubmission.pageThumbnails.map((thumb, idx) => (
                  <div
                    key={idx}
                    onClick={() => setZoomImageUrl(thumb)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[#e1ede7] bg-white cursor-pointer hover:border-emerald-400 group/item"
                  >
                    <img src={thumb} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                      Page {idx + 1}
                    </span>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="min-h-[200px] p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] flex flex-col items-center justify-center text-center">
              <FileText className="w-12 h-12 text-[#14B866] mb-3" />
              <h4 className="text-sm font-bold text-[#142D27]">{previewSubmission?.fileName}</h4>
              <p className="text-xs text-[#557067] mt-1 max-w-sm">
                Document verified on private storage.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => previewSubmission && handleDownloadFile(previewSubmission)}
            >
              Download Solution Script
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const sub = previewSubmission;
                setPreviewSubmission(null);
                if (sub) handleOpenGradeModal(sub);
              }}
            >
              Proceed to Grade
            </Button>
          </div>
        </div>
      </Modal>

      {/* FULL-IMAGE ZOOM MODAL */}
      {zoomImageUrl && (
        <Modal
          isOpen={!!zoomImageUrl}
          onClose={() => setZoomImageUrl(null)}
          title="Zoom Handwritten Answer Page"
        >
          <div className="p-2 text-center">
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-zinc-950 flex items-center justify-center p-2">
              <img
                src={zoomImageUrl}
                alt="Zoomed handwritten answer page"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
