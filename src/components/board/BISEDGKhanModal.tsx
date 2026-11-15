import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  MapPin,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import {
  biseDGKhanService,
  BISE_DG_KHAN_INFO,
} from '../../services/biseDGKhanService';
import { BISEDGKhanUpdate, PairingSchemeItem } from '../../types';

interface BISEDGKhanModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'updates' | 'pairing';
  selectedSubjectId?: string;
}

export const BISEDGKhanModal: React.FC<BISEDGKhanModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'updates',
  selectedSubjectId,
}) => {
  const [activeTab, setActiveTab] = useState<'updates' | 'pairing'>(initialTab);
  const updates = biseDGKhanService.getUpdates();
  const pairingSchemes = biseDGKhanService.getPairingSchemes();
  const [selectedSubject, setSelectedSubject] = useState<PairingSchemeItem>(() => {
    if (selectedSubjectId) {
      const match = pairingSchemes.find((p) => p.subjectId === selectedSubjectId);
      if (match) return match;
    }
    return pairingSchemes[0];
  });

  const daysToFeb = biseDGKhanService.getDaysUntilFebruaryTarget();
  const daysToExams = biseDGKhanService.getDaysUntilAnnualExams();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/80 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Official Board Desk
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 text-zinc-700 text-[10px] font-semibold">
                Class: 1st Year FA-IT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-200/70 text-zinc-700 text-[10px] font-semibold">
                Session: 2026–2027
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <span>{BISE_DG_KHAN_INFO.shortName}</span>
              <span className="text-xs font-normal text-zinc-500 hidden sm:inline">
                ({BISE_DG_KHAN_INFO.boardName})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                DG Khan, Muzaffargarh, Layyah, Rajanpur, Kot Addu, Taunsa
              </span>
              <a
                href={BISE_DG_KHAN_INFO.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2"
              >
                <span>bisedgkhan.edu.pk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdowns Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-zinc-100/70 border-b border-zinc-200 text-xs">
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Target Deadline</span>
            <span className="font-bold text-zinc-900 mt-0.5">Feb 28, 2027</span>
            <span className="text-[10px] text-emerald-600 font-medium">{daysToFeb} days left</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Annual Examination</span>
            <span className="font-bold text-zinc-900 mt-0.5">May 2027</span>
            <span className="text-[10px] text-zinc-500 font-medium">{daysToExams} days countdown</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Registered Group</span>
            <span className="font-bold text-zinc-900 mt-0.5">FA-IT (6 Subjects)</span>
            <span className="text-[10px] text-zinc-500 font-medium">Daily 30-Mark Tests</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-zinc-200 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Board Helpdesk</span>
            <span className="font-bold text-zinc-900 mt-0.5">{BISE_DG_KHAN_INFO.helplinePhone}</span>
            <span className="text-[10px] text-zinc-500 font-medium">Exams Inquiry Cell</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 bg-white px-4 pt-2">
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'updates'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Latest Circulars & Notifications ({updates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pairing')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pairing'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>FA-IT Official Pairing Scheme (All 6 Subjects)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'updates' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-500">
                Official notifications directly synchronized for 1st Year FA-IT candidates under BISE Dera Ghazi Khan.
              </div>

              <div className="space-y-2.5">
                {updates.map((item: BISEDGKhanUpdate) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.urgent
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.urgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                            Urgent Alert
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-semibold border border-zinc-200">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {item.targetClass}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900 mt-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-100">
                      <span className="text-[11px] text-zinc-400">
                        BISE Dera Ghazi Khan &bull; Examination Branch
                      </span>
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Official PDF Circular
                        </a>
                      ) : (
                        <button
                          onClick={() => setActiveTab('pairing')}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
                        >
                          Check Pairing Scheme
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pairing' && (
            <div className="space-y-4">
              {/* Subject Selection Tabs */}
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-100">
                {pairingSchemes.map((scheme) => (
                  <button
                    key={scheme.subjectId}
                    onClick={() => setSelectedSubject(scheme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedSubject.subjectId === scheme.subjectId
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                    }`}
                  >
                    {scheme.subjectName.split('(')[0].trim()}
                    <span className="ml-1 opacity-70 text-[10px]">({scheme.totalMarks}M)</span>
                  </button>
                ))}
              </div>

              {/* Selected Subject Pairing Details */}
              <div className="bg-zinc-50/70 p-4 rounded-xl border border-zinc-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-200">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900">
                      {selectedSubject.subjectName}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      BISE DG Khan Official Pattern &bull; Total Paper Marks: {selectedSubject.totalMarks} Marks
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-zinc-200 text-xs font-semibold text-zinc-800">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Target Pass: 33% | Excellence: 85%+
                  </div>
                </div>

                {/* Section A: MCQs Breakdown */}
                <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Q.1: Objective Type (MCQs Distribution)
                    </h4>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      Total: {selectedSubject.mcqsBreakdown.reduce((acc, curr) => acc + curr.mcqsCount, 0)} MCQs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedSubject.mcqsBreakdown.map((mcq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs"
                      >
                        <span className="text-zinc-700 truncate pr-2">{mcq.chapter}</span>
                        <span className="font-bold text-emerald-700 shrink-0 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {mcq.mcqsCount} MCQ{mcq.mcqsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Short Questions */}
                <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Section B: Short Questions (Conceptual & Book Exercises)
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.shortQuestions.map((sq, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900">{sq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                            Attempt {sq.attempt} out of {sq.total}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed">
                          <strong className="text-zinc-700">Chapters Included:</strong> {sq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Long Questions */}
                <div className="bg-white p-3.5 rounded-xl border border-zinc-200 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Section C: Subjective Long Questions & Descriptive Theory
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.longQuestions.map((lq, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-900">{lq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold">
                            Attempt {lq.attempt} out of {lq.total}
                          </span>
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed">
                          <strong className="text-zinc-700">Detailed Topics:</strong> {lq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Board Notes Callout */}
                <div className="p-3 rounded-lg bg-zinc-100 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>BISE DG Khan Directive:</strong> {selectedSubject.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>Target completion: Feb 28, 2027 &bull; Exams: May 2027</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors shadow-xs"
          >
            Close Board Desk
          </button>
        </div>
      </div>
    </div>
  );
};
