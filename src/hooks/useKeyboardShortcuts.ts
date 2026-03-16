import { useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { openFileDialog, saveFileDialog, readFile, writeFile, getFileName } from '../utils/fileOperations';

export function useKeyboardShortcuts() {
  const addTab = useEditorStore((s) => s.addTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateTabPath = useEditorStore((s) => s.updateTabPath);
  const markTabClean = useEditorStore((s) => s.markTabClean);
  const togglePreview = useEditorStore((s) => s.togglePreview);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      // Ctrl+N - New file
      if (isMod && e.key === 'n') {
        e.preventDefault();
        addTab();
      }

      // Ctrl+O - Open file
      if (isMod && e.key === 'o') {
        e.preventDefault();
        try {
          const path = await openFileDialog();
          if (path) {
            const content = await readFile(path);
            const title = getFileName(path);
            addTab({ filePath: path, content, title, isDirty: false });
          }
        } catch (error) {
          console.error('Failed to open file:', error);
          alert('Failed to open file: ' + error);
        }
      }

      // Ctrl+S - Save file
      if (isMod && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        const activeTab = getActiveTab();
        if (!activeTab) return;

        try {
          if (activeTab.filePath) {
            // Save to existing path
            await writeFile(activeTab.filePath, activeTab.content);
            markTabClean(activeTab.id);
          } else {
            // Save As for untitled files
            const path = await saveFileDialog();
            if (path) {
              await writeFile(path, activeTab.content);
              const title = getFileName(path);
              updateTabPath(activeTab.id, path, title);
              markTabClean(activeTab.id);
            }
          }
        } catch (error) {
          console.error('Failed to save file:', error);
          alert('Failed to save file: ' + error);
        }
      }

      // Ctrl+Shift+S - Save As
      if (isMod && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        const activeTab = getActiveTab();
        if (!activeTab) return;

        try {
          const path = await saveFileDialog(activeTab.filePath || undefined);
          if (path) {
            await writeFile(path, activeTab.content);
            const title = getFileName(path);
            updateTabPath(activeTab.id, path, title);
            markTabClean(activeTab.id);
          }
        } catch (error) {
          console.error('Failed to save file:', error);
          alert('Failed to save file: ' + error);
        }
      }

      // Ctrl+\ - Toggle preview
      if (isMod && e.key === '\\') {
        e.preventDefault();
        togglePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addTab, getActiveTab, updateTabPath, markTabClean, togglePreview]);
}
