import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hideText?: boolean;
}

export function BrandLogo({ size = 'md', className, hideText = false }: BrandLogoProps) {
  const sizes = {
    sm: { img: 'h-7 w-7', text: 'text-md' },
    md: { img: 'h-8 w-8', text: 'text-lg' },
    lg: { img: 'h-10 w-10', text: 'text-xl' },
  };

  const current = sizes[size];

  return (
    <Link to="/" className={cn("flex items-center gap-2 transition-opacity hover:opacity-80 group shrink-0", className)}>
      <img
        src="/feathertype-logo.svg"
        alt="FeatherType"
        className={cn("transition-transform group-hover:scale-110", current.img)}
      />
      {!hideText && (
        <span className={cn("font-bold tracking-tight text-white", current.text)}>
          FeatherType
        </span>
      )}
    </Link>
  );
}
