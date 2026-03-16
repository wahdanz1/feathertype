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

  // Variant styles
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    secondary:
      theme === 'dark'
        ? 'bg-secondary-dark hover:bg-secondary-dark-hover text-gray-300'
        : 'bg-secondary-light hover:bg-secondary-light-hover text-gray-700',
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`${baseStyles} ${paddingStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
