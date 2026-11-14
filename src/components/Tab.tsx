import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';

interface TabProps {
  tabId: string;
  isActive: boolean;
}

function focusSibling(from: HTMLElement, key: string) {
  const list = from.closest('[role="tablist"]');
  if (!list) return false;
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
  const i = tabs.indexOf(from);
  const target = {
    ArrowRight: tabs[(i + 1) % tabs.length],
    ArrowLeft: tabs[(i - 1 + tabs.length) % tabs.length],
    Home: tabs[0],
    End: tabs[tabs.length - 1],
  }[key];
  if (!target) return false;
  target.focus();
  return true;
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
  const tabRef = useRef<HTMLDivElement>(null);
  const refocusTab = useRef(false);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    } else if (!isEditing && refocusTab.current) {
      refocusTab.current = false;
      tabRef.current?.focus();
    }
  }, [isEditing]);

  const startRename = () => {
    setEditValue(title);
    setIsEditing(true);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startRename();
  };

  const commitRename = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      renameTab(tabId, trimmed);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    e.stopPropagation();
    refocusTab.current = true;
    if (e.key === 'Enter') commitRename();
    else setIsEditing(false);
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (focusSibling(e.currentTarget, e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    } else if (e.key === 'F2') {
      e.preventDefault();
      startRename();
    } else if (e.key === 'Delete') {
      e.preventDefault();
      closeTab(tabId);
    }
  };

  return (
    <div role="presentation" onClick={() => setActiveTab(tabId)} className={`tab group ${isActive ? 'tab-active' : 'tab-inactive'}`}>
      <div
        ref={tabRef}
        role={isEditing ? undefined : 'tab'}
        aria-selected={isEditing ? undefined : isActive}
        tabIndex={isEditing ? undefined : isActive ? 0 : -1}
        onKeyDown={isEditing ? undefined : handleTabKeyDown}
        className="tab-label"
      >
        {isDirty && <span className="dirty-dot shrink-0" title="Unsaved changes" aria-hidden />}
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            aria-label="Tab name"
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="text-sm bg-transparent border-b border-theme-primary outline-none w-full min-w-0"
          />
        ) : (
          <span className="text-sm truncate select-none" onDoubleClick={handleDoubleClick}>
            {title}
            {isDirty && <span className="sr-only"> (unsaved changes)</span>}
          </span>
        )}
      </div>

      {/* A tablist may only own tabs, so this stays out of the accessibility tree; Delete closes the focused tab. */}
      <button
        onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
        className={`tab-close shrink-0 ${isActive ? 'opacity-100' : ''}`}
        title={`Close ${title}`}
        aria-hidden
        tabIndex={-1}
      >
        <span className="text-lg" style={{ marginTop: '-2px' }}>×</span>
      </button>
    </div>
  );
}
