import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEditorStore } from '../store/useEditorStore';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}: DialogProps) {
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={cn(
          "w-full overflow-hidden rounded-xl shadow-2xl border animate-in zoom-in duration-200",
          maxWidthClasses[maxWidth],
          isDark 
            ? "bg-[#252526] border-border text-gray-200" 
            : "bg-white border-gray-300 text-gray-900"
        )}
      >
        {/* Header */}
        <div 
          className={cn(
            "px-6 py-4 border-b flex items-center justify-between",
            isDark ? "border-border bg-[#2a2d2e]" : "border-gray-200 bg-gray-50"
          )}
        >
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div 
            className={cn(
              "px-6 py-4 border-t flex items-center justify-end gap-3",
              isDark ? "border-border bg-[#2a2d2e]" : "border-gray-200 bg-gray-50"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
