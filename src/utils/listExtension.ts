import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/**
 * Smart Enter key handler for markdown lists
 * Exits list when pressing Enter on an empty list item
 */
function handleEnterInList(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;

  // Only handle when cursor is at a single point (not a selection)
  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  // Check if line starts with bullet or numbered list marker
  const bulletMatch = lineText.match(/^(\s*)-\s*$/);
  const numberedMatch = lineText.match(/^(\s*)\d+\.\s*$/);

  if (!bulletMatch && !numberedMatch) return false;

  // Extract indentation
  const indent = bulletMatch ? bulletMatch[1] : (numberedMatch ? numberedMatch[1] : '');

  // Delete the current line entirely and move to next line
  // This prevents the "dash moving" bug
  const nextLineStart = line.to < state.doc.length ? line.to + 1 : line.to;

  view.dispatch({
    changes: {
      from: line.from,
      to: nextLineStart,
      insert: indent
    },
    selection: {
      anchor: line.from + indent.length,
      head: line.from + indent.length
    }
  });

  return true;
}

/**
 * CodeMirror extension that adds smart Enter key behavior for lists
 * Uses highest priority to intercept Enter before markdown extension
 */
export const listExtension = Prec.highest(keymap.of([
  {
    key: 'Enter',
    run: handleEnterInList
  }
]));
