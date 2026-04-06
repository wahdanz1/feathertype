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

  // Base styles with flex-shrink-0 to prevent squishing/blurriness
  const baseStyles = 'rounded-md text-sm leading-none flex items-center justify-center flex-shrink-0 h-9';

  // Padding based on iconOnly - force exactly 36x36 square (w-9 h-9)
  const paddingStyles = iconOnly ? 'w-9 px-0' : 'px-3';

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
