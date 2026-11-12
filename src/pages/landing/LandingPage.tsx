import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays smoothly across all browsers
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented by browser:', err);
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden font-sans select-none bg-zinc-950 text-white">
      {/* Background Aesthetic Study Video with Dark Glass Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1920&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-40 scale-105 filter blur-[0.5px]"
        >
          <source src="/videos/study-bg.mp4" type="video/mp4" />
          <source
            src="https://cdn.jsdelivr.net/gh/intel-iot-devkit/sample-videos@master/classroom.mp4"
            type="video/mp4"
          />
        </video>
        {/* Modern 2026 Gradient Overlays for Contrast & Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/85" />
        <div className="absolute inset-0 bg-radial from-emerald-500/15 via-transparent to-transparent" />
      </div>

      {/* Top Brand Pill (Clean, No Distracting Header) */}
      <div className="relative z-10 pt-10 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold shadow-xs">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-white">
            Study<span className="text-emerald-400">Hub</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-zinc-300 font-medium">Academic Portal 2026</span>
        </div>
      </div>

      {/* Center Hero: Ultra Clean with ONE Action Button */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-2xl mx-auto text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <span>FSc 1st Year & 2nd Year &bull; 2026 Academic Session</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            A focused learning portal for teachers and students
          </h1>

          <p className="text-base sm:text-lg text-zinc-300 max-w-lg mx-auto leading-relaxed">
            Daily textbook targets, assignment submissions, Pakistan calendar rest days, and 2FA authentication in one place.
          </p>

          {/* ONE SINGLE HIGH-CONTRAST ACTION BUTTON */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => navigate('/login')}
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-full shadow-2xl hover:shadow-emerald-500/25 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer ring-1 ring-white/30"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="relative z-10 w-full text-center py-6 text-xs text-zinc-400 border-t border-white/10 backdrop-blur-xs">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>StudyHub &bull; Pakistani Academic LMS</span>
          <span>Google Authenticator 2FA Secured</span>
        </div>
      </footer>
    </div>
  );
};
