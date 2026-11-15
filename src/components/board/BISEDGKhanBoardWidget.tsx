import React, { useState } from 'react';
import {
  Calendar,
  AlertCircle,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  biseDGKhanService,
  BISE_DG_KHAN_INFO,
} from '../../services/biseDGKhanService';
import { BISEDGKhanModal } from './BISEDGKhanModal';

export const BISEDGKhanBoardWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'updates' | 'pairing'>('updates');
  const updates = biseDGKhanService.getUpdates();
  const latestUpdate = updates[0];
  const daysToFeb = biseDGKhanService.getDaysUntilFebruaryTarget();
  const daysToExams = biseDGKhanService.getDaysUntilAnnualExams();

  const handleOpenUpdates = () => {
    setModalTab('updates');
    setIsModalOpen(true);
  };

  const handleOpenPairing = () => {
    setModalTab('pairing');
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden transition-all">
        {/* Card Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Official Board Desk
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">
                1st Year FA-IT
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>{BISE_DG_KHAN_INFO.shortName}</span>
              <span className="text-xs font-normal text-zinc-500">
                (Dera Ghazi Khan Board)
              </span>
            </h2>
          </div>

          {/* Quick Countdowns */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-center shadow-2xs">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                Target Deadline
              </span>
              <span className="text-xs font-bold text-zinc-900">
                Feb 28 ({daysToFeb}d)
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-center shadow-2xs">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">
                Exams (May 2027)
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {daysToExams} Days
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Latest Circular Highlight */}
          {latestUpdate && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                    {latestUpdate.category}
                  </span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {latestUpdate.date}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-1">
                  {latestUpdate.title}
                </h3>
                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                  {latestUpdate.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenUpdates}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 transition-colors shadow-xs"
              >
                <span>Read Circular</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleOpenPairing}
              className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-2xs group-hover:border-zinc-300">
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    FA-IT Pairing Scheme 2026–2027
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Computer, Urdu, English, Islamiyat, Eco, Physical Edu
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors shrink-0" />
            </button>

            <button
              type="button"
              onClick={handleOpenUpdates}
              className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/80 transition-colors flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-2xs group-hover:border-zinc-300">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-900 block">
                    Board Circulars & Roll Number Desk
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {updates.length} official notices for 11th class
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700 transition-colors shrink-0" />
            </button>
          </div>

          {/* Quick Footer Links */}
          <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              Syllabus completion target: <strong className="text-zinc-800">Feb 28, 2027</strong>
            </span>
            <a
              href={BISE_DG_KHAN_INFO.officialWebsite}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2"
            >
              <span>Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Full Modal */}
      <BISEDGKhanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
};
