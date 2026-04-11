import React from 'react';
import { cn } from '../../lib/utils';

interface BaseProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Page({ children, className, ...props }: BaseProps) {
  return (
    <div className={cn("flex-1 flex flex-col bg-editor-bg text-theme-text selection:bg-theme-primary selection:text-white", className)} {...props}>
      {children}
    </div>
  );
}

export function Container({ children, className, ...props }: BaseProps) {
  return (
    <div className={cn("container mx-auto px-4", className)} {...props}>
      {children}
    </div>
  );
}

interface SectionProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  variant?: 'default' | 'hero';
  animate?: 'fade-in' | 'slide-up' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerClassName?: string;
}

export function Section({ 
  children, 
  size = 'lg', 
  variant = 'default',
  padding = 'lg',
  animate = 'none', 
  className, 
  containerClassName,
  ...props 
}: SectionProps) {
  const sizeMap = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    none: '',
  };

  const paddingMap = {
    none: 'py-0 px-4',
    sm: 'py-8 md:py-12 px-4',
    md: 'py-12 md:py-16 px-4',
    lg: 'py-16 md:py-24 px-4',
    xl: 'py-20 md:py-32 px-4',
  };

  const animationMap = {
    'fade-in': 'animate-in fade-in duration-700',
    'slide-up': 'animate-in fade-in slide-in-from-bottom-8 duration-700',
    none: '',
  };

  const variantMap = {
    default: '',
    hero: 'section-hero relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-4 text-center',
  };

  return (
    <section className={cn(variantMap[variant], paddingMap[padding], className)} {...props}>
      <div className={cn(
        "container mx-auto", 
        sizeMap[size], 
        animationMap[animate],
        containerClassName
      )}>
        {children}
      </div>
    </section>
  );
}

interface StackProps extends BaseProps {
  gap?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  align?: 'start' | 'center' | 'end' | 'stretch';
  divider?: boolean;
}

export function Stack({ children, gap = 4, align = 'start', divider = false, className, ...props }: StackProps) {
  const gapMap = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    12: 'gap-12',
  };
  
  const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  return (
    <div className={cn(
      "flex flex-col", 
      gapMap[gap as keyof typeof gapMap], 
      alignMap[align], 
      divider && "divide-y divide-white/5",
      className
    )} {...props}>
      {children}
    </div>
  );
}

interface GridProps extends BaseProps {
  cols?: 1 | 2 | 3 | 4;
  gap?: 0 | 2 | 4 | 8 | 12;
  divide?: 'none' | 'x' | 'y' | 'md:x' | 'both';
}

export function Grid({ children, cols = 1, gap = 8, divide = 'none', className, ...props }: GridProps) {
  const colMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapMap = {
    0: 'gap-0',
    2: 'gap-2',
    4: 'gap-4',
    8: 'gap-8',
    12: 'gap-12',
  };

  const divideMap = {
    none: '',
    x: 'divide-x divide-white/10',
    y: 'divide-y divide-white/10',
    'md:x': 'divide-y md:divide-y-0 md:divide-x divide-white/10',
    both: 'divide-y divide-x divide-white/10',
  };

  return (
    <div className={cn(
      "grid", 
      colMap[cols as keyof typeof colMap], 
      gapMap[gap as keyof typeof gapMap], 
      divideMap[divide],
      className
    )} {...props}>
      {children}
    </div>
  );
}

interface FlexProps extends BaseProps {
  justify?: 'start' | 'center' | 'end' | 'between';
  items?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 2 | 3 | 4 | 6 | 8 | 12;
  wrap?: boolean;
}

export function Flex({ children, justify = 'start', items = 'center', gap, wrap, className, ...props }: FlexProps) {
  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const itemsMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapMap = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
    12: 'gap-12',
  };

  return (
    <div className={cn(
      "flex", 
      justifyMap[justify], 
      itemsMap[items], 
      gap && gapMap[gap as keyof typeof gapMap],
      wrap && "flex-wrap",
      className
    )} {...props}>
      {children}
    </div>
  );
}
