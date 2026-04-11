import { useState, useRef, useEffect } from 'react';
import { LuTable } from 'react-icons/lu';
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
    if (hoverCell.row > 0 || hoverCell.col > 0) {
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
        <LuTable className="w-5 h-5" />
      </Button>

      {/* Dropdown Grid */}
      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 p-2 rounded shadow-lg border z-50 ${
            theme === 'dark'
              ? 'bg-tab-active border-border'
              : 'bg-editor-bg-light border-border-light'
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
                      ? 'bg-theme-primary border-theme-primary/80'
                      : theme === 'dark'
                      ? 'bg-editor-bg border-border hover:bg-button-hover-dark'
                      : 'bg-button-inactive-light border-border-light hover:bg-button-hover-light'
                  }`}
                />
              );
            })}
          </div>

          {/* Label */}
          <div className={`text-center text-sm ${theme === 'dark' ? 'text-theme-text-secondary' : 'text-text-secondary-light'}`}>
            {hoverCell.row > 0 || hoverCell.col > 0
              ? `${hoverCell.col + 1} × ${hoverCell.row + 1} Table`
              : 'Select table size'}
          </div>
        </div>
      )}
    </div>
  );
}
