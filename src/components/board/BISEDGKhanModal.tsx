import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  MapPin,
  Layers,
  Award,
  Clock,
  Printer,
  ChevronLeft,
} from 'lucide-react';
import {
  BISE_DG_KHAN_INFO,
  biseDGKhanService,
} from '../../services/biseDGKhanService';
import { BISEDGKhanUpdate, PairingSchemeItem } from '../../types';

interface BISEDGKhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'updates' | 'pairing';
  defaultTab?: 'updates' | 'pairing';
}

export const BISEDGKhanModal: React.FC<BISEDGKhanModalProps> = ({
  isOpen,
  onClose,
  initialTab,
  defaultTab = 'updates',
}) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'pairing'>(initialTab || defaultTab);
  const [viewingCircular, setViewingCircular] = useState<BISEDGKhanUpdate | null>(null);
  const updates = biseDGKhanService.getUpdates();
  const pairingSchemes = biseDGKhanService.getPairingSchemes();
  const [selectedSubject, setSelectedSubject] = useState<PairingSchemeItem>(
    pairingSchemes[0]
  );

  const daysToFeb = biseDGKhanService.getDaysUntilFebruaryTarget();
  const daysToExams = biseDGKhanService.getDaysUntilAnnualExams();

  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = original || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[88vh] bg-white text-zinc-900 rounded-3xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-white flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Official Board Desk
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold border border-zinc-200">
                Class: 1st Year FA-IT
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold border border-zinc-200">
                Session: 2026–2027
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 font-serif tracking-tight flex items-center gap-2">
              <span>{BISE_DG_KHAN_INFO.shortName}</span>
              <span className="text-xs font-normal text-zinc-500 font-sans hidden sm:inline">
                ({BISE_DG_KHAN_INFO.boardName})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                DG Khan, Muzaffargarh, Layyah, Rajanpur
              </span>
              <a
                href={BISE_DG_KHAN_INFO.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold underline"
              >
                <span>bisedgkhan.edu.pk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors flex items-center gap-1.5 border border-zinc-200"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Countdowns Bar - Test Series Mini-Cards Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-4 bg-zinc-50 border-b border-zinc-200 text-xs shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Deadline</span>
            <span className="font-bold text-zinc-900 font-serif text-sm mt-0.5">Feb 28, 2027</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">{daysToFeb} days left</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Annual Exam</span>
            <span className="font-bold text-zinc-900 font-serif text-sm mt-0.5">May 2027</span>
            <span className="text-[11px] text-zinc-600 font-medium mt-0.5">{daysToExams} days countdown</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Registered Group</span>
            <span className="font-bold text-zinc-900 font-serif text-sm mt-0.5">FA-IT (6 Subjects)</span>
            <span className="text-[11px] text-zinc-600 font-medium mt-0.5">Daily 30-Mark Tests</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Evaluator</span>
            <span className="font-bold text-zinc-900 font-serif text-sm mt-0.5">Ahmad</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-0.5">Faculty Lead</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'updates'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Latest Circulars &amp; Notifications ({updates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pairing')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pairing'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>FA-IT Official Pairing Scheme (All 6 Subjects)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-zinc-50/50">
          {activeTab === 'updates' && (
            viewingCircular ? (
              /* High-Fidelity Official BISE DG Khan Circular Viewer (Zero 404s) */
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setViewingCircular(null)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-zinc-600" />
                    <span>Back to Circulars Feed</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Print Circular</span>
                    </button>
                    <a
                      href={BISE_DG_KHAN_INFO.officialWebsite}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>BISE Portal</span>
                    </a>
                  </div>
                </div>

                {/* Official Board Circular Letterhead */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-md space-y-6 text-zinc-900 font-sans">
                  {/* Official Header */}
                  <div className="border-b-2 border-emerald-800/80 pb-4 text-center space-y-1 relative">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-9 h-9 rounded-full bg-emerald-900 text-white flex items-center justify-center font-serif font-black text-sm shadow-xs border-2 border-emerald-600">
                        DG
                      </span>
                      <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 font-serif uppercase">
                        Board of Intermediate &amp; Secondary Education, Dera Ghazi Khan
                      </h2>
                    </div>
                    <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
                      Examination &amp; Academic Branch &bull; Government of the Punjab
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-600 pt-2 font-mono border-t border-zinc-100 mt-2">
                      <span>Notification Ref: BISE-DGK/CE/2026/894-A</span>
                      <span>Dated: {viewingCircular.date}</span>
                    </div>
                  </div>

                  {/* Notification Category & Title */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold uppercase tracking-wider border border-emerald-300">
                        Official Directive &bull; {viewingCircular.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold border border-zinc-200">
                        Target Class: {viewingCircular.targetClass}
                      </span>
                      {viewingCircular.urgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Urgent Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-zinc-950 font-serif leading-snug">
                      {viewingCircular.title}
                    </h3>
                  </div>

                  {/* Directives Body */}
                  <div className="bg-zinc-50/80 p-4 sm:p-5 rounded-2xl border border-zinc-200 text-xs sm:text-sm text-zinc-800 leading-relaxed space-y-3">
                    <p className="font-semibold text-zinc-900">
                      It is hereby notified for information of all Heads of Affiliated Institutions (Colleges &amp; Higher Secondary Schools) and candidates of Intermediate Part-I (11th Class FA-IT) within the territorial jurisdiction of BISE Dera Ghazi Khan (Districts: D.G. Khan, Muzaffargarh, Layyah, Rajanpur, Kot Addu, and Taunsa):
                    </p>

                    <div className="space-y-2.5 pl-3 border-l-2 border-emerald-600 text-xs text-zinc-700">
                      <p>
                        <strong className="text-zinc-950">1. Executive Directive:</strong> {viewingCircular.summary}
                      </p>
                      <p>
                        <strong className="text-zinc-950">2. Academic Completion Target:</strong> All educational institutions must strictly complete 100% curriculum coverage by <strong>February 28, 2027</strong>. Revision and mock testing commence immediately thereafter.
                      </p>
                      <p>
                        <strong className="text-zinc-950">3. Examination Commencement:</strong> Annual Examination 2027 for Intermediate Part-I (11th Class) shall commence in <strong>May 2027</strong> as per the consolidated Punjab Boards schedule.
                      </p>
                      <p>
                        <strong className="text-zinc-950">4. Approved Syllabi &amp; Book Standard:</strong> Examination assessments will strictly follow the Punjab Curriculum &amp; Textbook Authority (PECTAA) revised edition textbooks and official chapter-wise pairing schemes.
                      </p>
                      <p>
                        <strong className="text-zinc-950">5. Continuous Diagnostic Testing:</strong> Students are directed to participate in weekly 30-mark diagnostic tests to ensure required board preparation benchmarks.
                      </p>
                    </div>
                  </div>

                  {/* Controller Seal & Verification */}
                  <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-full border-2 border-emerald-800/40 border-dashed flex flex-col items-center justify-center text-[9px] text-emerald-800 font-bold text-center leading-tight p-1 rotate-[-6deg]">
                        <span>★ BISE DGK ★</span>
                        <span className="text-[8px] font-mono">SEAL &bull; 2026</span>
                        <span className="text-[7px]">VERIFIED</span>
                      </div>
                      <div className="text-left text-xs">
                        <p className="font-bold text-zinc-900">Controller of Examinations</p>
                        <p className="text-[11px] text-zinc-500">Board of Intermediate &amp; Secondary Education, D.G. Khan</p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-zinc-400">
                      <span>Official Reference ID: 2026-FAIT-DGK-089</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-zinc-500 font-medium">
                  Official notifications directly synchronized for 1st Year FA-IT candidates under BISE Dera Ghazi Khan. Click any notice to view full circular.
                </div>

                <div className="space-y-3">
                  {updates.map((item: BISEDGKhanUpdate) => (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        item.urgent
                          ? 'border-amber-300 bg-amber-50/70 shadow-2xs'
                          : 'border-zinc-200 bg-white hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.urgent && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                              Urgent Alert
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-[10px] font-semibold border border-zinc-200">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {item.targetClass}
                          </span>
                        </div>
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          {item.date}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-zinc-900 font-serif mt-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-zinc-100">
                        <span className="text-[11px] text-zinc-500">
                          BISE Dera Ghazi Khan &bull; Examination Branch
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingCircular(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Official PDF Circular</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {activeTab === 'pairing' && (
            <div className="space-y-4">
              {/* Subject Selection Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-200">
                {pairingSchemes.map((scheme: PairingSchemeItem) => (
                  <button
                    key={scheme.subjectId}
                    onClick={() => setSelectedSubject(scheme)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedSubject.subjectId === scheme.subjectId
                        ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                        : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    {scheme.subjectName.split('(')[0].trim()}
                    <span className="ml-1 opacity-80 text-[10px]">({scheme.totalMarks}M)</span>
                  </button>
                ))}
              </div>

              {/* Selected Subject Pairing Details */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-sm sm:base font-bold text-zinc-900 font-serif">
                      {selectedSubject.subjectName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      BISE DG Khan Official Pattern &bull; Total Paper Marks: {selectedSubject.totalMarks} Marks
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    Target Pass: 33% | Excellence: 85%+
                  </div>
                </div>

                {/* Section A: MCQs Breakdown */}
                <div className="bg-zinc-50 p-3.5 sm:p-4 rounded-2xl border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 font-serif flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Q.1: Objective Type (MCQs Distribution)
                    </h4>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      Total: {selectedSubject.mcqsBreakdown.reduce((acc: number, curr: { mcqsCount: number }) => acc + curr.mcqsCount, 0)} MCQs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedSubject.mcqsBreakdown.map((mcq: { chapter: string; mcqsCount: number }, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200 text-xs shadow-2xs"
                      >
                        <span className="text-zinc-800 font-medium truncate pr-2">{mcq.chapter}</span>
                        <span className="font-bold text-emerald-800 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                          {mcq.mcqsCount} MCQ{mcq.mcqsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Short Questions */}
                <div className="bg-zinc-50 p-3.5 sm:p-4 rounded-2xl border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 font-serif flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    Section B: Short Questions (Conceptual &amp; Book Exercises)
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.shortQuestions.map((sq: { questionNum: string; attempt: number; total: number; chapters: string }, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-zinc-200 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900">{sq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold">
                            Attempt {sq.attempt} out of {sq.total}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed">
                          <strong className="text-zinc-800">Chapters Included:</strong> {sq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Long Questions */}
                <div className="bg-zinc-50 p-3.5 sm:p-4 rounded-2xl border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 font-serif flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Section C: Subjective Long Questions &amp; Descriptive Theory
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.longQuestions.map((lq: { questionNum: string; attempt: number; total: number; chapters: string }, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-zinc-200 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900">{lq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                            Attempt {lq.attempt} out of {lq.total}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed">
                          <strong className="text-zinc-800">Detailed Topics:</strong> {lq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Board Notes Callout */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-emerald-900">BISE DG Khan Directive:</strong> {selectedSubject.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Target completion: Feb 28, 2027 &bull; Annual Exams: May 2027</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
          >
            Close Board Desk
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
