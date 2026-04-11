import { Link } from 'react-router-dom';
import { LuFeather } from 'react-icons/lu';
import { cn } from '../../lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hideText?: boolean;
}

export function BrandLogo({ size = 'md', className, hideText = false }: BrandLogoProps) {
  const iconSizes = {
    sm: { box: 'h-7 w-7', icon: 18, text: 'text-md' },
    md: { box: 'h-8 w-8', icon: 20, text: 'text-lg' },
    lg: { box: 'h-10 w-10', icon: 24, text: 'text-xl' },
  };

  const current = iconSizes[size];

  return (
    <Link to="/" className={cn("flex items-center gap-2 transition-opacity hover:opacity-80 group shrink-0", className)}>
      <div className={cn(
        "flex items-center justify-center rounded-lg bg-theme-primary text-white transition-transform group-hover:scale-110",
        current.box
      )}>
        <LuFeather size={current.icon} />
      </div>
      {!hideText && (
        <span className={cn("font-bold tracking-tight text-white", current.text)}>
          FeatherType
        </span>
      )}
    </Link>
  );
}
