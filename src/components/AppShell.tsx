import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { useEditorStore } from '../store/useEditorStore';

export function AppShell() {
  const theme = useEditorStore((s) => s.theme);

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-900'}`}>
      <Toolbar />
      <TabBar />
      <div className="flex-1 overflow-hidden">
        <SplitPane />
      </div>
    </div>
  );
}
