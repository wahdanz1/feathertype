import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/**
 * Checks if the current line is a table row (contains pipes)
 * Excludes the separator row (contains only |, -, spaces, and :)
 */
function isTableRow(lineText: string): boolean {
  const hasPipes = lineText.includes('|');
  const isSeparator = /^\s*\|[\s\-:|]+\|\s*$/.test(lineText);
  return hasPipes && !isSeparator;
}

/**
 * Counts the number of columns in a table row
 */
function getColumnCount(lineText: string): number {
  const trimmed = lineText.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return 0;

  // Split by | and filter out empty strings from leading/trailing pipes
  const cells = trimmed.split('|').filter((_, index, arr) => index !== 0 && index !== arr.length - 1);
  return cells.length;
}

/**
 * Generates an empty table row with the specified number of columns
 */
function generateEmptyRow(columnCount: number): string {
  const cells = Array(columnCount).fill('        '); // 8 spaces per cell
  return `|${cells.join('|')}|`;
}

/**
 * Smart Enter key handler for markdown tables
 */
function handleEnterInTable(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;

  // Only handle when cursor is at a single point (not a selection)
  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  // Check if we're in a table row
  if (!isTableRow(lineText)) return false;

  // Very lenient cursor position check - just check if there's only whitespace or pipes after cursor
  const cursorPosInLine = from - line.from;
  const textAfterCursor = lineText.substring(cursorPosInLine);
  const onlyWhitespaceOrPipesAfter = /^[\s|]*$/.test(textAfterCursor);

  if (!onlyWhitespaceOrPipesAfter) return false; // Let default Enter behavior handle mid-cell edits

  const columnCount = getColumnCount(lineText);
  if (columnCount === 0) return false;

  // Always insert new empty row (no auto-deletion logic)
  const newRow = '\n' + generateEmptyRow(columnCount);
  view.dispatch({
    changes: {
      from: line.to,
      to: line.to,
      insert: newRow
    },
    selection: {
      // Position cursor in first cell of new row (after "| ")
      anchor: line.to + 3, // +1 for newline, +1 for |, +1 for space
      head: line.to + 3
    }
  });

  return true;
}

/**
 * CodeMirror extension that adds smart Enter key behavior for tables
 * Uses highest priority to intercept Enter before markdown extension
 */
export const tableExtension = Prec.highest(keymap.of([
  {
    key: 'Enter',
    run: handleEnterInTable
  }
]));
