import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Badge } from '../ui/Badge';
import { useNavigate, Link } from 'react-router-dom';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { role, profile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* BISE DG Khan Quick Pill */}
        <button
          type="button"
          onClick={() => setIsBoardModalOpen(true)}
          className="hidden md:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-2xs"
          title="BISE D.G. Khan Board Updates & Pairing Scheme"
        >
          <span className="text-xs">🇵🇰</span>
          <span>BISE DG Khan</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
        </button>

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="h-6 w-[1px] bg-zinc-200 mx-0.5 hidden sm:block" />

        {/* User Profile Area */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            aria-haspopup="true"
            aria-expanded={showProfileMenu}
            aria-label="User profile menu"
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-zinc-50 border border-zinc-200 shadow-xs transition-colors"
          >
            <img
              src={profile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&auto=format&fit=crop'}
              alt={profile?.name || 'User'}
              className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg object-cover ring-1 ring-zinc-200"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-zinc-900 leading-tight">
                {role === 'teacher' ? 'Ahmad' : (profile?.name && !profile.name.toLowerCase().includes('bilal') ? profile.name : 'Student Scholar')}
              </span>
              <span className="text-[10px] text-zinc-500 leading-tight">
                {role === 'teacher' ? 'Faculty Lead' : '1st Year Scholar'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden lg:block" />
          </button>

          {/* User Profile Dropdown Menu - Clean & Modern */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-zinc-200 shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-900">
                  {role === 'teacher' ? 'Ahmad' : (profile?.name && !profile.name.toLowerCase().includes('bilal') ? profile.name : 'Student Scholar')}
                </p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                  {role === 'teacher' ? 'Faculty Lead & Academic Director' : 'Enrolled Scholar (1st Year FSc)'}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant={role === 'teacher' ? 'primary' : 'info'} size="sm" dot>
                    {role === 'teacher' ? 'Faculty Lead' : 'Enrolled Student'}
                  </Badge>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Security & 2FA Authenticator
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  Sign Out
                </button>
              </div>

              <div className="pt-2 border-t border-zinc-100 text-center">
                <p className="text-[10px] text-zinc-400">
                  🔒 Academic Portal &bull; Encrypted
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BISE DG Khan Modal Accessible from Anywhere */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </header>
  );
};
