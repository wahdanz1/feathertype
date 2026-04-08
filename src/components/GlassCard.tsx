import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function GlassCard({ children, className, hoverable = true, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "rounded-2xl border border-border/40 bg-editor-bg p-8 transition-all duration-300", 
        hoverable && "hover:border-theme-primary/50",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
