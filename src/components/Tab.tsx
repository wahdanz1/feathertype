import { useState, useRef, useEffect } from 'react';
import { Tab as TabType } from '../types';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tab: TabType;
  isActive: boolean;
  onSelect: () => void;
  onClose: () => void;
}

export function Tab({ tab, isActive, onSelect, onClose }: TabProps) {
  const renameTab = useEditorStore((s) => s.renameTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(tab.title);
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div onClick={onSelect} className={`tab group ${isActive ? 'tab-active' : 'tab-inactive'}`}>
      <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
        {tab.isDirty && <span className="dirty-dot shrink-0" title="Unsaved changes" />}
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm bg-transparent border-b border-theme-primary outline-none w-full min-w-0"
          />
        ) : (
          <span className="text-sm truncate select-none" onDoubleClick={handleDoubleClick}>
            {tab.title}
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className={`tab-close shrink-0 ${isActive ? 'opacity-100' : ''}`}
        title="Close"
      >
        <span className="text-lg" style={{ marginTop: '-2px' }}>×</span>
      </button>
    </div>
  );
}
