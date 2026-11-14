import { useLayoutEffect } from 'react';
import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { StatusBar } from './StatusBar';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { AboutDialog } from './AboutDialog';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import { useEditorStore } from '../store/useEditorStore';
import { syncDocumentTheme } from '../lib/documentTheme';
import { EditorThemeContext } from '../lib/editorThemeContext';
import { isTauri } from '../utils/fileOperations';

export function AppShell() {
  const theme = useEditorStore((s) => s.theme);
  useKeyboardShortcuts();
  useUnsavedChangesGuard(isTauri());

  useLayoutEffect(() => {
    syncDocumentTheme(document, theme, true);
  }, [theme]);

  return (
    <EditorThemeContext.Provider value={theme}>
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
    </EditorThemeContext.Provider>
  );
}
