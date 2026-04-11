import { useState, useRef, useEffect } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { useEditorStore } from '../store/useEditorStore';
import { cn } from '../lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  title?: string;
  isActive?: boolean;
  className?: string;
}

export function Dropdown({
  value,
  onChange,
  options,
  title,
  isActive = false,
  className = '',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  const selectedLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={title}
        className={cn(
          "px-2 pr-1 h-9 text-sm rounded transition-all border flex items-center gap-1",
          isDark
            ? "bg-button-inactive-dark hover:bg-button-hover-dark text-gray-300 border-border"
            : "bg-button-inactive-light hover:bg-button-hover-light text-gray-700 border-gray-300",
          isActive && "border-theme-primary ring-1 ring-theme-primary/20",
          className
        )}
      >
        <span className="px-1">{selectedLabel}</span>
        <LuChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full left-0 mt-1 min-w-full rounded-md border shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150",
          isDark
            ? "bg-editor-surface border-border"
            : "bg-white border-gray-200"
        )}>
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-1.5 text-sm text-left transition-colors",
                option.value === value
                  ? "bg-theme-primary text-white"
                  : isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-100"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
