import { cn } from '../lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'gradient' | 'none';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: 'default' | 'subtle' | 'none';
  overflow?: 'visible' | 'hidden';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  hoverable?: boolean;
  interactive?: boolean;
  active?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  variant = 'default',
  padding = 'lg',
  border = 'default',
  overflow = 'visible',
  rounded = '2xl',
  hoverable = true, 
  interactive = false,
  active = false,
  ...props 
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-editor-bg shadow-2xl shadow-black/20",
    muted: "bg-white/[0.02] backdrop-blur-3xl",
    gradient: "bg-gradient-to-br from-theme-primary/10 to-transparent backdrop-blur-md shadow-2xl shadow-theme-primary/5",
    none: "bg-transparent",
  };

  const interactiveStyles = interactive ? cn(
    "hover:bg-white/[0.04] cursor-pointer",
    active && "bg-black/10 hover:bg-black/25"
  ) : "";

  const roundedStyles = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    '2xl': "rounded-2xl",
    '3xl': "rounded-3xl",
    full: "rounded-full",
  };

  const borderStyles = {
    default: variant === 'muted' ? "border-white/10" : "border-border/40",
    subtle: "border-white/5",
    none: "border-transparent",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10 md:p-12",
    '2xl': "px-8 py-16 md:px-16 md:py-24",
  };

  return (
    <div 
      className={cn(
        "border transition-all duration-300", 
        roundedStyles[rounded],
        variantStyles[variant],
        borderStyles[border],
        paddingStyles[padding],
        overflow === 'hidden' && "overflow-hidden",
        interactiveStyles,
        hoverable && "hover:border-theme-primary/50",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}
