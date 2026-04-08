import { Link, useLocation } from 'react-router-dom';
import { Button } from '../Button';
import { Feather } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Download', path: '/download' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className={cn(
      "sticky top-0 left-0 right-0 z-50 border-b border-border/40 bg-editor-bg backdrop-blur-md transition-all",
      isEditor && "h-12"
    )}>
      <div className={cn(
        "container mx-auto flex items-center justify-between px-4 transition-all",
        isEditor ? "h-12" : "h-16"
      )}>
        {!isEditor && (
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-primary text-white">
              <Feather size={20} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">FeatherType</span>
          </Link>
        )}

        <div className={cn(
          "flex items-center gap-8",
          isEditor ? "mx-auto" : "hidden md:flex"
        )}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            if (isEditor && item.path === '/editor') return null;
            return (
              <Link key={item.path} to={item.path} className="relative group py-1">
                <span className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-gray-400"
                )}>
                  {item.name}
                </span>
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 w-full bg-theme-primary transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100",
                  isActive ? "scale-x-100" : "scale-x-0"
                )} />
              </Link>
            );
          })}
        </div>

        {!isEditor && (
          <div className="flex items-center gap-2">
            <Link to="/editor">
              <Button variant="primary" className="h-9 px-6 font-medium shadow-lg shadow-theme-primary/30">
                Launch Editor
              </Button>
            </Link>
          </div>
        )}
        
        {isEditor && <div className="w-0" />} 
      </div>
    </nav>
  );
}
