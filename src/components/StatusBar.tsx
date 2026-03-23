import { useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { countPlainTextCharacters, stripMarkdown } from '../utils/markdownStrip';

export function StatusBar() {
  const editorView = useEditorStore((s) => s.editorView);
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const zoom = useEditorStore((s) => s.zoom);
  const theme = useEditorStore((s) => s.theme);

  const [line, setLine] = useState(1);
  const [col, setCol] = useState(1);
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    if (!editorView) return;

    const updateStats = () => {
      const state = editorView.state;
      const selection = state.selection.main;

      // Get line and column position
      const currentLine = state.doc.lineAt(selection.head);
      const lineNumber = currentLine.number;
      const colNumber = selection.head - currentLine.from + 1;

      setLine(lineNumber);
      setCol(colNumber);

      // Get selected text count (strip markdown syntax)
      const selectedText = state.sliceDoc(selection.from, selection.to);
      const strippedText = stripMarkdown(selectedText);
      setSelectedCount(strippedText.length);
    };

    // Update on mount
    updateStats();

    // Create an interval to periodically update stats
    // This ensures we catch all selection changes
    const interval = setInterval(updateStats, 100);

    return () => {
      clearInterval(interval);
    };
  }, [editorView]);

  const totalChars = activeTab ? countPlainTextCharacters(activeTab.content) : 0;

  return (
    <div
      className={`flex items-center justify-between px-4 py-1 text-xs border-t ${
        theme === 'dark'
          ? 'bg-[#1e1e1e] text-[#d4d4d4] border-[#3e3e42]'
          : 'bg-[#f5f5f5] text-[#1e1e1e] border-gray-300'
      }`}
    >
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {col}</span>
        {selectedCount > 0 && (
          <span>{selectedCount} selected</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>{totalChars} characters</span>
        <span>{zoom}%</span>
      </div>
    </div>
  );
}
