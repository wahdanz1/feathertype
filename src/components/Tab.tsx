import { useState, useRef, useEffect } from 'react';
import { Tab as TabType } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  index: number;
  onSelect: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, index, onSelect, onClose }: TabProps) {
  const theme = useEditorStore((s) => s.theme);
  const renameTab = useEditorStore((s) => s.renameTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(tab.title);
    setIsEditing(true);
  };

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== tab.title) {
      renameTab(tab.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsEditing(false);
  };

  const styles = isDark ? {
    active: 'bg-editor-bg text-white border-x border-t border-border z-10 -mb-[1px] rounded-t-lg shadow-sm font-medium',
    inactive: 'bg-transparent text-theme-text-muted hover:bg-white/5 border-transparent font-medium',
    closeHover: 'hover:text-red-500',
  } : {
    active: 'bg-editor-bg-light text-text-light border-x border-t border-border-light z-10 -mb-[1px] rounded-t-lg shadow-sm font-medium',
    inactive: 'bg-transparent text-text-muted-light hover:bg-black/5 border-transparent font-medium',
    closeHover: 'hover:text-red-500',
  };

  const currentStyle = isActive ? styles.active : styles.inactive;

  return (
    <div
      onClick={onSelect}
      className={`
        px-3.5 h-full min-w-[120px] max-w-[200px] flex items-center justify-between gap-3 cursor-pointer
        relative transition-all duration-150 group mx-[2px]
        ${currentStyle}
        ${!isActive ? 'hover:rounded-t-lg' : ''}
      `}
    >
      {/* Visual Separator for inactive tabs, hidden for the first tab */}
      {!isActive && index > 0 && (
        <div className={`absolute -left-[2px] w-[1px] h-4 top-1/2 -translate-y-1/2 ${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
      )}

      <div className="flex items-center gap-2 overflow-hidden">
        {/* Fixed-width container for status dot to prevent horizontal jumping */}
        <div className="w-1.5 flex-shrink-0 flex items-center justify-start">
          {tab.isDirty && (
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" title="Unsaved changes" />
          )}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm bg-transparent border-b border-theme-primary outline-none w-full min-w-0 leading-none"
          />
        ) : (
          <span
            className="text-sm truncate select-none leading-none"
            onDoubleClick={handleDoubleClick}
          >
            {tab.title}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className={`flex items-center justify-center w-5 h-5 text-theme-text-muted ${styles.closeHover} transition-colors rounded hover:bg-white/10 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
        title="Close"
      >
        <span className="text-lg" style={{ marginTop: '-2px' }}>×</span>
      </button>
    </div>
  );
}
