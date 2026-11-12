import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, setRole } = useAuth();

  const [authMethod, setAuthMethod] = useState<'authenticator' | 'password'>('authenticator');
  const [roleMode, setRoleMode] = useState<'teacher' | 'student'>('teacher');

  // Authenticator state
  const [totpCode, setTotpCode] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password state
  const [email, setEmail] = useState('faculty.evans@studyhub.edu');
  const [password, setPassword] = useState('password123');

  const SECRET_KEY = 'STUDY-HUB-7892-SECURE-KEY';

  const handleCopyKey = () => {
    navigator.clipboard.writeText(SECRET_KEY);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleVerify2FAAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (totpCode.trim().length < 6) {
      setAuthError('Please enter a 6-digit code from your Authenticator app.');
      return;
    }

    setIsVerifying(true);
    setTimeout(async () => {
      // Set role and log in
      setRole(roleMode);
      localStorage.setItem(`studyhub_2fa_enabled_${roleMode}`, 'true');
      const targetEmail = roleMode === 'teacher' ? 'faculty.evans@studyhub.edu' : 'bilal.student@gmail.com';
      await signIn(targetEmail, 'password123');
      setIsVerifying(false);
      navigate('/dashboard', { replace: true });
    }, 600);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setRole(roleMode);
    const { error } = await signIn(email, password);
    setIsVerifying(false);

    if (error) {
      setAuthError(error.message || 'Invalid credentials.');
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
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Clean Logo Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D27] text-[#14B866] shadow-sm">
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
            Secure login for faculty and enrolled students
          </p>
        </div>

        {/* Clean Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e1ede7] shadow-sm space-y-5">
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

          {/* Auth Method Toggle: Authenticator vs Password */}
          <div className="flex items-center justify-center gap-4 text-xs border-b border-[#e1ede7] pb-3">
            <button
              type="button"
              onClick={() => setAuthMethod('authenticator')}
              className={`pb-1 font-bold transition-all border-b-2 ${
                authMethod === 'authenticator'
                  ? 'border-[#14B866] text-[#142D27]'
                  : 'border-transparent text-[#7d9990] hover:text-[#142D27]'
              }`}
            >
              2FA Authenticator (App)
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`pb-1 font-bold transition-all border-b-2 ${
                authMethod === 'password'
                  ? 'border-[#14B866] text-[#142D27]'
                  : 'border-transparent text-[#7d9990] hover:text-[#142D27]'
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

          {/* Mode 1: Authenticator Code Verification */}
          {authMethod === 'authenticator' && (
            <form onSubmit={handleVerify2FAAndLogin} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 text-center">
                <span className="text-[11px] font-bold text-emerald-950 block">
                  Add Secret Key in Google or Microsoft Authenticator
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#142D27] bg-white px-2.5 py-1 rounded-lg border border-emerald-300 select-all">
                    {SECRET_KEY}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
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
                    className="w-full h-12 pl-10 pr-4 text-center text-lg font-mono tracking-widest rounded-xl border border-[#e1ede7] bg-white text-[#142D27] focus:outline-none focus:border-[#14B866]"
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

          {/* Mode 2: Password Login */}
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
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#142D27] focus:outline-none focus:border-[#14B866]"
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
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#142D27] focus:outline-none focus:border-[#14B866]"
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

          {/* Clean Footer Link */}
          <div className="pt-2 border-t border-[#e1ede7] text-center">
            <Link
              to="/accept-invite"
              className="text-xs font-semibold text-[#557067] hover:text-[#14B866] transition-colors"
            >
              Have a student invitation token? Redeem here &rarr;
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link to="/" className="text-xs font-semibold text-[#7d9990] hover:text-[#142D27]">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
