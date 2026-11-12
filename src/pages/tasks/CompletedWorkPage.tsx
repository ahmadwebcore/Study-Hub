import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Calendar,
  Search,
  Download,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { taskService, DailyTask } from '../../services/taskService';
import { subjectService } from '../../services/subjectService';
import { Subject } from '../../types';

export const CompletedWorkPage: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<DailyTask[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const list = taskService.getApprovedCompletedTasks();
    setCompletedTasks(list);
    subjectService.fetchSubjects().then((data) => {
      if (data) setSubjects(data);
    });
  }, []);

  const filtered = completedTasks.filter((t) => {
    const matchSubject = selectedSubject === 'all' || t.subjectId === selectedSubject;
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.approval?.feedback || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchSearch;
  });

  const totalMinutes = completedTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 60), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Completed Work & Verified Progress</h1>
            <Badge variant="primary" size="sm" dot>
              {completedTasks.length} Verified Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#557067] mt-1">
            Official ledger of coursework, daily reading targets, and tasks that have satisfied the <strong>Teacher Approval Gate</strong>.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => alert('Exporting official verified coursework transcript as CSV/PDF...')}
        >
          Export Verified Ledger
        </Button>
      </div>

      {/* Summary KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7d9990] uppercase tracking-wider">
              Approved Work Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">{completedTasks.length}</p>
          <p className="text-[11px] text-[#557067] mt-0.5">100% verified by faculty assessment</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7d9990] uppercase tracking-wider">
              Verified Study Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#142D27] mt-2">{totalHours} Hours</p>
          <p className="text-[11px] text-[#557067] mt-0.5">Dedicated to textbook & syllabus goals</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e1ede7]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#7d9990] uppercase tracking-wider">
              Approval Authority
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-extrabold text-[#142D27] mt-2 truncate">Prof. Clara Evans</p>
          <p className="text-[11px] text-[#557067] mt-0.5">Faculty Lead Evaluator</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search verified completed coursework or teacher notes..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter completed tasks by subject"
          className="h-10 px-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Academic Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Verified Completed Work Ledger */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#e1ede7] p-8">
            <Award className="w-10 h-10 text-[#7d9990] mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[#142D27]">No Verified Records</h3>
            <p className="text-xs text-[#557067] mt-1">
              Work submitted by students will appear here once explicitly reviewed and approved by the teacher.
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <div
              key={task.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-[#e1ede7] hover:border-emerald-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E7EFEA] text-[#142D27]">
                      {task.subjectCode}
                    </span>
                    <span className="text-xs font-bold text-[#142D27]">
                      {task.subjectName}
                    </span>
                    <span className="text-[11px] text-[#7d9990]">
                      &bull; {task.dayOfWeek}, {task.assignedDate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#142D27] mt-1">
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#557067] mt-0.5 leading-relaxed">
                    {task.description}
                  </p>

                  {/* Student note & Teacher remark */}
                  <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d9990] block">
                        Student Submission:
                      </span>
                      <p className="text-xs text-[#263B35] mt-0.5">
                        "{task.studentSubmission?.notes || 'Completed all daily exercises.'}"
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Teacher Verification & Signature:
                      </span>
                      <p className="text-xs text-emerald-950 mt-0.5">
                        "{task.approval?.feedback || 'Approved by Faculty.'}"
                      </p>
                      <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                        Signed: {task.approval?.approvedBy} • {task.approval?.approvedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-2 md:pt-0 border-[#e1ede7]">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Complete
                </span>
                <span className="text-[10px] text-[#7d9990] mt-1">
                  Target: {task.estimatedMinutes} mins logged
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
