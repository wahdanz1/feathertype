import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tabId: string;
  isActive: boolean;
}

// Reads its own fields rather than taking the tab object, which is replaced on every keystroke.
export function Tab({ tabId, isActive }: TabProps) {
  const title = useEditorStore((s) => s.tabs.find((t) => t.id === tabId)?.title ?? '');
  const isDirty = useEditorStore((s) => s.tabs.find((t) => t.id === tabId)?.isDirty ?? false);
  const renameTab = useEditorStore((s) => s.renameTab);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(title);
    setIsEditing(true);
  };

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      renameTab(tabId, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div onClick={() => setActiveTab(tabId)} className={`tab group ${isActive ? 'tab-active' : 'tab-inactive'}`}>
      <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
        {isDirty && <span className="dirty-dot shrink-0" title="Unsaved changes" />}
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
            {title}
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
        className={`tab-close shrink-0 ${isActive ? 'opacity-100' : ''}`}
        title="Close"
      >
        <span className="text-lg" style={{ marginTop: '-2px' }}>×</span>
      </button>
    </div>
  );
}
