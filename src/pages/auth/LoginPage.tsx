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
  Ticket,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  BASE32_SECRET,
  getOtpAuthUri,
  generateTOTP,
  verifyTOTP,
} from '../../lib/totp';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, setRole } = useAuth();

  const [roleMode, setRoleMode] = useState<'teacher' | 'student'>('teacher');
  const [authMethod, setAuthMethod] = useState<'authenticator' | 'password'>('authenticator');

  // Authenticator State
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [totpCode, setTotpCode] = useState('');
  const [liveCode, setLiveCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Standard Password State
  const [email, setEmail] = useState('faculty.evans@studyhub.edu');
  const [password, setPassword] = useState('password123');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Update QR Code and live TOTP calculation every second
  useEffect(() => {
    const currentEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
    const otpauthUrl = getOtpAuthUri(currentEmail, BASE32_SECRET);

    QRCode.toDataURL(otpauthUrl, {
      width: 170,
      margin: 1,
      color: {
        dark: '#142D27',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('QR code error:', err));

    // Calculate current live code
    const updateCode = async () => {
      const code = await generateTOTP(BASE32_SECRET);
      setLiveCode(code);
      const seconds = 30 - (Math.floor(Date.now() / 1000) % 30);
      setTimeRemaining(seconds);
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [roleMode]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(BASE32_SECRET);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 1. Verify 2FA Authenticator
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const isValid = await verifyTOTP(totpCode, BASE32_SECRET);
    if (!isValid) {
      setAuthError('Please enter a valid 6-digit code from Google Authenticator.');
      return;
    }

    setIsVerifying(true);
    setRole(roleMode);
    localStorage.setItem(`studyhub_2fa_enabled_${roleMode}`, 'true');
    const targetEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
    await signIn(targetEmail, 'password123');
    setIsVerifying(false);
    navigate('/dashboard', { replace: true });
  };

  // 2. Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setIsVerifying(true);
    setAuthError(null);
    setRole(roleMode);

    setTimeout(async () => {
      const targetEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
      await signIn(targetEmail, 'password123');
      setIsVerifying(false);
      navigate('/dashboard', { replace: true });
    }, 500);
  };

  // 3. Password Login
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
    } else {
      setEmail('bilal.student@gmail.com');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-10 px-4 sm:px-6 font-sans selection:bg-[#14B866]/20">
      <div className="w-full max-w-md mx-auto space-y-5">
        {/* Clean Logo Header */}
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
            Academic Portal Access
          </h1>
          <p className="text-xs text-[#557067]">
            Sign in to access your syllabus, assignments, and examinations
          </p>
        </div>

        {/* Clean Card */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
          {/* Role Selector: Teacher vs Student */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#F7F9F8] border border-zinc-200">
            <button
              type="button"
              onClick={() => switchRole('teacher')}
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
              onClick={() => switchRole('student')}
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

          {/* Clean Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isVerifying}
            className="w-full h-11 flex items-center justify-center gap-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition-colors shadow-xs"
          >
            {/* Google G Multi-Color SVG */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-200 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-zinc-400 font-semibold absolute">
              or sign in with
            </span>
          </div>

          {/* Method Tabs: 2FA vs Password */}
          <div className="flex items-center justify-center gap-6 text-xs border-b border-zinc-200 pb-2">
            <button
              type="button"
              onClick={() => setAuthMethod('authenticator')}
              className={`pb-1.5 font-bold transition-all border-b-2 ${
                authMethod === 'authenticator'
                  ? 'border-[#14B866] text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Google Authenticator 2FA
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`pb-1.5 font-bold transition-all border-b-2 ${
                authMethod === 'password'
                  ? 'border-[#14B866] text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Password
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* TAB 1: REAL GOOGLE AUTHENTICATOR */}
          {authMethod === 'authenticator' && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-zinc-500">
                  Scan with <strong>Google Authenticator</strong> or <strong>Microsoft Authenticator</strong>:
                </p>

                {/* Scannable QR Code */}
                <div className="p-2.5 bg-white border border-zinc-200 rounded-xl inline-block shadow-xs">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="Google Authenticator QR Code"
                      className="w-36 h-36 mx-auto rounded"
                    />
                  ) : (
                    <div className="w-36 h-36 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                {/* Secret Key in Valid Base32 */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200 select-all">
                    {BASE32_SECRET}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900"
                    title="Copy Secret Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Live Current Code Helper */}
                {liveCode && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                    <span>Current Live Code:</span>
                    <strong className="font-mono font-bold tracking-wider">{liveCode}</strong>
                    <span className="text-[10px] text-emerald-600">({timeRemaining}s)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1 text-center">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 489201"
                    className="w-full h-11 pl-10 pr-4 text-center text-base font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-500"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-xs font-bold"
                isLoading={isVerifying}
                loadingText="Verifying Authenticator..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Verify & Enter Portal
              </Button>
            </form>
          )}

          {/* TAB 2: PASSWORD LOGIN */}
          {authMethod === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-xs font-bold"
                isLoading={isVerifying}
                loadingText="Signing In..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In as {roleMode === 'teacher' ? 'Faculty' : 'Student'}
              </Button>
            </form>
          )}

          {/* Clean Student Invitation Banner */}
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
                    Redeem your token to activate your student account
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Home Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
