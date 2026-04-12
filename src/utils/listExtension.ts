import { keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

function handleEnterInList(view: EditorView): boolean {
  const { state } = view;
  const { from, to } = state.selection.main;

  if (from !== to) return false;

  const line = state.doc.lineAt(from);
  const lineText = line.text;

  const bulletMatch = lineText.match(/^(\s*)-\s*$/);
  const numberedMatch = lineText.match(/^(\s*)\d+\.\s*$/);

  if (!bulletMatch && !numberedMatch) return false;

  const indent = bulletMatch ? bulletMatch[1] : (numberedMatch ? numberedMatch[1] : '');

  // Delete the empty list item line — prevents the "dash moving" bug
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

export const listExtension = Prec.highest(keymap.of([
  {
    key: 'Enter',
    run: handleEnterInList
  }
]));
