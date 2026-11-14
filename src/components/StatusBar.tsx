import { useEffect, useState } from 'react';
import type { EditorState } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { useEditorStore } from '../store/useEditorStore';
import { Badge } from './ui/Badge';
import { subscribeEditorUpdates } from '../lib/editorUpdates';
import { countPlainTextCharacters, stripMarkdown } from '../utils/markdownStrip';

// The whole-document count waits for a typing pause; cursor stats update immediately.
const COUNT_DELAY_MS = 150;

interface Cursor {
  line: number;
  col: number;
  selected: number;
}

interface Stats {
  view: EditorView | null;
  cursor: Cursor;
  total: number;
}

function readCursor(state: EditorState): Cursor {
  const { head, from, to } = state.selection.main;
  const line = state.doc.lineAt(head);
  return {
    line: line.number,
    col: head - line.from + 1,
    selected: from === to ? 0 : stripMarkdown(state.sliceDoc(from, to)).length,
  };
}

const sameCursor = (a: Cursor, b: Cursor) => a.line === b.line && a.col === b.col && a.selected === b.selected;

function measure(view: EditorView | null): Stats {
  if (!view) return { view, cursor: { line: 1, col: 1, selected: 0 }, total: 0 };
  return { view, cursor: readCursor(view.state), total: countPlainTextCharacters(view.state.doc.toString()) };
}

export function StatusBar() {
  const editorView = useEditorStore((s) => s.editorView);
  const zoom = useEditorStore((s) => s.zoom);
  const notice = useEditorStore((s) => s.notices[0]);
  const dismissNotice = useEditorStore((s) => s.dismissNotice);

  const [stats, setStats] = useState(() => measure(editorView));
  if (stats.view !== editorView) setStats(measure(editorView));

  useEffect(() => {
    if (!editorView) return;
    let countTimer: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeEditorUpdates((update) => {
      if (update.view !== editorView) return;
      const cursor = readCursor(update.state);
      setStats((s) => (sameCursor(s.cursor, cursor) ? s : { ...s, cursor }));
      if (!update.docChanged) return;
      clearTimeout(countTimer);
      countTimer = setTimeout(() => {
        const total = countPlainTextCharacters(editorView.state.doc.toString());
        setStats((s) => (s.total === total ? s : { ...s, total }));
      }, COUNT_DELAY_MS);
    });

    return () => {
      unsubscribe();
      clearTimeout(countTimer);
    };
  }, [editorView]);

  const { line, col, selected } = stats.cursor;

  return (
    <div
      className="status-bar"
    >
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {col}</span>
        {selected > 0 && (
          <span>{selected} selected</span>
        )}
      </div>

      {notice && (
        <button type="button" onClick={dismissNotice} title="Dismiss">
          <Badge variant="warning" role="status" label={notice} className="normal-case tracking-normal" />
        </button>
      )}

      <div className="flex items-center gap-4">
        <span>{stats.total} characters</span>
        <span>{zoom}%</span>
      </div>
    </div>
  );
}
