import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface ActionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  icon?: React.ReactNode;
  as?: 'a' | 'span';
  variant?: 'primary' | 'meta';
  children: React.ReactNode;
}

export function ActionLink({ 
  to, 
  icon, 
  children, 
  as: Component = 'a', 
  variant = 'primary',
  className, 
  ...props 
}: ActionLinkProps) {
  const variantClasses = {
    primary: "text-theme-accent hover:text-white font-semibold",
    meta: "text-xs uppercase tracking-widest text-theme-text-muted hover:text-theme-accent font-medium",
  };

  const commonClasses = cn(
    "inline-flex items-center transition-colors",
    variantClasses[variant],
    className
  );

  const content = (
    <>
      {children}
      {icon && <span className="ml-2 flex-shrink-0">{icon}</span>}
    </>
  );

  if (to) {
    if (to.startsWith('http') || to.startsWith('#')) {
      return (
        <a href={to} className={commonClasses} {...props}>
          {content}
        </a>
      );
    }
    return (
      <Link to={to} className={commonClasses} {...(props as any)}>
        {content}
      </Link>
    );
  }

  return (
    <Component className={commonClasses} {...(props as any)}>
      {content}
    </Component>
  );
}
