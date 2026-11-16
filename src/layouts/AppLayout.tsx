import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { Navbar } from '../components/navigation/Navbar';
import { StudyBotWidget } from '../components/ai/StudyBotWidget';
import { MobileNativePushBanner } from '../components/notifications/MobileNativePushBanner';
import { useRole } from '../hooks/useRole';
import { X, ShieldCheck, Eye } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { role, canSwitchRole, switchToTeacher } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('studyhub_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('studyhub_sidebar_collapsed', String(next));
      return next;
    });
  };

  const location = useLocation();
  const isAITeacherPage = location.pathname.startsWith('/ai-teacher');

  return (
    <div className="min-h-screen bg-[#151918] flex flex-col font-sans text-zinc-100">
      {/* Real Mobile App Native Push Banner */}
      <MobileNativePushBanner />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (Adjusts width seamlessly between w-20 and w-64/w-72) */}
        <div
          className={`hidden lg:block shrink-0 sticky top-0 h-screen transition-all duration-300 ${
            isSidebarCollapsed ? 'w-20' : 'w-64 xl:w-72'
          }`}
        >
          <Sidebar
            isCollapsed={isSidebarCollapsed}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-over menu */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#121514] shadow-dropdown z-10 animate-in slide-in-from-left duration-200">
              <div className="absolute top-3 right-3 z-20">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Workspace Area (Fluid width, eliminates wonkey white gap, adjusts to sidebar) */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 bg-[#151918]">
          {/* Active Student Preview Banner (Visible only when Teacher has switched to Student perspective) */}
          {canSwitchRole && role === 'student' && (
            <div className="bg-[#142D27] text-white px-3 sm:px-6 py-2 flex items-center justify-between text-xs sticky top-0 z-30 border-b border-emerald-500/30 shadow-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="font-semibold text-emerald-100 flex items-center gap-1.5 text-[11px] sm:text-xs truncate">
                  <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  Viewing Portal as Student: <strong className="text-white">Henza Noor Preview</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={switchToTeacher}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 ml-2"
                title="Convert / Switch back to Faculty Lead Ahmad"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Convert to Teacher</span>
              </button>
            </div>
          )}

          <Navbar
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={toggleSidebarCollapsed}
          />

          <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 max-w-[1720px] transition-all bg-[#151918]">
            <Outlet />
          </main>

          {/* Floating WhatsApp-Style Academic Chat Widget */}
          {!isAITeacherPage && <StudyBotWidget />}

          {/* Minimalist 2026 Footer */}
          <footer className="py-4 px-3 sm:px-6 lg:px-8 border-t border-white/10 text-xs text-zinc-400 bg-[#121514]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1720px]">
              <span>
                Global Science Academy, Fatehpur &copy; {new Date().getFullYear()} &bull; Academic Portal
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="hover:text-[#14B866] cursor-pointer">Privacy Policy</span>
                <span className="hover:text-[#14B866] cursor-pointer">Terms of Service</span>
                <span className="hover:text-[#14B866] cursor-pointer">Support Portal</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
