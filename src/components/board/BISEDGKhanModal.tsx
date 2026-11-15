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

  // ESC key listener to reliably close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const daysToFeb = biseDGKhanService.getDaysUntilFebruaryTarget();
  const daysToExams = biseDGKhanService.getDaysUntilAnnualExams();

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c0d10] text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-[#090a0c] flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Official Board Desk
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                Class: 1st Year FA-IT
              </span>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                Session: 2026–2027
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>{BISE_DG_KHAN_INFO.shortName}</span>
              <span className="text-xs font-normal text-zinc-400 hidden sm:inline">
                ({BISE_DG_KHAN_INFO.boardName})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                DG Khan, Muzaffargarh, Layyah, Rajanpur
              </span>
              <a
                href={BISE_DG_KHAN_INFO.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium underline"
              >
                <span>bisedgkhan.edu.pk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 border border-zinc-700"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Countdowns Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#090a0c] border-b border-zinc-800 text-xs shrink-0">
          <div className="bg-[#121316] p-2.5 rounded-xl border border-zinc-800 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Target Deadline</span>
            <span className="font-bold text-white mt-0.5">Feb 28, 2027</span>
            <span className="text-[10px] text-emerald-400 font-medium">{daysToFeb} days left</span>
          </div>
          <div className="bg-[#121316] p-2.5 rounded-xl border border-zinc-800 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Annual Exam</span>
            <span className="font-bold text-white mt-0.5">May 2027</span>
            <span className="text-[10px] text-zinc-400 font-medium">{daysToExams} days countdown</span>
          </div>
          <div className="bg-[#121316] p-2.5 rounded-xl border border-zinc-800 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Registered Group</span>
            <span className="font-bold text-white mt-0.5">FA-IT (6 Subjects)</span>
            <span className="text-[10px] text-zinc-400 font-medium">Daily 30-Mark Tests</span>
          </div>
          <div className="bg-[#121316] p-2.5 rounded-xl border border-zinc-800 flex flex-col">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase">Evaluator</span>
            <span className="font-bold text-white mt-0.5">Ahmad</span>
            <span className="text-[10px] text-emerald-400 font-medium">Faculty Lead</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#090a0c] px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'updates'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Latest Circulars &amp; Notifications ({updates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pairing')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pairing'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>FA-IT Official Pairing Scheme (All 6 Subjects)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0c0d10]">
          {activeTab === 'updates' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">
                Official notifications directly synchronized for 1st Year FA-IT candidates under BISE Dera Ghazi Khan.
              </div>

              <div className="space-y-2.5">
                {updates.map((item: BISEDGKhanUpdate) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      item.urgent
                        ? 'border-amber-700/50 bg-amber-950/20'
                        : 'border-zinc-800 bg-[#121316] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.urgent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-zinc-950">
                            Urgent Alert
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-semibold border border-zinc-700">
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

                    <h3 className="text-sm font-bold text-white mt-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {item.summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-zinc-800">
                      <span className="text-[11px] text-zinc-500">
                        BISE Dera Ghazi Khan &bull; Examination Branch
                      </span>
                      {item.pdfUrl ? (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          View Official PDF Circular
                        </a>
                      ) : (
                        <button
                          onClick={() => setActiveTab('pairing')}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
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
              <div className="flex flex-wrap gap-1.5 pb-2 border-b border-zinc-800">
                {pairingSchemes.map((scheme) => (
                  <button
                    key={scheme.subjectId}
                    onClick={() => setSelectedSubject(scheme)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedSubject.subjectId === scheme.subjectId
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {scheme.subjectName.split('(')[0].trim()}
                    <span className="ml-1 opacity-70 text-[10px]">({scheme.totalMarks}M)</span>
                  </button>
                ))}
              </div>

              {/* Selected Subject Pairing Details */}
              <div className="bg-[#121316] p-4 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {selectedSubject.subjectName}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      BISE DG Khan Official Pattern &bull; Total Paper Marks: {selectedSubject.totalMarks} Marks
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Target Pass: 33% | Excellence: 85%+
                  </div>
                </div>

                {/* Section A: MCQs Breakdown */}
                <div className="bg-[#0c0d10] p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Q.1: Objective Type (MCQs Distribution)
                    </h4>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      Total: {selectedSubject.mcqsBreakdown.reduce((acc, curr) => acc + curr.mcqsCount, 0)} MCQs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {selectedSubject.mcqsBreakdown.map((mcq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs"
                      >
                        <span className="text-zinc-300 truncate pr-2">{mcq.chapter}</span>
                        <span className="font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30 text-[10px]">
                          {mcq.mcqsCount} MCQ{mcq.mcqsCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Short Questions */}
                <div className="bg-[#0c0d10] p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Section B: Short Questions (Conceptual &amp; Book Exercises)
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.shortQuestions.map((sq, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{sq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                            Attempt {sq.attempt} out of {sq.total}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong className="text-zinc-300">Chapters Included:</strong> {sq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Long Questions */}
                <div className="bg-[#0c0d10] p-3.5 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Section C: Subjective Long Questions &amp; Descriptive Theory
                  </h4>

                  <div className="space-y-2 pt-1">
                    {selectedSubject.longQuestions.map((lq, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{lq.questionNum}</span>
                          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[10px] font-semibold">
                            Attempt {lq.attempt} out of {lq.total}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">
                          <strong className="text-zinc-300">Detailed Topics:</strong> {lq.chapters}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Board Notes Callout */}
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-white">BISE DG Khan Directive:</strong> {selectedSubject.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-zinc-800 bg-[#090a0c] flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            <span>Target completion: Feb 28, 2027 &bull; Annual Exams: May 2027</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 shadow-xs"
          >
            Close Board Desk
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
