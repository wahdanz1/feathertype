import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import { isInCodeBlock } from './markdownSyntax';

function isSeparatorRow(lineText: string): boolean {
  return /^\s*\|[\s\-:|]+\|\s*$/.test(lineText);
}

function isTableRow(lineText: string): boolean {
  return lineText.includes('|') && !isSeparatorRow(lineText);
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

  if (!isTableRow(lineText) || isInCodeBlock(state, line.from)) return false;

  // Only handle Enter at end of row (whitespace/pipes after cursor)
  const cursorPosInLine = from - line.from;
  const textAfterCursor = lineText.substring(cursorPosInLine);
  if (!/^[\s|]*$/.test(textAfterCursor)) return false;

  const columnCount = getColumnCount(lineText);
  if (columnCount === 0) return false;

  // A row under the header must go below the separator, or the table stops parsing.
  const next = line.number < state.doc.lines ? state.doc.line(line.number + 1) : null;
  const after = next && isSeparatorRow(next.text) ? next : line;

  const newRow = '\n' + generateEmptyRow(columnCount);
  view.dispatch({
    changes: {
      from: after.to,
      to: after.to,
      insert: newRow
    },
    selection: {
      anchor: after.to + 3,
      head: after.to + 3
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
