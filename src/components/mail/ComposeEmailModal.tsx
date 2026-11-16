import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  AlertCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { emailService } from '../../services/emailService';
import { studentService } from '../../services/studentService';
import { Student } from '../../types';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientEmail?: string;
  defaultRecipientName?: string;
  onSuccess?: (feedbackText: string) => void;
}

export const ComposeEmailModal: React.FC<ComposeEmailModalProps> = ({
  isOpen,
  onClose,
  defaultRecipientEmail,
  defaultRecipientName,
  onSuccess,
}) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [senderEmail, setSenderEmail] = useState('');
  const [senderName, setSenderName] = useState('Ahmad');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'manual_notice' | 'system'>('manual_notice');
  const [isSending, setIsSending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSenderEmail(emailService.getTeacherConfiguredEmail());
      studentService.fetchStudents().then((data) => {
        if (data) setStudents(data);
      });

      if (defaultRecipientEmail) {
        setRecipientEmail(defaultRecipientEmail);
        setRecipientName(defaultRecipientName || 'Student');
      } else {
        const studentGmail = emailService.getStudentConfiguredEmail();
        setRecipientEmail(studentGmail);
        setRecipientName('Student Scholar');
      }
      setSubject('');
      setMessage('');
      setValidationError(null);
    }
  }, [isOpen, defaultRecipientEmail, defaultRecipientName]);

  const handleStudentSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const email = e.target.value;
    setRecipientEmail(email);
    const found = students.find((s) => s.email === email);
    if (found) {
      setRecipientName(found.name);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setValidationError('Please enter a valid student recipient Gmail.');
      return;
    }
    if (!subject.trim()) {
      setValidationError('Please enter an email subject.');
      return;
    }
    if (!message.trim()) {
      setValidationError('Please write a message to the student.');
      return;
    }

    setIsSending(true);
    setValidationError(null);

    // Save configured sender email if updated
    emailService.setTeacherConfiguredEmail(senderEmail);

    await new Promise((r) => setTimeout(r, 600));

    emailService.sendManualDirectEmail({
      recipientEmail,
      recipientName: recipientName || 'Student',
      subject,
      message,
      senderName,
      senderEmail,
      category,
    });

    setIsSending(false);
    onClose();

    if (onSuccess) {
      onSuccess(`Direct email successfully dispatched to ${recipientEmail}!`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compose Direct Student Email"
      maxWidth="lg"
    >
      <form onSubmit={handleSend} className="space-y-4">
        {/* Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#14B866] shrink-0" />
            <span className="font-semibold text-emerald-950">
              Dispatched directly from Teacher's configured Gmail to Student's registered Gmail inbox.
            </span>
          </div>
          <Badge variant="primary" size="sm">
            Live Dispatch
          </Badge>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Sender Info (Teacher) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
              From (Teacher's Dispatch Gmail)
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#7d9990] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="teacher.gmail@gmail.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
              Teacher Display Name
            </label>
            <div className="relative">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7d9990] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Ahmad"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Recipient Info (Student) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
              Select Enrolled Student
            </label>
            <select
              value={recipientEmail}
              onChange={handleStudentSelect}
              className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
            >
              <option value="dbaddiesvlog@gmail.com">Student Scholar (dbaddiesvlog@gmail.com)</option>
              {students
                .filter((s) => s.email !== 'dbaddiesvlog@gmail.com')
                .map((student) => (
                  <option key={student.id} value={student.email}>
                    {student.name} ({student.email})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
              To (Student Gmail)
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#7d9990] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="student.mail@gmail.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Next Week Assessment Guidance & Surface Integrals Study Notes"
            required
            className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
            Dispatch Category
          </label>
          <div className="flex gap-2">
            {[
              { id: 'manual_notice', label: 'Direct Academic Guidance' },
              { id: 'system', label: 'Important Notice' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  category === cat.id
                    ? 'bg-[#142D27] text-white border-[#142D27]'
                    : 'bg-white text-[#557067] border-[#e1ede7] hover:border-[#14B866]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-1">
            Message Body
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write clear, to-the-point guidance or notices for the student..."
            required
            className="w-full p-3 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none leading-relaxed resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e1ede7]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Send className="w-3.5 h-3.5" />}
            isLoading={isSending}
            loadingText="Dispatching to Gmail..."
          >
            Send Gmail Dispatch
          </Button>
        </div>
      </form>
    </Modal>
  );
};
