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
  Eye,
  EyeOff,
  Ticket,
  QrCode,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { twoFactorService, TwoFactorConfig } from '../../services/twoFactorService';
import { emailVerificationService } from '../../services/emailVerificationService';

type AuthStep = 'credentials' | 'verification';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { completeTwoFactorAuth, user, profile } = useAuth();

  useEffect(() => {
    const isExplicitLoggedOut = localStorage.getItem('studyhub_logged_out') === 'true';
    const hasSavedUser = !!localStorage.getItem('studyhub_logged_in_user');
    const isAuthed = !isExplicitLoggedOut && hasSavedUser && (!!user || !!profile);
    if (isAuthed) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, profile, navigate]);

  // Step state
  const [step, setStep] = useState<AuthStep>('credentials');
  const [roleMode, setRoleMode] = useState<'teacher' | 'student'>(() => {
    try {
      const saved = localStorage.getItem('studyhub_last_active_role');
      if (saved === 'teacher' || saved === 'student') return saved;
    } catch {}
    return 'student'; // Defaults to student portal as Henza is the primary scholar
  });

  // Step 1: Credentials Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 2: Verification State (Google Authenticator)
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [tfaConfig, setTfaConfig] = useState<TwoFactorConfig | null>(null);

  // Google Authenticator State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Initialize clean session on mount (never auto-restore 2FA to prevent state leakage in new tabs)
  useEffect(() => {
    twoFactorService.initTimeSync();
    sessionStorage.removeItem('studyhub_pending_2fa');
  }, []);

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

  // When step changes to verification, prepare configs & load QR code
  useEffect(() => {
    if (step === 'verification' && verifiedEmail) {
      const config = twoFactorService.getConfig(verifiedEmail);
      setTfaConfig(config);
      loadEnrollmentQrCode(verifiedEmail, config.secret || 'AHMADWEBCORE2345');
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
      const cleanEmail = email.trim().toLowerCase();
      let activeRole: 'teacher' | 'student' = roleMode;
      if (cleanEmail === 'ahmadwebcore@gmail.com' || cleanEmail.includes('ahmad') || cleanEmail.includes('teacher')) {
        activeRole = 'teacher';
      } else {
        activeRole = 'student';
      }
      setRoleMode(activeRole);

      // 1. Verify credentials strictly
      const result = await authService.validateCredentials(cleanEmail, password, activeRole);

      if (!result.valid || result.error) {
        setIsSubmitting(false);
        setAuthError(result.error?.message || 'Invalid email or password. Please try again.');
        return;
      }

      // Mandatory 2FA challenge for BOTH Teacher and Student: Google Authenticator / TOTP
      setVerifiedEmail(cleanEmail);
      sessionStorage.setItem(
        'studyhub_pending_2fa',
        JSON.stringify({ email: cleanEmail, roleMode: activeRole })
      );

      const config = twoFactorService.getConfig(cleanEmail);
      setTfaConfig(config);
      await loadEnrollmentQrCode(cleanEmail, config.secret);

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

    const clean = (codeToVerify || '').trim().replace(/\D/g, '');
    if (!clean || clean.length !== 6) {
      setAuthError('Please enter a valid 6-digit code from Google Authenticator.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await twoFactorService.verifyCode(verifiedEmail, clean);

      if (!res.success) {
        setIsSubmitting(false);
        setAuthError(res.error || 'Incorrect Google Authenticator code. Please check your app.');
        return;
      }

      // SUCCESS: complete session & enter appropriate portal strictly according to roleMode
      completeTwoFactorAuth(verifiedEmail, roleMode);
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

  // Reset back to Credentials Step
  const handleBackToLogin = () => {
    sessionStorage.removeItem('studyhub_pending_2fa');
    setStep('credentials');
    setAuthError(null);
    setTotpCode('');
    setShowQrModal(false);
  };

  // Helper copy handlers
  const handleCopySecret = () => {
    if (tfaConfig?.secret) {
      navigator.clipboard.writeText(tfaConfig.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-10 px-4 sm:px-6 font-sans relative overflow-hidden">
      {/* 2026 Ambient Depth Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md mx-auto space-y-5 relative z-10">
        {/* Logo Header */}
        <div className="text-center space-y-1">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#142D27] to-[#14B866] text-white shadow-sm ring-1 ring-white/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-[#142D27] block font-serif">
                Global Science Academy
              </span>
              <span className="text-[10px] text-zinc-500 font-medium block">
                Fatehpur &bull; BISE DG Khan Board
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-[#142D27] tracking-tight pt-1">
            {step === 'credentials' ? 'Academic Portal Access' : 'Two-Factor Verification'}
          </h1>
          <p className="text-xs text-[#557067]">
            {step === 'credentials'
              ? 'Official portal login for faculty and enrolled scholars'
              : 'Secure verification required to access the faculty environment'}
          </p>
        </div>

        {/* Card Container with Glass Depth */}
        <div className="bg-white/95 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-zinc-200/90 shadow-xl shadow-zinc-900/5 space-y-5">
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
                    try { localStorage.setItem('studyhub_last_active_role', 'teacher'); } catch {}
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
                    try { localStorage.setItem('studyhub_last_active_role', 'student'); } catch {}
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
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(val);
                        const clean = val.trim().toLowerCase();
                        if (clean === 'ahmadwebcore@gmail.com' || clean.includes('ahmad') || clean.includes('teacher')) {
                          setRoleMode('teacher');
                        } else if (clean === 'dbaddiesvlog@gmail.com' || clean.includes('dbaddies') || clean.includes('student')) {
                          setRoleMode('student');
                        }
                      }}
                      placeholder="name@example.com"
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full h-10 pl-10 pr-10 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-[#14B866] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-xs font-bold shadow-sm"
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
          {/* ========================================================= */}
          {/* STEP 2: TWO-FACTOR VERIFICATION (GOOGLE AUTHENTICATOR)    */}
          {/* ========================================================= */}
          {step === 'verification' && (
            <div className="space-y-4">
              {/* Authenticated Account Bar (Email Strictly Masked for Privacy) */}
              <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2.5 text-zinc-900 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/15 flex items-center justify-center text-emerald-700 shrink-0">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold block text-zinc-900 leading-tight truncate">
                      {roleMode === 'teacher' ? 'Faculty Lead' : 'Enrolled Student'}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono truncate block">
                      {emailVerificationService.maskEmail(verifiedEmail)} &bull; Google Authenticator Required
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Authenticator TOTP Form */}
              <form onSubmit={handleVerifyAuthenticatorCode} className="space-y-4">
                <div className="text-center space-y-1.5 py-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Google Authenticator Code
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
                    Open <strong>Google Authenticator</strong> on your phone and enter your current 6-digit verification code.
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
                      className="w-full h-12 pl-10 pr-4 text-center text-xl font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600 shadow-xs"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full h-11 text-xs font-bold shadow-sm"
                  isLoading={isSubmitting}
                  loadingText="Verifying Code..."
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Verify Authenticator Code & Enter
                </Button>

                {/* Collapsed Pair New Device Option (Hidden by default because Authenticator is already set up) */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setShowQrModal(!showQrModal)}
                    className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>{showQrModal ? 'Hide Device Setup Key' : 'Pair a new phone or view setup key?'}</span>
                  </button>

                  {showQrModal && (
                    <div className="mt-2.5 p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-2 animate-in fade-in duration-150">
                      <span className="text-[11px] text-zinc-600 font-medium block">
                        Authenticator Setup Key (Only for New Device):
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <code className="text-xs font-mono font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-200 select-all">
                          {tfaConfig?.secret || (roleMode === 'teacher' ? 'AHMADWEBCORE2345' : 'STUDENTSCHOLAR2026')}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                          title="Copy Key"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {qrCodeUrl && (
                        <div className="pt-1">
                          <img
                            src={qrCodeUrl}
                            alt="Google Authenticator QR Code"
                            className="w-32 h-32 mx-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xs"
                          />
                          <p className="text-[10px] text-zinc-500 pt-1">
                            Scan once with Google Authenticator
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Navigation: Back to Login */}
              <div className="pt-2 border-t border-zinc-200 text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-medium transition-colors cursor-pointer"
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
