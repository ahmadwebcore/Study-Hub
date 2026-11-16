import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTree,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  Award,
  ChevronRight,
  ShieldCheck,
  Library,
  CheckCircle2,
  FolderArchive,
  BookMarked,
  Share2,
  Eye,
  X,
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import { cn } from '../../lib/utils';
import { BISEDGKhanModal } from '../board/BISEDGKhanModal';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'primary' | 'warning' | 'info' | 'holiday';
  teacherOnly?: boolean;
  studentOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Core Workspace',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Daily Test Series', path: '/tests', icon: GraduationCap, badge: '30 Marks', badgeVariant: 'primary' },
      { name: 'Submitted Tests', path: '/submissions', icon: ClipboardList, badge: 'Review', badgeVariant: 'warning' },
      { name: 'Completed Work', path: '/completed-work', icon: CheckCircle2, badge: 'Verified', badgeVariant: 'primary' },
      { name: 'Grammar Hub', path: '/grammar', icon: BookMarked, badge: 'FA-IT', badgeVariant: 'warning' },
    ],
  },
  {
    title: 'Academics & Schedule',
    items: [
      { name: 'Daily Tasks & Quota', path: '/weekly-tasks', icon: CalendarDays, badge: 'Sundays OFF', badgeVariant: 'holiday' },
      { name: 'Syllabus & Targets', path: '/syllabus', icon: ListTree, badge: 'Feb 28' },
      { name: 'Book Library', path: '/library', icon: Library, badge: 'DG Khan' },
      { name: 'Media Center', path: '/media', icon: FolderArchive },
      { name: 'Results & Report Cards', path: '/results', icon: Award },
    ],
  },
  {
    title: 'System & Tools',
    items: [
      { name: 'Platform Integrations', path: '/integrations', icon: Share2, badge: 'WhatsApp', badgeVariant: 'primary' },
      { name: 'Settings & Security', path: '/settings', icon: ShieldCheck, badge: '2FA' },
    ],
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  isCollapsed = false,
}) => {
  const { role, toggleRole, canSwitchRole } = useRole();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  return (
    <aside
      className={cn(
        'h-full w-full flex flex-col bg-[#121514] border-r border-white/10 select-none transition-all duration-300 text-zinc-300',
        isCollapsed ? 'w-20' : 'w-full lg:w-64 xl:w-72'
      )}
      aria-label="Main Navigation Sidebar"
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-white/10 transition-all shrink-0',
          isCollapsed ? 'justify-center px-2 relative' : 'justify-between px-4 sm:px-5'
        )}
      >
        <NavLink
          to="/dashboard"
          className="flex items-center gap-2.5 group focus:outline-none min-w-0"
          onClick={onCloseMobile}
          title="Global Science Academy, Fatehpur"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-white leading-tight font-serif truncate">
                Global Science Academy
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 -mt-0.5 tracking-wider uppercase">
                Fatehpur &bull; DG Khan
              </span>
            </div>
          )}
        </NavLink>

        {/* Mobile Integrated Close Button */}
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Role Perspective Switcher Pill (Only visible to Teacher account - Completely locked from Students) */}
      {!isCollapsed && canSwitchRole && (
        <div
          className={cn(
            'p-3 mx-3 my-2.5 rounded-2xl border transition-all shadow-2xs',
            role === 'teacher'
              ? 'bg-[#1a1e1d] border-white/10'
              : 'bg-emerald-950/80 border-emerald-500/40 ring-1 ring-emerald-500/30'
          )}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className={cn(
                'font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1',
                role === 'teacher' ? 'text-zinc-400' : 'text-emerald-300'
              )}
            >
              {role === 'teacher' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Faculty Authority
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Student Preview
                </>
              )}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.2 rounded-full',
                role === 'teacher'
                  ? 'bg-[#222826] text-white border border-white/10'
                  : 'bg-emerald-700 text-white shadow-2xs'
              )}
            >
              {role === 'teacher' ? 'Ahmad' : 'Henza View'}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleRole}
            className={cn(
              'w-full flex items-center justify-between py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 active:scale-[0.98] cursor-pointer shadow-2xs',
              role === 'teacher'
                ? 'bg-[#222826] border border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 shadow-sm'
            )}
            title={
              role === 'teacher'
                ? 'Preview student perspective (Henza Noor)'
                : 'Convert / Switch back to Teacher (Faculty Lead Ahmad)'
            }
          >
            <span className="flex items-center gap-1.5">
              {role === 'teacher' ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  Preview Student View
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  Convert to Teacher (Ahmad)
                </>
              )}
            </span>
            <ChevronRight
              className={cn('w-3.5 h-3.5', role === 'teacher' ? 'text-zinc-400' : 'text-emerald-200')}
            />
          </button>
        </div>
      )}

      {/* Main Navigation Links Grouped by Section */}
      <nav className={cn('flex-1 overflow-y-auto py-2 space-y-4', isCollapsed ? 'px-2' : 'px-3')}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.teacherOnly && role !== 'teacher') return false;
            if (item.studentOnly && role !== 'student') return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed && (
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => {
                const targetPath =
                  item.name === 'Submitted Tests' && role === 'student'
                    ? '/completed-work'
                    : item.path;
                return (
                  <NavLink
                    key={item.name}
                    to={targetPath}
                    end={targetPath === '/'}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      cn(
                        'group relative flex items-center rounded-xl text-xs font-medium transition-all duration-150',
                        isCollapsed
                          ? 'justify-center p-2.5'
                          : 'justify-between px-2.5 py-2',
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={cn('flex items-center gap-2.5 min-w-0', isCollapsed && 'justify-center')}>
                          <item.icon
                            className={cn(
                              'shrink-0 transition-colors',
                              isCollapsed ? 'h-5 w-5' : 'h-4 w-4',
                              isActive
                                ? 'text-white'
                                : 'text-zinc-400 group-hover:text-white'
                            )}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>

                        {item.badge && !isCollapsed && (
                          <span
                            className={cn(
                              'ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                              isActive
                                ? 'bg-white text-emerald-950'
                                : item.badgeVariant === 'warning'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : item.badgeVariant === 'info'
                                ? 'bg-sky-950 text-sky-300 border border-sky-800'
                                : item.badgeVariant === 'holiday'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-white/10 text-zinc-300'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.badge && isCollapsed && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[#121514]" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section: Streamlined & Clutter-Free */}
      <div className={cn('border-t border-white/10 space-y-1.5 shrink-0', isCollapsed ? 'p-2' : 'p-3')}>
        {/* BISE DG Khan Fast Access (Sleek 1-line link) */}
        <button
          type="button"
          onClick={() => setIsBoardModalOpen(true)}
          className={cn(
            'w-full rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-center group cursor-pointer',
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2 text-left'
          )}
          title="BISE DG Khan 1st Year FA-IT Desk"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">🇵🇰</span>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                BISE DG Khan Portal
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider shrink-0">
              FA-IT
            </span>
          )}
        </button>

        {/* User Account Session Info */}
        <div
          className={cn(
            'flex items-center rounded-xl border border-white/10 bg-[#161a19] transition-all',
            isCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
              {role === 'teacher' ? 'A' : 'H'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {role === 'teacher' ? 'Ahmad' : 'Henza Noor'}
                </span>
                <span className="text-[10px] text-zinc-400 block leading-tight">
                  {role === 'teacher' ? 'Faculty Lead' : '1st Year FA-IT'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <NavLink
              to="/settings"
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              title="Settings & 2FA"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </NavLink>
          )}
        </div>
      </div>

      {/* BISE DG Khan Modal */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </aside>
  );
};
