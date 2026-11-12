import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
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
    <div className="min-h-screen bg-[#F7F9F8] text-[#142D27] flex flex-col justify-between selection:bg-[#14B866]/20 relative overflow-x-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#14B866]/15 via-[#14B866]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Sleek Floating Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="backdrop-blur-md bg-white/90 border border-[#e1ede7] rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142D27] text-[#14B866]">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[#557067] px-2.5 py-1 rounded-full bg-[#E7EFEA] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              🇵🇰 Pakistan Academic Engine
            </span>
            <button
              onClick={() => handleGetStarted('teacher')}
              className="text-[#557067] hover:text-[#142D27] px-3 py-1.5 rounded-lg transition-colors"
            >
              Faculty Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Main Minimalist Cool Hero Center */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#14B866]" />
            <span>Next-Gen Academic Operations & Daily Tasks</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#142D27] tracking-tight leading-[1.15]">
            Simple, focused learning. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B866] to-[#142D27]">
              Zero friction.
            </span>
          </h1>

          {/* One Cool Tagline */}
          <p className="text-sm sm:text-base text-[#557067] max-w-lg mx-auto leading-relaxed">
            Daily textbook tasks, verified teacher gates, automated Gmail alerts, and Pakistan gazetted holiday schedules — in one clean workspace.
          </p>

          {/* Primary "Get Started" Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base font-bold shadow-sm shadow-[#14B866]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
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
              Faculty Portal
            </Button>
          </div>

          {/* Quick Perspective Switcher Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-4 text-xs font-semibold">
            <button
              onClick={() => handleGetStarted('student')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e1ede7] text-[#263B35] hover:border-[#14B866] transition-all shadow-subtle"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Student Entrance</span>
            </button>
            <button
              onClick={() => handleGetStarted('teacher')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e1ede7] text-[#263B35] hover:border-[#14B866] transition-all shadow-subtle"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
              <span>Teacher Entrance</span>
            </button>
          </div>

          {/* Minimalist Feature Badges Ribbon */}
          <div className="pt-6 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto text-left">
            <div className="p-3 rounded-xl bg-white border border-[#e1ede7] flex items-center gap-2.5 text-xs">
              <span className="text-base">🇵🇰</span>
              <div>
                <span className="font-bold text-[#142D27] block">Pakistan Holidays</span>
                <span className="text-[11px] text-[#7d9990]">Sundays & Gazetted Off</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#e1ede7] flex items-center gap-2.5 text-xs">
              <span className="text-base">🔒</span>
              <div>
                <span className="font-bold text-[#142D27] block">Faculty Gate</span>
                <span className="text-[11px] text-[#7d9990]">Teacher Signed Work</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#e1ede7] flex items-center gap-2.5 text-xs">
              <span className="text-base">✉️</span>
              <div>
                <span className="font-bold text-[#142D27] block">Automated Gmail</span>
                <span className="text-[11px] text-[#7d9990]">Live Exam & Task Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Crisp Minimal Footer */}
      <footer className="w-full text-center py-4 text-xs text-[#7d9990] border-t border-[#e1ede7] bg-white/40">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StudyHub &bull; Modern Academic Operations Portal</span>
          <span>Designed with high production standards &bull; 2026 Edition</span>
        </div>
      </footer>
    </div>
  );
};
