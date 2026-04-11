import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { StatusBar } from './StatusBar';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { AboutDialog } from './AboutDialog';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function AppShell() {
  useKeyboardShortcuts();
  return (
    <div className="editor-shell">
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
