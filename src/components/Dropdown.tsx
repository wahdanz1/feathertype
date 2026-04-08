import { ReactNode } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { cn } from '../lib/utils';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  isActive?: boolean;
  className?: string;
  children: ReactNode;
}

export function Dropdown({
  value,
  onChange,
  title,
  isActive = false,
  className = '',
  children,
}: DropdownProps) {
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className={cn(
        "px-2 h-9 text-sm rounded cursor-pointer transition-all border",
        isDark 
          ? "bg-button-inactive-dark hover:bg-button-hover-dark text-gray-300 border-border" 
          : "bg-button-inactive-light hover:bg-button-hover-light text-gray-700 border-gray-300",
        isActive && "border-theme-primary ring-1 ring-theme-primary/20",
        className
      )}
    >
      {children}
    </select>
  );
}
