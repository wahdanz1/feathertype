import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'outline';
  label: string;
}

export function Badge({ label, variant = 'default', className, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-tint/5 text-theme-text-muted border-tint/10",
    success: "bg-success/10 text-success-text border-success/20",
    info: "bg-info/10 text-info-text border-info/20",
    warning: "bg-warning/10 text-warning-text border-warning/20",
    outline: "bg-transparent text-info-subtle/60 border-info-subtle/20",
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
