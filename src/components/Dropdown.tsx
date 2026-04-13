import { useState, useRef, useEffect } from 'react';
import { LuChevronDown } from 'react-icons/lu';
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
          "dropdown-trigger text-secondary min-w-[7.5rem] justify-between",
          isActive && "border-theme-primary ring-1 ring-theme-primary/20",
          className
        )}
      >
        <span className="px-1">{selectedLabel}</span>
        <LuChevronDown size={14} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="panel absolute top-full left-0 mt-1 min-w-full rounded-md z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
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
                  : "text-secondary menu-item !px-4 !py-1.5"
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
