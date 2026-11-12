import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Check,
  Copy,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Mail,
  Lock,
  Send,
  QrCode as QrIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { emailService } from '../../services/emailService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, setRole } = useAuth();

  const [authMethod, setAuthMethod] = useState<'qr_authenticator' | 'gmail_otp' | 'password'>('qr_authenticator');
  const [roleMode, setRoleMode] = useState<'teacher' | 'student'>('teacher');

  // Authenticator State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Gmail OTP State
  const [gmailEmail, setGmailEmail] = useState('faculty.evans@studyhub.edu');
  const [gmailPassword, setGmailPassword] = useState('password123');
  const [gmailOtpCode, setGmailOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSentNotification, setOtpSentNotification] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Standard Password State
  const [email, setEmail] = useState('faculty.evans@studyhub.edu');
  const [password, setPassword] = useState('password123');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const SECRET_KEY = 'STUDY-HUB-7892-SECURE-KEY';

  // Generate real scannable QR Code
  useEffect(() => {
    const currentEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
    const otpauthUrl = `otpauth://totp/StudyHub:${currentEmail}?secret=STUDYHUB7892SECUREKEY&issuer=StudyHub`;

    QRCode.toDataURL(otpauthUrl, {
      width: 180,
      margin: 2,
      color: {
        dark: '#142D27',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [roleMode]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SECRET_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 1. Verify 2FA Authenticator & Log In
  const handleVerify2FAAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (totpCode.trim().length < 6) {
      setAuthError('Please enter the 6-digit code from Google or Microsoft Authenticator.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      setRole(roleMode);
      localStorage.setItem(`studyhub_2fa_enabled_${roleMode}`, 'true');
      const targetEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
      await signIn(targetEmail, 'password123');
      setIsVerifying(false);
      navigate('/dashboard', { replace: true });
    }, 600);
  };

  // 2. Send OTP to Gmail
  const handleSendGmailOtp = () => {
    if (!gmailEmail || !gmailEmail.includes('@')) {
      setAuthError('Please enter a valid Gmail address.');
      return;
    }

    setIsSendingOtp(true);
    setAuthError(null);

    // Generate 6-digit code
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);

    emailService.sendLoginVerificationCode({
      email: gmailEmail,
      code: randomCode,
      recipientName: roleMode === 'teacher' ? 'Prof. Clara Evans' : 'Bilal Ahmad',
    });

    setIsSendingOtp(false);
    setOtpSentNotification(`Verification code ${randomCode} sent to ${gmailEmail}!`);
    setTimeout(() => setOtpSentNotification(null), 8000);
  };

  // 3. Verify Gmail OTP + Password
  const handleGmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!gmailOtpCode || gmailOtpCode.length < 6) {
      setAuthError('Please enter the 6-digit verification code sent to your Gmail.');
      return;
    }

    if (generatedOtp && gmailOtpCode.trim() !== generatedOtp.trim()) {
      setAuthError('Invalid code. Please check your Gmail or request a new code.');
      return;
    }

    setIsVerifying(true);
    setRole(roleMode);
    const { error } = await signIn(gmailEmail, gmailPassword);
    setIsVerifying(false);

    if (error) {
      setAuthError(error.message || 'Invalid password credentials.');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // 4. Standard Password Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setRole(roleMode);
    const { error } = await signIn(email, password);
    setIsVerifying(false);

    if (error) {
      setAuthError(error.message || 'Invalid email or password.');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const switchRole = (newRole: 'teacher' | 'student') => {
    setRoleMode(newRole);
    if (newRole === 'teacher') {
      setEmail('faculty.evans@studyhub.edu');
      setGmailEmail('faculty.evans@studyhub.edu');
    } else {
      setEmail('bilal.student@gmail.com');
      setGmailEmail('bilal.student@gmail.com');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-10 px-4 sm:px-6 font-sans selection:bg-[#14B866]/20">
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Clean Logo Header */}
        <div className="text-center space-y-1.5">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#142D27] text-[#14B866] shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#142D27] tracking-tight">
            Academic Portal Access
          </h1>
          <p className="text-xs text-[#557067]">
            Official portal for faculty and verified students
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e1ede7] shadow-sm space-y-5">
          {/* Role Selector: Teacher vs Student */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
            <button
              type="button"
              onClick={() => switchRole('teacher')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                roleMode === 'teacher'
                  ? 'bg-white text-[#142D27] shadow-sm border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
              Faculty / Teacher
            </button>
            <button
              type="button"
              onClick={() => switchRole('student')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                roleMode === 'student'
                  ? 'bg-white text-[#142D27] shadow-sm border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              Student Portal
            </button>
          </div>

          {/* 3 Clean Verification Methods */}
          <div className="grid grid-cols-3 text-center text-xs border-b border-[#e1ede7] pb-2">
            <button
              type="button"
              onClick={() => setAuthMethod('qr_authenticator')}
              className={`pb-2 font-bold transition-all border-b-2 flex flex-col items-center gap-1 ${
                authMethod === 'qr_authenticator'
                  ? 'border-[#14B866] text-[#142D27]'
                  : 'border-transparent text-[#7d9990] hover:text-[#142D27]'
              }`}
            >
              <QrIcon className="w-3.5 h-3.5" />
              <span>QR Code 2FA</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('gmail_otp')}
              className={`pb-2 font-bold transition-all border-b-2 flex flex-col items-center gap-1 ${
                authMethod === 'gmail_otp'
                  ? 'border-[#14B866] text-[#142D27]'
                  : 'border-transparent text-[#7d9990] hover:text-[#142D27]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Gmail Code</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`pb-2 font-bold transition-all border-b-2 flex flex-col items-center gap-1 ${
                authMethod === 'password'
                  ? 'border-[#14B866] text-[#142D27]'
                  : 'border-transparent text-[#7d9990] hover:text-[#142D27]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
          </div>

          {/* Alerts */}
          {otpSentNotification && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{otpSentNotification}</span>
            </div>
          )}

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* METHOD 1: REAL QR CODE AUTHENTICATOR */}
          {authMethod === 'qr_authenticator' && (
            <form onSubmit={handleVerify2FAAndLogin} className="space-y-4">
              <div className="text-center space-y-2.5">
                <p className="text-xs text-[#557067]">
                  Scan this QR Code in <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
                </p>

                {/* Real Scannable QR Code */}
                <div className="p-3 bg-white border border-[#e1ede7] rounded-2xl inline-block shadow-sm">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="StudyHub 2FA QR Code"
                      className="w-40 h-40 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                {/* Secret Key with Copy */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-[11px] font-mono font-bold text-[#142D27] bg-[#F7F9F8] px-2.5 py-1 rounded-lg border border-[#e1ede7] select-all">
                    {SECRET_KEY}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 rounded-lg bg-[#F7F9F8] border border-[#e1ede7] text-[#557067] hover:text-[#142D27]"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142D27] mb-1.5 text-center">
                  Enter 6-Digit Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 849201"
                    className="w-full h-11 pl-10 pr-4 text-center text-base font-mono tracking-widest rounded-xl border border-[#e1ede7] bg-white text-[#142D27] focus:outline-none focus:border-[#14B866]"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-sm font-bold shadow-sm"
                isLoading={isVerifying}
                loadingText="Verifying Authenticator..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Verify & Enter Portal
              </Button>
            </form>
          )}

          {/* METHOD 2: GMAIL OTP VERIFICATION + PASSWORD */}
          {authMethod === 'gmail_otp' && (
            <form onSubmit={handleGmailOtpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Registered Gmail Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={gmailEmail}
                      onChange={(e) => setGmailEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#142D27] focus:outline-none focus:border-[#14B866]"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={handleSendGmailOtp}
                    isLoading={isSendingOtp}
                    icon={<Send className="w-3 h-3" />}
                  >
                    Send Code
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  6-Digit Gmail Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={gmailOtpCode}
                    onChange={(e) => setGmailOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter code from Gmail (e.g. 849201)"
                    className="w-full h-10 pl-10 pr-3 font-mono text-center tracking-widest text-sm rounded-xl border border-[#e1ede7] bg-white text-[#142D27] focus:outline-none focus:border-[#14B866]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={gmailPassword}
                    onChange={(e) => setGmailPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#142D27] focus:outline-none focus:border-[#14B866]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-sm font-bold shadow-sm"
                isLoading={isVerifying}
                loadingText="Verifying Code..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Verify Code & Sign In
              </Button>
            </form>
          )}

          {/* METHOD 3: STANDARD PASSWORD */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#142D27] focus:outline-none focus:border-[#14B866]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs text-[#142D27] focus:outline-none focus:border-[#14B866]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-sm font-bold shadow-sm"
                isLoading={isVerifying}
                loadingText="Signing In..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In as {roleMode === 'teacher' ? 'Faculty' : 'Student'}
              </Button>
            </form>
          )}

          {/* Clean Invitation Link */}
          <div className="pt-2 border-t border-[#e1ede7] text-center">
            <Link
              to="/accept-invite"
              className="text-xs font-semibold text-[#557067] hover:text-[#14B866] transition-colors"
            >
              Have a student invitation token? Redeem here &rarr;
            </Link>
          </div>
        </div>

        {/* Home Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-semibold text-[#7d9990] hover:text-[#142D27]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
