import { useEditorStore } from '../store/useEditorStore';
import { Tab } from './Tab';

export function TabBar() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const theme = useEditorStore((s) => s.theme);

  return (
    <div className={`flex border-b overflow-x-auto ${theme === 'dark' ? 'bg-[#252526] border-[#3e3e42]' : 'bg-[#f5f5f5] border-[#d0d0d0]'}`}>
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
  );
}
