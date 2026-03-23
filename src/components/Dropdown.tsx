import { ReactNode } from 'react';
import { useEditorStore } from '../store/useEditorStore';

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

  // Base styles with explicit height to match buttons
  const baseStyles = 'px-2 h-9 text-sm rounded transition-colors cursor-pointer';

  // Background and text colors based on theme
  const colorStyles = theme === 'dark'
    ? 'bg-button-inactive-dark hover:bg-button-hover-dark text-gray-300'
    : 'bg-button-inactive-light hover:bg-button-hover-light text-gray-700';

  // Border styles - active state gets blue border
  const borderStyles = isActive
    ? 'border border-theme-primary'
    : (theme === 'dark' ? 'border border-[#3e3e42]' : 'border border-gray-300');

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className={`${baseStyles} ${colorStyles} ${borderStyles} ${className}`}
    >
      {children}
    </select>
  );
}
