import { useState, useRef, useEffect, useId } from 'react';
import { LuTable } from 'react-icons/lu';
import { Button } from './Button';
import { usePopup } from '../hooks/usePopup';

interface TableGridSelectorProps {
  onInsert: (rows: number, cols: number) => void;
}

const GRID_SIZE = 8;
const START = { row: 0, col: 0 };

export function TableGridSelector({ onInsert }: TableGridSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverCell, setHoverCell] = useState(START);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  const close = () => {
    setIsOpen(false);
    setHoverCell(START);
  };
  usePopup(dropdownRef, isOpen, close, { initialFocus: ['[data-cell][tabindex="0"]'] });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoverCell(START);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const hasSize = hoverCell.row > 0 || hoverCell.col > 0;

  const handleCellClick = (row: number, col: number) => {
    if (row > 0 || col > 0) {
      onInsert(row + 1, col + 1);
      close();
    }
  };

  const moveTo = (row: number, col: number) => {
    const next = {
      row: Math.min(GRID_SIZE - 1, Math.max(0, row)),
      col: Math.min(GRID_SIZE - 1, Math.max(0, col)),
    };
    setHoverCell(next);
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${next.row * GRID_SIZE + next.col}"]`)?.focus();
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = hoverCell;
    const target = {
      ArrowRight: [row, col + 1],
      ArrowLeft: [row, col - 1],
      ArrowDown: [row + 1, col],
      ArrowUp: [row - 1, col],
      Home: [0, 0],
      End: [GRID_SIZE - 1, GRID_SIZE - 1],
    }[e.key];
    if (!target) return;
    e.preventDefault();
    moveTo(target[0], target[1]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="secondary"
        iconOnly
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        title="Insert Table"
        aria-label="Insert table"
        aria-expanded={isOpen}
        aria-controls={isOpen ? gridId : undefined}
      >
        <LuTable className="w-5 h-5" aria-hidden />
      </Button>

      {isOpen && (
        <div id={gridId} className="panel absolute top-full left-0 mt-1 p-2 z-50">
          <div
            ref={gridRef}
            role="group"
            aria-label="Table size: arrow keys to resize, Enter to insert"
            onKeyDown={handleGridKeyDown}
            className="grid gap-[2px] mb-2"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const row = Math.floor(index / GRID_SIZE);
              const col = index % GRID_SIZE;
              const isHighlighted = row <= hoverCell.row && col <= hoverCell.col;
              const isCorner = row === hoverCell.row && col === hoverCell.col;

              return (
                <button
                  key={index}
                  type="button"
                  data-cell={index}
                  tabIndex={isCorner ? 0 : -1}
                  aria-label={`${col + 1} × ${row + 1}`}
                  onMouseEnter={() => setHoverCell({ row, col })}
                  onClick={() => handleCellClick(row, col)}
                  className={isHighlighted ? 'table-cell table-cell-selected' : 'table-cell'}
                />
              );
            })}
          </div>

          <div role="status" className="text-center text-sm text-secondary">
            {hasSize ? `${hoverCell.col + 1} × ${hoverCell.row + 1} Table` : 'Select table size'}
          </div>
        </div>
      )}
    </div>
  );
}
