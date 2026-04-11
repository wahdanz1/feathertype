import React from 'react';
import { cn } from '../../lib/utils';

interface FieldProps {
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2 group", className)}>
      {label && (
        <label className="text-sm font-medium group-focus-within:text-theme-primary transition-colors block pl-1">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}
