import { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Tab } from './Tab';
import { LuPlus } from 'react-icons/lu';

export function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const addTab = useEditorStore((s) => s.addTab);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAddTab = () => {
    addTab();
  };

  return (
    <div className="flex items-center group/tabbar editor-chrome text-muted h-9 border-b border-border px-3">
      <div
        ref={scrollRef}
        className="flex h-full overflow-x-auto overflow-y-hidden no-scrollbar flex-1 gap-1"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onSelect={() => setActiveTab(tab.id)}
            onClose={() => closeTab(tab.id)}
          />
        ))}
      </div>

      <button
        onClick={handleAddTab}
        className="flex items-center justify-center w-8 h-full transition-colors hover:bg-tab-active hover:text-white"
        title="New Tab (Ctrl+N)"
      >
        <LuPlus size={16} />
      </button>
    </div>
  );
}
