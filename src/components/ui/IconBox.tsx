import React from 'react';
import { cn } from '../../lib/utils';

interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'solid' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    solid: 'bg-theme-primary text-white shadow-lg',
    secondary: 'bg-white/5 border border-white/10 text-theme-text-muted',
    ghost: 'bg-transparent text-theme-text-muted',
  };

  const sizeStyles = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-lg',
    lg: 'h-12 w-12 rounded-xl',
    xl: 'h-20 w-20 rounded-2xl',
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
        size: size === 'sm' ? 16 : size === 'md' ? 20 : size === 'lg' ? 24 : 48
      })}
    </div>
  );
}
