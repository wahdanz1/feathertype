import { ReactNode } from 'react';
import { useEditorStore } from '../store/useEditorStore';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  iconOnly?: boolean;
  onClick?: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  iconOnly = false,
  onClick,
  title,
  className = '',
  children,
}: ButtonProps) {
  const theme = useEditorStore((s) => s.theme);

  // Base styles
  const baseStyles = 'rounded text-sm leading-none flex items-center justify-center';

  // Padding based on iconOnly
  const paddingStyles = iconOnly ? 'p-2' : 'px-3 py-2';

  // Border styles - primary buttons get theme-colored border, secondary get subtle grey border
  const borderStyles = variant === 'primary'
    ? 'border border-theme-primary'
    : (theme === 'dark' ? 'border border-[#3e3e42]' : 'border border-gray-300');

  // Variant styles
  const variantStyles = {
    primary: 'bg-theme-primary hover:bg-theme-primary-hover text-white',
    secondary:
      theme === 'dark'
        ? 'bg-button-inactive-dark hover:bg-button-hover-dark text-gray-300'
        : 'bg-button-inactive-light hover:bg-button-hover-light text-gray-700',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseStyles} ${paddingStyles} ${borderStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
