import { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';
import { indentUnit, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { useEditorStore } from '../store/useEditorStore';
import { tableExtension } from '../utils/tableExtension';
import { listExtension } from '../utils/listExtension';
import type { Extension } from '@codemirror/state';

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    height: 'auto',
    minHeight: '100%',
  },
  '.cm-content': {
    caretColor: '#ffffff',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#ffffff',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#264f78',
  },
  '.cm-gutters': {
    backgroundColor: '#252526',
    color: '#858585',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#2d2d2d',
  },
  '.cm-foldGutter': {
    width: '16px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '100%',
  },
});

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1e1e1e',
    height: 'auto',
    minHeight: '100%',
  },
  '.cm-content': {
    caretColor: '#000000',
    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#000000',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#add6ff',
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#6e7681',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e8e8e8',
  },
  '.cm-foldGutter': {
    width: '16px',
  },
  '.cm-foldGutter .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    height: '100%',
  },
});

// Custom markdown syntax highlighting - only color the markers, not the content
// Dark mode: lighter cyan/teal for good contrast on dark background
const darkSyntaxHighlight = HighlightStyle.define([
  { tag: tags.processingInstruction, color: '#4EC9B0' }, // Formatting markers like ** ~~ _
  { tag: tags.meta, color: '#4EC9B0' },
]);

// Light mode: darker teal/blue for good contrast on light background
const lightSyntaxHighlight = HighlightStyle.define([
  { tag: tags.processingInstruction, color: '#0070C0' }, // Formatting markers like ** ~~ _
  { tag: tags.meta, color: '#0070C0' },
]);

export function Editor() {
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateContent = useEditorStore((s) => s.updateTabContent);
  const theme = useEditorStore((s) => s.theme);
  const lineWrap = useEditorStore((s) => s.lineWrap);
  const zoom = useEditorStore((s) => s.zoom);
  const setEditorView = useEditorStore((s) => s.setEditorView);
  const setZoom = useEditorStore((s) => s.setZoom);

  const containerRef = useRef<HTMLDivElement>(null);

  // Cleanup editor view reference on unmount
  useEffect(() => {
    return () => setEditorView(null);
  }, [setEditorView]);

  // Apply zoom via font-size — avoids the clipping/scrollbar issues of CSS transform scale
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--editor-font-size', `${(zoom / 100) * 14}px`);
    }
  }, [zoom]);

  // Ctrl+wheel zoom — reads zoom directly from store so the handler never needs to re-register
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom(useEditorStore.getState().zoom + delta);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []); // stable — reads live state via getState()

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No file open
      </div>
    );
  }

  const extensions: Extension[] = [
    markdown(),
    syntaxHighlighting(theme === 'dark' ? darkSyntaxHighlight : lightSyntaxHighlight), // Custom syntax colors
    search(),
    keymap.of(searchKeymap),
    listExtension, // Smart Enter key for lists
    tableExtension, // Smart Enter key for tables
    theme === 'dark' ? darkTheme : lightTheme,
    indentUnit.of('    '), // 4 spaces for Tab key
  ];

  if (lineWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return (
    <div ref={containerRef} className="h-full w-full overflow-y-auto min-h-0 editor-zoom-container">
      <CodeMirror
        value={activeTab.content}
        height="auto"
        minHeight="100%"
        theme={theme}
        extensions={extensions}
        onChange={(value) => updateContent(activeTab.id, value)}
        onCreateEditor={(view) => setEditorView(view)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  );
}
