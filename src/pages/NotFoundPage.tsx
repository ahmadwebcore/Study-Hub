import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Home,
  BookOpen,
  Calendar,
  ArrowLeft,
  Compass,
  FileQuestion,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12 select-none">
      {/* Crisp 404 Badge */}
      <div className="w-16 h-16 rounded-2xl bg-white border border-[#e1ede7] flex items-center justify-center text-[#14B866] mb-5">
        <GraduationCap className="h-8 w-8" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#d2e3dc] text-[11px] font-bold uppercase tracking-wider text-[#142D27] mb-3">
        <span>Error 404</span>
        <span>•</span>
        <span>Route Not Found</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142D27] tracking-tight">
        Academic Route Not Found
      </h1>

      <p className="text-xs sm:text-sm text-[#557067] max-w-md mt-2.5 leading-relaxed">
        The requested syllabus module, document, or assessment route does not exist or has been archived by faculty administration.
      </p>

      {/* Primary Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="primary"
          size="sm"
          icon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>

        <Button
          variant="outline"
          size="sm"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>

        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            icon={<Compass className="w-4 h-4 text-[#14B866]" />}
          >
            Go to Academic Dashboard
          </Button>
        </Link>
      </div>

      {/* Helpful Quick Navigation Links */}
      <div className="mt-10 pt-6 border-t border-[#e1ede7] max-w-lg w-full">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#7d9990] mb-3">
          Quick Access Terminals:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-left">
          <Link
            to="/library"
            className="p-2.5 rounded-xl border border-[#e1ede7] bg-white hover:border-[#14B866] transition-colors flex items-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#14B866]" />
            <span className="text-xs font-bold text-[#142D27]">Book Library</span>
          </Link>

          <Link
            to="/tests"
            className="p-2.5 rounded-xl border border-[#e1ede7] bg-white hover:border-[#14B866] transition-colors flex items-center gap-2"
          >
            <FileQuestion className="w-3.5 h-3.5 text-sky-600" />
            <span className="text-xs font-bold text-[#142D27]">Test Center</span>
          </Link>

          <Link
            to="/planner"
            className="p-2.5 rounded-xl border border-[#e1ede7] bg-white hover:border-[#14B866] transition-colors flex items-center gap-2 col-span-2 sm:col-span-1"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-bold text-[#142D27]">Study Planner</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
