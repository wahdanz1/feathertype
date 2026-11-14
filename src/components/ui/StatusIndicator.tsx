import { cn } from '../../lib/utils';

interface StatusIndicatorProps {
  active?: boolean;
  className?: string;
}

export function StatusIndicator({ active = false, className }: StatusIndicatorProps) {
  return (
    <div className={cn(
      "absolute -left-[1px] top-0 bottom-0 w-[3px] transition-colors rounded-l-2xl z-10",
      active ? "bg-theme-primary" : "bg-border/20 group-hover:bg-theme-primary/30",
      className
    )} />
  );
}
