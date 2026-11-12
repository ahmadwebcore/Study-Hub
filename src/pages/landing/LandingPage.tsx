import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#142D27] flex flex-col justify-between selection:bg-[#14B866]/20 font-sans">
      {/* Modern Sleek Floating Header */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        <nav className="bg-white/90 backdrop-blur-md border border-[#e1ede7] rounded-full px-6 h-14 flex items-center justify-between shadow-sm">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#142D27] text-[#14B866] shadow-sm">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#142D27]">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
          </Link>

          {/* Simple Clean Header Action */}
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-[#142D27] hover:text-[#14B866] transition-colors px-3 py-1.5"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Hero: Ultra Simple & Clean with ONE Button */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-16">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6">
          {/* Minimal Academic Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Academic Management &bull; 2026</span>
          </div>

          {/* Strong, Clean Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#142D27] tracking-tight leading-[1.12]">
            A focused learning portal for teachers and students
          </h1>

          {/* Clean 1-Line Description */}
          <p className="text-sm sm:text-base text-[#557067] max-w-lg mx-auto leading-relaxed">
            Daily textbook targets, assignment submissions, Pakistan calendar schedules, and 2FA authentication in one place.
          </p>

          {/* ONE SINGLE SIMPLE BUTTON */}
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              className="px-8 py-3.5 text-base font-bold rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/login')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="w-full text-center py-5 text-xs text-[#7d9990] border-t border-[#e1ede7]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StudyHub &bull; Academic Portal</span>
          <span>Official Session &bull; 2FA Protected</span>
        </div>
      </footer>
    </div>
  );
};
