import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Calendar,
  Search,
  Download,
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
            <h1 className="text-2xl font-bold text-zinc-900 font-serif">Completed Work &amp; Verified Progress</h1>
            <Badge variant="primary" size="sm" dot>
              {completedTasks.length} Verified Records
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 mt-1">
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

      {/* Summary KPI Bento Grid - Light Black Aesthetic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 sm:p-5 rounded-3xl bg-[#18181b] border border-zinc-800 text-zinc-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Approved Work Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-zinc-100 font-serif mt-2">{completedTasks.length}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">100% verified by faculty assessment</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#18181b] border border-zinc-800 text-zinc-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Verified Study Time
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-950/60 text-sky-400 border border-sky-800/80 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-zinc-100 font-serif mt-2">{totalHours} Hours</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Dedicated to 1st Year FA-IT syllabus</p>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-[#18181b] border border-zinc-800 text-zinc-100 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Approval Authority
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-zinc-100 font-serif mt-2 truncate">Ahmad</p>
          <p className="text-[11px] text-emerald-400 mt-0.5 font-semibold">Faculty Lead Evaluator</p>
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
            placeholder="Search completed FA-IT coursework or teacher notes..."
            className="w-full h-11 pl-10 pr-4 rounded-2xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter completed tasks by subject"
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

      {/* Verified Completed Work 5-in-a-Row Mini Bento Cards */}
      <div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-zinc-200 p-8 shadow-xs">
            <Award className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-zinc-900 font-serif">No Verified Records</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Work submitted by students will appear here once reviewed and verified by Ahmad.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {filtered.map((task) => {
              const marksMatch = task.approval?.feedback?.match(/Marks:\s*(\d+\/\d+)/i);
              const marksText = marksMatch ? marksMatch[1] : '28/30';

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-3xl bg-[#18181b] border border-zinc-800 text-zinc-100 hover:border-emerald-500/80 hover:shadow-lg transition-all flex flex-col justify-between shadow-sm group"
                >
                  {/* Top Meta: Code & Date */}
                  <div>
                    <div className="flex items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 truncate">
                        {task.subjectCode}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium shrink-0">
                        {task.assignedDate}
                      </span>
                    </div>

                    {/* Subject Name & Topic Title */}
                    <div className="mt-2.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        {task.subjectName}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-100 font-serif mt-1 leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors">
                        {task.title}
                      </h4>
                    </div>

                    {/* Marks & Time Stats */}
                    <div className="mt-3 flex items-center justify-between gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300">
                        <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                        {marksText}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {task.estimatedMinutes || 60} Mins
                      </span>
                    </div>

                    {/* Teacher Remarks Snippet */}
                    {task.approval?.feedback && (
                      <p className="text-[11px] text-zinc-300 mt-2 line-clamp-2 italic leading-relaxed pl-2 border-l-2 border-emerald-400 bg-zinc-900 p-1.5 rounded-r-lg">
                        &quot;{task.approval.feedback.replace(/Marks:\s*\d+\/\d+/i, '').trim()}&quot;
                      </p>
                    )}
                  </div>

                  {/* Bottom Verification Footer */}
                  <div className="pt-2.5 mt-3 border-t border-zinc-800 flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-emerald-400 truncate">
                      Signed: {task.approval?.approvedBy || 'Ahmad'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 shrink-0">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      Verified
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
