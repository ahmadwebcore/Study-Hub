import React, { useState, useEffect } from 'react';
import {
  Clock,
  FileText,
  Search,
  CheckCircle,
  Download,
  Eye,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SAMPLE_SUBMISSIONS } from '../../data/sampleData';
import { Submission } from '../../types';
import { useRole } from '../../hooks/useRole';
import { submissionService } from '../../services/submissionService';
import { emailService } from '../../services/emailService';

export const SubmissionsPage: React.FC = () => {
  const { role, user } = useRole();
  const [submissions, setSubmissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS);
  const [filter, setFilter] = useState<'all' | 'submitted' | 'under-review' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [previewSubmission, setPreviewSubmission] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState<string>('');
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isGradingSaving, setIsGradingSaving] = useState(false);

  // Load Submissions
  useEffect(() => {
    let mounted = true;
    submissionService.fetchSubmissions().then((data) => {
      if (mounted && data && data.length > 0) {
        setSubmissions(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = submissions.filter((s) => {
    const matchesFilter = filter === 'all' ? true : s.status === filter;
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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

    const enteredScore = Number(gradeInput);
    const scoreVal = isNaN(enteredScore)
      ? gradingSubmission.maxScore
      : Math.min(Math.max(0, enteredScore), gradingSubmission.maxScore);

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
    const passingThreshold = Math.round(gradingSubmission.maxScore * 0.5);
    const isPassed = scoreVal >= passingThreshold;

    // Automated Dispatch to Student's Gmail
    emailService.sendGradeResultEmail({
      studentEmail: emailService.getStudentConfiguredEmail(),
      studentName: studentName,
      teacherName: user?.name || 'Ahmad WebCore',
      testTitle: gradingSubmission.assignmentTitle,
      subjectName: gradingSubmission.subjectName || 'Academic Assessment',
      score: scoreVal,
      maxScore: gradingSubmission.maxScore,
      passingMarks: passingThreshold,
      feedback: feedbackInput,
    });

    setIsGradingSaving(false);
    setGradingSubmission(null);
    setSuccessToast(
      `Grade (${scoreVal}/${gradingSubmission.maxScore} - ${isPassed ? 'PASSED ✅' : 'NEEDS RETAKE ⚠️'}) certified & alert sent to ${studentName}'s Gmail!`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Submission Center & Marking Console</h1>
            <Badge variant="primary" size="sm" dot>
              {submissions.filter((s) => s.status !== 'graded').length} Pending Marking
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Review handwritten problem sets, preview student scripts in-browser, enter rubric scores, and approve finalized marks.
          </p>
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
            placeholder="Search by student name or assignment title..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'submitted', 'under-review', 'graded'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-[#142D27] text-white shadow-sm'
                  : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card key={item.id} hoverable className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <img
                    src={item.studentAvatar}
                    alt={item.studentName}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#e1ede7]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#142D27]">{item.studentName}</h3>
                      <Badge
                        variant={
                          item.status === 'graded'
                            ? 'primary'
                            : item.status === 'under-review'
                            ? 'info'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <h4 className="text-xs font-semibold text-[#557067] mt-0.5">
                      {item.assignmentTitle}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-[#7d9990]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted {item.submittedAt}
                      </span>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(item)}
                        className="flex items-center gap-1 text-[#14B866] hover:underline font-medium transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {item.fileName} ({item.fileSize || '1.8 MB'})
                        <Download className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>

                    {item.comment && (
                      <p className="mt-2 text-xs text-[#557067] bg-[#F7F9F8] p-2 rounded-lg border border-[#e1ede7] italic">
                        "{item.comment}"
                      </p>
                    )}

                    {item.feedback && item.status === 'graded' && (
                      <div className="mt-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-900">
                        <strong>Teacher Evaluation:</strong> {item.feedback}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Evaluation Button */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5 text-[#14B866]" />}
                    onClick={() => setPreviewSubmission(item)}
                  >
                    Preview
                  </Button>

                  {item.score !== undefined ? (
                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#14B866]">
                        {item.score} / {item.maxScore}
                      </span>
                      <span className="text-[10px] text-[#7d9990] block">Certified Points</span>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-600">Pending Review</span>
                      <span className="text-[10px] text-[#7d9990] block">Max {item.maxScore} pts</span>
                    </div>
                  )}

                  {role === 'teacher' && (
                    <Button
                      variant={item.status === 'graded' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleOpenGradeModal(item)}
                    >
                      {item.status === 'graded' ? 'Edit Mark' : 'Grade & Feedback'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
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
          <div className="p-3.5 rounded-xl bg-zinc-900 text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                📄 Student Solution Sheet (FSc Exam Script)
              </span>
              <button
                type="button"
                onClick={() => gradingSubmission && handleDownloadFile(gradingSubmission)}
                className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download Original
              </button>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 font-mono text-[11px] text-zinc-300 space-y-1">
              <p className="text-emerald-300 font-bold">&bull; Worked Solution Script Preview:</p>
              <p className="text-zinc-400 italic">"Q1. Resolved vector components along orthogonal axes: F_x = F cos(θ), F_y = F sin(θ). Resultant magnitude R = √(F_x² + F_y²) = 25.4 N. Proof verified."</p>
              <div className="pt-1 text-[10px] text-zinc-500">Document: {gradingSubmission?.fileName || 'FSc_Physics_Paper.pdf'}</div>
            </div>
          </div>

          {/* Marks Awarded & Live Progress Bar */}
          <div className="p-3 rounded-xl bg-white border border-zinc-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900">Awarded Marks</label>
              <span className="text-xs font-mono font-bold text-emerald-600">
                {Number(gradeInput) || 0} / {gradingSubmission?.maxScore} Marks
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder={`Enter marks (0 - ${gradingSubmission?.maxScore})`}
                min={0}
                max={gradingSubmission?.maxScore}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-zinc-200 text-zinc-900 focus:outline-none focus:border-zinc-500"
              />
              <span className="text-xs font-bold text-zinc-500 shrink-0">
                / {gradingSubmission?.maxScore} Total
              </span>
            </div>

            {/* Cool Progress Bar Underneath */}
            {gradingSubmission && (
              <div className="space-y-1 pt-1">
                {(() => {
                  const score = Number(gradeInput) || 0;
                  const max = gradingSubmission.maxScore || 50;
                  const pct = Math.min(100, Math.max(0, Math.round((score / max) * 100)));
                  const isPass = pct >= 50;
                  return (
                    <>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Live Progress:</span>
                        <span className="font-bold text-zinc-900">
                          {pct}%
                          <span className={`ml-1.5 font-semibold ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                            ({isPass ? 'Passing Benchmark Met' : 'Below Passing Threshold'})
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${isPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1">
              Teacher Evaluation & Feedback
            </label>
            <textarea
              rows={2}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Good step-by-step mathematical working..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-zinc-500"
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
              Certify & Release Grade
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
          <div className="min-h-[220px] max-h-[360px] p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-[#14B866] mb-3" />
            <h4 className="text-sm font-bold text-[#142D27]">{previewSubmission?.fileName}</h4>
            <p className="text-xs text-[#557067] mt-1 max-w-sm">
              Document verified on private storage. Use the button below to download the original high-resolution file.
            </p>
            {previewSubmission?.comment && (
              <p className="text-xs italic bg-white p-2.5 rounded-xl border border-[#e1ede7] mt-3 max-w-md text-[#557067]">
                "{previewSubmission.comment}"
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => previewSubmission && handleDownloadFile(previewSubmission)}
            >
              Download Original Script
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setPreviewSubmission(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
