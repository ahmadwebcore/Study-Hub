import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  GraduationCap,
  KeyRound,
  User,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { studentService } from '../../services/studentService';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { StudentInvitation } from '../../types';

const acceptInviteSchema = z
  .object({
    token: z.string().min(5, 'Invitation token is required'),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUpStudentWithInvite } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const [invitation, setInvitation] = useState<StudentInvitation | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token: tokenParam,
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const enteredToken = watch('token');

  useEffect(() => {
    if (tokenParam) {
      verifyToken(tokenParam);
    }
  }, [tokenParam]);

  const verifyToken = async (tok: string) => {
    setIsVerifying(true);
    setVerificationError(null);

    const verified = await studentService.verifyInvitation(tok);
    setIsVerifying(false);

    if (verified) {
      setInvitation(verified);
      setValue('token', tok);
    } else {
      setVerificationError('Invalid or expired invitation token. Please request a new invite from your instructor.');
      setInvitation(null);
    }
  };

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (!invitation) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const { error } = await signUpStudentWithInvite(
      invitation.email,
      data.password,
      data.token,
      data.fullName
    );

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
    } else {
      notificationService.addNotification({
        title: `🎉 Welcome to StudyHub!`,
        message: `Your account is active. Mentorship with Ahmad is live.`,
        category: 'system',
      });
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#142D27] text-[#14B866] shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
            <span className="text-xs font-semibold text-[#7d9990] block -mt-1">
              Student Onboarding
            </span>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl font-extrabold text-[#142D27] tracking-tight">
          Redeem Your Student Invitation
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#557067]">
          Activate your enrolled scholar account using your teacher's invite token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-[#e1ede7] space-y-6">
          {/* Step 1: Token Input if not verified yet */}
          {!invitation && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Invitation Token
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={enteredToken}
                    onChange={(e) => setValue('token', e.target.value)}
                    placeholder="Paste 24-character invite token..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm font-mono text-[#263B35] focus:outline-none focus:border-[#14B866]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setValue('token', 'INV-STUDYHUB-2026-MATH');
                    verifyToken('INV-STUDYHUB-2026-MATH');
                  }}
                  className="text-[11px] text-[#14B866] hover:underline font-semibold mt-1 text-right block w-full"
                >
                  ⚡ Click to load sample test invite (INV-STUDYHUB-2026-MATH)
                </button>
              </div>

              {verificationError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{verificationError}</span>
                </div>
              )}

              <Button
                type="button"
                variant="primary"
                className="w-full h-11 text-sm font-bold"
                disabled={!enteredToken || isVerifying}
                onClick={() => verifyToken(enteredToken)}
              >
                {isVerifying ? 'Verifying Token...' : 'Verify Invitation Token'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#557067] hover:text-[#142D27]"
                >
                  Already have an account? Sign In &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Step 2: Complete Profile if Token is Verified */}
          {invitation && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Verified Details Card */}
              <div className="p-4 rounded-2xl bg-[#e8f8f0]/60 border border-[#14B866]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14B866] flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Invitation Verified
                  </span>
                  <Badge variant="primary" size="sm">
                    {invitation.academicClass}
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-[#142D27]">{invitation.email}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#557067] pt-1 border-t border-[#14B866]/20">
                  <span>Course: {invitation.course}</span>
                  <span>Board: {invitation.board}</span>
                  <span>Session: {invitation.academicSession}</span>
                </div>
              </div>

              {submitError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Your Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...register('fullName')}
                    placeholder="e.g. Ryan Patel"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-rose-600 mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Choose Account Password
                </label>
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

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#7d9990] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-white text-xs sm:text-sm text-[#263B35] focus:outline-none focus:border-[#14B866]"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-11 text-sm font-bold"
                disabled={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                {isSubmitting ? 'Creating Student Account...' : 'Complete Registration'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
