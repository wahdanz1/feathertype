import React from 'react';
import { cn } from '../../lib/utils';

interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function IconBox({
  icon,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: IconBoxProps) {
  const variantStyles = {
    primary: 'bg-theme-primary/10 text-theme-primary',
    secondary: 'bg-white/5 border border-white/10 text-theme-text-muted',
    ghost: 'bg-transparent text-gray-500',
  };

  const sizeStyles = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-lg',
    lg: 'h-12 w-12 rounded-xl',
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 transition-all duration-300",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {React.cloneElement(icon as React.ReactElement<{ size?: number }>, {
        size: size === 'sm' ? 16 : size === 'md' ? 20 : 24
      })}
    </div>
  );
}
