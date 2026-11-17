import React, { useState, useEffect, useRef } from 'react';
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
  Printer,
  Sparkles,
  Columns,
  Square,
  List,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateBookPagesForTest, BookPageItem } from '../../data/bookPageGenerator';

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
  bookTitle,
  bookCoverUrl,
  pdfFileName,
  initialPage = 1,
}) => {
  // Generate authentic book page slice for this specific test syllabus
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
      return '/books/computer_science_11_itseries.pdf';
    }
    if (code.includes('URD') || title.includes('urdu') || title.includes('سرمایہ')) {
      if (title.includes('شرح') || title.includes('sharh')) {
        return '/books/urdu_sarmaya_11_pctb.pdf';
      }
      return '/books/urdu_compulsory_11_pectaa.pdf';
    }
    if (code.includes('ENG') || title.includes('english')) {
      if (title.includes('play') || title.includes('book 3') || title.includes('poem')) {
        return '/books/english_11_book3_plays.pdf';
      }
      return '/books/english_11_book1_stories.pdf';
    }
    if (code.includes('TQM') || title.includes('quran') || title.includes('قرآن')) {
      return '/books/tarjuma_tul_quran_11_pctb.pdf';
    }
    if (code.includes('ISL') || title.includes('islam') || title.includes('اسلامیات')) {
      return '/books/islamiat_lazmi_11_pectaa.pdf';
    }
    if (code.includes('ECO') || title.includes('economic') || title.includes('معاشیات')) {
      return '/books/principles_of_economics_11_pctb.pdf';
    }
    return '/books/urdu_compulsory_11_pectaa.pdf';
  }, [subjectCode, pdfFileName, bookTitle, testTitle]);

  const [viewerTab, setViewerTab] = useState<'slices' | 'real_pdf'>('slices');
  const [activePageIndex, setActivePageIndex] = useState<number>(initialPage); // 1-based index (1 to totalPages)
  const [viewMode, setViewMode] = useState<'single' | 'continuous' | 'spread'>('single');
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') {
          setActivePageIndex((p) => Math.min(bookSlice.totalPages, p + 1));
        }
        if (e.key === 'ArrowLeft') {
          setActivePageIndex((p) => Math.max(1, p - 1));
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = original || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose, bookSlice.totalPages]);

  if (!isOpen) return null;

  const totalPages = bookSlice.totalPages;
  const activePage = bookSlice.pages.find((p) => p.pageIndex === activePageIndex) || bookSlice.pages[0];

  const handleNextPage = () => {
    if (activePageIndex < totalPages) setActivePageIndex((p) => p + 1);
  };

  const handlePrevPage = () => {
    if (activePageIndex > 1) setActivePageIndex((p) => p - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = realPdfUrl;
    link.download = realPdfUrl.split('/').pop() || 'official_textbook.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const filteredPages = searchQuery.trim()
    ? bookSlice.pages.filter(
        (p) =>
          p.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.urduPageTitle && p.urduPageTitle.includes(searchQuery)) ||
          p.content.paragraphs?.some((pr) => pr.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : bookSlice.pages;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto overscroll-contain"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-5xl ${
          isFullscreen ? 'h-[98dvh]' : 'h-[93dvh] sm:h-[90vh]'
        } bg-[#121215] rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col text-white font-sans my-auto`}
      >
        {/* 1. TOP HEADER BAR */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 bg-[#09090b] text-white border-b border-white/10 flex items-center justify-between gap-2.5 shrink-0">
          {/* Book Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-10 sm:w-9 sm:h-12 bg-zinc-800 rounded-lg border border-white/20 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
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
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {subjectCode || bookSlice.subjectCode}
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-white border border-white/20">
                  {pagesRange || bookSlice.pagesRange} &bull; {totalPages} Pages
                </span>
                <span className="text-[10px] text-zinc-400 font-medium hidden md:inline">
                  &bull; BISE DG Khan Key Book Extract
                </span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white truncate mt-0.5">
                {bookTitle || bookSlice.urduBookTitle || bookSlice.bookTitle}
              </h3>
            </div>
          </div>

          {/* Action Tools: Print, Download, Fullscreen, Close */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title="Print This Chapter Pages"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Download Full Textbook PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors hidden sm:inline-flex cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close Book Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB SWITCHER: CHAPTER SLICE (PRIMARY) vs FULL BOOK PDF */}
        <div className="px-3 py-2 sm:px-6 bg-[#09090b] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setViewerTab('slices')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer truncate ${
                viewerTab === 'slices'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">1. Test Syllabus Pages ({totalPages}P)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewerTab('real_pdf')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer truncate ${
                viewerTab === 'real_pdf'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Full Book PDF</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <a
              href={realPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 font-semibold text-xs border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Open Raw PDF in Tab</span>
            </a>
          </div>
        </div>

        {viewerTab === 'real_pdf' ? (
          <div className="flex-1 w-full h-full flex flex-col bg-zinc-950 overflow-hidden relative">
            <div className="px-3 py-2 sm:px-6 bg-[#18181b] border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 text-xs shrink-0">
              <div className="flex items-center gap-2 text-zinc-300 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-bold text-white truncate">Full Scanned Textbook PDF</span>
                <span className="text-zinc-500 hidden md:inline truncate">
                  &bull; Official Punjab Curriculum &amp; Textbook Authority (PECTAA) Edition
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#09090b] border border-white/10 rounded-xl px-2.5 py-1">
                  <span className="text-[11px] text-zinc-400 font-semibold">Page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages || 300}
                    value={activePageIndex}
                    onChange={(e) => setActivePageIndex(Math.max(1, Number(e.target.value) || 1))}
                    className="w-12 bg-zinc-900 border border-white/10 rounded px-1 py-0.5 text-center text-xs font-mono font-bold text-emerald-400 focus:outline-none"
                  />
                  <span className="text-[11px] text-zinc-500 font-mono">/ {totalPages || 300}</span>
                </div>

                <a
                  href={`${realPdfUrl}#page=${activePageIndex}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </a>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </div>
            </div>

            <iframe
              key={`real-pdf-${activePageIndex}`}
              src={`${realPdfUrl}#page=${activePageIndex}&zoom=100`}
              title="Official Scanned Textbook PDF"
              className="flex-1 w-full h-full border-0 bg-zinc-900"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 2. READER TOOLBAR */}
            <div className="px-3 py-2 sm:px-6 bg-[#18181b] border-b border-white/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0 text-xs">
              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'single'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Single Page Sheet"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Page View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('spread')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all hidden sm:flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'spread'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Two-Page Book Spread (کھلی کتاب)"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>2-Page Spread</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('continuous')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'continuous'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Continuous Vertical Scroll (All 15 Pages)"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">All {totalPages} Pages</span>
                </button>
              </div>

              {/* Thumbnails Sidebar Toggle */}
              <button
                type="button"
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer hidden md:flex items-center gap-1.5 ${
                  showThumbnails
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-[#09090b] border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Thumbnails ({totalPages})</span>
              </button>

              {/* Page Flipper Navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#09090b] border border-white/10 rounded-xl px-2 py-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={activePageIndex <= 1}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page (ArrowLeft)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={activePageIndex}
                onChange={(e) => setActivePageIndex(Number(e.target.value))}
                className="bg-transparent text-emerald-400 font-mono font-bold text-xs text-center border-none focus:outline-none cursor-pointer px-1"
              >
                {bookSlice.pages.map((p) => (
                  <option key={p.pageIndex} value={p.pageIndex} className="bg-zinc-900 text-white">
                    Page {p.pageIndex} / {totalPages}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={activePageIndex >= totalPages}
                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page (ArrowRight)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#09090b] border border-white/10 rounded-xl px-2 py-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-xs font-bold text-zinc-300 w-10 text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. MAIN WORKSPACE: THUMBNAILS SIDEBAR + BOOK CANVAS */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thumbnails Filmstrip Sidebar */}
          {showThumbnails && (
            <div className="w-52 bg-[#09090b] border-r border-white/10 flex flex-col shrink-0 overflow-hidden hidden md:flex">
              {/* Search within Pages */}
              <div className="p-2.5 border-b border-white/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in book..."
                    className="w-full bg-[#18181b] border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Thumbnails List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredPages.map((page) => {
                  const isCurrent = page.pageIndex === activePageIndex;
                  return (
                    <button
                      key={page.pageIndex}
                      type="button"
                      onClick={() => setActivePageIndex(page.pageIndex)}
                      className={`w-full text-left p-2 rounded-xl transition-all border cursor-pointer block ${
                        isCurrent
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-xs'
                          : 'bg-[#18181b] border-white/5 hover:border-white/20 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {/* Mini Page Canvas Replica */}
                      <div className="aspect-[3/4] bg-[#FCFCF9] text-zinc-900 rounded-md p-1.5 text-[7px] leading-tight overflow-hidden shadow-2xs border border-zinc-300 mb-1.5 select-none opacity-90">
                        <div className="border-b border-zinc-200 pb-0.5 mb-1 text-[6px] font-bold truncate text-emerald-800">
                          {page.headerBookTitle}
                        </div>
                        <div className="font-bold text-zinc-800 truncate mb-0.5">
                          {page.pageTitle}
                        </div>
                        <div className="text-[6px] text-zinc-600 line-clamp-3">
                          {page.content.paragraphs?.[0] || 'Official Textbook & Key Book Page'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span>Page {page.pageIndex}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 font-mono">
                          {page.category === 'title_sheet'
                            ? 'Cover'
                            : page.category === 'vocabulary_glossary'
                            ? 'Lughat'
                            : page.category === 'summary_analysis'
                            ? 'Khulasa'
                            : page.category === 'keybook_tashreeh'
                            ? 'Tashreeh'
                            : page.category === 'keybook_exercises'
                            ? 'Key Book'
                            : page.category === 'grammar_rules'
                            ? 'Qawaid'
                            : page.category === 'test_paper'
                            ? '30M Paper'
                            : page.category === 'marking_key'
                            ? 'Sol. Key'
                            : 'Matan'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Central Book Canvas Viewport */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 bg-[#0d0d10] flex justify-center items-start"
          >
            {viewMode === 'single' ? (
              /* SINGLE PAGE SHEET */
              <div
                className="transition-all duration-150 my-auto"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <RenderBookPageSheet page={activePage} totalPages={totalPages} />
              </div>
            ) : viewMode === 'spread' ? (
              /* TWO-PAGE BOOK SPREAD (OPEN BOOK) */
              <div
                className="transition-all duration-150 flex items-stretch gap-0 my-auto shadow-2xl rounded-2xl overflow-hidden"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {/* Left Page */}
                <div className="border-r border-zinc-300 relative">
                  <RenderBookPageSheet
                    page={activePage}
                    totalPages={totalPages}
                    isLeftSpread
                  />
                  {/* Subtle Book Spine Shadow */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
                </div>

                {/* Right Page (Next Page if available) */}
                {activePageIndex < totalPages ? (
                  <div className="relative">
                    <RenderBookPageSheet
                      page={bookSlice.pages[activePageIndex]} // next page
                      totalPages={totalPages}
                      isRightSpread
                    />
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                  </div>
                ) : (
                  <div className="w-[520px] bg-[#F7F9F8] flex items-center justify-center p-8 text-zinc-400 text-xs italic">
                    End of Chapter Topic Slice ({totalPages} Pages Complete)
                  </div>
                )}
              </div>
            ) : (
              /* CONTINUOUS VERTICAL SCROLL (ALL 15 PAGES) */
              <div
                className="space-y-8 transition-all duration-150"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                {bookSlice.pages.map((p) => (
                  <div key={p.pageIndex} id={`page-${p.pageIndex}`} className="scroll-mt-4">
                    <RenderBookPageSheet page={p} totalPages={totalPages} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

        {/* 4. MODAL FOOTER */}
        <div className="px-3.5 py-2.5 sm:px-6 sm:py-3 bg-[#09090b] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="text-zinc-400 flex items-center gap-2 text-[11px] sm:text-xs truncate w-full sm:w-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              Official Key Book: <strong className="text-white">{bookSlice.keyBookTitle || bookSlice.pdfFileName}</strong> &bull; Verified Syllabus for BISE D.G. Khan
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
              onClick={handlePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-300 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Print Pages</span>
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
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-zinc-300 bg-[#18181b] hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-pointer"
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

// -------------------------------------------------------------
// REALISTIC AUTHENTIC PRINTED TEXTBOOK PAGE COMPONENT
// -------------------------------------------------------------
interface RenderBookPageSheetProps {
  page: BookPageItem;
  totalPages: number;
  isLeftSpread?: boolean;
  isRightSpread?: boolean;
}

const RenderBookPageSheet: React.FC<RenderBookPageSheetProps> = ({
  page,
  totalPages,
  isLeftSpread,
  isRightSpread,
}) => {
  const isUrdu = page.isUrdu;

  return (
    <div
      className={`relative w-full max-w-[680px] min-h-[500px] sm:min-h-[880px] bg-[#FCFCF9] text-[#142D27] p-3.5 sm:p-10 shadow-2xl border border-[#D5DDD8] flex flex-col justify-between font-sans select-text ${
        isLeftSpread ? 'rounded-l-2xl' : isRightSpread ? 'rounded-r-2xl' : 'rounded-2xl'
      } print:m-0 print:border-none print:shadow-none print:w-full print:min-h-screen mx-auto`}
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Subtle Inner Framing Border */}
      <div className="absolute inset-2 sm:inset-4 border border-[#E3EBE6] pointer-events-none rounded-xl" />

      {/* Watermark in Background */}
      {page.watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
          <span className="text-[#142D27]/[0.03] font-black text-5xl sm:text-7xl -rotate-45 tracking-widest uppercase">
            {page.watermarkText}
          </span>
        </div>
      )}

      {/* 1. TOP RUNNING HEADER */}
      <div className="relative z-10 pb-2.5 sm:pb-3 border-b-2 border-[#142D27]/20 flex items-center justify-between text-[10px] sm:text-xs font-serif text-[#39564D] shrink-0 gap-2">
        <span className="font-bold truncate max-w-[130px] sm:max-w-xs">
          {page.headerBookTitle}
        </span>
        <span className="font-medium hidden sm:inline truncate max-w-[180px]">
          {page.headerChapterTitle}
        </span>
        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-[#142D27]/5 border border-[#142D27]/10 text-[#142D27] text-[10px] sm:text-xs shrink-0">
          {isUrdu ? `صفحہ ${page.pageIndex} / ${totalPages}` : `Page ${page.pageIndex} of ${totalPages}`}
        </span>
      </div>

      {/* 2. MAIN PAGE BODY CONTENT */}
      <div className="relative z-10 flex-1 py-5 sm:py-7 space-y-4 text-xs sm:text-sm leading-relaxed">
        {/* Title Sheet Header */}
        {page.category === 'title_sheet' && (
          <div className="text-center py-4 sm:py-8 border-b border-[#D5DDD8] space-y-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {page.headerChapterTitle}
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-[#142D27] font-serif leading-tight">
              {page.urduPageTitle || page.pageTitle}
            </h1>
            {page.content.leadNote && (
              <p className="text-xs text-[#557067] max-w-lg mx-auto font-medium italic">
                {page.content.leadNote}
              </p>
            )}
          </div>
        )}

        {/* Regular Page Title (for non-cover pages) */}
        {page.category !== 'title_sheet' && (
          <div className="flex items-center justify-between pb-2 border-b border-[#E3EBE6]">
            <h2 className="text-base sm:text-lg font-bold text-[#142D27] font-serif flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
              <span>{page.urduPageTitle || page.pageTitle}</span>
            </h2>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
              {page.category.replace('_', ' ')}
            </span>
          </div>
        )}

        {/* Lead Notes */}
        {page.content.leadNote && page.category !== 'title_sheet' && (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium leading-relaxed">
            {page.content.leadNote}
          </div>
        )}

        {/* Paragraphs (Prose / Matan) */}
        {page.content.paragraphs && (
          <div className={`space-y-3 text-[#1F3A32] ${isUrdu ? 'text-justify leading-loose font-serif' : 'leading-relaxed'}`}>
            {page.content.paragraphs.map((para, idx) => (
              <p key={idx} className="indent-4 sm:indent-6">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Key Points / Callout Notes */}
        {page.content.points && (
          <div className="p-4 bg-[#F2F6F4] rounded-2xl border border-[#D5DDD8] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#142D27] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>اہم تعلیمی نکات و رہنما اصول (Key Exam Takeaways)</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[#2E4A41] list-disc list-inside">
              {page.content.points.map((pt, idx) => (
                <li key={idx} className="leading-relaxed">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vocabulary / Farhang Table */}
        {page.content.vocabularyTable && (
          <div className="overflow-hidden rounded-xl border border-[#D5DDD8] shadow-2xs mt-3">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-[#EAEFEA] text-[#142D27] font-bold border-b border-[#D5DDD8]">
                  <th className="p-2.5 w-1/3">لفظ و اعراب (Word)</th>
                  <th className="p-2.5 w-2/3">مستند لغوی معنی و مفہوم (Meaning)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EBE6] bg-white">
                {page.content.vocabularyTable.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-2.5 font-bold text-emerald-900 font-serif text-sm">
                      {item.word}
                    </td>
                    <td className="p-2.5 text-[#2E4A41] font-serif">
                      {item.meaning}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Siaq-o-Sabaq & Tashreeh Block */}
        {page.content.tashreehBlock && (
          <div className="space-y-3 p-4 bg-white rounded-2xl border border-[#D5DDD8] shadow-xs">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-serif italic text-zinc-800 leading-relaxed">
              <strong className="text-emerald-800 block not-italic mb-1 font-sans text-[11px] uppercase tracking-wide">
                اقتباس (Excerpt for Explanation):
              </strong>
              "{page.content.tashreehBlock.iqtibas}"
            </div>

            <div className="text-[11px] font-bold text-[#39564D] bg-[#F2F6F4] p-2 rounded-lg border border-[#D5DDD8]">
              {page.content.tashreehBlock.hawala}
            </div>

            <div className="space-y-1 text-xs">
              <strong className="text-[#142D27] font-bold block">سیاق و سباق (Context):</strong>
              <p className="text-[#2E4A41] font-serif leading-relaxed">
                {page.content.tashreehBlock.siaqSabaq}
              </p>
            </div>

            <div className="space-y-1 text-xs pt-1 border-t border-[#E3EBE6]">
              <strong className="text-[#142D27] font-bold block">تفصیلی تشریح (Explanation):</strong>
              <p className="text-[#2E4A41] font-serif leading-relaxed text-justify">
                {page.content.tashreehBlock.tashreeh}
              </p>
            </div>
          </div>
        )}

        {/* Exercise Questions from Key Book */}
        {page.content.exerciseQuestions && (
          <div className="space-y-3 mt-2">
            {page.content.exerciseQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-[#D5DDD8] space-y-2 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#142D27] text-xs font-serif flex items-start gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-sans font-bold shrink-0 mt-0.5">
                      {q.qNum}
                    </span>
                    <span>{q.question}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    {q.marks} Marks
                  </span>
                </div>

                {q.options && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs font-serif">
                    {q.options.map((opt, oIdx) => (
                      <span key={oIdx} className="p-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-700 text-[11px]">
                        {opt}
                      </span>
                    ))}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-[#F7F9F8] border border-[#E3EBE6] text-xs font-serif text-[#1F3A32] leading-relaxed">
                  <strong className="text-emerald-800 block text-[11px] font-sans uppercase font-bold mb-0.5">
                    ✓ تصدیق شدہ کلید / حل (Verified Key Book Solution):
                  </strong>
                  {q.answer}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grammar & Rhetoric Box */}
        {page.content.grammarBox && (
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-600/30 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-100">
              <FileText className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-[#142D27] font-serif">
                {page.content.grammarBox.ruleName}
              </h3>
            </div>
            <p className="text-xs font-serif text-[#2E4A41] leading-relaxed">
              <strong>تعریف: </strong>
              {page.content.grammarBox.definition}
            </p>
            <div className="space-y-1 text-xs">
              <strong className="text-emerald-900 block font-bold">ارکان و اجزاء:</strong>
              <ul className="space-y-1 list-none pr-2">
                {page.content.grammarBox.elements.map((el, idx) => (
                  <li key={idx} className="p-1 rounded bg-[#F2F6F4] text-xs font-serif text-[#1F3A32]">
                    {el}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-1 text-xs pt-1 border-t border-emerald-100">
              <strong className="text-emerald-900 block font-bold">امتحانی مثالیں:</strong>
              {page.content.grammarBox.examples.map((ex, idx) => (
                <p key={idx} className="text-xs font-serif text-[#2E4A41] italic">
                  {ex}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* BISE DG Khan 30-Marks Test Paper */}
        {page.content.testPaper && (
          <div className="p-4 bg-white rounded-2xl border border-[#D5DDD8] space-y-3 shadow-sm">
            <div className="text-center pb-2 border-b border-[#D5DDD8]">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                BISE Dera Ghazi Khan Daily Standard
              </span>
              <h3 className="font-bold text-sm text-[#142D27]">
                کل نمبر: {page.content.testPaper.totalMarks} &bull; کل وقت: {page.content.testPaper.timeAllowed}
              </h3>
            </div>

            {/* Objective */}
            <div className="space-y-1.5 text-xs">
              <strong className="text-emerald-800 block uppercase font-bold text-[11px]">
                حصہ اول: معروضی کثیر الانتخابی سوالات
              </strong>
              {page.content.testPaper.objectiveSection.map((item, idx) => (
                <div key={idx} className="p-2 rounded bg-zinc-50 border border-zinc-200">
                  <p className="font-bold text-zinc-900 font-serif">{item.q}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    {item.opts.map((op, oIdx) => (
                      <span key={oIdx} className="text-zinc-600">
                        {op}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Subjective */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-[#D5DDD8]">
              <strong className="text-emerald-800 block uppercase font-bold text-[11px]">
                حصہ دوم: انشائیہ سوالات (مختصر و تفصیلی)
              </strong>
              {page.content.testPaper.subjectiveShortSection.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-[#F2F6F4] rounded">
                  <span className="font-serif">{item.q}</span>
                  <span className="font-bold text-emerald-800 shrink-0 font-mono text-[10px]">({item.marks} نمبر)</span>
                </div>
              ))}
              {page.content.testPaper.subjectiveLongSection.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-[#F2F6F4] rounded">
                  <span className="font-serif font-bold">{item.q}</span>
                  <span className="font-bold text-emerald-800 shrink-0 font-mono text-[10px]">({item.marks} نمبر)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Marking Rubric & Examiner Guidance */}
        {page.content.markingRubric && (
          <div className="p-4 bg-white rounded-2xl border border-[#D5DDD8] space-y-3 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>ایگزامینر چیکنگ کے رہنما اصول اور نمبروں کی تقسیم</span>
            </h4>
            <div className="space-y-2 text-xs">
              {page.content.markingRubric.map((rubric, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#F7F9F8] border border-[#D5DDD8] space-y-1">
                  <div className="flex justify-between font-bold text-[#142D27]">
                    <span>{rubric.criteria}</span>
                    <span className="text-emerald-800 font-mono text-[11px]">{rubric.marksAllocated}</span>
                  </div>
                  <p className="text-[11px] text-[#39564D]">{rubric.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM RUNNING FOOTER */}
      <div className="relative z-10 pt-3 border-t-2 border-[#142D27]/20 flex items-center justify-between text-[10px] sm:text-[11px] text-[#557067] shrink-0 font-mono">
        <span>{page.watermarkText || 'BISE DG KHAN OFFICIAL'}</span>
        <span className="hidden sm:inline font-sans font-medium">
          مجوزہ برائے 1st Year FA-IT &bull; بورڈ سلیبس
        </span>
        <span className="font-bold text-[#142D27]">
          {isUrdu ? `صفحہ ${page.originalBookPage}` : `Page ${page.originalBookPage}`}
        </span>
      </div>
    </div>
  );
};
