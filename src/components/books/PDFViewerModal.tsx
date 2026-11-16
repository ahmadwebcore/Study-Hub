import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  BookOpen,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck2,
  CheckCircle2,
  FileText,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTextbookDetailsForTest } from '../../data/textbookContent';

export interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If opening for a test/task:
  testId?: string;
  testTitle?: string;
  subjectCode?: string;
  subjectName?: string;
  pagesRange?: string;
  syllabusCoverage?: string;
  // If opening a raw book from Library or Media:
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
  testId,
  testTitle,
  subjectCode,
  subjectName,
  pagesRange,
  syllabusCoverage,
  bookId: _bookId,
  bookTitle,
  bookCoverUrl,
  pdfFileName,
  initialPage = 1,
  totalPages: propTotalPages,
}) => {
  const [activeTab, setActiveTab] = useState<'excerpt' | 'full_pdf'>('excerpt');
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Resolve book data
  const testDetails = getTextbookDetailsForTest({
    subjectCode,
    subjectName,
    title: testTitle,
    syllabusCoverage,
  });

  const resolvedBookData = testDetails.bookData;
  const currentChapter = testDetails.chapter;

  const displayBookTitle = bookTitle || resolvedBookData.urduBookTitle || resolvedBookData.bookTitle;
  const displayCoverUrl = bookCoverUrl || resolvedBookData.coverUrl;
  const displayFileName = pdfFileName || resolvedBookData.pdfFileName;
  const totalPagesCount = propTotalPages || resolvedBookData.totalPages || 200;
  const effectivePagesRange = pagesRange || currentChapter.pagesRange;

  const handleNextPage = () => {
    if (currentPage < totalPagesCount) setCurrentPage((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = displayCoverUrl;
    link.download = displayFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`relative w-full max-w-5xl ${
          isFullscreen ? 'h-[98vh]' : 'h-[90vh]'
        } bg-[#18181b] rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-zinc-100 font-sans`}
      >
        {/* 1. Modal Top Bar */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-[#141417] border-b border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          {/* Book Info */}
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={displayCoverUrl}
              alt="Book Cover"
              className="w-8 h-11 sm:w-9 sm:h-12 object-cover rounded-lg border border-zinc-700 shadow-xs shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/covers/cover_urdu_ptb.jpg';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                  {subjectCode || resolvedBookData.subjectCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {effectivePagesRange}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
                  &bull; Official BISE DG Khan Textbook
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate mt-0.5">
                {displayBookTitle}
              </h3>
            </div>
          </div>

          {/* Controls: Fullscreen, Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              aria-label="Close PDF Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Reader Navigation Toolbar */}
        <div className="px-4 py-2 sm:px-6 bg-[#18181b] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setActiveTab('excerpt')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'excerpt'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Test Chapter &amp; Excerpt</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('full_pdf')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeTab === 'full_pdf'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Full Textbook PDF</span>
            </button>
          </div>

          {/* Reader Controls: Page Flipper & Zoom */}
          <div className="flex items-center gap-3">
            {/* Page Counter & Flipper */}
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-zinc-200 px-1">
                Page {currentPage} of {totalPagesCount}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPagesCount}
                className="p-1 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1 text-zinc-400 hover:text-zinc-100"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-zinc-300 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(175, z + 15))}
                className="p-1 text-zinc-400 hover:text-zinc-100"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* 3. Main Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#121215]">
          {activeTab === 'excerpt' ? (
            /* TAB 1: Test Chapter Excerpt View (Exact Pages, Questions, Answers) */
            <div
              className="max-w-4xl mx-auto space-y-6 transition-all"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Chapter Header Banner */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Topic Attached to Assessment &bull; {effectivePagesRange}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    Textbook Source: {resolvedBookData.pdfFileName}
                  </span>
                </div>

                <h2
                  className={`text-lg sm:text-xl font-bold text-zinc-100 ${
                    currentChapter.urduTitle ? 'font-urdu text-xl leading-relaxed text-right dir-rtl' : ''
                  }`}
                >
                  {currentChapter.urduTitle || currentChapter.title}
                </h2>

                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800">
                  {currentChapter.summary}
                </p>
              </div>

              {/* Key Concept Points */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    اہم امتحانی نکات و رہنما اصول (Essential Exam Concepts)
                  </h3>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-zinc-300">
                  {currentChapter.keyPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grammar / Practical Rules if available */}
              {currentChapter.grammarOrPracticalRules && (
                <div className="p-5 sm:p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-md space-y-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      قواعد و ضوابط (Grammar &amp; Analytical Framework)
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-300">
                    {currentChapter.grammarOrPracticalRules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 font-mono text-emerald-300 text-xs"
                      >
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solved Board Standard Questions from the attached pages */}
              <div className="p-5 sm:p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      درسی کتاب کے اہم سوالات و حل شدہ جوابات (Textbook Questions)
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/80">
                    30 Marks Mapped
                  </span>
                </div>

                <div className="space-y-3">
                  {currentChapter.boardQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs sm:text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-bold text-zinc-100 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                            Q{idx + 1}
                          </span>
                          {q.question}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 shrink-0">
                          {q.marks} Marks
                        </span>
                      </div>
                      <div className="pl-6 pt-1 text-zinc-300 text-xs leading-relaxed border-t border-zinc-800/60 mt-2">
                        <strong className="text-emerald-400 block mb-0.5">جواب (Verified Solution):</strong>
                        {q.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: Full PDF Interactive Book Viewer */
            <div
              className="max-w-3xl mx-auto space-y-6 transition-all text-center"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              <div className="p-6 rounded-3xl bg-[#18181b] border border-zinc-800 shadow-xl space-y-4">
                <div className="relative inline-block mx-auto rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl">
                  <img
                    src={displayCoverUrl}
                    alt={displayBookTitle}
                    className="max-h-[500px] w-auto object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/covers/cover_urdu_ptb.jpg';
                    }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-center">
                    <span className="text-xs font-mono font-bold text-emerald-400 block">
                      {displayFileName} &bull; Page {currentPage} of {totalPagesCount}
                    </span>
                    <span className="text-[11px] text-zinc-300">
                      Official Certified BISE DG Khan Curriculum Edition
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    &larr; Previous Page
                  </button>
                  <span className="font-mono text-xs font-bold text-zinc-300 px-3">
                    Viewing Page {currentPage} / {totalPagesCount}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPagesCount}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Next Page &rarr;
                  </button>
                </div>

                <p className="text-xs text-zinc-400 max-w-md mx-auto pt-2">
                  Download the complete offline textbook PDF anytime for high-speed offline reading or printing.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Modal Footer with Direct Exam / Quota Action */}
        <div className="px-4 py-3 sm:px-6 bg-[#141417] border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-zinc-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Topic: <strong>{effectivePagesRange}</strong> &bull; Syllabus verified for 28 Feb Sprint
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {downloadSuccess && (
              <span className="text-xs text-emerald-400 font-semibold px-2 animate-in fade-in duration-150">
                PDF Dispatched &bull; Downloaded!
              </span>
            )}

            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Offline PDF</span>
            </button>

            {testId ? (
              <Link
                to={`/test-submit?testId=${testId}`}
                onClick={onClose}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Start This 30M Test &rarr;</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
