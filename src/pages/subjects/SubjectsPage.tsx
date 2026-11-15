import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PlusCircle,
  Clock,
  Calendar,
  ArrowRight,
  CheckCircle,
  Edit3,
  Trash2,
  Users,
  FolderGit2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SubjectProgressChart } from '../../components/charts/SubjectProgressChart';
import { Modal } from '../../components/ui/Modal';
import { SAMPLE_SUBJECTS, SAMPLE_STUDENTS_LIST } from '../../data/sampleData';
import { Subject, Student } from '../../types';
import { Link } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';

const subjectSchema = z.object({
  name: z.string().min(3, 'Subject name must be at least 3 characters'),
  code: z.string().min(3, 'Subject code must be at least 3 characters').max(10, 'Code too long'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  totalModules: z.number().min(1, 'Minimum 1 module').max(30, 'Maximum 30 modules'),
  category: z.enum(['1st Year FA-IT', 'FA-IT', '1st Year FSc', '2nd Year FSc', 'STEM', 'Humanities', 'Languages', 'Commerce']),
  course: z.string().min(2, 'Course stream is required'),
  academicSession: z.string().min(4, 'Session is required'),
  accentColor: z.string().min(4, 'Color is required'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

export const SubjectsPage: React.FC = () => {
  const { role, user } = useRole();
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<Subject | null>(null);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      subjectService.fetchSubjects(),
      studentService.fetchStudents(),
    ]).then(([subjectsData, studentsData]) => {
      if (mounted) {
        if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
        if (studentsData && studentsData.length > 0) setStudents(studentsData);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      totalModules: 12,
      category: 'STEM',
      course: 'Advanced STEM',
      academicSession: '2026-2027',
      accentColor: '#14B866',
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const onAddSubjectSubmit = async (data: SubjectFormData) => {
    setIsSubmitting(true);
    const { subject, error } = await subjectService.createSubject({
      name: data.name,
      code: data.code,
      totalModules: data.totalModules,
      category: data.category,
      course: data.course,
      academicSession: data.academicSession,
      description: data.description,
      accentColor: data.accentColor,
      teacherId: user?.id,
    });

    setIsSubmitting(false);

    if (error) {
      alert(`Could not create subject: ${error.message}`);
      return;
    }

    if (subject) {
      setSubjects((prev) => [subject, ...prev]);
    }
    setIsModalOpen(false);
    resetCreate();
    setSuccessToast(`Subject ${data.name} added successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setEditValue('name', subject.name);
    setEditValue('code', subject.code);
    setEditValue('description', subject.description || '');
    setEditValue('totalModules', subject.totalModules);
    setEditValue('category', subject.category);
    setEditValue('course', subject.course || 'Advanced STEM');
    setEditValue('academicSession', subject.academicSession || '2026-2027');
    setEditValue('accentColor', subject.accentColor || '#14B866');
  };

  const onEditSubjectSubmit = async (data: SubjectFormData) => {
    if (!editingSubject) return;
    setIsSubmitting(true);
    const { error } = await subjectService.updateSubject(editingSubject.id, {
      name: data.name,
      code: data.code,
      description: data.description,
      totalModules: data.totalModules,
      category: data.category,
      course: data.course,
      academicSession: data.academicSession,
      accentColor: data.accentColor,
    });
    setIsSubmitting(false);

    if (error) {
      alert(`Could not update subject: ${error.message}`);
      return;
    }

    setSubjects((prev) =>
      prev.map((s) =>
        s.id === editingSubject.id
          ? {
              ...s,
              name: data.name,
              code: data.code.toUpperCase(),
              description: data.description,
              totalModules: data.totalModules,
              category: data.category,
              course: data.course,
              academicSession: data.academicSession,
              accentColor: data.accentColor,
            }
          : s
      )
    );

    const name = data.name;
    setEditingSubject(null);
    setSuccessToast(`Subject "${name}" updated successfully!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    const { success, error } = await subjectService.deleteSubject(deletingSubject.id);
    if (!success || error) {
      alert(`Failed to delete subject: ${error?.message}`);
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
    const name = deletingSubject.name;
    setDeletingSubject(null);
    setSuccessToast(`Subject "${name}" deleted from curriculum.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenAssignStudents = async (subject: Subject) => {
    setAssigningSubject(subject);
    const studentIds = await subjectService.fetchSubjectStudents(subject.id);
    setAssignedStudentIds(studentIds);
  };

  const handleSaveStudentAssignments = async () => {
    if (!assigningSubject) return;
    await subjectService.assignStudentsToSubject(assigningSubject.id, assignedStudentIds);
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === assigningSubject.id
          ? { ...s, assignedStudentCount: assignedStudentIds.length }
          : s
      )
    );
    const name = assigningSubject.name;
    setAssigningSubject(null);
    setSuccessToast(`Enrollment roster updated for ${name}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesCourse = selectedCourse === 'all' || s.course === selectedCourse;
    const matchesSession = selectedSession === 'all' || s.academicSession === selectedSession;
    return matchesCategory && matchesCourse && matchesSession;
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142D27]">Curriculum & Subject Management</h1>
            <Badge variant="primary" size="sm" dot>
              {subjects.length} Active Courses
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Configure disciplines, syllabus structures, student allocations, and session mappings.
          </p>
        </div>

        {role === 'teacher' && (
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Subject
          </Button>
        )}
      </div>

      {/* Course & Session Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter subjects by category"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Categories</option>
          <option value="1st Year FSc">1st Year FSc (Part 1)</option>
          <option value="2nd Year FSc">2nd Year FSc (Part 2)</option>
          <option value="STEM">STEM</option>
          <option value="Commerce">Commerce</option>
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          aria-label="Filter subjects by course"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Course Streams</option>
          <option value="Advanced STEM">Advanced STEM</option>
          <option value="Pre-Medical">Pre-Medical</option>
          <option value="Engineering Track">Engineering Track</option>
        </select>

        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          aria-label="Filter subjects by academic session"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Academic Sessions</option>
          <option value="2026-2027">Session 2026–2027</option>
          <option value="2025-2026">Session 2025–2026</option>
        </select>
      </div>

      {/* Progress Chart Bento Card */}
      <Card>
        <CardHeader className="pb-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Syllabus Completion Overview</CardTitle>
              <Badge variant="success" size="sm">
                On Schedule
              </Badge>
            </div>
            <CardDescription>
              Percentage of topics and modules completed per subject against the academic calendar.
            </CardDescription>
          </div>
          <span className="text-xs text-[#557067] font-semibold hidden sm:inline-block">
            Fall Semester 2026
          </span>
        </CardHeader>
        <div className="mt-4">
          <SubjectProgressChart subjects={subjects} />
        </div>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} hoverable className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-white tracking-wider"
                  style={{ backgroundColor: subject.accentColor }}
                >
                  {subject.code}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge variant="neutral" size="sm">
                    {subject.category}
                  </Badge>
                  <span className="text-[10px] font-bold text-[#7d9990] bg-[#F7F9F8] px-2 py-0.5 rounded border border-[#e1ede7]">
                    {subject.academicSession || '2026-2027'}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-[#142D27] mt-3">{subject.name}</h3>
              <p className="text-xs text-[#557067] mt-0.5">Instructor: {subject.teacherName}</p>

              {subject.description && (
                <p className="text-xs text-[#557067] mt-2 leading-relaxed bg-[#F7F9F8] p-2.5 rounded-xl border border-[#e1ede7]">
                  {subject.description}
                </p>
              )}

              {/* Course Meta Info */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#557067]">
                <div className="flex items-center gap-1.5">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#14B866]" />
                  <span>Chapters: <strong>{subject.chapterCount || subject.totalModules}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  <span>Enrolled: <strong>{subject.assignedStudentCount || 3} Students</strong></span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#557067]">Curriculum Mastery</span>
                  <span className="text-[#14B866]">{subject.progress}%</span>
                </div>
                <div className="w-full bg-[#E7EFEA] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${subject.progress}%`, backgroundColor: subject.accentColor }}
                  />
                </div>
              </div>

              {/* Class Schedule Meta */}
              <div className="mt-4 p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] flex flex-col gap-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#557067]">
                  <Clock className="w-3.5 h-3.5 text-[#14B866]" />
                  <span>Next Class: </span>
                  <strong className="text-[#142D27]">{subject.nextClassTime}</strong>
                </div>
                <div className="flex items-center gap-2 text-[#557067]">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>Meeting Days: </span>
                  <div className="flex gap-1">
                    {subject.scheduleDays.map((d) => (
                      <span key={d} className="px-1.5 py-0.2 rounded bg-white font-medium text-[#142D27]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between gap-2">
              <Link
                to="/syllabus"
                className="text-xs font-bold text-[#14B866] hover:text-[#109653] flex items-center gap-1"
              >
                Inspect Syllabus <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-1.5">
                {role === 'teacher' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Users className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenAssignStudents(subject)}
                    >
                      Students
                    </Button>
                    <button
                      onClick={() => handleOpenEdit(subject)}
                      aria-label="Edit subject"
                      className="p-1.5 rounded-lg border border-[#e1ede7] text-zinc-500 hover:text-[#142D27] hover:bg-[#F7F9F8] transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubject(subject)}
                      aria-label="Delete subject"
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

      {/* Create Subject Modal - Simple, Direct Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Subject"
        description="Quickly register an academic course to assign syllabus modules and books."
      >
        <form onSubmit={handleCreateSubmit(onAddSubjectSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject Title *</label>
            <input
              type="text"
              {...registerCreate('name')}
              placeholder="e.g. Linear Algebra & Vector Spaces"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {createErrors.name && <p className="text-xs text-rose-600 mt-1">{createErrors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject Code *</label>
              <input
                type="text"
                {...registerCreate('code')}
                placeholder="e.g. MATH-204"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
              {createErrors.code && <p className="text-xs text-rose-600 mt-1">{createErrors.code.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Category</label>
              <select
                {...registerCreate('category')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white focus:outline-none focus:border-[#14B866]"
              >
                <option value="1st Year FSc">1st Year FSc (Part 1)</option>
                <option value="2nd Year FSc">2nd Year FSc (Part 2)</option>
                <option value="STEM">STEM</option>
                <option value="Commerce">Commerce</option>
                <option value="Humanities">Humanities</option>
                <option value="Languages">Languages</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Course Stream</label>
            <input
              type="text"
              {...registerCreate('course')}
              placeholder="e.g. Advanced STEM (2026-2027)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Summary / Focus (Optional)</label>
            <input
              type="text"
              {...registerCreate('description')}
              placeholder="Core topics, theorems and weekly homework goals..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e1ede7]">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Adding Subject..."
            >
              Add Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title="Edit Subject Course"
        description={`Modify course parameters and modular units for ${editingSubject?.name}.`}
      >
        <form onSubmit={handleEditSubmit(onEditSubjectSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject Title</label>
            <input
              type="text"
              {...registerEdit('name')}
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {editErrors.name && <p className="text-xs text-rose-600 mt-1">{editErrors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject Code</label>
              <input
                type="text"
                {...registerEdit('code')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Total Chapters</label>
              <input
                type="number"
                {...registerEdit('totalModules', { valueAsNumber: true })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Description</label>
            <textarea
              rows={2}
              {...registerEdit('description')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Category</label>
              <select
                {...registerEdit('category')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="1st Year FSc">1st Year FSc (Part 1)</option>
                <option value="2nd Year FSc">2nd Year FSc (Part 2)</option>
                <option value="STEM">STEM</option>
                <option value="Commerce">Commerce</option>
                <option value="Humanities">Humanities</option>
                <option value="Languages">Languages</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Course Stream</label>
              <input
                type="text"
                {...registerEdit('course')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Session</label>
              <input
                type="text"
                {...registerEdit('academicSession')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditingSubject(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Students Modal */}
      <Modal
        isOpen={!!assigningSubject}
        onClose={() => setAssigningSubject(null)}
        title="Assign Students to Subject"
        description={`Manage enrolled cohort for ${assigningSubject?.name}.`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067]">
            Select which registered scholars are enrolled in this academic subject course:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {students.map((st) => {
              const isChecked = assignedStudentIds.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setAssignedStudentIds((prev) =>
                      isChecked ? prev.filter((id) => id !== st.id) : [...prev, st.id]
                    );
                  }}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#e8f8f0]/50 border-[#14B866]'
                      : 'bg-white border-[#e1ede7] hover:border-[#14B866]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-[#142D27]">{st.name}</h4>
                      <p className="text-[11px] text-[#7d9990]">{st.email} &bull; {st.grade}</p>
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
            <Button variant="ghost" size="sm" onClick={() => setAssigningSubject(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveStudentAssignments}>
              Update Enrolled Cohort
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Subject Confirmation Modal */}
      <Modal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        title="Confirm Subject Deletion"
        description="Are you sure you wish to delete this subject course?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067] leading-relaxed">
            Deleting <strong>"{deletingSubject?.name}"</strong> ({deletingSubject?.code}) will permanently remove its syllabus units, topics, and student enrollments. This action cannot be reversed.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingSubject(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteSubject}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
