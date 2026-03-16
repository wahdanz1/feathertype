import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Button } from './Button';

export function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const theme = useEditorStore((s) => s.theme);
  const toggleLineWrap = useEditorStore((s) => s.toggleLineWrap);
  const lineWrap = useEditorStore((s) => s.lineWrap);

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

  const handleToggleLineWrap = () => {
    toggleLineWrap();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        iconOnly
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </Button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 border rounded shadow-lg min-w-[160px] z-50 ${
          theme === 'dark'
            ? 'bg-[#252526] border-[#3e3e42]'
            : 'bg-white border-gray-300'
        }`}>
          <button
            onClick={handleToggleLineWrap}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex justify-between items-center ${
              theme === 'dark' ? 'hover:bg-[#2a2d2e]' : 'hover:bg-gray-100'
            }`}
          >
            <span>{lineWrap ? '✓ ' : ''}Word Wrap</span>
            <span className="text-xs text-gray-400">Alt+Z</span>
          </button>
        </div>
      )}
    </div>
  );
}
