import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { attendanceService, AttendanceRecord, MonthlyAttendanceStats } from '../../services/attendanceService';
import { integrationService } from '../../services/integrationService';

export const MonthlyAttendanceReport: React.FC = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<MonthlyAttendanceStats | null>(null);

  const loadData = () => {
    const list = attendanceService.getMonthRecords(currentYear, currentMonthIndex);
    const monthStats = attendanceService.getMonthlyStats(currentYear, currentMonthIndex);
    setRecords(list);
    setStats(monthStats);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('studyhub_attendance_updated', handleUpdate);
    return () => {
      window.removeEventListener('studyhub_attendance_updated', handleUpdate);
    };
  }, [currentYear, currentMonthIndex]);

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleExportMonthCSV = () => {
    integrationService.downloadCSV(`StudyHub_Attendance_${stats?.monthName}_${currentYear}.csv`);
  };

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-sm space-y-5 text-zinc-900 font-sans">
      {/* Header with Month Pagination Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
              Student Presence Ledger
            </span>
            <span className="text-xs font-semibold text-zinc-500">
              Henza Noor &bull; 1st Year FA-IT
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight font-serif mt-1">
            Monthly Attendance &amp; Submission Report
          </h3>
          <p className="text-xs text-zinc-500">
            Persistent archive: Historical months are preserved and never deleted.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 text-xs font-bold text-zinc-900 whitespace-nowrap">
              {stats?.monthName} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportMonthCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
            title="Download Google Sheet CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Bento Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Attendance Percentage */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Attendance Rate</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-700">
              {stats.attendancePercentage}%
            </div>
            <p className="text-[11px] text-zinc-600">
              {stats.presentDays} of {stats.workingDays} working days present
            </p>
          </div>

          {/* Card 2: Present Days */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Present &amp; Active</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-zinc-900">
              {stats.presentDays} Days
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">
              {stats.absentDays === 0 ? 'Zero unexcused absences' : `${stats.absentDays} missed day(s)`}
            </p>
          </div>

          {/* Card 3: Punctuality (Days On-Time vs After/Before) */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Schedule Precision</span>
              <Clock className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-sky-700">
              {stats.onTimeSubmissionPercentage}%
            </div>
            <p className="text-[11px] text-zinc-600">
              {stats.daysOnSchedule} on time &bull; {stats.daysLateOrAfter} after/before
            </p>
          </div>

          {/* Card 4: Sundays & Holidays OFF */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
              <span>Sundays (Rest)</span>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-bold font-serif text-zinc-800">
              {stats.sundaysOff} Days OFF
            </div>
            <p className="text-[11px] text-zinc-600">
              Zero tests or tasks on Sundays
            </p>
          </div>
        </div>
      )}

      {/* Daily Records Ledger Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-700 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="py-3 px-4">Date &amp; Day</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Daily Presentation</th>
              <th className="py-3 px-4">30-Mark Test Status</th>
              <th className="py-3 px-4">Score / Benchmark</th>
              <th className="py-3 px-4">Google Sheet</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {records.map((r) => {
              const isSunday = r.status === 'sunday_off';
              const isPresent = r.status === 'present';

              return (
                <tr
                  key={r.id}
                  className={`transition-colors ${
                    isSunday ? 'bg-zinc-50/50 text-zinc-400' : 'hover:bg-zinc-50/80 text-zinc-800'
                  }`}
                >
                  <td className="py-3 px-4 font-semibold whitespace-nowrap">
                    {r.formattedDate}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={isSunday ? 'text-zinc-400 italic' : 'text-zinc-800 font-medium'}>
                      {r.subjectOfDay}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isSunday ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                        🌿 Sunday Rest
                      </span>
                    ) : isPresent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Present {r.timeMarked ? `(${r.timeMarked})` : ''}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                        <XCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Absent</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {isSunday ? (
                      <span className="text-zinc-400 text-[11px]">—</span>
                    ) : r.testResult === 'passed' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Submitted &bull; Passed</span>
                      </span>
                    ) : r.testStatus === 'submitted' ? (
                      <span className="text-sky-700 text-[11px] font-semibold">Under Review</span>
                    ) : (
                      <span className="text-zinc-500 text-[11px]">Scheduled</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                    {isSunday ? (
                      <span className="text-zinc-400 text-[11px]">—</span>
                    ) : r.testScore !== undefined ? (
                      <span className="text-zinc-900">
                        {r.testScore}/{r.testMaxScore || 30}
                      </span>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{isSunday ? 'OFF' : 'Synced'}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
