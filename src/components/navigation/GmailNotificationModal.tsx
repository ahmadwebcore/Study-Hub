import React, { useState, useEffect } from 'react';
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Calendar,
  Award,
  ChevronRight,
  Sparkles,
  Inbox,
  ArrowLeft,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { emailService, EmailMessage } from '../../services/emailService';

interface GmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedEmailId?: string;
}

export const GmailNotificationModal: React.FC<GmailNotificationModalProps> = ({
  isOpen,
  onClose,
  initialSelectedEmailId,
}) => {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [recipientFilter, setRecipientFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [testEmailAddress, setTestEmailAddress] = useState<string>('bilal.student@gmail.com');
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'dispatch_test'>('inbox');

  const refreshEmails = () => {
    const list = emailService.getEmails(recipientFilter);
    setEmails(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshEmails();
      if (initialSelectedEmailId) {
        const found = emailService.getEmailById(initialSelectedEmailId);
        if (found) setSelectedEmail(found);
      }
    }
  }, [isOpen, initialSelectedEmailId, recipientFilter]);

  const handleSelectEmail = (em: EmailMessage) => {
    emailService.markEmailAsRead(em.id);
    setSelectedEmail(em);
    refreshEmails();
  };

  const handleDeleteEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    emailService.deleteEmail(id);
    if (selectedEmail?.id === id) {
      setSelectedEmail(null);
    }
    refreshEmails();
  };

  // Test Dispatches
  const triggerPassingMarksAlert = () => {
    const em = emailService.sendGradeResultEmail({
      studentEmail: testEmailAddress,
      studentName: 'Bilal Ahmad',
      teacherName: 'Ahmad WebCore',
      testTitle: 'Vector Calculus & Multivariable Systems Exam',
      subjectName: 'Advanced Calculus & Vectors (MATH-301)',
      score: 47,
      maxScore: 50,
      passingMarks: 25,
      feedback: 'Outstanding mastery of partial derivatives and surface integrals! Certified Passing Grade Awarded.',
    });
    setDispatchFeedback(`Dispatched Passing Marks (47/50 - PASS) alert to ${testEmailAddress}!`);
    refreshEmails();
    setSelectedEmail(em);
    setActiveTab('inbox');
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const triggerNewTestAlert = () => {
    const em = emailService.sendNewTestAlert({
      studentEmail: testEmailAddress,
      studentName: 'Bilal Ahmad',
      teacherName: 'Ahmad WebCore',
      testTitle: 'Electrodynamics & Relativity Assessment',
      subjectName: 'Quantum Physics (PHY-201)',
      date: 'Nov 18, 2026',
      time: '03:00 PM',
      durationMinutes: 90,
      totalMarks: 50,
      passingMarks: 25,
      syllabusCoverage: 'Maxwell equations, Lorentz transformations, relativistic momentum.',
      instructions: 'Bring your official formula booklet and graphic calculator.',
    });
    setDispatchFeedback(`Dispatched New Test Alert for Electrodynamics to ${testEmailAddress}!`);
    refreshEmails();
    setSelectedEmail(em);
    setActiveTab('inbox');
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const triggerDeadlineReminder = () => {
    const em = emailService.sendDeadlineReminder({
      studentEmail: testEmailAddress,
      studentName: 'Bilal Ahmad',
      itemTitle: 'Organic Chemistry Synthesis Assignment #4',
      itemType: 'assignment',
      subjectName: 'Organic Chemistry (CHEM-102)',
      dueDate: 'Tomorrow at 11:59 PM',
      instructions: 'Upload your handwritten mechanism steps as a scanned PDF.',
    });
    setDispatchFeedback(`Dispatched 24h Deadline Countdown Reminder to ${testEmailAddress}!`);
    refreshEmails();
    setSelectedEmail(em);
    setActiveTab('inbox');
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const triggerInvitationEmail = () => {
    const em = emailService.sendInvitationEmail({
      studentEmail: testEmailAddress,
      studentName: 'Bilal Ahmad',
      teacherName: 'Ahmad WebCore',
      inviteToken: `sh_inv_${Math.floor(100000 + Math.random() * 900000)}`,
      course: 'Advanced STEM Honors (2026-2027)',
      board: 'Cambridge International Examination (CIE)',
    });
    setDispatchFeedback(`Dispatched Faculty Invitation Token to ${testEmailAddress}!`);
    refreshEmails();
    setSelectedEmail(em);
    setActiveTab('inbox');
    setTimeout(() => setDispatchFeedback(null), 4000);
  };

  const filteredEmails = emails.filter((e) => {
    if (categoryFilter === 'all') return true;
    return e.category === categoryFilter;
  });

  const getCategoryBadge = (cat: EmailMessage['category']) => {
    switch (cat) {
      case 'grade_result':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Award className="w-3 h-3 text-emerald-600" />
            Passed / Graded
          </span>
        );
      case 'new_test':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            <Calendar className="w-3 h-3 text-sky-600" />
            New Test
          </span>
        );
      case 'deadline_reminder':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3 h-3 text-rose-600" />
            24h Deadline
          </span>
        );
      case 'invitation':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Mail className="w-3 h-3 text-purple-600" />
            Faculty Invite
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gmail Notification & Alert Center"
      description="Automated notifications sent directly to students' registered Gmail addresses"
      maxWidth="xl"
    >
      {/* Dispatch feedback toast */}
      {dispatchFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 mb-3 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{dispatchFeedback}</span>
        </div>
      )}

      {/* Modal Navigation Tabs & Recipient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e1ede7] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('inbox');
              setSelectedEmail(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'inbox'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:bg-[#F7F9F8]'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Simulated Gmail Inbox</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {filteredEmails.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch_test')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'dispatch_test'
                ? 'bg-[#142D27] text-white'
                : 'text-[#557067] hover:bg-[#F7F9F8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Test Dispatches & Triggers</span>
          </button>
        </div>

        {activeTab === 'inbox' && (
          <div className="flex items-center gap-2">
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="text-xs bg-[#F7F9F8] border border-[#e1ede7] rounded-lg px-2 py-1 text-[#263B35] focus:outline-none"
              aria-label="Filter emails by recipient"
            >
              <option value="all">All Student Accounts</option>
              <option value="bilal.student@gmail.com">bilal.student@gmail.com</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-[#F7F9F8] border border-[#e1ede7] rounded-lg px-2 py-1 text-[#263B35] focus:outline-none"
              aria-label="Filter emails by category"
            >
              <option value="all">All Alerts</option>
              <option value="grade_result">Passing Marks / Graded</option>
              <option value="new_test">New Test Scheduled</option>
              <option value="deadline_reminder">24h Deadline Reminders</option>
              <option value="invitation">Teacher Invitations</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="pt-3 min-h-[440px] max-h-[580px] overflow-y-auto">
        {activeTab === 'dispatch_test' ? (
          <div className="space-y-4">
            <div className="bg-[#F7F9F8] border border-[#e1ede7] rounded-2xl p-4">
              <label className="block text-xs font-bold text-[#142D27] uppercase tracking-wider mb-1.5">
                Target Student Gmail Address:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="bilal.student@gmail.com"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#e1ede7] bg-white focus:outline-none focus:border-[#14B866]"
                />
              </div>
              <p className="text-[11px] text-[#7d9990] mt-1.5">
                Simulate exact automated email notifications dispatched to this student's Google Mail.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Trigger 1: Passing Marks Alert */}
              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Passing Marks Alert
                    </span>
                    <Badge variant="primary" size="sm">
                      Automatic
                    </Badge>
                  </div>
                  <p className="text-xs text-[#557067] leading-relaxed mb-3">
                    Dispatched to student's Gmail whenever teacher saves marks & passing benchmark is achieved (e.g. 47/50 - Grade A+).
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={triggerPassingMarksAlert}
                  className="w-full text-xs"
                >
                  Dispatch Passing Marks Mail
                </Button>
              </div>

              {/* Trigger 2: New Test Alert */}
              <div className="p-4 rounded-2xl border border-sky-200 bg-sky-50/40 hover:bg-sky-50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      New Test Scheduled
                    </span>
                    <Badge variant="neutral" size="sm">
                      Calendar Trigger
                    </Badge>
                  </div>
                  <p className="text-xs text-[#557067] leading-relaxed mb-3">
                    Sends full syllabus coverage, date, time, duration, and instructions to enrolled student's Gmail.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerNewTestAlert}
                  className="w-full text-xs border-sky-300 text-sky-800 hover:bg-sky-100"
                >
                  Dispatch Test Schedule Mail
                </Button>
              </div>

              {/* Trigger 3: 24h Deadline Reminder */}
              <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-600" />
                      24h Deadline Countdown
                    </span>
                    <Badge variant="danger" size="sm">
                      Urgent Alert
                    </Badge>
                  </div>
                  <p className="text-xs text-[#557067] leading-relaxed mb-3">
                    Notifies student that their scheduled test or written assignment is due in 24 hours.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerDeadlineReminder}
                  className="w-full text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
                >
                  Dispatch 24h Reminder Mail
                </Button>
              </div>

              {/* Trigger 4: Teacher Invitation */}
              <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-purple-600" />
                      Teacher Faculty Invitation
                    </span>
                    <Badge variant="neutral" size="sm">
                      Secure Token
                    </Badge>
                  </div>
                  <p className="text-xs text-[#557067] leading-relaxed mb-3">
                    Teacher sends official invitation link and one-time key directly to student's Gmail to establish connection.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerInvitationEmail}
                  className="w-full text-xs border-purple-300 text-purple-800 hover:bg-purple-100"
                >
                  Dispatch Faculty Invite Mail
                </Button>
              </div>
            </div>
          </div>
        ) : selectedEmail ? (
          /* Email Reader View */
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#e1ede7] pb-3">
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-xs font-bold text-[#142D27] hover:text-[#14B866] flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#F7F9F8] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Gmail Inbox</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Simulated Gmail Header */}
            <div className="bg-[#F7F9F8] border border-[#e1ede7] rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#142D27] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedEmail.senderName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#142D27]">
                      {selectedEmail.subject}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#557067] mt-1">
                      <span>
                        <strong>From:</strong> {selectedEmail.senderName} &lt;{selectedEmail.senderEmail}&gt;
                      </span>
                      <span>
                        <strong>To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.recipientEmail}&gt;
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-[#7d9990]">{selectedEmail.sentAt}</span>
                  <div className="mt-1">{getCategoryBadge(selectedEmail.category)}</div>
                </div>
              </div>
            </div>

            {/* Email HTML Body preview */}
            <div
              className="border border-[#e1ede7] rounded-2xl p-4 bg-white overflow-hidden shadow-subtle"
              dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
            />
          </div>
        ) : (
          /* Email List View */
          <div>
            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-10 h-10 text-[#7d9990] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold text-[#142D27]">No messages found</p>
                <p className="text-xs text-[#557067] mt-1">
                  Try triggering a test email or check other categories.
                </p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveTab('dispatch_test')}
                  >
                    Open Dispatch Tester
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#e1ede7] border border-[#e1ede7] rounded-2xl overflow-hidden bg-white">
                {filteredEmails.map((em) => (
                  <div
                    key={em.id}
                    onClick={() => handleSelectEmail(em)}
                    className={`p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-[#F7F9F8] cursor-pointer transition-colors ${
                      !em.read ? 'bg-[#e8f8f0]/30 font-medium' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          !em.read ? 'bg-[#14B866]' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#142D27] truncate">
                            {em.senderName}
                          </span>
                          <span className="text-[10px] text-[#7d9990]">
                            &lt;{em.recipientEmail}&gt;
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#263B35] truncate mt-0.5">
                          {em.subject}
                        </p>
                        <p className="text-xs text-[#557067] truncate mt-0.5">
                          {em.previewText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:block">{getCategoryBadge(em.category)}</div>
                      <span className="text-[11px] text-[#7d9990] whitespace-nowrap">
                        {em.sentAt}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#7d9990]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#e1ede7] pt-3 mt-4 flex items-center justify-between text-xs text-[#7d9990]">
        <span>StudyHub Notification Gateway • Live Simulation Engine</span>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
