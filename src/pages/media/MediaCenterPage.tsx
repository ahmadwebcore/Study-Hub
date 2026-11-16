import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  FileText,
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Eye,
  CalendarCheck,
  CheckCircle2,
  HardDrive,
  Layers,
  FileCode,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { mediaService, MediaItem } from '../../services/mediaService';
import { taskService } from '../../services/taskService';
import { SAMPLE_SUBJECTS } from '../../data/sampleData';
import { BookOpen } from 'lucide-react';
import { PDFViewerModal } from '../../components/books/PDFViewerModal';

export const MediaCenterPage: React.FC = () => {
  const { role, profile } = useAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'docx' | 'image'>('pdf');
  const [uploadCategory, setUploadCategory] = useState<'syllabus' | 'submission' | 'image' | 'notes'>('syllabus');
  const [uploadSubjectId, setUploadSubjectId] = useState(SAMPLE_SUBJECTS[0]?.id || '');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadAutoSchedule, setUploadAutoSchedule] = useState(true);
  const [previewFileUrl, setPreviewFileUrl] = useState<string>('');

  // Item Preview Modal State
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isPdfReaderOpen, setIsPdfReaderOpen] = useState(false);

  useEffect(() => {
    loadItems();
  }, [activeCategory, searchTerm]);

  const loadItems = () => {
    const data = mediaService.getMediaItems(activeCategory, searchTerm);
    setItems(data);
  };

  const stats = mediaService.getMediaStats();

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      setUploadFileType('image');
      setUploadCategory('image');
      // Create local preview blob URL
      const url = URL.createObjectURL(file);
      setPreviewFileUrl(url);
    } else if (['doc', 'docx'].includes(ext || '')) {
      setUploadFileType('docx');
      setUploadCategory('syllabus');
    } else {
      setUploadFileType('pdf');
      setUploadCategory('syllabus');
    }
  };

  const handleCreateMediaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const selectedSubject = SAMPLE_SUBJECTS.find((s) => s.id === uploadSubjectId) || SAMPLE_SUBJECTS[0];

    mediaService.addMediaItem({
      name: uploadFileName.trim(),
      originalName: uploadFileName.trim(),
      category: uploadCategory,
      fileType: uploadFileType,
      fileUrl: previewFileUrl || (uploadFileType === 'image' ? 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop' : '/mock-materials/syllabus_document.pdf'),
      thumbnailUrl: uploadFileType === 'image' ? (previewFileUrl || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=300&auto=format&fit=crop') : undefined,
      uploadedBy: role === 'teacher' ? 'Ahmad' : (profile?.name || 'Student Scholar'),
      uploadedByRole: role,
      subjectId: selectedSubject.id,
      subjectName: selectedSubject.name,
      subjectCode: selectedSubject.code,
      description: uploadDescription.trim() || `Course resource for ${selectedSubject.name}.`,
      tasksGenerated: uploadAutoSchedule,
    });

    if (uploadAutoSchedule) {
      taskService.generateMonthlyTasksFromSource({
        sourceType: uploadFileType === 'image' ? 'screenshot' : 'document',
        sourceTitle: `${selectedSubject.name} (${uploadFileName.trim()})`,
        subjectId: selectedSubject.id,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        studentName: profile?.name || 'Student Scholar',
        totalWeeks: 4,
        dailyMinutes: 45,
      });
      setSuccessToast(`"${uploadFileName}" uploaded & 1-Month daily study tasks (Sundays OFF) scheduled!`);
    } else {
      setSuccessToast(`"${uploadFileName}" uploaded to Media Center successfully.`);
    }

    setIsUploadOpen(false);
    resetUploadForm();
    loadItems();
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const resetUploadForm = () => {
    setUploadFileName('');
    setUploadFileType('pdf');
    setUploadCategory('syllabus');
    setUploadDescription('');
    setPreviewFileUrl('');
    setUploadAutoSchedule(true);
  };

  const handleDeleteItem = (id: string, name: string) => {
    mediaService.deleteMediaItem(id);
    loadItems();
    setSuccessToast(`File "${name}" removed from Media Center.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleGenerateMonthlyTasks = (item: MediaItem) => {
    const selectedSubject = SAMPLE_SUBJECTS.find((s) => s.id === item.subjectId) || SAMPLE_SUBJECTS[0];

    taskService.generateMonthlyTasksFromSource({
      sourceType: item.fileType === 'image' ? 'screenshot' : 'document',
      sourceTitle: `${item.subjectName || selectedSubject.name} (${item.originalName})`,
      subjectId: item.subjectId || selectedSubject.id,
      subjectName: item.subjectName || selectedSubject.name,
      subjectCode: item.subjectCode || selectedSubject.code,
      studentName: profile?.name || 'Student Scholar',
      totalWeeks: 4,
      dailyMinutes: 45,
    });

    mediaService.markTasksGenerated(item.id);
    loadItems();
    setSuccessToast(`1-Month study targets generated for "${item.name}" (4 Weeks, Sundays strictly OFF)!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const getFileBadge = (type: MediaItem['fileType']) => {
    switch (type) {
      case 'image':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
            <ImageIcon className="w-3 h-3 text-violet-600" />
            Image / Screenshot
          </span>
        );
      case 'docx':
      case 'doc':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <FileCode className="w-3 h-3 text-blue-600" />
            Word Doc
          </span>
        );
      case 'pdf':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="w-3 h-3 text-rose-600" />
            PDF Document
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900 ml-4 font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              Media & Uploads Center
            </h1>
            <Badge variant="primary" size="sm" dot>
              {stats.totalCount} Files
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Central repository of all uploaded syllabus PDFs, Word roadmaps, handwritten notes & student submission screenshots.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadOpen(true)}
          className="shadow-xs"
        >
          Upload Media / Syllabus
        </Button>
      </div>

      {/* Bento Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FolderArchive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Uploads</p>
            <p className="text-lg sm:text-xl font-extrabold text-zinc-900">{stats.totalCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Storage Space</p>
            <p className="text-lg sm:text-xl font-extrabold text-zinc-900">{stats.formattedSize}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Syllabus & Docs</p>
            <p className="text-lg sm:text-xl font-extrabold text-zinc-900">{stats.docsCount}</p>
          </div>
        </Card>

        <Card className="p-4 bg-white border border-zinc-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Screenshots / Notes</p>
            <p className="text-lg sm:text-xl font-extrabold text-zinc-900">{stats.imagesCount}</p>
          </div>
        </Card>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'All Files' },
            { id: 'syllabus', label: 'Syllabus & Docs' },
            { id: 'submission', label: 'Student Work' },
            { id: 'image', label: 'Screenshots' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents or photos..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Media Items Bento Grid */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl p-6">
          <FolderArchive className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-900">No media files found</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Upload your first syllabus document, PDF roadmap, or screenshot of handwritten notes to start automated scheduling.
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)}>
              Upload First File
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="p-4 bg-white border border-zinc-200 shadow-xs hover:border-zinc-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Header / Thumbnail */}
                {item.fileType === 'image' ? (
                  <div
                    onClick={() => setPreviewItem(item)}
                    className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 cursor-pointer group mb-3 border border-zinc-200"
                  >
                    <img
                      src={item.thumbnailUrl || item.fileUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                      <Eye className="w-4 h-4" />
                      Preview Screenshot
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setPreviewItem(item)}
                    className="w-full h-24 rounded-xl bg-zinc-50 border border-zinc-200 mb-3 flex items-center justify-center cursor-pointer hover:bg-zinc-100 transition-colors p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-emerald-600">
                        {item.fileType === 'docx' ? (
                          <FileCode className="w-5 h-5 text-blue-600" />
                        ) : (
                          <FileText className="w-5 h-5 text-rose-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold text-zinc-900 block truncate max-w-[180px]">
                          {item.originalName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {item.formattedSize} &bull; Click to Inspect
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Metadata */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    {getFileBadge(item.fileType)}
                    <span className="text-[10px] text-zinc-400 font-medium">{item.uploadedAt}</span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 truncate" title={item.name}>
                    {item.name}
                  </h3>

                  {item.subjectName && (
                    <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {item.subjectName}
                    </span>
                  )}

                  {item.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions & Task Schedule Trigger */}
              <div className="mt-4 pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Uploaded by: <strong className="text-zinc-700">{item.uploadedBy}</strong></span>
                  <span className="font-semibold text-zinc-600">{item.formattedSize}</span>
                </div>

                {/* 1-Click Monthly Task Generator */}
                <div className="flex items-center gap-1.5 pt-1">
                  {item.tasksGenerated ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Monthly Tasks Active
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleGenerateMonthlyTasks(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-xl shadow-xs transition-colors"
                      title="Automatically schedules 24 daily tasks over 4 weeks with Sundays OFF"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-emerald-300" />
                      Auto-Schedule (Sundays OFF)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    aria-label="Preview document"
                    className="p-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    aria-label="Delete media item"
                    className="p-1.5 rounded-xl border border-zinc-200 hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Media & Syllabus Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Media & Syllabus Document"
        description="Add PDFs, Word roadmaps, or photos of syllabus & handwritten notes to automate daily schedules."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateMediaItem} className="space-y-4">
          {/* Step 1: File Dropzone */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Select Document or Screenshot
            </label>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50 hover:bg-emerald-50/20 hover:border-emerald-500 cursor-pointer transition-colors text-center">
              <Upload className="w-8 h-8 text-zinc-400 mb-2" />
              <span className="text-xs font-bold text-zinc-800">
                {uploadFileName || 'Click to select or drop PDF / Doc / Image'}
              </span>
              <span className="text-[11px] text-zinc-400 mt-0.5">
                Supports .pdf, .docx, .doc, .png, .jpg, .jpeg, .webp (up to 25MB)
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,image/*"
                onChange={handleFileUploadChange}
                className="hidden"
                required
              />
            </label>
          </div>

          {/* Step 2: Subject & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Academic Subject
              </label>
              <select
                value={uploadSubjectId}
                onChange={(e) => setUploadSubjectId(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                {SAMPLE_SUBJECTS.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name} ({subj.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                Media Category
              </label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value as any)}
                className="w-full h-9 px-3 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-800 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="syllabus">Syllabus & Official Roadmap</option>
                <option value="submission">Student Solution Worksheet</option>
                <option value="image">Screenshot of Notes / Book</option>
                <option value="notes">Faculty Handout / Revision</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
              Description / Chapter Coverage
            </label>
            <input
              type="text"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="e.g. FSc Part 1 Physics Chapter 1-4 syllabus breakdown"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Auto-Schedule 1-Month Daily Tasks Checkbox */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="autoScheduleTasks"
              checked={uploadAutoSchedule}
              onChange={(e) => setUploadAutoSchedule(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
            />
            <label htmlFor="autoScheduleTasks" className="text-xs cursor-pointer select-none">
              <span className="font-bold text-emerald-950 block">
                Auto-Generate 1-Month Daily Tasks (Sundays strictly OFF)
              </span>
              <span className="text-[11px] text-emerald-800 mt-0.5 block leading-relaxed">
                Breaks this document into 24 daily 45-min study targets across Monday–Saturday. Every Sunday is explicitly configured as a scheduled rest day.
              </span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save & Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* Item Inspection & Preview Modal */}
      {previewItem && (
        <Modal
          isOpen={!!previewItem}
          onClose={() => setPreviewItem(null)}
          title={previewItem.name}
          description={`${previewItem.subjectName || 'StudyHub Resource'} &bull; Uploaded on ${previewItem.uploadedAt}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {previewItem.fileType === 'image' ? (
              <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 max-h-[460px] flex items-center justify-center">
                <img
                  src={previewItem.fileUrl}
                  alt={previewItem.name}
                  className="max-h-[450px] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-200 shadow-xs mx-auto flex items-center justify-center text-emerald-600">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{previewItem.originalName}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {previewItem.formattedSize} &bull; Official LMS Certified Document
                  </p>
                </div>
                {previewItem.description && (
                  <p className="text-xs text-zinc-600 max-w-md mx-auto bg-white p-3 rounded-xl border border-zinc-200 text-left">
                    {previewItem.description}
                  </p>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
              <span className="text-[11px] text-zinc-400">
                Uploaded by {previewItem.uploadedBy}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {previewItem.fileType === 'pdf' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPdfReaderOpen(true)}
                    className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-50"
                  >
                    <BookOpen className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Open in PDF Reader
                  </Button>
                )}

                {!previewItem.tasksGenerated && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<CalendarCheck className="w-4 h-4" />}
                    onClick={() => {
                      handleGenerateMonthlyTasks(previewItem);
                      setPreviewItem(null);
                    }}
                  >
                    Schedule 1-Month Tasks (Sundays OFF)
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewItem(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
                </Modal>
      )}

      {/* Interactive PDF Reader for Media Items */}
      {isPdfReaderOpen && previewItem && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setIsPdfReaderOpen(false)}
          bookTitle={previewItem.name}
          bookCoverUrl={previewItem.thumbnailUrl || previewItem.fileUrl}
          pdfFileName={previewItem.originalName}
          subjectName={previewItem.subjectName}
          syllabusCoverage={previewItem.description}
        />
      )}
    </div>
  );
};
