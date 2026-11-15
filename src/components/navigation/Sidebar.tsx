import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ListTree,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  Award,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Library,
  CheckCircle2,
  FileText,
  Clock,
  FolderArchive,
  Bot,
  BookMarked,
  MessageSquare,
  Share2,
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
    title: 'Workspace',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Direct Chat (1-on-1)', path: '/chat', icon: MessageSquare, badge: 'Live', badgeVariant: 'primary' },
      { name: 'AI Study Assistant', path: '/ai-teacher', icon: Bot, badge: 'Multilingual', badgeVariant: 'primary' },
      { name: 'Grammar Hub', path: '/grammar', icon: BookMarked, badge: 'Urdu & Eng', badgeVariant: 'warning' },
    ],
  },
  {
    title: 'Daily Schedule & Tasks',
    items: [
      { name: 'Daily Tasks & Quota', path: '/weekly-tasks', icon: CalendarDays, badge: 'Sun & PK Off', badgeVariant: 'holiday' },
      { name: 'Daily Test Desk (Submit)', path: '/test-submit', icon: FileText, badge: 'Live 30M', badgeVariant: 'warning' },
      { name: 'Completed Work', path: '/completed-work', icon: CheckCircle2, badge: 'Verified', badgeVariant: 'primary' },
      { name: 'Study Planner', path: '/planner', icon: Clock, badge: 'Feb 28 Target', badgeVariant: 'info' },
    ],
  },
  {
    title: 'FA-IT 6 Books & Academics',
    items: [
      { name: 'All 6 Subjects', path: '/subjects', icon: BookOpen },
      { name: 'Book Library', path: '/library', icon: Library, badge: 'PTB Quota' },
      { name: 'Official Syllabus', path: '/syllabus', icon: ListTree, badge: 'DGK Scheme' },
      { name: 'Media Center', path: '/media', icon: FolderArchive, badge: 'Uploads' },
      { name: 'Students Cohort', path: '/students', icon: Users, badge: 'FA-IT Group', teacherOnly: true },
    ],
  },
  {
    title: 'Testing, Marks & Records',
    items: [
      { name: 'Tests & Quizzes (5-Box)', path: '/tests', icon: GraduationCap, badge: '30 Marks', badgeVariant: 'info' },
      { name: 'Submissions Review', path: '/submissions', icon: ClipboardList, badge: 3, badgeVariant: 'warning', teacherOnly: true },
      { name: 'Results & Report Cards', path: '/results', icon: Award, badge: 'Board Grade', badgeVariant: 'primary' },
      { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'Integrations & Setup',
    items: [
      { name: 'Integrations (GSheets & WA)', path: '/integrations', icon: Share2, badge: 'Non-API', badgeVariant: 'primary' },
      { name: 'Settings & Security', path: '/settings', icon: ShieldCheck, badge: '2FA' },
    ],
  },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { role, toggleRole } = useRole();
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);

  return (
    <aside
      className="h-full flex flex-col bg-white border-r border-[#e1ede7] select-none w-64 xl:w-72"
      aria-label="Main Navigation Sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-[#e1ede7] justify-between">
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 group focus:outline-none"
          onClick={onCloseMobile}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#142D27] text-[#14B866] shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#142D27]">
                Study<span className="text-[#14B866]">Hub</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Portal
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#7d9990] -mt-0.5">
              Academic Workspace
            </span>
          </div>
        </NavLink>
      </div>

      {/* Role Perspective Switcher Pill (Teacher only - locked from student) */}
      {role === 'teacher' && (
        <div className="p-3 mx-3 my-2.5 rounded-xl bg-[#F7F9F8] border border-[#e1ede7]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#557067] font-semibold uppercase tracking-wider text-[9px]">
              Perspective Mode
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#142D27]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#14B866]" />
              Faculty Lead
            </span>
          </div>
          <button
            onClick={toggleRole}
            className="w-full flex items-center justify-between py-1.5 px-2.5 rounded-lg text-xs font-semibold bg-white border border-[#e1ede7] text-[#263B35] hover:bg-[#e8f8f0] hover:text-[#14B866] hover:border-[#14B866]/40 transition-all duration-150 active:scale-[0.98]"
            title="Preview student perspective"
          >
            <span>Preview Student View</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#7d9990]" />
          </button>
        </div>
      )}

      {/* Main Navigation Links Grouped by Section */}
      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (item.teacherOnly && role !== 'teacher') return false;
            if (item.studentOnly && role !== 'student') return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-0.5">
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#7d9990]">
                {section.title}
              </p>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                      isActive
                        ? 'bg-[#142D27] text-white shadow-sm'
                        : 'text-[#557067] hover:bg-[#E7EFEA]/70 hover:text-[#142D27]'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive ? 'text-[#14B866]' : 'text-[#7d9990] group-hover:text-[#142D27]'
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            'ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0',
                            isActive
                              ? 'bg-[#14B866] text-white'
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
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Pakistan Calendar Policy Card & Email Status (Bottom Section) */}
      <div className="p-3 border-t border-[#e1ede7] space-y-2">
        {/* BISE DG Khan Fast Access */}
        <button
          type="button"
          onClick={() => setIsBoardModalOpen(true)}
          className="w-full p-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center justify-between group text-left shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🇵🇰</span>
            <div>
              <span className="text-xs font-bold block leading-none">BISE DG Khan</span>
              <span className="text-[10px] text-zinc-400">1st Year FA-IT Desk</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Pakistan Calendar Badge */}
        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px]">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950">
            <span>🇵🇰</span>
            <span>Pakistan Academic Calendar</span>
          </div>
          <p className="text-[10px] text-emerald-800 mt-0.5 leading-snug">
            Sundays & Gazetted Holidays are strictly OFF. No exam submissions or tasks due.
          </p>
        </div>

        {/* User Account Session Info */}
        <NavLink
          to="/settings"
          className="flex items-center justify-between p-2 rounded-xl text-[11px] font-semibold text-zinc-700 hover:bg-[#F7F9F8] border border-[#e1ede7] transition-all"
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#14B866] shrink-0" />
            <span className="truncate text-[11px]">
              {role === 'teacher' ? 'Ahmad (Faculty Lead)' : 'Student Scholar'}
            </span>
          </div>
          <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
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
