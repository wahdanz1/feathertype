import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

function isTableRow(lineText: string): boolean {
  const hasPipes = lineText.includes('|');
  const isSeparator = /^\s*\|[\s\-:|]+\|\s*$/.test(lineText);
  return hasPipes && !isSeparator;
}

function getColumnCount(lineText: string): number {
  const trimmed = lineText.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return 0;
  const cells = trimmed.split('|').filter((_, index, arr) => index !== 0 && index !== arr.length - 1);
  return cells.length;
}

function generateEmptyRow(columnCount: number): string {
  const cells = Array(columnCount).fill('        ');
  return `|${cells.join('|')}|`;
}

function handleEnterInTable(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;

  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  if (!isTableRow(lineText)) return false;

  // Only handle Enter at end of row (whitespace/pipes after cursor)
  const cursorPosInLine = from - line.from;
  const textAfterCursor = lineText.substring(cursorPosInLine);
  if (!/^[\s|]*$/.test(textAfterCursor)) return false;

  const columnCount = getColumnCount(lineText);
  if (columnCount === 0) return false;

  const newRow = '\n' + generateEmptyRow(columnCount);
  view.dispatch({
    changes: {
      from: line.to,
      to: line.to,
      insert: newRow
    },
    selection: {
      anchor: line.to + 3,
      head: line.to + 3
    }
  });

  return true;
}

export const tableExtension = Prec.highest(keymap.of([
  {
    key: 'Enter',
    run: handleEnterInTable
  }
]));
