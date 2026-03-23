import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { Button } from './Button';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const theme = useEditorStore((s) => s.theme);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        iconOnly
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        <Settings className="w-6 h-6" />
      </Button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 border rounded shadow-lg min-w-[160px] z-50 ${
          theme === 'dark'
            ? 'bg-[#252526] border-[#3e3e42]'
            : 'bg-white border-gray-300'
        }`}>
          <div className={`px-4 py-3 text-sm text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Settings coming soon...
          </div>
        </div>
      )}
    </div>
  );
}
