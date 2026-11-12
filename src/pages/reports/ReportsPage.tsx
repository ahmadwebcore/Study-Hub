import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Eye,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PerformanceChart } from '../../components/charts/PerformanceChart';
import { SubjectProgressChart } from '../../components/charts/SubjectProgressChart';
import {
  SAMPLE_PERFORMANCE_METRICS,
  SAMPLE_SUBJECTS,
  SAMPLE_STUDENTS_LIST,
  SAMPLE_RESULTS,
  SAMPLE_ASSIGNMENTS,
} from '../../data/sampleData';
import { Student, Subject, ResultRecord, Assignment } from '../../types';
import { useRole } from '../../hooks/useRole';
import { studentService } from '../../services/studentService';
import { subjectService } from '../../services/subjectService';
import { testService } from '../../services/testService';
import { assignmentService } from '../../services/assignmentService';
import { reportService, AcademicAnalyticsSummary } from '../../services/reportService';

export const ReportsPage: React.FC = () => {
  const { role, user } = useRole();
  const [students, setStudents] = useState<Student[]>(SAMPLE_STUDENTS_LIST);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [results, setResults] = useState<ResultRecord[]>(SAMPLE_RESULTS);
  const [assignments, setAssignments] = useState<Assignment[]>(SAMPLE_ASSIGNMENTS);
  const [analytics, setAnalytics] = useState<AcademicAnalyticsSummary>({
    overallAverage: 88.5,
    attendanceIndex: 96.8,
    submissionRate: 98.2,
    syllabusCompletion: 74.0,
    strongSubjects: ['Advanced Calculus & Vectors (MATH-301)', 'Data Structures (CS-401)'],
    weakSubjects: ['Analytical Chemistry (CHEM-205)'],
    upcomingDeadlines: 3,
  });

  // Individual Student Dossier state (for teacher inspection or student view)
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    role === 'student' ? user.id : SAMPLE_STUDENTS_LIST[0]?.id || ''
  );
  const [studentReportModal, setStudentReportModal] = useState<Student | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      studentService.fetchStudents(),
      subjectService.fetchSubjects(),
      testService.fetchResults(role === 'student' ? user.id : undefined),
      assignmentService.fetchAssignments(role === 'student' ? user.id : undefined),
      reportService.fetchAnalyticsSummary(role === 'student' ? user.id : undefined),
    ]).then(([studData, subjData, resData, asgData, anData]) => {
      if (mounted) {
        if (studData && studData.length > 0) setStudents(studData);
        if (subjData && subjData.length > 0) setSubjects(subjData);
        if (resData && resData.length > 0) setResults(resData);
        if (asgData && asgData.length > 0) setAssignments(asgData);
        if (anData) setAnalytics(anData);
      }
    });

    return () => {
      mounted = false;
    };
  }, [role, user.id]);

  // Selected Student object
  const activeStudent =
    students.find((s) => s.id === selectedStudentId) || students[0] || SAMPLE_STUDENTS_LIST[0];

  // CSV Exporters
  const handleExportCohortCSV = () => {
    reportService.exportCohortCSV(students);
    setDownloadToast('Cohort enrollment & performance CSV generated and downloaded!');
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleExportSubjectMarksCSV = () => {
    reportService.exportSubjectMarksCSV(results);
    setDownloadToast('Subject-wise assessment mark sheet CSV generated and downloaded!');
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleExportAssignmentsCSV = () => {
    reportService.exportAssignmentsCSV(assignments);
    setDownloadToast('Assignment completion & deadline audit CSV generated and downloaded!');
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleDownloadSummary = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {downloadToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#142D27] flex items-center justify-between text-xs font-semibold shadow-sm animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#14B866]" />
            {downloadToast}
          </span>
          <button
            onClick={() => setDownloadToast(null)}
            className="text-zinc-400 hover:text-zinc-700"
          >
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">
              {role === 'teacher' ? 'Institutional Analytics & Reports' : 'Personal Academic Progress'}
            </h1>
            <Badge variant="primary" size="sm" dot>
              {role === 'teacher' ? 'Faculty Dossier' : 'Student Record'}
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Certified metrics on longitudinal learning trajectory, examination velocity, syllabus mastery, and diagnostic areas.
          </p>
        </div>

        {/* Global Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-[#14B866]" />}
            onClick={handleExportCohortCSV}
          >
            Cohort CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-sky-600" />}
            onClick={handleExportSubjectMarksCSV}
          >
            Mark Sheet CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<FileSpreadsheet className="w-4 h-4 text-purple-600" />}
            onClick={handleExportAssignmentsCSV}
          >
            Assignments CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadSummary}
          >
            Print Dossier
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-[#557067]">
            <span className="font-semibold uppercase tracking-wider">Cohort Grade Average</span>
            <Badge variant="primary" size="sm">
              {analytics.overallAverage}%
            </Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">
            {analytics.overallAverage >= 85 ? 'Honors Standing' : 'Standard'}
          </p>
          <p className="text-xs text-[#7d9990] mt-1">Weighted across all STEM assessment records</p>
        </Card>

        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-[#557067]">
            <span className="font-semibold uppercase tracking-wider">Attendance Index</span>
            <Badge variant="primary" size="sm">
              {analytics.attendanceIndex}%
            </Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">Optimal</p>
          <p className="text-xs text-[#7d9990] mt-1">Consistent attendance across classroom lectures</p>
        </Card>

        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-[#557067]">
            <span className="font-semibold uppercase tracking-wider">On-Time Submissions</span>
            <Badge variant="primary" size="sm">
              {analytics.submissionRate}%
            </Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">Active</p>
          <p className="text-xs text-[#7d9990] mt-1">Zero forfeited assignments or test forfeitures</p>
        </Card>

        <Card className="p-5 bg-white">
          <div className="flex items-center justify-between text-xs text-[#557067]">
            <span className="font-semibold uppercase tracking-wider">Syllabus Progress</span>
            <Badge variant="info" size="sm">
              {analytics.syllabusCompletion}%
            </Badge>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">On Track</p>
          <p className="text-xs text-[#7d9990] mt-1">Accelerated pace through foundational modules</p>
        </Card>
      </div>

      {/* Diagnostic Strengths & Growth Areas Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-l-[#14B866]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#14B866] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Highest Proficiency Areas
          </div>
          <p className="text-xs text-[#557067] mt-1">
            Subjects and chapters demonstrating grade scores above 85%:
          </p>
          <div className="mt-3 space-y-2">
            {analytics.strongSubjects.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-semibold text-emerald-900"
              >
                <span>{s}</span>
                <Badge variant="primary" size="sm">
                  92% Average
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            Recommended Diagnostic Focus
          </div>
          <p className="text-xs text-[#557067] mt-1">
            Subjects or modules where reinforcement and extra practice is advised:
          </p>
          <div className="mt-3 space-y-2">
            {analytics.weakSubjects.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs font-semibold text-amber-900"
              >
                <span>{s}</span>
                <Badge variant="warning" size="sm">
                  Needs Revision
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div>
              <CardTitle>Longitudinal Learning Trajectory</CardTitle>
              <CardDescription>Continuous trend line vs course benchmark</CardDescription>
            </div>
          </CardHeader>
          <div className="mt-4">
            <PerformanceChart data={SAMPLE_PERFORMANCE_METRICS} />
          </div>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div>
              <CardTitle>Curriculum Progression by Discipline</CardTitle>
              <CardDescription>Relative module completion across active subjects</CardDescription>
            </div>
          </CardHeader>
          <div className="mt-4">
            <SubjectProgressChart subjects={subjects} />
          </div>
        </Card>
      </div>

      {/* INDIVIDUAL STUDENT DOSSIER INSPECTOR (TEACHER) */}
      {role === 'teacher' && (
        <Card className="p-5 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
            <div>
              <h3 className="text-base font-bold text-[#142D27]">
                Individual Student Academic Dossier
              </h3>
              <p className="text-xs text-[#557067] mt-0.5">
                Select a candidate to review their verified marks, assignment status, and print their official report card.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="student-selector" className="text-xs font-semibold text-[#142D27]">Student:</label>
              <select
                id="student-selector"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-[#e1ede7] bg-white text-[#142D27] focus:outline-none"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.rollNumber || 'SH-1001'})
                  </option>
                ))}
              </select>

              <Button
                variant="outline"
                size="sm"
                icon={<Eye className="w-3.5 h-3.5 text-[#14B866]" />}
                onClick={() => setStudentReportModal(activeStudent)}
              >
                View Report Card
              </Button>
            </div>
          </div>

          {activeStudent && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center gap-3">
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-xs"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#142D27]">{activeStudent.name}</h4>
                  <span className="text-xs text-[#557067]">{activeStudent.email}</span>
                  <span className="text-[10px] text-[#7d9990] block mt-0.5">
                    {activeStudent.academicClass || 'Grade 11'} &bull; {activeStudent.course || 'Advanced STEM'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] text-center">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Overall Performance
                </span>
                <span className="text-2xl font-black text-[#14B866] mt-1 block">
                  {activeStudent.overallPerformance}%
                </span>
                <span className="text-[11px] text-[#557067]">Grade: {activeStudent.grade}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] text-center">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Attendance Record
                </span>
                <span className="text-2xl font-black text-[#142D27] mt-1 block">
                  {activeStudent.attendanceRate}%
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">Verified Active</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] text-center">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Active Subjects
                </span>
                <span className="text-2xl font-black text-sky-600 mt-1 block">
                  {activeStudent.enrolledSubjects?.length || 4}
                </span>
                <span className="text-[11px] text-[#557067]">Curriculum Enrolled</span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Cohort Performance Summary Table */}
      <Card>
        <CardHeader className="pb-3">
          <div>
            <CardTitle>Cohort Enrollment & Performance Summary</CardTitle>
            <CardDescription>Verified academic statistics for enrolled students</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e1ede7] bg-[#F7F9F8] text-[11px] font-bold text-[#557067] uppercase">
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Class & Board</th>
                <th className="py-2.5 px-4">Performance</th>
                <th className="py-2.5 px-4">Attendance</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e1ede7]">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-[#F7F9F8]">
                  <td className="py-3 px-4 flex items-center gap-2">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div>
                      <span className="font-bold text-[#142D27]">{student.name}</span>
                      <span className="block text-[10px] text-[#7d9990]">{student.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#557067]">
                    {student.academicClass || 'Grade 11'} ({student.board || 'CIE'})
                  </td>
                  <td className="py-3 px-4 font-bold text-[#14B866]">
                    {student.overallPerformance}%
                  </td>
                  <td className="py-3 px-4 text-[#142D27] font-semibold">
                    {student.attendanceRate}%
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="primary" size="sm" dot>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-3.5 h-3.5 text-[#14B866]" />}
                      onClick={() => setStudentReportModal(student)}
                    >
                      Dossier
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INDIVIDUAL STUDENT REPORT CARD MODAL */}
      <Modal
        isOpen={!!studentReportModal}
        onClose={() => setStudentReportModal(null)}
        title={studentReportModal ? `Student Dossier: ${studentReportModal.name}` : 'Student Dossier'}
        description={`Roll Number: ${studentReportModal?.rollNumber || 'SH-1001'} &bull; ${studentReportModal?.course || 'Advanced STEM'}`}
      >
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e1ede7]">
              <img
                src={studentReportModal?.avatar}
                alt={studentReportModal?.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-xs"
              />
              <div>
                <h4 className="text-sm font-bold text-[#142D27]">{studentReportModal?.name}</h4>
                <p className="text-xs text-[#557067]">{studentReportModal?.email}</p>
                <p className="text-[11px] text-[#7d9990]">
                  Academic Session: {studentReportModal?.academicSession || '2026-2027'} &bull; Board:{' '}
                  {studentReportModal?.board || 'Cambridge International'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Grade Score
                </span>
                <span className="text-lg font-black text-[#14B866]">
                  {studentReportModal?.overallPerformance}%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Class Standing
                </span>
                <span className="text-lg font-black text-[#142D27]">
                  {studentReportModal?.grade || 'A*'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Attendance
                </span>
                <span className="text-lg font-black text-sky-600">
                  {studentReportModal?.attendanceRate}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#142D27] block mb-1">
                Enrolled Curriculum Modules:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(studentReportModal?.enrolledSubjects || ['MATH-301', 'PHYS-202', 'CHEM-205', 'CS-401']).map(
                  (subj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#e1ede7] text-xs font-semibold text-[#142D27]"
                    >
                      {subj}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadSummary}
            >
              Print Official Report
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setStudentReportModal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
