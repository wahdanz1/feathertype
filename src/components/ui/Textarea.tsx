import React from 'react';
import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-white focus:outline-none focus:border-theme-primary/50 focus:bg-white/[0.07] transition-all placeholder:text-theme-text-muted resize-none",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
