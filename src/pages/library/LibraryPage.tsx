import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BookOpen,
  Upload,
  Download,
  Eye,
  Search,
  FileText,
  Trash2,
  CheckCircle,
  FileUp,
  HardDrive,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { BookItem, Subject } from '../../types';
import { useRole } from '../../hooks/useRole';
import { bookService } from '../../services/bookService';
import { subjectService } from '../../services/subjectService';
import { taskService } from '../../services/taskService';
import { emailService } from '../../services/emailService';
import { SAMPLE_BOOKS, SAMPLE_SUBJECTS } from '../../data/sampleData';

const uploadBookSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  subjectId: z.string().min(1, 'Please select a subject'),
  category: z.enum([
    'Textbook',
    'Reference Book',
    'Lecture Notes',
    'Lab Manual',
    'Exam Revision',
    'Daily Reading Log',
    'Student Notes',
  ]),
});

type UploadBookFormData = z.infer<typeof uploadBookSchema>;

export const LibraryPage: React.FC = () => {
  const { role, user } = useRole();
  const [books, setBooks] = useState<BookItem[]>(SAMPLE_BOOKS);
  const [subjects, setSubjects] = useState<Subject[]>(SAMPLE_SUBJECTS);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals & Active Actions
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'overall'>('weekly');
  const [loggingBook, setLoggingBook] = useState<BookItem | null>(null);
  const [pagesReadInput, setPagesReadInput] = useState<number>(15);
  const [isLoggingPages, setIsLoggingPages] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewBook, setPreviewBook] = useState<BookItem | null>(null);
  const [deletingBook, setDeletingBook] = useState<BookItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const getProgressPercentage = (b: BookItem, tf: 'weekly' | 'monthly' | 'overall') => {
    if (tf === 'weekly') {
      const read = b.weeklyPagesRead || 0;
      const target = b.weeklyTargetPages || 30;
      return Math.min(100, Math.round((read / target) * 100));
    }
    if (tf === 'monthly') {
      const read = b.monthlyPagesRead || 0;
      const target = b.monthlyTargetPages || 120;
      return Math.min(100, Math.round((read / target) * 100));
    }
    const current = b.currentPage || 0;
    const total = b.totalPages || 300;
    return Math.min(100, Math.round((current / total) * 100));
  };

  const getProgressLabel = (b: BookItem, tf: 'weekly' | 'monthly' | 'overall') => {
    if (tf === 'weekly') {
      return `${b.weeklyPagesRead || 0} / ${b.weeklyTargetPages || 30} pages this week`;
    }
    if (tf === 'monthly') {
      return `${b.monthlyPagesRead || 0} / ${b.monthlyTargetPages || 120} pages this month`;
    }
    return `${b.currentPage || 0} / ${b.totalPages || 300} pages total`;
  };

  const handleOpenLogPages = (b: BookItem) => {
    setLoggingBook(b);
    setPagesReadInput(15);
  };

  const handleSavePageLog = async () => {
    if (!loggingBook) return;
    setIsLoggingPages(true);
    await new Promise((r) => setTimeout(r, 450));
    const added = Number(pagesReadInput) || 1;
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== loggingBook.id) return b;
        const newCurrent = Math.min(b.totalPages || 500, (b.currentPage || 0) + added);
        const newWeekly = (b.weeklyPagesRead || 0) + added;
        const newMonthly = (b.monthlyPagesRead || 0) + added;
        return {
          ...b,
          currentPage: newCurrent,
          weeklyPagesRead: newWeekly,
          monthlyPagesRead: newMonthly,
        };
      })
    );
    setIsLoggingPages(false);
    setLoggingBook(null);
    setSuccessToast(`Recorded +${added} pages for "${loggingBook.title}"! Progress updated.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  useEffect(() => {
    let mounted = true;
    Promise.all([
      bookService.fetchBooks(),
      subjectService.fetchSubjects(),
    ]).then(([booksData, subjectsData]) => {
      if (mounted) {
        if (booksData && booksData.length > 0) setBooks(booksData);
        if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadBookFormData>({
    resolver: zodResolver(uploadBookSchema),
    defaultValues: {
      title: '',
      description: '',
      subjectId: 'sub_01',
      category: 'Textbook',
    },
  });

  const categories = [
    'all',
    'Textbook',
    'Reference Book',
    'Lecture Notes',
    'Lab Manual',
    'Exam Revision',
    'Daily Reading Log',
    'Student Notes',
  ] as const;

  const filteredBooks = books.filter((book) => {
    const matchesSubject = selectedSubject === 'all' || book.subjectId === selectedSubject;
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesCategory && matchesSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'docx', 'doc', 'epub', 'zip'].includes(ext || '')) {
        setFileError('Invalid file format. Please upload PDF, Word (DOCX), EPUB or ZIP.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setFileError('File size exceeds the 50 MB threshold.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const onUploadSubmit = async (data: UploadBookFormData) => {
    if (!selectedFile) {
      setFileError('Please attach a document file.');
      return;
    }

    setIsUploading(true);
    const { book, error } = await bookService.uploadBook({
      title: data.title,
      description: data.description,
      subjectId: data.subjectId,
      category: data.category,
      file: selectedFile,
      uploadedBy: user?.id,
    });

    setIsUploading(false);

    if (error) {
      alert(`Upload error: ${error.message}`);
      return;
    }

    if (book) {
      setBooks((prev) => [book, ...prev]);
    }

    // Auto-generate daily tasks across weekdays with Sunday OFF
    const selectedSubj = subjects.find((s) => s.id === data.subjectId);
    taskService.generateDailyTasksFromSource({
      sourceType: 'book_pdf',
      sourceTitle: data.title,
      subjectId: data.subjectId,
      subjectName: selectedSubj?.name || 'Academic Subject',
      subjectCode: selectedSubj?.code || 'SUBJ-101',
      totalPagesOrTopics: 120,
      startPage: 1,
    });

    // Automated email roadmap dispatch to student Gmail
    const studentGmail = emailService.getStudentConfiguredEmail();
    const teacherGmail = emailService.getTeacherConfiguredEmail();
    emailService.sendManualDirectEmail({
      senderEmail: teacherGmail,
      senderName: user?.name || 'Ahmad WebCore',
      recipientEmail: studentGmail,
      recipientName: 'Bilal Ahmad (Student)',
      subject: `📖 New Weekly Study Roadmap: ${data.title}`,
      message: `Daily textbook study targets have been generated for "${data.title}" across Monday through Saturday.\n\n• Subject: ${selectedSubj?.name || 'Academic Subject'}\n• Weekly Structure: Monday–Saturday active study, Sunday strictly OFF\n• Pakistan Holiday Policy: Gazetted public holidays are observed with zero homework.\n\nLog in to your StudyHub student portal to track progress and submit notes.`,
      category: 'system',
    });

    setIsUploadModalOpen(false);
    reset();
    setSelectedFile(null);
    setSuccessToast(`"${data.title}" added & daily study tasks automated with Sunday OFF! Gmail dispatched.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleGenerateTasksFromBook = (b: BookItem) => {
    taskService.generateDailyTasksFromSource({
      sourceType: 'book_pdf',
      sourceTitle: b.title,
      subjectId: b.subjectId,
      subjectName: b.subjectName,
      subjectCode: b.subjectCode,
      totalPagesOrTopics: b.totalPages || 120,
      startPage: b.currentPage || 1,
    });

    const studentGmail = emailService.getStudentConfiguredEmail();
    const teacherGmail = emailService.getTeacherConfiguredEmail();
    emailService.sendManualDirectEmail({
      senderEmail: teacherGmail,
      senderName: 'Ahmad WebCore',
      recipientEmail: studentGmail,
      recipientName: 'Bilal Ahmad (Student)',
      subject: `📖 Study Target Assigned: ${b.title}`,
      message: `Daily reading targets are scheduled for ${b.title}.\n\n• Subject: ${b.subjectName}\n• Daily Pace: Active targets on weekdays, Sunday strictly OFF.\n\nPlease check your Weekly Tasks desk.`,
      category: 'system',
    });

    setSuccessToast(`Daily study tasks generated for "${b.title}" (Sunday OFF)! Gmail notification sent.`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  const handleDownload = async (book: BookItem) => {
    const { signedUrl, error } = await bookService.getSignedDownloadUrl(book.fileUrl);
    if (error || !signedUrl) {
      alert('Could not generate secure download link. Please verify your connection.');
      return;
    }
    if (signedUrl.startsWith('#')) {
      alert(`[Demo Mode] Initiating download for "${book.fileName}" (${book.fileSize})`);
      return;
    }
    window.open(signedUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    const { success, error } = await bookService.deleteBook(deletingBook.id);
    if (!success || error) {
      alert(`Failed to delete document: ${error?.message}`);
      return;
    }
    setBooks((prev) => prev.filter((b) => b.id !== deletingBook.id));
    const title = deletingBook.title;
    setDeletingBook(null);
    setSuccessToast(`"${title}" deleted from library.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold shadow-subtle animate-in slide-in-from-top duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            {successToast}
          </span>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142D27]">Digital Book & Material Library</h1>
            <Badge variant="primary" size="sm" dot>
              {books.length} Certified Volumes
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Standard textbooks, laboratory manuals, reference treatises, and downloadable lecture notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role === 'student' ? (
            <Button
              variant="outline"
              icon={<FileUp className="w-4 h-4 text-[#14B866]" />}
              onClick={() => setIsUploadModalOpen(true)}
              className="bg-white border-[#e1ede7]"
            >
              Upload PDF / Reading Notes
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<FileUp className="w-4 h-4" />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Study Material
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search textbooks, author, reference manual or subject..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
          />
        </div>

        {/* Subject Filter Select */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter library materials by subject"
          className="h-11 px-3.5 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
        >
          <option value="all">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Category Pills & Timeframe Switcher Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#142D27] text-white'
                  : 'bg-white border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8]'
              }`}
            >
              {cat === 'all' ? 'All Document Types' : cat}
            </button>
          ))}
        </div>

        {/* Weekly vs Monthly Progress Tracker Mode */}
        <div className="flex items-center p-1 rounded-xl bg-white border border-[#e1ede7] self-start md:self-auto shrink-0">
          <span className="text-[11px] font-bold text-[#7d9990] px-2 uppercase tracking-wider">
            Tracker:
          </span>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              timeframe === 'weekly'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:text-[#142D27]'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              timeframe === 'monthly'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:text-[#142D27]'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setTimeframe('overall')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              timeframe === 'overall'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:text-[#142D27]'
            }`}
          >
            Total Book
          </button>
        </div>
      </div>

      {/* Books Bento Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <Card key={book.id} hoverable className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E7EFEA] text-[#142D27]">
                    {book.subjectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700">
                      {book.fileType.toUpperCase()}
                    </span>
                    <Badge variant="neutral" size="sm">
                      v{book.version}.0
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] border border-[#14B866]/30 flex items-center justify-center shrink-0 text-[#14B866]">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#142D27] line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-[#557067] mt-0.5">{book.subjectName}</p>
                  </div>
                </div>

                <p className="text-xs text-[#557067] mt-3 line-clamp-2 leading-relaxed bg-[#F7F9F8] p-2.5 rounded-xl border border-[#e1ede7]">
                  {book.description}
                </p>

                {/* Circular Progress Tracker for this week / month */}
                <div className="mt-3.5 p-3 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CircularProgress
                      percentage={getProgressPercentage(book, timeframe)}
                      size={44}
                      strokeWidth={4}
                    />
                    <div>
                      <p className="text-[11px] font-bold text-[#142D27] leading-tight">
                        {timeframe === 'weekly'
                          ? 'This Week Progress'
                          : timeframe === 'monthly'
                          ? 'This Month Target'
                          : 'Book Completion'}
                      </p>
                      <p className="text-[10px] text-[#557067] mt-0.5">
                        {getProgressLabel(book, timeframe)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenLogPages(book)}
                    className="text-[11px] font-bold text-[#14B866] hover:text-[#109653] px-2 py-1 bg-white border border-[#e1ede7] rounded-lg transition-colors cursor-pointer"
                    title="Log pages read today"
                  >
                    + Log Pages
                  </button>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-3 text-[11px] text-[#7d9990]">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-[#14B866]" />
                    {book.fileSize}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    {book.uploadedAt}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#e1ede7] flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-3.5 h-3.5 text-[#14B866]" />}
                  onClick={() => setPreviewBook(book)}
                >
                  Preview
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    title="Generate Daily Tasks (Sunday OFF)"
                    onClick={() => handleGenerateTasksFromBook(book)}
                  >
                    + Tasks
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownload(book)}
                  >
                    Download
                  </Button>

                  {role === 'teacher' && (
                    <button
                      onClick={() => setDeletingBook(book)}
                      aria-label="Delete document"
                      className="p-1.5 rounded-lg border border-[#e1ede7] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-[#14B866]" />}
          title="No Digital Books Found"
          description="No reading materials match your search query or selected discipline."
          actionLabel="Reset Search & Filters"
          onAction={() => {
            setSearchTerm('');
            setSelectedSubject('all');
            setSelectedCategory('all');
          }}
        />
      )}

      {/* Upload Book Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Academic Document to Library"
        description="Attach PDF textbooks, Word syllabi, or laboratory manuals for cohort distribution."
      >
        <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Document Title</label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Modern Quantum Mechanics & Operator Algebra"
              className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Subject</label>
              <select
                {...register('subjectId')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Classification</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] bg-white"
              >
                <option value="Textbook">Textbook</option>
                <option value="Reference Book">Reference Book</option>
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Exam Revision">Exam Revision</option>
                <option value="Daily Reading Log">Daily Reading Log</option>
                <option value="Student Notes">Student Notes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">Description / Summary</label>
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Key theoretical concepts, syllabus mapping, or edition notice..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
            />
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#142D27] mb-1">
              Select Document File (PDF, DOCX, EPUB - Max 50 MB)
            </label>
            <div className="border-2 border-dashed border-[#e1ede7] hover:border-[#14B866] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-[#F7F9F8]">
              <input
                type="file"
                id="library-file-input"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.epub,.zip"
                className="hidden"
              />
              <label htmlFor="library-file-input" className="cursor-pointer block space-y-1">
                <Upload className="w-6 h-6 text-[#14B866] mx-auto mb-1" />
                <p className="text-xs font-semibold text-[#142D27]">
                  {selectedFile ? selectedFile.name : 'Click to select document'}
                </p>
                <p className="text-[11px] text-[#7d9990]">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB attached`
                    : 'PDF, DOCX, EPUB up to 50MB'}
                </p>
              </label>
            </div>
            {fileError && <p className="text-xs text-rose-600 mt-1">{fileError}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUploading}
              loadingText="Uploading Document..."
            >
              Upload Document
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Pages Read Modal */}
      <Modal
        isOpen={!!loggingBook}
        onClose={() => setLoggingBook(null)}
        title="Log Reading Pages"
        description={loggingBook ? `Record daily reading progress for "${loggingBook.title}"` : ''}
      >
        {loggingBook && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
              <p className="text-xs text-[#557067]">Current Position:</p>
              <p className="text-sm font-bold text-[#142D27]">
                Page {loggingBook.currentPage || 0} of {loggingBook.totalPages || 300}
              </p>
              <div className="mt-2 text-xs text-[#557067] flex items-center justify-between">
                <span>This Week: {loggingBook.weeklyPagesRead || 0} pages</span>
                <span>This Month: {loggingBook.monthlyPagesRead || 0} pages</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Pages Read Today:
              </label>
              <input
                type="number"
                min="1"
                max="250"
                value={pagesReadInput}
                onChange={(e) => setPagesReadInput(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full h-10 px-3 rounded-xl border border-[#e1ede7] text-xs font-bold text-[#263B35]"
              />
              <p className="text-[11px] text-[#7d9990] mt-1">
                Progress bookmark will advance to Page {(loggingBook.currentPage || 0) + (Number(pagesReadInput) || 0)}.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLoggingBook(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSavePageLog}
                isLoading={isLoggingPages}
                loadingText="Saving Progress..."
              >
                Save Reading Progress
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Document Reader / Preview Modal */}
      <Modal
        isOpen={!!previewBook}
        onClose={() => setPreviewBook(null)}
        title={previewBook?.title || 'Document Reader'}
        description={`Published in ${previewBook?.subjectName} (${previewBook?.category}).`}
      >
        {previewBook && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#e8f8f0]/50 border border-[#14B866]/30 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#14B866] bg-white px-2 py-0.5 rounded">
                  {previewBook.category}
                </span>
                <h4 className="text-sm font-bold text-[#142D27] mt-1.5">{previewBook.title}</h4>
                <p className="text-xs text-[#557067] mt-1">{previewBook.description}</p>
              </div>
              <Badge variant="primary" size="sm">
                v{previewBook.version}.0
              </Badge>
            </div>

            {/* Simulated Reader Container */}
            <div className="p-6 rounded-2xl bg-white border border-[#e1ede7] text-center space-y-3 shadow-subtle">
              <div className="w-12 h-12 rounded-2xl bg-[#E7EFEA] flex items-center justify-center mx-auto text-[#142D27]">
                <FileText className="w-6 h-6 text-[#14B866]" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-[#142D27]">{previewBook.fileName}</h5>
                <p className="text-[11px] text-[#7d9990] mt-0.5">
                  Certified Academic File &bull; {previewBook.fileSize} &bull; Stored in private Supabase bucket
                </p>
              </div>
              <p className="text-xs text-[#557067] max-w-sm mx-auto leading-relaxed italic">
                "Previewing authenticated chapter excerpts and verified mathematical derivations."
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={() => setPreviewBook(null)}>
                Close Reader
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => handleDownload(previewBook)}
              >
                Download Full Book ({previewBook.fileSize})
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        title="Confirm Document Removal"
        description="Are you sure you wish to remove this book from the digital library?"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#557067] leading-relaxed">
            Removing <strong>"{deletingBook?.title}"</strong> will revoke student access to this document and delete the storage record. This action cannot be undone.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeletingBook(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
