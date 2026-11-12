import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await updatePassword(data.password);
    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
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
              New Password
            </span>
          </div>
        </Link>

        <h2 className="mt-6 text-2xl font-extrabold text-[#142D27] tracking-tight">
          Create New Password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#557067]">
          Enter your updated security credentials for StudyHub
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-[#e1ede7] space-y-6">
          {isSuccess ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#14B866] flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#142D27]">Password Updated!</h3>
              <p className="text-xs text-[#557067]">
                Your password has been changed successfully. Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#142D27] mb-1">
                  New Password
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
                  Confirm New Password
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
              >
                {isSubmitting ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
