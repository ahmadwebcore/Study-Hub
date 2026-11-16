import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileCheck2,
  PlusCircle,
  Clock,
  Paperclip,
  Upload,
  CheckCircle,
  Award,
  Search,
  Download,
  Trash2,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Assignment,
  Subject,
  SyllabusUnit,
  Student,
} from '../../types';
import { useRole } from '../../hooks/useRole';
import { assignmentService } from '../../services/assignmentService';
import { submissionService } from '../../services/submissionService';
import { subjectService } from '../../services/subjectService';
import { syllabusService } from '../../services/syllabusService';
import { studentService } from '../../services/studentService';
import {
  SAMPLE_ASSIGNMENTS,
  SAMPLE_SUBJECTS,
  SAMPLE_STUDENTS_LIST,
} from '../../data/sampleData';

const createAssignmentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subjectId: z.string().min(1, 'Please select a subject'),
  unitId: z.string().optional(),
  topicId: z.string().optional(),
  assignedTo: z.string().optional(),
  assignmentType: z.enum([
    'Homework',
    'Reading Task',
    'Written Assignment',
    'Short Questions',
    'Long Questions',
    'Revision Task',
    'Practice Exercise',
  ]),
  totalMarks: z.number().min(5, 'Minimum 5 marks').max(100, 'Maximum 100 marks'),
  dueDate: z.string().min(2, 'Due date is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  submissionInstructions: z.string().optional(),
});

type CreateAssignmentFormData = z.infer<typeof createAssignmentSchema>;

