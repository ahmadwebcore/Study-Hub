import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getBookSliceForTest, BookSliceInfo } from '../../services/testBookReaderService';

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
  testId,
  testTitle,
  subjectCode,
  pagesRange,
  syllabusCoverage,
  bookCoverUrl,
  bookTitle,
  pdfFileName,
  totalPages,
}) => {
  // Resolve authentic slice info (exact test pages from real textbook)
  const sliceInfo: BookSliceInfo = useMemo(() => {
    return getBookSliceForTest({
      testId,
      testTitle,
      subjectCode,
      pagesRange,
      syllabusCoverage,
      bookTitle,
      pdfFileName,
      totalPages,
    });
  }, [testId, testTitle, subjectCode, pagesRange, syllabusCoverage, bookTitle, pdfFileName, totalPages]);

  // Active book selection: primary or secondary (for Friday 2-books combined tests)
  const [activeBookChoice, setActiveBookChoice] = useState<'primary' | 'secondary'>('primary');

  // Currently active book data
  const currentBook = useMemo(() => {
    if (activeBookChoice === 'secondary' && sliceInfo.secondaryBook) {
      return {
        bookKey: sliceInfo.secondaryBook.bookKey,
        titleUrdu: sliceInfo.secondaryBook.bookTitleUrdu,
        titleEng: sliceInfo.secondaryBook.bookTitleEnglish,
        coverUrl: sliceInfo.secondaryBook.coverUrl,
        startPage: sliceInfo.secondaryBook.startPage,
        endPage: sliceInfo.secondaryBook.endPage,
        totalPages: sliceInfo.secondaryBook.totalPages,
        pageImages: sliceInfo.secondaryBook.pageImages,
        slicedPdfUrl: sliceInfo.secondaryBook.fullPdfUrl,
      };
    }
    return {
      bookKey: sliceInfo.bookKey,
      titleUrdu: sliceInfo.bookTitleUrdu,
      titleEng: sliceInfo.bookTitleEnglish,
      coverUrl: bookCoverUrl || sliceInfo.coverUrl,
      startPage: sliceInfo.startPage,
      endPage: sliceInfo.endPage,
      totalPages: sliceInfo.totalPages,
      pageImages: sliceInfo.pageImages,
      slicedPdfUrl: sliceInfo.slicedPdfUrl,
    };
  }, [activeBookChoice, sliceInfo, bookCoverUrl]);

  // Page index within this test's slice (0-indexed: 0 to totalPages - 1)
  const [slicePageIndex, setSlicePageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [imageLoading, setImageLoading] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset page when switching test or book
  useEffect(() => {
    setSlicePageIndex(0);
    setZoomLevel(100);
    setImageLoading(true);
  }, [testId, activeBookChoice]);

  // Lock body scroll and register keyboard navigation
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          setSlicePageIndex((prev) => Math.min(currentBook.totalPages - 1, prev + 1));
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          setSlicePageIndex((prev) => Math.max(0, prev - 1));
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = original || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, currentBook.totalPages]);

  if (!isOpen) return null;

  const currentBookPageNumber = currentBook.startPage + slicePageIndex;
  const currentImageSrc =
    currentBook.pageImages[slicePageIndex] ||
    `/books/pages/${currentBook.bookKey}/page_${currentBookPageNumber}.jpg`;

  const handlePrev = () => {
    if (slicePageIndex > 0) {
      setSlicePageIndex((p) => p - 1);
      setImageLoading(true);
    }
  };

  const handleNext = () => {
    if (slicePageIndex < currentBook.totalPages - 1) {
      setSlicePageIndex((p) => p + 1);
      setImageLoading(true);
    }
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(220, z + 20));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(70, z - 20));
  const handleResetZoom = () => setZoomLevel(100);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden select-none"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${
          isFullscreen ? 'w-screen h-screen max-w-none rounded-none' : 'max-w-6xl h-[94vh] rounded-2xl sm:rounded-3xl'
        } bg-[#0c0d0f] border border-white/10 shadow-2xl flex flex-col text-white font-sans overflow-hidden transition-all duration-200`}
      >
        {/* EXECUTIVE HEADER: CLUTTER-FREE & HIGH-VALUE */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#111216] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Left: Book Meta & Test Range */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-11 sm:w-9 sm:h-12 bg-zinc-800 rounded-lg border border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              <img
                src={currentBook.coverUrl}
                alt="Book Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/covers/cover_tarjuma_ptb.jpg';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {sliceInfo.subjectCode}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/10">
                  {currentBook.totalPages} Test Pages &bull; Book pp. {currentBook.startPage}–{currentBook.endPage}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium hidden md:inline">
                  &bull; Official Punjab Textbook Board
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 font-serif">
                {currentBook.titleUrdu}
              </h3>
            </div>
          </div>

          {/* Friday 2-Book Switcher (if combined Islamiyat + Tarjuma-tul-Quran test) */}
          {sliceInfo.secondaryBook && (
            <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveBookChoice('primary')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeBookChoice === 'primary'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>ترجمۃ القرآن المجید</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBookChoice('secondary')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeBookChoice === 'secondary'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>اسلامیات لازمی</span>
              </button>
            </div>
          )}

          {/* Center: Test Page Controller */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-white/10 rounded-xl px-2.5 py-1">
            <button
              type="button"
              onClick={handlePrev}
              disabled={slicePageIndex <= 0}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400 font-medium">Page</span>
              <span className="font-mono font-bold text-emerald-400 px-1 py-0.5 bg-zinc-800 rounded border border-white/10">
                {slicePageIndex + 1}
              </span>
              <span className="text-zinc-500 font-mono">/ {currentBook.totalPages}</span>
              <span className="text-[10px] text-zinc-400 border-l border-white/10 pl-1.5 ml-1 hidden sm:inline">
                Book p. {currentBookPageNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={slicePageIndex >= currentBook.totalPages - 1}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Tools (Zoom, Download Sliced PDF, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-0.5 bg-zinc-900 border border-white/10 rounded-xl p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 70}
                className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[11px] font-mono text-zinc-300 hover:text-white cursor-pointer"
                title="Reset Zoom"
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 220}
                className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer rounded-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Toggle Filmstrip Thumbnails */}
            <button
              type="button"
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer hidden md:inline-flex ${
                showThumbnails
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5 border-white/10'
              }`}
              title="Toggle Page Filmstrip"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Direct Sliced PDF Download */}
            <a
              href={currentBook.slicedPdfUrl}
              download={`${sliceInfo.testId}_pages_${currentBook.startPage}_${currentBook.endPage}.pdf`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title={`Download official ${currentBook.totalPages}-page test PDF`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF ({currentBook.totalPages}p)</span>
            </a>

            {/* Open Sliced PDF in New Tab */}
            <a
              href={currentBook.slicedPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title="Open Sliced PDF in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN TEXTBOOK PAGE VIEWING CANVAS */}
        <div
          ref={containerRef}
          className="flex-1 w-full h-full bg-[#141518] overflow-auto flex items-center justify-center p-3 sm:p-6 relative select-text"
        >
          {/* Previous Page Floating Overlay Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={slicePageIndex <= 0}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/20 shadow-xl backdrop-blur-md flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Page Floating Overlay Button */}
          <button
            type="button"
            onClick={handleNext}
            disabled={slicePageIndex >= currentBook.totalPages - 1}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white border border-white/20 shadow-xl backdrop-blur-md flex items-center justify-center disabled:opacity-0 disabled:pointer-events-none transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Book Page Card with High-Fidelity Rendering */}
          <div
            className="relative transition-transform duration-150 origin-center flex flex-col items-center justify-center max-w-full my-auto"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'center center',
            }}
          >
            {imageLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 rounded-2xl z-10 p-8 space-y-3">
                <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-zinc-400 font-medium">Loading Authentic Book Page {currentBookPageNumber}...</p>
              </div>
            )}

            <img
              key={currentImageSrc}
              src={currentImageSrc}
              alt={`Textbook Page ${currentBookPageNumber}`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                // Fallback to first page if specific page image is missing
                (e.target as HTMLImageElement).src = `/books/pages/${currentBook.bookKey}/page_1.jpg`;
              }}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 bg-white"
            />
          </div>

          {/* End of Test Range Notification Badge */}
          {slicePageIndex === currentBook.totalPages - 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>End of Test Syllabus Pages ({currentBook.totalPages}/{currentBook.totalPages})</span>
            </div>
          )}
        </div>

        {/* BOTTOM FILMSTRIP THUMBNAILS BAR */}
        {showThumbnails && (
          <div className="px-3 py-2 bg-[#0e0f12] border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between pb-1.5 text-[11px] text-zinc-400">
              <span className="font-semibold flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Syllabus Pages Filmstrip ({currentBook.totalPages} Pages for this Test)
              </span>
              <span className="text-zinc-500 font-mono">
                Click any thumbnail to jump &bull; Use Left/Right Arrow Keys
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
              {Array.from({ length: currentBook.totalPages }).map((_, idx) => {
                const pageNum = currentBook.startPage + idx;
                const isSelected = idx === slicePageIndex;
                const thumbSrc = `/books/pages/${currentBook.bookKey}/page_${pageNum}.jpg`;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSlicePageIndex(idx);
                      setImageLoading(true);
                    }}
                    className={`shrink-0 flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600/30 border-2 border-emerald-500 scale-105'
                        : 'bg-zinc-900 border border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                    }`}
                  >
                    <div className="w-10 h-14 bg-zinc-800 rounded-md overflow-hidden flex items-center justify-center border border-white/5">
                      <img
                        src={thumbSrc}
                        alt={`Thumb p.${pageNum}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/covers/cover_tarjuma_ptb.jpg';
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isSelected ? 'text-emerald-400' : 'text-zinc-400'
                      }`}
                    >
                      p.{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
