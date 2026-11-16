import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow || 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto overscroll-contain bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full max-h-[92dvh] sm:max-h-[88vh] rounded-3xl bg-white shadow-2xl border border-zinc-200 z-10 transition-all transform animate-in zoom-in-95 duration-200 flex flex-col my-auto overflow-hidden text-zinc-900',
          maxWidths[maxWidth]
        )}
      >
        {/* Fixed Header */}
        <div className="shrink-0 flex items-start justify-between p-4 sm:p-5 border-b border-[#e1ede7] bg-[#F7F9F8]">
          <div className="pr-2 min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-[#142D27] leading-snug">{title}</h3>
            {description && <p className="text-xs text-[#557067] mt-0.5 leading-relaxed">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-200/70 hover:text-zinc-900 transition-colors cursor-pointer shrink-0 ml-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
