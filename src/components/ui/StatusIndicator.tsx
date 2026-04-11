import { cn } from '../../lib/utils';

interface StatusIndicatorProps {
  active?: boolean;
  variant?: 'primary' | 'success' | 'warning';
  className?: string;
}

export function StatusIndicator({ 
  active = false, 
  variant = 'primary', 
  className 
}: StatusIndicatorProps) {
  const variantClasses = {
    primary: active ? "bg-theme-primary" : "bg-border/20 group-hover:bg-theme-primary/30",
    success: active ? "bg-green-500" : "bg-border/20 group-hover:bg-green-500/30",
    warning: active ? "bg-yellow-500" : "bg-border/20 group-hover:bg-yellow-500/30",
  };

  return (
    <div className={cn(
      "absolute -left-[1px] top-0 bottom-0 w-[3px] transition-colors rounded-l-2xl z-10",
      variantClasses[variant],
      className
    )} />
  );
}
