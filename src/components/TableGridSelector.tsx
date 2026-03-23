import { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { useEditorStore } from '../store/useEditorStore';

interface TableGridSelectorProps {
  onInsert: (rows: number, cols: number) => void;
}

export function TableGridSelector({ onInsert }: TableGridSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverCell, setHoverCell] = useState({ row: 0, col: 0 });
  const theme = useEditorStore((s) => s.theme);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const GRID_SIZE = 8; // 8x8 grid

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleCellHover = (row: number, col: number) => {
    setHoverCell({ row, col });
  };

  const handleCellClick = () => {
    if (hoverCell.row > 0 && hoverCell.col > 0) {
      onInsert(hoverCell.row + 1, hoverCell.col + 1); // +1 to include header row
      setIsOpen(false);
      setHoverCell({ row: 0, col: 0 });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Table Button */}
      <Button
        variant="secondary"
        iconOnly
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Table"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </Button>

      {/* Dropdown Grid */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 p-2 rounded shadow-lg border z-50 ${
            theme === 'dark'
              ? 'bg-[#2d2d2d] border-[#3e3e42]'
              : 'bg-white border-gray-300'
          }`}
        >
          {/* Grid */}
          <div className="grid gap-[2px] mb-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const row = Math.floor(index / GRID_SIZE);
              const col = index % GRID_SIZE;
              const isHighlighted = row <= hoverCell.row && col <= hoverCell.col;

              return (
                <div
                  key={index}
                  onMouseEnter={() => handleCellHover(row, col)}
                  onClick={handleCellClick}
                  className={`w-4 h-4 border cursor-pointer transition-colors ${
                    isHighlighted
                      ? theme === 'dark'
                        ? 'bg-blue-600 border-blue-500'
                        : 'bg-blue-400 border-blue-500'
                      : theme === 'dark'
                      ? 'bg-[#1e1e1e] border-[#3e3e42] hover:bg-[#3e3e42]'
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }`}
                />
              );
            })}
          </div>

          {/* Label */}
          <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {hoverCell.row > 0 || hoverCell.col > 0
              ? `${hoverCell.col + 1} × ${hoverCell.row + 1} Table`
              : 'Select table size'}
          </div>
        </div>
      )}
    </div>
  );
}
