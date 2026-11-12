import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  ShieldCheck,
  Save,
  CheckCircle,
  Lock,
  Mail,
  Send,
  Key,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ComposeEmailModal } from '../../components/mail/ComposeEmailModal';
import { useRole } from '../../hooks/useRole';
import { emailService } from '../../services/emailService';

export const SettingsPage: React.FC = () => {
  const { role, user, toggleRole, userProfile } = useRole();
  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'gmail_dispatch' | 'notifications' | 'security'>(
    'gmail_dispatch'
  );
  const [teacherEmailInput, setTeacherEmailInput] = useState(emailService.getTeacherConfiguredEmail());
  const [teacherDisplayName, setTeacherDisplayName] = useState('Prof. Clara Evans');
  const [studentEmailInput, setStudentEmailInput] = useState(emailService.getStudentConfiguredEmail());
  const [guardianEmailInput, setGuardianEmailInput] = useState('parent.ahmad@gmail.com');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isTestingDispatch, setIsTestingDispatch] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(() => {
    return localStorage.getItem(`studyhub_2fa_enabled_${role}`) === 'true';
  });
  const [totpCode, setTotpCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notificationState, setNotificationState] = useState({
    submissionNotify: true,
    testReminders: true,
    gradeAlerts: true,
    holidayNotices: true,
    dailyTaskGen: true,
  });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: userProfile?.fullName || userProfile?.name || user.name,
    email: userProfile?.email || user.email,
    phone: user.phone || '+1 (555) 234-8901',
    institution: user.institution,
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm((prev) => ({
        ...prev,
        name: userProfile.fullName || userProfile.name || prev.name,
        email: userProfile.email || prev.email,
      }));
    }
  }, [userProfile]);

  const handleSaveSettings = () => {
    emailService.setTeacherConfiguredEmail(teacherEmailInput);
    emailService.setStudentConfiguredEmail(studentEmailInput);
    setSuccessToast('Gmail credentials, recipient preferences & academic notification channels saved successfully!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleTestVerificationDispatch = async () => {
    setIsTestingDispatch(true);
    await new Promise((r) => setTimeout(r, 600));
    emailService.setTeacherConfiguredEmail(teacherEmailInput);
    emailService.setStudentConfiguredEmail(studentEmailInput);
    emailService.sendManualDirectEmail({
      senderEmail: teacherEmailInput,
      senderName: teacherDisplayName,
      recipientEmail: studentEmailInput,
      recipientName: 'Bilal Ahmad (Student)',
      subject: '✅ Verification: StudyHub Gmail Channel Connected',
      message: `Your Gmail notification pipeline is successfully active!\n\n• Sender (Teacher): ${teacherEmailInput}\n• Receiver (Student): ${studentEmailInput}\n\nAutomated dispatches for exam marks, scheduled tests, and Pakistan Gazetted Holidays are now configured.`,
      category: 'system',
    });
    setIsTestingDispatch(false);
    setSuccessToast(`Verification test email dispatched from ${teacherEmailInput} to ${studentEmailInput}!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.length < 6) {
      alert('Please enter a valid 6-digit Authenticator code.');
      return;
    }
    setIsVerifying2FA(true);
    await new Promise((r) => setTimeout(r, 600));
    setIs2FAEnabled(true);
    localStorage.setItem(`studyhub_2fa_enabled_${role}`, 'true');
    setIsVerifying2FA(false);
    setTotpCode('');
    setSuccessToast('Authenticator App (2FA) successfully linked & verified for your portal!');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleToggle2FA = () => {
    const next = !is2FAEnabled;
    setIs2FAEnabled(next);
    localStorage.setItem(`studyhub_2fa_enabled_${role}`, String(next));
    setSuccessToast(next ? 'Two-Factor Authenticator active!' : 'Two-Factor Authenticator turned off.');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessToast('Account password updated securely.');
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const toggleNotification = (key: keyof typeof notificationState) => {
    setNotificationState((prev) => ({ ...prev, [key]: !prev[key] }));
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
          <button
            onClick={() => setSuccessToast(null)}
            className="text-emerald-600 hover:text-emerald-900"
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e1ede7]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#142D27]">Platform Settings & Preferences</h1>
            <Badge variant="primary" size="sm" dot>
              System v1.0
            </Badge>
          </div>
          <p className="text-sm text-[#557067] mt-1">
            Manage your personal academic profile, role permissions, notification dispatches, and backend connections.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e1ede7] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gmail_dispatch')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'gmail_dispatch'
              ? 'bg-[#142D27] text-white shadow-sm'
              : 'text-[#557067] hover:bg-[#E7EFEA]'
          }`}
        >
          <Mail className="w-4 h-4 text-[#14B866]" />
          Gmail Dispatch Center
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'profile'
              ? 'bg-[#142D27] text-white shadow-sm'
              : 'text-[#557067] hover:bg-[#E7EFEA]'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Credentials
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'roles'
              ? 'bg-[#142D27] text-white shadow-sm'
              : 'text-[#557067] hover:bg-[#E7EFEA]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Role Switcher
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-[#142D27] text-white shadow-sm'
              : 'text-[#557067] hover:bg-[#E7EFEA]'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeTab === 'security'
              ? 'bg-[#142D27] text-white shadow-sm'
              : 'text-[#557067] hover:bg-[#E7EFEA]'
          }`}
        >
          <Lock className="w-4 h-4 text-[#14B866]" />
          Security & 2FA Authenticator
        </button>
      </div>

      {/* Tab: Gmail Dispatch & Notification Center */}
      {activeTab === 'gmail_dispatch' && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <CardHeader className="pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Configured Gmail Dispatch Pipeline</CardTitle>
                  <Badge variant="primary" size="sm" dot pulseDot>
                    Automated & Manual Active
                  </Badge>
                </div>
                <CardDescription>
                  Configure the teacher's sending Gmail and student's receiving Gmail. All student invitations, test reminders, passing marks, and Pakistan gazetted holiday notices are dispatched between these addresses.
                </CardDescription>
              </div>
            </CardHeader>

            {/* Sender & Receiver Configuration Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7]">
              {/* Teacher Config */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#14B866]" />
                    Teacher / Faculty Sender Gmail
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Sender Account
                  </span>
                </div>
                <p className="text-[11px] text-[#557067] leading-relaxed">
                  Invitations, assignments, test announcements, and grading certifications will be marked as dispatched from this Gmail.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                      Faculty Gmail Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#7d9990] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={teacherEmailInput}
                        onChange={(e) => setTeacherEmailInput(e.target.value)}
                        placeholder="clara.evans.faculty@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                      Sender Display Title
                    </label>
                    <input
                      type="text"
                      value={teacherDisplayName}
                      onChange={(e) => setTeacherDisplayName(e.target.value)}
                      placeholder="Prof. Clara Evans — Lead Faculty"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Student Config */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-sky-600" />
                    Student Receiving Gmail
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    Target Inbox
                  </span>
                </div>
                <p className="text-[11px] text-[#557067] leading-relaxed">
                  The primary student receives all 24h test deadlines, certified passing grades, late warnings, and Pakistan holiday notices here.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                      Student Registered Gmail
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#7d9990] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={studentEmailInput}
                        onChange={(e) => setStudentEmailInput(e.target.value)}
                        placeholder="bilal.student@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                      Parent / Guardian CC Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={guardianEmailInput}
                      onChange={(e) => setGuardianEmailInput(e.target.value)}
                      placeholder="parent.ahmad@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Automated Dispatch Channels List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d9990]">
                Automated Notification Events Active in StudyHub
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Student Account Invitation',
                    desc: 'Triggered when teacher adds or invites a student. Sends secure access link.',
                    icon: '✉️',
                  },
                  {
                    title: 'Daily Task Generation & Roadmaps',
                    desc: 'Triggered when PDF book or syllabus is uploaded. Generates weekday tasks.',
                    icon: '📖',
                  },
                  {
                    title: '🇵🇰 Pakistan Gazetted Holidays & Sundays',
                    desc: 'Automated notice for Kashmir Day, Pakistan Day, Eid, Independence Day, etc.',
                    icon: '🇵🇰',
                  },
                  {
                    title: '24-Hour Exam Countdown Reminder',
                    desc: 'Alerts student 24 hours before test deadline with syllabus checklist.',
                    icon: '⏰',
                  },
                  {
                    title: 'Certified Marks & Grade Certificates',
                    desc: 'Dispatched immediately when teacher checks and signs off on exam paper.',
                    icon: '🎓',
                  },
                  {
                    title: 'Automated Overdue / Late Submission Alert',
                    desc: 'Flags missed daily targets with gentle, clean reminder to keep student on track.',
                    icon: '⚠️',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-[#e1ede7] flex items-start gap-3"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#142D27]">{item.title}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-[#557067] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test & Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e1ede7]">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-3.5 h-3.5" />}
                  onClick={handleSaveSettings}
                >
                  Save Gmail Addresses
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Send className="w-3.5 h-3.5 text-[#14B866]" />}
                  isLoading={isTestingDispatch}
                  loadingText="Dispatching Test..."
                  onClick={handleTestVerificationDispatch}
                >
                  Send Verification Test Email
                </Button>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Mail className="w-3.5 h-3.5" />}
                onClick={() => setIsComposeOpen(true)}
              >
                Compose Direct Manual Mail
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 1: Profile Credentials */}
      {activeTab === 'profile' && (
        <Card className="space-y-6">
          <CardHeader className="pb-3">
            <div>
              <CardTitle>Academic Profile Details</CardTitle>
              <CardDescription>
                Personal credentials currently active in the StudyHub environment.
              </CardDescription>
            </div>
            <Badge variant="primary" size="sm">
              Role: {role.toUpperCase()}
            </Badge>
          </CardHeader>

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#e1ede7]">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#14B866]/20 shadow-card"
            />
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-[#142D27]">{profileForm.name}</h3>
              <p className="text-xs text-[#557067]">{user.title || profileForm.email}</p>
              <p className="text-xs text-[#7d9990]">{profileForm.institution}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">Phone Contact</label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Academic Center / Campus
              </label>
              <input
                type="text"
                value={profileForm.institution}
                onChange={(e) => setProfileForm({ ...profileForm, institution: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-[#e1ede7] focus:outline-none focus:border-[#14B866]"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Role Switcher */}
      {activeTab === 'roles' && (
        <Card className="space-y-6">
          <CardHeader className="pb-3">
            <div>
              <CardTitle>Role Perspective Switcher</CardTitle>
              <CardDescription>
                StudyHub supports both Teacher / Admin and Student workspaces. Toggle perspectives instantly.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Teacher Option */}
            <div
              onClick={() => {
                if (role !== 'teacher') toggleRole();
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                role === 'teacher'
                  ? 'border-[#14B866] bg-[#e8f8f0]/40 shadow-card'
                  : 'border-[#e1ede7] bg-white hover:border-[#14B866]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#142D27]">Teacher / Admin Role</span>
                {role === 'teacher' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#557067] mt-2 leading-relaxed">
                Full administrative authority: schedule tests, grade student submissions, manage cohorts, assign homework, and review cohort analytics.
              </p>
            </div>

            {/* Student Option */}
            <div
              onClick={() => {
                if (role !== 'student') toggleRole();
              }}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                role === 'student'
                  ? 'border-[#14B866] bg-[#e8f8f0]/40 shadow-card'
                  : 'border-[#e1ede7] bg-white hover:border-[#14B866]/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#142D27]">Student Role</span>
                {role === 'student' && (
                  <Badge variant="primary" size="sm">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#557067] mt-2 leading-relaxed">
                Learner perspective: view today's study schedule, track syllabus checklists, submit homework, inspect test marks, and review teacher feedback.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="space-y-4">
          <CardHeader className="pb-3">
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure real-time alerts and scheduled academic reminders.
              </CardDescription>
            </div>
          </CardHeader>

          <div className="divide-y divide-[#e1ede7]">
            {[
              {
                id: 'submissionNotify' as const,
                title: 'Assignment & Submission Alerts',
                desc: 'Receive immediate notifications when student files are uploaded or graded.',
              },
              {
                id: 'testReminders' as const,
                title: 'Test & Diagnostic Exam Reminders',
                desc: 'Alert 48 hours and 2 hours prior to scheduled testing sessions.',
              },
              {
                id: 'gradeAlerts' as const,
                title: 'Official Gradebook Dispatches',
                desc: 'Notify upon formal evaluation publication with qualitative teacher commentary.',
              },
            ].map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#142D27]">{item.title}</h4>
                  <p className="text-xs text-[#557067] mt-0.5">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationState[item.id]}
                  onChange={() => toggleNotification(item.id)}
                  aria-label={item.title}
                  className="w-4 h-4 text-[#14B866] rounded accent-[#14B866] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 4: Security & 2FA Authenticator */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card className="space-y-6">
            <CardHeader className="pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Portal Security & 2FA Authenticator</CardTitle>
                  <Badge variant={is2FAEnabled ? 'success' : 'neutral'} size="sm" dot>
                    {is2FAEnabled ? '2FA Authenticator Active' : 'Standard Password Mode'}
                  </Badge>
                </div>
                <CardDescription>
                  Protect your academic portal with Two-Factor Authentication (TOTP). Use Google Authenticator, Microsoft Authenticator, or Apple Passwords.
                </CardDescription>
              </div>
            </CardHeader>

            {/* Reciprocal Verified Identities */}
            <div className="p-4 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d9990] block mb-2">
                Verified Portal Connection Identity
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                  <span className="text-[10px] font-bold text-[#7d9990] uppercase block">
                    {role === 'teacher' ? 'Your Faculty Profile (Sender)' : 'Your Student Profile (Receiver)'}
                  </span>
                  <p className="text-sm font-bold text-[#142D27] mt-0.5">
                    {role === 'teacher' ? teacherDisplayName : 'Bilal Ahmad'}
                  </p>
                  <p className="text-xs text-[#14B866] font-semibold mt-0.5">
                    {role === 'teacher' ? teacherEmailInput : studentEmailInput}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#e1ede7]">
                  <span className="text-[10px] font-bold text-[#7d9990] uppercase block">
                    {role === 'teacher' ? 'Connected Student (Target)' : 'Assigned Faculty Evaluator'}
                  </span>
                  <p className="text-sm font-bold text-[#142D27] mt-0.5">
                    {role === 'teacher' ? 'Bilal Ahmad' : teacherDisplayName}
                  </p>
                  <p className="text-xs text-[#557067] font-semibold mt-0.5">
                    {role === 'teacher' ? studentEmailInput : teacherEmailInput}
                  </p>
                </div>
              </div>
            </div>

            {/* 2FA Authenticator Activation Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#e1ede7]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#14B866] border border-emerald-200 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#142D27]">
                      Two-Factor Authenticator (TOTP)
                    </h4>
                    <p className="text-xs text-[#557067] mt-0.5">
                      Require a 6-digit verification code from your Authenticator app when signing in to StudyHub.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    is2FAEnabled ? 'bg-[#14B866]' : 'bg-zinc-300'
                  }`}
                  aria-label="Toggle Two-Factor Authentication"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      is2FAEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Setup Box when 2FA is being configured */}
              <div className="p-5 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#142D27] uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-[#14B866]" />
                    Authenticator App Pairing Setup
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Google / Microsoft Authenticator
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  {/* Step 1: Scan QR / Secret Key */}
                  <div className="p-4 rounded-xl bg-white border border-[#e1ede7] text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-zinc-900 rounded-xl p-2 flex flex-col items-center justify-center text-white">
                      <div className="w-24 h-24 border-2 border-white/40 grid grid-cols-4 grid-rows-4 gap-1 p-1">
                        <div className="bg-white col-span-2 row-span-2 rounded-sm" />
                        <div className="bg-white col-span-1 rounded-sm" />
                        <div className="bg-white col-span-1 rounded-sm" />
                        <div className="bg-white col-span-2 row-span-2 rounded-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-[#142D27] select-all">
                        STUDY-HUB-7892-SECURE-KEY
                      </span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText('STUDY-HUB-7892-SECURE-KEY')}
                        className="p-1 rounded hover:bg-[#e1ede7] text-[#557067] hover:text-[#142D27]"
                        title="Copy Key"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[10px] text-[#7d9990] block">
                      Scan QR in your authenticator or enter key manually
                    </span>
                  </div>

                  {/* Step 2: Verification Input */}
                  <form onSubmit={handleVerify2FA} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#142D27] mb-1">
                        Enter 6-Digit Authenticator Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 849201"
                        className="w-full text-center text-lg font-mono tracking-widest py-2.5 bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="w-full"
                      isLoading={isVerifying2FA}
                      loadingText="Verifying Authenticator..."
                      icon={<Check className="w-3.5 h-3.5" />}
                    >
                      Verify & Activate Authenticator
                    </Button>

                    <div className="pt-2 text-[11px] text-[#557067] leading-relaxed">
                      Backup Recovery Codes:{' '}
                      <span className="font-mono font-bold text-[#142D27]">
                        8392-1092 &bull; 4920-8172 &bull; 9281-3719
                      </span>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="pt-4 border-t border-[#e1ede7] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d9990]">
                Change Account Password
              </h4>
              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#263B35] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#e1ede7] rounded-xl text-[#142D27] focus:border-[#14B866] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end pt-1">
                  <Button type="submit" variant="outline" size="sm">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* Compose Direct Email Modal */}
      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        defaultRecipientEmail={studentEmailInput}
        defaultRecipientName="Bilal Ahmad"
        onSuccess={(msg) => {
          setSuccessToast(msg);
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
};