export const AssignmentsPage: React.FC = () => {
  const { role, user } = useRole();
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [assignments, setAssignments] = useState<Assignment[]>(SAMPLE_ASSIGNMENTS);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);
  const [units, setUnits] = useState<SyllabusUnit[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailModalAssignment, setDetailModalAssignment] = useState<Assignment | null>(null);
  const [submitModalAssignment, setSubmitModalAssignment] = useState<Assignment | null>(null);
  const [gradeModalSubmission, setGradeModalSubmission] = useState<{
    assignment: Assignment;
    studentName: string;
    studentId: string;
    score: number;
    feedback: string;
  } | null>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<Assignment | null>(null);

  // File Upload states
  const [selectedSubmitFile, setSelectedSubmitFile] = useState<File | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [isSubmittingFile, setIsSubmittingFile] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    let mounted = true;
    Promise.all([
      assignmentService.fetchAssignments(role === 'student' ? user.id : undefined),
      subjectService.fetchSubjects(),
      studentService.fetchStudents(),
    ]).then(([asgData, subjData, studData]) => {
      if (mounted) {
        if (asgData && asgData.length > 0) setAssignments(asgData);
        if (subjData && subjData.length > 0) setSubjects(subjData);
        if (studData && studData.length > 0) setStudents(studData);
      }
    });

    return () => {
      mounted = false;
    };
  }, [role, user.id]);

  // Create Assignment Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateAssignmentFormData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      title: '',
      subjectId: subjects[0]?.id || '',
      assignmentType: 'Homework',
      totalMarks: 50,
      dueDate: '2026-11-24T23:59',
      description: '',
      submissionInstructions: 'Upload worked solution as a PDF document or clear image scans.',
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

  // Handle Teacher Create Assignment
  const onPublishAssignment = async (data: CreateAssignmentFormData) => {
    setIsPublishing(true);
    const selectedSubj = subjects.find((s) => s.id === data.subjectId);
    let uploadedAttachmentPath: string | undefined;

    if (attachmentFile) {
      const { path } = await assignmentService.uploadAttachment(attachmentFile);
      if (path) uploadedAttachmentPath = path;
    }

    const { assignment } = await assignmentService.createAssignment({
      title: data.title,
      subjectId: data.subjectId,
      subjectName: selectedSubj?.name || 'Advanced Subject',
      subjectCode: selectedSubj?.code || 'SUBJ-101',
      unitId: data.unitId,
      topicId: data.topicId,
      assignedTo: data.assignedTo && data.assignedTo !== 'all' ? data.assignedTo : undefined,
      assignmentType: data.assignmentType,
      description: data.description,
      submissionInstructions: data.submissionInstructions,
      totalMarks: data.totalMarks,
      dueDate: data.dueDate,
      createdBy: user.id,
      fileAttachmentName: attachmentFile ? attachmentFile.name : undefined,
      fileAttachmentUrl: uploadedAttachmentPath,
    });

    if (assignment) {
      setAssignments((prev) => [assignment, ...prev]);
    }

    setIsPublishing(false);
    setIsCreateModalOpen(false);
    reset();
    setAttachmentFile(null);
    setSuccessToast(`Assignment "${data.title}" successfully created and dispatched!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle Student Submit Solution
  const handleConfirmSubmit = async () => {
    if (!submitModalAssignment) return;
    setIsSubmittingFile(true);

    let uploadedPath = '#mock-path';
    let uploadedSize = '1.2 MB';

    if (selectedSubmitFile) {
      uploadedSize = `${(selectedSubmitFile.size / (1024 * 1024)).toFixed(2)} MB`;
      const { path } = await submissionService.uploadSubmissionFile(
        selectedSubmitFile,
        user.id
      );
      if (path) uploadedPath = path;
    }

    await submissionService.submitSolution({
      assignmentId: submitModalAssignment.id,
      studentId: user.id,
      fileName: selectedSubmitFile
        ? selectedSubmitFile.name
        : `${user.name.replace(/\s+/g, '_')}_solution.pdf`,
      fileUrl: uploadedPath,
      fileSize: uploadedSize,
      comment: submissionComment,
    });

    // Update assignment in state
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === submitModalAssignment.id
          ? {
              ...a,
              status: 'submitted',
              submissionCount: (a.submissionCount || 0) + 1,
              mySubmission: {
                id: `subm_${Date.now()}`,
                submittedAt: 'Just now',
                fileName: selectedSubmitFile ? selectedSubmitFile.name : 'solution.pdf',
                status: 'submitted',
                comment: submissionComment,
              },
            }
          : a
      )
    );

    const title = submitModalAssignment.title;
    setIsSubmittingFile(false);
    setSubmitModalAssignment(null);
    setSelectedSubmitFile(null);
    setSubmissionComment('');
    setSuccessToast(`Solution for "${title}" successfully uploaded and registered!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Handle Teacher Grade Submission
  const handleSaveGrade = async () => {
    if (!gradeModalSubmission) return;

    await submissionService.gradeSubmission(
      `subm_${gradeModalSubmission.assignment.id}`,
      gradeModalSubmission.score,
      gradeModalSubmission.feedback,
      user.id
    );

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === gradeModalSubmission.assignment.id
          ? {
              ...a,
              status: 'graded',
              mySubmission: a.mySubmission
                ? {
                    ...a.mySubmission,
                    status: 'graded',
                    score: gradeModalSubmission.score,
                    feedback: gradeModalSubmission.feedback,
                  }
                : undefined,
            }
          : a
      )
    );

    setSuccessToast(
      `Grade of ${gradeModalSubmission.score}/${gradeModalSubmission.assignment.totalMarks} saved!`
    );
    setGradeModalSubmission(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Delete Assignment Confirm
  const handleDeleteAssignmentConfirm = async () => {
    if (!deletingAssignment) return;
    await assignmentService.deleteAssignment(deletingAssignment.id);
    setAssignments((prev) => prev.filter((a) => a.id !== deletingAssignment.id));
    setSuccessToast(`Assignment "${deletingAssignment.title}" deleted.`);
    setDeletingAssignment(null);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Download Attachment
  const handleDownloadAttachment = async (asg: Assignment) => {
    if (asg.fileAttachmentUrl) {
      const signedUrl = await assignmentService.getAttachmentDownloadUrl(asg.fileAttachmentUrl);
      if (signedUrl) {
        window.open(signedUrl, '_blank');
        return;
      }
    }
    // Fallback notification
    setSuccessToast(`Downloading "${asg.fileAttachmentName || 'study_attachment.pdf'}"...`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Filter Counts
  const counts = {
    all: assignments.length,
    pending: assignments.filter((a) => a.status === 'pending').length,
    submitted: assignments.filter((a) => a.status === 'submitted').length,
    graded: assignments.filter((a) => a.status === 'graded').length,
    overdue: assignments.filter((a) => a.status === 'overdue').length,
  };

  // Filtered List
  const filteredAssignments = assignments.filter((a) => {
    const matchesFilter = filter === 'all' || a.status === filter;
    const matchesSubject = selectedSubjectFilter === 'all' || a.subjectId === selectedSubjectFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSubject && matchesSearch;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">
              {role === 'teacher' ? 'Assignment Management' : 'Student Assignment Center'}
            </h1>
            <Badge variant="primary" size="sm" dot>
              {role === 'teacher' ? 'Faculty Portal' : 'Cohort Submissions'}
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Publish structured problem sets, monitor student submissions, review grading rubrics, and deliver actionable feedback.
          </p>
        </div>

        {role === 'teacher' && (
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Assignment
          </Button>
        )}
      </div>

      {/* Filter Tabs & Search Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'submitted', 'graded', 'overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                filter === tab
                  ? 'bg-[#142D27] text-white shadow-sm'
                  : 'bg-white text-[#557067] hover:bg-[#E7EFEA] border border-[#e1ede7]'
              }`}
            >
              <span className="capitalize">{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === tab
                    ? 'bg-white/20 text-white'
                    : 'bg-[#F7F9F8] text-[#7d9990]'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Subject Selectors */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search problem sets..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#e1ede7] bg-white focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#e1ede7] bg-white text-[#142D27] focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Grid: 1-col on mobile, 2-col on md, 3-col on lg */}
      {filteredAssignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              hoverable
              className="p-5 flex flex-col justify-between border-t-2"
              style={{
                borderTopColor:
                  assignment.status === 'graded'
                    ? '#14B866'
                    : assignment.status === 'submitted'
                    ? '#0EA5E9'
                    : assignment.status === 'overdue'
                    ? '#EF4444'
                    : '#F59E0B',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#e1ede7]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E7EFEA] text-[#142D27] uppercase">
                      {assignment.subjectCode}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {assignment.assignmentType || 'Homework'}
                    </Badge>
                  </div>

                  <Badge
                    variant={
                      assignment.status === 'graded'
                        ? 'primary'
                        : assignment.status === 'submitted'
                        ? 'info'
                        : assignment.status === 'overdue'
                        ? 'danger'
                        : 'warning'
                    }
                    size="sm"
                  >
                    {assignment.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-[#142D27] mt-3">{assignment.title}</h3>
                <p className="text-xs text-[#557067] mt-1 line-clamp-2 leading-relaxed">
                  {assignment.description}
                </p>

                {/* Metadata Pill Ribbon */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-[#7d9990]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#14B866]" />
                    Due: {assignment.dueDate}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    {assignment.totalMarks} Marks
                  </span>
                  {assignment.fileAttachmentName && (
                    <>
                      <span>&bull;</span>
                      <button
                        onClick={() => handleDownloadAttachment(assignment)}
                        className="flex items-center gap-1 text-[#14B866] hover:underline"
                      >
                        <Paperclip className="w-3 h-3" />
                        Attachment
                      </button>
                    </>
                  )}
                </div>

                {/* Student Personal Submission Callout */}
                {assignment.mySubmission && (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[#142D27] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#14B866]" />
                        Submitted ({assignment.mySubmission.submittedAt})
                      </span>
                      {assignment.mySubmission.score !== undefined && (
                        <span className="text-[#14B866] font-bold">
                          Score: {assignment.mySubmission.score} / {assignment.totalMarks}
                        </span>
                      )}
                    </div>
                    {assignment.mySubmission.feedback && (
                      <p className="text-[11px] text-[#557067] mt-1 pt-1 border-t border-[#e1ede7]/60">
                        <strong className="text-[#142D27]">Feedback:</strong>{' '}
                        {assignment.mySubmission.feedback}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setDetailModalAssignment(assignment)}
                >
                  View Details
                </Button>

                <div className="flex items-center gap-2">
                  {role === 'student' && (
                    <>
                      {assignment.status === 'pending' || assignment.status === 'overdue' ? (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Upload className="w-3.5 h-3.5" />}
                          onClick={() => setSubmitModalAssignment(assignment)}
                        >
                          Submit Solution
                        </Button>
                      ) : assignment.allowResubmission && assignment.status !== 'graded' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<RotateCcw className="w-3.5 h-3.5" />}
                          onClick={() => setSubmitModalAssignment(assignment)}
                        >
                          Resubmit
                        </Button>
                      ) : null}
                    </>
                  )}

                  {role === 'teacher' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Award className="w-3.5 h-3.5 text-amber-500" />}
                        onClick={() =>
                          setGradeModalSubmission({
                            assignment,
                            studentName: assignment.assignedStudentName || 'Alex Rivera',
                            studentId: assignment.assignedTo || 'usr_student_01',
                            score: assignment.totalMarks * 0.9,
                            feedback: 'Excellent work. Mathematical proofs are rigorous.',
                          })
                        }
                      >
                        Grade
                      </Button>

                      <button
                        onClick={() => setDeletingAssignment(assignment)}
                        aria-label="Delete assignment"
                        className="p-1.5 rounded-lg border border-[#e1ede7] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileCheck2 className="w-8 h-8 text-[#14B866]" />}
          title="No Assignments Found"
          description="There are currently no problem sets matching your selected status or filter parameters."
          actionLabel="Reset Search Filters"
          onAction={() => {
            setFilter('all');
            setSearchTerm('');
            setSelectedSubjectFilter('all');
          }}
        />
      )}

      {/* CREATE ASSIGNMENT MODAL (TEACHER) */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish Academic Assignment"
        description="Distribute homework problem sets, reading targets, or laboratory exercise rubrics."
      >
        <form onSubmit={handleSubmit(onPublishAssignment)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Assignment Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Calculus Problem Set 4: Integration by Parts"
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
                Assignment Type
              </label>
              <select
                {...register('assignmentType')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Homework">Homework</option>
                <option value="Reading Task">Reading Task</option>
                <option value="Written Assignment">Written Assignment</option>
                <option value="Short Questions">Short Questions</option>
                <option value="Long Questions">Long Questions</option>
                <option value="Revision Task">Revision Task</option>
                <option value="Practice Exercise">Practice Exercise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {units.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Syllabus Chapter (Optional)
                </label>
                <select
                  {...register('unitId')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
                >
                  <option value="">General Subject</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      Unit {u.unitNumber}: {u.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Assignee Target
              </label>
              <select
                {...register('assignedTo')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
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

          <div className="grid grid-cols-2 gap-3">
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
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                {...register('dueDate')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Description & Questions
            </label>
            <textarea
              rows={3}
              {...register('description')}
              placeholder="Instructions, problem numbers, theoretical proof bounds..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          {/* Attachment Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Attach Worksheet / PDF Guide (Optional)
            </label>
            <div className="border border-dashed border-[#e1ede7] rounded-xl p-3 text-center bg-[#F7F9F8]">
              <input
                type="file"
                id="assignment-attachment-input"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                accept=".pdf,.docx,.doc,.png,.jpg"
                className="hidden"
              />
              <label htmlFor="assignment-attachment-input" className="cursor-pointer block text-xs">
                <Paperclip className="w-4 h-4 text-[#14B866] mx-auto mb-1" />
                <span className="font-semibold text-[#142D27]">
                  {attachmentFile ? attachmentFile.name : 'Click to attach PDF or Document'}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPublishing}
              loadingText="Publishing Task..."
            >
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* SUBMISSION MODAL (STUDENT) */}
      <Modal
        isOpen={!!submitModalAssignment}
        onClose={() => setSubmitModalAssignment(null)}
        title={submitModalAssignment ? `Submit: ${submitModalAssignment.title}` : 'Submit Assignment'}
        description="Upload completed coursework as PDF or scanned high-resolution images."
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
            <strong className="text-[#142D27] block mb-1">Submission Instructions:</strong>
            <p className="text-[#557067]">
              {submitModalAssignment?.submissionInstructions ||
                'Ensure all pages are legible. Include working proofs for each question.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Select Solution Document (PDF, PNG, JPG - Max 25 MB)
            </label>
            <div className="border-2 border-dashed border-[#e1ede7] hover:border-[#14B866] rounded-2xl p-5 text-center cursor-pointer bg-[#F7F9F8]">
              <input
                type="file"
                id="solution-file-input"
                onChange={(e) => setSelectedSubmitFile(e.target.files?.[0] || null)}
                accept=".pdf,.png,.jpg,.jpeg,.docx"
                className="hidden"
              />
              <label htmlFor="solution-file-input" className="cursor-pointer block space-y-1">
                <Upload className="w-6 h-6 text-[#14B866] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#142D27]">
                  {selectedSubmitFile ? selectedSubmitFile.name : 'Click to upload your solution'}
                </p>
                <p className="text-[11px] text-[#7d9990]">
                  {selectedSubmitFile
                    ? `${(selectedSubmitFile.size / (1024 * 1024)).toFixed(2)} MB attached`
                    : 'PDF, JPG, or PNG up to 25MB'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Student Note / Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={submissionComment}
              onChange={(e) => setSubmissionComment(e.target.value)}
              placeholder="e.g. Solution 4 utilizes substitution method; question 10 diagram is on page 4..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSubmitModalAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingFile}
              onClick={handleConfirmSubmit}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailModalAssignment}
        onClose={() => setDetailModalAssignment(null)}
        title={detailModalAssignment?.title || 'Assignment Dossier'}
        description={`${detailModalAssignment?.subjectName} (${detailModalAssignment?.subjectCode})`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] space-y-2 text-xs">
            <p className="text-[#142D27] leading-relaxed whitespace-pre-wrap">
              {detailModalAssignment?.description}
            </p>

            <div className="pt-2 border-t border-[#e1ede7] flex flex-wrap items-center gap-4 text-[#7d9990]">
              <span>
                <strong>Deadline:</strong> {detailModalAssignment?.dueDate}
              </span>
              <span>&bull;</span>
              <span>
                <strong>Total Marks:</strong> {detailModalAssignment?.totalMarks}
              </span>
              <span>&bull;</span>
              <span>
                <strong>Category:</strong> {detailModalAssignment?.assignmentType}
              </span>
            </div>
          </div>

          {detailModalAssignment?.fileAttachmentName && (
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#e1ede7] bg-white">
              <span className="text-xs font-semibold text-[#142D27] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#14B866]" />
                {detailModalAssignment.fileAttachmentName}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5 text-[#14B866]" />}
                onClick={() => handleDownloadAttachment(detailModalAssignment)}
              >
                Download
              </Button>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDetailModalAssignment(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* GRADE MODAL (TEACHER) */}
      <Modal
        isOpen={!!gradeModalSubmission}
        onClose={() => setGradeModalSubmission(null)}
        title="Grade Student Coursework"
        description={`Evaluating submission for: ${gradeModalSubmission?.assignment.title}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs space-y-1">
            <p>
              <strong>Student:</strong> {gradeModalSubmission?.studentName}
            </p>
            <p>
              <strong>Max Marks:</strong> {gradeModalSubmission?.assignment.totalMarks}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Score Awarded (out of {gradeModalSubmission?.assignment.totalMarks})
            </label>
            <input
              type="number"
              value={gradeModalSubmission?.score || 0}
              onChange={(e) =>
                setGradeModalSubmission((prev) =>
                  prev ? { ...prev, score: Number(e.target.value) } : null
                )
              }
              max={gradeModalSubmission?.assignment.totalMarks}
              min={0}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Teacher Feedback & Rubric Notes
            </label>
            <textarea
              rows={3}
              value={gradeModalSubmission?.feedback || ''}
              onChange={(e) =>
                setGradeModalSubmission((prev) =>
                  prev ? { ...prev, feedback: e.target.value } : null
                )
              }
              placeholder="Commendations, mathematical proof precision remarks, or derivation corrections..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGradeModalSubmission(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveGrade}>
              Save Grade & Feedback
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deletingAssignment}
        onClose={() => setDeletingAssignment(null)}
        title="Delete Academic Assignment"
        description="Are you sure you want to delete this assignment? Existing student submissions will be detached."
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Assignment: <strong className="text-[#142D27]">{deletingAssignment?.title}</strong>
          </p>

          <div className="pt-3 border-t border-[#e1ede7] flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAssignmentConfirm}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
