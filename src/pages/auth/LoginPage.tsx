import React, { useState, useEffect, useCallback } from 'react';
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
  Ticket,
  Send,
  RefreshCw,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { twoFactorService, TwoFactorConfig } from '../../services/twoFactorService';
import { emailVerificationService } from '../../services/emailVerificationService';

type AuthStep = 'credentials' | 'verification';
type VerificationMethod = 'authenticator' | 'email';

interface Pending2FASession {
  email: string;
  roleMode: 'teacher' | 'student';
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, completeTwoFactorAuth } = useAuth();

  // Step state
  const [step, setStep] = useState<AuthStep>('credentials');
  const [roleMode, setRoleMode] = useState<'teacher' | 'student'>('teacher');

  // Step 1: Credentials Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2: Verification State
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('authenticator');
  const [tfaConfig, setTfaConfig] = useState<TwoFactorConfig | null>(null);

  // Google Authenticator State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showRecoveryInput, setShowRecoveryInput] = useState(false);
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [copiedRecovery, setCopiedRecovery] = useState(false);

  // Email Verification State
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [expiryCountdown, setExpiryCountdown] = useState(0);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [devOtpNotice, setDevOtpNotice] = useState<string | null>(null);

  // Check for restored verification session on page refresh
  useEffect(() => {
    twoFactorService.initTimeSync();

    const pending = sessionStorage.getItem('studyhub_pending_2fa');
    if (pending) {
      try {
        const parsed = JSON.parse(pending) as Pending2FASession;
        if (parsed.email && parsed.roleMode === 'teacher') {
          setVerifiedEmail(parsed.email);
          setRoleMode('teacher');
          setStep('verification');
          const config = twoFactorService.getConfig(parsed.email);
          setTfaConfig(config);
        }
      } catch {
        sessionStorage.removeItem('studyhub_pending_2fa');
      }
    }
  }, []);

  // Cooldown & Expiry Timers for Email Verification
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (expiryCountdown > 0) {
      timer = setInterval(() => {
        setExpiryCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expiryCountdown]);

  // Generate QR code only when entering enrollment mode
  const loadEnrollmentQrCode = useCallback(async (targetEmail: string, secret: string) => {
    try {
      const uri = twoFactorService.getProvisioningUri(targetEmail, secret);
      const url = await QRCode.toDataURL(uri, {
        width: 190,
        margin: 1.5,
        color: {
          dark: '#142D27',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  }, []);

  // When step changes to verification, prepare configs
  useEffect(() => {
    if (step === 'verification' && verifiedEmail) {
      const config = twoFactorService.getConfig(verifiedEmail);
      setTfaConfig(config);

      // If NOT enrolled yet, generate enrollment QR
      if (!config.isEnrolled) {
        loadEnrollmentQrCode(verifiedEmail, config.secret);
      }
    }
  }, [step, verifiedEmail, loadEnrollmentQrCode]);

  // ==========================================
  // STEP 1: VALIDATE PRIMARY CREDENTIALS
  // ==========================================
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email.trim() || !password) {
      setAuthError('Please provide both your registered email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Verify credentials strictly
      const result = await authService.validateCredentials(email, password, roleMode);

      if (!result.valid || result.error) {
        setIsSubmitting(false);
        setAuthError(result.error?.message || 'Invalid email or password. Please try again.');
        return;
      }

      // 2. Student Role: Direct access to Student Portal
      if (roleMode === 'student') {
        const { error } = await signIn(email, password, 'student');
        setIsSubmitting(false);
        if (error) {
          setAuthError(error.message);
        } else {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // 3. Faculty Role: STRICT 2FA REQUIRED
      // Save pending session state for refresh resilience
      const cleanEmail = email.trim().toLowerCase();
      setVerifiedEmail(cleanEmail);
      sessionStorage.setItem(
        'studyhub_pending_2fa',
        JSON.stringify({ email: cleanEmail, roleMode: 'teacher' })
      );

      const config = twoFactorService.getConfig(cleanEmail);
      setTfaConfig(config);

      if (!config.isEnrolled) {
        await loadEnrollmentQrCode(cleanEmail, config.secret);
      }

      setIsSubmitting(false);
      setStep('verification');
    } catch {
      setIsSubmitting(false);
      setAuthError('An authentication error occurred. Please try again.');
    }
  };

  // ==========================================
  // STEP 2A: GOOGLE AUTHENTICATOR (VERIFY)
  // ==========================================
  const executeVerification = async (codeToVerify: string) => {
    setAuthError(null);

    if (!codeToVerify || codeToVerify.trim().length !== 6) {
      setAuthError('Please enter a valid 6-digit code from Google Authenticator.');
      return;
    }

    setIsSubmitting(true);

    try {
      const isEnrolled = tfaConfig?.isEnrolled ?? false;

      if (!isEnrolled) {
        // ENROLLMENT CONFIRMATION FLOW:
        // Teacher confirms setup with their first 6-digit code
        const res = await twoFactorService.confirmAndEnroll(verifiedEmail, codeToVerify);
        if (!res.success) {
          setIsSubmitting(false);
          setAuthError(res.error || 'Verification failed. Please check the code in Google Authenticator.');
          return;
        }
      } else {
        // ACTIVE 2FA VERIFICATION FLOW:
        const res = await twoFactorService.verifyCode(verifiedEmail, codeToVerify);
        if (!res.success) {
          setIsSubmitting(false);
          setAuthError(res.error || 'Incorrect code. Please enter the current code from Google Authenticator.');
          return;
        }
      }

      // SUCCESS: complete session & enter teacher portal
      completeTwoFactorAuth(verifiedEmail, 'teacher');
      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    } catch {
      setIsSubmitting(false);
      setAuthError('Failed to verify Authenticator code. Please try again.');
    }
  };

  const handleVerifyAuthenticatorCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeVerification(totpCode);
  };

  const handleTotpCodeChange = (raw: string) => {
    const val = raw.replace(/\D/g, '').slice(0, 6);
    setTotpCode(val);
    setAuthError(null);
    if (val.length === 6) {
      executeVerification(val);
    }
  };

  // Verify Single-Use Backup Recovery Code
  const handleVerifyRecoveryCode = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!recoveryCodeInput.trim()) {
      setAuthError('Please enter your backup recovery code (format: SH-XXXX-XXXX).');
      return;
    }

    setIsSubmitting(true);
    const res = twoFactorService.verifyRecoveryCode(verifiedEmail, recoveryCodeInput);

    if (!res.success) {
      setIsSubmitting(false);
      setAuthError(res.error || 'Invalid recovery code.');
      return;
    }

    // Successfully consumed recovery code
    completeTwoFactorAuth(verifiedEmail, 'teacher');
    setIsSubmitting(false);
    navigate('/dashboard', { replace: true });
  };

  // ==========================================
  // STEP 2B: GMAIL / EMAIL VERIFICATION
  // ==========================================
  const handleSendEmailVerification = async () => {
    setAuthError(null);
    setEmailSuccessMsg(null);
    setDevOtpNotice(null);
    setIsSubmitting(true);

    try {
      const res = await emailVerificationService.sendVerificationCode(verifiedEmail);

      setIsSubmitting(false);
      if (res.success) {
        setEmailCodeSent(true);
        setResendCooldown(60);
        setExpiryCountdown(res.expiresInSeconds || 300);
        setEmailSuccessMsg(`A 6-digit verification code has been dispatched to ${res.maskedEmail}.`);

        if (res.devSimulatedCode) {
          setDevOtpNotice(`Demo Code: ${res.devSimulatedCode}`);
        }
      } else {
        setAuthError(res.error || 'Failed to dispatch verification email. Please try again.');
      }
    } catch {
      setIsSubmitting(false);
      setAuthError('Failed to send verification code. Please check your network connection.');
    }
  };

  const handleVerifyEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!emailOtpCode || emailOtpCode.trim().length !== 6) {
      setAuthError('Please enter the 6-digit code received in your email.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await emailVerificationService.verifyCode(verifiedEmail, emailOtpCode);

      if (!res.success) {
        setIsSubmitting(false);
        setAuthError(res.error || 'Incorrect or expired verification code.');
        return;
      }

      // Success: establish teacher session
      completeTwoFactorAuth(verifiedEmail, 'teacher');
      setIsSubmitting(false);
      navigate('/dashboard', { replace: true });
    } catch {
      setIsSubmitting(false);
      setAuthError('Failed to verify code. Please try again.');
    }
  };

  // Reset back to Credentials Step
  const handleBackToLogin = () => {
    sessionStorage.removeItem('studyhub_pending_2fa');
    setStep('credentials');
    setAuthError(null);
    setTotpCode('');
    setEmailOtpCode('');
    setEmailCodeSent(false);
    setShowRecoveryInput(false);
  };

  // Helper copy handlers
  const handleCopySecret = () => {
    if (tfaConfig?.secret) {
      navigator.clipboard.writeText(tfaConfig.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyRecoveryCodes = () => {
    if (tfaConfig?.recoveryCodes) {
      navigator.clipboard.writeText(tfaConfig.recoveryCodes.join('\n'));
      setCopiedRecovery(true);
      setTimeout(() => setCopiedRecovery(false), 2000);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-10 px-4 sm:px-6 font-sans selection:bg-[#14B866]/20">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Logo Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#142D27] text-[#14B866] shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-[#142D27] tracking-tight">
            {step === 'credentials' ? 'Academic Portal Access' : 'Two-Factor Verification'}
          </h1>
          <p className="text-xs text-[#557067]">
            {step === 'credentials'
              ? 'Official portal login for faculty and enrolled scholars'
              : 'Secure verification required to access the faculty environment'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
          {/* Error Message Alert */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{authError}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 1: CREDENTIALS FORM (EMAIL & PASSWORD)               */}
          {/* ========================================================= */}
          {step === 'credentials' && (
            <>
              {/* Role Switcher: Faculty vs Student */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7F9F8] border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setRoleMode('teacher');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    roleMode === 'teacher'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
                  Faculty / Teacher
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleMode('student');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    roleMode === 'student'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                  Student Portal
                </button>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    Registered Academic Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        roleMode === 'teacher'
                          ? 'faculty@example.com'
                          : 'student@example.com'
                      }
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-[#14B866] transition-colors"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-zinc-800">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[11px] text-[#14B866] hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-[#14B866] transition-colors"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                  isLoading={isSubmitting}
                  loadingText="Verifying Credentials..."
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In as {roleMode === 'teacher' ? 'Faculty' : 'Student'}
                </Button>
              </form>

              {/* Student Invite Link */}
              <div className="pt-2 border-t border-zinc-200">
                <Link
                  to="/accept-invite"
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-4 h-4 text-emerald-600" />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-zinc-900 block group-hover:text-emerald-700">
                        Have a Student Invitation Token?
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        Redeem token to register your student profile
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* STEP 2: TWO-FACTOR VERIFICATION SCREEN (FACULTY ONLY)     */}
          {/* ========================================================= */}
          {step === 'verification' && (
            <div className="space-y-4">
              {/* Authenticated Account Bar */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate max-w-[210px]">{verifiedEmail}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Password Verified
                </span>
              </div>

              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7F9F8] border border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('authenticator');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    verificationMethod === 'authenticator'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#14B866]" />
                  Google Authenticator
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod('email');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    verificationMethod === 'email'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-sky-600" />
                  Email Verification
                </button>
              </div>

              {/* ----------------------------------------------------------- */}
              {/* OPTION A: GOOGLE AUTHENTICATOR (ENROLLMENT VS VERIFY)       */}
              {/* ----------------------------------------------------------- */}
              {verificationMethod === 'authenticator' && (
                <>
                  {/* CASE 1: NOT YET ENROLLED (ENROLLMENT VIEW WITH QR CODE) */}
                  {!tfaConfig?.isEnrolled ? (
                    <form onSubmit={handleVerifyAuthenticatorCode} className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold">
                          Initial 2FA Setup Required
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed">
                          Scan this QR code with <strong>Google Authenticator</strong> on your phone:
                        </p>

                        {/* Scannable Base32 QR Code */}
                        <div className="p-2.5 bg-white border border-zinc-200 rounded-xl inline-block shadow-xs">
                          {qrCodeUrl ? (
                            <img
                              src={qrCodeUrl}
                              alt="Google Authenticator QR Code"
                              className="w-40 h-40 mx-auto rounded"
                            />
                          ) : (
                            <div className="w-40 h-40 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
                              Generating Setup QR...
                            </div>
                          )}
                        </div>

                        {/* Manual Base32 Setup Key */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-zinc-400 block font-medium">
                            Or enter secret key manually into Google Authenticator:
                          </span>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 select-all">
                              {tfaConfig?.secret}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="p-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors"
                              title="Copy Secret Key"
                            >
                              {copiedSecret ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Backup Recovery Codes Box */}
                        <div className="pt-2 text-left bg-zinc-50 p-2.5 rounded-xl border border-zinc-200 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-zinc-800 flex items-center gap-1">
                              <Key className="w-3 h-3 text-amber-600" />
                              Single-Use Backup Recovery Codes
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyRecoveryCodes}
                              className="text-[10px] text-[#14B866] font-semibold hover:underline flex items-center gap-0.5"
                            >
                              {copiedRecovery ? 'Copied!' : 'Copy All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-zinc-600">
                            {tfaConfig?.recoveryCodes.map((c, i) => (
                              <div key={i} className="bg-white px-2 py-0.5 rounded border border-zinc-200">
                                {c}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            Save these keys in a safe place. You can use them if you ever lose your phone.
                          </p>
                        </div>
                      </div>

                      {/* First Code Input to Confirm Setup */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-800 mb-1 text-center">
                          Enter 6-Digit Code to Confirm & Activate
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={6}
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full h-11 pl-10 pr-4 text-center text-lg font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-[#14B866]"
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-11 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                        isLoading={isSubmitting}
                        loadingText="Activating 2FA..."
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Confirm Code & Activate 2FA
                      </Button>
                    </form>
                  ) : (
                    /* CASE 2: ALREADY ENROLLED (CLEAN 6-DIGIT PROMPT - NO QR CODE!) */
                    <div>
                      {!showRecoveryInput ? (
                        <form onSubmit={handleVerifyAuthenticatorCode} className="space-y-4">
                          <div className="text-center space-y-1.5 py-2">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                              <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900">
                              Enter Authenticator Code
                            </h3>
                            <p className="text-xs text-zinc-500">
                              Open <strong>Google Authenticator</strong> on your phone and enter the 6-digit code for <strong>{verifiedEmail}</strong>.
                            </p>
                          </div>

                          <div>
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={totpCode}
                                onChange={(e) => handleTotpCodeChange(e.target.value)}
                                placeholder="000000"
                                className="w-full h-12 pl-10 pr-4 text-center text-xl font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-[#14B866] shadow-xs"
                                autoFocus
                              />
                            </div>
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-11 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                            isLoading={isSubmitting}
                            loadingText="Verifying Code..."
                            icon={<ArrowRight className="w-4 h-4" />}
                          >
                            Verify & Enter Portal
                          </Button>

                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowRecoveryInput(true);
                                setAuthError(null);
                              }}
                              className="text-xs text-zinc-500 hover:text-zinc-800 underline font-medium"
                            >
                              Lost access to phone? Use Backup Recovery Code
                            </button>
                          </div>
                        </form>
                      ) : (
                        /* Recovery Code Input Form */
                        <form onSubmit={handleVerifyRecoveryCode} className="space-y-3.5">
                          <div className="text-center space-y-1 py-1">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                              <ShieldAlert className="w-5 h-5" />
                            </div>
                            <h3 className="text-xs font-bold text-zinc-900">
                              Use Single-Use Backup Recovery Code
                            </h3>
                            <p className="text-[11px] text-zinc-500">
                              Enter one of your 4 recovery codes (e.g. SH-8492-3819)
                            </p>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={recoveryCodeInput}
                              onChange={(e) => setRecoveryCodeInput(e.target.value)}
                              placeholder="SH-XXXX-XXXX"
                              className="w-full h-10 px-3 text-center text-xs font-mono tracking-wider rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-[#14B866]"
                              autoFocus
                            />
                          </div>

                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-10 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                            isLoading={isSubmitting}
                            loadingText="Verifying Recovery Code..."
                          >
                            Redeem Recovery Code & Enter
                          </Button>

                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowRecoveryInput(false);
                                setAuthError(null);
                              }}
                              className="text-xs text-zinc-500 hover:text-zinc-800 underline font-medium"
                            >
                              Back to 6-digit Authenticator Code
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ----------------------------------------------------------- */}
              {/* OPTION B: GMAIL / EMAIL VERIFICATION                        */}
              {/* ----------------------------------------------------------- */}
              {verificationMethod === 'email' && (
                <div className="space-y-4">
                  {/* Notice / Instructions */}
                  <div className="text-center space-y-1 py-1">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-200">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs font-bold text-zinc-900">
                      Gmail One-Time Passcode (OTP)
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      We will dispatch a secure 6-digit code to{' '}
                      <strong>{emailVerificationService.maskEmail(verifiedEmail)}</strong>
                    </p>
                  </div>

                  {/* Dev notification chip if fallback OTP */}
                  {devOtpNotice && (
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 text-center font-mono font-bold">
                      {devOtpNotice}
                    </div>
                  )}

                  {emailSuccessMsg && (
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{emailSuccessMsg}</span>
                    </div>
                  )}

                  {!emailCodeSent ? (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleSendEmailVerification}
                        className="w-full h-11 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                        isLoading={isSubmitting}
                        loadingText="Sending Code..."
                        icon={<Send className="w-3.5 h-3.5" />}
                      >
                        Send Verification Code to Gmail
                      </Button>
                      <p className="text-[10px] text-zinc-400 text-center">
                        Code expires in 5 minutes after being dispatched.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyEmailCode} className="space-y-3.5">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-zinc-800">
                            Enter 6-Digit Email Code
                          </label>
                          {expiryCountdown > 0 && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              Expires in: {formatCountdown(expiryCountdown)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={6}
                            value={emailOtpCode}
                            onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            className="w-full h-11 pl-10 pr-4 text-center text-lg font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-[#14B866]"
                            autoFocus
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full h-11 text-xs font-bold shadow-xs bg-[#14B866] hover:bg-[#12a35a] text-white"
                        isLoading={isSubmitting}
                        loadingText="Verifying Code..."
                        icon={<ArrowRight className="w-4 h-4" />}
                      >
                        Verify Email Code & Enter
                      </Button>

                      {/* Resend Code Button with Cooldown */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[11px] text-zinc-400">
                          Didn't receive the email?
                        </span>
                        {resendCooldown > 0 ? (
                          <span className="text-[11px] font-medium text-zinc-400">
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendEmailVerification}
                            disabled={isSubmitting}
                            className="text-[11px] font-semibold text-[#14B866] hover:underline flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            Resend Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Navigation: Back to Login */}
              <div className="pt-2 border-t border-zinc-200 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-medium transition-colors"
                >
                  &larr; Back to Sign In / Change Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
