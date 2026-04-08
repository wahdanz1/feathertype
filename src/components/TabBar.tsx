import { useEditorStore } from '../store/useEditorStore';
import { Tab } from './Tab';
import { Plus } from 'lucide-react';

export function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const addTab = useEditorStore((s) => s.addTab);
  const theme = useEditorStore((s) => s.theme);

  const isDark = theme === 'dark';

  return (
    <div 
      className={`flex border-b overflow-x-auto overflow-y-hidden h-11 pt-2 items-end px-2 gap-1 ${
        isDark 
          ? 'bg-[#252526] border-[#3e3e42]' 
          : 'bg-[#f5f5f5] border-[#d0d0d0]'
      }`}
      onDoubleClick={(e) => {
        if (e.target === e.currentTarget) {
          addTab();
        }
      }}
    >
      {tabs.map((tab, index) => (
        <Tab
          key={tab.id}
          index={index}
          tab={tab}
          isActive={tab.id === activeTabId}
          onSelect={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
        />
      ))}
      
      <div className="flex items-center h-9 px-1 self-end mb-[1px]">
        <button
          onClick={() => addTab()}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors flex-shrink-0 ${
            isDark 
              ? 'text-gray-400 hover:bg-[#3e3e42] hover:text-gray-200' 
              : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'
          }`}
          title="New Tab"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
