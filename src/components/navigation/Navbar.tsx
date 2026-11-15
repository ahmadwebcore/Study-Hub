import React, { useState, useRef, useEffect } from 'react';
import { Menu, Search, ChevronDown, LogOut, Lock, Camera, X, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Badge } from '../ui/Badge';
import { useNavigate, Link } from 'react-router-dom';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';
import { Button } from '../ui/Button';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { role, profile, signOut, updateAvatar } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile?.avatar || '');
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAvatarUrlInput(profile?.avatar || '');
    setImgLoadFailed(false);
  }, [profile?.avatar]);

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

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (avatarUrlInput.trim()) {
      updateAvatar(avatarUrlInput.trim());
      setImgLoadFailed(false);
    }
    setIsAvatarModalOpen(false);
    setShowProfileMenu(false);
  };

  const handleResetToInitials = () => {
    updateAvatar('');
    setAvatarUrlInput('');
    setImgLoadFailed(true);
    setIsAvatarModalOpen(false);
    setShowProfileMenu(false);
  };

  const userName = role === 'teacher' ? 'Ahmad' : (profile?.name && !profile.name.toLowerCase().includes('bilal') ? profile.name : 'Student Scholar');
  const userInitials = role === 'teacher' ? 'A' : (userName ? userName[0].toUpperCase() : 'S');

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#e1ede7] sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Logo & Global Search */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 max-w-lg min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors focus:outline-none"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* StudyHub Brand Logo in Header */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#142D27] to-[#14B866] text-white shadow-2xs ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#142D27] leading-none font-serif">
              Study<span className="text-[#14B866]">Hub</span>
            </span>
            <span className="text-[9px] font-semibold text-zinc-400 tracking-wider uppercase leading-tight">
              Academic Portal
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-zinc-200 mx-1 hidden sm:block shrink-0" />

        {/* Global Search Bar */}
        <div className="relative w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            aria-label="Global search across subjects and assignments"
            placeholder="Search syllabus, tests, or topics..."
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-zinc-200 bg-zinc-50 text-xs text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-emerald-600 transition-all"
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
            {profile?.avatar && !imgLoadFailed ? (
              <img
                src={profile.avatar}
                alt={userName}
                onError={() => setImgLoadFailed(true)}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-zinc-200"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#142D27] to-[#14B866] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-1 ring-emerald-600/30">
                {userInitials}
              </div>
            )}
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-zinc-900 leading-tight">
                {userName}
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
              <div className="p-3 border-b border-zinc-100 flex items-center gap-2.5">
                {profile?.avatar && !imgLoadFailed ? (
                  <img
                    src={profile.avatar}
                    alt={userName}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#142D27] to-[#14B866] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{userName}</p>
                  <p className="text-[11px] text-zinc-500 truncate">
                    {role === 'teacher' ? 'Faculty Lead & Academic Director' : '1st Year Scholar'}
                  </p>
                  <div className="mt-1">
                    <Badge variant={role === 'teacher' ? 'primary' : 'info'} size="sm" dot>
                      {role === 'teacher' ? 'Faculty Lead' : 'Enrolled Student'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    setIsAvatarModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Update Profile Picture</span>
                </button>

                <Link
                  to="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-700 font-medium rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>Security & 2FA Authenticator</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 font-medium rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Sign Out</span>
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

      {/* Profile Photo Update Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Change Profile Picture</h3>
                  <p className="text-[11px] text-zinc-500">Paste your Gmail, Google, or direct image URL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              {avatarUrlInput.trim() ? (
                <img
                  src={avatarUrlInput}
                  alt="Preview"
                  onError={() => setImgLoadFailed(true)}
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-emerald-500 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#142D27] to-[#14B866] text-white flex items-center justify-center font-bold text-lg ring-2 ring-emerald-500">
                  {userInitials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-zinc-900 block truncate">{userName}</span>
                <span className="text-[11px] text-zinc-500 block truncate">
                  {role === 'teacher' ? 'Faculty Lead' : '1st Year Scholar'}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Live real-time preview
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAvatar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Image Address / URL
                </label>
                <input
                  type="url"
                  placeholder="https://... (paste direct image URL)"
                  value={avatarUrlInput}
                  onChange={(e) => {
                    setAvatarUrlInput(e.target.value);
                    setImgLoadFailed(false);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 text-zinc-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetToInitials}
                  className="text-xs text-zinc-500 hover:text-zinc-800 underline"
                >
                  Use Clean Initials ({userInitials})
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900"
                  >
                    Cancel
                  </button>
                  <Button type="submit" variant="primary" size="sm">
                    Save Picture
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BISE DG Khan Modal Accessible from Anywhere */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </header>
  );
};
