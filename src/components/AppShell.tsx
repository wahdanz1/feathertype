import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { SplitPane } from './SplitPane';
import { UnsavedChangesDialog } from './UnsavedChangesDialog';
import { useEditorStore } from '../store/useEditorStore';

export function AppShell() {
  const theme = useEditorStore((s) => s.theme);
  const unsavedChangesDialog = useEditorStore((s) => s.unsavedChangesDialog);
  const getUnsavedTab = useEditorStore((s) => s.getUnsavedTab);
  const cancelCloseTab = useEditorStore((s) => s.cancelCloseTab);
  const confirmCloseTab = useEditorStore((s) => s.confirmCloseTab);
  const saveAndCloseTab = useEditorStore((s) => s.saveAndCloseTab);

  const unsavedTab = getUnsavedTab();

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-900'}`}>
      <Toolbar />
      <TabBar />
      <div className="flex-1 overflow-hidden">
        <SplitPane />
      </div>

      {unsavedChangesDialog.isOpen && unsavedTab && (
        <UnsavedChangesDialog
          tab={unsavedTab}
          onContinueEditing={cancelCloseTab}
          onDiscardChanges={confirmCloseTab}
          onSaveAndClose={saveAndCloseTab}
        />
      )}
    </div>
  );
}
