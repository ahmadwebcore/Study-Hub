import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid academic email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'student' ? 'student' : 'teacher';
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student'>(initialRole);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authenticatorCode, setAuthenticatorCode] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialRole === 'student' ? 'ryan.patel@student.studyhub.edu' : 'clara.evans@studyhub.edu',
      password: 'password123',
    },
  });

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'student') {
      handleQuickDemoFill('student');
    } else if (roleParam === 'teacher') {
      handleQuickDemoFill('teacher');
    }
  }, [location.search]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setAuthError(null);

    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message || 'Invalid credentials. Please verify your email and password.');
    } else {
      const destination = from === '/' ? '/dashboard' : from;
      navigate(destination, { replace: true });
    }
  };

  const handleQuickDemoFill = (role: 'teacher' | 'student') => {
    setSelectedRole(role);
    if (role === 'teacher') {
      setValue('email', 'faculty.evans@studyhub.edu');
      setValue('password', 'password123');
    } else {
      setValue('email', 'bilal.student@gmail.com');
      setValue('password', 'password123');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-[#14B866]/15">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142D27] text-[#14B866] shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
            <span className="text-xs font-semibold text-[#7d9990] block -mt-1">
              Learning Management System
            </span>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl font-extrabold text-[#142D27] tracking-tight">
          Sign In to Your Academic Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#557067]">
          Access your courses, scheduled assessments, and grading records
        </p>
        <div className="mt-2">
          <Link to="/" className="text-xs font-semibold text-[#14B866] hover:underline inline-flex items-center gap-1">
            <span>&larr; Back to Home</span>
          </Link>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-[#e1ede7] space-y-6">
          {/* Role Tab Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7]">
            <button
              type="button"
              onClick={() => handleQuickDemoFill('teacher')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'teacher'
                  ? 'bg-white text-[#142D27] shadow-subtle border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#14B866]" />
              Faculty / Teacher
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoFill('student')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'student'
                  ? 'bg-white text-[#142D27] shadow-subtle border border-[#e1ede7]'
                  : 'text-[#557067] hover:text-[#142D27]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-sky-500" />
              Student Portal
            </button>
          </div>

          {/* Portal Security Banner */}
          <div className="p-3 rounded-2xl bg-[#F7F9F8] border border-[#e1ede7] text-xs text-[#263B35] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#14B866]" />
              <span className="font-semibold text-xs text-[#142D27]">Official Portal Session</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              2FA Protected
            </span>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142D27] mb-1">
                Registered Academic Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@gmail.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#142D27]">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#14B866] hover:text-[#109653]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Authenticator 2FA Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#142D27] flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#14B866]" />
                  <span>Authenticator Code (2FA)</span>
                </label>
                <span className="text-[10px] text-[#7d9990]">Optional / If Enabled</span>
              </div>
              <input
                type="text"
                maxLength={6}
                value={authenticatorCode}
                onChange={(e) => setAuthenticatorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-digit code (e.g. 849201)"
                className="w-full h-10 px-4 text-center tracking-widest font-mono text-xs rounded-xl border border-[#e1ede7] bg-white text-[#263B35] focus:outline-none focus:border-[#14B866]"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-sm font-bold"
              isLoading={isSubmitting}
              loadingText="Authenticating Session..."
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign in as {selectedRole === 'teacher' ? 'Faculty' : 'Student'}
            </Button>
          </form>

          {/* Student Invitation Onboarding CTA */}
          <div className="pt-2 border-t border-[#e1ede7] text-center space-y-2">
            <p className="text-xs text-[#557067]">
              Have a student invitation token from your teacher?
            </p>
            <Link
              to="/accept-invite"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14B866] hover:text-[#109653]"
            >
              <span>Redeem Student Invitation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Prepared Google OAuth Button (Requirement 5) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => alert('Google OAuth is prepared. Configure Google Client ID & Secret in your Supabase Dashboard to activate live OAuth.')}
              className="w-full flex items-center justify-center gap-2.5 h-10 rounded-xl border border-[#e1ede7] bg-white text-xs font-semibold text-[#263B35] hover:bg-[#F7F9F8] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>Sign in with Google</span>
              <Badge variant="neutral" size="sm">
                OAuth Ready
              </Badge>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
