import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../../lib/utils';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function NavItem({ to, children, className, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick} className={cn("relative group py-1 block", className)}>
      <span className={cn(
        "text-sm font-medium transition-colors group-hover:text-white",
        isActive ? "text-white" : "text-theme-text-muted"
      )}>
        {children}
      </span>
      <span className={cn(
        "absolute bottom-0 left-0 h-0.5 w-full bg-theme-primary transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100",
        isActive ? "scale-x-100" : "scale-x-0"
      )} />
    </Link>
  );
}
