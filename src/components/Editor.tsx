import { useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { useEditorStore } from '../store/useEditorStore';
import type { Extension } from '@codemirror/state';

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    height: '100%',
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
    height: '100%',
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

export function Editor() {
  const activeTab = useEditorStore((s) => s.getActiveTab());
  const updateContent = useEditorStore((s) => s.updateTabContent);
  const theme = useEditorStore((s) => s.theme);
  const lineWrap = useEditorStore((s) => s.lineWrap);
  const zoom = useEditorStore((s) => s.zoom);
  const setEditorView = useEditorStore((s) => s.setEditorView);
  const setZoom = useEditorStore((s) => s.setZoom);

  // Cleanup editor view reference on unmount
  useEffect(() => {
    return () => setEditorView(null);
  }, [setEditorView]);

  // Mouse wheel zoom handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom(zoom + delta);
      }
    };

    const editorElement = document.querySelector('.cm-editor');
    if (editorElement) {
      editorElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => editorElement.removeEventListener('wheel', handleWheel);
    }
  }, [zoom, setZoom]);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No file open
      </div>
    );
  }

  const extensions: Extension[] = [
    markdown(),
    search(),
    keymap.of(searchKeymap),
    theme === 'dark' ? darkTheme : lightTheme,
    indentUnit.of('    '), // 4 spaces for Tab key
  ];

  if (lineWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return (
    <div className="h-full overflow-auto">
      <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}>
        <CodeMirror
          value={activeTab.content}
          height="100%"
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
    </div>
  );
}
