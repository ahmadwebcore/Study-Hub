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
        'h-full flex flex-col bg-white border-r border-[#e1ede7] select-none transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64 xl:w-72'
      )}
      aria-label="Main Navigation Sidebar"
    >
      {/* Brand Header */}
      <div
        className={cn(
          'h-16 flex items-center border-b border-[#e1ede7] transition-all',
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
              <span className="font-extrabold text-xs sm:text-sm tracking-tight text-[#142D27] leading-tight font-serif truncate">
                Global Science Academy
              </span>
              <span className="text-[10px] font-semibold text-[#14B866] -mt-0.5 tracking-wider uppercase">
                Fatehpur &bull; DG Khan
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Role Perspective Switcher Pill (Only visible to Teacher account - Completely locked from Students) */}
      {!isCollapsed && canSwitchRole && (
        <div
          className={cn(
            'p-3 mx-3 my-2.5 rounded-2xl border transition-all shadow-2xs',
            role === 'teacher'
              ? 'bg-[#F7F9F8] border-[#e1ede7]'
              : 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/30'
          )}
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span
              className={cn(
                'font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1',
                role === 'teacher' ? 'text-[#557067]' : 'text-emerald-800'
              )}
            >
              {role === 'teacher' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
                  Faculty Authority
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                  Student Preview
                </>
              )}
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-1.5 py-0.2 rounded-full',
                role === 'teacher'
                  ? 'bg-white text-[#142D27] border border-[#e1ede7]'
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
                ? 'bg-white border border-[#e1ede7] text-[#263B35] hover:bg-[#e8f8f0] hover:text-[#14B866] hover:border-[#14B866]/40'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border border-emerald-600 shadow-sm'
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
                  <Eye className="w-3.5 h-3.5 text-[#14B866]" />
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
              className={cn('w-3.5 h-3.5', role === 'teacher' ? 'text-[#7d9990]' : 'text-emerald-200')}
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
                <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#7d9990]">
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
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/90 font-bold shadow-2xs'
                          : 'text-[#557067] hover:bg-[#E7EFEA]/70 hover:text-[#142D27] border border-transparent'
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
                                ? 'text-emerald-700'
                                : 'text-[#7d9990] group-hover:text-[#142D27]'
                            )}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>

                        {item.badge && !isCollapsed && (
                          <span
                            className={cn(
                              'ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : item.badgeVariant === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : item.badgeVariant === 'info'
                                ? 'bg-sky-100 text-sky-800'
                                : item.badgeVariant === 'holiday'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-[#E7EFEA] text-[#142D27]'
                            )}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.badge && isCollapsed && (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
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

      {/* Bottom Section */}
      <div className={cn('border-t border-[#e1ede7] space-y-2', isCollapsed ? 'p-2' : 'p-3')}>
        {/* BISE DG Khan Fast Access */}
        <button
          type="button"
          onClick={() => setIsBoardModalOpen(true)}
          className={cn(
            'w-full rounded-xl bg-[#F7F9F8] border border-[#e1ede7] text-[#142D27] hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center group shadow-2xs cursor-pointer',
            isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2.5 text-left'
          )}
          title="BISE DG Khan 1st Year FA-IT Desk"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇵🇰</span>
            {!isCollapsed && (
              <div>
                <span className="text-xs font-bold block leading-none text-[#142D27]">BISE DG Khan</span>
                <span className="text-[10px] text-[#557067] group-hover:text-emerald-700">1st Year FA-IT Desk</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* Pakistan Calendar Badge (Only in expanded view) */}
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <span>🇵🇰</span>
              <span>Pakistan Academic Calendar</span>
            </div>
            <p className="text-[10px] text-emerald-800 mt-0.5 leading-snug">
              Sundays & Gazetted Holidays are strictly OFF. No exam submissions or tasks due.
            </p>
          </div>
        )}

        {/* User Account Session Info */}
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center rounded-xl text-[11px] font-semibold text-zinc-700 hover:bg-[#F7F9F8] border border-[#e1ede7] transition-all',
            isCollapsed ? 'justify-center p-2.5' : 'justify-between p-2'
          )}
          title={role === 'teacher' ? 'Ahmad (Faculty Lead)' : 'Henza Noor (Student)'}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#14B866] shrink-0" />
            {!isCollapsed && (
              <span className="truncate text-[11px]">
                {role === 'teacher' ? 'Ahmad (Faculty Lead)' : 'Henza Noor (Student)'}
              </span>
            )}
          </div>
          {!isCollapsed && <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />}
        </NavLink>
      </div>

      {/* BISE DG Khan Modal */}
      <BISEDGKhanModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
      />
    </aside>
  );
};
