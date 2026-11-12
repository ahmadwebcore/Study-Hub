import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { emailService } from '../../services/emailService';
import { Badge } from '../ui/Badge';
import { useNavigate, Link } from 'react-router-dom';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { role, profile, toggleDemoRole, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const configuredTeacher = emailService.getTeacherConfiguredEmail();
  const configuredStudent = emailService.getStudentConfiguredEmail();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/');
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#e1ede7] sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-[#e1ede7] text-[#557067] hover:bg-[#F7F9F8] hover:text-[#142D27] transition-colors focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7d9990]" />
          <input
            type="text"
            aria-label="Global search across subjects and assignments"
            placeholder="Search subjects, assignments, tests, or topics..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e1ede7] bg-[#F7F9F8] text-xs text-[#263B35] placeholder-[#7d9990] focus:bg-white focus:outline-none focus:border-[#14B866] transition-all"
          />
        </div>
      </div>

      {/* Center: Reciprocal Teacher/Student Name & Email Pill */}
      <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e1ede7] bg-[#F7F9F8] text-xs">
        <span className="text-[10px] font-bold text-[#7d9990] uppercase tracking-wider">
          {role === 'teacher' ? 'Connected Student:' : 'Assigned Faculty:'}
        </span>
        <span className="font-bold text-[#142D27]">
          {role === 'teacher' ? 'Bilal Ahmad' : 'Ahmad WebCore'}
        </span>
        <span className="text-[11px] text-[#14B866] font-mono">
          ({role === 'teacher' ? configuredStudent : configuredTeacher})
        </span>
      </div>

      {/* Right: Actions, Notifications, Role Switcher, Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Role Toggle Pill Button */}
        <button
          onClick={toggleDemoRole}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#e1ede7] bg-[#F7F9F8] hover:bg-[#e8f8f0] hover:border-[#14B866]/40 transition-all text-xs font-semibold text-[#263B35]"
          title="Toggle between Teacher and Student view"
        >
          <span className="text-[#557067]">Perspective:</span>
          <span className="text-[#142D27] font-bold flex items-center gap-1">
            {role === 'teacher' ? 'Faculty Lead' : 'Student'}
          </span>
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="h-6 w-[1px] bg-[#e1ede7] mx-0.5 hidden sm:block" />

        {/* User Profile Area */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-[#F7F9F8] border border-transparent hover:border-[#e1ede7] transition-colors"
          >
            <img
              src={profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'}
              alt={profile?.name || 'User'}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-cover ring-1 ring-[#14B866]/30"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-[#142D27] leading-tight flex items-center gap-1">
                {role === 'teacher' ? 'Ahmad WebCore' : 'Bilal Ahmad'}
              </span>
              <span className="text-[10px] text-[#557067] leading-tight">
                {role === 'teacher' ? configuredTeacher : configuredStudent}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7d9990] hidden lg:block" />
          </button>

          {/* User Profile Dropdown Menu */}
          {showProfileMenu && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-[#e1ede7] shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-3 border-b border-[#e1ede7]/80">
                <p className="text-xs font-bold text-[#142D27]">
                  {role === 'teacher' ? 'Ahmad WebCore' : 'Bilal Ahmad'}
                </p>
                <p className="text-[11px] text-[#14B866] font-mono truncate">
                  {role === 'teacher' ? configuredTeacher : configuredStudent}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant={role === 'teacher' ? 'primary' : 'info'} size="sm" dot>
                    {role === 'teacher' ? 'Faculty Lead' : 'Enrolled Student'}
                  </Badge>
                </div>
              </div>

              {/* Reciprocal identity in dropdown */}
              <div className="p-2.5 my-1 rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d9990] block">
                  {role === 'teacher' ? 'Assigned Student:' : 'Assigned Faculty Evaluator:'}
                </span>
                <p className="font-bold text-[#142D27] mt-0.5">
                  {role === 'teacher' ? 'Bilal Ahmad' : 'Ahmad WebCore'}
                </p>
                <p className="text-[11px] text-[#557067]">
                  {role === 'teacher' ? configuredStudent : configuredTeacher}
                </p>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#263B35] font-medium rounded-xl hover:bg-[#e8f8f0] hover:text-[#14B866] transition-colors"
                >
                  <Lock className="w-4 h-4 text-[#14B866]" />
                  Security & 2FA Authenticator
                </Link>

                <button
                  onClick={() => {
                    toggleDemoRole();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#263B35] font-medium rounded-xl hover:bg-[#e8f8f0] hover:text-[#14B866] transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#14B866]" />
                  Switch to {role === 'teacher' ? 'Student View' : 'Teacher View'}
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Sign Out
                </button>
              </div>

              <div className="pt-2 border-t border-[#e1ede7]/80 text-center">
                <p className="text-[10px] text-[#7d9990]">
                  🔒 Official Academic Portal &bull; Encrypted Session
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
