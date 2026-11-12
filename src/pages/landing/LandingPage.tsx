import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const handleGetStarted = (role: 'student' | 'teacher' = 'student') => {
    setRole(role);
    navigate(`/login?role=${role}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#142D27] flex flex-col justify-between selection:bg-[#14B866]/20 font-sans">
      {/* Top Header Navigation */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="bg-white border border-[#e1ede7] rounded-2xl px-5 sm:px-7 h-16 flex items-center justify-between shadow-sm">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#142D27] text-[#14B866] shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[#142D27]">
                Study<span className="text-[#14B866]">Hub</span>
              </span>
              <span className="text-[10px] font-semibold text-[#7d9990] -mt-1">
                Learning Management System
              </span>
            </div>
          </Link>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGetStarted('teacher')}
              className="hidden sm:inline-flex text-xs font-semibold text-[#557067] hover:text-[#142D27] px-3.5 py-2 rounded-xl transition-colors"
            >
              Faculty Portal
            </button>
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => handleGetStarted('student')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero & Overview */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16">
        <div className="w-full max-w-3xl mx-auto text-center space-y-7">
          {/* Academic Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Official Academic Portal &bull; 2026 Academic Year</span>
          </div>

          {/* Clean Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#142D27] tracking-tight leading-[1.15]">
            A focused learning portal for teachers and students
          </h1>

          {/* Clean Description */}
          <p className="text-sm sm:text-base text-[#557067] max-w-xl mx-auto leading-relaxed">
            Manage daily textbook targets, track syllabus progress, conduct examinations, and verify student submissions in one clear, structured workspace.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold shadow-sm"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => handleGetStarted('student')}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold"
              onClick={() => handleGetStarted('teacher')}
            >
              Faculty Sign In
            </Button>
          </div>

          {/* Role Entrances */}
          <div className="flex items-center justify-center gap-3 pt-2 text-xs font-semibold">
            <button
              onClick={() => handleGetStarted('student')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e1ede7] text-[#263B35] hover:border-[#14B866] transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Student Sign In</span>
            </button>
            <button
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e1ede7] text-[#263B35] hover:border-[#14B866] transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
              <span>Teacher Sign In</span>
            </button>
          </div>

          {/* 3 Core Academic Pillars */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-[#142D27] block">Pakistan Academic Calendar</span>
              <p className="text-[11px] text-[#557067] leading-relaxed">
                Automatically syncs Sunday rest days and gazetted national holidays with zero homework.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-[#142D27] block">Daily Syllabus Tasks</span>
              <p className="text-[11px] text-[#557067] leading-relaxed">
                Structured textbook readings and problem sets with strict faculty verification gate.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#e1ede7] space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-[#142D27] block">2FA Authenticator Security</span>
              <p className="text-[11px] text-[#557067] leading-relaxed">
                Google & Microsoft Authenticator integration for both teacher and student portals.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Academic Footer */}
      <footer className="w-full text-center py-5 text-xs text-[#7d9990] border-t border-[#e1ede7] bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StudyHub &bull; Academic Management System</span>
          <span>Official Portal Session &bull; Protected Access</span>
        </div>
      </footer>
    </div>
  );
};
