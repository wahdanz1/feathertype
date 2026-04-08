import { ReactNode } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { cn } from '../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
  isActive?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  isActive = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const theme = useEditorStore((s) => s.theme);
  const isDark = theme === 'dark';

  const baseStyles = 'rounded-md text-sm font-medium leading-none flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.98]';
  
  const sizeStyles = {
    sm: iconOnly ? 'h-8 w-8' : 'h-8 px-2.5',
    md: iconOnly ? 'h-9 w-9' : 'h-9 px-4',
    lg: iconOnly ? 'h-14 w-14' : 'h-14 px-10 text-lg font-semibold',
  };

  const variantStyles = {
    primary: cn(
      'bg-theme-primary text-white border transition-colors',
      isDark ? 'border-theme-primary-border' : 'border-theme-primary-border',
      'hover:bg-theme-primary-hover shadow-sm'
    ),
    secondary: cn(
      'border transition-colors',
      isDark 
        ? 'bg-button-inactive-dark border-border text-gray-300 hover:bg-button-hover-dark' 
        : 'bg-button-inactive-light border-gray-300 text-gray-700 hover:bg-button-hover-light',
      isActive && (isDark ? 'bg-button-active-dark border-theme-primary' : 'bg-button-active-light border-theme-primary shadow-inner')
    ),
    ghost: cn(
      'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white',
      isActive && 'text-theme-primary'
    )
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
