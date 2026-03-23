import { useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { openFileDialog, saveFileDialog, openAndReadFile, writeFile, getFileName } from '../utils/fileOperations';
import { formats } from '../utils/markdownFormatting';

export function useKeyboardShortcuts() {
  const addTab = useEditorStore((s) => s.addTab);
  const getActiveTab = useEditorStore((s) => s.getActiveTab);
  const updateTabPath = useEditorStore((s) => s.updateTabPath);
  const markTabClean = useEditorStore((s) => s.markTabClean);
  const togglePreview = useEditorStore((s) => s.togglePreview);
  const toggleLineWrap = useEditorStore((s) => s.toggleLineWrap);
  const editorView = useEditorStore((s) => s.editorView);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const resetZoom = useEditorStore((s) => s.resetZoom);

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
            const content = await openAndReadFile(path);
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

      // Alt+Z - Toggle line wrap
      if (e.altKey && e.key === 'z') {
        e.preventDefault();
        toggleLineWrap();
      }

      // Ctrl+B - Bold
      if (isMod && e.key === 'b') {
        e.preventDefault();
        formats.bold(editorView);
      }

      // Ctrl+I - Italic
      if (isMod && e.key === 'i') {
        e.preventDefault();
        formats.italic(editorView);
      }

      // Ctrl+K - Link
      if (isMod && e.key === 'k') {
        e.preventDefault();
        formats.link(editorView);
      }

      // Ctrl+` - Inline Code
      if (isMod && e.key === '`') {
        e.preventDefault();
        formats.inlineCode(editorView);
      }

      // Ctrl+Shift+/ - Comment
      if (isMod && e.shiftKey && e.key === '?') {
        e.preventDefault();
        formats.comment(editorView);
      }

      // Ctrl+1-3 - Headings
      if (isMod && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const headingFormats = [formats.heading1, formats.heading2, formats.heading3];
        headingFormats[parseInt(e.key) - 1](editorView);
      }

      // Ctrl+Shift+B - Bullet List
      if (isMod && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        formats.bulletList(editorView);
      }

      // Ctrl+Shift+N - Numbered List
      if (isMod && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        formats.numberedList(editorView);
      }

      // Ctrl+Plus/Equals - Zoom in
      if (isMod && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        zoomIn();
      }

      // Ctrl+Minus - Zoom out
      if (isMod && e.key === '-') {
        e.preventDefault();
        zoomOut();
      }

      // Ctrl+0 - Reset zoom
      if (isMod && e.key === '0') {
        e.preventDefault();
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addTab, getActiveTab, updateTabPath, markTabClean, togglePreview, toggleLineWrap, editorView, zoomIn, zoomOut, resetZoom]);
}
