import { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { EditorView } from '@codemirror/view';
import { search, searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';
import { foldGutter } from '@codemirror/language';
import { indentUnit, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import { useEditorStore } from '../store/useEditorStore';
import { tableExtension } from '../utils/tableExtension';
import { listExtension } from '../utils/listExtension';
import type { Extension } from '@codemirror/state';

const v = (token: string) => `var(--color-${token})`;

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: v('editor-bg'),
    color: v('editor-text'),
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
    backgroundColor: v('editor-selection'),
  },
  '.cm-gutters': {
    backgroundColor: v('editor-surface'),
    color: v('editor-gutter-text'),
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: v('tab-active'),
  },
  '.cm-foldGutter': {
    width: '16px',
  },
  '.cm-panels-top': {
    order: '1',
    borderTop: `1px solid ${v('border')}`,
    borderBottom: 'none',
  },
  '.cm-panels-bottom': {
    borderTop: `1px solid ${v('border')}`,
    borderBottom: 'none',
  },
  '.cm-panel.cm-search': {
    backgroundColor: v('editor-surface'),
    color: v('editor-text'),
    padding: '8px 12px',
    gap: '6px',
    fontSize: '13px',
  },
  '.cm-panel.cm-search input': {
    backgroundColor: v('editor-bg'),
    color: v('editor-text'),
    border: `1px solid ${v('border')}`,
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '13px',
    outline: 'none',
  },
  '.cm-panel.cm-search input:focus': {
    borderColor: v('theme-primary'),
  },
  '.cm-panel.cm-search button': {
    backgroundColor: v('tab-active'),
    color: v('editor-text'),
    border: `1px solid ${v('border')}`,
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  '.cm-panel.cm-search button:hover': {
    backgroundColor: v('button-hover-dark'),
  },
  '.cm-panel.cm-search label': {
    fontSize: '12px',
    color: v('editor-gutter-text'),
  },
  '.cm-panel.cm-search [name=close]': {
    color: v('editor-gutter-text'),
    cursor: 'pointer',
  },
  '.cm-panel.cm-search [name=close]:hover': {
    color: v('editor-text'),
  },
  '.cm-searchMatch': {
    backgroundColor: v('editor-search-match'),
  },
  '.cm-searchMatch-selected': {
    backgroundColor: v('editor-selection'),
  },
});

function makeFoldMarker(content: string) {
  const span = document.createElement('span');
  span.textContent = content;
  span.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;width:100%;height:100%;cursor:pointer;font-size:18px;';
  return span;
}

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: v('editor-bg-light'),
    color: v('editor-text-light'),
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
    backgroundColor: v('editor-selection-light'),
  },
  '.cm-gutters': {
    backgroundColor: v('editor-gutter-light'),
    color: v('editor-gutter-text-light'),
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: v('editor-surface-raised-light'),
  },
  '.cm-foldGutter': {
    width: '16px',
  },
  '.cm-panels-top': {
    order: '1',
    borderTop: `1px solid ${v('border-light')}`,
    borderBottom: 'none',
  },
  '.cm-panels-bottom': {
    borderTop: `1px solid ${v('border-light')}`,
    borderBottom: 'none',
  },
  '.cm-panel.cm-search': {
    backgroundColor: v('editor-surface-light'),
    color: v('text-light'),
    padding: '8px 12px',
    gap: '6px',
    fontSize: '13px',
  },
  '.cm-panel.cm-search input': {
    backgroundColor: v('editor-bg-light'),
    color: v('text-light'),
    border: `1px solid ${v('border-light')}`,
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '13px',
    outline: 'none',
  },
  '.cm-panel.cm-search input:focus': {
    borderColor: v('theme-primary'),
  },
  '.cm-panel.cm-search button': {
    backgroundColor: v('button-hover-light'),
    color: v('text-light'),
    border: `1px solid ${v('border-light')}`,
    borderRadius: '4px',
    padding: '4px 10px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  '.cm-panel.cm-search button:hover': {
    backgroundColor: v('border-light'),
  },
  '.cm-panel.cm-search label': {
    fontSize: '12px',
    color: v('editor-gutter-text-light'),
  },
  '.cm-panel.cm-search [name=close]': {
    color: v('editor-gutter-text-light'),
    cursor: 'pointer',
  },
  '.cm-panel.cm-search [name=close]:hover': {
    color: v('text-light'),
  },
  '.cm-searchMatch': {
    backgroundColor: v('editor-search-match-light'),
  },
  '.cm-searchMatch-selected': {
    backgroundColor: v('editor-selection-light'),
  },
});

const darkSyntaxHighlight = HighlightStyle.define([
  { tag: tags.processingInstruction, color: '#4EC9B0' },
  { tag: tags.meta, color: '#4EC9B0' },
]);

const lightSyntaxHighlight = HighlightStyle.define([
  { tag: tags.processingInstruction, color: '#0070C0' },
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

  useEffect(() => {
    return () => setEditorView(null);
  }, [setEditorView]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--editor-font-size', `${(zoom / 100) * 14}px`);
    }
  }, [zoom]);

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
  }, []);

  if (!activeTab) {
    return (
      <div className="empty-state">No file open</div>
    );
  }

  const extensions: Extension[] = [
    markdown(),
    syntaxHighlighting(theme === 'dark' ? darkSyntaxHighlight : lightSyntaxHighlight),
    search({ top: false }),
    keymap.of(searchKeymap),
    listExtension,
    tableExtension,
    theme === 'dark' ? darkTheme : lightTheme,
    indentUnit.of('    '), // 4 spaces for Tab key
    foldGutter({
      openText: '▸',
      closedText: '▾',
      markerDOM: (open) => makeFoldMarker(open ? '▾' : '▸'),
    }),
  ];

  if (lineWrap) {
    extensions.push(EditorView.lineWrapping);
  }

  return (
    <div ref={containerRef} className="editor-viewport editor-zoom-container">
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
          foldGutter: false,
          searchKeymap: false,
        }}
      />
    </div>
  );
}
