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
  TEACHER_EMAIL,
  getOtpAuthUri,
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
  const [copiedKey, setCopiedKey] = useState(false);

  // Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Generate scannable QR Code specifically for ahmadwebcore@gmail.com
  useEffect(() => {
    const currentEmail = roleMode === 'teacher' ? TEACHER_EMAIL : 'student@studyhub.edu';
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
      .catch((err) => console.error('QR code generation error:', err));
  }, [roleMode]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(BASE32_SECRET);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  // 1. STRICT Real 2FA Verification
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!totpCode || totpCode.trim().length !== 6) {
      setAuthError('Please enter a 6-digit code from Google Authenticator.');
      return;
    }

    setIsVerifying(true);
    const result = await verifyTOTP(totpCode, BASE32_SECRET);

    if (!result.valid) {
      setIsVerifying(false);
      setAuthError(result.reason || 'Incorrect Authenticator code. Check your Google Authenticator app.');
      return;
    }

    // Success: activate session
    setRole(roleMode);
    localStorage.setItem(`studyhub_2fa_enabled_${roleMode}`, 'true');
    const targetEmail = roleMode === 'teacher' ? TEACHER_EMAIL : 'bilal.student@gmail.com';
    await signIn(targetEmail, 'password123');
    setIsVerifying(false);
    navigate('/dashboard', { replace: true });
  };

  // 2. Standard Password Login
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
    setAuthError(null);
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
            Official portal login for faculty and enrolled scholars
          </p>
        </div>

        {/* Clean Login Card */}
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

          {/* Clean Method Tabs: 2FA Authenticator vs Password */}
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
              Password Login
            </button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE AUTHENTICATOR (STRICT VERIFICATION) */}
          {authMethod === 'authenticator' && (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs text-zinc-500">
                  Scan with <strong>Google Authenticator</strong> on your phone:
                </p>

                {/* Scannable Base32 QR Code */}
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1 text-center">
                  Enter 6-Digit Google Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 843850"
                    className="w-full h-11 pl-10 pr-4 text-center text-base font-mono tracking-widest rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-none focus:border-zinc-500"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-xs font-bold shadow-xs"
                isLoading={isVerifying}
                loadingText="Verifying Authenticator Code..."
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
                    placeholder={roleMode === 'teacher' ? 'ahmadwebcore@gmail.com' : 'student@gmail.com'}
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
                    placeholder="Enter account password"
                    className="w-full h-10 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-zinc-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-xs font-bold shadow-xs"
                isLoading={isVerifying}
                loadingText="Signing In..."
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In as {roleMode === 'teacher' ? 'Faculty' : 'Student'}
              </Button>
            </form>
          )}

          {/* Student Invitation Token Redeem Banner */}
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
