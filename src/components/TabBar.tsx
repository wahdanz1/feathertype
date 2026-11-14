import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useEditorStore } from '../store/useEditorStore';
import { Tab } from './Tab';
import { LuPlus } from 'react-icons/lu';

export function TabBar() {
  const tabIds = useEditorStore(useShallow((s) => s.tabs.map((t) => t.id)));
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const addTab = useEditorStore((s) => s.addTab);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabCount = useRef(tabIds.length);

  // Closing a tab removes the focused element; land on the active tab rather than the page body.
  useEffect(() => {
    const closed = tabIds.length < tabCount.current;
    tabCount.current = tabIds.length;
    if (!closed || (document.activeElement && document.activeElement !== document.body)) return;
    scrollRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [tabIds]);

  const handleAddTab = () => {
    addTab();
  };

  return (
    <div className="flex items-center group/tabbar editor-chrome text-muted h-9 border-b border-border px-3">
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Open documents"
        className="flex h-full overflow-x-auto overflow-y-hidden no-scrollbar flex-1 gap-1"
      >
        {tabIds.map((id) => (
          <Tab key={id} tabId={id} isActive={id === activeTabId} />
        ))}
      </div>

      <button
        onClick={handleAddTab}
        className="flex items-center justify-center w-8 h-full transition-colors hover:bg-tab-active hover:text-white"
        title="New Tab (Ctrl+N)"
        aria-label="New tab"
      >
        <LuPlus size={16} aria-hidden />
      </button>
    </div>
  );
}
