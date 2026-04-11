import React from 'react';
import { cn } from '../../lib/utils';

interface TypographyProps extends React.HTMLAttributes<HTMLParagraphElement | HTMLSpanElement> {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

interface CaptionProps extends TypographyProps {
  variant?: 'default' | 'muted';
}

const captionVariants = {
  default: "font-bold text-theme-accent/70",
  muted: "font-medium text-theme-text-muted",
};

export function Caption({ children, as: Component = 'p', variant = 'default', className, ...props }: CaptionProps) {
  return (
    <Component
      className={cn(
        "text-[10px] uppercase tracking-widest",
        captionVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function Subtle({ children, as: Component = 'p', className, ...props }: TypographyProps) {
  return (
    <Component
      className={cn(
        "text-sm text-theme-text-muted font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
