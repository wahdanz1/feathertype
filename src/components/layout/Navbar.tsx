import { Link, useLocation } from 'react-router-dom';
import { Button } from '../Button';
import { Feather } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Navbar() {
  const location = useLocation();
  const isEditor = location.pathname === '/editor';

  const navItems = [
    { name: 'Download', path: '/download' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 border-b border-border/40 bg-editor-bg backdrop-blur-md transition-all h-12">
      <div className={cn(
        "h-12 grid grid-cols-3 items-center transition-all",
        isEditor ? "px-3" : "container mx-auto px-4"
      )}>
        {/* Left: Logo */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-theme-primary text-white">
              <Feather size={18} />
            </div>
            <span className="text-md font-bold tracking-tight text-white">FeatherType</span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="flex justify-center gap-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="relative group py-1 hidden md:block">
                <span className={cn(
                  "text-sm font-medium transition-colors group-hover:text-white",
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

        {/* Right: CTA Button or Spacer */}
        <div className="flex justify-end">
          {!isEditor ? (
            <Link to="/editor">
              <Button variant="primary" size="sm" className="shadow-lg shadow-theme-primary/30">
                Online Editor
              </Button>
            </Link>
          ) : (
            <div className="w-8" /> /* Spacer to match editor toolbar right-side icons if any */
          )}
        </div>
      </div>
    </nav>
  );
}
