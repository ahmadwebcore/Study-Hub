import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Award,
  Eye,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SAMPLE_RESULTS } from '../../data/sampleData';
import { ResultRecord } from '../../types';
import { testService, extractDayAndCleanTitle } from '../../services/testService';
import { useRole } from '../../hooks/useRole';

export const ResultsPage: React.FC = () => {
  const { role } = useRole();
  const [results, setResults] = useState<ResultRecord[]>(SAMPLE_RESULTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [selectedResultDetail, setSelectedResultDetail] = useState<ResultRecord | null>(null);

  useEffect(() => {
    let mounted = true;
    testService.fetchResults().then((data) => {
      if (mounted && data && data.length > 0) {
        setResults(data);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filteredResults = results.filter((r) => {
    const matchesSubject = subjectFilter === 'all' || r.subjectCode === subjectFilter;
    const matchesSearch =
      r.testTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const avgPercentage = results.length
    ? Math.round(
        results.reduce(
          (acc, curr) =>
            acc + (curr.percentage || Math.round((curr.score / curr.maxScore) * 100)),
          0
        ) / results.length
      )
    : 0;

  const passedCount = results.filter(
    (r) => (r.passed !== undefined ? r.passed : r.score >= (r.passingMarks || 40))
  ).length;

  const handleExportTranscript = () => {
    window.print();
  };

  const subjectCodes = Array.from(new Set(results.map((r) => r.subjectCode)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-[#142D27]">Official Results & Gradebook</h1>
            <Badge variant="primary" size="sm" dot>
              {role === 'teacher' ? 'Faculty Certified' : 'Student Grade Record'}
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Certified examination mark sheets, pass/fail status, grade distributions, and instructor evaluations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4 text-[#14B866]" />}
          onClick={handleExportTranscript}
        >
          Export Official Transcript
        </Button>
      </div>

      {/* Grade Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-white">
          <p className="text-xs font-semibold text-[#557067] uppercase tracking-wider">
            Overall Grade Average
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#14B866]">{avgPercentage}%</span>
            <Badge variant="primary" size="sm">
              Honors Standing
            </Badge>
          </div>
          <p className="text-xs text-[#7d9990] mt-2">Across certified examinations</p>
        </Card>

        <Card className="p-5 bg-white">
          <p className="text-xs font-semibold text-[#557067] uppercase tracking-wider">
            Clearance & Pass Rate
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#142D27]">
              {passedCount} / {results.length}
            </span>
            <Badge variant="primary" size="sm">
              {results.length ? Math.round((passedCount / results.length) * 100) : 100}% Passed
            </Badge>
          </div>
          <p className="text-xs text-[#7d9990] mt-2">All passing thresholds satisfied</p>
        </Card>

        <Card className="p-5 bg-white">
          <p className="text-xs font-semibold text-[#557067] uppercase tracking-wider">
            Cohort Rank
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#142D27]">1st</span>
            <Badge variant="neutral" size="sm">
              Top Percentile
            </Badge>
          </div>
          <p className="text-xs text-[#7d9990] mt-2">Leading STEM scholar cohort</p>
        </Card>
      </div>

      {/* Filter & Search Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              subjectFilter === 'all'
                ? 'bg-[#142D27] text-white shadow-sm'
                : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
            }`}
          >
            All Subjects
          </button>
          {subjectCodes.map((code) => (
            <button
              key={code}
              onClick={() => setSubjectFilter(code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subjectFilter === code
                  ? 'bg-[#142D27] text-white shadow-sm'
                  : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test or student..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#263B35] focus:outline-none focus:border-[#14B866]"
          />
        </div>
      </div>

      {/* Results Display: Mobile Series Cards (1-col) + Desktop Table */}
      {filteredResults.length > 0 ? (
        <div className="space-y-4">
          {/* Mobile Series Cards (1-col on mobile, 2-col on sm) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
            {filteredResults
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item) => {
                const { day, cleanTitle, isUrdu } = extractDayAndCleanTitle(item.testTitle, item.date);
                const percentage =
                  item.percentage !== undefined
                    ? item.percentage
                    : Math.round((item.score / item.maxScore) * 100);
                const isPassed =
                  item.passed !== undefined
                    ? item.passed
                    : item.score >= (item.passingMarks || 15);

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white border border-[#e1ede7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-center justify-between gap-1 pb-2 border-b border-[#e1ede7]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-urdu-compact">
                            {day}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
                            {item.subjectCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7d9990] font-medium">{item.date}</span>
                      </div>

                      {/* Subject Name & Title in Clean Urdu */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-bold text-[#557067] uppercase tracking-wider block">
                          {item.subjectName}
                        </span>
                        <h4
                          className={`mt-1 ${
                            isUrdu
                              ? 'font-urdu text-[15px] font-bold text-[#142D27] text-right dir-rtl leading-loose'
                              : 'text-sm font-bold text-[#142D27]'
                          }`}
                        >
                          <bdi>{cleanTitle}</bdi>
                        </h4>
                      </div>

                      {/* Score Box */}
                      <div className="mt-3 p-2.5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#7d9990] block">Score Awarded:</span>
                          <span className="text-base font-extrabold text-[#142D27]">
                            {item.score} / {item.maxScore} Marks
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 block">
                            {percentage}% &bull; Grade {item.grade}
                          </span>
                          <span className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isPassed
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {isPassed ? 'PASSED ✅' : 'RETEST ⚠️'}
                          </span>
                        </div>
                      </div>

                      {/* Feedback Snippet */}
                      {item.feedback && (
                        <p className="mt-2.5 text-[11px] text-[#557067] italic bg-emerald-50/40 p-2 rounded-xl border border-emerald-100">
                          &quot;{item.feedback}&quot;
                        </p>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-[#e1ede7]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-xs font-bold"
                        icon={<Eye className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => setSelectedResultDetail(item)}
                      >
                        View Official Certificate
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Desktop Table View */}
          <Card padding="none" className="hidden md:block overflow-hidden rounded-3xl border border-[#e1ede7]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e1ede7] bg-[#F7F9F8]/80 text-[11px] font-bold text-[#557067] uppercase tracking-wider">
                    <th className="py-3 px-4 sm:px-6">Test &amp; Discipline</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 sm:px-6">Evaluation Remarks</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e1ede7]/80 text-xs text-[#263B35]">
                  {filteredResults.map((item) => {
                    const percentage =
                      item.percentage !== undefined
                        ? item.percentage
                        : Math.round((item.score / item.maxScore) * 100);
                    const isPassed =
                      item.passed !== undefined
                        ? item.passed
                        : item.score >= (item.passingMarks || 40);

                    return (
                      <tr key={item.id} className="hover:bg-[#F7F9F8]/60 transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-[#142D27]">{item.testTitle}</div>
                          <div className="text-[11px] text-[#557067] mt-0.5">
                            {item.subjectName} ({item.subjectCode}) &bull; {item.date}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.studentAvatar}
                              alt={item.studentName}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#e1ede7]"
                            />
                            <span className="font-semibold text-[#142D27]">{item.studentName}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-extrabold text-[#14B866] text-sm">
                            {item.score} / {item.maxScore}
                          </div>
                          <span className="text-[10px] text-[#7d9990]">{percentage}%</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {item.grade}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <Badge variant={isPassed ? 'primary' : 'danger'} size="sm">
                            {isPassed ? 'Passed' : 'Needs Retest'}
                          </Badge>
                        </td>

                        <td className="py-4 px-4 sm:px-6 max-w-xs">
                          <p className="text-xs text-[#557067] line-clamp-2 leading-relaxed">
                            {item.feedback}
                          </p>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5 text-[#14B866]" />}
                            onClick={() => setSelectedResultDetail(item)}
                          >
                            Certificate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <EmptyState
          icon={<Award className="w-8 h-8 text-[#14B866]" />}
          title="No Results Matching Criteria"
          description="Try selecting another academic subject or clearing your search query."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearchTerm('');
            setSubjectFilter('all');
          }}
        />
      )}

      {/* OFFICIAL MARK SHEET / CERTIFICATE MODAL */}
      <Modal
        isOpen={!!selectedResultDetail}
        onClose={() => setSelectedResultDetail(null)}
        title="Official Examination Transcript"
        description={`${selectedResultDetail?.testTitle} &bull; ${selectedResultDetail?.subjectName}`}
      >
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1ede7]">
              <div>
                <span className="text-xs font-bold text-[#142D27] block">
                  {selectedResultDetail?.studentName}
                </span>
                <span className="text-[11px] text-[#7d9990]">Candidate ID: SH-2026-881</span>
              </div>
              <Badge variant="primary" size="md">
                Certified Grade: {selectedResultDetail?.grade}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Score Awarded
                </span>
                <span className="text-lg font-black text-[#14B866]">
                  {selectedResultDetail?.score} / {selectedResultDetail?.maxScore}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">
                  Percentage
                </span>
                <span className="text-lg font-black text-[#142D27]">
                  {selectedResultDetail?.percentage ||
                    (selectedResultDetail
                      ? Math.round((selectedResultDetail.score / selectedResultDetail.maxScore) * 100)
                      : 0)}
                  %
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                <span className="text-[10px] text-[#7d9990] uppercase font-bold block">Status</span>
                <span className="text-lg font-black text-emerald-600">Passed</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#142D27] block mb-1">
                Faculty Instructor Evaluation:
              </span>
              <p className="text-xs text-[#557067] leading-relaxed italic bg-white p-3 rounded-xl border border-[#e1ede7]">
                "{selectedResultDetail?.feedback}"
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportTranscript}
            >
              Print Transcript
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setSelectedResultDetail(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
