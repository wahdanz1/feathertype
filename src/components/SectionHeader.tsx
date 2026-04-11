import { cn } from '../lib/utils';

interface SectionHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  center?: boolean;
  level?: 'h1' | 'h2';
}

export function SectionHeader({ 
  title, 
  description, 
  icon,
  className, 
  center = true,
  level = 'h2'
}: SectionHeaderProps) {
  const Tag = level;
  return (
    <div className={cn(
      "mb-16 space-y-4", 
      center ? "text-center" : "text-left",
      className
    )}>
      <div className={cn(
        "flex gap-4 items-center",
        center ? "justify-center" : "justify-start"
      )}>
        {icon && (
          <div className={cn(
            "text-theme-accent shrink-0 flex items-center justify-center",
            level === 'h1' ? "w-12 h-12 [&>svg]:w-12 [&>svg]:h-12" : "w-10 h-10 [&>svg]:w-10 [&>svg]:h-10"
          )}>
            {icon}
          </div>
        )}
        <Tag className="mb-0">{title}</Tag>
      </div>
      
      {description && (
        <p className={cn(
          "text-lg",
          center ? "mx-auto max-w-2xl" : "max-w-xl"
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
