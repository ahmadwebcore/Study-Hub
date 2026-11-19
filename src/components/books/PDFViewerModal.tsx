import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  ExternalLink,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { generateBookPagesForTest } from '../../data/bookPageGenerator';

export interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId?: string;
  testTitle?: string;
  subjectCode?: string;
  subjectName?: string;
  pagesRange?: string;
  syllabusCoverage?: string;
  bookId?: string;
  bookTitle?: string;
  bookCoverUrl?: string;
  pdfFileName?: string;
  initialPage?: number;
  totalPages?: number;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  testTitle,
  subjectCode,
  subjectName,
  pagesRange,
  syllabusCoverage,
  bookTitle,
  bookCoverUrl,
  pdfFileName,
  initialPage = 1,
}) => {
  // Generate authentic book page slice for syllabus summary mode
  const bookSlice = React.useMemo(() => {
    return generateBookPagesForTest({
      subjectCode,
      subjectName,
      title: testTitle,
      syllabusCoverage,
      pagesRange,
    });
  }, [subjectCode, subjectName, testTitle, syllabusCoverage, pagesRange]);

  // Resolve real downloaded official textbook PDF
  const realPdfUrl = React.useMemo(() => {
    if (pdfFileName && pdfFileName.startsWith('/books/')) return pdfFileName;
    const code = (subjectCode || '').toUpperCase();
    const title = (bookTitle || testTitle || '').toLowerCase();

    if (code.includes('CSC') || title.includes('computer')) {
      return '/books/computer_science_11_punjab.pdf';
    }
    if (code.includes('URD') || title.includes('urdu') || title.includes('اردو') || title.includes('سرمایہ')) {
      return '/books/urdu_11_punjab.pdf';
    }
    if (code.includes('ENG') || title.includes('english')) {
      return '/books/english_11_punjab.pdf';
    }
    if (code.includes('TQM') || title.includes('quran') || title.includes('قرآن')) {
      return '/books/tarjuma_tul_quran_11_punjab.pdf';
    }
    if (code.includes('ISL') || title.includes('islam') || title.includes('اسلامیات')) {
      return '/books/islamiat_11_punjab.pdf';
    }
    if (code.includes('ECO') || title.includes('economic') || title.includes('معاشیات')) {
      return '/books/principles_of_economics_11_punjab.pdf';
    }
    if (code.includes('PED') || title.includes('physical') || title.includes('جسمانی') || title.includes('صحت')) {
      return '/books/physical_education_11_punjab.pdf';
    }
    return '/books/urdu_11_punjab.pdf';
  }, [subjectCode, pdfFileName, bookTitle, testTitle]);

  const parsedStartPage = React.useMemo(() => {
    if (initialPage && initialPage > 1) return initialPage;
    const cov = syllabusCoverage || pagesRange || '';
    const match = cov.match(/(?:pages|صفحات|صفحہ|pp\.?)\s*(\d+)/i) || cov.match(/(\d+)\s*[-–toتا]\s*\d+/i);
    if (match && match[1]) {
      const p = parseInt(match[1], 10);
      if (!isNaN(p) && p > 0) return p;
    }
    return 1;
  }, [initialPage, syllabusCoverage, pagesRange]);

  const [activePage, setActivePage] = useState<number>(parsedStartPage);
  const [viewType, setViewType] = useState<'pdf' | 'summary'>('pdf');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setActivePage(parsedStartPage);
  }, [parsedStartPage]);

  // Lock body scroll and handle Escape key
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

  const totalPagesCount = bookSlice.totalPages || 150;
  const currentTitle = bookTitle || bookSlice.urduBookTitle || bookSlice.bookTitle || 'Official Textbook';
  const effectiveSubject = subjectCode || bookSlice.subjectCode || 'FA-IT 11';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = realPdfUrl;
    link.download = realPdfUrl.split('/').pop() || 'official_textbook.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${
          isFullscreen ? 'max-w-[99vw] h-[98dvh]' : 'max-w-6xl h-[92dvh] sm:h-[88vh]'
        } bg-[#09090b] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-white font-sans my-auto transition-all`}
      >
        {/* SINGLE CLEAN EXECUTIVE HEADER BAR (Zero Clutter) */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#0d0d10] border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          {/* Left: Book Meta */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-10 sm:w-9 sm:h-11 bg-zinc-800 rounded-lg border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img
                src={bookCoverUrl || '/covers/cover_urdu_ptb.jpg'}
                alt="Book Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/covers/cover_urdu_ptb.jpg';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {effectiveSubject}
                </span>
                {pagesRange && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-200 border border-white/10">
                    {pagesRange}
                  </span>
                )}
                <span className="text-[10px] text-zinc-400 font-medium hidden md:inline">
                  &bull; Official PECTAA Edition
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {currentTitle}
              </h3>
            </div>
          </div>

          {/* Center: Clean Page Jump Control */}
          <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/90 border border-white/10 rounded-xl px-2.5 py-1">
            <button
              type="button"
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              disabled={activePage <= 1}
              className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-zinc-400 font-semibold">Page</span>
            <input
              type="number"
              min={1}
              max={totalPagesCount}
              value={activePage}
              onChange={(e) => setActivePage(Math.max(1, Math.min(totalPagesCount, Number(e.target.value) || 1)))}
              className="w-12 bg-zinc-800 border border-white/10 rounded px-1.5 py-0.5 text-center text-xs font-mono font-bold text-emerald-400 focus:outline-none"
            />
            <span className="text-[11px] text-zinc-500 font-mono">/ {totalPagesCount}</span>
            <button
              type="button"
              onClick={() => setActivePage((p) => Math.min(totalPagesCount, p + 1))}
              disabled={activePage >= totalPagesCount}
              className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: View Toggle & Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* View Mode Toggle: Real PDF vs Summary Notes */}
            <div className="flex items-center bg-zinc-900 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewType('pdf')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewType === 'pdf'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF Book</span>
              </button>
              <button
                type="button"
                onClick={() => setViewType('summary')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  viewType === 'summary'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Syllabus Notes</span>
              </button>
            </div>

            {/* Open Raw in New Tab */}
            <a
              href={`${realPdfUrl}#page=${activePage}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title="Open Raw PDF in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Download Textbook PDF"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN VIEWER AREA */}
        <div className="flex-1 w-full h-full bg-[#121215] overflow-hidden flex flex-col relative">
          {viewType === 'pdf' ? (
            <iframe
              key={`pdf-frame-${realPdfUrl}-${activePage}`}
              src={`${realPdfUrl}#page=${activePage}&toolbar=1&navpanes=0`}
              title="Official Textbook PDF"
              className="w-full h-full border-0 bg-[#121215]"
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 max-w-4xl mx-auto w-full">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Syllabus Chapter Extract &amp; Board Focus</span>
                </div>
                <h4 className="text-base font-bold text-white font-serif">
                  {bookSlice.urduBookTitle || bookSlice.bookTitle} &bull; {pagesRange || bookSlice.pagesRange}
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-urdu text-right dir-rtl">
                  {syllabusCoverage || 'بورڈ امتحان کے مطابق اہم امتحانی نکات، تعریفات اور مشقی سوالات کا احاطہ۔'}
                </p>
              </div>

              {/* Page Slices Content */}
              <div className="space-y-4">
                {bookSlice.pages.map((p, idx) => (
                  <div key={p.pageIndex || idx} className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                      <span className="font-bold text-emerald-400">Page {p.pageIndex} &bull; {p.pageTitle}</span>
                      {p.urduPageTitle && (
                        <span className="font-urdu text-zinc-300 font-bold">{p.urduPageTitle}</span>
                      )}
                    </div>
                    {p.content.paragraphs && p.content.paragraphs.length > 0 && (
                      <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                        {p.content.paragraphs.map((para, pIdx) => (
                          <p key={pIdx}>{para}</p>
                        ))}
                      </div>
                    )}
                    {p.content.points && p.content.points.length > 0 && (
                      <ul className="space-y-1 pl-4 list-disc text-xs text-zinc-300">
                        {p.content.points.map((pt: string, ptIdx: number) => (
                          <li key={ptIdx}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
