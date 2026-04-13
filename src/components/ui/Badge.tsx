import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'outline';
  label: string;
}

export function Badge({ label, variant = 'default', className, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-white/5 text-theme-text-muted border-white/10",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    outline: "bg-transparent text-blue-200/60 border-blue-200/20",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
