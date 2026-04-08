import { cn } from '../lib/utils';

interface SectionHeaderProps {
  title: string | React.ReactNode;
  description: string;
  className?: string;
  center?: boolean;
}

export function SectionHeader({ title, description, className, center = true }: SectionHeaderProps) {
  return (
    <div className={cn(
      "mb-16 space-y-4", 
      center ? "text-center" : "text-left",
      className
    )}>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{title}</h2>
      <p className={cn(
        "text-lg",
        center ? "mx-auto max-w-2xl" : "max-w-xl"
      )}>
        {description}
      </p>
    </div>
  );
}
