import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  CheckCircle,
  Eye,
  GraduationCap,
  Copy,
  Link as LinkIcon,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { SAMPLE_STUDENTS_LIST, SAMPLE_SUBJECTS } from '../../data/sampleData';
import { Student, Subject } from '../../types';
import { useRole } from '../../hooks/useRole';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';
import { emailService } from '../../services/emailService';

const inviteStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  academicClass: z.string().min(1, 'Please select a grade/class'),
  course: z.string().min(2, 'Course is required'),
  board: z.string().min(2, 'Board is required'),
  academicSession: z.string().min(4, 'Session is required'),
});

type InviteStudentFormData = z.infer<typeof inviteStudentSchema>;

const editStudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  rollNumber: z.string().min(2, 'Roll number is required'),
  academicClass: z.string().min(1, 'Please select a grade/class'),
  course: z.string().min(2, 'Course is required'),
  board: z.string().min(2, 'Board is required'),
  academicSession: z.string().min(4, 'Session is required'),
  status: z.enum(['active', 'inactive']),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

export const StudentsPage: React.FC = () => {
  const { role, user } = useRole();
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterBoard, setFilterBoard] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [selectedStudentPreview, setSelectedStudentPreview] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [assigningSubjectStudent, setAssigningSubjectStudent] = useState<Student | null>(null);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [generatedInviteLink, setGeneratedInviteLink] = useState<string | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [composingStudent, setComposingStudent] = useState<Student | null>(null);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      studentService.fetchStudents(),
      subjectService.fetchSubjects(),
    ]).then(([studentsData, subjectsData]) => {
      if (mounted) {
        if (studentsData && studentsData.length > 0) setStudents(studentsData);
        if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const {
    register: registerInvite,
    handleSubmit: handleInviteSubmit,
    reset: resetInvite,
    formState: { errors: inviteErrors },
  } = useForm<InviteStudentFormData>({
    resolver: zodResolver(inviteStudentSchema),
    defaultValues: {
      name: '',
      email: '',
      academicClass: 'Grade 11',
      course: 'Advanced STEM',
      board: 'Cambridge International (CIE)',
      academicSession: '2026-2027',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
  });

  const onInviteSubmit = async (data: InviteStudentFormData) => {
    setIsInviting(true);
    const { invitation } = await studentService.createInvitation(
      data.email,
      user.id,
      data.academicClass,
      data.course,
      data.board,
      data.academicSession
    );
    setIsInviting(false);

    const newStudent: Student = {
      id: `usr_s_${Date.now()}`,
      name: data.name,
      email: data.email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop',
      grade: data.academicClass,
      enrolledSubjects: ['Computer Science (FA-IT)', 'Urdu & Grammar', 'English & Grammar'],
      assignedSubjectIds: ['sub_01', 'sub_02'],
      overallPerformance: 88.0,
      attendanceRate: 100,
      pendingAssignmentsCount: 0,
      upcomingTestsCount: 1,
      lastActive: 'Invited just now',
      status: 'active',
      rollNumber: `SH-2026-00${students.length + 1}`,
      enrolledAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      academicClass: data.academicClass,
      course: data.course,
      board: data.board,
      academicSession: data.academicSession,
    };

    setStudents((prev) => [newStudent, ...prev]);
    await studentService.saveStudent(newStudent);

    const token = invitation?.token || `sh_inv_${Date.now()}`;
    const inviteUrl = `${window.location.origin}/accept-invite?token=${token}`;
    setGeneratedInviteLink(inviteUrl);

    // Automated dispatch to student's Gmail
    emailService.sendInvitationEmail({
      studentEmail: data.email,
      studentName: data.name,
      teacherName: user?.name || 'Ahmad',
      inviteToken: token,
      course: data.course,
      board: data.board,
    });

    setSuccessToast(`Official invitation dispatched to ${data.email}'s Gmail! Connection established.`);
    setTimeout(() => setSuccessToast(null), 6000);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditValue('name', student.name);
    setEditValue('rollNumber', student.rollNumber || 'SH-2026-001');
    setEditValue('academicClass', student.academicClass || student.grade || 'Grade 11');
    setEditValue('course', student.course || 'Advanced STEM');
    setEditValue('board', student.board || 'Cambridge International (CIE)');
    setEditValue('academicSession', student.academicSession || '2026-2027');
    setEditValue('status', student.status || 'active');
  };

  const onEditSubmit = async (data: EditStudentFormData) => {
    if (!editingStudent) return;
    await studentService.updateStudent(editingStudent.id, {
      fullName: data.name,
      rollNumber: data.rollNumber,
      academicClass: data.academicClass,
      course: data.course,
      board: data.board,
      academicSession: data.academicSession,
      status: data.status,
    });

    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              name: data.name,
              rollNumber: data.rollNumber,
              grade: data.academicClass,
              academicClass: data.academicClass,
              course: data.course,
              board: data.board,
              academicSession: data.academicSession,
              status: data.status,
            }
          : s
      )
    );

    const name = data.name;
    setEditingStudent(null);
    setSuccessToast(`Student profile for "${name}" updated successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleToggleStatus = async (student: Student) => {
    const { newStatus } = await studentService.toggleStudentStatus(student.id, student.status);
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, status: newStatus } : s))
    );
    setSuccessToast(`${student.name} marked as ${newStatus.toUpperCase()}`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenAssignSubjects = (student: Student) => {
    setAssigningSubjectStudent(student);
    setSelectedSubjectIds(student.assignedSubjectIds || ['sub_01', 'sub_02']);
  };

  const handleSaveAssignedSubjects = async () => {
    if (!assigningSubjectStudent) return;
    await studentService.assignSubjectsToStudent(assigningSubjectStudent.id, selectedSubjectIds);

    const assignedNames = subjects
      .filter((sub) => selectedSubjectIds.includes(sub.id))
      .map((sub) => sub.name);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === assigningSubjectStudent.id
          ? {
              ...s,
              assignedSubjectIds: selectedSubjectIds,
              enrolledSubjects: assignedNames,
            }
          : s
      )
    );

    const name = assigningSubjectStudent.name;
    setAssigningSubjectStudent(null);
    setSuccessToast(`Subject curriculum updated for ${name}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCopyInviteLink = () => {
    if (!generatedInviteLink) return;
    navigator.clipboard.writeText(generatedInviteLink);
    setSuccessToast('Invitation link copied to clipboard!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    await studentService.deleteStudent(studentToDelete.id);
    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
    setIsDeleting(false);
    const removedName = studentToDelete.name;
    setStudentToDelete(null);
    setSuccessToast(`Student "${removedName}" has been successfully removed from StudyHub.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = filterClass === 'all' || s.grade === filterClass || s.academicClass === filterClass;
    const matchesCourse = filterCourse === 'all' || s.course === filterCourse;
    const matchesBoard = filterBoard === 'all' || s.board === filterBoard;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesClass && matchesCourse && matchesBoard && matchesStatus;
  });

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

      {/* Student View Banner - View Only (No Switch Button) */}
      {role === 'student' && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-700">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Enrolled Scholar Roster:</strong> You are viewing your enrolled 1st Year FA-IT cohort profile under Faculty Lead <strong>Ahmad</strong>.
            </span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142D27]">Student Roster & Cohort Management</h1>
            <Badge variant="primary" size="sm" dot>
              {students.length} Registered Scholars
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Maintain student profiles, assign subject curricula, inspect academic mastery, and manage account statuses.
          </p>
        </div>

        {role === 'teacher' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Mail className="w-4 h-4 text-[#14B866]" />}
              onClick={() => {
                setComposingStudent(null);
                setIsComposeModalOpen(true);
              }}
            >
              Compose Gmail
            </Button>
            <Button
              variant="primary"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={() => {
                setGeneratedInviteLink(null);
                resetInvite();
                setIsEnrollModalOpen(true);
              }}
            >
              Add / Invite Student
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, email or roll number..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          {/* Quick Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['all', 'active', 'inactive'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-[#142D27] text-white shadow-sm'
                    : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            aria-label="Filter students by class"
            className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          >
            <option value="all">All Classes / Grades</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
          </select>

          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            aria-label="Filter students by course stream"
            className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          >
            <option value="all">All Course Streams</option>
            <option value="Advanced STEM">Advanced STEM</option>
            <option value="Pre-Medical">Pre-Medical</option>
            <option value="Engineering Track">Engineering Track</option>
          </select>

          <select
            value={filterBoard}
            onChange={(e) => setFilterBoard(e.target.value)}
            aria-label="Filter students by academic board"
            className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          >
            <option value="all">All Examination Boards</option>
            <option value="Cambridge International (CIE)">Cambridge International (CIE)</option>
            <option value="CBSE">CBSE</option>
            <option value="International Baccalaureate (IB)">International Baccalaureate (IB)</option>
          </select>
        </div>
      </div>

      {/* Students List Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} hoverable className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#e1ede7]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#142D27]">{student.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E7EFEA] text-[#142D27]">
                          {student.rollNumber || 'SH-2026'}
                        </span>
                      </div>
                      <p className="text-xs text-[#557067] flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-[#7d9990]" />
                        {student.email}
                      </p>
                      <span className="text-[11px] font-semibold text-[#14B866] mt-0.5 inline-block">
                        {student.academicClass || student.grade} &bull; {student.course || 'Advanced STEM'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={student.status === 'active' ? 'primary' : 'neutral'} size="sm" dot>
                      {student.status}
                    </Badge>
                    {role === 'teacher' && (
                      <button
                        onClick={() => handleToggleStatus(student)}
                        title={student.status === 'active' ? 'Deactivate access' : 'Activate access'}
                        className="text-[11px] font-semibold text-[#557067] hover:text-[#142D27] flex items-center gap-1"
                      >
                        {student.status === 'active' ? (
                          <ToggleRight className="w-4 h-4 text-[#14B866]" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-zinc-400" />
                        )}
                        <span className="text-[10px]">{student.status === 'active' ? 'Active' : 'Inactive'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Academic Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#e1ede7] text-center">
                  <div className="p-2 rounded-xl bg-[#F7F9F8]">
                    <p className="text-[10px] text-[#7d9990] font-medium uppercase tracking-wider">
                      Mastery
                    </p>
                    <p className="text-sm font-bold text-[#14B866] mt-0.5">
                      {student.overallPerformance}%
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F9F8]">
                    <p className="text-[10px] text-[#7d9990] font-medium uppercase tracking-wider">
                      Attendance
                    </p>
                    <p className="text-sm font-bold text-[#142D27] mt-0.5">
                      {student.attendanceRate}%
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F7F9F8]">
                    <p className="text-[10px] text-[#7d9990] font-medium uppercase tracking-wider">
                      Enrolled
                    </p>
                    <p className="text-sm font-bold text-[#142D27] mt-0.5">
                      {student.enrolledSubjects.length} Courses
                    </p>
                  </div>
                </div>

                {/* Enrolled Subjects Pills */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[11px] font-semibold text-[#557067]">Curriculum Assignments:</p>
                    {role === 'teacher' && (
                      <button
                        onClick={() => handleOpenAssignSubjects(student)}
                        className="text-[11px] font-semibold text-[#14B866] hover:underline"
                      >
                        Manage Subjects
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.enrolledSubjects.map((sub, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#E7EFEA] text-[#142D27]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between text-xs">
                <span className="text-[#7d9990] text-[11px]">
                  Enrolled: {student.enrolledAt || 'Aug 2026'}
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {role === 'teacher' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Send direct email to student"
                        icon={<Mail className="w-3.5 h-3.5 text-[#14B866]" />}
                        onClick={() => {
                          setComposingStudent(student);
                          setIsComposeModalOpen(true);
                        }}
                      >
                        Mail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit3 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(student)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => setStudentToDelete(student)}
                        title="Remove student from cohort"
                      >
                        Remove
                      </Button>
                    </>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedStudentPreview(student)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="w-8 h-8 text-[#14B866]" />}
          title="No Students Found"
          description={`No student matches your current filter or search criteria.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setFilterClass('all');
            setFilterCourse('all');
            setFilterBoard('all');
            setFilterStatus('all');
          }}
        />
      )}

      {/* Edit Student Modal */}
      <Modal
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        title="Edit Student Information"
        description={`Update academic credentials and cohort stream for ${editingStudent?.name}.`}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Full Name</label>
              <input
                type="text"
                {...registerEdit('name')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {editErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{editErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Roll Number</label>
              <input
                type="text"
                {...registerEdit('rollNumber')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {editErrors.rollNumber && (
                <p className="text-xs text-rose-600 mt-1">{editErrors.rollNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Academic Class</label>
              <select
                {...registerEdit('academicClass')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Course Stream</label>
              <select
                {...registerEdit('course')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Advanced STEM">Advanced STEM</option>
                <option value="Pre-Medical">Pre-Medical</option>
                <option value="Engineering Track">Engineering Track</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Examination Board</label>
              <select
                {...registerEdit('board')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Cambridge International (CIE)">Cambridge International (CIE)</option>
                <option value="CBSE">CBSE</option>
                <option value="International Baccalaureate (IB)">International Baccalaureate (IB)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Academic Session</label>
              <input
                type="text"
                {...registerEdit('academicSession')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Portal Status</label>
            <select
              {...registerEdit('status')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
            >
              <option value="active">Active Access</option>
              <option value="inactive">Deactivated Access</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStudent(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Subjects Modal */}
      <Modal
        isOpen={!!assigningSubjectStudent}
        onClose={() => setAssigningSubjectStudent(null)}
        title="Assign Subjects Curriculum"
        description={`Select active courses for ${assigningSubjectStudent?.name}.`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Enrolling a student grants access to the subject's syllabus, tests, problem sets, and digital textbooks.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {subjects.map((subj) => {
              const isChecked = selectedSubjectIds.includes(subj.id);
              return (
                <div
                  key={subj.id}
                  onClick={() => {
                    setSelectedSubjectIds((prev) =>
                      isChecked ? prev.filter((id) => id !== subj.id) : [...prev, subj.id]
                    );
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#e8f8f0]/50 border-[#14B866]'
                      : 'bg-white border-[#e1ede7] hover:border-[#14B866]/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subj.accentColor }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#142D27]">{subj.name}</h4>
                      <p className="text-[11px] text-[#7d9990]">{subj.code} &bull; {subj.category}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 text-[#14B866] rounded accent-[#14B866]"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setAssigningSubjectStudent(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAssignedSubjects}>
              Save Curriculum Assignments
            </Button>
          </div>
        </div>
      </Modal>

      {/* Student Profile Details Modal */}
      <Modal
        isOpen={!!selectedStudentPreview}
        onClose={() => setSelectedStudentPreview(null)}
        title="Student Academic Profile"
        description={`Certified academic record & curriculum transcript for ${selectedStudentPreview?.name}.`}
      >
        {selectedStudentPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7]">
              <img
                src={selectedStudentPreview.avatar}
                alt={selectedStudentPreview.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#14B866]"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#142D27]">{selectedStudentPreview.name}</h3>
                  <Badge variant={selectedStudentPreview.status === 'active' ? 'primary' : 'neutral'} size="sm">
                    {selectedStudentPreview.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#557067]">{selectedStudentPreview.email}</p>
                <p className="text-xs font-mono font-semibold text-[#14B866]">
                  Roll: {selectedStudentPreview.rollNumber || 'SH-2026-001'} &bull; Enrolled: {selectedStudentPreview.enrolledAt || 'Aug 2026'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-[#e1ede7] bg-white text-center">
                <span className="text-[11px] text-[#7d9990] block font-medium">Mastery Average</span>
                <span className="text-2xl font-extrabold text-[#14B866]">
                  {selectedStudentPreview.overallPerformance}%
                </span>
              </div>
              <div className="p-3 rounded-xl border border-[#e1ede7] bg-white text-center">
                <span className="text-[11px] text-[#7d9990] block font-medium">Cohort Attendance</span>
                <span className="text-2xl font-extrabold text-[#142D27]">
                  {selectedStudentPreview.attendanceRate}%
                </span>
              </div>
            </div>

            {/* Academic Board & Course Details */}
            <div className="p-3.5 rounded-xl bg-white border border-[#e1ede7] grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7d9990]">Class / Grade</span>
                <p className="font-semibold text-[#142D27] mt-0.5">{selectedStudentPreview.academicClass || selectedStudentPreview.grade}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7d9990]">Course Stream</span>
                <p className="font-semibold text-[#142D27] mt-0.5">{selectedStudentPreview.course || 'Advanced STEM'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7d9990]">Examination Board</span>
                <p className="font-semibold text-[#142D27] mt-0.5">{selectedStudentPreview.board || 'Cambridge International (CIE)'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7d9990]">Academic Session</span>
                <p className="font-semibold text-[#142D27] mt-0.5">{selectedStudentPreview.academicSession || '2026-2027'}</p>
              </div>
            </div>

            {/* Enrolled Subjects List */}
            <div>
              <p className="text-xs font-semibold text-[#142D27] mb-1.5">Enrolled Subject Curriculum:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudentPreview.enrolledSubjects.map((sub, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#E7EFEA] text-[#142D27]"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedStudentPreview(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invite Student Modal (Invitation-Based Flow) */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Invite New Student"
        description="Issue an invitation token with pre-assigned academic credentials."
      >
        {generatedInviteLink ? (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900">Student Invitation Generated</h4>
              <p className="text-xs text-emerald-700">
                Share this secure onboarding link with the student to let them activate their account:
              </p>
              <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-mono text-[#142D27] break-all select-all">
                <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate flex-1">{generatedInviteLink}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={handleCopyInviteLink}
              >
                Copy Link
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setGeneratedInviteLink(null);
                  setIsEnrollModalOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleInviteSubmit(onInviteSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Student Full Name</label>
              <input
                type="text"
                {...registerInvite('name')}
                placeholder="e.g. Jordan Miller"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {inviteErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{inviteErrors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Designated Email Address</label>
              <input
                type="email"
                {...registerInvite('email')}
                placeholder="student@example.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {inviteErrors.email && (
                <p className="text-xs text-rose-600 mt-1">{inviteErrors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Academic Class</label>
                <select
                  {...registerInvite('academicClass')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
                >
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Course Track</label>
                <input
                  type="text"
                  {...registerInvite('course')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Board</label>
                <input
                  type="text"
                  {...registerInvite('board')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">Academic Session</label>
                <input
                  type="text"
                  {...registerInvite('academicSession')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEnrollModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isInviting}
                loadingText="Dispatching Invite..."
              >
                Generate Secure Invite
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete / Remove Student Confirmation Modal */}
      {studentToDelete && (
        <Modal
          isOpen={!!studentToDelete}
          onClose={() => setStudentToDelete(null)}
          title="Confirm Student Removal"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>
                Are you sure you want to remove <strong>{studentToDelete.name}</strong> ({studentToDelete.rollNumber}) from Global Science Academy?
              </span>
            </div>
            <p className="text-xs text-[#557067] leading-relaxed">
              This action revokes their platform access, removes their subject course assignments, and archives their test records. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e1ede7]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                isLoading={isDeleting}
                loadingText="Removing..."
                onClick={handleConfirmDeleteStudent}
              >
                Yes, Remove Student
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Direct Compose Email Modal */}
      <ComposeEmailModal
        isOpen={isComposeModalOpen}
        onClose={() => {
          setIsComposeModalOpen(false);
          setComposingStudent(null);
        }}
        defaultRecipientEmail={composingStudent?.email}
        defaultRecipientName={composingStudent?.name}
        onSuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
