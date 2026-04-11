import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { StatusBar } from './StatusBar';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { AboutDialog } from './AboutDialog';
import { useEditorStore } from '../store/useEditorStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function AppShell() {
  const theme = useEditorStore((s) => s.theme);
  useKeyboardShortcuts();
  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-editor-bg text-editor-text' : 'bg-editor-bg-light text-text-light'}`}>
      <Toolbar />
      <TabBar />
      <div className="flex-1 overflow-hidden min-h-0">
        <SplitPane />
      </div>
      <StatusBar />
      <UnsavedChangesDialog />
      <AboutDialog />
    </div>
  );
}
