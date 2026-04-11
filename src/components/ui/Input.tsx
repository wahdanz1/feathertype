import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-12 bg-white/5 border border-white/10 rounded-md px-4 text-white focus:outline-none focus:border-theme-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-theme-text-muted",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
