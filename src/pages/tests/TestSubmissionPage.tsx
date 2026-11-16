import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { testService } from '../../services/testService';
import { submissionService } from '../../services/submissionService';
import { TestItem, Submission } from '../../types';
import { SAMPLE_TESTS, SAMPLE_SUBMISSIONS } from '../../data/sampleData';
import { useRole } from '../../hooks/useRole';

export const TestSubmissionPage: React.FC = () => {
  const { user } = useRole();
  const [tests, setTests] = useState<TestItem[]>(SAMPLE_TESTS);
  const [submissions, setSubmissions] = useState<Submission[]>(SAMPLE_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<'available' | 'submitted'>('available');
  const [searchTerm, setSearchTerm] = useState('');

  // Upload handwritten submission state
  const [uploadingTest, setUploadingTest] = useState<TestItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentComment, setStudentComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    testService.fetchTests(user?.id).then((data) => {
      if (data && data.length > 0) setTests(data);
    });
    submissionService.fetchSubmissions().then((data) => {
      if (data && data.length > 0) setSubmissions(data);
    });
  }, [user]);

  const availableTests = tests
    .filter((t) => t.status === 'scheduled' || t.status === 'ongoing')
    .filter((t) =>
      searchTerm
        ? t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );
  const mySubmissions = submissions
    .filter((s) =>
      searchTerm
        ? s.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (s.subjectName && s.subjectName.toLowerCase().includes(searchTerm.toLowerCase()))
        : true
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirmUpload = async () => {
    if (!uploadingTest || !selectedFile) return;
    setIsUploading(true);
    await new Promise((r) => setTimeout(r, 600));

    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId: uploadingTest.id,
      assignmentTitle: uploadingTest.title,
      subjectName: uploadingTest.subjectName,
      studentId: user?.id || 'usr_student_demo',
      studentName: user?.name || 'Student Scholar',
      studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
      submittedAt: 'Just now',
      status: 'submitted',
      maxScore: uploadingTest.totalMarks,
      comment: studentComment,
      fileName: selectedFile.name,
      fileSize: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
    };

    setSubmissions((prev) => [newSub, ...prev]);
    setIsUploading(false);
    setUploadingTest(null);
    setSelectedFile(null);
    setStudentComment('');
    setSuccessToast(`Examination answer sheet for "${uploadingTest.title}" submitted successfully! Awaiting teacher grading.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Student Test Submission Terminal</h1>
            <Badge variant="primary" size="sm" dot>
              Official Exam Desk
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#557067] mt-1">
            Dedicated workstation to submit handwritten examination solution scripts, PDF papers, and digital answers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-[#e1ede7] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'available'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:text-[#142D27]'
            }`}
          >
            Available Tests ({availableTests.length})
          </button>
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'submitted'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:text-[#142D27]'
            }`}
          >
            My Submission History ({mySubmissions.length})
          </button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7d9990]" />
        <input
          type="text"
          placeholder="Search by test title, subject name, or course code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] placeholder-[#7d9990] focus:border-[#14B866] focus:outline-none"
        />
      </div>

      {/* Main Content */}
      {activeTab === 'available' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
            <h3 className="text-sm font-bold text-[#142D27]">Scheduled Examination Queue</h3>
            <p className="text-xs text-[#557067] mt-0.5">
              Review syllabus coverage and upload your handwritten answer sheets before the official window closes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableTests.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white border border-[#e1ede7] hover:border-[#14B866]/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E7EFEA] text-[#142D27]">
                      {test.subjectCode}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      {test.durationMinutes} Mins Allowed
                    </span>
                  </div>

                  <h3 className={`text-base font-bold text-[#142D27] mt-2.5 ${
                    test.title?.match(/[\u0600-\u06FF]/) ? 'font-urdu text-lg leading-relaxed text-right dir-rtl' : ''
                  }`}>
                    {test.title}
                  </h3>
                  <p className="text-xs text-[#557067] mt-0.5">{test.subjectName}</p>

                  <div className="mt-3 p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
                    <p className="text-[11px] font-bold text-[#142D27]">Syllabus Covered:</p>
                    <p className="text-xs text-[#557067] mt-0.5 leading-relaxed">{test.syllabusCoverage}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[#557067]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#14B866]" />
                      Date: {test.date} at {test.time}
                    </span>
                    <span className="font-bold text-[#142D27]">
                      Total: {test.totalMarks} Marks
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between">
                  <span className="text-xs text-[#7d9990]">
                    Pass Benchmark: {test.passingMarks || Math.round(test.totalMarks * 0.5)} Marks
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setUploadingTest(test);
                      setSelectedFile(null);
                      setStudentComment('');
                    }}
                  >
                    Submit Answer Sheet
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Submitted Tests History */
        <div className="space-y-3">
          {mySubmissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e1ede7] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#142D27]">{sub.assignmentTitle}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#557067] mt-0.5">
                    Attached file: <strong>{sub.fileName}</strong> &bull; Submitted {sub.submittedAt}
                  </p>
                  {sub.comment && (
                    <p className="text-xs text-[#557067] italic mt-1 bg-[#F7F9F8] p-2 rounded-lg border border-[#e1ede7]">
                      "{sub.comment}"
                    </p>
                  )}
                  {sub.feedback && (
                    <p className="text-xs text-emerald-900 font-semibold mt-1 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      Teacher Feedback: "{sub.feedback}"
                    </p>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {sub.score !== undefined ? (
                  <div className="text-right">
                    <span className="text-xs text-[#7d9990] block">Marks Awarded</span>
                    <span className="text-base font-extrabold text-[#14B866]">
                      {sub.score} / {sub.maxScore}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Under Review
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answer Sheet Upload Modal */}
      <Modal
        isOpen={!!uploadingTest}
        onClose={() => setUploadingTest(null)}
        title="Submit Examination Answer Script"
        description={uploadingTest ? `Upload handwritten solution PDF or image for "${uploadingTest.title}"` : ''}
      >
        {uploadingTest && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs space-y-1">
              <p className="text-[#263B35]"><strong>Subject:</strong> {uploadingTest.subjectName}</p>
              <p className="text-[#263B35]"><strong>Total Marks:</strong> {uploadingTest.totalMarks} Marks</p>
              <p className="text-[#263B35]"><strong>Passing Requirement:</strong> {uploadingTest.passingMarks || Math.round(uploadingTest.totalMarks * 0.5)} Marks</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Select Handwritten Answer Sheet / PDF File:
              </label>
              <div className="border border-dashed border-[#e1ede7] hover:border-[#14B866] rounded-xl p-4 text-center cursor-pointer bg-[#F7F9F8]">
                <input
                  type="file"
                  id="test-file-input"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label htmlFor="test-file-input" className="cursor-pointer block space-y-1">
                  <Upload className="w-6 h-6 text-[#14B866] mx-auto mb-1" />
                  <p className="text-xs font-semibold text-[#142D27]">
                    {selectedFile ? selectedFile.name : 'Click to select solution PDF or image'}
                  </p>
                  <p className="text-[11px] text-[#7d9990]">
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB selected` : 'PDF, JPG or PNG up to 50MB'}
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Student Notes / Working Remarks (Optional):
              </label>
              <textarea
                rows={2}
                value={studentComment}
                onChange={(e) => setStudentComment(e.target.value)}
                placeholder="E.g., Included all scratch working on page 3..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setUploadingTest(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmUpload}
                disabled={!selectedFile}
                isLoading={isUploading}
                loadingText="Uploading Answer Script..."
              >
                Submit for Teacher Marking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
